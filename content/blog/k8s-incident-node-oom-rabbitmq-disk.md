---
title: "K8s에서 자주 만나는 장애 4가지: 노드 다운, OOMKilled, RabbitMQ, 디스크풀"
category: mlops
order: -19
excerpt: "노드가 죽고, 파드가 OOMKilled로 재시작되고, RabbitMQ가 막히고, 디스크가 꽉 차는 상황은 원인과 증상이 서로 다르다. 각 장애가 왜 발생하고 어떻게 감지·진단·대응하는지를 정리하고, 실제 클러스터에 장애를 주입해 실측한 카오스 엔지니어링 실험 결과로 검증한다."
---

## 왜 이 네 가지인가

Kubernetes 운영 중 마주치는 장애는 종류가 다양하지만, 크게 보면 **노드 레벨**(노드 다운), **파드 레벨**(OOMKilled), **애플리케이션 레벨**(RabbitMQ 같은 미들웨어 장애), **인프라 리소스 레벨**(디스크풀)로 계층이 나뉜다. 계층마다 증상이 드러나는 곳과 진단 방법이 다르기 때문에, 하나의 체크리스트로 뭉쳐서 접근하면 오히려 원인을 놓치기 쉽다. 이 글에서는 네 가지를 각각 증상 → 원인 → 진단 → 대응 → 재발 방지 순서로 정리한다.

"노드가 죽어도 파드가 알아서 다른 곳에 뜬다"는 설명은 맞지만, 정확히 **얼마나 걸리는지**, **정말 모든 컴포넌트가 그렇게 동작하는지**는 실제로 장애를 내보기 전까지는 알 수 없다. 그래서 노드 다운·디스크풀·RabbitMQ 장애 세 가지는 자체 구축한 클러스터에 실제로 장애를 주입해서 실측했고, 각 섹션에 그 결과를 같이 넣었다.

**실측 환경**

- 컨트롤플레인 1대 + 워커 2대 (AWS EC2, kubeadm으로 수동 부트스트랩, Spot 인스턴스)
- CNI: Cilium, 스토리지: Longhorn(분산 블록 스토리지)
- 모니터링: kube-prometheus-stack(Prometheus + Alertmanager + Grafana) + Loki
- 애플리케이션: FastAPI(api-server) → RabbitMQ → Worker 파이프라인, CloudNativePG(Postgres 3-instance)

카오스 엔지니어링의 목적은 장애를 일으키는 것 자체가 아니라, **"설계상 이래야 한다"는 가정과 "실제로 이렇다"는 현실 사이의 간극을 찾는 것**이다. 실험은 매번 **주입 → 관측 → 기록** 순서로 진행했고, 정확한 대응 시간을 재기 위해 주입 시각을 먼저 남겼다.

## 1. 노드 다운 (NodeNotReady)

### 증상

노드의 kubelet이 일정 시간(기본 `node-monitor-grace-period`, 보통 40초) 동안 컨트롤 플레인에 heartbeat를 보내지 못하면 해당 노드는 `NotReady`가 된다. 그 상태가 `pod-eviction-timeout`(기본 5분)을 넘기면, 그 노드에 떠 있던 파드들이 강제로 evict되고 다른 노드로 재스케줄링된다.

### 원인

- kubelet 프로세스 자체가 죽거나 응답 불가 상태가 됨(OOM, 커널 패닉 등)
- 네트워크 파티션으로 노드가 컨트롤 플레인과 통신 불가
- 클라우드 인프라 레벨 장애(하드웨어 장애, 유지보수, 스팟 인스턴스 회수)
- 노드 자체의 디스크풀·메모리 부족으로 kubelet이 정상 동작 못 함(아래 3, 4번과 원인이 겹칠 수 있다)

### 진단

```bash
kubectl get nodes
kubectl describe node <node-name>
```

`describe`의 `Conditions` 항목에서 `Ready`뿐 아니라 `MemoryPressure`, `DiskPressure`, `PIDPressure`도 같이 확인해야 한다. 이 값들이 먼저 `True`가 되고 나서 `Ready`가 `False`로 넘어가는 경우가 많아서, 노드 다운의 실제 원인이 3번(디스크풀) 같은 다른 장애인 경우도 흔하다. 클라우드 환경이라면 인스턴스 콘솔·시스템 로그도 같이 봐야 kubelet 문제인지 하부 인프라 문제인지 구분된다.

### 대응

노드가 완전히 죽은 상태(kubelet 응답 불가)라면, 사람이 손대기 전에 컨트롤 플레인이 자동으로 파드를 다른 노드에 재스케줄하는지부터 확인하는 게 우선이다. 이때 남은 노드에 여유 리소스가 있는지가 관건이다 — 실제로 재스케줄이 얼마나 걸리는지, 워크로드 종류에 따라 다르게 동작하는지는 아래 실측에서 직접 확인했다.

### 재발 방지

- **PodDisruptionBudget**과 **다중 replica + anti-affinity**로, 노드 하나가 죽어도 서비스가 완전히 끊기지 않게 분산해둔다.
- 클라우드 노드 풀의 **자동 복구(auto-repair)**를 켜서 사람이 개입하기 전에 노드가 교체되도록 한다.
- Alertmanager에 `kube_node_status_condition{condition="Ready", status="true"} == 0` 같은 규칙을 걸어 노드 상태 변화를 사람이 대시보드를 보기 전에 먼저 안다.

### 실제로 겪은 사례: 감시탑이 감시 대상과 함께 무너지다

워커 노드 하나에서 `sudo systemctl stop kubelet`을 실행해 그 노드를 API 상에서 죽은 것처럼 만들었다. EC2 인스턴스 자체를 stop/reboot하지 않은 이유는 Spot 인스턴스라 재시작할 때마다 퍼블릭 IP가 바뀌기 때문이다 — kubelet 정지/재개는 즉시 되돌릴 수 있고 IP도 안 바뀌는 안전한 방법이다.

대상 노드 선정도 그냥 정하지 않았다. 원래 후보였던 노드에는 Prometheus 본체 + ingress-nginx + ArgoCD + Postgres **primary**가 몰려 있어서, 그 노드를 죽이면 "장애를 측정하는 도구 자체"와 "외부 접속 경로"까지 한꺼번에 죽어 실험의 의미가 흐려진다. 그래서 Alertmanager, RabbitMQ, api-server, Postgres **standby**가 있는 반대쪽 노드를 선택해, DB 페일오버 없이 순수하게 "노드 하나가 죽으면 무슨 일이 일어나는가"만 관측할 수 있게 설계했다.

**1차 실험 타임라인**

| 경과 | 이벤트 |
|---|---|
| T0 | 장애 주입 (`systemctl stop kubelet`) |
| +34s | `kubectl get nodes` 상 `Ready → NotReady` 전환 |
| +19s ~ +5m37s | Prometheus firing 알림 **12개로 변동 없음**(전부 기존 알림, 신규 발생 없음) |
| +5m53s | 해당 노드의 파드 20개가 일제히 `Terminating` — 기본 `pod-eviction-timeout: 5m`과 정확히 일치 |
| 복구 시작 | `systemctl start kubelet` |
| +13s | 노드 `Ready` 복귀 |
| +4분 이내 | 전체 파드/Longhorn 볼륨 정상화, CNPG `healthy state` 3/3 확인 |

노드가 죽었다는 사실은 34초 만에 API 레벨에서 감지됐지만, **8분을 관측하는 동안 "노드 다운"을 알려야 할 알림이 단 한 건도 새로 발생하지 않았다.** 원인은 두 가지가 겹쳐 있었다.

1. 기본 알림 규칙(`KubeNodeNotReady`)이 `for: 15m`으로 설계돼 있어서, 8분 관측으로는 애초에 잡을 수 없는 타이머였다.
2. **더 근본적인 문제**: 이 규칙이 참조하는 지표(`kube_node_status_condition{job="kube-state-metrics"}`)를 공급하는 `kube-state-metrics` 파드가 하필 죽인 그 노드 위에 떠 있었다. 노드가 죽자 그 지표 자체가 끊겼다 — 감시탑이 감시 대상과 같은 건물에 있다가 함께 무너진 셈이다. Alertmanager 파드도 같은 노드에 있어서, 설령 알림이 발생했더라도 전달 경로 자체가 막혀 있었을 것이다.

또 하나 흥미로운 대조는 워크로드 종류에 따른 회복력 차이였다. **Deployment 기반(무상태) 파드**인 api-server는 evict된 직후 살아있는 노드에 새 파드가 자동으로 뜬 반면, **StatefulSet + Longhorn 단일 레플리카 조합**인 RabbitMQ·Jenkins·Postgres standby는 노드가 복구될 때까지 그냥 멈춰 있었다. 볼륨이 특정 노드에 묶여 있으면 재스케줄 자체가 불가능하다는 걸 실측으로 확인한 셈이다.

**수정 후 재검증**

발견한 문제를 그대로 두지 않고 바로 고쳤다.

1. `kube-state-metrics`, `Alertmanager`, `Prometheus`를 전부 `nodeSelector`로 장애 대상이 아닌 노드에 고정 배치했다.
2. 기존 `KubeNodeNotReady`(15분) 규칙은 그대로 두고, 같은 조건에 `for: 5m`만 다르게 설정한 테스트용 규칙(`NodeNotReadyFast`)을 병행 추가해 15분씩 기다리지 않고도 검증할 수 있게 했다.

같은 노드를 다시 죽인 결과:

| 경과 | 이벤트 |
|---|---|
| T0 | 장애 주입 |
| +40s | 노드 `NotReady` 전환 |
| +1m11s | 알림 규칙 `inactive → pending`(5분 타이머 시작) |
| **+6m22s** | 규칙 `pending → firing`, Alertmanager 도달(`for: 5m` 설계값과 거의 정확히 일치) |
| 복구 시작 | `systemctl start kubelet` |
| +51s | 알림 `firing → inactive` 자동 해제 |

감시 도구를 장애 대상과 물리적으로 분리하니, 알림이 설계된 시간표대로 정확하게 동작했다. **"고쳤다고 믿는 것"과 "실제로 고쳐졌는지 재현해서 확인하는 것"은 다르다** — 같은 시나리오를 수정 전/후로 대조 실험한 게 이 재검증의 핵심이었다.

**교훈**: 모니터링 스택도 "그냥 설치하면 끝"이 아니라 가용성 설계의 대상이다. 감시 도구가 감시 대상과 물리적으로 같은 실패 도메인에 있으면, 정작 필요한 순간에 눈을 감는다.

## 2. OOMKilled

### 증상

파드가 갑자기 재시작되고, `kubectl describe pod`의 `Last State`에 `Terminated`, `Reason: OOMKilled`가 찍힌다. 컨테이너의 메모리 사용량이 설정된 `limits.memory`를 넘으면 커널의 cgroup OOM killer가 해당 프로세스를 강제 종료시키는 것이다.

### 원인

- 애플리케이션의 메모리 누수(요청마다 조금씩 늘어나다 결국 limit을 넘음)
- 배치·학습 작업에서 한 번에 큰 데이터를 메모리에 올림
- limit을 실제 사용량보다 너무 낮게 잡아서, 평소 트래픽에서도 여유가 없음
- 갑작스러운 트래픽 증가로 순간 메모리 사용량이 튐

### 진단

```bash
kubectl describe pod <pod-name>
kubectl top pod <pod-name>
```

Grafana에서 해당 파드의 `container_memory_working_set_bytes`를 `container_spec_memory_limit_bytes`와 같이 그려서, 재시작 직전 메모리가 limit에 서서히 붙어서 올라갔는지(누수/데이터량 증가) 아니면 순간적으로 튀었는지(스파이크)를 구분한다. Loki에서 재시작 직전 몇 분간 로그를 확인해서 그 시점에 어떤 요청·작업을 처리하고 있었는지도 같이 본다.

### 대응

- 급한 경우: limit을 늘리거나 replica를 늘려 파드 하나가 감당하는 부담을 줄인다. 다만 이건 증상 완화일 뿐 원인 제거는 아니다.
- 근본 대응: 메모리 누수라면 코드 수정, 배치 작업이라면 한 번에 처리하는 데이터량을 줄이거나 스트리밍 방식으로 바꾼다.

### 재발 방지

- **VPA(Vertical Pod Autoscaler)** 로 실제 사용량 기반의 request/limit 추천값을 받아서 근거 있는 값으로 조정한다.
- request와 limit의 격차를 너무 크게 두지 않는다. 격차가 크면 노드 하나에 여러 파드가 몰려 스케줄링될 때 실제 여유 메모리가 예상보다 적어질 수 있다.
- 메모리 사용량이 limit의 90%를 넘는 시점에 미리 알림이 오도록 규칙을 걸어서, OOMKilled로 죽기 전에 대응할 시간을 번다.

> 이 항목은 아직 실측 전이다. 다음 카오스 실험 후보로 잡아뒀고, 아래 디스크풀 실험에서 썼던 원칙 — *"장애의 크기를 억지로 키우지 말고, 임계치를 조정해서 같은 현상을 안전하게 재현한다"* — 를 그대로 적용할 계획이다.

## 3. RabbitMQ 장애

### 증상

Producer가 메시지를 publish했는데 confirm이 오지 않거나 아예 커넥션이 막히고, Consumer 쪽에서는 처리해야 할 큐(backlog)가 계속 쌓인다. 심한 경우 RabbitMQ 노드 자체가 응답하지 않는다.

### 원인

RabbitMQ 장애는 보통 셋 중 하나다.

- **디스크 알람** — 사용 가능한 디스크가 `disk_free_limit` 아래로 내려가면 RabbitMQ가 자체적으로 **publish를 막는 flow control**을 건다. 메시지를 더 받아서 디스크를 채우다가 죽는 것보다, 아예 못 받게 막는 게 안전하다고 판단하는 것이다.
- **메모리 알람** — 메모리 사용량이 `vm_memory_high_watermark`를 넘으면 마찬가지로 publish가 막힌다. 큐에 메시지가 쌓여서 메모리를 많이 물고 있을 때 자주 발생한다.
- **Consumer 처리 속도 저하** — Consumer가 느려지거나 죽으면 큐 길이가 계속 늘어난다. 당장 RabbitMQ 자체는 안 죽지만, 실질적으로는 장애 상황(처리 지연)이다.
- **클러스터 네트워크 파티션** — 멀티 노드 클러스터에서 노드 간 통신이 끊기면 split-brain이 발생할 수 있다.

### 진단

```bash
rabbitmqctl status
rabbitmqctl list_queues name messages consumers
rabbitmqctl cluster_status
```

Management UI(또는 위 명령)에서 disk alarm·memory alarm이 걸려 있는지부터 확인한다. 알람이 없다면 `list_queues`로 어떤 큐의 `messages`(적체량)가 비정상적으로 늘고 있는지, `consumers` 수가 0이 되지는 않았는지를 본다. 클러스터 구성이라면 `cluster_status`로 파티션 여부를 확인한다.

### 대응

원인별로 대응이 갈리지만, 브로커 자체가 죽었다 살아나는 상황에서 가장 먼저 확인해야 할 건 "떠 있던 메시지가 유실 없이 남아있는가"다. 파드가 재생성되는 것 자체는 StatefulSet 컨트롤러가 알아서 해주는 쿠버네티스 내장 동작이고, 그 위에서 메시지가 실제로 살아남는지는 큐·메시지를 durable/persistent로 미리 설정해뒀는지에 달려 있다 — 이 부분은 아래 실측에서 직접 확인했다.

### 재발 방지

- `disk_free_limit`, `vm_memory_high_watermark`를 실제 노드 리소스보다 여유 있게 설정하고, 알람이 걸리기 전 단계에서 미리 알림이 오도록 임계치 기반 규칙을 건다.
- 큐 길이가 일정 임계값을 몇 분 이상 초과하면 알리는 규칙(예: `messages > N for 5m`)을 둬서, Consumer 처리 지연을 큐가 완전히 막히기 전에 감지한다.
- Consumer를 트래픽/큐 길이에 따라 오토스케일링하도록 구성한다.

### 실제로 겪은 사례: 메시지는 정말 살아남는가

앞선 두 실험이 "인프라(노드, 디스크)가 죽으면 어떻게 되는가"를 봤다면, 이건 애플리케이션 레벨의 데이터 내구성 검증이다. `kubectl delete pod rabbitmq-0 --grace-period=0 --force`로 RabbitMQ 브로커 프로세스를 유예 없이 강제 종료했을 때, 재시도 파이프라인(`x-retry-count` 헤더 기반 재시도, DLQ)이 전제하고 있는 "메시지는 디스크에 안전하게 남아있다"는 가정이 실제로 맞는지 확인했다.

사전에 코드를 점검해 큐가 `durable=True`, 발행 메시지가 `delivery_mode=2`(persistent)로 설정된 것을 확인했다 — 이론적으로는 브로커가 죽어도 Longhorn PVC에 남아있어야 한다.

그냥 바로 브로커를 죽이면 컨슈머가 이미 메시지를 처리해버려서 큐가 비어있을 가능성이 높아 검증이 안 된다. 그래서 순서를 다음처럼 짰다.

1. `inference-worker`(컨슈머)를 `replicas=0`으로 내려 메시지가 쌓이도록 만든다.
2. api-server를 통해 실제 Job을 하나 생성해 큐에 메시지 1건이 `ready` 상태로 남아있는 것을 `rabbitmqctl list_queues`로 확인한다.
3. 그 상태에서 브로커를 강제 종료한다.

| 시각/경과 | 이벤트 |
|---|---|
| — | 컨슈머 정지, Job 생성 → 큐에 `messages_ready: 1` 확인 |
| T0 | `kubectl delete pod rabbitmq-0 --grace-period=0 --force` |
| +56s | 파드 재생성됐으나 아직 컨테이너 기동 중 |
| +79s | `rabbitmq-0` `1/1 Running` — 브로커 재기동 완료 |
| 재기동 직후 | 큐 재조회 → **`messages_ready: 1` 그대로 유지, 메시지 유실 없음** |
| — | 컨슈머 다시 기동(`replicas=1`) |
| +8s | Job 상태 `PENDING → DONE`, 큐는 `jobs.upload: 0`, `jobs.dlq: 0` — 재시도 없이 1회 만에 정상 처리 |

**메시지가 100% 보존됐다.** durable 큐와 persistent 메시지 설정이 문서상의 이론이 아니라 실제로 브로커의 강제 종료를 견뎌낸다는 걸 확인했다. 브로커 재기동에 걸린 시간은 약 79초였고, 별다른 개입 없이 자동으로 다시 소비 가능한 상태로 돌아왔다.

다만 이 실험은 큐에 `ready`(아직 컨슈머가 받지 않은) 상태로 남아있던 메시지의 내구성만 검증했다는 한계가 있다. 컨슈머가 메시지를 수신했지만 아직 ack하지 않은(`unacknowledged`) 상태에서 브로커가 죽는 케이스는 타이밍을 정밀하게 맞춰야 재현할 수 있어 범위에 포함하지 않았다. RabbitMQ의 기본 동작상 unacked 메시지는 컨슈머 채널 연결이 끊기면 자동으로 다시 `ready`로 돌아가므로, 유실 가능성 자체는 낮다고 판단한다.

**교훈**: "메시지 큐를 쓰면 안전하다"가 아니라, **큐와 메시지를 durable/persistent로 명시적으로 설정해야만** 안전하다. 이 설정 하나 빠뜨리면 브로커 재시작 한 번에 처리 중이던 작업이 통째로 사라질 수 있다.

## 4. 디스크풀 (Disk Full / DiskPressure)

### 증상

노드의 사용 가능한 디스크가 임계치 아래로 내려가면 kubelet이 해당 노드에 `DiskPressure` 컨디션을 걸고, 필요하면 파드를 evict하기 시작한다. 애플리케이션 입장에서는 로그·임시 파일 쓰기가 실패하거나, RabbitMQ·DB처럼 디스크에 상태를 쓰는 컴포넌트는 자체적으로 쓰기를 막아버린다.

### 원인

- 로그 파일이 로테이션·retention 없이 무한정 쌓임
- 컨테이너 이미지·레이어가 정리되지 않고 누적됨
- PVC(퍼시스턴트 볼륨)의 실제 사용량이 예상보다 빠르게 늘어남
- 크래시가 반복되며 core dump가 계속 쌓임

### 진단

```bash
kubectl describe node <node-name>   # Conditions의 DiskPressure 확인
df -h
du -sh /var/lib/docker/* 2>/dev/null | sort -h
```

노드에 직접 들어갈 수 있다면 `df -h`로 어느 파티션이 꽉 찼는지, `du -sh`로 어느 디렉토리가 큰지 좁혀나간다. node-exporter를 쓰고 있다면 `node_filesystem_avail_bytes`를 시계열로 봐서, 디스크가 갑자기 찼는지 서서히 차오르다 넘겼는지 패턴을 구분하는 게 재발 방지에 더 도움이 된다.

### 대응

디스크를 압박하는 대상을 지우는 게 가장 먼저다. 아래 실측에서는 실험을 위해 강제로 채운 파일을 지우는 것만으로 디스크 여유공간이 즉시 회복되는 걸 확인했다 — 실제 운영 환경이라면 그 자리는 로그·이미지·PVC 같은 것으로 채워져 있을 것이고, 노드가 자동으로 회복되는 게 아니라 그 원인을 직접 찾아 지워야 한다는 점은 동일하다.

### 재발 방지

- 애플리케이션 로그에 **로테이션과 retention 정책**을 반드시 건다. "일단 다 남기고 나중에 정리"는 디스크풀로 직결된다.
- 사용 가능한 디스크가 일정 비율(예: 15%) 아래로 내려가면 미리 알리는 규칙을 건다. `DiskPressure`가 걸린 뒤에 대응하면 이미 파드 evict가 시작된 뒤다.
- PVC 사용량을 정기적으로 모니터링하고, 로그·임시 파일을 정리하는 CronJob을 둬서 사람이 잊어도 자동으로 정리되게 한다.

### 실제로 겪은 사례: DaemonSet은 안전할 거라는 착각

`fallocate`로 디스크를 강제로 채워 kubelet의 disk-pressure eviction을 재현하는 실험이다. 처음엔 "10GB만 채워서 disk pressure 감지를 확인"하는 시나리오를 세웠는데, 사전 점검에서 이대로는 아무 일도 일어나지 않는다는 걸 발견했다. kubelet의 기본 eviction 임계치(`imagefs.available < 15%`)를 넘으려면 이 클러스터의 실제 디스크 여유공간 기준으로 25~31GB를 채워야 했다.

그렇다고 30GB를 실제로 채우는 것도 위험했다. 이 클러스터는 과거에 컨테이너 이미지 캐시가 디스크를 잠식해서 실제 장애를 겪은 이력이 있어서(그 사고로 EBS를 30GB→60GB로 확장했다), 디스크를 다시 거의 채우는 건 그 사고를 의도적으로 재현하는 셈이라 부담이 컸다.

그래서 선택한 방법은 **디스크를 채우는 대신 kubelet의 eviction 임계치를 낮추는 것**이었다. `evictionHard`를 `nodefs.available: 35Gi, imagefs.available: 35Gi`로 낮춰두면, `fallocate -l 10G`만으로도 임계치를 넘어 안전하게 disk-pressure를 재현할 수 있다. "장애의 크기"가 아니라 "임계치"를 조정해서 같은 현상을 안전하게 재현하는 접근이다.

| 경과 | 이벤트 |
|---|---|
| — | kubelet `evictionHard`를 35Gi로 낮추고 재시작 |
| T0 | `fallocate -l 10G /tmp/fillfile`(여유공간 40GB→30GB) |
| +8s | 노드 `DiskPressure` 컨디션 `False → True` |
| +1m14s | `NodeHasDiskPressure` 이벤트, 이후 `EvictionThresholdMet` 반복 발생 |
| +1m45s | 첫 파드 축출 시작(`app-postgres-2`, BestEffort QoS가 최우선 대상) |
| 관측 종료 시점 | 총 6개 파드 `Evicted` |
| 복구 | `/tmp/fillfile` 삭제 + kubelet 설정 원복 → 디스크 여유공간 즉시 회복 |

실험 전에는 "DaemonSet은 disk-pressure를 기본적으로 tolerate하도록 설계돼 있어서 축출되지 않을 것"이라고 예상했지만 **틀렸다.** longhorn-manager, longhorn-csi-plugin, engine-image, metallb-speaker, loki-promtail, node-exporter까지 6개의 DaemonSet 파드가 실제로 축출됐다. BestEffort/Burstable QoS의 DaemonSet은 disk-pressure taint를 자동으로 tolerate하지 않는다는 걸 실측으로 확인한 것이다.

복구 과정에서도 배울 점이 있었다. 축출된 DaemonSet 파드의 잔여 오브젝트가 `ContainerStatusUnknown` 상태로 자동 정리되지 않아 수동으로 force-delete해서 컨트롤러가 다시 만들도록 유도해야 했다. 재스케줄된 Postgres standby가 새 노드에 볼륨을 붙이는 과정에서 `Multi-Attach error`가 잠깐 발생했는데, 이는 이전 노드에서의 detach 처리와 타이밍이 겹친 것으로 별도 조치 없이 수 분 내 자동 해소됐다.

**교훈**: "이 컴포넌트는 원래 이렇게 설계됐을 것"이라는 가정은 실측 전까지 가설일 뿐이다. 특히 storage 관련 DaemonSet(Longhorn)이 disk-pressure 상황에서 함께 축출되면, 그 노드의 스토리지 동작 자체가 지연될 수 있다는 게 이 실험에서 드러난 실질적 리스크다. 프로덕션이라면 이런 컴포넌트에 `priorityClassName`(예: `system-node-critical`)을 부여하는 걸 검토해야 한다.

## 정리

| 장애 | 감지 신호 | 1차 원인 | 실측 결과 |
|---|---|---|---|
| 노드 다운 | `kube_node_status_condition{Ready}` | kubelet 응답 불가, 인프라 장애 | 모니터링 컴포넌트가 장애 노드와 같이 배치돼 8분간 알림 무응답 → 재배치 후 `for: 5m` 설계값대로 정확히 firing |
| OOMKilled | `Reason: OOMKilled`, 재시작 카운트 | 메모리 사용량이 limit 초과 | 아직 실측 전(다음 실험 후보) |
| RabbitMQ 장애 | disk/memory alarm, 큐 적체 | 디스크·메모리 알람, Consumer 지연 | 브로커 강제 종료(79초 재기동)에도 durable 큐·persistent 메시지 100% 보존 |
| 디스크풀 | `DiskPressure`, `node_filesystem_avail_bytes` | 로그·이미지·PVC 정리 미비 | disk-pressure 발생 시 "안전할 것"으로 예상한 DaemonSet 6개가 실제로 축출됨 |

네 장애 모두 패턴은 비슷하다. **징후가 임계치를 넘기 전에 알림이 오도록 미리 규칙을 걸어두는 것**이 사후 대응보다 훨씬 싸게 먹힌다. 그리고 노드 다운·디스크풀·OOMKilled는 서로 원인이 얽혀 있는 경우가 많아서, 하나가 감지되면 나머지 컨디션도 같이 확인하는 습관이 진단 시간을 줄여준다.

실측으로 얻은 결론은 두 갈래였다. 노드 다운과 디스크풀 실험은 "설계상 이래야 한다"는 가정이 실제로 어긋나 있는 걸 발견했고(모니터링 SPOF, DaemonSet 축출), RabbitMQ 실험은 가정이 맞다는 걸 확인했다(메시지 내구성). **틀렸던 가정은 고칠 근거가 됐고, 맞았던 가정은 "확인된 사실"로 승격됐다** — 카오스 엔지니어링이 결국 하는 일은 이 둘 중 하나다.
