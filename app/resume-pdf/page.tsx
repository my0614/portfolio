import { PROFILE } from "@/data/portfolio";

export const metadata = {
  title: "이력서 | 김민영",
};

type Achievement = { title: string; cause: string; solution: string; result?: string };

type Project = {
  title: string;
  period: string;
  desc?: string;
  achievements: Achievement[];
};

type Job = {
  company: string;
  role: string;
  period: string;
  intro: string;
  projects: Project[];
};

const JOBS: Job[] = [
  {
    company: "한컴인스페이스",
    role: "연구원 · 소프트웨어플랫폼사업팀",
    period: "2021.10 ~ 2025.12 (4년 3개월)",
    intro: "AI 모델 학습·추론 파이프라인 고도화 및 위성·드론 영상 서비스 운영",
    projects: [
      {
        title: "사내 MLOps 플랫폼 DFLOW",
        period: "2022.01 ~ 2024.12",
        desc: "데이터 라벨링(오토라벨링)부터 학습 스케줄링, 학습 추적, 성능 평가, ONNX 추출까지 제공하는 통합 MLOps 플랫폼. 전 컴포넌트를 K8s 파드로 운영했습니다.",
        achievements: [
          {
            title: "통합 ML 백엔드 인터페이스",
            cause: "모델별로 입력 포맷·학습 방식·출력 구조가 달라 신규 모델 추가마다 반복 재구현 필요",
            solution: "GOD·MMDetection·MMYOLO 3개 프레임워크를 단일 ML 백엔드 인터페이스로 추상화",
            result: "지원 모델 3개에서 20개 이상으로 확장, 신규 온보딩 1~2주에서 1일로 단축",
          },
          {
            title: "오토라벨링 파이프라인",
            cause: "위성·드론 영상 라벨링을 전량 수작업으로 수행해, 데이터셋 구축이 학습 사이클 전체의 병목",
            solution:
              "학습된 모델의 추론 결과를 사전 라벨(pre-label)로 자동 생성해 라벨링 도구에 연동, 작업자는 처음부터 그리는 대신 검수·수정만 수행하는 구조로 전환. 검수 완료 데이터가 다시 학습에 투입되는 라벨링-학습 선순환 루프 구성",
            result: "라벨링 공수 대폭 절감, 모델이 좋아질수록 라벨링이 빨라지는 데이터 플라이휠 확보",
          },
          {
            title: "Redis BRPOP 기반 학습 작업 큐",
            cause: "DB 폴링 방식의 학습 작업 큐에서 race condition으로 다중 Pod 환경 순서 보장 불가",
            solution: "Redis BRPOP 원자적 큐와 Redis Hash 상태 관리로 전환",
            result: "학습 대기 하루 이상 걸리던 것을 자동 순차 처리로 해소",
          },
          {
            title: "GPU 자원 관리 — nvidia-smi 동적 분배에서 GPUShare 스케줄링으로",
            cause: "GPU 가용 메모리 확인 없이 학습을 배정해 멀티 GPU 환경에서 OOM 장애 반복",
            solution:
              "1차로 nvidia-smi로 가용 메모리를 실시간 확인해 모델 요구량과 비교하는 동적 분배 로직 구현, 이후 Aliyun GPUShare 도입으로 GPU를 fraction 단위로 나눠 쓰는 K8s 스케줄러 레벨 자원 관리로 발전. 학습 작업 자체도 Docker 컨테이너(K8s 파드) 단위로 실행해 환경 재현성과 격리 확보",
            result: "멀티 GPU OOM 장애 제거, 한정된 GPU 위에 더 많은 학습·추론 워크로드를 동시 배치할 수 있는 구조 확보",
          },
        ],
      },
      {
        title: "드론 탑재 실시간 객체 탐지 · 3D 가시화",
        period: "2023.01 ~ 2025.12",
        desc: "전쟁 지역·붕괴 위험 터널·저조도 환경 등 접근이 어려운 지역을 원격 탐색하는 드론 기반 실시간 객체 탐지 시스템.",
        achievements: [
          {
            title: "데이터셋이 없는 환경: 직접 촬영·라벨링·언리얼 합성으로 만든 학습 데이터",
            cause:
              "동굴·터널 내부 위협 객체는 공개 데이터셋 자체가 없었고, 초기 모델은 저조도·빛번짐 환경의 오탐·미탐으로 mAP 61%에 그침",
            solution:
              "실제 동굴에 직접 들어가 촬영하고 전량 라벨링 수행. 실측으로 확보할 수 없는 환경·객체 조합은 언리얼 엔진으로 3D 에셋을 제작해 합성 이미지를 생성하고 실사 배경과 합성. 오탐 원인별로 데이터를 2,000장에서 6,000~7,000장까지 3배 이상 확장해 재학습",
            result: "mAP 61%에서 75%로 향상(14%p), KTL 시험 성적서 발급",
          },
          {
            title: "RGB/Depth 프레임 동기화",
            cause: "RGB/Depth ROS Topic 프레임 불일치로 실시간 거리 계산 정확도 저하",
            solution: "ApproximateTimeSynchronizer로 slop·queue size를 실측 튜닝해 프레임 동기화",
            result: "거리 오차 30~40% 감소",
          },
          {
            title: "네트워크 환경 자동 세팅",
            cause: "드론·환경마다 네트워크 설정이 달라 수동 세팅에 2시간 이상 소요",
            solution: "서브넷 기반 환경 자동 판별과 IP 자동 세팅 로직 구현",
            result: "네트워크 세팅 시간 2시간에서 1분 이하로 단축(99% 감소)",
          },
        ],
      },
      {
        title: "EO/IR UAV 실시간 탐지·추적 시스템",
        period: "2024.06 ~ 2024.12",
        desc: "EO·IR 이중 도메인 환경에서 소형 UAV를 실시간 탐지·추적하는 모니터링 시스템.",
        achievements: [
          {
            title: "EO/IR 도메인별 모델 분리 학습",
            cause: "EO·IR 이미지를 단일 데이터셋으로 학습해 IR 환경에서 새·항공기 오탐 빈번",
            solution: "EO/IR 도메인별로 데이터셋을 분리해 독립 학습, 고해상도 입력과 소형 객체 특화 앵커·증강 적용",
            result: "주야간 모두 안정적인 소형 UAV 탐지 성능 확보, 미탐 감소",
          },
          {
            title: "K8s 6파드 RTSP 병렬 처리",
            cause: "단일 파드로 다중 카메라 스트림 처리 시 한 채널 장애가 전체에 영향",
            solution: "K8s 6개 파드로 EO/IR 카메라별 RTSP 스트림을 독립 처리",
            result: "6채널 실시간 병렬 처리, 장애 격리",
          },
        ],
      },
    ],
  },
  {
    company: "(주)무무즈",
    role: "매니저 · P&C",
    period: "2025.12 ~ 2026.03 (4개월)",
    intro: "이커머스 운영 자동화 시스템 구축",
    projects: [
      {
        title: "핫딜 자동화 시스템",
        period: "2025.12 ~ 2026.03",
        desc: "파트너사 핫딜 신청부터 상품 선정·등록·메일 발송까지 전 과정을 자동화한 이커머스 운영 파이프라인.",
        achievements: [
          {
            title: "핫딜 등록 E2E 자동화 파이프라인",
            cause:
              "파트너사 핫딜 신청부터 상품 선정·등록·결과 메일 발송까지 전 과정이 수작업으로 진행되어 등록 작업에만 4시간 이상 소요",
            solution: "Shopby API와 BigQuery를 연계해 상품번호·상품명 등 운영 데이터를 검증·매핑하고, 동적 스코어링으로 상위 200개 상품을 자동 선별 및 등록하는 End-to-End 자동화 파이프라인 구축",
            result: "작업 시간 4시간에서 2분으로 단축(99% 감소), 전 과정 무인 자동화",
          },
          {
            title: "OAuth 2.0 통합 인증 및 무중단 배치 · CI/CD",
            cause: "Gmail·Sheets·Drive 3개 API 개별 인증으로 새벽 배치 중 인증 만료 위험, 배포는 수동 반영",
            solution:
              "OAuth 2.0 단일 credential 통합 및 Refresh Token 자동 재발급 구조 설계, Bitbucket Pipelines로 테스트~EC2 배포 자동화(dev/prod 브랜치 분리)",
            result: "무중단 배치 파이프라인 확보, 배포 리드타임 단축 및 배포 실수 리스크 제거",
          },
        ],
      },
      {
        title: "CS 문의 자동화",
        period: "2025.12 ~ 2026.03",
        desc: "반복 배송 문의를 자동 응답으로 처리하는 24/7 무인 CS 파이프라인.",
        achievements: [
          {
            title: "이중 API 기반 자동 응답 파이프라인",
            cause: "반복되는 배송 문의를 상담원이 수동 처리, 주말·비업무 시간 대응 불가로 응답 지연 발생",
            solution:
              "Shopby·Sellmate 이중 API 매칭으로 상품코드·송장번호 조합 3케이스 분기, 처리 불가 케이스는 담당자 플래그로 분리, cron 배치로 24/7 처리",
            result: "문의의 1/3 자동 처리, 응답 지연 80% 단축, 오발송 리스크 제거",
          },
        ],
      },
    ],
  },
];

type MiscItem = { title: string; period?: string; desc: string; tags?: string[] };

const MISC_PROJECTS: MiscItem[] = [
  {
    title: "변화탐지 AI 플랫폼(APISS)",
    desc: "초소형군집위성 영상 기반 토지피복 세그멘테이션(나지·초지·농지·숲·수역·빌딩·도로) 및 20클래스 객체탐지 모델 학습. 객체탐지는 YOLO26을 우선 검토했으나 자체 데이터 벤치마크에서 성능이 기대에 못 미쳐 YOLO11m 채택, 릴리스 순서가 아닌 실측 결과 기반으로 모델 선정",
  },
  {
    title: "[DNA] DeepUNet 기반 수계탐지 추론 서비스",
    period: "2023.07 ~ 2023.10",
    desc: "위성영상 수계 세그멘테이션 모델 학습과 Flask 기반 추론 API 서버 구현에 참여. 학습된 모델을 API로 감싸 외부 시스템과 연동하는 구조를 다룬 첫 경험으로, 이후 DFLOW ML 백엔드 인터페이스 설계의 기반이 됨",
    tags: ["Python", "PyTorch", "Flask", "Docker"],
  },
  {
    title: "해운대 익수자(물놀이 안전사고) 탐지",
    desc: "해변 CCTV 영상 기반 물에 빠진 사람 실시간 탐지 모델 학습 수행",
    tags: ["YOLO"],
  },
  {
    title: "태양 흑점 탐지",
    desc: "태양 관측 영상 기반 흑점 세그멘테이션 모델 학습 수행",
    tags: ["UNet", "DeepUNet"],
  },
  {
    title: "국가 보안기관 위성영상 AI 플랫폼",
    desc: "TCD 변화탐지 모델 학습 수행",
    tags: ["UNet", "DeepUNet", "AttentionUNet", "HRNet"],
  },
];

const SKILLS = [
  { category: "Language", skills: ["Python", "C"] },
  { category: "NLP/LLM", skills: ["LLM", "RAG", "Azure OpenAI", "LangChain", "Prompt Engineering", "TTS"] },
  { category: "Vision", skills: ["YOLOv5", "Faster R-CNN", "RetinaNet", "MMDetection", "MambaCD"] },
  { category: "AI Framework", skills: ["PyTorch"] },
  { category: "Backend", skills: ["FastAPI", "Flask"] },
  { category: "DB", skills: ["PostgreSQL", "Redis", "ChromaDB", "pgvector"] },
  { category: "Infra/Cloud", skills: ["Docker", "Kubernetes", "Azure", "AWS EC2"] },
  { category: "Else", skills: ["Git", "Jira", "Label Studio", "MLflow"] },
];

const EDUCATION = [
  { school: "고려사이버대학교", major: "AI·데이터과학부", period: "2022.02 ~ 2026.02 (졸업)" },
  { school: "대덕소프트웨어마이스터고등학교", major: "임베디드SW과", period: "2019.03 ~ 2022.02 (졸업)" },
];

const CERTS = [
  { name: "데이터분석 준전문가 (ADsP)", org: "한국데이터산업진흥원", date: "2024.11" },
  { name: "정보처리기능사", org: "한국산업인력공단", date: "2019.06" },
];

type Activity = { title: string; period: string; desc?: string };
type ActivityGroup = { group: string; items: Activity[] };

const ACTIVITY_GROUPS: ActivityGroup[] = [
  {
    group: "복지서비스",
    items: [
      {
        title: "PillCare — AI 기반 건강 위험 분석 서비스",
        period: "식의약 공공데이터·AI 분석·활용 경진대회 · 2026.05",
        desc: "FastMCP 서버로 건강 지수·약물 안전도·환경 지수 3개 Tool을 구현해 AI Agent가 실시간 데이터를 직접 조회하도록 연동, L1 인메모리·L2 Redis·L3 OpenAI 3단계 캐시로 호출 비용 절감과 Redis 장애 시 무중단 폴백 확보",
      },
    ],
  },
  {
    group: "마이크로소프트 부트캠프",
    items: [
      {
        title: "이약머약 — AI 알약 식별 서비스",
        period: "1차 프로젝트 2위 · Team 4 U · 2026.05.08 ~ 2026.05.20",
        desc: "핵심 90종 알약 분류 모델(성능지표 평균 97%)과 FastAPI 비동기 예측 API, Azure VM 올인원 배포까지 2주 내 완성한 AI 알약 식별 서비스",
      },
      {
        title: "쀼라인드 — 부부·연인 관계 케어 AI 웹앱",
        period: "2차 프로젝트 1위 · 5인 팀 DB/AI 분석 파이프라인 담당 · 2026.06 ~ 2026.07",
        desc: "Azure AI Search 관리형 RAG 인프라 위에서 검색 트리거·scope 엄격도·폴백 전략을 응답 유형별로 설계한 오케스트레이션 레이어와 pgvector 유사도 검색·LLM 감정 분석 구조화(14개 그룹 81개 라벨)를 구현한 부부·연인 관계 케어 AI 웹앱",
      },
      {
        title: "Dear me,",
        period: "개인 프로젝트 1위 · 2026",
        desc: "LLM과 TTS 음성 합성을 결합해 구현한 개인 프로젝트",
      },
    ],
  },
];

export default function ResumePDF() {
  return (
    <div
      style={{
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
        background: "#fff",
        color: "#222",
        fontSize: "10.5px",
        lineHeight: "1.55",
        maxWidth: "820px",
        margin: "0 auto",
        padding: "36px 44px",
      }}
    >
      <style>{`
        @media print {
          @page { margin: 12mm 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          .page-break { page-break-before: always; }
          .no-break { break-inside: avoid; page-break-inside: avoid; }
        }
        .page-break { margin-top: 32px; }
        .no-break { break-inside: avoid; page-break-inside: avoid; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="no-break">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>{PROFILE.name}.</h1>
            <p style={{ fontSize: "11px", color: "#555", fontWeight: 700, margin: "0 0 10px" }}>
              {PROFILE.roleShort} Engineer
            </p>
            <div style={{ fontSize: "10px" }}>
              <ContactLine label="이메일" href="mailto:premierckim@gmail.com" text="premierckim@gmail.com" />
              <ContactLine label="GitHub" href="https://github.com/my0614" text="github.com/my0614" />
              <ContactLine label="웹사이트" href="https://mykim.site" text="mykim.site" />
              <ContactLine label="지역" text="Korea/Seoul" />
            </div>
          </div>
          <img
            src={PROFILE.photo}
            alt={PROFILE.name}
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #e5e5e5",
              flexShrink: 0,
            }}
          />
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "14px 0" }} />
      </div>

      {/* ── 인트로 ── */}
      <div style={{ marginBottom: "18px" }}>
        <IntroBlock heading="모델 3개짜리 파이프라인을, 20개 플랫폼으로">
          모델마다 입력 포맷·학습 방식·출력 구조가 달라 신규 모델 추가에 1~2주씩 걸리던 구조를, GOD·MMDetection·MMYOLO
          3개 프레임워크를 단일 ML 백엔드 인터페이스로 추상화해 <b>지원 모델 20개 이상, 신규 온보딩 1일</b>로
          줄였습니다. DB 폴링 학습 큐를 Redis BRPOP 원자적 큐로 전환해 하루 이상 밀리던 학습 대기를 자동 순차 처리로
          해소했고, nvidia-smi 기반 GPU 동적 분배로 멀티 GPU 환경의 OOM 장애를 제거했습니다.
        </IntroBlock>
        <IntroBlock heading="모델은 현장에서 검증되어야 한다">
          공개 데이터셋이 존재하지 않는 동굴·터널 환경에서, 직접 현장에 들어가 촬영·라벨링하고 언리얼 엔진으로 3D
          에셋을 제작해 합성 데이터를 만드는 것부터 시작했습니다. 이렇게 데이터를 2,000장에서 6,000~7,000장까지 3배
          이상 확장해, 저조도·빛번짐에서 무너지던 드론 탑재 탐지 모델을 <b>mAP 61% → 75%</b>까지 끌어올리고 KTL 시험
          성적서를 받았습니다. EO/IR 도메인 분리 학습과 소형 객체 특화 최적화로 주야간 UAV 탐지를 안정화했고, K8s
          6개 파드 RTSP 병렬 처리로 채널 장애가 전체로 번지지 않는 실시간 운영 구조를 만들었습니다. 이 밖에도 수계
          탐지, 경지(농지) 탐지, 초소형군집위성 토지피복 분류, TCD·MCD 변화탐지까지 도메인을 바꿔가며 모델 학습을
          이어왔습니다.
        </IntroBlock>
        <IntroBlock heading="도메인이 바뀌어도, 자동화의 문법은 같았다">
          이커머스로 도메인을 옮겨서도 같은 방식으로 문제를 풀었습니다. 파트너사 신청부터 등록·메일 발송까지{" "}
          <b>4시간 걸리던 핫딜 운영을 E2E 파이프라인으로 2분(99% 단축)</b>까지 줄여 무인화했고, Shopby·Sellmate 이중
          API 매칭으로 <b>CS 문의 1/3을 자동 응답</b>으로 전환해 응답 지연을 80% 줄였습니다. 위성·드론에서 익힌
          파이프라인 설계가 특정 도메인에 묶인 기술이 아님을 확인한 경험입니다.
        </IntroBlock>
        <p className="no-break" style={{ margin: "8px 0 0", color: "#333" }}>
          이 경험을 더 큰 규모의 ML 시스템 운영으로 이어가고 싶습니다.
        </p>
      </div>

      {/* ── 경력 ── */}
      <SectionTitle>경력</SectionTitle>
      {JOBS.map((job, ji) => (
        <div key={job.company}>
          <div className="no-break" style={{ marginTop: ji === 0 ? "10px" : "12px", marginBottom: "10px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 2px" }}>{job.company}</h3>
            <p style={{ margin: "0 0 2px" }}>
              <span style={{ fontWeight: 700 }}>{job.role}</span>
              <span style={{ color: "#999" }}> · {job.period}</span>
            </p>
            <p style={{ margin: "0 0 4px", fontSize: "9.5px", color: "#999" }}>{job.intro}</p>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {job.projects.map((proj) => (
                <li key={proj.title} style={{ color: "#555", fontSize: "9.5px" }}>
                  {proj.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* ── 프로젝트 ── */}
      <SectionTitle>프로젝트</SectionTitle>
      {JOBS.map((job, ji) => (
        <div key={job.company} className={job.company === "(주)무무즈" ? "page-break" : undefined}>
          <p
            className="no-break"
            style={{
              margin: ji === 0 ? "10px 0 8px" : "14px 0 8px",
              fontSize: "9.5px",
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            {job.company}
          </p>

          <div style={{ paddingLeft: "16px" }}>
            {job.projects.map((proj, pi) => (
              <ProjectCard key={proj.title} proj={proj} first={pi === 0} />
            ))}

            {job.company === "한컴인스페이스" && (
              <div className="no-break" style={{ marginTop: "14px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700 }}>그 외 모델 학습·서빙 경험</p>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {MISC_PROJECTS.map((m) => (
                    <li key={m.title} style={{ marginBottom: "6px", color: "#444" }}>
                      <b style={{ color: "#222" }}>{m.title}</b>
                      {m.period && <span style={{ color: "#999" }}> ({m.period})</span>} — {m.desc}
                      {m.tags && <span style={{ color: "#999", fontSize: "9px" }}> ({m.tags.join(" · ")})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── 기술 스택 ── */}
      <Section title="기술 스택">
        <div style={{ paddingLeft: "16px" }}>
          {SKILLS.map((cat) => (
            <p key={cat.category} style={{ margin: "0 0 4px" }}>
              <span style={{ display: "inline-block", width: "88px", color: "#888", fontWeight: 700, fontSize: "9.5px" }}>
                {cat.category}
              </span>
              <span style={{ color: "#333" }}>{cat.skills.join(" · ")}</span>
            </p>
          ))}
        </div>
      </Section>

      {/* ── 학력 ── */}
      <Section title="학력">
        <ul style={{ margin: 0, paddingLeft: "16px" }}>
          {EDUCATION.map((e) => (
            <li key={e.school} style={{ marginBottom: "3px", color: "#333" }}>
              <b>{e.school}</b> <span style={{ color: "#999" }}>· {e.major} · {e.period}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 자격증 ── */}
      <Section title="자격증">
        <ul style={{ margin: 0, paddingLeft: "16px" }}>
          {CERTS.map((c) => (
            <li key={c.name} style={{ marginBottom: "3px", color: "#333" }}>
              <b>{c.name}</b> <span style={{ color: "#999" }}>· {c.org} · {c.date}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 대외활동 ── */}
      <Section title="대외활동">
        {ACTIVITY_GROUPS.map((g, gi) => (
          <div key={g.group} style={{ marginTop: gi === 0 ? 0 : "10px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "#555" }}>{g.group}</p>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {g.items.map((a) => (
                <li key={a.title} style={{ marginBottom: "8px", color: "#333" }}>
                  <b>{a.title}</b> <span style={{ color: "#999" }}>· {a.period}</span>
                  {a.desc && (
                    <p style={{ margin: "3px 0 0", color: "#444", fontSize: "9.5px", lineHeight: "1.6" }}>
                      {a.desc}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* FOOTER */}
      <div style={{ marginTop: "20px", paddingTop: "8px", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#999" }}>
        <span>{PROFILE.name} · 이력서</span>
        <span>premierckim@gmail.com</span>
      </div>
    </div>
  );
}

function ProjectCard({ proj, first }: { proj: Project; first: boolean }) {
  return (
    <div style={{ marginTop: first ? 0 : "14px", marginBottom: "10px" }}>
      <div className="no-break" style={{ marginBottom: "6px" }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#222" }}>
          {proj.title}
          <span style={{ color: "#999", fontWeight: 500, fontSize: "9.5px" }}> · {proj.period}</span>
        </p>
        {proj.desc && <p style={{ margin: "3px 0 0", color: "#777", fontSize: "9.5px" }}>{proj.desc}</p>}
      </div>
      <div style={{ paddingLeft: "12px", borderLeft: "1px solid #e5e5e5" }}>
        {proj.achievements.map((a, i) => (
          <AchievementCard key={i} a={a} />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({ a }: { a: Achievement }) {
  return (
    <div className="no-break" style={{ marginBottom: "10px" }}>
      <p style={{ fontWeight: 700, margin: "0 0 3px", fontSize: "10px", color: "#222" }}>{a.title}</p>
      <p style={{ margin: "0 0 1px", color: "#444" }}>
        <span style={{ color: "#999", fontWeight: 700 }}>원인</span> {a.cause}
      </p>
      <p style={{ margin: "0 0 1px", color: "#444" }}>
        <span style={{ color: "#999", fontWeight: 700 }}>해결</span> {a.solution}
      </p>
      {a.result && (
        <p style={{ margin: 0, color: "#333" }}>
          <span style={{ color: "#999", fontWeight: 700 }}>결과</span> {a.result}
        </p>
      )}
    </div>
  );
}

function ContactLine({ label, text, href }: { label: string; text: string; href?: string }) {
  return (
    <p style={{ margin: "0 0 4px" }}>
      <span style={{ display: "inline-block", width: "48px", color: "#999" }}>{label}</span>
      {href ? (
        <a href={href} style={{ color: "#222", fontWeight: 700, textDecoration: "none" }}>
          {text}
        </a>
      ) : (
        <span style={{ color: "#222", fontWeight: 700 }}>{text}</span>
      )}
    </p>
  );
}

function IntroBlock({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="no-break" style={{ marginBottom: "10px" }}>
      <p style={{ fontWeight: 700, fontSize: "11px", margin: "0 0 4px", color: "#222" }}>{heading}</p>
      <p style={{ margin: 0, color: "#444" }}>{children}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="no-break"
      style={{
        fontSize: "17px",
        fontWeight: 700,
        color: "#222",
        margin: "26px 0 10px",
        letterSpacing: "-0.2px",
        borderBottom: "1px solid #333",
        paddingBottom: "5px",
      }}
    >
      {children}
    </h2>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}
