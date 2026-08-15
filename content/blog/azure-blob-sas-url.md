---
title: "SAS URL이란 무엇이고, 계정 키 대신 왜 써야 할까"
category: mlops
order: -32
excerpt: "Azure Blob Storage의 SAS URL이 계정 키와 어떻게 다르고 어떤 원리로 접근을 제한하는지, 그리고 외부 팀이 운영하는 GPU 추론 서버에 사진을 넘겨야 하는 상황에서 왜 계정 키 대신 이 방식을 택했는지 정리합니다."
---

## 문제: 다른 팀이 관리하는 서버에게 우리 스토리지를 얼마나 믿고 열어줘야 하나

식전/식후 사진으로 잔반율을 계산하는 기능을 만들면서, 실제 추론(YOLO 모델)은 우리 백엔드가 아니라 별도로 띄운 GPU 서버가 담당하게 설계했다. 백엔드는 사진을 Azure Blob Storage에 올려두고, GPU 서버에게 "이 사진 보고 분석해줘"라고 요청만 넘긴다.

여기서 바로 막힌 지점이 하나 있었다. GPU 서버가 실제로 사진을 "보려면" 어떻게든 Blob Storage에서 그 파일을 받아와야 하는데, 처음 짜둔 코드에는 이렇게 적혀 있었다.

```python
"""
가정한 계약(GPU_SERVER_HOST 확정되면 GPU 팀과 재검증 필요):
- 요청 바디: {"meal_id", "before_image_url": "<blob 경로>", "after_image_url": "<blob 경로>"}
  이미지는 Blob Storage 컨테이너 안의 상대 경로 그대로 넘긴다. GPU 서버가 같은
  스토리지 계정에 직접 접근 가능하다고 가정했다 — 접근 불가하면 SAS URL을 발급해서
  넘기는 단계가 이 함수 안에 추가로 필요하다.
"""
```

"직접 접근 가능하다고 가정"이라는 말은 결국 GPU 서버 쪽에도 우리 스토리지 계정 키(account key)를 나눠줘야 한다는 뜻이었다. 근데 이 GPU 서버는:

- 우리가 아니라 다른 사람이 별도 VM(Azure, 공인 IP)에 직접 띄우고 운영한다
- 인바운드 포트를 인터넷에 열어야 우리 백엔드가 접근할 수 있다 — 열자마자 몇 분 안에 전 세계 자동 스캐너가 알려진 취약한 관리자 패널 경로(`/pluginManager/api/json`, `/psp/ps/?cmd=login` 같은 것들)를 무작위로 찔러보는 걸 실제로 로그에서 확인했다

이런 조건에서 스토리지 계정 키(우리 파일 전체에 대한 읽기/쓰기 권한)를 그 서버에 심어두는 건, 그 서버 하나가 뚫리는 순간 우리 스토리지 전체가 같이 위험해진다는 뜻이다. 코드 주석에 이미 스스로 "SAS URL을 발급해서 넘기는 단계가 필요하다"라고 적어뒀던 걸 실제로 구현하기로 했다.

## SAS(Shared Access Signature)가 뭔가

계정 키를 통째로 주는 대신, **"이 파일 하나만, 이 권한만, 이 시간까지만" 열람 가능한 서명된 URL**을 매 요청마다 새로 만들어서 넘기는 방식이다. 실제로 만들어지는 URL은 이런 모양이다.

```
https://grandfoodstorage01.blob.core.windows.net/grandfood-files/gov/before/xxx.jpg
  ?se=2026-08-15T02%3A27%3A13Z
  &sp=r
  &sv=2026-06-06
  &sr=b
  &sig=bJqQW06JV6fqFC2406whsbRB%2BxKNfbU%2BseX6F6rgRSA%3D
```

앞부분은 그냥 평범한 blob 경로고, `?` 뒤 쿼리 파라미터가 실제 접근 제어다.

| 파라미터 | 의미 |
|---|---|
| `sr=b` | 대상 리소스 종류 — blob 하나 (컨테이너 전체가 아니라 이 파일 하나) |
| `sp=r` | 권한 — read만, 쓰기·삭제 불가 |
| `se=...` | 만료 시각 — 지나면 URL 자체가 무효 |
| `sv=...` | 이 서명이 따르는 Storage API 버전 |
| `sig=...` | 서명값 |

`sig`가 실제 접근 제어를 담당한다. 백엔드가 `sr`/`sp`/`se`/`sv`/파일경로를 이어붙인 문자열을 스토리지 계정 키로 HMAC-SHA256 서명해서 만든 값이고, Azure Blob 서비스는 요청이 들어오면 같은 조건으로 자기도 서명을 다시 계산해서 비교한다. 계정 키를 아는 쪽(우리 백엔드와 Azure 자신)만 유효한 `sig`를 만들 수 있어서, URL을 손에 넣은 쪽이 만료시각을 늘리거나 다른 파일 경로로 바꿔치기하는 건 불가능하다 — 파라미터 하나만 손대도 서명이 안 맞아 `403`으로 거부된다.

이 방식의 핵심은 **인증 정보 자체가 URL 안에 이미 들어있다**는 점이다. 받는 쪽(GPU 서버)은 Azure SDK도, 계정 키도, Authorization 헤더도 필요 없이 그냥 `requests.get(url)` 한 줄이면 끝난다.

## 구현

`generate_blob_sas`(azure-storage-blob SDK)로 서명을 만들고, 완성된 URL을 조립하는 함수 하나를 blob 업로드 모듈에 추가했다.

```python
_INFERENCE_SAS_URL_EXPIRY = timedelta(minutes=30)


def generate_read_sas_url(blob_name: str) -> str:
    settings = get_settings()
    sas_token = generate_blob_sas(
        account_name=settings.azure_storage_account_name,
        container_name=settings.azure_storage_container_name,
        blob_name=blob_name,
        account_key=settings.azure_storage_account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.now(UTC) + _INFERENCE_SAS_URL_EXPIRY,
    )
    return (
        f"{settings.azure_storage_endpoint.rstrip('/')}/"
        f"{settings.azure_storage_container_name}/{blob_name}?{sas_token}"
    )
```

그리고 GPU 서버 호출 직전에, 사진이 업로드될 때 받아둔 blob 상대경로(예: `gov/before/{ward_id}_{meal_id}.jpg`)를 이 함수로 SAS URL로 바꿔서 요청 바디에 실었다.

```python
before_sas_url = generate_read_sas_url(before_image_url)
after_sas_url = generate_read_sas_url(after_image_url)

async with httpx.AsyncClient(timeout=settings.gpu_server_timeout_seconds) as client:
    response = await client.post(
        url,
        json={
            "meal_id": str(meal_id),
            "before_image_url": before_sas_url,
            "after_image_url": after_sas_url,
        },
    )
```

`generate_blob_sas`는 네트워크 호출이 아니라 순수 로컬 서명 계산(HMAC)이라, `await`나 스레드풀로 감쌀 필요 없이 그냥 동기 함수로 불러도 이벤트 루프를 막지 않는다.

실패 처리는 기존 GPU 서버 호출 실패 처리와 똑같이 갔다. 잔반 분석은 백그라운드 작업으로 도는데, SAS 발급이 실패하든(스토리지 설정 누락 등) GPU 서버가 응답을 안 하든 사용자에게 노출되면 안 되는 실패라는 점은 같기 때문이다.

```python
try:
    before_sas_url = generate_read_sas_url(before_image_url)
    after_sas_url = generate_read_sas_url(after_image_url)
    async with httpx.AsyncClient(...) as client:
        response = await client.post(...)
        ...
except Exception as exc:
    logger.error("GPU 잔반 분석 요청 실패 meal_id=%s url=%s: %s", meal_id, url, exc)
    return []
```

## 구조를 정리하며 짚어볼 점

- **만료 시간은 "얼마나 오래 유효해야 하는가"가 아니라 "유출됐을 때 얼마나 오래 위험한가"로 정해야 한다.** 잔반 분석 자체는 몇 초~몇십 초면 끝나는 일회성 작업이라, 만료를 30분으로 짧게 잡았다. 같은 코드베이스에 이미 있던 TTS 음성 파일용 SAS(2시간)와 비교해보면, "얼마나 오래 살려둬야 편한가"가 아니라 "이 링크가 새어나갔을 때 노출 창을 얼마나 좁힐 수 있는가"가 만료 시간을 정하는 기준이어야 한다는 걸 다시 확인했다.
- **SAS는 "계정 키를 아예 안 준다"이지 "접근을 완전히 막는다"가 아니다.** URL 자체가 유출되면(로그에 찍히거나, 중간에 가로채이거나) 그 시간 안에는 누구든 그 파일 하나는 읽을 수 있다. 다만 계정 키 유출과 비교하면 피해 범위가 "파일 하나, 읽기만, N분 동안"으로 확 줄어든다는 게 이 방식이 주는 이득이다. "완전히 안전"이 아니라 "블라스트 레이디어스를 최소화"가 목표라는 걸 분명히 하고 접근해야 한다.
- **네트워크 레벨 제한(발신지 IP 제한)과는 목적이 다르다.** GPU 서버 포트를 열 때 "특정 IP만 허용"하는 방법도 같이 검토했는데, 우리 백엔드가 고정 아웃바운드 IP가 없는 서버리스/컨테이너 환경이라 이 방법 자체가 불가능했다. SAS URL은 그 대안이 아니라, IP 제한이 아예 안 되는 상황에서 "그래도 진짜 위험한 자산(계정 키)만은 절대 넘기지 말자"는 별도의 방어선이다. 둘 다 됐으면 당연히 같이 걸었을 것이다.
- **account key 기반 SAS는 계정 키가 로테이션되기 전까진 계속 같은 키로 서명된다.** 지금 쓴 `generate_blob_sas(..., account_key=...)` 방식은 구현이 간단한 대신, 계정 키 자체가 유출되면 이미 발급된 모든 SAS도 같이 무효화해야 하는 부담이 있다. Azure AD 토큰으로 서명하는 "user delegation SAS"가 더 안전한 대안으로 꼽히는데, 지금 규모에선 오버엔지니어링이라 보류했다 — 나중에 관리 부담이 커지면 넘어갈 지점으로 남겨둔다.

## 정리

- 다른 팀/다른 머신이 관리하는 서버에 우리 스토리지 파일을 보여줘야 할 때, 계정 키를 공유하는 대신 SAS URL로 "이 파일 하나만, 이 권한만, 이 시간까지만" 열어주는 게 원칙적인 접근이다.
- SAS URL은 인증 정보(서명)가 URL 자체에 담겨 있어서, 받는 쪽은 Azure SDK나 자격증명 없이 평범한 HTTP GET 한 줄로 충분하다.
- 서명은 계정 키로 만든 HMAC이라 파라미터(경로/권한/만료시각) 중 하나라도 바뀌면 무효가 된다 — URL을 손에 넣어도 조건을 벗어난 접근은 불가능하다.
- 만료 시간은 "편의"가 아니라 "유출 시 노출 창"을 기준으로 짧게 잡는다.
- SAS는 계정 키 유출을 막는 방어선이지, 네트워크 레벨 접근 제어(IP 화이트리스트 등)를 대체하지 않는다 — 가능하면 같이 쓰는 게 맞고, 안 되는 상황이라면 SAS라도 반드시 넣어야 한다.
