---
title: "K8s에서 자주 만나는 장애 4가지: 노드 다운, OOMKilled, RabbitMQ, 디스크풀"
category: mlops
order: -19
excerpt: "노드가 죽고, 파드가 OOMKilled로 재시작되고, RabbitMQ가 막히고, 디스크가 꽉 차는 상황은 원인과 증상이 서로 다르다. 각 장애가 왜 발생하고 어떻게 감지·진단·대응하는지, 그리고 재발을 막으려면 뭘 바꿔야 하는지를 정리한다."
---

## 왜 이 네 가지인가

Kubernetes 운영 중 마주치는 장애는 종류가 다양하지만, 크게 보면 **노드 레벨**(노드 다운), **파드 레벨**(OOMKilled), **애플리케이션 레벨**(RabbitMQ 같은 미들웨어 장애), **인프라 리소스 레벨**(디스크풀)로 계층이 나뉜다. 계층마다 증상이 드러나는 곳과 진단 방법이 다르기 때문에, 하나의 체크리스트로 뭉쳐서 접근하면 오히려 원인을 놓치기 쉽다. 이 글에서는 네 가지를 각각 증상 → 원인 → 진단 → 대응 → 재발 방지 순서로 정리한다.

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

1. 노드가 살아있다면 `kubectl cordon`으로 새 스케줄링을 막고 `kubectl drain`으로 파드를 안전하게 옮긴다.
2. 노드가 이미 죽었다면 컨트롤 플레인이 자동으로 파드를 다른 노드에 재스케줄하는지 확인한다. 이때 남은 노드에 여유 리소스가 있는지가 관건이다.
3. 노드 자체가 복구 불가능하면 교체한다(클라우드라면 Auto Scaling Group/노드 풀의 자동 복구에 맡기는 경우가 많다).

### 재발 방지

- **PodDisruptionBudget**과 **다중 replica + anti-affinity**로, 노드 하나가 죽어도 서비스가 완전히 끊기지 않게 분산해둔다.
- 클라우드 노드 풀의 **자동 복구(auto-repair)**를 켜서 사람이 개입하기 전에 노드가 교체되도록 한다.
- Alertmanager에 `kube_node_status_condition{condition="Ready", status="true"} == 0` 같은 규칙을 걸어 노드 상태 변화를 사람이 대시보드를 보기 전에 먼저 안다.

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

- 디스크/메모리 알람이 원인이면 알람 자체를 해제하는 게 먼저다(디스크 정리, 메모리 회수). 알람이 걸려 있는 동안은 큐를 늘리거나 설정을 바꿔도 publish가 계속 막힌다.
- 큐 적체가 원인이면 Consumer를 늘리거나, 처리 로직에서 병목을 찾는다.
- 파티션이 발생했다면 클러스터의 파티션 처리 정책(`pause_minority`, `autoheal` 등)에 따라 자동/수동으로 복구한다.

### 재발 방지

- `disk_free_limit`, `vm_memory_high_watermark`를 실제 노드 리소스보다 여유 있게 설정하고, 알람이 걸리기 전 단계에서 미리 알림이 오도록 임계치 기반 규칙을 건다.
- 큐 길이가 일정 임계값을 몇 분 이상 초과하면 알리는 규칙(예: `messages > N for 5m`)을 둬서, Consumer 처리 지연을 큐가 완전히 막히기 전에 감지한다.
- Consumer를 트래픽/큐 길이에 따라 오토스케일링하도록 구성한다.

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

- 급한 경우 불필요한 파일부터 정리한다. 컨테이너 런타임이라면 `crictl rmi $(crictl images -q)` 같은 명령으로 안 쓰는 이미지를 지우고, 오래된 로그를 삭제한다.
- PVC 사용량 초과가 원인이면 볼륨을 확장한다(스토리지 클래스가 확장을 지원해야 한다).
- 정말 급하면 문제가 되는 파드를 재배치해 해당 노드의 부담을 줄인다.

### 재발 방지

- 애플리케이션 로그에 **로테이션과 retention 정책**을 반드시 건다. "일단 다 남기고 나중에 정리"는 디스크풀로 직결된다.
- 사용 가능한 디스크가 일정 비율(예: 15%) 아래로 내려가면 미리 알리는 규칙을 건다. `DiskPressure`가 걸린 뒤에 대응하면 이미 파드 evict가 시작된 뒤다.
- PVC 사용량을 정기적으로 모니터링하고, 로그·임시 파일을 정리하는 CronJob을 둬서 사람이 잊어도 자동으로 정리되게 한다.

## 정리

| 장애 | 감지 신호 | 1차 원인 |
|---|---|---|
| 노드 다운 | `kube_node_status_condition{Ready}` | kubelet 응답 불가, 인프라 장애 |
| OOMKilled | `Reason: OOMKilled`, 재시작 카운트 | 메모리 사용량이 limit 초과 |
| RabbitMQ 장애 | disk/memory alarm, 큐 적체 | 디스크·메모리 알람, Consumer 지연 |
| 디스크풀 | `DiskPressure`, `node_filesystem_avail_bytes` | 로그·이미지·PVC 정리 미비 |

네 장애 모두 패턴은 비슷하다. **징후가 임계치를 넘기 전에 알림이 오도록 미리 규칙을 걸어두는 것**이 사후 대응보다 훨씬 싸게 먹힌다. 그리고 노드 다운·디스크풀·OOMKilled는 서로 원인이 얽혀 있는 경우가 많아서, 하나가 감지되면 나머지 컨디션도 같이 확인하는 습관이 진단 시간을 줄여준다.
