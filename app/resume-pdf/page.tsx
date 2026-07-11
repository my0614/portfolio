import { PROFILE } from "@/data/portfolio";

export const metadata = {
  title: "이력서 | 김민영",
};

const BLUE = "#3182f6";

type Achievement = { title: string; cause: string; solution: string; result?: string };

type Project = {
  title: string;
  period: string;
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
    company: "(주)무무즈",
    role: "매니저 · P&C",
    period: "2025.12 ~ 2026.03 (4개월)",
    intro: "이커머스 운영 자동화 시스템 구축을 통한 운영 효율 개선",
    projects: [
      {
        title: "핫딜 자동화 시스템",
        period: "2025.12 ~ 2026.03",
        achievements: [
          {
            title: "핫딜 등록 E2E 자동화 파이프라인",
            cause:
              "파트너사 핫딜 신청부터 상품 선정·등록·결과 메일 발송까지 전 과정이 수작업으로 진행되어 등록 작업에만 4시간 이상 소요",
            solution: "End-to-End 자동화 파이프라인 설계, Shopby API 연동 및 동적 스코어링으로 상위 200개 자동 선별",
            result: "작업 시간 4시간에서 2분으로 단축(99% 감소), 전 과정 무인 자동화",
          },
          {
            title: "OAuth 2.0 통합 인증 및 무중단 배치",
            cause: "Gmail·Sheets·Drive 3개 API를 개별 인증하던 구조에서 새벽 배치 실행 중 인증 만료로 파이프라인이 끊길 위험",
            solution: "OAuth 2.0 단일 credential 통합 인증 및 Refresh Token 자동 재발급 구조 설계",
            result: "무중단 배치 파이프라인 확보",
          },
          {
            title: "Bitbucket Pipelines CI/CD",
            cause: "Bitbucket Pipelines 미도입 상태로 배포 시마다 수동 반영",
            solution: "push, 테스트, EC2 배포까지 CI/CD 자동화 구축, dev/prod 브랜치별 배포 환경 분리",
            result: "배포 리드타임 단축, 배포 실수 리스크 제거",
          },
        ],
      },
      {
        title: "CS 문의 자동화",
        period: "2025.12 ~ 2026.03",
        achievements: [
          {
            title: "이중 API 기반 자동 응답 파이프라인",
            cause: "반복되는 배송 문의를 상담원이 수동 처리, 주말·비업무 시간 대응 불가로 응답 지연 발생",
            solution: "Shopby·Sellmate 이중 API 매칭 기반 케이스 자동 분기 로직 구현, cron 배치로 24/7 무중단 처리",
            result: "문의의 1/3 자동 처리, 응답 지연 시간 80% 단축",
          },
          {
            title: "케이스 분기 로직 설계",
            cause: "문의 유형이 뒤섞여 있어 자동 응답 오발송 리스크 존재",
            solution: "상품코드·송장번호 유무 조합으로 3케이스 분기, 처리 불가 케이스는 담당자 플래그로 분리",
            result: "오발송 리스크 제거, 응답 품질 일관성 확보",
          },
        ],
      },
    ],
  },
  {
    company: "한컴인스페이스",
    role: "연구원 · 소프트웨어플랫폼사업팀",
    period: "2021.10 ~ 2025.12 (4년 3개월)",
    intro: "AI 모델 학습·추론 파이프라인 고도화 및 위성·드론 영상 서비스 운영 효율 개선",
    projects: [
      {
        title: "사내 MLOps 플랫폼 DFLOW",
        period: "2022.01 ~ 2024.12",
        achievements: [
          {
            title: "통합 ML 백엔드 인터페이스",
            cause: "모델별로 입력 포맷·학습 방식·출력 구조가 달라 신규 모델 추가마다 반복 재구현 필요",
            solution: "GOD·MMDetection·MMYOLO 3개 프레임워크를 단일 ML 백엔드 인터페이스로 추상화",
            result: "지원 모델 3개에서 20개 이상으로 확장, 신규 온보딩 1~2주에서 1일로 단축",
          },
          {
            title: "Redis BRPOP 기반 학습 작업 큐",
            cause: "DB 폴링 방식의 학습 작업 큐에서 race condition으로 다중 Pod 환경 순서 보장 불가",
            solution: "Redis BRPOP 원자적 큐와 Redis Hash 상태 관리로 전환",
            result: "학습 대기 하루 이상 걸리던 것을 자동 순차 처리로 해소",
          },
          {
            title: "nvidia-smi 기반 GPU 동적 분배",
            cause: "GPU 가용 메모리 확인 없이 학습을 배정해 멀티 GPU 환경에서 OOM 장애 반복",
            solution: "nvidia-smi로 가용 메모리를 체크한 뒤 모델 요구량과 비교해 동적으로 GPU 분배",
            result: "멀티 GPU OOM 장애 제거",
          },
        ],
      },
      {
        title: "드론 탑재 실시간 객체 탐지 · 3D 가시화",
        period: "2023.01 ~ 2025.12",
        achievements: [
          {
            title: "RGB/Depth 프레임 동기화",
            cause: "RGB/Depth ROS Topic 프레임 불일치로 실시간 거리 계산 정확도 저하",
            solution: "ApproximateTimeSynchronizer로 slop·queue size를 실측 튜닝해 프레임 동기화",
            result: "거리 오차 30~40% 감소",
          },
          {
            title: "실환경 데이터 확장 및 재학습",
            cause: "저조도·빛번짐 환경에서 오탐·미탐이 빈번해 mAP 61%에 그침",
            solution: "원인별 데이터를 2,000장에서 6,000~7,000장으로 확장해 재학습",
            result: "mAP 61%에서 75%로 향상(14%p), KTL 시험 성적서 발급",
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
        achievements: [
          {
            title: "EO/IR 도메인별 모델 분리 학습",
            cause: "EO·IR 이미지를 단일 데이터셋으로 학습해 IR 환경에서 새·항공기 오탐 빈번",
            solution: "EO/IR 도메인별로 데이터셋을 분리해 독립 학습",
            result: "주야간 모두 안정적인 탐지 성능 확보",
          },
          {
            title: "소형 객체 특화 모델 최적화",
            cause: "표준 앵커·입력 해상도로는 원거리 소형 UAV 탐지율 저하",
            solution: "고해상도 입력과 소형 객체 특화 앵커·증강 적용",
            result: "소형 객체 탐지율 향상, 미탐 감소",
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
];

type SideProject = {
  title: string;
  org: string;
  period: string;
  achievements: Achievement[];
};

const SIDE_PROJECTS: SideProject[] = [
  {
    title: "쀼라인드 — 부부·연인 관계 케어 AI 웹앱",
    org: "Team Project · 5인 팀 DB/AI 분석 파이프라인 담당",
    period: "2026.06 ~ 07",
    achievements: [
      {
        title: "LangChain 기반 RAG 상담 챗봇",
        cause: "가사소송법·판례 상담 답변에 근거가 없어 신뢰도가 낮음",
        solution: "LangChain과 Azure AI Search로 법령·판례를 벡터 검색한 뒤 근거를 명시하는 RAG 파이프라인 설계",
        result: "출처를 명시한 상담 응답 생성",
      },
      {
        title: "pgvector 기반 유사도 검색",
        cause: "키워드 매칭만으로는 표현이 달라도 맥락이 유사한 고민을 찾지 못함",
        solution: "PostgreSQL pgvector로 임베딩 유사도 기반 추천·중복 판별 구현",
        result: "별도 벡터 DB 인프라 없이 추천과 중복판별 동시 처리",
      },
      {
        title: "LLM 감정 분석 구조화",
        cause: "감정·원인·패턴을 자유 문장으로 추출하면 DB 집계·리포트 신뢰성이 떨어짐",
        solution: "14개 그룹, 81개 라벨 JSON Schema 강제 포맷으로 구조화 추출",
        result: "필드 누락·포맷 깨짐 없이 안정적으로 DB에 저장",
      },
    ],
  },
  {
    title: "PillCare — AI 기반 건강 위험 분석 서비스",
    org: "식의약 공공데이터·AI 분석·활용 경진대회",
    period: "2026.05",
    achievements: [
      {
        title: "FastMCP 건강 데이터 서버",
        cause: "건강 데이터 분석 로직이 API마다 흩어져 있어 AI 어시스턴트가 실시간으로 활용하기 어려움",
        solution: "FastMCP 서버로 건강 지수·약물 안전도·환경 지수 3개 Tool 구현",
        result: "AI Agent가 실시간 사용자 데이터를 직접 조회해 개인화 응답 생성",
      },
      {
        title: "OpenAI Vision OCR 자동 등록",
        cause: "처방봉투 정보를 수기로 입력해야 하는 번거로움",
        solution: "OpenAI Vision API로 약품명·용량·복용 시점 자동 추출",
        result: "복약 스케줄 자동 등록, 수동 입력 단계 제거",
      },
      {
        title: "3단계 멀티 레이어 캐시",
        cause: "동일 질의가 반복될 때마다 OpenAI 호출 비용이 그대로 발생",
        solution: "L1 인메모리, L2 Redis, L3 OpenAI 3단계 캐시 설계",
        result: "비용 절감, Redis 장애 시에도 무중단 폴백 확보",
      },
    ],
  },
  {
    title: "이약머약 — AI 알약 식별 서비스",
    org: "MS AI School 10기 · Team 4 U",
    period: "2026.05.08 ~ 05.20",
    achievements: [
      {
        title: "핵심 90종 분류 모델 구축",
        cause: "전 성분·전 제형을 무분별하게 수집하면 클라우드 비용 부담과 데이터 오염 위험 증가",
        solution: "처방 통계·판매량 기반으로 핵심 90종을 선별, 학습 데이터 3,773개로 분류 모델 구축",
        result: "성능지표 평균 97% 달성",
      },
      {
        title: "FastAPI 비동기 예측 연동",
        cause: "동기 처리로는 다수 요청 시 응답 지연 우려",
        solution: "Azure Python SDK 예측 API를 FastAPI 비동기 엔드포인트와 통합",
        result: "AI 분석 평균 응답 2.4초",
      },
      {
        title: "Azure VM 올인원 배포",
        cause: "2주라는 짧은 개발 기간 내 기획부터 배포까지 완결해야 하는 제약",
        solution: "Azure VM 단일 서버에 FastAPI, PostgreSQL, Nginx를 올인원 배포",
        result: "2주 내 기획, 학습, 배포까지 풀스택 완성",
      },
    ],
  },
];

const EDUCATION = [
  { school: "고려사이버대학교", major: "AI·데이터과학부", period: "2022.02 ~ 2026.02 (졸업)" },
  { school: "대덕소프트웨어마이스터고등학교", major: "임베디드SW과", period: "2019.03 ~ 2022.02 (졸업)" },
];

const CERTS = [
  { name: "데이터분석 준전문가 (ADsP)", org: "한국데이터산업진흥원", date: "2024.11" },
  { name: "정보처리기능사", org: "한국산업인력공단", date: "2019.06" },
  { name: "컴퓨터활용능력 2급", org: "대한상공회의소", date: "2017.09" },
  { name: "ITQ 마스터", org: "한국생산성본부", date: "2017.08" },
];

const ACTIVITIES = [
  { title: "PillCare — 식의약 공공데이터·AI 분석·활용 경진대회", period: "2026" },
];

export default function ResumePDF() {
  return (
    <div
      style={{
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
        background: "#fff",
        color: "#111",
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
        <h1 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 4px" }}>
          {PROFILE.name}
          <span style={{ color: BLUE }}>.</span>
        </h1>
        <p style={{ fontSize: "11px", color: "#555", fontWeight: 700, margin: "0 0 8px" }}>
          {PROFILE.roleShort} Engineer
        </p>
        <p style={{ fontSize: "10px", color: "#666", margin: "0 0 14px" }}>
          <b style={{ color: "#111" }}>premierckim@gmail.com</b>
          <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
          github.com/my0614
          <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
          Seoul
        </p>
        <hr style={{ border: "none", borderTop: "2px solid #111", margin: "0 0 14px" }} />
      </div>

      {/* ── 기술 스택 ── */}
      <Section title="기술 스택">
        <div style={{ border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden" }}>
          {PROFILE.skills.map((cat, i) => (
            <div
              key={cat.category}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                borderTop: i === 0 ? "none" : "1px solid #f0f0f0",
              }}
            >
              <div style={{ background: "#f8f8f8", padding: "6px 10px", color: "#666", fontWeight: 700, fontSize: "9.5px" }}>
                {cat.category}
              </div>
              <div style={{ padding: "6px 12px", color: "#333" }}>{cat.skills.join(" · ")}</div>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── 경력 ── */}
      <SectionTitle>경력</SectionTitle>
      {JOBS.map((job, ji) => (
        <div key={job.company}>
          {ji > 0 && <Divider />}
          <div className="no-break" style={{ marginTop: "10px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 2px" }}>{job.company}</h3>
            <p style={{ margin: "0 0 3px" }}>
              <span style={{ fontWeight: 700 }}>{job.role}</span>
              <span style={{ color: "#999" }}> · {job.period}</span>
            </p>
            <p style={{ color: "#666", margin: "0 0 10px" }}>{job.intro}</p>
          </div>

          {job.projects.map((proj, pi) => (
            <div key={proj.title}>
              {pi > 0 && <Divider light />}
              <div style={{ marginBottom: "16px", marginTop: pi > 0 ? "12px" : 0 }}>
                <p className="no-break" style={{ margin: "0 0 6px", fontSize: "11px" }}>
                  <span style={{ fontWeight: 800 }}>{proj.title}</span>
                  <span style={{ color: "#999", fontSize: "9.5px" }}> · {proj.period}</span>
                </p>
                {proj.achievements.map((a, i) => (
                  <div key={i}>
                    {i > 0 && <Divider hair />}
                    <AchievementCard a={a} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <Divider />

      {/* ── 사이드 프로젝트 ── */}
      <SectionTitle>사이드 프로젝트</SectionTitle>
      {SIDE_PROJECTS.map((sp, si) => (
        <div key={sp.title}>
          {si > 0 && <Divider light />}
          <div style={{ marginTop: "10px", marginBottom: "16px" }}>
            <div className="no-break">
              <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 800 }}>{sp.title}</p>
              <p style={{ margin: "0 0 8px", fontSize: "9.5px", color: "#999" }}>
                {sp.org} · {sp.period}
              </p>
            </div>
            {sp.achievements.map((a, i) => (
              <div key={i}>
                {i > 0 && <Divider hair />}
                <AchievementCard a={a} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Divider />

      {/* ── 학력 ── */}
      <Section title="학력">
        <div style={{ border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#f8f8f8", fontSize: "9.5px", fontWeight: 700, color: "#666" }}>
            <div style={{ padding: "6px 10px" }}>학교</div>
            <div style={{ padding: "6px 10px" }}>전공</div>
            <div style={{ padding: "6px 10px" }}>기간</div>
          </div>
          {EDUCATION.map((e, i) => (
            <div key={e.school} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #f0f0f0" }}>
              <div style={{ padding: "6px 10px" }}>{e.school}</div>
              <div style={{ padding: "6px 10px", color: "#555" }}>{e.major}</div>
              <div style={{ padding: "6px 10px", color: "#555" }}>{e.period}</div>
            </div>
          ))}
        </div>
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

      {/* ── 활동 ── */}
      <Section title="활동">
        <ul style={{ margin: 0, paddingLeft: "16px" }}>
          {ACTIVITIES.map((a) => (
            <li key={a.title} style={{ marginBottom: "3px", color: "#333" }}>
              <b>{a.title}</b> <span style={{ color: "#999" }}>· {a.period}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* FOOTER */}
      <div style={{ marginTop: "20px", paddingTop: "8px", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#999" }}>
        <span>{PROFILE.name} · 이력서</span>
        <span>premierckim@gmail.com</span>
      </div>
    </div>
  );
}

function AchievementCard({ a }: { a: Achievement }) {
  return (
    <div className="no-break" style={{ marginBottom: "9px" }}>
      <p style={{ fontWeight: 700, margin: "0 0 3px" }}>{a.title}</p>
      <p style={{ margin: "0 0 1px", color: "#444" }}>
        <span style={{ color: "#999", fontWeight: 700 }}>원인</span> {a.cause}
      </p>
      <p style={{ margin: "0 0 1px", color: "#444" }}>
        <span style={{ color: "#999", fontWeight: 700 }}>해결</span> {a.solution}
      </p>
      {a.result && (
        <p style={{ margin: 0, color: "#333" }}>
          <span style={{ color: "#999", fontWeight: 700 }}>결과</span> <b style={{ fontWeight: 700 }}>{a.result}</b>
        </p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-break" style={{ marginTop: "18px", marginBottom: "8px" }}>
      <h2 style={{ fontSize: "13px", fontWeight: 800, color: "#111", margin: "0 0 4px" }}>{children}</h2>
      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: 0 }} />
    </div>
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

function Divider({ light, hair }: { light?: boolean; hair?: boolean }) {
  return (
    <hr
      className="no-break"
      style={{
        border: "none",
        borderTop: `1px solid ${hair ? "#f2f2f2" : light ? "#eee" : "#ddd"}`,
        margin: hair ? "7px 0" : "14px 0",
      }}
    />
  );
}
