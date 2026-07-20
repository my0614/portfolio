---
title: "테라폼 State는 왜 신경 써서 관리해야 하나"
category: mlops
order: -10
excerpt: "Terraform이 State 파일로 실제 인프라를 추적하는 이유, 로컬 State가 팀 작업에서 깨지는 지점, 그리고 원격 백엔드와 State Locking으로 이를 해결하는 방법을 정리합니다."
---

Terraform은 HCL로 "이런 인프라가 있어야 한다"를 선언하면, 그걸 실제 클라우드에 만들어주는 도구다. 그런데 이 선언(코드)과 실제 인프라 사이를 이어주는 게 하나 더 있다 — **State 파일**이다. Terraform을 다룰 때 코드보다 오히려 이 State를 어떻게 관리하느냐에서 실수가 많이 나온다.

## State 파일이 하는 일

`terraform.tfstate`는 지금 Terraform이 관리하는 리소스들이 실제로 클라우드의 어떤 리소스에 대응하는지를 기록한 JSON 파일이다. 예를 들어 HCL에 `azurerm_resource_group.rg`라고 선언했다면, State 파일에는 그 리소스가 실제로 Azure의 어떤 리소스 ID를 가리키는지, 현재 어떤 속성 값을 가지고 있는지가 저장된다.

Terraform이 `plan`을 실행할 때 비교하는 대상은 세 가지다.

1. **코드(HCL)** — 지금 선언된 목표 상태
2. **State 파일** — 마지막으로 Terraform이 확인한 상태
3. **실제 인프라** — 클라우드에 진짜로 떠 있는 상태 (refresh로 다시 조회)

State가 없으면 Terraform은 "지금 이 리소스가 이미 존재하는지, 존재한다면 어떤 속성인지"를 알 방법이 없다. 매번 클라우드 전체를 스캔해서 리소스를 찾아낼 수도 없고, 애초에 어떤 리소스가 "내가 관리하는 대상"인지조차 구분할 수 없다. State는 코드와 실제 인프라 사이의 매핑 정보이자, plan/apply가 무엇을 바꿀지 계산하는 근거다.

## 로컬 State의 문제

기본 설정 그대로 두면 State 파일은 `terraform apply`를 실행한 사람의 로컬 디스크에 남는다. 혼자 쓸 때는 문제가 없지만, 팀으로 작업하면 바로 문제가 생긴다.

- **State가 팀원마다 따로 논다.** A가 로컬에서 apply해서 리소스를 만들면, 그 State는 A의 컴퓨터에만 있다. B가 같은 코드로 apply하면 Terraform은 State에 기록이 없으니 "이 리소스가 아직 없다"고 판단하고 다시 만들려고 시도한다.
- **동시 실행에 대한 잠금이 없다.** 두 사람이 동시에 `apply`를 실행하면 둘 다 같은 State 파일을 읽고 각자 계획을 세운 뒤 각자 쓰기 때문에, 나중에 쓴 쪽이 먼저 쓴 쪽의 변경 사항을 덮어써 버릴 수 있다.
- **민감 정보가 평문으로 들어간다.** State 파일에는 리소스의 모든 속성값이 그대로 기록되는데, 여기에는 DB 비밀번호나 커넥션 스트링처럼 민감한 값도 포함된다. 로컬 파일이나 개인 Git 저장소에 그대로 남으면 그 자체가 유출 지점이 된다.

## 원격 백엔드 + State Locking

이 문제를 해결하는 방법은 State를 로컬이 아니라 팀이 공유하는 원격 저장소에 두고, 동시에 쓰지 못하도록 잠그는 것이다. Azure 환경이라면 Storage Account를 백엔드로 쓰는 게 표준적인 방식이다.

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstatestorage001"
    container_name        = "tfstate"
    key                    = "prod.terraform.tfstate"
  }
}
```

이렇게 설정하면 State는 Azure Blob Storage에 저장되고, Terraform은 `apply` 시작 시 그 Blob에 대해 lease(임대 잠금)를 건다. 다른 사람이 그 사이에 `apply`를 시도하면 이미 잠겨 있다는 에러를 받고 대기하거나 실패한다 — 로컬 State에서는 없던 "동시 실행 방지"가 이걸로 해결된다. (AWS라면 S3 백엔드 + DynamoDB 잠금 테이블 조합이 같은 역할을 한다.)

## 상태를 직접 들여다보고 다루는 명령어

State는 블랙박스가 아니라 직접 조회하고 수정할 수 있는 대상이다.

- `terraform state list` — 지금 State가 추적하는 리소스 목록을 확인한다.
- `terraform state show <주소>` — 특정 리소스의 현재 저장된 속성값을 확인한다.
- `terraform import <주소> <실제 리소스 ID>` — 이미 콘솔이나 CLI로 수동으로 만들어둔 리소스를 State에 등록해서, 그 이후부터는 Terraform이 관리하게 만든다.
- `terraform state mv` — 코드에서 리소스 이름이나 모듈 구조를 바꿨을 때, 실제 인프라를 지우고 다시 만드는 대신 State 안에서 주소만 옮겨서 "같은 리소스"로 계속 인식시킨다.

특히 `state mv`는 리소스를 실제로 삭제·재생성하지 않고 코드 리팩터링을 하고 싶을 때 중요하다. 이걸 모르고 리소스 이름만 바꾸면, Terraform은 "기존 리소스는 삭제 대상, 새 이름은 생성 대상"으로 인식해서 멀쩡한 인프라를 지웠다가 새로 만들려고 든다.

## 정리

- State 파일은 Terraform이 코드와 실제 인프라를 연결하는 유일한 근거다. State가 없으면 plan/apply가 무엇을 바꿔야 할지 계산할 방법이 없다.
- 로컬 State는 혼자 쓸 때만 안전하다. 팀으로 쓰면 State 불일치, 동시 실행 충돌, 민감 정보 평문 노출이라는 세 가지 문제가 그대로 드러난다.
- 원격 백엔드(Azure Storage, S3 등)에 State를 두고 Locking을 걸면 동시 실행 문제가 해결되고, 접근 권한 관리로 민감 정보 노출 범위도 좁힐 수 있다.
- 리소스 이름을 바꾸는 리팩터링처럼 실제 인프라는 그대로 두고 싶은 변경은 `terraform state mv`로 State 주소만 옮겨야지, 코드만 고치면 삭제·재생성으로 이어질 수 있다.
