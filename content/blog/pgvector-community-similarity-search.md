---
title: "PGVector로 커뮤니티 글 유사 검색(RAG의 Retrieval) 직접 구현해보기"
category: llm
date: "2026-07-16"
order: 2
excerpt: "태그 검색의 한계를 pgvector 기반 임베딩 유사도 검색으로 풀어본 과정 — 동기/비동기 드라이버 충돌, 실패 허용 인덱싱, 자기 자신 제외 처리까지 코드와 함께 정리합니다."
---

## 문제: 태그 검색만으로는 "비슷한 고민"을 못 찾는다

부부·연인 관계 커뮤니티에 글이 쌓이면서, 사용자가 "나만 이런 고민을 하는 게 아니었구나"를 느낄 수 있게 비슷한 글을 이어주고 싶었다. 그런데 태그 검색만으로는 구조적인 한계가 있다. "시댁이랑 갈등이 심해요"라는 글과 "명절마다 시부모님 뵙는 게 스트레스예요"라는 글은 내용상 거의 같은 고민인데, 둘 다 정확히 같은 태그를 달지 않으면 태그 검색으로는 서로를 찾을 수 없다.

이 문제는 결국 "단어가 같은가"가 아니라 "의미가 비슷한가"를 봐야 풀리는 문제였다. 그래서 텍스트를 임베딩(벡터)으로 바꿔서 의미 거리로 검색하는 방식, 흔히 RAG의 앞단인 Retrieval(검색) 부분을 직접 구현해보기로 했다. (참고로 이 글은 생성 단계 없이 검색 자체에 집중한 글이다. 검색된 결과로 LLM이 답을 생성하는 건 별도 기능에서 쓰고 있다.)

## 벡터 스토어 구성: PGVector + Azure OpenAI Embeddings

이미 PostgreSQL을 쓰고 있어서 별도 벡터 DB(Pinecone, Weaviate 등)를 새로 두지 않고, pgvector 확장을 얹은 같은 Postgres에 LangChain의 PGVector로 붙였다.

```python
from functools import lru_cache

from langchain_openai import AzureOpenAIEmbeddings
from langchain_postgres import PGVector

from app.core.config import settings


def _sync_db_url() -> str:
    # LangChain PGVector는 psycopg(동기) 드라이버 사용
    # asyncpg의 ssl=require → psycopg3의 sslmode=require 로 변환
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg://")
    url = url.replace("?ssl=require", "?sslmode=require")
    url = url.replace("&ssl=require", "&sslmode=require")
    return url


@lru_cache(maxsize=1)
def get_vector_store() -> PGVector:
    embeddings = AzureOpenAIEmbeddings(
        azure_deployment=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_API_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )
    return PGVector(
        embeddings=embeddings,
        collection_name="community_posts",
        connection=_sync_db_url(),
        use_jsonb=True,
    )
```

여기서 신경 써야 했던 문제가 하나 있었다. 앱 전체는 asyncpg 기반 비동기 드라이버로 DB에 붙어있는데, LangChain의 PGVector는 동기 드라이버(psycopg)를 기대했다. 두 드라이버는 SSL 옵션 이름부터 다르다(ssl=require vs sslmode=require). 기존 DATABASE_URL을 그대로 넘기면 연결이 안 되기 때문에, _sync_db_url()로 URL을 문자열 치환해서 별도로 변환해줘야 했다. 같은 DB에 붙는데도 라이브러리마다 기대하는 연결 문자열 규격이 다를 수 있다는 걸 신경 써야 하는 부분이다.

@lru_cache(maxsize=1)로 벡터 스토어 인스턴스를 한 번만 만들어 재사용하게 했다. 임베딩 클라이언트와 DB 커넥션을 요청마다 새로 만들면 불필요한 오버헤드가 생기기 때문이다.

## 글 작성 시점에 임베딩하기 — 그리고 실패해도 글은 저장되게

글이 생성될 때 본문을 벡터로 바꿔서 저장한다.

```python
async def create_post(self, user: User, payload: PostCreate) -> CommunityPost:
    ...
    post = await self.repo.create_post(author_id=user.id, **values)

    try:
        vector_store = get_vector_store()
        await asyncio.to_thread(
            vector_store.add_texts,
            texts=[post.content],
            ids=[str(post.id)],
            metadatas=[{"post_id": str(post.id), "ai_summary": post.ai_summary}],
        )
        await self.repo.update_post(
            post,
            embedding_status="indexed",
            embedded_at=datetime.now(timezone.utc),
            embedding_error=None,
        )
    except Exception as exc:
        await self.repo.update_post(
            post,
            embedding_status="failed",
            embedding_error=type(exc).__name__,
        )
    return post
```

여기서 의도적으로 신경 쓴 부분은 글 저장과 임베딩을 실패 허용 범위를 다르게 뒀다는 점이다. 게시글 자체는 이미 create_post로 커밋된 뒤, 벡터 인덱싱은 try/except로 감싸서 실패해도 예외를 위로 던지지 않는다. 대신 embedding_status를 "indexed"/"failed"로 남기고 embedding_error에 예외 타입명을 기록한다.

임베딩 API가 일시적으로 느리거나 실패해도 사용자의 글쓰기 자체는 막히지 않도록 이렇게 분리한 구조로 보인다. 대신 "검색에는 안 걸리지만 글 자체는 살아있는" 상태가 생길 수 있는데, embedding_status 컬럼이 있으니 "failed"인 글만 모아 재인덱싱하는 배치를 나중에 추가할 여지는 있다.

또 하나, vector_store.add_texts처럼 동기 함수를 asyncio.to_thread로 감쌌다. PGVector가 동기 드라이버 기반이라 그냥 await할 수 없어서, 별도 스레드에서 돌려 이벤트 루프를 막지 않게 했다.

글 삭제 시에도 대칭적으로 벡터를 지운다.

```python
async def delete_post(self, user: User, post_id: UUID) -> None:
    ...
    try:
        vector_store = get_vector_store()
        await asyncio.to_thread(vector_store.delete, ids=[str(post.id)])
    except Exception:
        pass

    await self.repo.delete_post(post)
```

벡터 삭제도 실패를 무시하고 넘어가게 했다. 벡터 인덱스에 고아 레코드가 남는 것보다, 삭제 요청 자체가 벡터 스토어 장애 때문에 막히는 게 더 나쁜 경험이라고 판단해서다.

## 두 가지 활용: 유사 글 추천 vs 자연어 검색

같은 벡터 스토어를 두 군데서 다르게 쓴다.

### ① 지금 보는 글과 비슷한 글 찾기

```python
async def find_similar_posts(self, post_id: UUID, limit: int = 5) -> list[SimilarPostResponse]:
    post = await self.repo.get_post_by_id(post_id)
    if not post:
        raise NotFoundError()

    try:
        vector_store = get_vector_store()
        results = await asyncio.to_thread(
            vector_store.similarity_search_with_relevance_scores,
            query=post.content,
            k=limit + 1,
        )
    except Exception:
        return []

    return [
        SimilarPostResponse(
            postId=document.metadata["post_id"],
            content=document.page_content,
            aiSummary=document.metadata.get("ai_summary"),
            similarityScore=round(score * 100, 1),
        )
        for document, score in results
        if document.metadata["post_id"] != str(post_id)
    ][:limit]
```

여기서 k=limit + 1로 하나 더 뽑는 이유는, 벡터 검색 결과에 자기 자신(같은 글)이 가장 유사한 문서로 포함되기 때문이다. 자기 자신은 필터링(document.metadata["post_id"] != str(post_id))으로 제외하고 나서 원하는 개수만큼 자른다. k=limit로만 뽑으면 상위 결과 하나가 항상 자기 자신으로 채워져 실제로 보여줄 수 있는 결과가 하나 줄어드는 구조라, 그만큼 여유를 두고 뽑은 뒤 걸러내는 방식으로 짰다.

### ② 자연어로 글 검색하기

```python
async def search_posts(self, tags=None, query=None, offset=0, limit=20, user=None):
    if tags:
        items, total = await self.repo.search_by_tags(tags, offset, limit, ...)
        return PostSearchResponse(items=items, total=total, searchType="tag")

    if query:
        try:
            vector_store = get_vector_store()
            results = await asyncio.to_thread(
                vector_store.similarity_search_with_relevance_scores,
                query=query,
                k=limit,
            )
        except Exception:
            return PostSearchResponse(items=[], total=0, searchType="vector")
        post_ids = [document.metadata["post_id"] for document, _ in results]
        items, total = await self.repo.search_by_ids(post_ids, ...)
        return PostSearchResponse(items=items, total=total, searchType="vector")

    return PostSearchResponse(items=[], total=0, searchType="tag")
```

태그가 있으면 기존 RDB 검색(search_by_tags)으로, 자유 텍스트 질의(query)가 있으면 벡터 검색으로 갈라지는 하이브리드 구조다. 응답에 searchType을 같이 내려서 프론트에서 "태그로 찾은 결과인지 의미로 찾은 결과인지" 구분할 수 있게 했다. 정형 필터(태그)와 의미 기반 검색(벡터)을 하나의 알고리즘으로 억지로 합치지 않고, 입력 형태에 따라 완전히 다른 경로로 분기시킨 구조라 각 경로의 코드가 단순하다.

## 구조를 정리하며 짚어볼 점

- 벡터 검색은 "정답이 있는 검색"이 아니라 "그럴듯한 순서를 매기는 검색"이다. similarity_search_with_relevance_scores가 점수를 주긴 하지만, 현재 코드에는 특정 임계치 이하를 걸러내는 로직이 없다. 점수가 낮은 결과도 상위 k개 안에 들면 그대로 노출될 수 있는 구조라, 최소 유사도 컷오프를 추가하는 게 다음 개선 지점으로 보인다.
- 인덱싱은 게시글의 생명주기와 별도로 관리해야 한다. 글 CRUD와 벡터 인덱스 CRUD를 강하게 묶으면(트랜잭션처럼) 임베딩 API 장애가 곧 서비스 장애가 된다. embedding_status 컬럼으로 상태를 분리해두면, 벡터 스토어가 죽어도 글쓰기 자체는 죽지 않는 구조를 만들 수 있다.
- RAG라는 이름 아래 실제로 구현하는 건 대부분 "임베딩 + 유사도 검색"이라는 꽤 단순한 조합이다. 코드를 보면 어려운 부분은 생성 모델 자체가 아니라, 이걸 기존 서비스(RDB, 트랜잭션, 실패 허용 정책)와 자연스럽게 엮는 쪽에 있다.

## 정리

- 기존 관계형 DB에 pgvector + LangChain PGVector를 얹으면 별도 벡터 DB 없이 시맨틱 검색을 붙일 수 있다.
- 동기 드라이버 기반 라이브러리를 비동기 앱에 섞어 쓸 땐 커넥션 문자열 규격 차이(ssl=require vs sslmode=require)부터 확인해야 한다.
- 임베딩 인덱싱은 원본 데이터 저장과 실패 허용 수준을 분리하고, 상태 컬럼(embedding_status)으로 추적하는 게 안전하다.
- 유사 문서 검색에서 자기 자신이 결과에 섞여 나올 수 있다는 점은 놓치기 쉬운 디테일이라 k를 여유 있게 뽑고 후처리로 걸러야 한다.
- 정형 필터(태그)와 의미 기반 검색(벡터)은 하나로 합치려 하지 말고 입력 형태에 따라 경로를 분기하는 편이 코드도, 사용자에게 보여줄 결과 설명("태그로 찾음" vs "의미로 찾음")도 더 명확해진다.
