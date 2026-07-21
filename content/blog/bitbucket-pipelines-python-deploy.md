---
title: "Bitbucket Pipelines로 Python 배치 프로젝트 배포 자동화하기"
category: mlops
order: -13
excerpt: "핫딜 자동화 프로젝트의 반복적인 수동 배포 문제를 Bitbucket Pipelines 3단계(검증-빌드-배포)와 AWS S3, CodeDeploy 조합으로 자동화한 기록입니다. 스텝 간 컨테이너 격리, artifacts/caches, trigger: manual로 배포 시점을 분리한 이유, appspec.yml과의 책임 분리까지 정리합니다."
---

## 배경: 수동 배포가 반복될수록 실수가 쌓인다

핫딜 상품 정보를 수집하고 이메일로 결과를 발송하는 Python 배치 프로젝트(`Hotdeal`)를 EC2에 올려 운영하고 있었다. 문제는 배포 방식이었다. 코드를 수정할 때마다 로컬에서 zip을 만들고, EC2에 SSH로 접속해서 압축을 풀고, 서비스를 재시작하는 과정을 손으로 반복했다. 배포할 파일을 빠뜨리거나, 이전 버전 파일이 남아 있는 상태에서 새 코드가 섞이는 일도 있었다.

이 문제를 세 가지로 나눠서 봤다.

1. 코드가 `main` 브랜치에 올라갔을 때, 의존성 설치와 기본 검증이 항상 같은 방식으로 돌아가야 한다
2. 배포할 아티팩트(zip)를 매번 사람이 만들지 않아도 돼야 한다
3. 실제 배포는 아무 때나 자동으로 나가면 안 되고, 내가 의도했을 때만 나가야 한다

이걸 Bitbucket Pipelines + AWS S3 + AWS CodeDeploy 조합으로 풀었다.

## 파이프라인 전체 구조

`bitbucket-pipelines.yml`은 `main` 브랜치에 대해 3개의 스텝으로 구성했다.

```yaml
image: python:3.12

options:
  max-time: 20

pipelines:
  branches:
    main:
      - step:
          name: Production
          caches:
            - pip
          script:
            - pip install -U pip
            - pip install --no-cache-dir -r ./Hotdeal/requirements.txt
            # - pytest -q

      - step:
          name: Build artifact (release.zip)
          caches:
            - pip
          script:
            - pip install -U pip
            - pip install --no-cache-dir -r ./Hotdeal/requirements.txt
            - apt-get update && apt-get install -y zip
            - zip -r release.zip . \
                -x "*.git*" \
                -x "venv/*" \
                -x "__pycache__/*" \
                -x ".pytest_cache/*" \
                -x ".idea/*" \
                -x ".vscode/*"
          artifacts:
            - release.zip

      - step:
          name: Deploy
          deployment: Production
          trigger: manual
          script:
            - apt-get update && apt-get install -y unzip curl
            - curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
            - unzip awscliv2.zip
            - ./aws/install

            - test -f release.zip

            - export FILE_NAME="release-${BITBUCKET_COMMIT}.zip"
            - export S3_KEY="${S3_PREFIX}/${FILE_NAME}"

            - aws s3 cp release.zip "s3://${S3_BUCKET}/${S3_KEY}"

            - echo "Uploaded to:"
            - echo "s3://${S3_BUCKET}/${S3_KEY}"

            - aws deploy create-deployment --application-name "system-operation" --deployment-group-name "system-operation-group" --s3-location bucket=${S3_BUCKET},key=${S3_KEY},bundleType=zip
```

각 스텝은 독립된 컨테이너에서 실행되기 때문에, `Production` 스텝에서 설치한 패키지가 `Build artifact` 스텝에 자동으로 넘어가지 않는다. 그래서 의존성 설치 명령을 스텝마다 다시 써야 했다. 대신 `caches: [pip]`를 각 스텝에 걸어서, pip 다운로드 캐시만큼은 스텝 간에 재사용되게 했다.

## 1단계 — Production: 검증 게이트

```yaml
- step:
    name: Production
    caches:
      - pip
    script:
      - pip install -U pip
      - pip install --no-cache-dir -r ./Hotdeal/requirements.txt
      # - pytest -q
```

이 스텝은 사실상 "의존성이 실제로 설치되는지" 확인하는 역할이다. `requirements.txt`에는 `google-cloud-bigquery`, `gspread`, `pandas`, `pandas-gbq` 같은 패키지가 섞여 있는데, 버전 충돌이 나면 여기서 바로 실패한다. `pytest -q`는 주석으로 남겨뒀다 — 아직 이 프로젝트에 테스트 코드가 없어서 활성화하지 못했고, 나중에 테스트를 추가하면 주석만 풀면 되도록 자리를 미리 잡아둔 것이다.

이 단계를 별도 스텝으로 뺀 이유는, 실패 지점을 명확히 구분하고 싶어서였다. 만약 검증과 빌드를 한 스텝에 합쳐두면 "의존성 설치가 실패한 건지, zip 압축이 실패한 건지"를 Bitbucket 콘솔에서 스텝 이름만 보고는 바로 알 수 없다.

## 2단계 — Build artifact: release.zip 생성

```yaml
- step:
    name: Build artifact (release.zip)
    caches:
      - pip
    script:
      - pip install -U pip
      - pip install --no-cache-dir -r ./Hotdeal/requirements.txt
      - apt-get update && apt-get install -y zip
      - zip -r release.zip . \
          -x "*.git*" \
          -x "venv/*" \
          -x "__pycache__/*" \
          -x ".pytest_cache/*" \
          -x ".idea/*" \
          -x ".vscode/*"
    artifacts:
      - release.zip
```

레포지토리 전체를 `zip -r`로 묶되, 배포에 필요 없는 것들은 `-x` 옵션으로 제외했다. `.git*`은 히스토리 전체가 딸려 들어가면 zip 용량만 커지고 EC2에서 쓸 일이 없어서 뺐고, `__pycache__`나 `.idea`, `.vscode`는 로컬 개발 환경 부산물이라 서버에 올라갈 이유가 없다.

여기서 중요한 설정이 `artifacts: [release.zip]`이다. Bitbucket Pipelines는 스텝이 끝나면 컨테이너를 버리기 때문에, 스텝 안에서 만든 파일은 기본적으로 다음 스텝에서 사라진다. `artifacts`로 명시한 파일만 다음 스텝으로 전달된다. 이걸 빠뜨리면 다음 Deploy 스텝에서 `test -f release.zip`이 실패하게 된다.

## 3단계 — Deploy: 수동 트리거 + S3 업로드 + CodeDeploy 호출

```yaml
- step:
    name: Deploy
    deployment: Production
    trigger: manual
    script:
      ...
```

이 스텝에서 가장 먼저 정한 건 `trigger: manual`이었다. `main`에 머지될 때마다 검증과 빌드까지는 자동으로 돌지만, 실제 운영 서버에 배포하는 것만큼은 Bitbucket 콘솔에서 내가 버튼을 눌러야 나가도록 막아뒀다. 배치 스크립트가 이메일 발송 같은 부수 효과를 가진 작업이라, 머지 타이밍과 배포 타이밍을 분리해두고 싶었다.

```bash
- export FILE_NAME="release-${BITBUCKET_COMMIT}.zip"
- export S3_KEY="${S3_PREFIX}/${FILE_NAME}"
- aws s3 cp release.zip "s3://${S3_BUCKET}/${S3_KEY}"
```

`BITBUCKET_COMMIT`은 Bitbucket이 파이프라인 실행마다 자동으로 주입하는 커밋 해시다. 이걸 파일명에 그대로 박아서 `release-<commit-hash>.zip` 형태로 S3에 올리도록 했다. 매번 같은 파일명(`release.zip`)으로 덮어쓰면 S3에 어떤 커밋이 실제로 배포됐는지 나중에 추적할 방법이 없어지기 때문이다. `S3_BUCKET`, `S3_PREFIX`는 Repository variables로 등록해뒀다 — 버킷 이름 같은 값을 yml 파일에 그대로 하드코딩하고 싶지 않았고, 나중에 버킷을 바꾸더라도 코드 수정 없이 변수 값만 바꾸면 되게 하려는 목적이다.

```bash
- aws deploy create-deployment --application-name "system-operation" --deployment-group-name "system-operation-group" --s3-location bucket=${S3_BUCKET},key=${S3_KEY},bundleType=zip
```

마지막 줄이 실제 배포를 일으키는 명령이다. S3에 올린 zip의 위치를 CodeDeploy에 알려주면, CodeDeploy가 그 zip을 내려받아 `appspec.yml`에 정의된 대로 EC2에 풀어준다.

```yaml
version: 0.0
os: linux

files:
  - source: /
    destination: /home/ec2-user/system-operation
    overwrite: yes
```

`appspec.yml`은 단순하다. zip 압축을 풀었을 때 루트(`/`)의 내용을 EC2의 `/home/ec2-user/system-operation` 경로에 그대로 덮어쓰라는 것만 정의돼 있다. `overwrite: yes`를 켜둬서 이전 배포로 남아있던 파일이 있어도 새 파일로 항상 갈아치워지게 했다 — 배포할 때마다 이전 버전 파일이 새 코드와 섞이는 문제를 여기서 원천적으로 막았다.

## AWS CLI를 매번 새로 설치하는 이유

Deploy 스텝을 보면 `curl`로 AWS CLI를 받아 매번 설치한다.

```bash
- curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
- unzip awscliv2.zip
- ./aws/install
```

`image: python:3.12` 베이스 이미지에는 AWS CLI가 기본으로 들어있지 않다. 대안으로 AWS CLI가 미리 설치된 별도 Docker 이미지를 스텝별로 쓰는 방법도 있었지만, 프로젝트 전체가 Python 배치 스크립트라 다른 스텝과 이미지를 통일해두는 편이 관리하기 단순했다. 그래서 이미지는 그대로 두고 Deploy 스텝 안에서 필요한 순간에만 설치하는 방식을 택했다. 매 배포마다 몇십 초씩 더 걸리긴 하지만, `trigger: manual`이라 자주 도는 스텝이 아니라서 감수할 만한 비용이라고 판단했다.

## 정리

- Bitbucket Pipelines의 각 스텝은 독립된 컨테이너라서, 스텝 간에 파일을 넘기려면 `artifacts`로 명시해야 하고 의존성 설치 같은 작업은 스텝마다 반복해서 써야 한다. `caches`는 이 반복 비용을 줄이기 위한 장치다.
- 자동으로 돌아도 되는 단계(검증, 빌드)와 사람이 판단해서 눌러야 하는 단계(운영 배포)를 같은 파이프라인 안에서도 `trigger: manual`로 분리할 수 있다.
- S3에 올리는 아티팩트 파일명에 `BITBUCKET_COMMIT`처럼 커밋을 식별할 수 있는 값을 넣어두면, 나중에 "지금 서버에 어느 커밋이 배포돼 있는지" 추적하기 쉬워진다.
- 버킷 이름, 경로 prefix처럼 환경에 따라 달라질 수 있는 값은 yml에 하드코딩하지 않고 Repository variables로 분리해두는 편이, 나중에 스테이징 환경을 추가하거나 버킷을 옮길 때 코드 변경 없이 대응할 수 있어 유리하다.
- CodeDeploy를 쓰면 EC2에서 파일을 어떻게 배치할지는 `appspec.yml` 한 곳에서 관리되므로, 배포 스크립트(`bitbucket-pipelines.yml`)와 배포 대상 서버의 파일 배치 규칙(`appspec.yml`)의 책임이 명확히 나뉜다.
