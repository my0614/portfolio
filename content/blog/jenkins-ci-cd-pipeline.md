---
title: "Jenkins는 CI/CD 파이프라인을 어떻게 코드로 관리하나"
category: mlops
order: -11
excerpt: "Jenkins의 Controller-Agent 구조, Jenkinsfile로 파이프라인을 코드화하는 방식, Webhook과 Polling 트리거의 차이를 정리합니다."
---

Jenkins는 코드 변경을 감지해서 빌드·테스트·배포를 자동으로 실행해주는 오픈소스 CI/CD 자동화 서버다. GitHub Actions나 Bitbucket Pipelines 같은 SaaS형 CI 도구와 달리 서버 자체를 직접 설치·운영해야 하는데, 그 대신 온프레미스 환경에서도 쓸 수 있고 플러그인으로 세밀하게 커스터마이징할 수 있다는 차이가 있다.

## Controller-Agent 구조

Jenkins는 하나의 Controller(예전 명칭: 마스터)와 여러 Agent(예전 명칭: 슬레이브)로 이루어진 분산 구조다. Controller는 UI 제공, 파이프라인 스케줄링, 빌드 상태 관리를 담당하고, 실제 빌드 작업은 Agent 노드에서 실행된다. Controller가 빌드 요청을 받으면 조건에 맞는 Agent에게 작업을 분배하는 식이다.

Agent에는 라벨을 붙일 수 있어서, "이 빌드는 Docker가 설치된 Agent에서만 실행하라"처럼 실행 환경을 지정할 수 있다. Agent를 여러 대 붙이면 빌드를 병렬로 분산 처리할 수 있어서, 빌드가 몰릴 때 Controller 하나에 부하가 집중되는 걸 막을 수 있다.

## Jenkinsfile — 파이프라인을 코드로 관리하기

Jenkins의 핵심은 파이프라인 자체를 `Jenkinsfile`이라는 코드로 정의해서 저장소에 커밋한다는 점이다(Pipeline as Code). UI에서 클릭으로 설정하는 방식과 달리, 파이프라인 변경도 코드 리뷰와 버전 관리 대상이 된다.

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                sh 'npm ci && npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }

    post {
        failure {
            slackSend(channel: '#ci-alerts', message: "빌드 실패: ${env.BUILD_URL}")
        }
    }
}
```

`stages` 안에 체크아웃, 빌드, 테스트, 배포를 순서대로 나열하고, `when { branch 'main' }`처럼 조건을 걸어서 특정 브랜치에서만 배포 단계가 실행되도록 제어한다. `post` 블록은 파이프라인 성공·실패 여부에 따라 후속 동작(예: Slack 알림)을 정의하는 곳이다. 이 형태를 **Declarative Pipeline**이라고 부르고, 더 복잡한 조건 분기나 반복이 필요하면 Groovy 스크립트를 그대로 쓰는 **Scripted Pipeline**을 쓸 수도 있다.

## 트리거 방식 — Polling vs Webhook

Jenkins가 "언제 파이프라인을 실행할지" 아는 방법은 크게 두 가지다.

- **SCM Polling** — Jenkins가 일정 주기(예: 5분마다)로 저장소에 변경 사항이 있는지 직접 확인한다. 설정은 간단하지만, 폴링 주기만큼 트리거가 지연되고 변경이 없어도 매번 저장소를 조회하는 낭비가 생긴다.
- **Webhook** — 저장소(GitHub, Bitbucket 등)가 push 같은 이벤트가 발생했을 때 Jenkins에 직접 HTTP 요청을 보내 알려준다. 이벤트 발생 즉시 파이프라인이 트리거되고, 불필요한 조회도 없다.

지금은 대부분 Webhook 방식을 쓰고, Polling은 Webhook을 걸 수 없는 폐쇄망 환경 등 예외적인 경우에만 남아 있다.

## 플러그인 생태계 — 장점이자 관리 부담

Jenkins가 오래 널리 쓰인 이유 중 하나는 방대한 플러그인 생태계다. Slack 알림, Docker 빌드, Kubernetes 배포, 각종 SCM·아티팩트 저장소 연동까지 거의 모든 CI/CD 요구사항에 대응하는 플러그인이 존재한다. 반대로 이게 관리 부담이기도 하다 — 플러그인끼리 버전 의존성이 얽혀 있어서, 하나를 업데이트했다가 다른 플러그인이나 기존 파이프라인이 깨지는 일이 드물지 않다.

## 정리

- Jenkins는 Controller가 스케줄링과 상태 관리를, Agent가 실제 빌드 실행을 담당하는 분산 아키텍처다.
- Jenkinsfile로 파이프라인을 코드화하면 배포 스크립트도 저장소에서 버전 관리되고 리뷰 대상이 된다.
- 트리거는 Webhook이 Polling보다 즉시성이 높고 저장소에 불필요한 부하도 주지 않는다.
- GitHub Actions·Bitbucket Pipelines 같은 SaaS형 CI는 설정이 간단한 대신 커스터마이징 폭이 제한적인 반면, Jenkins는 직접 운영해야 하는 부담 대신 Agent 구성과 플러그인으로 세밀하게 맞출 수 있다는 차이가 있다.
