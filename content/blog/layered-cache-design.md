---
title: "캐시를 세 겹으로 나눴다"
category: mlops
date: "2026-07-16"
order: 0
excerpt: "LLM 호출·Redis·영구 DB를 원본까지의 거리로 나눈 L1/L2/L3 캐시 설계와, 계층을 나눠도 원본 로직이 여러 진입점에 흩어져 있으면 반쪽짜리라는 걸 깨달은 과정을 코드와 함께 정리합니다."
---

## Redis 하나로는 안 되는 것들

의약품 복약 관리 앱을 만들면서 캐시가 필요한 지점이 꽤 여러 군데 생겼다. 건강 위험 요소에 대한 LLM 조언 생성, 기상청·에어코리아 공공데이터 조회, 그리고 자체적으로 계산하는 건강 지수 — 이 세 가지를 처음엔 다 똑같이 "Redis에 넣고 TTL 걸기"로 처리했는데, 곧 이 방식만으로는 부족한 지점들이 보였다.

- LLM 호출(gpt-4.1-nano로 건강 팁 생성)은 비싸고 느리다. 같은 위험 요소 라벨이 여러 유저에게 반복 노출되면서 같은 키가 초 단위로 몰려 조회되는 구간이 있었는데, 그 정도로 자주 반복된다면 매번 Redis까지 왕복하는 것도 아깝다. Redis를 버리자는 게 아니라 그 위에 프로세스 내 로컬 캐시를 한 겹 더 얹어서, 초 단위로 반복되는 요청만 더 앞에서 걸러내고 싶었다. 반대로 같은 키가 그 정도로 자주 반복 조회되지 않는다면 Redis 단독으로도 충분하다.
- 건강 지수는 "하루 1회 생성, 이후 변경 없음"이라는 요구사항이 있다. Redis의 TTL이 자정에 만료돼서 키가 사라지는 것 자체는 정상 동작이다. 진짜 문제는 그 이후였다 — 키가 사라진 자리를 다시 채워줄 원본이 없었다는 것. 필요했던 건 TTL을 없애는 게 아니라, 그 기록을 보존하는 DB(source of truth)를 따로 두고 Redis는 그 위에서 빠르게 읽는 캐시로만 남겨두는 것이었다. Redis 키가 만료되거나 장애로 비어 있어도 DB에서 다시 읽어 채우면 된다.
- 날씨/미세먼지처럼 외부 API가 자주 갱신하는 데이터와, 질병 정보처럼 거의 안 바뀌는 정적 데이터도 똑같이 Redis를 쓰는 건 맞지만, 같은 TTL로 묶어두는 건 낭비였다. 자주 바뀌는 데이터는 짧게, 거의 안 바뀌는 데이터는 길게 — 데이터 성격별로 TTL을 차등화해야 했다.

즉 "같은 키가 얼마나 자주 반복 조회되는가(로컬 캐시가 의미 있는가)", "TTL이 끝난 뒤 되살릴 원본이 따로 있는가(DB가 필요한가)", "값이 얼마나 자주 바뀌는가(TTL을 얼마로 잡아야 하는가)" — 이 세 축이 데이터마다 다 다른데, 캐시 방식을 하나로 통일하면 어떤 데이터는 과보호되고 어떤 데이터는 계속 원본을 두들기게 된다.

## 캐시 계층을 원본까지의 거리로 나누기

가장 비용이 큰 자원(LLM 호출)부터 손을 댔다. app/external/llm/tips.py에 건강 팁 생성 함수를 만들면서 캐시를 세 겹으로 쌓았다.

```python
# app/external/llm/tips.py
_mem: dict[str, tuple[str, float]] = {}
_MEM_TTL = 6 * 3600  # 6시간

def _key(label: str, factor_type: str) -> str:
    raw = f"{label}|{factor_type}"
    return "tip:" + hashlib.sha256(raw.encode()).hexdigest()[:20]

async def generate_factor_tip(label: str, factor_type: str) -> str | None:
    """
    캐시 순서: L1 메모리(6h) → L2 Redis(자정까지) → L3 OpenAI gpt-4.1-nano
    LLM 호출 실패 시 None 반환 (caller가 fallback 처리).
    """
    key = _key(label, factor_type)
    now = time.monotonic()

    # L1: 메모리
    if key in _mem:
        tip, ts = _mem[key]
        if now - ts < _MEM_TTL:
            return tip

    # L2: Redis
    try:
        cached = await get_redis().get(key)
        if cached:
            _mem[key] = (cached, now)
            return cached
    except Exception:
        pass

    # L3: OpenAI
    ...
```

세 계층은 각각 원본(LLM 호출)까지의 "거리"가 다르다.

1. **L1 — 프로세스 메모리**: 네트워크 왕복이 0이다. 대신 워커가 재시작되면 사라진다는 한계는 있지만, 이 프로젝트는 단일 워커로 운영되기 때문에 여러 워커 사이에 캐시가 따로 노는 문제는 애초에 발생하지 않는다. 같은 요청이 짧은 시간에 몰릴 때(같은 위험 요소 라벨이 여러 유저에게 반복 노출될 때) 가장 싼 계층에서 끝낼 수 있다는 이득이 컸다.
2. **L2 — Redis**: 프로세스가 재시작돼도 살아남는다. 대신 네트워크 왕복이 붙는다.
3. **L3 — OpenAI 호출**: 실제 비용과 레이턴시가 발생하는 원본. 앞의 두 계층이 실패했을 때만 여기까지 온다.

키를 label|factor_type을 그대로 쓰지 않고 sha256 해시로 20자만 잘라 쓴 것도 의도적인 선택이다. Redis 키에 사용자가 쓴 원문이나 민감한 라벨이 그대로 노출되지 않게 하면서, 키 길이도 일정하게 유지된다.

## 도메인마다 다른 TTL

LLM 호출 말고 다른 도메인들도 전부 Redis를 거치지만, TTL은 데이터 변동성에 맞춰 제각각이다. 공통 헬퍼는 app/core/redis.py에 두고, TTL만 도메인별로 다르게 넘긴다.

```python
# app/core/redis.py
async def get_cache(key: str) -> dict | None:
    try:
        data = await get_redis().get(key)
        return json.loads(data) if data else None
    except Exception:
        return None

async def set_cache(key: str, value: dict, ttl: int | None = None) -> None:
    try:
        ttl = ttl if ttl is not None else seconds_until_midnight()
        await get_redis().setex(key, ttl, json.dumps(value, ensure_ascii=False))
    except Exception:
        pass
```

| 도메인 | TTL | 근거 |
|---|---|---|
| 날씨 / 미세먼지 | 1800초(30분) | 공공 API 갱신 주기 |
| 병원 목록·검색 | 3600초(1시간) | 준정적 데이터 |
| 질병 정보 | 86400초(24시간) | 거의 안 바뀌는 데이터 |
| 건강 지수 / 오늘의 추천 | 자정까지 | "하루 1회 생성" 스펙 |

모든 라우터가 get_cache/set_cache를 그대로 재사용하고, 각자 자기 도메인에 맞는 TTL 값 하나만 정해서 넘긴다. 캐시 읽기·쓰기 로직을 중복 구현하지 않고, "이 데이터는 얼마나 오래 믿어도 되는가"라는 판단만 도메인 코드에 남겨둔 셈이다.

여기서 눈여겨볼 부분은 get_cache/set_cache 둘 다 예외를 그냥 삼킨다는 점이다. Redis가 죽어도 get_cache는 조용히 None을 반환하고, set_cache는 조용히 쓰기를 포기한다. 캐시 계층 전체가 **fail-open**으로 설계돼 있어서, Redis 장애가 곧바로 서비스 장애로 번지지 않고 "이번 요청만 원본을 다시 조회하느라 느려지는" 정도로 그친다.

## 휘발성 Redis 위에 영속 DB 얹기

건강 지수는 세 계층 패턴과는 조금 다른 문제였다. "빠른 조회"뿐 아니라 "자정이 지나도 그날의 기록 자체는 영구히 남아야 한다"는 요구가 있었기 때문에, Redis 하나로는 부족했다.

```python
# app/external/health_index/router.py
redis_key = health_index_key(user_id, target_date)
cached = await get_cache(redis_key)
if cached:
    return {**cached, "is_from_cache": True, "cache_source": "redis"}

cache_row = await db.execute(
    select(HealthIndexCache).where(HealthIndexCache.user_id == uid, HealthIndexCache.date == target_date)
)
cache = cache_row.scalar_one_or_none()
if cache:
    await set_cache(redis_key, cache.payload)
    return {**cache.payload, "is_from_cache": True, "cache_source": "db"}
```

Redis는 "자정까지만 유효한 빠른 응답용 캐시"고, Postgres의 HealthIndexCache((user_id, date) 유니크 제약)가 진짜 원본 기록이다. Redis에서 미스가 나도 DB에 있으면 그 값을 다시 Redis에 채워 넣는(cache warming) 흐름까지 넣어서, "휘발돼도 되는 캐시"와 "영구히 남아야 하는 기록"을 처음부터 다른 저장소로 분리했다. TTL로 신선도를 관리하는 계층과, 유니크 제약으로 정합성을 관리하는 계층을 섞지 않은 게 핵심이다.

## 이 방식의 장단점

### 장점

- 비용이 큰 자원(LLM 호출)일수록 더 앞 단계에서 걸러지도록 계층을 쌓아서, 실제 원본 호출 빈도를 눈에 띄게 줄일 수 있었다.
- Redis 장애가 서비스 전체 장애로 번지지 않는다. get_cache/set_cache가 예외를 삼키는 덕분에 캐시는 있으면 좋고 없으면 조금 느려지는 정도로만 영향을 준다.
- 도메인 코드는 캐시 읽기/쓰기 로직을 직접 구현할 필요 없이 TTL 값만 정하면 된다.

### 한계

- **무효화 로직이 아예 없다.** 코드 전체에서 redis().delete()를 호출하는 곳이 한 군데도 없다. 전적으로 TTL 만료에만 의존한다. 병원·질병 정보처럼 원본이 갱신돼도 TTL이 끝날 때까지는 stale한 값을 계속 서빙한다.
- **check-then-act 레이스 컨디션이 남아있다.** 건강 지수의 "Redis 확인 → DB 확인 → 계산 → 저장" 흐름 사이에 락이 없어서, 동시에 같은 유저 요청이 두 번 들어오면 둘 다 캐시 미스를 보고 둘 다 계산 후 DB에 쓰려다 유니크 제약 위반으로 예외가 날 수 있는 지점이 그대로 있다.
- L1(프로세스 메모리)은 워커가 재시작되면 그대로 사라진다.

## 캐시는 나눴는데 원본 로직은 안 나눠져 있었다

캐시 계층 자체는 이렇게 정리했지만, 실제로 골치 아팠던 건 계층 설계가 아니라 **그 계층이 감싸고 있는 원본 로직이 여러 진입점에 중복돼 있다는 점**이었다. 건강 지수를 계산하는 코드가 REST 라우터(app/external/health_index/router.py), MCP 서버(health_index/server.py), 그리고 LLM 추천 라우터(app/external/openai/router.py의 ai_chat_today) 세 곳에 거의 그대로 복붙돼 있다.

```python
# app/external/openai/router.py — ai_chat_today 내부
health_index_cache_key = health_index_key(user_id, today)
index_data = await get_cache(health_index_cache_key)

if not index_data:
    cache_row = await db.execute(
        select(HealthIndexCache).where(HealthIndexCache.user_id == uid, HealthIndexCache.date == today)
    )
    cache = cache_row.scalar_one_or_none()
    if cache:
        index_data = cache.payload
        await set_cache(health_index_cache_key, index_data)
    else:
        # 여기서 계산 로직이 REST 라우터와 거의 동일하게 한 번 더 반복된다
        ...
```

캐시 키(health_index_key)와 저장소(Redis + DB)는 공유하고 있으니 "같은 데이터를 가리키는 캐시"라는 정합성은 유지되지만, 캐시가 미스났을 때 "원본을 어떻게 다시 만들어내는가"는 세 곳에서 각자 다시 짜여 있다. 계산식이 하나라도 바뀌면 세 곳을 전부 찾아 고쳐야 하고, 셋 중 하나만 고치고 넘어가면 캐시가 비어있는 순간 진입점에 따라 다른 값이 나올 수 있는 여지가 생긴다.

여기서 얻은 교훈은, 캐시 계층 설계는 "언제 원본을 다시 부를 것인가"를 결정할 뿐이지 "원본을 어떻게 만들 것인가"까지 대신 정리해주지 않는다는 것이다. 캐시 히트율을 아무리 잘 설계해도, 미스가 났을 때 실행되는 원본 로직이 여러 진입점에 흩어져 있으면 그 순간부터 캐시는 "일관된 데이터를 빠르게 주는 장치"가 아니라 "진입점마다 조금씩 다를 수 있는 값을 우연히 같은 키로 저장하는 장치"가 돼버린다.

## 정리

- 캐시를 하나의 방식으로 통일하지 말고, 데이터마다 "연산 비용", "변동 주기", "영속 보존 필요 여부"를 따져 계층을 나누는 게 낭비와 손실을 동시에 줄인다.
- L1(프로세스 메모리)은 공짜지만 워커가 재시작되면 사라진다는 한계를 감안하고 써야 한다.
- 캐시 헬퍼는 예외를 삼켜 fail-open으로 만들어야, 캐시 저장소 장애가 서비스 장애로 번지지 않는다.
- "휘발돼도 되는 캐시"와 "영구히 남아야 하는 기록"이 섞여 있는 데이터는 아예 다른 저장소로 분리하고, Redis는 그 위에 얹는 가속 계층으로만 써야 한다.
- TTL만으로 신선도를 관리하면 원본이 갱신되는 이벤트에 대응하는 무효화 로직은 결국 따로 필요하다.
- 캐시 계층을 아무리 잘 나눠도, 캐시 미스 시 실행되는 원본 로직 자체가 여러 진입점에 중복돼 있으면 계층 설계의 이점이 반감된다 — 계층을 나눈 다음 과제는 원본 계산 로직을 하나로 모으는 것이다.
