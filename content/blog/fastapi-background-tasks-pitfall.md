---
title: "반찬 추천 한 달치가 왜 매번 4분 넘게 걸렸을까"
category: mlops
order: -31
excerpt: "FastAPI BackgroundTasks를 반복문 안에서 여러 번 호출했더니 5주치 백그라운드 작업이 병렬이 아니라 순차로 돌고 있었다. Starlette 소스를 열어 원인을 확인하고, asyncio.gather로 묶어 4분 25초를 62초로 줄인 과정을 정리합니다."
---

코드는 분명 "백그라운드로 5주를 동시에 돌린다"고 짜여 있었다. 그런데 실제로는 한 주씩, 순서대로, 착실히 기다렸다가 다음 주로 넘어가고 있었다.

GrandFood는 거동이 불편한 어르신에게 배송되는 반찬을 AI가 건강 상태에 맞춰 추천하는 서비스다. 한 주치 추천을 만들려면 Azure OpenAI에 반찬 후보 목록과 건강 프로필을 보내 적합도를 판단시키는 LLM 호출이 한 번 낀다 — 이게 대략 50~60초 걸린다. 그래서 한 달(보통 4~5주)치를 한 번에 요청하면 응답이 오기까지 그만큼 오래 기다려야 한다는 건 다들 알고 있었다. 문제는 그 "오래"가 이상하게 길었다는 점이다. 5주면 대략 한 번 호출 시간(60초) 정도만 더 걸릴 거라 예상했는데, 실측해보니 **4분 25초**가 나왔다. 고친 뒤에는 **62초**로 줄었다.

## 증상: 로그를 보니 소름 돋게 규칙적이었다

"왜 이렇게 오래 걸리지?"라는 질문에서 시작해 실제 요청을 날려보고 서버 로그의 타임스탬프를 그대로 뽑아봤다. 결과가 너무 깔끔했다.

| 주차 | 시작 후 경과 | 이 주만의 소요시간 |
|---|---|---|
| 1주차 | 0:53 | 53초 |
| 2주차 | 1:45 | 52초 |
| 3주차 | 2:42 | 57초 |
| 4주차 | 3:35 | 53초 |
| 5주차 | 4:25 | 50초 |

한 주가 끝나야 다음 주가 시작하는, 교과서적인 직렬 처리 패턴이었다. 코드에는 분명 이렇게 쓰여 있었는데도 말이다.

```python
# health/service.py — 고치기 전
for week_start_date in weeks_to_generate:
    background_tasks.add_task(_generate_week_in_background, user_id, week_start_date)
```

`add_task`를 다섯 번 부르는 코드다. "다섯 개의 작업을 백그라운드에 던져둔다"는 의도가 이름에서부터 뻔히 보인다. 그런데 FastAPI(정확히는 그 아래의 Starlette)의 `BackgroundTasks`가 실제로 하는 일은 그게 아니었다.

## 범인: BackgroundTasks는 큐가 아니라 리스트다

Starlette 소스를 열어보면 `BackgroundTasks.__call__`의 구현은 이게 전부다.

```python
async def __call__(self) -> None:
    for task in self.tasks:
        await task()
```

이름과 달리 동시성이 전혀 없다. 응답을 보낸 뒤 등록된 작업을 **하나씩 순서대로 await**한다. 두 번째 작업은 첫 번째 작업의 `await`가 완전히 끝나야 시작된다 — 정확히 로그에서 본 그 패턴이다. `add_task`라는 이름이 "태스크 풀에 던져 넣고 병렬로 처리한다"는 인상을 주지만, 실제로는 "응답 뒤에 순서대로 실행할 콜백 목록에 추가한다"에 가깝다. 하나만 걸면 아무 문제가 없다. 문제는 같은 요청 처리 중에 여러 번 거는 순간부터다.

> FastAPI 문서의 `BackgroundTasks` 예제도 전부 "요청 하나당 백그라운드 작업 하나"만 보여준다. 반복문 안에서 `add_task`를 여러 번 부르는 패턴은 코드만 봐서는 자연스러워 보이지만, 정확히 이 함정에 걸린다.

## 고친 법: 태스크를 하나만 걸고, 그 안에서 진짜 병렬로

각 주의 생성 함수(`_generate_week_in_background`)는 이미 자기만의 DB 세션을 새로 열어 쓰고 있었다 — 요청이 끝나면 요청 스코프 세션이 닫히기 때문에 원래도 그래야 했다. 그래서 이 함수들끼리는 애초에 서로 상태를 공유하지 않는다. 순차로 돌 이유가 없었다는 뜻이다. `BackgroundTasks`에 여러 번 거는 대신, **백그라운드 작업 자체를 하나만 걸고** 그 안에서 `asyncio.gather`로 진짜 동시에 실행하도록 바꿨다.

```python
# health/service.py — 고친 후
async def _generate_weeks_in_background(user_id, week_start_dates):
    await asyncio.gather(
        *(_generate_week_in_background(user_id, w) for w in week_start_dates)
    )

# 등록은 딱 한 번
background_tasks.add_task(_generate_weeks_in_background, user_id, weeks_to_generate)
```

한 가지는 미리 확인해뒀다 — `_generate_week_in_background`는 내부에서 예외를 전부 잡아 `generation_status="failed"`로 기록하고 절대 밖으로 던지지 않는다. 그래서 `gather`에 `return_exceptions`를 따로 챙기지 않아도, 한 주가 실패해도 나머지 주의 `gather`가 취소되지 않는다.

## 검증: 완료 순서가 날짜순이 아니라는 게 제일 확실한 증거

실제 Azure OpenAI·Postgres에 붙여서 다시 요청해봤다. 이번엔 62초 만에 5주가 전부 끝났고, 무엇보다 **완료되는 순서가 요청한 순서와 달랐다** — 진짜 동시 실행이 아니면 나올 수 없는 신호다.

```text
+41s → 08-10 완료
+51s → 08-24 완료
+57s → 08-03, 08-17 완료
+62s → 08-31 완료
```

5주 중 가장 늦게 시작 순서에 있던 08-31이 08-10보다 먼저 끝나도 이상하지 않은 상태 — LLM 응답 지연은 요청 순서가 아니라 그때그때 다르기 때문이다. 순차 실행이었다면 항상 08-03 → 08-10 → 08-17 → 08-24 → 08-31 순서로만 끝났을 것이다.

## 남는 교훈

`BackgroundTasks.add_task()`를 반복문 안에서 여러 번 부르고 있다면, 그건 "병렬로 여러 작업 던지기"가 아니라 "응답 후 순서대로 실행할 목록 만들기"다. 여러 개를 동시에 돌리고 싶다면 태스크는 하나만 걸고, 그 하나 안에서 `asyncio.gather`로 묶는 편이 낫다. 이름이 그럴듯하다고 실제로 그렇게 동작하는 건 아니다 — 특히 동시성 관련 API일수록, 이름만 보고 넘어가지 말고 한 번은 구현부를 열어볼 가치가 있다.
