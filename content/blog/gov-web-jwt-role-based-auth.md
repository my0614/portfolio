---
title: "정부기관웹의 인증/인가 — 역할 4종을 하나의 JWT 체계로 묶기"
category: mlops
order: -33
excerpt: "보호자·어르신 본인·시설 담당자·최종관리자까지 성격이 다른 4종류의 로그인 주체가 하나의 백엔드를 공유하는 정부기관웹에서, 토큰 형식은 하나로 통일하고 actor_type 클레임과 FastAPI dependency로 주체를 구분한 구조를 정리합니다. 담당자 내부 권한을 스코프와 액션 권한으로 분리하고, 401 실패 원인을 코드로 세분화한 과정도 함께 다룹니다."
---

## 문제: 한 서비스 안에 완전히 다른 4종류의 로그인 주체가 있다

이 서비스는 어르신 개인, 그 어르신을 챙기는 가족 보호자, 요양원/복지관/지자체 담당자, 그리고 지자체를 관리하는 최종관리자까지 — 성격이 전혀 다른 4종류의 사용자가 같은 백엔드를 공유한다.

- **보호자(guardian)**: 자기가 등록한 어르신들만 볼 수 있어야 함
- **어르신 본인(user, B2C 자가등록)**: 자기 자신 데이터만
- **시설 담당자(staff)**: 자기 시설(또는 소속 지자체 산하 전체) 대상자만
- **정부기관웹 최종관리자(staff, SUPER_ADMIN)**: 전체 다 봐야 함

같은 "대상자(User) 정보 조회"라는 동작 하나에도 "누가 물어봤는가"에 따라 허용 범위가 완전히 달라진다. 이걸 엔드포인트마다 따로 인증 로직을 짜면 로그인 수단이 4개, 검증 로직이 4개, 거기다 스코프 계산까지 겹쳐서 유지보수가 급격히 어려워진다. 그래서 이 프로젝트는 **"토큰 종류는 하나(JWT), 그 안의 클레임으로 주체를 구분"**하는 방식으로 정리했다.

## 로그인 엔드포인트는 4개, 토큰 형식은 하나

```python
POST /auth/guardians/login   # 보호자
POST /auth/users/login       # 어르신 본인(B2C 자가등록)
POST /auth/staff/login       # 담당자·관리자 (전부 이거 하나로 로그인)
```

로그인 엔드포인트는 나뉘어 있지만, 토큰은 전부 `core/security.py`의 같은 `create_access_token()`으로 발급된다. 다른 건 **`sub`(토큰 주인의 UUID)와, 필요하면 붙는 `actor_type` 클레임**뿐이다.

```python
# 보호자/어르신 토큰 — actor_type 없음
token = create_access_token(guardian.guardian_id)

# 담당자 토큰 — actor_type="staff" 클레임 추가
token = create_access_token(staff.staff_id, extra_claims={"actor_type": "staff"})
```

토큰 자체는 "누가 만들었는지"만 담고, "그 UUID가 실제로 어느 테이블(guardians/users/staff) 소속인지"는 검증하는 쪽(FastAPI dependency)이 판단한다.

## FastAPI dependency 4종 — "이 엔드포인트는 누구를 받을 것인가"를 타입으로 명시

`domains/auth/dependencies.py`에 인증 진입점을 역할별로 나눠뒀다.

```python
async def get_current_guardian(...) -> GuardianModel:
    payload = _decode_or_raise(credentials)
    guardian = await get_guardian(session, UUID(payload["sub"]))
    if guardian is None:
        raise UnauthorizedError(..., code=CODE_TOKEN_INVALID)
    return guardian

async def get_current_user(...) -> UserModel:
    payload = _decode_or_raise(credentials)
    if payload.get("actor_type") != "user":
        raise UnauthorizedError("This token is not a user token", code=CODE_TOKEN_INVALID)
    ...

async def get_current_staff(...) -> StaffModel:
    payload = _decode_or_raise(credentials)
    if payload.get("actor_type") != "staff":
        raise UnauthorizedError(..., code=CODE_TOKEN_INVALID)
    ...
```

라우터는 자기가 받고 싶은 주체 타입을 그냥 타입 힌트로 선언하면 된다.

```python
@router.get("/gov/notices")
async def read_notices(
    current_staff: StaffModel = Depends(get_current_staff),
    ...
):
```

이렇게 하면 "이 엔드포인트가 누구를 대상으로 하는지"가 함수 시그니처만 봐도 드러난다 — 미들웨어 하나가 모든 토큰을 뭉뚱그려 검증하는 방식보다, 라우터마다 다른 dependency를 꽂는 방식이 "이 API는 보호자용인가 담당자용인가"를 코드 리뷰에서 바로 잡아낼 수 있게 해준다는 걸 이번에 체감했다.

## 두 주체를 동시에 받아야 하는 엔드포인트 — ElderAppCaller

문제가 하나 있었다. "어르신 사진 업로드" 같은 기능은 보호자 앱에서도, 자가등록한 어르신 본인 앱에서도, 시설 담당자(관리자 웹)에서도 전부 호출할 수 있어야 한다. `get_current_guardian`/`get_current_user`/`get_current_staff`를 그냥 다 붙이면 첫 번째 실패가 나머지 시도를 막아버린다(Depends 체이닝은 하나라도 실패하면 그대로 끝).

그래서 셋을 한 번에 받는 별도 dependency를 만들었다.

```python
@dataclass
class ElderAppCaller:
    guardian_id: UUID | None = None
    self_user_id: UUID | None = None
    staff: StaffModel | None = None

async def get_current_elder_app_caller(...) -> ElderAppCaller:
    payload = _decode_or_raise(credentials)
    if payload.get("actor_type") == "user":
        ...
        return ElderAppCaller(self_user_id=user.user_id)
    if payload.get("actor_type") == "staff":
        ...
        return ElderAppCaller(staff=staff)
    # 둘 다 아니면 보호자
    ...
    return ElderAppCaller(guardian_id=guardian.guardian_id)
```

토큰 디코드와 `actor_type` 분기를 이 함수 하나 안에서 직접 처리해서, 셋 중 실제로 이 토큰이 어떤 주체인지 판단한 다음 그 결과를 `ElderAppCaller`라는 "정확히 셋 중 하나만 채워지는" 값으로 돌려준다. 호출부(예: `meal/service.py`)는 `guardian_id`/`self_user_id`/`staff` 중 뭐가 채워졌는지로 소유권 검증 방식을 가른다.

```python
async def verify_owner_or_self(session, user_id, *, guardian_id, self_user_id):
    if self_user_id is not None:
        # 자가등록 본인 — user_id가 정확히 본인인지만 확인
        ...
    if guardian_id is not None:
        # 보호자 — 자기 소속 대상자인지 확인
        ...
```

## 담당자(staff) 내부의 권한 세분화 — AccessLevel과 3단계 스코프

여기까지는 "네 종류의 로그인 주체를 구분하는 문제"였고, 담당자(staff) 안에서는 또 한 겹의 권한 체계가 있다. `StaffModel.access_level`이 6개 값을 가진다.

```python
class AccessLevel(StrEnum):
    SUPER_ADMIN = "SUPER_ADMIN"                    # 전체
    MUNICIPALITY_ADMIN = "MUNICIPALITY_ADMIN"       # 지자체 산하 전체
    MUNICIPALITY_STAFF = "MUNICIPALITY_STAFF"       # 지자체 산하 전체
    MUNICIPALITY_NUTRITIONIST = "MUNICIPALITY_NUTRITIONIST"  # 지자체 산하 전체
    CARE_FACILITY_ADMIN = "CARE_FACILITY_ADMIN"     # 시설 하나
    CARE_FACILITY_NUTRITIONIST = "CARE_FACILITY_NUTRITIONIST"  # 시설 하나
```

이 6개가 실제로는 **3단계 스코프**로 묶인다.

```python
def _facility_ids_staff_can_target(staff, municipality_facility_ids):
    if staff.access_level == AccessLevel.SUPER_ADMIN:
        return None  # 무제한
    if staff.access_level in _MUNICIPALITY_SCOPED_ACCESS_LEVELS:
        return municipality_facility_ids or []  # 지자체 산하 전체
    return [staff.care_facility_id] if staff.care_facility_id else []  # 시설 하나
```

`None`이 "무제한", 빈 리스트가 "아무것도 못 봄"이라는 걸 명확히 구분해둔 게 포인트다. 지자체 스코프 계정인데 `municipality_facility_ids`가 안 들어왔으면(설정 누락 등) 조용히 `[]`로 떨어뜨려서 "전체 공개"가 아니라 "아무것도 안 보임" 쪽으로 fail-safe하게 만들었다 — 권한 계산에서 실패 시 기본값은 항상 더 좁은 쪽이어야 사고가 안 난다.

`GET /gov/notices`, `GET /gov/facility/wards` 같은 조회 엔드포인트는 전부 이 함수 하나(정확히는 비동기 버전 `facility_ids_staff_can_target_async`, 지자체 스코프일 때만 DB에서 산하 시설 id를 조회)를 거쳐서, 요청에 실린 값이 아니라 **로그인한 담당자의 실제 소속 기준으로** 강제한다.

```python
async def list_notices(session, *, acting_staff, facility_id=None):
    if acting_staff.access_level == AccessLevel.SUPER_ADMIN:
        effective_facility_ids = [facility_id] if facility_id is not None else None
    else:
        # 클라이언트가 뭘 보내든 무시하고 서버가 계산한 값으로 강제
        effective_facility_ids = await facility_ids_staff_can_target_async(session, acting_staff)
```

SUPER_ADMIN만 클라이언트가 보낸 `facility_id` 쿼리 파라미터를 신뢰하고, 나머지는 전부 서버가 계산한 값으로 덮어쓴다 — 그렇지 않으면 아무 담당자나 `facility_id` 파라미터만 바꿔서 남의 시설 공지를 조회할 수 있게 된다.

## 스코프(조회 범위)와 액션 권한(할 수 있는 일)은 다른 축이다

여기서 실수하기 쉬운 지점 하나. `CARE_FACILITY_ADMIN`과 `CARE_FACILITY_NUTRITIONIST`는 **스코프가 완전히 같다**(둘 다 `care_facility_id` 하나로 제한). 그런데 "새 대상자 등록"은 `CARE_FACILITY_ADMIN`만 되고 영양사는 안 된다.

```python
def _resolve_ward_creation_facility_id(staff: StaffModel) -> UUID:
    if staff.access_level == AccessLevel.CARE_FACILITY_ADMIN and staff.care_facility_id:
        return staff.care_facility_id
    raise ForbiddenError("This staff account cannot register wards directly")
```

스코프 계산 함수(`_facility_ids_staff_can_target`)를 그대로 재사용하지 않고, `access_level`을 직접 비교하는 별도 함수를 뒀다. "이 담당자가 이 시설 데이터를 볼 수 있는가"(스코프)와 "이 담당자가 이 액션을 할 수 있는가"(권한)를 같은 함수에서 같이 판단하려고 하면, 나중에 "조회는 되는데 등록은 안 되는" 새로운 조합이 생길 때마다 그 함수가 점점 복잡한 분기 덩어리가 된다. 둘을 처음부터 분리해두면 이런 조합이 늘어나도 각자 독립적으로 확장할 수 있다.

민감한 액션(관리자 계정 발급, 회원가입 승인)은 아예 라우터 레벨의 별도 dependency로 막았다.

```python
@router.post("/api/admin/staff")
async def create_staff(
    body: IssueManagerAccountRequest,
    _admin: StaffModel = Depends(require_super_admin),
    ...
):

@router.patch("/api/signup/requests/{request_id}")
async def review_signup_request(
    ...,
    current_staff: StaffModel = Depends(require_super_admin_or_municipality_admin),
    ...
):
```

스코프 필터링(서비스 계층에서 조용히 결과를 좁힘)과 액션 차단(라우터 레벨에서 아예 403)을 다른 층에 둔 것도 의도적이다 — "너는 이 데이터 중 일부만 볼 수 있어"와 "너는 이 버튼 자체를 누를 수 없어"는 실패했을 때 사용자에게 보여줘야 하는 메시지도, 코드에서 처리해야 하는 위치도 다르다.

## 토큰 만료를 세분화해서 프론트의 오탐을 막았다

401을 받았을 때 프론트가 무조건 로그아웃시키면, "토큰이 없어서"(비로그인 상태로 원래 그런 것)와 "토큰이 진짜 만료돼서"(재로그인 필요)를 구분 못 하고 과잉 반응하게 된다. 그래서 401에 기계가 읽을 수 있는 `code`를 실어 보낸다.

```python
CODE_MISSING_TOKEN = "missing_token"   # 토큰 자체가 없음 — 비로그인 상태일 수 있음
CODE_TOKEN_EXPIRED = "token_expired"   # 진짜 만료 — 재로그인 안내가 맞음
CODE_TOKEN_INVALID = "token_invalid"   # 서명 불일치/역할 불일치/계정 삭제 등 — 재로그인해도 절대 성공 못 함
```

`missing_token`은 재로그인 안내 대상에서 제외한다 — Authorization 헤더가 아예 없는 건 애초에 로그인한 적 없는 방문일 수도 있어서, 거기에 "로그인 기간이 만료됐습니다"라고 띄우면 오히려 이상하다. 반대로 `token_invalid`(예: 다른 역할의 토큰으로 잘못 호출한 경우, 서명 자체가 안 맞는 경우)와 `token_expired`는 둘 다 "이 세션으로는 절대 다시 성공할 수 없다"는 공통점이 있어서 같이 재로그인 유도 대상으로 묶었다.

## 구조를 정리하며 짚어볼 점

- **"주체가 누구인가"와 "그 주체가 뭘 할 수 있는가"를 한 함수에 몰아넣지 않는 게 확장성의 핵심이었다.** dependency 층(누구인가) → 스코프 계산(뭘 볼 수 있는가) → 액션 가드(뭘 할 수 있는가), 이렇게 세 층으로 나눠두니 새 역할(`CARE_FACILITY_NUTRITIONIST`)을 추가할 때도 "스코프는 기존 걸 그대로 타되, 특정 액션 몇 개만 막는다"는 식으로 국소적인 수정만으로 끝났다.
- **권한 계산 실패의 기본값은 항상 "더 좁은 쪽"이어야 한다.** `municipality_facility_ids`가 안 들어왔을 때 `[]`(아무 것도 못 봄)로 떨어지게 한 게 그 예다 — 설정 누락 같은 예상 못 한 상황에서 "전체 공개"로 새는 것보다 "아무것도 안 보임"으로 막히는 게 훨씬 안전한 실패 방식이다.
- **토큰 검증 실패를 뭉뚱그리지 않고 원인별 코드로 나누면, 백엔드가 프론트의 UX 판단까지 도와줄 수 있다.** "재로그인이 필요한 상황"과 "애초에 로그인 안 한 상황"을 프론트가 구분 못 하면 무해한 방문자를 오히려 헷갈리게 만드는데, 이건 프론트만 잘 짠다고 해결되는 문제가 아니라 백엔드가 애초에 그 정보를 안 줘서 생기는 구조적 한계였다.
- **여러 로그인 수단을 받아야 하는 엔드포인트는 Depends를 여러 개 이어붙이지 말고, 하나의 dependency 안에서 직접 분기해야 한다.** FastAPI의 Depends 체이닝은 "첫 실패가 나머지 시도를 막는" 구조라, "이것도 되고 저것도 되고"가 필요한 지점에는 안 맞는다.

## 정리

- 로그인 수단은 역할별로 나누되(`/auth/guardians/login`, `/auth/users/login`, `/auth/staff/login`), 토큰 형식은 하나로 통일하고 `actor_type` 클레임으로만 구분했다.
- 라우터는 자기가 받을 주체 타입을 FastAPI dependency 타입으로 명시해서, 함수 시그니처만 봐도 "이 API는 누구를 위한 것인가"가 드러나게 했다.
- 여러 주체를 동시에 받아야 하는 엔드포인트는 별도의 통합 dependency(`ElderAppCaller`)로 분기 로직 자체를 한곳에 모았다.
- 담당자(staff) 내부 권한은 "스코프(어디까지 보이는가)"와 "액션 권한(뭘 할 수 있는가)"을 처음부터 다른 축으로 분리해서, 같은 스코프를 가진 두 역할이 서로 다른 액션 권한을 가지는 경우(`CARE_FACILITY_ADMIN` vs `CARE_FACILITY_NUTRITIONIST`)에도 국소적인 수정만으로 대응할 수 있었다.
- 401 응답에 실패 원인을 코드로 실어서, 프론트가 "비로그인"과 "세션 만료"를 구분해 사용자에게 다른 안내를 보여줄 수 있게 했다.
