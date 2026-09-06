---
title: "로그는 이미 모으고 있는데, 그럼 SIEM은 뭐가 다른가"
category: mlops
order: -36
excerpt: "fluent-bit → Elasticsearch → Kibana로 관측(Observability) 스택을 만들고 나면 \"이거 SIEM이랑 뭐가 달라?\"라는 질문을 받게 됩니다. 둘 다 로그를 모으지만 목적, 데이터 모델, 보존 정책, 그 위에 얹는 로직이 다릅니다. SIEM이 실제로 하는 일(수집·정규화·상관분석·탐지·대응)을 정리하고, 이미 있는 EFK 스택에 최소한의 SIEM 기능을 얹는다면 어디를 손대야 하는지, Sigma 탐지 규칙 예시와 함께 남깁니다."
---

[EFK 관측 플랫폼](/blog/eks-multi-cluster-observability-platform)을 만들고 나서 받은 질문. "그거 로그 다 모으잖아. 그럼 SIEM이야?" 아니다. 로그를 한곳에 모으는 건 SIEM의 전제 조건이지 SIEM 자체가 아니다. 관측 스택과 SIEM은 같은 파이프(수집 → 저장 → 조회)를 쓰지만, **무엇을 위해 그 로그를 보느냐**가 다르고, 그 차이가 데이터 모델·보존 정책·그 위에 얹는 로직까지 전부 바꾼다.

## 관측과 SIEM은 질문이 다르다

| | 관측(Observability) | SIEM |
|---|---|---|
| 핵심 질문 | "시스템이 건강한가? 왜 느린가?" | "누가 침입했나? 이 행위가 정상인가?" |
| 주 사용자 | SRE / 개발자 | 보안 관제(SOC) / 침해대응 |
| 데이터 | 메트릭, 로그, 트레이스 | 로그, 이벤트, 알럿, 위협 인텔, 자산·계정 정보 |
| 시간축 관심 | 지금~최근 (실시간 대시보드) | 지금 + **과거 수개월** (사후 조사) |
| 로그를 보는 방식 | 증상에서 원인으로 파고듦(디버깅) | 흩어진 이벤트를 엮어 공격 시나리오 복원(상관분석) |
| 보존 기간 | 7~30일이면 충분한 경우가 많음 | 규제상 **6개월~1년+**, 무결성 보장 필요 |
| 성공 기준 | MTTR 단축 | 탐지율↑, 오탐↓, 조사 시간↓ |

관측 스택은 "이 서비스 p99가 튀었다 → 어느 파드냐 → 그 시간 GC 로그"로 좁혀 들어간다. SIEM은 반대로 **떨어져 있는 사건들을 붙인다.** "03:12 VPN 로그인 실패 20회 → 03:14 성공 → 03:20 새 IAM 사용자 생성 → 03:25 S3 대량 다운로드." 각각은 무해해 보이지만 엮으면 계정 탈취 후 데이터 유출이다. 이 "엮기"가 SIEM의 본질이다.

## SIEM이 실제로 하는 일

```
로그 소스            수집         정규화          저장/색인        탐지                대응
─────────           ────         ──────          ────────        ────                ────
엔드포인트  ─┐
네트워크    ─┤                  공통 스키마로     장기 보존       상관분석 규칙        알림(Slack/PD)
클라우드    ─┼─▶ 수집기(agent) ─▶ 필드 매핑    ─▶ (WORM/무결성) ─▶ 임계값·시퀀스    ─▶ 케이스 생성
앱/인증     ─┤    fluent-bit 등    ECS 등                          UEBA(행위 이상)     플레이북(SOAR)
WAF/IDS     ─┘                                                     위협 인텔 매칭
```

1. **수집(Collection)** — 엔드포인트, 방화벽·라우터, 클라우드 감사로그(CloudTrail, GCP Audit), IdP(로그인 이벤트), 애플리케이션, WAF/IDS. 관측 스택이 보통 안 건드리는 소스가 많다.
2. **정규화(Normalization)** — 여기가 관측과 가장 크게 갈린다. 소스마다 "출발지 IP" 필드 이름이 `src_ip`, `client_ip`, `source.address`, `c-ip`로 제각각인데, 상관분석을 하려면 **하나의 스키마**로 맞춰야 한다. Elastic은 ECS(`source.ip`, `user.name`, `event.action`), Splunk은 CIM. 이 매핑을 안 하면 "IP X가 등장한 모든 이벤트"라는 쿼리 자체가 안 된다.
3. **저장(Retention & Integrity)** — 규제(ISMS-P, 개인정보보호법, PCI-DSS 등)가 보존 기간과 위변조 방지를 요구한다. 삭제·수정 불가(WORM) 스토리지, 로그 무결성 해시.
4. **탐지(Detection)** — 세 층이다.
   - **규칙 기반**: "5분 내 로그인 실패 10회", "관리자 그룹에 사용자 추가"
   - **상관/시퀀스**: 여러 이벤트가 순서대로 일어나면 알럿 (EQL, Sigma correlation)
   - **UEBA(행위 이상)**: "이 계정이 평소 안 쓰던 나라에서, 평소 안 건드리던 DB에" — 베이스라인 대비 편차
5. **대응(Response)** — 알럿을 케이스로 만들고, 조사 타임라인을 붙이고, SOAR 플레이북으로 계정 잠금·IP 차단 같은 조치를 자동/반자동 실행.

관측 스택은 1·3만 하고, 4는 "임계값 알럿" 수준, 2·5는 거의 안 한다.

## 이미 있는 EFK에 최소 SIEM을 얹는다면

fluent-bit → Elasticsearch → Kibana가 이미 있으면 바닥부터 만들 필요는 없다. 선택지는 대략 셋.

| 방법 | 내용 | 언제 |
|---|---|---|
| **Elastic Security** | 기존 ES/Kibana에 Detection Engine 활성화. Fleet + Elastic Agent로 엔드포인트·클라우드 로그 수집, ECS 정규화, 내장 룰 + Sigma 임포트 | 이미 Elastic 스택이면 추가 비용·구성이 가장 적음 |
| **Wazuh** | 자체 엔드포인트 에이전트(FIM·rootkit·CIS 점검) + 룰 엔진. 자체 인덱서(OpenSearch 포크)를 두거나 기존 ES로 포워딩 | 호스트 레벨 탐지(파일 무결성, 권한 상승)가 필요할 때 |
| **직접 조립** | fluent-bit에서 필드 rename으로 ECS 정규화 → ES → ElastAlert2 또는 예약 쿼리로 룰 실행 | 룰이 몇 개 안 되고 의존성을 늘리기 싫을 때 |

무엇을 고르든 실제로 손대야 하는 건 같다.

**(1) 보안 로그 소스 추가.** 관측용으로는 안 넣던 것들.

```
- CloudTrail / GCP Audit Log     (클라우드 컨트롤 플레인)
- Kubernetes audit log           (누가 무슨 API를 호출했나)
- 인증 이벤트 (Keycloak, SSH, VPN)
- VPC Flow Log / WAF 로그
- 노드 auditd / falco (컨테이너 런타임 이상 행위)
```

**(2) fluent-bit에서 정규화.** 소스별 필드를 공통 스키마로.

```ini
[FILTER]
    Name    modify
    Match   auth.*
    Rename  remote_addr   source.ip
    Rename  username      user.name
    Add     event.category authentication

[FILTER]
    Name    modify
    Match   k8s.audit.*
    Rename  sourceIPs_0   source.ip
    Rename  user_username  user.name
```

**(3) 보존 정책 분리.** 관측 인덱스는 ILM으로 14일 뒤 삭제하더라도, 보안 인덱스는 별도 정책으로 최소 6개월 이상 + delete phase 없이 cold/frozen로. 인덱스 이름을 `security-*`로 분리해 ILM·접근권한·백업을 따로 건다.

**(4) 탐지 규칙.** [Sigma](https://github.com/SigmaHQ/sigma)로 쓰고 대상 백엔드 쿼리로 변환하면 벤더 종속이 줄어든다.

```yaml
title: 로그인 실패 다수 직후 성공 (계정 무차별 대입 성공 의심)
logsource:
  category: authentication
detection:
  failures:
    event.action: login-failed
  success:
    event.action: login-success
  timeframe: 5m
  condition: failures | count() by source.ip >= 10 and success
level: high
```

```yaml
title: 컨테이너에서 파이프-투-셸 실행
logsource:
  product: falco
detection:
  sel:
    proc.cmdline|re: '(curl|wget).+\|\s*(bash|sh)'
  condition: sel
level: high
```

**(5) 알림 라우팅.** 관측 알럿(파드 재시작, 디스크 80%)과 보안 알럿을 **다른 채널**로. 섞이면 알림 피로로 둘 다 무시하게 된다.

## 흔한 함정

- **로그 소스 커버리지 착각** — "로그 다 모아요"라고 하지만 정작 IdP 로그인 이벤트, 클라우드 감사로그가 빠져 있으면 계정 탈취를 볼 방법이 없다. 탐지하려는 시나리오부터 정하고 필요한 소스를 역산한다.
- **타임스탬프·타임존** — 소스마다 로컬 시간/UTC가 섞이면 상관분석의 시간창이 어긋난다. 수집 단계에서 전부 UTC로 통일하고 `@timestamp` 하나만 신뢰한다.
- **정규화를 미룸** — "일단 다 넣고 나중에 파싱" 하면 나중이 안 온다. 스키마 없는 로그 위에서는 룰을 못 쓴다.
- **오탐 방치** — 매일 100건 울리는 룰은 꺼진 룰과 같다. 룰마다 오탐률을 추적하고, 예외(정상 배치 IP 등)를 allowlist로 관리한다.
- **보존 비용** — 보안 로그를 hot 티어에 1년 두면 스토리지 비용이 관측 스택을 넘는다. 30일 hot → 나머지는 frozen(오브젝트 스토리지) 또는 별도 아카이브.

## 규제 관점 (ISMS-P)

인증심사에서 로그 관련해 실제로 보는 지점.

| 항목 | 요구 |
|---|---|
| 접근권한 부여·변경·삭제 이력 | 기록·보존, 정기 검토 |
| 침해사고 대응 | 탐지 → 분석 → 대응 절차와 그 근거 로그 |
| 로그 보존 | 관련 법령 기준(개인정보 취급 시 최소 1년 등) |
| 로그 위변조 방지 | 별도 저장, 접근통제, 무결성 검증 |
| 시각 동기화 | NTP로 전 시스템 시간 일치 |

관측 스택만 있으면 "로그는 있는데 6개월 전 건 이미 지워졌고, 관리자가 수정 가능한 인덱스에 들어 있다"가 되기 쉽다. 보안 인덱스를 분리하는 이유의 절반은 여기에 있다.

## 정리

| 질문 | 답 |
|---|---|
| 로그를 모으면 SIEM인가? | 아니다. 수집은 전제일 뿐. 정규화·상관분석·장기보존·탐지·대응이 SIEM |
| 관측 스택과 뭐가 다른가 | 질문("건강한가" vs "침입했나"), 데이터 모델(자유 vs 공통 스키마), 보존(주 단위 vs 월/년 단위), 그 위 로직(임계값 vs 상관·행위분석) |
| 기존 EFK를 재활용할 수 있나 | 있다. Elastic Security / Wazuh / 직접 조립. 공통으로 보안 소스 추가 + ECS 정규화 + 보존 분리 + 탐지 규칙 |
| 벤더 종속 줄이려면 | 탐지 규칙을 Sigma로 관리하고 백엔드 쿼리로 변환 |

한 줄 요약: **관측은 로그를 "디버깅용 사실"로 본다. SIEM은 같은 로그를 "정규화된 이벤트"로 바꿔 서로 엮어서 공격 시나리오를 복원한다.** 파이프는 같아도 스키마와 그 위에 얹는 로직이 다르다.
