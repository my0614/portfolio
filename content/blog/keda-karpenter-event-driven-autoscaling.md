---
title: "KEDA와 Karpenter — 큐가 쌓이면 파드가 늘고, 파드가 밀리면 노드가 생긴다"
category: mlops
order: -35
excerpt: "HPA는 CPU·메모리 기준이라 0으로 못 줄이고 큐 길이 같은 이벤트에 직접 반응하지 못합니다. KEDA가 이벤트 소스(RabbitMQ 큐 등)를 보고 파드를 0↔N으로 조절하고, Karpenter가 그렇게 늘어난 파드에 맞춰 노드를 즉석에서 프로비저닝하는 구조를, RabbitMQ 기반 inference-worker를 예로 정리합니다."
---

[HPA](/blog/kubernetes-hpa)는 Deployment의 `replicas`를 메트릭에 따라 대신 조정해주는 컨트롤러다. 그런데 HPA만으로는 안 되는 지점이 있다.

- **기준 메트릭이 CPU·메모리다.** "RabbitMQ `jobs.upload` 큐에 메시지가 500건 쌓였다" 같은 이벤트에 직접 반응하지 못한다. Custom/External Metrics API를 직접 붙이면 되지만, 그 어댑터를 만들고 운영하는 게 일이다.
- **0으로 못 줄인다.** HPA의 `minReplicas`는 1 이상이다. 하루에 몇 번만 도는 배치성 워커도 항상 파드 1개는 떠 있어야 한다.
- **노드는 별개 문제다.** HPA가 파드를 늘려도 스케줄될 노드가 없으면 파드는 `Pending`으로 멈춘다. 그 자리를 만드는 건 Cluster Autoscaler(또는 Karpenter)의 몫이다.

이 프로젝트의 `inference-worker`가 딱 이런 워크로드다. `api-server`가 작업을 RabbitMQ `jobs.upload` 큐에 넣으면 `inference-worker`가 하나씩 꺼내 처리한다. 지금은 `replicas: 1` 고정이지만, **큐 길이에 따라 0에서 여러 개까지** 늘었다 줄었다 하는 게 맞다. KEDA와 Karpenter가 그 두 축을 각각 담당한다.

```
RabbitMQ jobs.upload 큐 길이  ──▶  KEDA  ──▶  inference-worker replicas (0 ↔ N)
                                              │
                                     Pending 파드 발생
                                              │
                                              ▼
                                          Karpenter  ──▶  EC2 노드 (필요한 만큼)
```

---

## 1. KEDA — 이벤트 소스를 보고 파드를 조절한다

KEDA(Kubernetes Event-Driven Autoscaling)는 **"스케일러(scaler)"** 라는 플러그인 모음이다. RabbitMQ, Kafka, SQS, Prometheus 쿼리, Cron, Redis Stream 등 70개 넘는 소스에 대해 "지금 처리 대기량이 얼마인가"를 조회하는 방법을 알고 있다.

클러스터에는 두 컴포넌트가 뜬다.

| 컴포넌트 | 역할 |
|---|---|
| `keda-operator` | `ScaledObject`를 감시. 0↔1 전환을 **직접** 수행하고, 1↔N 구간은 HPA를 대신 만들어 위임 |
| `keda-operator-metrics-apiserver` | External Metrics API 서버. KEDA가 만든 HPA가 "큐 길이"를 메트릭으로 읽을 수 있게 노출 |

### HPA와의 관계

KEDA는 HPA를 **대체하지 않는다.** `ScaledObject`를 만들면 KEDA가 그 뒤에 `HorizontalPodAutoscaler`를 자동 생성한다.

- **1 → N, N → 1**: KEDA가 만든 HPA가 External Metrics(큐 길이)를 기준으로 [평소 HPA 계산식](/blog/kubernetes-hpa)대로 조절한다.
- **0 → 1, 1 → 0**: HPA는 0을 다루지 못하므로 이 구간만 KEDA 오퍼레이터가 직접 스케일한다. 큐가 완전히 비면 `cooldownPeriod`(기본 300초) 뒤에 0으로 내린다.

즉 KEDA는 "HPA에 이벤트 소스를 물려주는 어댑터 + scale-to-zero 게이트"다.

### ScaledObject — inference-worker에 붙이면

먼저 RabbitMQ 접속 정보를 KEDA가 쓸 수 있게 `TriggerAuthentication`으로 연결한다. 이 프로젝트엔 이미 `rabbitmq-url`이라는 Secret(키 `RABBITMQ_URL`)이 있으니 그대로 참조한다.

```yaml
apiVersion: keda.sh/v1alpha1
kind: TriggerAuthentication
metadata:
  name: rabbitmq-auth
  namespace: app
spec:
  secretTargetRef:
    - parameter: host          # rabbitmq 스케일러가 기대하는 파라미터 이름
      name: rabbitmq-url       # 기존 Secret
      key: RABBITMQ_URL        # amqp://user:pass@host:5672/vhost
```

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: inference-worker
  namespace: app
spec:
  scaleTargetRef:
    name: inference-worker    # 조정할 Deployment
  minReplicaCount: 0          # 큐가 비면 0으로
  maxReplicaCount: 20
  pollingInterval: 15         # 15초마다 큐 길이 조회 (기본 30)
  cooldownPeriod: 120         # 마지막 활동 후 120초 지나면 0으로
  triggers:
    - type: rabbitmq
      metadata:
        protocol: amqp
        queueName: jobs.upload
        mode: QueueLength      # 큐에 쌓인 메시지 수 기준
        value: "10"           # 파드 1개당 10건 목표 → 100건이면 10개
      authenticationRef:
        name: rabbitmq-auth
```

`value: "10"`은 HPA의 목표 메트릭값과 같은 의미다. 큐에 100건이 있으면 `ceil(100 / 10) = 10`개까지 늘린다. `mode`를 `MessageRate`로 바꾸면 큐 길이가 아니라 초당 유입률 기준으로도 잡을 수 있다(이건 관리 API(HTTP) 프로토콜이 필요).

### ScaledObject vs ScaledJob

- **`ScaledObject`**: 장기 실행 컨슈머(Deployment)를 대상으로 한다. `inference-worker`처럼 파드가 계속 살아서 메시지를 연속 처리하는 경우.
- **`ScaledJob`**: 메시지 하나당 `Job`을 하나 띄우고 끝나면 파드가 사라지는 패턴. 처리 시간이 길고(수십 분) 중간에 파드가 죽으면 곤란한 작업에 맞다.

`inference-worker`는 `pika`로 큐를 붙잡고 연속 소비하므로 `ScaledObject`가 맞다.

```mermaid
flowchart LR
    Q["RabbitMQ<br/>jobs.upload"] -->|"큐 길이 폴링(15s)"| K["keda-operator"]
    K -->|"0↔1 직접"| D["inference-worker<br/>Deployment"]
    K -->|"HPA 생성/위임"| H["HPA"]
    H -->|"1↔N (external metric)"| D
    D --> P1["worker"]
    D --> P2["worker"]
    D --> P3["worker (Pending)"]
```

---

## 2. Karpenter — Pending 파드 모양에 맞춰 노드를 만든다

KEDA가 `inference-worker`를 10개로 늘리라고 결정했는데 클러스터에 자리가 없으면, 8개는 `Pending`으로 남는다. 여기서 노드를 공급하는 게 Karpenter다.

### Cluster Autoscaler와 뭐가 다른가

| | Cluster Autoscaler | **Karpenter** |
|---|---|---|
| 노드 단위 | 미리 정의된 **노드 그룹(ASG)** 을 늘리고 줄임 | 노드 그룹 없음. 필요할 때마다 개별 인스턴스를 직접 |
| 인스턴스 타입 | 노드 그룹에 고정된 타입 | Pending 파드들의 리소스 요청 합을 보고 **그때그때 가장 맞는 타입**을 고름 |
| 속도 | ASG API → 부팅. 분 단위 | EC2 Fleet API 직접 호출. 수십 초 |
| 축소 | 비어있는 노드 제거 | 비었거나 **저활용** 노드를 감지해 더 작은 노드로 교체(consolidation) |

Cluster Autoscaler는 "`c5.xlarge` 그룹을 3대에서 5대로"라면, Karpenter는 "이 Pending 파드들 합이 vCPU 6, 메모리 12Gi니까 spot `c6a.2xlarge` 한 대면 되겠다"에 가깝다.

### NodePool + EC2NodeClass

Karpenter 설정은 두 리소스다. `NodePool`이 "어떤 스펙 범위의 노드를 얼마나 허용할지", `EC2NodeClass`가 "그 노드가 뜰 AWS 환경(AMI·서브넷·보안그룹·IAM)"을 정한다.

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: inference
spec:
  template:
    metadata:
      labels:
        workload: inference
    spec:
      requirements:
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["spot", "on-demand"]     # spot 우선, 없으면 on-demand
        - key: karpenter.k8s.aws/instance-category
          operator: In
          values: ["c", "m", "r"]
        - key: karpenter.k8s.aws/instance-generation
          operator: Gt
          values: ["3"]
      nodeClassRef:
        group: karpenter.k8s.aws
        kind: EC2NodeClass
        name: default
      expireAfter: 720h                       # 노드 최대 수명 (강제 롤링)
  limits:
    cpu: "200"                                # 이 NodePool 전체 상한
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized
    consolidateAfter: 1m                      # 1분 저활용이면 정리/교체
```

```yaml
apiVersion: karpenter.k8s.aws/v1
kind: EC2NodeClass
metadata:
  name: default
spec:
  amiFamily: AL2023
  amiSelectorTerms:
    - alias: al2023@latest
  role: KarpenterNodeRole-efk-dev            # 노드에 붙일 IAM role
  subnetSelectorTerms:
    - tags:
        karpenter.sh/discovery: efk-dev      # 이 태그가 붙은 서브넷에 노드 배치
  securityGroupSelectorTerms:
    - tags:
        karpenter.sh/discovery: efk-dev
```

`subnetSelectorTerms`가 태그로 서브넷을 찾는 방식은 [AWS Load Balancer Controller가 `kubernetes.io/role/internal-elb` 태그로 서브넷을 찾는 것](/blog/aws-alb-nlb-l4-l7)과 같은 패턴이다. Terraform에서 서브넷에 `karpenter.sh/discovery = "efk-dev"` 태그만 추가하면 된다.

`inference-worker`가 이 NodePool만 쓰게 하려면 파드에 `nodeSelector: { workload: inference }`를 걸고 NodePool 템플릿의 라벨과 맞춘다. 그러면 관측 스택(ES·Prometheus)이 도는 기존 노드와 스케일링이 섞이지 않는다.

---

## 3. 둘을 함께 — 이벤트 하나가 노드까지 만드는 흐름

`api-server`가 `jobs.upload`에 100건을 한꺼번에 넣었다고 하자. `inference-worker`는 `replicas: 0`.

| 시각 | 일어나는 일 |
|---|---|
| `t+0s` | 큐에 100건. 컨슈머 0개 |
| `t+15s` | KEDA 폴링 → 큐 길이 100, `minReplicaCount:0`에서 활성화 임계 초과 → **KEDA가 0→1** |
| `t+20s` | KEDA가 만든 HPA가 external metric 100 확인 → 목표 `ceil(100/10)=10` → Deployment `replicas 1→10` |
| `t+22s` | 파드 9개 `Pending` (기존 노드에 자리 없음) |
| `t+25s` | Karpenter가 `Pending` 파드들의 CPU/메모리 요청 합산 → spot 인스턴스 1~2대를 EC2 Fleet로 요청 |
| `t+70s` | 새 노드 `Ready` → `Pending` 파드들 스케줄 → 10개 컨슈머가 큐 소비 시작 |
| `t+5m` | 큐 소진. HPA가 `replicas`를 줄임. `cooldownPeriod:120s` 뒤 KEDA가 **1→0** |
| `t+6m` | 노드가 비거나 저활용 → `consolidateAfter:1m` 뒤 Karpenter가 노드 종료 |

**KEDA는 위에서(파드), Karpenter는 아래에서(노드)** 같은 신호에 반응한다. KEDA가 없으면 큐가 쌓여도 아무 일도 안 일어나고, Karpenter가 없으면 파드가 `Pending`에서 멈춘다.

---

## 4. 실제로 붙일 때 걸리는 것들

- **콜드 스타트.** `minReplicaCount: 0`이면 첫 메시지가 들어오고 파드가 뜨고 노드까지 새로 만들어지면 1분 이상 걸린다. 지연에 민감하면 `minReplicaCount: 1`로 두거나, Karpenter로 미리 워밍용 노드를 띄우는 별도 트릭(`karpenter.sh/do-not-disrupt` 붙인 placeholder 파드)이 필요하다.
- **flapping.** KEDA `cooldownPeriod`와 Karpenter `consolidateAfter`가 너무 짧으면 파드·노드가 생겼다 사라졌다를 반복한다. 큐 유입이 들쭉날쭉할수록 두 값을 넉넉히.
- **spot 중단.** `inference-worker`가 처리 중이던 메시지는 `basic_ack` 전이라 큐로 돌아온다(at-least-once). 멱등하지 않은 처리라면 중복 실행에 대비해야 한다. 이 프로젝트는 `x-retry-count` 헤더로 재시도를 세고 3회 초과 시 DLQ로 보낸다.
- **PodDisruptionBudget.** Karpenter가 consolidation으로 노드를 비울 때 파드를 evict하는데, PDB가 없으면 처리 중이던 컨슈머가 한꺼번에 죽을 수 있다. `minAvailable`을 걸어둔다.
- **큐 메트릭의 의미.** `QueueLength`는 "ready + unacked" 합이다. 컨슈머가 prefetch로 잔뜩 잡아두면 큐는 비어 보여도 실제로는 밀려 있을 수 있다. prefetch 수를 낮추거나 `MessageRate` 모드를 고려.

---

## 5. 정리

| 축 | 도구 | 기준 | 범위 |
|---|---|---|---|
| 파드 개수 (CPU/메모리) | HPA | metrics-server | 1 ~ N |
| 파드 개수 (이벤트) | **KEDA** | 큐 길이·Kafka lag·Prometheus 쿼리 등 | **0 ~ N** |
| 노드 개수 (노드 그룹) | Cluster Autoscaler | Pending 파드 + ASG | 그룹 min ~ max |
| 노드 개수 (그룹리스) | **Karpenter** | Pending 파드의 실제 리소스 모양 | NodePool `limits`까지 |

- KEDA는 HPA를 대체하는 게 아니라, HPA 뒤에 이벤트 소스를 물려주고 scale-to-zero 구간만 직접 처리한다.
- Karpenter는 노드 그룹을 없애고, Pending 파드에 맞는 인스턴스를 즉석에서 골라 띄운 뒤 저활용되면 더 작은 노드로 합친다.
- 큐 기반 워커(`inference-worker` + `jobs.upload`)는 이 조합이 가장 잘 맞는 형태다 — 평소 0, 유입되면 파드와 노드가 같이 늘고, 끝나면 같이 사라진다.
