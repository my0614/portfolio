---
title: "EKS 2개로 관측 플랫폼 만들기 — Terraform, Cilium, EFK, Prometheus, ArgoCD"
category: mlops
order: -34
excerpt: "dev 클러스터의 로그·지표를 별도 ops 클러스터로 모으는 hub-and-spoke 관측 플랫폼을 Terraform으로 처음부터 만들면서 겪은 것들. Cilium overlay가 EKS admission webhook을 깨뜨린 이유, LB Controller webhook 순서 문제, ArgoCD의 Synced≠Healthy, 그리고 finalizer가 teardown을 막는 지옥까지 삽질 위주로 정리합니다."
---

> dev 클러스터의 로그·지표를 별도 ops 클러스터로 모으는 hub-and-spoke 관측 플랫폼을
> 처음부터 Terraform 으로 만들면서 겪은 것들. 삽질 위주.

## 왜 만들었나

기존엔 kubeadm 단일 클러스터에 앱이랑 모니터링 스택이 같이 살았다. 문제는:

- Prometheus 가 OOM 나면 앱도 같이 흔들린다 (같은 노드)
- 클러스터를 날리면 그동안 쌓은 로그·지표도 같이 사라진다
- "관제탑"이 "관제 대상" 안에 있는 구조

그래서 이렇게 나누기로 했다:

```
                    VPC Peering
   ┌──────────────────────────┐        ┌──────────────────────────┐
   │  ops-eks (관제탑)         │        │  dev-eks (워크로드)      │
   │                          │        │                          │
   │  Elasticsearch + Kibana  │◄─로그──┤  fluent-bit (DaemonSet)  │
   │  Prometheus + Grafana    │◄─지표──┤  prometheus-agent        │
   │  ArgoCD ─────────────────┼──배포─►│  워크로드                │
   │  Vault + ESO             │        │                          │
   └──────────────────────────┘        └──────────────────────────┘
        Cilium (ENI mode)                   Cilium (ENI mode)
```

- **ops** 는 관측 도구만. dev 를 들여다본다.
- **dev** 는 앱만. 로그·지표를 밖으로 밀어내기만 한다.
- 완전히 분리된 VPC 2개 + Peering.

전부 Terraform. helm 도 Terraform 의 `helm_release` 로.

---

## 1. Terraform 구조 — 왜 5조각으로 쪼갰나

처음엔 한 디렉터리에 다 넣으려다 바로 막혔다.

`helm` / `kubernetes` provider 는 **대상 클러스터가 이미 존재해야** 설정할 수 있다.
`aws eks get-token` 으로 인증하는데, 클러스터가 없으면 그 토큰을 못 만든다.
그래서 "EKS 만들기" 와 "그 위에 helm 깔기" 를 한 `apply` 에 넣으면 첫 실행이 깨진다.

결국 이렇게 나눴다:

```
efk/
├─ network/            VPC 2개 + Peering                     (aws)
├─ ops/
│  ├─ cluster/         ops EKS                               (aws)
│  └─ platform/        Cilium, EFK, Prometheus, ArgoCD, Vault (aws + helm + kubernetes + kubectl)
└─ dev/
   ├─ cluster/         dev EKS                               (aws)
   └─ platform/        Cilium, fluent-bit, prometheus-agent  (aws + helm + kubernetes + kubectl)
```

각 폴더가 독립 root module. state 는 S3 에 경로별로 분리하고,
뒤 단계가 앞 단계 output 을 `terraform_remote_state` 로 읽는다.

`apply` 순서: `network → ops/cluster → dev/cluster → ops/platform → dev/platform`

`network` 를 따로 뺀 건 두 VPC + peering(단일 리소스)을 같이 만들어야 해서고,
`cluster` 와 `platform` 을 나눈 건 위의 provider 문제 때문이다.

---

## 2. 첫 번째 관문: EKS + Cilium = overlay 지옥

CNI 를 Cilium 으로 쓰기로 했다. eBPF, Hubble 가시성을 써보고 싶었다.
처음엔 문서 예제대로 **overlay(VXLAN) 모드**로 깔았다.

```hcl
ipam         = { mode = "cluster-pool" }
routingMode  = "tunnel"
tunnelProtocol = "vxlan"
# Pod CIDR = 10.110.0.0/16  (VPC 는 10.10.0.0/16)
```

노드도 Ready 되고, Cilium 파드도 다 뜨고, 좋아 보였다.
그런데 `ops/platform` apply 중반에 이게 우수수 터졌다:

```
Error: Internal error occurred: failed calling webhook "mservice.elbv2.k8s.aws":
  failed to call webhook: Post "https://aws-load-balancer-webhook-service.kube-system.svc:443/mutate-v1-service":
  Address is not allowed
```

`Address is not allowed`. 이게 핵심 단서였다.

### 무슨 일이었나

EKS 는 **컨트롤플레인이 AWS 관리 영역**에 있다. admission webhook(LB Controller, ECK,
external-secrets, prometheus-operator …)을 호출하려면 그 컨트롤플레인이 **webhook 파드의
IP 로 직접 접속**해야 한다.

Cilium overlay 모드에서 파드는 `10.110.0.0/16` IP 를 받는다. VPC(`10.10.0.0/16`) **밖**이다.
EKS 관리형 컨트롤플레인은 VPC 밖 IP 로는 webhook 을 못 부른다 → `Address is not allowed`.

그리고 webhook 하나 고쳐도 다음 webhook 에서 똑같이 터진다. whack-a-mole.

### 해결: Cilium ENI 모드

```hcl
eni                        = { enabled = true }
ipam                       = { mode = "eni" }
routingMode                = "native"
egressMasqueradeInterfaces = "eth0"
```

ENI 모드는 파드가 **VPC 서브넷 IP 를 직접** 받는다 (VPC CNI 처럼).
그럼 컨트롤플레인이 webhook 에 도달할 수 있고, NLB `ip` target 도 가능해진다.
노드 IAM role 의 `AmazonEKS_CNI_Policy`(EKS 모듈이 자동 부여)가 ENI/IP 관리 권한을 준다.

**교훈: EKS 에서 Cilium overlay 는 admission webhook 을 쓰는 순간 깨진다.
ENI 모드가 사실상 필수다.** (Cilium 공식 문서도 EKS 는 ENI 를 권장한다. 나는 안 읽었다.)

이미 overlay 로 떠 있는 클러스터를 전환하려면:
`terraform apply -target=helm_release.cilium` → 노드 2대 terminate → ASG 가 재생성 →
모든 파드가 새 VPC IP 로 재스케줄.

---

## 3. 두 번째 관문: admission webhook 순서

ENI 모드로 바꾸고 다시 apply. 이번엔 다른 에러:

```
Error: Internal error occurred: failed calling webhook "mservice.elbv2.k8s.aws":
  no endpoints available for service "aws-load-balancer-webhook-service"
```

AWS Load Balancer Controller 의 mutating webhook 은 **클러스터의 모든 Service 생성을
가로챈다** (`failurePolicy: Fail`). 그런데 LB Controller 파드가 아직 안 떠서 그 webhook
엔드포인트가 비어있으면 → **어떤 Service 도 못 만든다**.

내 코드는 `external-secrets`, `metrics-server`, `kube-prometheus-stack`, `eck-operator`,
`vault`, `argocd` 를 전부 `depends_on = [aws_eks_addon.coredns]` 로 걸어놔서,
coredns 뜨자마자 6개가 **동시에** helm install 되고 있었다.
그 와중에 LB Controller 도 같이 설치되는데, webhook 은 등록됐지만 파드는 아직 이미지
pull 중이고, 나머지 릴리스들이 Service 를 만들려다 다 실패.

### 해결

Service 를 만드는 모든 helm 릴리스를 LB Controller **뒤로** 줄 세웠다:

```hcl
depends_on = [helm_release.aws_load_balancer_controller]
```

`helm_release.aws_load_balancer_controller` 는 `wait = true`(기본)라, 이게 끝나면
Deployment 가 Available = 파드가 webhook 을 서빙 중이다.

추가로 `terraform apply -parallelism=4` — 갓 만든 작은 EKS API 서버는 helm install 6개를
동시에 던지면 HTTP/2 연결을 끊는다 (`http2: client connection lost`).

---

## 4. 잔가지들

한꺼번에 몰아서:

### spot 인스턴스 타입 에러

```hcl
# ❌ "Inconsistent conditional result types" — {..} 와 {} 는 다른 타입
instance_market_options = var.use_spot ? { market_type = "spot" } : {}

# ✅ 양쪽을 map(string) 으로 통일
instance_market_options = var.use_spot ? tomap({ market_type = "spot" }) : tomap({})
```

Terraform 삼항연산자는 양쪽 결과 타입이 정확히 같아야 한다.
`{market_type="spot"}` 와 `{}` 는 다른 object 타입 → 에러.
`tomap()` 으로 둘 다 `map(string)` 으로 만들면 통과.
(중간에 `market_type` 이라는 인자가 있는 줄 알고 헛짓도 했다. self-managed 노드그룹
서브모듈엔 `market_type` 이 없고 `instance_market_options` 만 있다.)

### eks-blueprints-addons 제거

```
Error: no available releases match the given constraints ~> 2.14, >= 3.0.0
```

`aws-ia/eks-blueprints-addons` 최신 버전이 helm provider **v3** 를 요구하는데,
내 다른 코드는 v2 문법이라 충돌. 모듈을 걷어내고 LB Controller / external-secrets /
metrics-server 를 직접 `helm_release` + IRSA 로 대체했다. 40줄 늘었지만 훨씬 투명하다.

### ArgoCD chart 값

```hcl
# ❌ 차트 values 스키마가 문자열을 요구
"server.insecure" = true
# ✅
"server.insecure" = "true"
```

---

## 5. GitOps: "Synced 인데 Degraded"

`ops/platform` 이 다 뜨고, ArgoCD 가 `k8s-manifests` 레포에서 `api-server` 를 dev 로
배포했다. `argocd app get` 을 보니:

```
Sync Status:    Synced to main (fcb6044)
Health Status:  Degraded

KIND         STATUS  HEALTH     MESSAGE
Service      Synced  Healthy    service/api-server created
Deployment   Synced  Degraded   deployment.apps/api-server created
```

처음엔 "ArgoCD 가 뭘 잘못했나?" 했는데, 아니었다.

- **Synced** = 클러스터 상태가 git 과 일치한다. ArgoCD 는 제 할 일을 다 했다.
- **Degraded** = 배포된 앱의 런타임 헬스. `.status` 의 available replicas 가 desired 에 못 미친다.

파드를 보니 `ImagePullBackOff`. 매니페스트가 옛날 클러스터의 Harbor 레지스트리
(`harbor.local:31773/app/api-server`)를 가리키고 있었다. dev EKS 는 그 호스트명을 못 풀고,
그 포트에 도달도 못 하고, `harbor-pull-secret` 도 없다.

**git 이 존재하지 않는 이미지를 가리키면, ArgoCD 는 그걸 충실히 배포하고, 파드는 못 뜬다.**
ArgoCD 가 고칠 문제가 아니다. git 을 고쳐야 한다.

이게 GitOps 의 본질을 잘 보여줬다: ArgoCD 는 "선언한 상태로 수렴시키는 기계"지,
"앱을 살아있게 만드는 마법"이 아니다. `Synced ≠ Healthy`.

---

## 6. Prometheus agent 모드 — edge 를 가볍게

dev 쪽 Prometheus 는 **agent 모드**로 돌렸다.

```hcl
prometheus:
  agentMode: true
  prometheusSpec:
    externalLabels: { cluster: dev }
    remoteWrite:
      - url: http://<ops 내부 NLB>:9090/api/v1/write
```

agent 모드는 Prometheus 를 "수집·전달 전용"으로 만든다:

| 유지 | 제거 |
|---|---|
| service discovery, scrape, relabel | 로컬 TSDB (WAL 만, ~2h 버퍼) |
| remote_write | PromQL 쿼리 API |
| | 알람룰 평가, Alertmanager 연결 |

파드 이름이 `prom-agent-...` 로 시작하면 agent 다.

**왜 이게 맞나:**

- dev 는 RAM 몇백 MB, PVC 불필요. 풀 Prometheus 는 2~8GB+ 먹는다.
- 모든 클러스터 지표가 ops 한 곳에 모여 `{cluster="dev"}` 로 같이 쿼리된다.
- **네트워크 방향이 맞다.** agent 가 밖으로 push 한다 (dev→ops). ops 가 dev 를 scrape
  하려면 타겟(파드 IP)마다 도달성을 확보해야 하는데, 파드 IP 는 계속 바뀐다. 지옥이다.
  push 면 내부 NLB 1개로 끝.

트레이드오프: ops Prometheus 가 죽으면 dev 지표를 **아예** 못 본다 (로컬 폴백 없음).

수신 쪽(ops)은 `enableRemoteWriteReceiver: true` 로 `/api/v1/write` 를 열어둔다.

검증:

```promql
count(up{cluster="dev"})                              # 19
rate(prometheus_remote_storage_samples_total{cluster="dev"}[5m])   # 초당 전송량
prometheus_remote_storage_samples_failed_total{cluster="dev"}      # 0 이어야
```

---

## 7. 로그 파이프라인: fluent-bit 2단

fluent-bit 이 두 개 있다.

```
dev 노드                              ops 클러스터
┌──────────────────┐                  ┌────────────────────────┐
│ fluent-bit       │  ─forward:24224─►│ fluent-bit 집계기 ×2   │
│ (DaemonSet)      │  (내부 NLB 경유) │ [INPUT] forward        │
│ /var/log/        │                  │ [OUTPUT] es → 여기가   │──► Elasticsearch
│  containers/*.log│                  │   ES 에 write          │      (dev-YYYY.MM.DD)
│ [OUTPUT] forward │                  └────────────────────────┘
└──────────────────┘
```

- **dev fluent-bit**: 노드 로그 tail → kubernetes 메타데이터 부착 → `record_modifier` 로
  `cluster=dev` 라벨 → `forward` 로 ops 로 보낸다. ES 주소·자격증명을 모른다.
- **ops 집계기**: forward 수신 → `es` 출력으로 Elasticsearch 에 적재. 버퍼링·재시도를
  여기서 중앙관리.

내부 NLB 는 `target-type=instance` (Cilium overlay 흔적 — 사실 ENI 모드면 `ip` 도
되지만 안정성 위해 instance). ops 노드 SG 에 dev VPC 대역 → NodePort 범위(30000-32767)를
열어둬야 한다.

저장된 문서:

```json
{
  "@timestamp": "2026-08-30T12:32:36.401Z",
  "stream": "stderr",
  "log": "time=\"...\" level=info msg=\"Resolving IP deficit of node\" ...",
  "kubernetes": {
    "pod_name": "cilium-operator-...", "namespace_name": "kube-system",
    "labels": {...}, "container_name": "cilium-operator", "host": "ip-10-20-1-69..."
  },
  "cluster": "dev"
}
```

JSON 로그는 `Merge_Log On` 으로 필드가 쪼개진다. 텍스트 로그는 `log` 필드에 통째로.

---

## 8. Vault + External Secrets

ArgoCD 의 GitHub 토큰 같은 걸 코드/매니페스트에 안 박으려고 Vault 를 썼다.

```
Vault (secret 저장)  →  External Secrets Operator (읽음)  →  K8s Secret 생성  →  ArgoCD 사용
```

Vault 는 **AWS KMS auto-unseal** (`seal "awskms"`). 파드 재시작해도 KMS 가 자동 unseal.
단 최초 `vault operator init` 은 수동 (Root Token 을 어딘가엔 저장해야 하니까).

init 직후 함정: **ESO 가 "Vault is sealed" 상태를 캐시**하고 있어서, unseal 됐는데도
`ClusterSecretStore` 가 `InvalidProviderConfig` 로 굳어있었다.

```bash
kubectl -n external-secrets rollout restart deploy/external-secrets
# → "store validated"
```

---

## 9. 삭제도 쉽지 않다 — finalizer 지옥

다 둘러보고 `terraform destroy` (역순: `dev/platform → ops/platform → dev/cluster →
ops/cluster → network`).

`ops/platform` destroy 가 **20분간 멈췄다**:

```
kubernetes_service_v1.prometheus_remote_write_nlb: Still destroying... [19m51s elapsed]

Error: Service (monitoring/prometheus-remote-write-nlb) still exists
```

NLB Service 의 finalizer(`service.k8s.aws/resources`)를 LB Controller 가 안 뗐다.
강제 제거:

```bash
kubectl -n monitoring patch svc prometheus-remote-write-nlb --type=merge \
  -p '{"metadata":{"finalizers":null}}'
```

그다음 `logging` 네임스페이스가 `Terminating` 에서 안 빠졌다. ECK Elasticsearch CR 의
finalizer 인데 operator 는 이미 지워진 상태. 네임스페이스를 강제로:

```bash
kubectl get ns logging -o json | python3 -c "import sys,json;d=json.load(sys.stdin);d['spec']['finalizers']=[];print(json.dumps(d))" \
  | kubectl replace --raw /api/v1/namespaces/logging/finalize -f -
```

그런데 NLB Service finalizer 를 강제로 뗐더니 LB Controller 가 만든 **Security Group 3개**
(`k8s-*`)가 고아로 남아서, 이번엔 **VPC 삭제를 15분 막았다**. 수동 삭제.

마지막으로 PVC 로 프로비저닝된 **EBS 볼륨 4개**(ES 50 / Prometheus 30 / Grafana 5 /
Vault 10 GB)가 클러스터 사라진 뒤 CSI 컨트롤러가 없어서 정리 안 됨. 수동 삭제.

**교훈: `terraform destroy` 전에 `kubectl delete` 로 NLB Service 랑 PVC 를 먼저 지우고,
LB Controller / ECK operator 가 살아있는 동안 정리되게 둬라.** 그러면 이 4가지가 다 안 생긴다.

---

## 10. 비용

spot 노드 기준:

| 항목 | 하루 |
|---|---|
| EKS 컨트롤플레인 ×2 | $4.8 |
| EC2 노드 spot (t3.xlarge×2 + t3.large×2) | ~$4.3 |
| NAT Gateway ×2 | ~$2.9 |
| 내부 NLB ×2 + EBS | ~$1.5 |
| **합계** | **~$13.5/일 ($0.55/hr)** |

EKS 컨트롤플레인은 "정지"가 없다. 클러스터가 존재하는 한 계속 과금.
$0 되려면 destroy 뿐이다. 실습이면 올렸다 내리는 게 맞다 (3시간 ≈ $2).

---

## 회고

**잘한 것**
- cluster / platform 단계 분리 — provider 부트스트랩 문제를 처음부터 피함
- Prometheus agent 모드 + fluent-bit 2단 — edge(dev)를 가볍게, push 방향으로
- Vault + ESO — 시크릿을 코드에서 완전히 분리

**다음엔 다르게**
- **Cilium overlay 를 시도하지 말 것** (EKS + webhook = 불가). ENI 모드로 바로 시작.
- helm 릴리스 의존 그래프를 처음부터 LB Controller 뒤로 줄 세울 것
- teardown 스크립트를 미리 만들 것 (NLB Service + PVC 선삭제)
- 단일 EKS + 네임스페이스 분리도 충분했을 수 있다. 2 클러스터는 격리·학습 가치는
  있지만 peering + 크로스클러스터 NLB + ArgoCD 멀티클러스터 복잡도를 다 떠안는다.

**얻은 것**
- "`Synced ≠ Healthy`" 를 몸으로 이해
- EKS 관리형 컨트롤플레인이 파드에 어떻게 도달하는지 (webhook 경로)
- Kubernetes finalizer 가 왜 있고 언제 발목을 잡는지
- Terraform 으로 멀티클러스터 + helm 을 다룰 때의 현실적인 구조
