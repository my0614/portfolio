---
title: "ALB와 NLB는 어디서 갈리는가"
category: mlops
order: -22
excerpt: "L7 로드밸런싱과 L4 로드밸런싱이 각각 무엇을 책임지고 무엇을 포기하는지, 그리고 그 개념의 AWS 구현체인 ALB와 NLB가 어디서 갈리는지 비교하고, VPC 두 개를 Peering으로 붙인 관측 플랫폼에서 dev→ops 트래픽을 왜 ALB가 아니라 내부 NLB로 연결했는지 실제 Terraform 코드 한 조각과 함께 정리합니다."
---

`efk`라는 실습 프로젝트에서 관측(Observability) 플랫폼을 만들었다. VPC 두 개(`ops` `10.10.0.0/16`, `dev` `10.20.0.0/16`)를 VPC Peering으로 붙이고, 각 VPC에 EKS 클러스터를 하나씩 올린 구조다. `dev` 클러스터의 로그·지표를 `ops` 클러스터로 모아서 Kibana / Grafana로 본다.

```
dev fluent-bit(DaemonSet) --- forward:24224 ---▶  ops fluent-bit 집계기 ─▶ Elasticsearch ─▶ Kibana
dev prometheus-agent      --- remote_write   ---▶  ops Prometheus(remote-write) ─▶ Grafana
```

이때 "dev의 파드가 ops의 서비스로 트래픽을 보낼 안정적인 엔드포인트"가 필요했다. 파드 IP는 계속 바뀌고 노드도 spot이라 언제든 갈린다. 여기서 ALB를 쓸지 NLB를 쓸지 정해야 했다. 이 글은 두 로드밸런서가 어디서 갈리는지 정리하고, efk에서 왜 NLB를 골랐는지 짧게 남긴 것이다.

## ELB 3형제

AWS의 Elastic Load Balancing은 지금 실질적으로 세 종류다.

| | CLB (구형) | **ALB** | **NLB** |
|---|---|---|---|
| 동작 계층 | L4 + L7 | **L7 (HTTP / HTTPS / gRPC)** | **L4 (TCP / UDP / TLS)** |
| 라우팅 기준 | 포트 | Host / Path / 헤더 / 메서드 / 쿼리스트링 | 프로토콜 + 포트만 |
| 고정 IP | 없음 | 없음 (DNS 이름만) | **AZ당 고정 IP, EIP 부착 가능** |
| TLS | 종료 | 종료 (SNI, ACM 연동) | 종료 **또는 그대로 통과(passthrough)** |
| 부가 기능 | 거의 없음 | WAF, Cognito/OIDC 인증, 리다이렉트, 고정 응답 | 없음 (순수 전달) |
| 성능 특성 | 낮음 | 커넥션마다 HTTP 파싱 오버헤드 | 초당 수백만 요청, 초저지연 |
| 소스 IP 보존 | X | X (`X-Forwarded-For` 헤더로 전달) | **O** |
| 유휴 타임아웃 | 60초 | 60초(조정 가능) | TCP 350초 |

## 핵심 차이는 한 문장

**ALB는 HTTP 요청의 내용을 읽고 판단한다. NLB는 패킷 내용을 읽지 않고 목적지로 흘려보낸다.**

- ALB는 요청 라인과 헤더를 파싱하므로 트래픽이 반드시 HTTP(S)/gRPC여야 한다. 그 대가로 "`/api`는 A 서비스로, `/admin`은 B 서비스로", "이 헤더 없으면 거부", "HTTP→HTTPS 리다이렉트", WAF·OIDC 로그인 같은 L7 기능을 얹을 수 있다.
- NLB는 4계층에서 TCP/UDP 연결만 중계한다. 페이로드가 HTTP든 fluentd forward든 Redis 프로토콜이든 신경 쓰지 않는다. 대신 지연이 거의 없고, AZ마다 IP가 고정되며, 클라이언트의 실제 출발지 IP가 백엔드까지 그대로 전달된다.

정리하면 ALB는 "HTTP 요청을 읽고 분기·보호하는 값"을 지불하고 쓰는 것이고, 그 값이 필요 없으면 NLB가 더 단순하고 빠르다.

## 언제 무엇을 고르나

**ALB를 쓴다:**
- 외부 사용자용 웹 서비스 / REST API
- 한 도메인 뒤에서 경로·호스트로 여러 서비스를 분기
- WAF, OIDC/Cognito 로그인, HTTP→HTTPS 리다이렉트가 필요
- Kubernetes에서 `Ingress` 리소스로 관리하고 싶을 때

**NLB를 쓴다:**
- HTTP가 아닌 프로토콜 (gRPC 스트림, MQTT, 데이터베이스, syslog, fluentd forward)
- 방화벽 허용 목록에 넣을 **고정 IP**가 필요
- TLS를 LB에서 끝내지 않고 애플리케이션까지 그대로 넘기고 싶을 때 (mTLS 등)
- 극단적인 처리량 / 낮은 지연이 중요
- 백엔드에서 **클라이언트 실제 IP**를 봐야 할 때
- L7 기능이 필요 없는 내부 서비스 간(VPC 내부 / Peering) 통신

## efk에서 NLB를 고른 이유

관측 트래픽 두 갈래를 따져보니 ALB가 낄 자리가 없었다.

**로그 경로는 애초에 HTTP가 아니다.** dev의 fluent-bit은 `forward` 출력 플러그인으로 로그를 보내는데, 이건 HTTP가 아니라 Fluentd forward 프로토콜(MessagePack over TCP, 24224 포트)이다. ALB는 HTTP(S)/gRPC만 처리하므로 이 트래픽을 아예 받을 수 없다.

**지표 경로는 HTTP지만 ALB가 필요 없다.** prometheus-agent의 `remote_write`는 HTTP POST(`/api/v1/write`)라 ALB도 가능하다. 그런데 실제로 필요한 걸 보면 — 경로 분기 없음(목적지는 `/api/v1/write` 하나), 호스트 라우팅 없음(백엔드는 Prometheus 하나), WAF·인증 없음(Peering으로만 닿는 내부망, source range로 dev VPC만 허용), TLS 종료 없음(내부라 평문). ALB의 L7 기능을 하나도 안 쓰는데 커넥션마다 HTTP 파싱 오버헤드를 떠안을 이유가 없었다.

그래서 두 경로 모두 **내부(internal) NLB**로 통일했다. EKS에서는 NLB를 직접 만들지 않고, `type: LoadBalancer` 서비스를 정의하면 AWS Load Balancer Controller가 프로비저닝한다. Prometheus용 내부 NLB (`efk/ops/platform/monitoring.tf`):

```hcl
resource "kubernetes_service_v1" "prometheus_remote_write_nlb" {
  metadata {
    name      = "prometheus-remote-write-nlb"
    namespace = "monitoring"
    annotations = {
      "service.beta.kubernetes.io/aws-load-balancer-nlb-target-type" = "instance"
      "service.beta.kubernetes.io/aws-load-balancer-scheme"          = "internal"
      "service.beta.kubernetes.io/aws-load-balancer-name"            = "efk-ops-remote-write"
      "service.beta.kubernetes.io/aws-load-balancer-subnets"         = join(",", local.net.ops_private_subnet_ids)
    }
  }

  spec {
    type                        = "LoadBalancer"
    load_balancer_class          = "service.k8s.aws/nlb"
    load_balancer_source_ranges = [local.net.dev_vpc_cidr]   # dev VPC 대역만 허용
    external_traffic_policy      = "Cluster"

    selector = { "app.kubernetes.io/name" = "prometheus" }

    port {
      name        = "remote-write"
      port        = 9090
      target_port = 9090
      protocol    = "TCP"
    }
  }

  wait_for_load_balancer = true
}
```

핵심만 보면:

| 필드 / annotation | 의미 |
|---|---|
| `load_balancer_class = "service.k8s.aws/nlb"` | 이 Service는 NLB로 만든다 |
| `aws-load-balancer-scheme: internal` | 인터넷에 안 뜬다. private 서브넷에 배치돼 Peering으로만 닿음 |
| `load_balancer_source_ranges` | NLB 앞단 보안그룹에 dev VPC CIDR만 인바운드 허용 |
| `wait_for_load_balancer = true` | apply가 NLB 주소 발급까지 대기 → dev 쪽이 그 주소를 참조 |

dev는 이 NLB 주소를 `remote_write` 대상으로 받아 쓴다 (`efk/dev/platform/monitoring-agent.tf`):

```hcl
remoteWrite = [{
  url = local.ops_remote_write_url   # http://<ops NLB>:9090/api/v1/write
}]
```

로그용 NLB(`efk-ops-log-forward`, 포트 24224)도 이름·포트·selector만 다르고 구조는 같다. 백엔드가 경로별로 나뉘지 않으니 "Ingress 하나에 ALB 하나로 경로 분기" 같은 ALB의 이점이 무의미했고, Service 두 개 = NLB 두 개가 오히려 더 단순했다.

## 정리

| 질문 | efk의 답 |
|---|---|
| dev→ops 트래픽이 HTTP인가? | 로그는 아님(forward/TCP), 지표는 맞음(remote_write) → 공통분모는 L4 |
| L7 라우팅·WAF·인증이 필요한가? | 아니오. 내부망, 백엔드 단일, source range로 격리 |
| 그래서 무엇을? | 내부 NLB 2개 (`efk-ops-log-forward:24224`, `efk-ops-remote-write:9090`) |
| 어떻게 만드나? | `Service(type=LoadBalancer)` + `loadBalancerClass: service.k8s.aws/nlb` → AWS LB Controller가 프로비저닝 |

한 줄 요약: **HTTP 요청을 읽고 분기·보호할 필요가 있으면 ALB, 그냥 L4에서 연결만 안정적으로 넘기면 되면 NLB.** efk의 관측 경로는 후자였다.
