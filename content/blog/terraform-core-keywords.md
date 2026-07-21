---
title: "테라폼 핵심 키워드 6가지: resource, provider, variable, output, module, backend"
category: mlops
order: -14
excerpt: "Terraform HCL을 이루는 6가지 핵심 블록 — resource, provider, variable, output, module, backend — 을 각각 무엇을 위한 것이고 왜 필요한지 코드 예제와 함께 정리하고, 마지막엔 하나의 예제로 전부 이어 붙여 봅니다."
---

Terraform 코드를 읽다 보면 결국 몇 가지 블록 키워드가 반복된다. `resource`, `provider`, `variable`, `output`, `module`, `backend` — 이 6개만 각각 무슨 역할인지 알면 어떤 `.tf` 파일을 봐도 구조가 보인다. 하나씩 정리한다.

## 1. resource — 실제로 만들 대상

`resource`는 "이 리소스가 존재해야 한다"고 선언하는 가장 기본 블록이다. `resource "<타입>" "<이름>"` 형태로 쓰고, 여기서 이름은 실제 클라우드 리소스 이름이 아니라 **Terraform 코드 안에서 이 리소스를 가리키는 참조 이름**이다.

```hcl
resource "azurerm_resource_group" "rg" {
  name     = "example-rg"
  location = "Korea Central"
}
```

`azurerm_resource_group.rg`라고 쓰면 어디서든 이 리소스 그룹을 참조할 수 있다. [테라폼 배포 워크플로우](/blog/terraform-basics)에서 다뤘듯, 다른 리소스가 이 이름을 참조하면 Terraform이 그 관계로 의존성 그래프를 만든다.

## 2. provider — 어떤 플랫폼에 만들 것인가

`resource`가 "무엇을 만들지"라면, `provider`는 "어디에 만들지"를 결정한다. AWS, Azure, GCP, Kubernetes 등 플랫폼마다 별도의 provider가 있고, 같은 `resource` 문법이라도 provider가 다르면 실제로 호출되는 API가 달라진다.

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}
```

`required_providers`는 "이 provider의 어느 버전을 쓸지"를 고정하는 부분이고, `provider "azurerm" { features {} }`는 그 provider를 실제로 초기화하는 부분이다. `authentication` 관련 설정(구독 ID, 서비스 프린시펄 등)도 보통 이 블록이나 환경변수로 들어간다.

## 3. variable — 코드에 값을 하드코딩하지 않기

`resource` 블록 안에 `"example-rg"`처럼 값을 직접 적으면, 환경(dev/staging/prod)마다 코드를 복사해서 값만 바꾼 사본을 여러 개 만들어야 한다. `variable`은 이 값을 코드 밖에서 주입할 수 있게 만드는 선언이다.

```hcl
variable "resource_group_name" {
  type        = string
  description = "생성할 리소스 그룹 이름"
  default     = "example-rg"
}

variable "location" {
  type    = string
  default = "Korea Central"
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}
```

`var.resource_group_name`처럼 `var.` 접두사로 참조한다. 값은 `default`로 기본값을 주거나, `terraform apply -var="location=Korea South"`처럼 실행 시점에 넘기거나, `terraform.tfvars` 파일에 환경별로 따로 저장해서 관리할 수 있다.

## 4. output — 만든 결과값을 밖으로 꺼내기

리소스를 만들고 나면 그 리소스의 ID나 접속 정보처럼, 다른 곳(다른 모듈, CI/CD 파이프라인, 다른 팀)에 넘겨줘야 하는 값이 생긴다. `output`은 apply가 끝난 뒤 그 값을 콘솔에 보여주고, 다른 모듈에서 참조할 수 있게 만드는 블록이다.

```hcl
output "resource_group_id" {
  value = azurerm_resource_group.rg.id
}

output "storage_connection_string" {
  value     = azurerm_storage_account.sa.primary_connection_string
  sensitive = true
}
```

`sensitive = true`를 붙이면 `apply`/`plan` 로그와 `terraform output` 실행 결과에서 값이 `(sensitive value)`로 가려진다. 커넥션 스트링이나 비밀번호처럼 로그에 그대로 남으면 안 되는 값에는 반드시 붙여야 한다.

## 5. module — 반복되는 리소스 묶음을 재사용하기

리소스 그룹 하나 만드는 정도는 괜찮지만, "리소스 그룹 + 스토리지 계정 + 네트워크"처럼 항상 같이 묶여서 만들어지는 리소스 집합이 있다면, 그 코드를 프로젝트마다 복사·붙여넣기 하는 대신 `module`로 묶어서 재사용할 수 있다.

```hcl
# modules/storage/main.tf
variable "name" {}
variable "location" {}

resource "azurerm_resource_group" "rg" {
  name     = var.name
  location = var.location
}

resource "azurerm_storage_account" "sa" {
  name                     = "${var.name}sa"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

output "storage_account_id" {
  value = azurerm_storage_account.sa.id
}
```

```hcl
# main.tf
module "dev_storage" {
  source   = "./modules/storage"
  name     = "dev-example"
  location = "Korea Central"
}

module "prod_storage" {
  source   = "./modules/storage"
  name     = "prod-example"
  location = "Korea Central"
}
```

`module` 블록 하나가 그 모듈 안의 `variable`을 입력값으로 받고, 그 모듈의 `output`을 `module.dev_storage.storage_account_id`처럼 밖에서 참조할 수 있게 해준다. 같은 구조를 `dev_storage`, `prod_storage`로 이름만 바꿔 여러 번 재사용한 것이 핵심이다 — 리소스 정의를 두 번 쓰지 않았다.

## 6. backend — State를 어디에 둘 것인가

`backend`는 Terraform이 관리 상태를 기록하는 State 파일을 **어디에 저장할지** 정하는 블록이다. 기본값은 로컬 디스크지만, 팀으로 작업하면 원격 저장소(Azure Storage, S3 등)를 backend로 지정해야 한다.

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

State를 로컬에 두면 왜 문제가 생기는지, 원격 backend가 왜 필요한지는 [테라폼 State는 왜 신경 써서 관리해야 하나](/blog/terraform-state-management)에서 이미 정리했다. 여기서는 "State를 저장할 위치를 정하는 블록이 `backend`"라는 것만 기억하면 된다.

## 6개를 하나로 이어 붙이면

앞서 나온 조각들을 실제로 동작하는 하나의 구성으로 합치면 이렇다.

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstatestorage001"
    container_name        = "tfstate"
    key                    = "prod.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  type    = string
  default = "example-rg"
}

variable "location" {
  type    = string
  default = "Korea Central"
}

module "storage" {
  source   = "./modules/storage"
  name     = var.resource_group_name
  location = var.location
}

output "storage_account_id" {
  value = module.storage.storage_account_id
}
```

`backend`가 State 위치를, `provider`가 어떤 플랫폼에 붙을지를, `variable`이 환경별로 바뀌는 값을, `module`이 리소스 묶음 재사용을, `output`이 결과값 노출을 각각 책임진다. 그 사이에서 실제로 만들어지는 대상(`resource`)은 모듈 안에 캡슐화돼 있다.

## 정리

- `resource` — 실제로 만들 리소스를 선언한다. 코드 안에서는 `<타입>.<이름>`으로 참조된다.
- `provider` — 어떤 클라우드/플랫폼 API를 호출할지 결정한다. `required_providers`로 버전을 고정한다.
- `variable` — 환경마다 달라지는 값을 코드 밖에서 주입한다. 하드코딩을 막는다.
- `output` — apply 결과값을 밖으로 노출한다. 민감한 값은 `sensitive = true`로 가린다.
- `module` — 반복되는 리소스 묶음을 함수처럼 재사용한다. 모듈의 `variable`이 입력, `output`이 반환값 역할을 한다.
- `backend` — State 파일을 저장할 위치를 정한다. 팀 작업에서는 원격 backend + Locking이 필수다.
