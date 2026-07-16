export type BlogCategory = "mlops" | "vision" | "llm" | "study" | "retro";

export const BLOG_CATEGORIES: { key: BlogCategory; label: string }[] = [
  { key: "mlops", label: "MLOps · 인프라" },
  { key: "vision", label: "Computer Vision" },
  { key: "llm", label: "LLM · RAG" },
  { key: "study", label: "스터디" },
  { key: "retro", label: "회고" },
];

export type BlogBlock =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "term"; name: string; description: string }
  | { type: "code"; code: string }
  | { type: "list"; items: string[]; ordered?: boolean };

export type BlogPost = {
  id: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  date: string;
  link?: string;
  content?: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "pgvector-community-similarity-search",
    title: "PGVector로 커뮤니티 글 유사 검색(RAG의 Retrieval) 직접 구현해보기",
    category: "llm",
    excerpt:
      "태그 검색의 한계를 pgvector 기반 임베딩 유사도 검색으로 풀어본 과정 — 동기/비동기 드라이버 충돌, 실패 허용 인덱싱, 자기 자신 제외 처리까지 코드와 함께 정리합니다.",
    date: "2026-07-16",
    content: [
      { type: "heading", text: '문제: 태그 검색만으로는 "비슷한 고민"을 못 찾는다' },
      {
        type: "paragraph",
        text: '부부·연인 관계 커뮤니티에 글이 쌓이면서, 사용자가 "나만 이런 고민을 하는 게 아니었구나"를 느낄 수 있게 비슷한 글을 이어주고 싶었다. 처음엔 태그 검색으로 충분할 줄 알았는데, 실제로 써보니 한계가 명확했다. "시댁이랑 갈등이 심해요"라는 글과 "명절마다 시부모님 뵙는 게 스트레스예요"라는 글은 내용상 거의 같은 고민인데, 둘 다 정확히 같은 태그를 달지 않으면 서로를 찾을 수 없었다.',
      },
      {
        type: "paragraph",
        text: '이 문제는 결국 "단어가 같은가"가 아니라 "의미가 비슷한가"를 봐야 풀리는 문제였다. 그래서 텍스트를 임베딩(벡터)으로 바꿔서 의미 거리로 검색하는 방식, 흔히 RAG의 앞단인 Retrieval(검색) 부분을 직접 구현해보기로 했다. (참고로 이 글은 생성 단계 없이 검색 자체에 집중한 글이다. 검색된 결과로 LLM이 답을 생성하는 건 별도 기능에서 쓰고 있다.)',
      },
      { type: "heading", text: "벡터 스토어 구성: PGVector + Azure OpenAI Embeddings" },
      {
        type: "paragraph",
        text: "이미 PostgreSQL을 쓰고 있어서 별도 벡터 DB(Pinecone, Weaviate 등)를 새로 두지 않고, pgvector 확장을 얹은 같은 Postgres에 LangChain의 PGVector로 붙였다.",
      },
      {
        type: "code",
        code:
          "from functools import lru_cache\n\n" +
          "from langchain_openai import AzureOpenAIEmbeddings\n" +
          "from langchain_postgres import PGVector\n\n" +
          "from app.core.config import settings\n\n\n" +
          "def _sync_db_url() -> str:\n" +
          "    # LangChain PGVector는 psycopg(동기) 드라이버 사용\n" +
          "    # asyncpg의 ssl=require → psycopg3의 sslmode=require 로 변환\n" +
          '    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg://")\n' +
          '    url = url.replace("?ssl=require", "?sslmode=require")\n' +
          '    url = url.replace("&ssl=require", "&sslmode=require")\n' +
          "    return url\n\n\n" +
          "@lru_cache(maxsize=1)\n" +
          "def get_vector_store() -> PGVector:\n" +
          "    embeddings = AzureOpenAIEmbeddings(\n" +
          "        azure_deployment=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,\n" +
          "        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,\n" +
          "        api_key=settings.AZURE_OPENAI_API_KEY,\n" +
          "        api_version=settings.AZURE_OPENAI_API_VERSION,\n" +
          "    )\n" +
          "    return PGVector(\n" +
          "        embeddings=embeddings,\n" +
          '        collection_name="community_posts",\n' +
          "        connection=_sync_db_url(),\n" +
          "        use_jsonb=True,\n" +
          "    )",
      },
      {
        type: "paragraph",
        text: "여기서 직접 부딪힌 문제가 하나 있었다. 앱 전체는 asyncpg 기반 비동기 드라이버로 DB에 붙어있는데, LangChain의 PGVector는 동기 드라이버(psycopg)를 기대했다. 두 드라이버는 SSL 옵션 이름부터 다르다(ssl=require vs sslmode=require). 처음엔 이걸 모르고 그냥 기존 DATABASE_URL을 넘겼다가 연결 자체가 안 돼서, _sync_db_url()로 URL을 문자열 치환해서 별도로 변환하는 걸 알게 됐다. 같은 DB에 붙는데도 라이브러리마다 기대하는 연결 문자열 규격이 다를 수 있다는 걸 실제로 겪고 나서야 신경 쓰게 된 부분이다.",
      },
      {
        type: "paragraph",
        text: "@lru_cache(maxsize=1)로 벡터 스토어 인스턴스를 한 번만 만들어 재사용하게 했다. 임베딩 클라이언트와 DB 커넥션을 요청마다 새로 만들면 불필요한 오버헤드가 생기기 때문이다.",
      },
      { type: "heading", text: "글 작성 시점에 임베딩하기 — 그리고 실패해도 글은 저장되게" },
      { type: "paragraph", text: "글이 생성될 때 본문을 벡터로 바꿔서 저장한다." },
      {
        type: "code",
        code:
          "async def create_post(self, user: User, payload: PostCreate) -> CommunityPost:\n" +
          "    ...\n" +
          "    post = await self.repo.create_post(author_id=user.id, **values)\n\n" +
          "    try:\n" +
          "        vector_store = get_vector_store()\n" +
          "        await asyncio.to_thread(\n" +
          "            vector_store.add_texts,\n" +
          "            texts=[post.content],\n" +
          "            ids=[str(post.id)],\n" +
          '            metadatas=[{"post_id": str(post.id), "ai_summary": post.ai_summary}],\n' +
          "        )\n" +
          "        await self.repo.update_post(\n" +
          "            post,\n" +
          '            embedding_status="indexed",\n' +
          "            embedded_at=datetime.now(timezone.utc),\n" +
          "            embedding_error=None,\n" +
          "        )\n" +
          "    except Exception as exc:\n" +
          "        await self.repo.update_post(\n" +
          "            post,\n" +
          '            embedding_status="failed",\n' +
          "            embedding_error=type(exc).__name__,\n" +
          "        )\n" +
          "    return post",
      },
      {
        type: "paragraph",
        text: '여기서 의도적으로 신경 쓴 부분은 글 저장과 임베딩을 실패 허용 범위를 다르게 뒀다는 점이다. 게시글 자체는 이미 create_post로 커밋된 뒤, 벡터 인덱싱은 try/except로 감싸서 실패해도 예외를 위로 던지지 않는다. 대신 embedding_status를 "indexed"/"failed"로 남기고 embedding_error에 예외 타입명을 기록한다.',
      },
      {
        type: "paragraph",
        text: '임베딩 API가 일시적으로 느리거나 실패한다고 해서 사용자의 글쓰기 자체가 막히면 안 된다고 생각해서 이렇게 분리했다. 대신 "검색에는 안 걸리지만 글 자체는 살아있는" 상태가 생길 수 있다는 트레이드오프를 안고 간 거라, 나중에 embedding_status="failed"인 글만 모아서 재인덱싱하는 배치가 필요하다는 걸 스키마 설계 단계에서부터 열어둔 셈이다.',
      },
      {
        type: "paragraph",
        text: "또 하나, vector_store.add_texts처럼 동기 함수를 asyncio.to_thread로 감쌌다. PGVector가 동기 드라이버 기반이라 그냥 await할 수 없어서, 별도 스레드에서 돌려 이벤트 루프를 막지 않게 했다.",
      },
      { type: "paragraph", text: "글 삭제 시에도 대칭적으로 벡터를 지운다." },
      {
        type: "code",
        code:
          "async def delete_post(self, user: User, post_id: UUID) -> None:\n" +
          "    ...\n" +
          "    try:\n" +
          "        vector_store = get_vector_store()\n" +
          "        await asyncio.to_thread(vector_store.delete, ids=[str(post.id)])\n" +
          "    except Exception:\n" +
          "        pass\n\n" +
          "    await self.repo.delete_post(post)",
      },
      {
        type: "paragraph",
        text: "벡터 삭제도 실패를 무시하고 넘어가게 했다. 벡터 인덱스에 고아 레코드가 남는 것보다, 삭제 요청 자체가 벡터 스토어 장애 때문에 막히는 게 더 나쁜 경험이라고 판단해서다.",
      },
      { type: "heading", text: "두 가지 활용: 유사 글 추천 vs 자연어 검색" },
      { type: "paragraph", text: "같은 벡터 스토어를 두 군데서 다르게 쓴다." },
      { type: "subheading", text: "① 지금 보는 글과 비슷한 글 찾기" },
      {
        type: "code",
        code:
          "async def find_similar_posts(self, post_id: UUID, limit: int = 5) -> list[SimilarPostResponse]:\n" +
          "    post = await self.repo.get_post_by_id(post_id)\n" +
          "    if not post:\n" +
          "        raise NotFoundError()\n\n" +
          "    try:\n" +
          "        vector_store = get_vector_store()\n" +
          "        results = await asyncio.to_thread(\n" +
          "            vector_store.similarity_search_with_relevance_scores,\n" +
          "            query=post.content,\n" +
          "            k=limit + 1,\n" +
          "        )\n" +
          "    except Exception:\n" +
          "        return []\n\n" +
          "    return [\n" +
          "        SimilarPostResponse(\n" +
          '            postId=document.metadata["post_id"],\n' +
          "            content=document.page_content,\n" +
          '            aiSummary=document.metadata.get("ai_summary"),\n' +
          "            similarityScore=round(score * 100, 1),\n" +
          "        )\n" +
          "        for document, score in results\n" +
          '        if document.metadata["post_id"] != str(post_id)\n' +
          "    ][:limit]",
      },
      {
        type: "paragraph",
        text: '여기서 k=limit + 1로 하나 더 뽑는 이유는, 벡터 검색 결과에 자기 자신(같은 글)이 가장 유사한 문서로 포함되기 때문이다. 자기 자신은 필터링(document.metadata["post_id"] != str(post_id))으로 제외하고 나서 원하는 개수만큼 자른다. 이 "자기 자신 제외"를 안 하고 그냥 k=limit로 뽑으면 상위 결과 하나가 항상 자기 자신으로 낭비되는 문제를 개발 중에 직접 겪고 나서 고쳤다.',
      },
      { type: "subheading", text: "② 자연어로 글 검색하기" },
      {
        type: "code",
        code:
          "async def search_posts(self, tags=None, query=None, offset=0, limit=20, user=None):\n" +
          "    if tags:\n" +
          "        items, total = await self.repo.search_by_tags(tags, offset, limit, ...)\n" +
          '        return PostSearchResponse(items=items, total=total, searchType="tag")\n\n' +
          "    if query:\n" +
          "        try:\n" +
          "            vector_store = get_vector_store()\n" +
          "            results = await asyncio.to_thread(\n" +
          "                vector_store.similarity_search_with_relevance_scores,\n" +
          "                query=query,\n" +
          "                k=limit,\n" +
          "            )\n" +
          "        except Exception:\n" +
          '            return PostSearchResponse(items=[], total=0, searchType="vector")\n' +
          "        post_ids = [document.metadata[\"post_id\"] for document, _ in results]\n" +
          "        items, total = await self.repo.search_by_ids(post_ids, ...)\n" +
          '        return PostSearchResponse(items=items, total=total, searchType="vector")\n\n' +
          '    return PostSearchResponse(items=[], total=0, searchType="tag")',
      },
      {
        type: "paragraph",
        text: '태그가 있으면 기존 RDB 검색(search_by_tags)으로, 자유 텍스트 질의(query)가 있으면 벡터 검색으로 갈라지는 하이브리드 구조다. 응답에 searchType을 같이 내려서 프론트에서 "태그로 찾은 결과인지 의미로 찾은 결과인지" 구분할 수 있게 했다. 정형 필터(태그)와 의미 기반 검색(벡터)을 억지로 하나의 알고리즘으로 합치려 하지 않고, 입력 형태에 따라 완전히 다른 경로로 분기시킨 게 오히려 코드가 단순해지는 방향이었다.',
      },
      { type: "heading", text: "직접 만들어보고 느낀 점" },
      {
        type: "list",
        items: [
          '벡터 검색은 "정답이 있는 검색"이 아니라 "그럴듯한 순서를 매기는 검색"이다. similarity_search_with_relevance_scores가 점수를 주긴 하지만, 여기서는 아직 특정 임계치 이하는 자르는 로직을 넣지 않았다. 실제로 써보면 관련도가 낮은데도 상위 k개 안에 들어와서 노출되는 경우가 있어서, 다음에 다시 만든다면 최소 유사도 컷오프를 먼저 넣을 것 같다.',
          "인덱싱은 게시글의 생명주기와 별도로 관리해야 한다. 글 CRUD와 벡터 인덱스 CRUD를 강하게 묶으면(트랜잭션처럼) 임베딩 API 장애가 곧 서비스 장애가 된다. embedding_status 컬럼으로 상태를 분리해두니, 벡터 스토어가 죽어도 글쓰기 자체는 죽지 않는 구조를 만들 수 있었다.",
          'RAG라는 이름 아래 실제로 구현하는 건 대부분 "임베딩 + 유사도 검색"이라는 꽤 단순한 조합이다. 어려운 건 생성 모델 자체가 아니라, 이걸 기존 서비스(RDB, 트랜잭션, 실패 허용 정책)와 자연스럽게 엮는 부분이라는 걸 직접 만들어보면서 체감했다.',
        ],
      },
      { type: "heading", text: "정리" },
      {
        type: "list",
        items: [
          "기존 관계형 DB에 pgvector + LangChain PGVector를 얹으면 별도 벡터 DB 없이 시맨틱 검색을 붙일 수 있다.",
          "동기 드라이버 기반 라이브러리를 비동기 앱에 섞어 쓸 땐 커넥션 문자열 규격 차이(ssl=require vs sslmode=require)부터 확인해야 한다.",
          "임베딩 인덱싱은 원본 데이터 저장과 실패 허용 수준을 분리하고, 상태 컬럼(embedding_status)으로 추적하는 게 안전하다.",
          "유사 문서 검색에서 자기 자신이 결과에 섞여 나올 수 있다는 점은 놓치기 쉬운 디테일이라 k를 여유 있게 뽑고 후처리로 걸러야 한다.",
          '정형 필터(태그)와 의미 기반 검색(벡터)은 하나로 합치려 하지 말고 입력 형태에 따라 경로를 분기하는 편이 코드도, 사용자에게 보여줄 결과 설명("태그로 찾음" vs "의미로 찾음")도 더 명확해진다.',
        ],
      },
    ],
  },
  {
    id: "langchain-structured-output-pii-masking",
    title: "LangChain Structured Output으로 개인정보 마스킹 직접 구현해보기",
    category: "llm",
    excerpt:
      "부부·연인 상담 커뮤니티 글을 저장하기 전 개인정보를 가리려고 LangChain structured output으로 직접 구현해본 과정과, 두 겹의 폴백·한계를 코드와 함께 정리합니다.",
    date: "2026-07-16",
    content: [
      { type: "heading", text: "문제: 정규식만으로는 못 가리는 개인정보" },
      {
        type: "paragraph",
        text: "부부·연인 관계 상담 커뮤니티 기능을 만들면서, 사용자가 쓴 글을 저장하기 전에 개인정보를 가려야 하는 상황을 만났다. 사용자가 쓰는 글은 대략 이런 식이다.",
      },
      {
        type: "quote",
        text: "어제 남편이 또 애 앞에서 소리 지르고, 시댁 얘기까지 꺼내면서... 민준이가 다니는 어린이집 선생님도 눈치챌 정도였어요. 저희 회사(OO물산) 근처 카페에서 상담받고 오는 길인데도 계속 마음이 안 좋네요.",
      },
      {
        type: "paragraph",
        text: '이 문장에서 가려야 할 건 "민준이"(자녀 이름), "OO물산"(회사명) 정도다. 전화번호나 이메일, 주민등록번호처럼 형태가 고정된 값은 정규식으로 잡을 수 있지만, 이런 건 문장 구조를 이해해야 뭐가 개인정보인지 판단할 수 있다. "회사"라는 단어 자체는 개인정보가 아니지만 "OO물산"은 개인정보다 — 이 구분은 패턴 매칭으로는 안 된다는 걸 처음 정규식으로 시도해보면서 바로 느꼈다.',
      },
      {
        type: "paragraph",
        text: "그래서 LLM에게 문장을 통째로 맡기고, 구조화된 출력(structured output)으로 결과를 강제하는 방식을 직접 구현해보기로 했다.",
      },
      { type: "heading", text: "핵심 아이디어: 원하는 출력 형태를 Pydantic 모델로 못 박기" },
      {
        type: "paragraph",
        text: 'LLM에게 "개인정보를 가려줘"라고만 시키면 응답 형식이 매번 달라진다. 어떤 때는 마스킹된 문장만 주고, 어떤 때는 "다음과 같이 수정했습니다:" 같은 사족을 붙이고, 어떤 때는 마크다운으로 감싸서 준다. 이걸 파싱하려고 정규식을 또 짜는 건 본말전도라고 생각해서, 처음부터 구조화 출력으로 접근했다.',
      },
      {
        type: "paragraph",
        text: "LangChain의 with_structured_output은 Pydantic 모델을 스키마로 넘기면, 모델이 그 형태에 맞는 JSON을 내도록 강제해준다(내부적으로는 provider의 tool/function calling 메커니즘을 이용해 스키마를 도구 인자로 바인딩하는 방식이다). 나는 이렇게 정의했다.",
      },
      {
        type: "code",
        code:
          "from pydantic import BaseModel, Field\n\n" +
          "class PiiMaskingResult(BaseModel):\n" +
          "    masked_text: str = Field(\n" +
          "        description=(\n" +
          "            \"실명, 자녀 이름, 회사명, 학교명, 동네·아파트 이름, 전화번호, 이메일 등 \"\n" +
          "            \"특정 개인을 알아볼 수 있는 표현만 'OO', '아이', '그 동네'처럼 자연스러운 \"\n" +
          "            \"일반 표현으로 바꾼 글. 감정 표현과 문장의 의미, 어조는 그대로 유지하고, \"\n" +
          "            \"가릴 정보가 없으면 원문을 그대로 반환한다.\"\n" +
          "        )\n" +
          "    )\n" +
          "    masked_entities: list[str] = Field(\n" +
          "        default_factory=list,\n" +
          "        description=\"마스킹 처리된 원본 표현 목록 (없으면 빈 배열)\",\n" +
          "    )",
      },
      {
        type: "paragraph",
        text: '여기서 직접 써보면서 깨달은 점은 Field(description=...)이 단순 문서화가 아니라 사실상 프롬프트의 일부로 동작한다는 것이다. 이 설명은 모델이 도구를 호출할 때 각 인자가 무엇을 의미하는지 판단하는 근거가 되므로, "실명, 자녀 이름, 회사명... 을 이렇게 바꿔라"는 지시를 필드 설명 안에 녹여 넣은 셈이다. 시스템 프롬프트와 스키마 설명이 이중으로 같은 지시를 하는 구조다.',
      },
      {
        type: "paragraph",
        text: 'masked_entities 필드는 실제 서비스 로직에서 안 쓰더라도 일부러 넣었다. 모델이 "무엇을 왜 가렸는지" 스스로 근거를 대게 만들면, 결과를 검수하거나 디버깅할 때 "이 문장에서 뭘 마스킹 대상으로 판단했는지"를 바로 확인할 수 있어서 개발 중에 꽤 유용했다.',
      },
      { type: "heading", text: "프롬프트 설계: 시스템 프롬프트 + 휴먼 메시지 분리" },
      {
        type: "code",
        code:
          "from langchain_core.prompts import ChatPromptTemplate\n\n" +
          "_PII_MASKING_PROMPT = ChatPromptTemplate.from_messages([\n" +
          "    (\n" +
          "        \"system\",\n" +
          "        \"당신은 커뮤니티에 올라오는 글에서 개인을 특정할 수 있는 정보를 가려주는 편집자입니다. \"\n" +
          "        \"실명, 자녀 이름, 구체적인 회사명·학교명·동네 이름, 전화번호, 이메일 주소 등을 찾아 \"\n" +
          "        \"'OO', '아이', '그 동네' 같은 일반적인 표현으로 자연스럽게 바꾸세요. \"\n" +
          "        \"감정 표현이나 갈등 내용, 문장의 어조와 의미는 그대로 유지하세요. \"\n" +
          "        \"가릴 정보가 없으면 원문을 그대로 반환하세요. 반드시 한국어로 답하세요.\",\n" +
          "    ),\n" +
          "    (\"human\", \"다음 글을 편집해주세요:\\n\\n{content}\"),\n" +
          "])",
      },
      { type: "paragraph", text: "프롬프트를 짜면서 세 가지를 의식적으로 나눠서 지시했다." },
      {
        type: "list",
        ordered: true,
        items: [
          '역할 부여 — "개인정보를 지우는 필터"가 아니라 "편집자"라고 프레이밍했다. 단순 삭제가 아니라 문장을 자연스럽게 유지한 채로 치환하라는 의도를 역할 설정으로 전달하고 싶었다.',
          '대상 목록 나열 — 실명, 자녀 이름, 회사명, 학교명, 동네 이름, 전화번호, 이메일. 구체적인 카테고리를 예시로 주는 게 "개인정보를 가려줘" 한 줄보다 재현율이 확실히 높았다.',
          '하지 말아야 할 것 명시 — "감정 표현이나 갈등 내용, 문장의 어조와 의미는 그대로 유지하세요." 이 문장을 처음에 빼고 테스트했더니 LLM이 과도하게 요약하거나 순화해서 원문의 뉘앙스(예: 화가 난 어조)까지 지워버리는 경우가 나왔다. 그래서 마스킹 작업에서는 "무엇을 바꾸지 말아야 하는가"를 명시하는 게 "무엇을 바꿔야 하는가"만큼 중요하다는 걸 실제로 겪고 나서야 프롬프트에 추가했다.',
        ],
      },
      { type: "heading", text: "체이닝: 프롬프트 → 구조화 LLM" },
      {
        type: "code",
        code:
          "def mask_pii(content: str) -> dict:\n" +
          "    llm = _build_llm()\n" +
          "    if llm is None:\n" +
          "        return _mock_mask_pii(content)\n\n" +
          "    try:\n" +
          "        structured_llm = llm.with_structured_output(PiiMaskingResult)\n" +
          "        chain = _PII_MASKING_PROMPT | structured_llm\n" +
          "        result: PiiMaskingResult = chain.invoke({\"content\": content})\n" +
          "        return result.model_dump()\n" +
          "    except Exception:\n" +
          "        logger.exception(\"PII masking failed; using regex fallback\")\n" +
          "        return _mock_mask_pii(content)",
      },
      {
        type: "paragraph",
        text: '_PII_MASKING_PROMPT | structured_llm처럼 LCEL(LangChain Expression Language)의 파이프 연산자로 "프롬프트 템플릿 → 구조화 출력 LLM"을 체이닝했다. chain.invoke({"content": content})를 호출하면:',
      },
      {
        type: "list",
        ordered: true,
        items: [
          "템플릿에 content를 채워 시스템+휴먼 메시지를 만들고",
          "LLM이 이 메시지를 받아 PiiMaskingResult 스키마에 맞는 인자로 도구를 호출하고",
          "그 결과가 자동으로 PiiMaskingResult 인스턴스로 파싱되어 돌아온다",
        ],
      },
      {
        type: "paragraph",
        text: "받는 쪽에서는 result.masked_text, result.masked_entities처럼 타입이 보장된 필드로 바로 접근할 수 있었다. JSON 파싱 실패나 마크다운 코드펜스 제거 같은 방어 코드를 전혀 안 짜도 됐다는 게 이 방식을 써보면서 가장 만족스러웠던 부분이다.",
      },
      { type: "heading", text: "안전망: 두 겹의 폴백" },
      { type: "paragraph", text: "LLM 호출이 실패할 수 있는 지점이 두 군데라, 각각에 폴백을 걸어뒀다." },
      {
        type: "code",
        code:
          '_PHONE_RE = re.compile(r"01[016789][-\\s]?\\d{3,4}[-\\s]?\\d{4}")\n' +
          '_EMAIL_RE = re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+")\n\n' +
          "def _mock_mask_pii(content: str) -> dict:\n" +
          '    """API 자격증명 없을 때 mock 응답 (로컬 개발용) — 전화번호·이메일만 정규식으로 가림."""\n' +
          '    masked = _PHONE_RE.sub("OOO-OOOO-OOOO", content)\n' +
          '    masked = _EMAIL_RE.sub("[이메일 가림]", masked)\n' +
          '    entities = ["연락처/이메일"] if masked != content else []\n' +
          '    return {"masked_text": masked, "masked_entities": entities}',
      },
      {
        type: "list",
        items: [
          'llm is None일 때 — API 자격증명이 설정 안 된 로컬 개발 환경에서는 아예 LLM을 호출하지 않고 최소한의 정규식 마스킹으로 대체했다. API 키 없이도 로컬에서 기능이 "그럴듯하게" 동작하게 만들고 싶어서 넣은 개발 편의 장치다.',
          "except Exception일 때 — API 타임아웃, 요금 한도, 응답 스키마 불일치 등 런타임 실패 시에도 같은 정규식 폴백으로 떨어지게 했다. LLM 마스킹이 실패했다고 원문을 그대로 저장하는 최악의 경우는 피하고 싶었다.",
        ],
      },
      {
        type: "paragraph",
        text: '두 경로가 결국 같은 _mock_mask_pii로 수렴하도록 짜서, "폴백 로직을 폴백하는" 이중 분기 없이 하나의 안전망으로 두 가지 실패 상황을 모두 처리하게 만들었다.',
      },
      { type: "heading", text: "직접 써보고 느낀 장단점" },
      { type: "subheading", text: "장점" },
      {
        type: "list",
        items: [
          "정규식으로는 표현 불가능한 문맥적 개인정보(회사명, 동네 이름, 관계 속에서 등장하는 고유명사)까지 잡아냈다.",
          '마스킹 후에도 문장이 자연스러웠다. 정규식/NER 기반 마스킹은 대상을 [REDACTED]나 0000처럼 뭉개는 방식이라 문장이 부자연스러워지기 쉬운데, LLM은 "그 동네", "아이"처럼 문맥에 맞는 대체어를 골라 문장 흐름을 유지해줬다.',
          "스키마 기반 구조화 출력 덕분에 파싱 코드를 거의 안 짜도 됐다.",
        ],
      },
      { type: "subheading", text: "한계" },
      {
        type: "list",
        items: [
          '같은 입력이라도 호출마다 결과가 미세하게 달라질 수 있었다(비결정성). 마스킹처럼 "빠짐없이, 항상 같게" 보장돼야 하는 작업에서는 이 점이 계속 마음에 걸렸다.',
          "호출당 레이턴시와 토큰 비용이 붙었다. 글 저장 경로처럼 사용자 응답 속도에 민감한 곳에서는 체감되는 지연이었다.",
          '"가릴 정보가 없으면 원문을 그대로 반환하라"고 프롬프트에 명시해도, 놓치는 케이스(false negative)를 100% 배제한다는 보장은 프롬프트만으로는 얻을 수 없었다.',
        ],
      },
      {
        type: "paragraph",
        text: '이 경험을 통해 얻은 결론은, LLM structured output이 정말 잘 맞는 자리는 "정답이 하나로 정해지지 않는, 자연스러움이 중요한 생성 작업"(톤 조정, 감정 분석, 요약 등)이지, 개인정보 마스킹처럼 빠짐없는 재현성이 요구되는 검증형 작업에는 전용 NER API나 정규식 같은 결정적 알고리즘과 함께 쓰거나 그쪽으로 옮기는 편이 더 안전하다는 것이다.',
      },
      { type: "heading", text: "정리" },
      {
        type: "list",
        items: [
          "with_structured_output + Pydantic 모델로 LLM 응답 형식을 강제하면 파싱 코드 없이 타입 안전한 결과를 받을 수 있다.",
          "Field(description=...)는 문서가 아니라 모델에게 전달되는 지시문의 일부로 취급해야 한다.",
          '프롬프트는 "무엇을 바꿔야 하는가"뿐 아니라 "무엇을 바꾸지 말아야 하는가"까지 명시해야 원문의 톤이 보존된다.',
          "LLM 호출 경로에는 항상 두 가지 실패 지점(미설정/런타임 에러)을 구분해서 각각 폴백을 걸어두는 게 안전하다.",
          '다만 이 기법이 잘 맞는 자리는 "정답이 하나로 정해지지 않는, 자연스러움이 중요한 생성 작업"이지, "빠짐없는 재현성이 요구되는 검증형 작업"에는 결정적 알고리즘과 병행하거나 대체하는 편이 낫다.',
        ],
      },
    ],
  },
  {
    id: "pii-masking-relationship-whitelist",
    title: "PII 마스킹 기술 정리 — 관계어는 보존하는 개인정보 탐지",
    category: "llm",
    excerpt:
      "Azure AI Language 기반 PII 탐지에서 '남편·아내' 같은 관계어가 사람 이름으로 오탐지되는 문제를 화이트리스트 후처리로 해결한 경험을 코드와 함께 정리합니다.",
    date: "2026-07-16",
    content: [
      { type: "heading", text: "왜 PII 마스킹이 필요한가" },
      {
        type: "paragraph",
        text: "대화형 서비스에서는 사용자가 이름·전화번호·주소 같은 개인정보를 자연스럽게 입력하는 경우가 많다. 이 텍스트를 LLM 분석·저장 단계에 그대로 넘기면 개인정보가 로그와 DB에 그대로 남기 때문에, 분석 전에 개인정보를 탐지해 마스킹하는 전처리 단계가 필요하다.",
      },
      { type: "heading", text: "Azure AI Language로 개체 탐지" },
      {
        type: "paragraph",
        text: "Azure AI Language의 PII 탐지 API(recognize_pii_entities)는 문장에서 이름·전화번호·주소 같은 개체를 카테고리와 함께 자동으로 찾아준다. 기본 설정만으로도 대부분의 개인정보는 잘 잡아내지만, 도메인에 따라 오탐이 발생한다.",
      },
      {
        type: "code",
        code:
          "from azure.ai.textanalytics import TextAnalyticsClient\n" +
          "from azure.core.credentials import AzureKeyCredential\n\n" +
          "client = TextAnalyticsClient(endpoint=ENDPOINT, credential=AzureKeyCredential(KEY))\n\n" +
          "def detect_pii(text: str):\n" +
          "    result = client.recognize_pii_entities([text])[0]\n" +
          "    return result.entities  # [{text, category, offset, length, confidence_score}, ...]",
      },
      { type: "heading", text: "문제 — 관계어가 사람 이름으로 오탐지됨" },
      {
        type: "paragraph",
        text: "부부·연인 관계 데이터를 다루다 보니 '남편', '아내', '여자친구' 같은 관계 지칭어가 자주 등장하는데, 기본 PII 탐지 모델이 이걸 Person 개체로 잘못 인식해 마스킹 대상에 포함시키는 경우가 있었다. 문제는 이 단어들이 마스킹되면 갈등 분석에 꼭 필요한 맥락(누가 누구에게 한 말인지)이 사라진다는 점이다.",
      },
      { type: "heading", text: "해결 — 화이트리스트 기반 후처리" },
      {
        type: "paragraph",
        text: "탐지된 개체를 그대로 마스킹하지 않고, Person 카테고리로 잡힌 개체 중 사전에 정의한 관계어 화이트리스트에 해당하면 마스킹 대상에서 제외하는 후처리 로직을 추가했다.",
      },
      {
        type: "code",
        code:
          "RELATIONSHIP_WHITELIST = {\"남편\", \"아내\", \"와이프\", \"신랑\", \"여자친구\", \"남자친구\", \"애인\"}\n\n" +
          "def filter_relationship_terms(entities, text):\n" +
          "    return [\n" +
          "        e for e in entities\n" +
          "        if not (e.category == \"Person\" and text[e.offset:e.offset + e.length] in RELATIONSHIP_WHITELIST)\n" +
          "    ]\n\n" +
          "def mask_text(text: str) -> str:\n" +
          "    entities = filter_relationship_terms(detect_pii(text), text)\n" +
          "    # 뒤에서부터 치환해야 앞쪽 offset이 밀리지 않는다\n" +
          "    for e in sorted(entities, key=lambda x: x.offset, reverse=True):\n" +
          "        text = text[:e.offset] + \"*\" * e.length + text[e.offset + e.length:]\n" +
          "    return text",
      },
      { type: "heading", text: "측정 — 성공률 97.8%, 실패한 2.2%는 어떤 유형인가" },
      {
        type: "paragraph",
        text: "실제 이름·전화번호·주소가 포함된 샘플 텍스트셋을 만들어 마스킹 전/후를 비교하는 방식으로 성공률을 측정했다. 결과는 97.8%. 실패한 2.2%를 유형별로 뜯어보니 두 가지였다. 첫째, '민영이', '민 대리님'처럼 비정형적으로 표기된 이름(별명·줄임말)은 모델이 Person으로 잘 잡아내지 못했다. 둘째, 문맥상 애매한 숫자(주민등록번호인지 그냥 숫자인지 구분이 안 되는 경우)가 있었다.",
      },
      {
        type: "paragraph",
        text: "PII 마스킹은 정확도 100%를 목표로 하기보다, 어떤 정보를 놓쳤을 때 리스크가 큰지를 기준으로 화이트/블랙리스트 후처리를 겹겹이 쌓아가는 방식이 현실적이라는 걸 직접 구현하면서 느꼈다.",
      },
    ],
  },
  {
    id: "dl-cost-activation-function",
    title: "딥러닝 스터디 — Cost Function과 Activation Function",
    category: "study",
    excerpt:
      "MSE·MAE·Cross Entropy 등 손실 함수와 Sigmoid·ReLU·GELU 등 활성화 함수를 정리하고, Loss와 Cost의 차이·Gradient Descent가 필요한 이유까지 짚어봅니다.",
    date: "2026-07-16",
    content: [
      { type: "heading", text: "Cost Function 비용 함수" },
      {
        type: "paragraph",
        text: "데이터의 실제값과 예측값 사이의 오차를 줄이기 위한 함수. Cost Function이 없으면 모델이 더 나은 방향으로 학습을 진행할 수 없다.",
      },
      {
        type: "term",
        name: "MSE (Mean Squared Error)",
        description: "오차값에 제곱을 더해 오차를 더 크게 벌리도록 만든다. 회귀 문제에서 많이 사용된다.",
      },
      {
        type: "term",
        name: "MAE (Mean Absolute Error)",
        description: "오차를 절대값으로 계산해 이상치에 덜 민감하고 직관적이다.",
      },
      {
        type: "term",
        name: "Binary Cross Entropy",
        description: "이진 분류에서 많이 사용되고, 오차에 더 큰 패널티를 주는 형식이다.",
      },
      {
        type: "term",
        name: "Cross Entropy",
        description: "다중 클래스 분류에서 많이 사용하고, YOLO·ResNet·CNN 같은 모델에서 자주 쓰인다.",
      },
      {
        type: "code",
        code:
          "Cost Function과 Loss Function 차이\n" +
          "-> Loss는 데이터 1개의 오차이고, Cost는 전체 데이터 평균 오차를 의미한다.\n\n" +
          "Gradient Descent가 필요한 이유\n" +
          "-> Cost(오차)를 최대한 줄이기 위함. Gradient(기울기)가 0에 가까워지는 최소 지점을 찾기 위함.",
      },
      { type: "heading", text: "Activation Function 활성화 함수" },
      {
        type: "paragraph",
        text: "신경망이 비선형적인 복잡한 패턴을 학습할 수 있도록 해주는 함수.",
      },
      {
        type: "term",
        name: "Sigmoid",
        description:
          "0~1 사이 값으로 나타나 확률처럼 해석 가능해 이진 분류 출력층에서 많이 사용한다. 다만 깊은 신경망에서는 Gradient Vanishing(기울기 소실)이 발생하기 쉬워 잘 쓰지 않는다.",
      },
      {
        type: "term",
        name: "Gradient Vanishing (기울기 소실)이란?",
        description: "역전파 과정에서 층을 거치며 기울기가 계속 곱해져 0에 가까워지는 현상. 앞쪽 층의 가중치가 거의 업데이트되지 않아 학습이 멈춘 것처럼 보인다.",
      },
      {
        type: "term",
        name: "Tanh",
        description: "평균이 0이라 Sigmoid보다 학습이 안정적이지만, 역시 기울기 소실이 발생한다.",
      },
      {
        type: "term",
        name: "ReLU",
        description: "기울기 소실을 해결하기 위해 나온 함수이며 계산이 빠르다. f(x) = max(0, x). 대부분 CNN과 YOLO에서 사용한다.",
      },
      {
        type: "term",
        name: "Dead ReLU란?",
        description: "입력이 음수 구간에 머물러 뉴런이 계속 0만 출력하는 경우. 해당 뉴런은 더 이상 학습에 기여하지 못하고 죽은 상태가 된다.",
      },
      {
        type: "term",
        name: "Leaky ReLU",
        description: "ReLU의 단점을 개선해 음수에도 아주 작은 기울기를 유지한다. Dead ReLU 문제를 완화해 객체 탐지에 많이 사용된다.",
      },
      {
        type: "term",
        name: "GELU (Gaussian Error Linear Unit)",
        description: "최근 Transformer 계열에서 가장 많이 사용하는 함수이며 성능이 우수하다. BERT, ViT, Transformer 계열에서 많이 사용된다.",
      },
      {
        type: "term",
        name: "Softmax",
        description: "다중 분류에서 사용하는 활성화 함수. 각 클래스의 확률로 변환하며 총합은 항상 1이다. 객체 분류, 다중 클래스 분류에서 많이 사용한다.",
      },
      {
        type: "paragraph",
        text: "객체 탐지 모델도 내부적으로는 이런 활성화 함수를 그대로 쓴다. YOLO 계열은 백본에 ReLU 계열(Leaky ReLU, SiLU 등)을 주로 사용하고, Transformer 기반 탐지 모델은 GELU를 사용하는 식으로 모델 구조에 맞는 활성화 함수가 선택된다.",
      },
    ],
  },
];
