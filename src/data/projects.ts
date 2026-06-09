export type Project = {
  id: string;
  type: "company" | "team" | "personal";
  title: string;
  company: string;
  summary: string;
  description?: string;
  tags: string[];
  year: string;
  images?: { src: string; caption?: string }[];
  video?: string;
  link?: string;
  sections: {
    기획의도?: string[];
    기술?: {
      title: string;
      description: string;
      points?: string[];
    }[];
    아키텍처?: string;
    성과?: string[];
    기대효과?: string[];
    회고?: string[];
  };
};

export const projects: Project[] = [
  {
    id: "hotdeal",
    type: "company",
    title: "핫딜 자동화 시스템",
    company: "(주)무무즈",
    summary: "OAuth 2.0으로 Google Spreadsheet·Gmail을 연동해 파트너사 신청부터 결과 메일 발송까지 전 과정을 자동화, 핫딜 등록 작업 4시간 → 2분으로 단축.",
    images: [
      { src: "/projects/hotdeal-app.png", caption: "무무즈 핫딜 오픈 화면" },
    ],
    link: "https://moomooz.co.kr/product/hotdeal",
    tags: ["Python", "OAuth 2.0", "Google Sheets API", "Gmail API", "Shopby API", "AWS EC2", "Cron", "Bitbucket Pipelines"],
    year: "2025.12.15 ~ 2026.03.13",
    sections: {
      아키텍처: "/projects/hotdeal-arch.svg",
      기획의도: [
        "핫딜 신청 집계·상품 선정·등록·결과 공유까지 MD가 하루 4시간 이상 수작업으로 처리",
        "파트너사 계정별로 결과 파일을 만들어 Gmail로 개별 발송하는 과정이 반복적이고 누락이 잦았음",
        "OAuth 2.0으로 Google Spreadsheet와 Gmail을 하나의 파이프라인으로 연결해 전 과정 자동화",
      ],
      기술: [
        {
          title: "OAuth 2.0 — Google Spreadsheet · Gmail 통합 자동화",
          description: "OAuth 2.0 하나로 Google Spreadsheet · Gmail을 단일 파이프라인으로 연결, 기존 Google Workspace를 자동화 인프라로 전환",
          points: [
            "OAuth 2.0 인증으로 Google Sheets API · Gmail API 동시 연동",
            "파트너사 계정별 신청 결과·선정 목록·오픈 일정을 파일로 생성 → Gmail 자동 발송",
            "별도 시스템 구축 없이 Google Workspace를 자동화 파이프라인으로 활용",
          ],
        },
        {
          title: "Google Spreadsheet 내 상품 매칭 및 랭킹 알고리즘",
          description: "Shopby API로 신청 상품 자동 매칭, 할인율·가격·재고 가중치 스코어링 → 상위 200개 선별",
          points: [
            "Shopby API 연동으로 신청 상품의 상품명·상품번호 자동 매칭",
            "할인율·가격 경쟁력·재고 가중치 스코어링 → 상위 200개 자동 선별",
            "신청 집계부터 선별까지 Spreadsheet 내에서 완결",
          ],
        },
        {
          title: "AWS EC2 + cron 실행 환경 및 CI/CD",
          description: "EC2에서 cron 배치 자동 실행, Bitbucket Pipelines로 push → 테스트 → EC2 배포 완전 자동화",
          points: [
            "AWS EC2에서 Python 코드 실행, cron으로 새벽 배치 자동 스케줄링",
            "Bitbucket Pipelines: push → 테스트 → 빌드 → EC2 배포 자동화",
            "브랜치별 배포 환경 분리 (dev / prod)",
          ],
        },
      ],
      성과: [
        "핫딜 등록 작업 시간 4시간 이상 → 2분 이내로 단축 (약 99% 감소)",
        "파트너사 계정별 결과 파일 메일 발송 자동화로 누락·오입력 리스크 제거",
        "상품 선정부터 등록·오픈·파트너사 알림까지 전 과정 무인 자동화",
      ],
    },
  },
  {
    id: "cs",
    type: "company",
    title: "CS 문의 자동화",
    company: "(주)무무즈",
    summary: "주문 정보를 기반으로 반복적인 배송 문의를 자동 응답하여 CS 업무 부담을 줄이고 응답 지연을 최소화.",
    images: [
      { src: "/projects/CS_자동화프로세스.png", caption: "CS 문의 자동화 프로세스" },
    ],
    tags: ["Python", "Shopby API", "Sellmate API", "Batch"],
    year: "2025.12.15 ~ 2026.03.13",
    sections: {
      아키텍처: "/projects/cs-arch.svg",
      기획의도: [
        "전체 CS의 상당수가 배송 현황을 묻는 단순 반복 문의 — 담당자 리소스가 낭비되는 구조",
        "업무 시간 외 응답 지연으로 고객 불만 누적, 주말·야간 공백 발생",
        "배송 문의는 주문번호·송장번호·배송 상태로 정형화 → LLM 없이 규칙 기반만으로 대부분 커버 가능",
        "자동화 범위를 명확히 정의하고, 범위 외 케이스는 플래그로 분리해 오답 발송 리스크 차단",
      ],
      기술: [
        {
          title: "규칙 기반 자동 응답 설계",
          description: "배송 문의 패턴 정형화 → LLM 없이 규칙 기반만으로 대부분 커버, 범위 외 케이스는 플래그 분리로 오답 발송 차단",
          points: [
            "정형화된 배송 문의 패턴 분석 → 케이스별 응답 템플릿 설계",
            "규칙 범위 외 케이스는 CS 담당자 플래그 처리, 오답 발송 방지",
          ],
        },
        {
          title: "Shopby / Sellmate API 이중 연동",
          description: "주문(Shopby) · 배송(Sellmate) 분리 API 동시 연동, 주문번호 기반으로 송장·배송 상태·입고 예정일 자동 조회",
          points: [
            "Shopby API: 주문 상품 정보·옵션 코드 조회",
            "Sellmate API: 송장번호·현재 배송 상태·입고 예정일 조회",
            "두 API 응답 매칭 → 배송 상태 판단 후 자동 응답 생성",
          ],
        },
        {
          title: "배치 스케줄러 기반 자동 처리",
          description: "웹훅 대신 주기 배치로 미처리 문의 일괄 조회, 주말·야간 포함 24/7 무중단 자동 처리",
          points: [
            "일정 주기 배치로 미처리 문의 일괄 조회 및 자동 응답 처리",
            "배송 상태 데이터 주기적 갱신으로 응답 정확도 유지",
            "주말·비업무 시간 포함 24/7 무중단 운영",
          ],
        },
      ],
      성과: [
        "전체 CS 문의의 약 1/3 자동 처리",
        "응답 지연 시간 80% 단축",
        "주말·비업무 시간 포함 24/7 무중단 운영",
      ],
    },
  },
  {
    id: "drone",
    type: "company",
    title: "민군겸용기술개발 R&D — 드론 탑재 실시간 객체 탐지",
    company: "한컴인스페이스",
    summary: "객체 탐지 mAP 61% → 75% 달성, 네트워크 세팅 2시간 → 1분으로 단축한 정찰 드론 실시간 위협 탐지 및 3D 가시화 시스템.",
    tags: ["ROS", "Docker", "Faster R-CNN", "RealSense D435i"],
    year: "2023 ~ 2025",
    images: [
      { src: "/projects/drone-detection.png", caption: "실시간 위협 객체 6종 클래스" },
    ],
    sections: {
      아키텍처: "/projects/drone-arch.svg",
      기획의도: [
        "영상을 지상으로 내려 분석하면 수 초 지연 발생, 통신 두절 시 대응 자체 불가",
        "드론 탑재 엣지 자원으로 RGB + Depth 카메라를 동시 운용해 현장에서 즉시 탐지",
        "2D 바운딩 박스 → 3D 좌표 변환 후 지상 관제 시스템으로 실시간 전송하는 End-to-End 구조",
        "민군겸용 기술 개발 과제 — KTL 시험 성적서 기준 달성이 필수 조건",
      ],
      기술: [
        {
          title: "RGB + Depth 카메라 프레임 동기화",
          description: "RGB/Depth publish 주기 차이 → ApproximateTimeSynchronizer slop·queue size 실측 튜닝, bbox 중심 Depth → RealSense intrinsic으로 3D 좌표 변환",
          points: [
            "ApproximateTimeSynchronizer: slop·queue size 실측 기반 튜닝으로 프레임 정합성 확보",
            "Depth 픽셀 → RealSense intrinsic → 3D XYZ 좌표 변환 파이프라인",
            "ROS Topic으로 3D 좌표 발행 → 지상 관제 시스템 실시간 가시화 연동",
          ],
        },
        {
          title: "Hard Negative Mining 기반 검출 성능 개선",
          description: "조도·Occlusion·배경 유사 환경 오탐·미탐 케이스 수집 → Hard Negative Mining 재학습, mAP 61% → 75% 달성",
          points: [
            "오탐·미탐 케이스 직접 수집 및 원인 분석 (조도·Occlusion·배경 유사성)",
            "Hard Negative Mining으로 어려운 케이스를 데이터셋에 반영 후 재학습",
            "mAP 61% → 75% (14%p 향상), KTL 시험 성적서 발급 완료",
          ],
        },
        {
          title: "네트워크 환경 자동 감지 및 설정",
          description: "현장마다 수동 IP 설정 2시간 소요 → 프로세스 시작 시 네트워크 환경 자동 감지·동적 구성, 세팅 시간 1분 이내",
          points: [
            "환경 자동 감지 → MASTER IP·드론 통신 설정 자동 구성",
            "네트워크 세팅 시간 2시간 이상 → 1분 이하로 단축",
          ],
        },
      ],
      성과: [
        "객체 탐지 mAP 61% → 75% (14%p 향상), KTL 시험 성적서 목표 달성 및 발급 완료",
        "RGB/Depth 동기화로 프레임 정합성 확보, 3D 좌표 거리 정확도 달성",
        "네트워크 세팅 시간 2시간 이상 → 1분 이하로 단축",
      ],
    },
  },
  {
    id: "dflow",
    type: "company",
    title: "사내 MLOps 플랫폼 DFLOW",
    company: "한컴인스페이스",
    summary: "지원 모델 3개 → 20개 이상 확장, 학습 대기 시간을 하루 → 수십 분으로 단축한 사내 MLOps 자동화 플랫폼.",
    tags: ["MMDetection", "Redis", "Docker", "K8s", "PostgreSQL", "PyTorch"],
    year: "2022 ~ 2024",
    images: [
      { src: "/projects/dflow-training-ui.png", caption: "모델 학습 상태 관리 (Connected → Preparing → Training)" },
      { src: "/projects/dflow-performance.png", caption: "모델 성능 평가 대시보드" },
    ],
    sections: {
      아키텍처: "/projects/dflow-arch.svg",
      기획의도: [
        "모델 도입 시마다 학습 스크립트 처음부터 작성, GPU 할당도 수동 조율 — 반복 비용 과다",
        "모델 수 증가 → 운영 부담 선형 증가, 학습 큐 없음 → 요청 집중 시 대기 하루 이상",
        "MMDetection config 표준화 + Redis 큐 자동화로 연구자가 실험에 집중할 수 있는 환경 구축",
      ],
      기술: [
        {
          title: "MMDetection config 기반 모델 추상화",
          description: "모델마다 PyTorch 루프 직접 구현 → MMDetection config 기반 전환, 신규 모델 온보딩 1~2주 → 1일 이내",
          points: [
            "신규 모델 온보딩: 코드 수정 없이 config 파일 교체만으로 처리",
            "model / dataset / schedule / runtime 4개 블록으로 학습 구성 표준화",
            "온보딩 기간 1~2주 → 1일 이내로 단축",
          ],
        },
        {
          title: "Redis BRPOP 기반 학습 작업 큐",
          description: "DB 폴링 race condition → Redis BRPOP 원자적 연산으로 해결, Redis Hash로 job 상태·GPU·에러 로그 중앙 관리",
          points: [
            "BRPOP: 원자적 pop으로 race condition 없는 작업 분배 보장",
            "Redis Hash: job 상태·GPU 번호·에러 로그 중앙 관리 → 실시간 상태 API",
            "작업 실패 시 에러 메시지 저장으로 디버깅 가능한 구조 확보",
          ],
        },
        {
          title: "nvidia-smi 기반 GPU 동적 분배",
          description: "job 처리 전 nvidia-smi로 가용 메모리 체크 → 모델 요구량 비교 후 GPU 할당, 조건 미충족 시 재큐잉으로 OOM 제거",
          points: [
            "nvidia-smi --query-gpu로 가용 메모리 실시간 조회",
            "모델 config에 min_gpu_memory 정의, Worker가 조건 검증 후 GPU 할당",
            "멀티 GPU OOM 장애 제거, 안정적 동시 학습 지원",
          ],
        },
      ],
      성과: [
        "지원 모델 수 3개 → 20개 이상",
        "신규 모델 온보딩 1~2주 → 1일 이내",
        "멀티 GPU OOM 장애 제거, 학습 대기 시간 하루 → 자동 순차 처리로 대폭 단축",
      ],
    },
  },
  {
    id: "PillCare",
    type: "team",
    title: "AI 기반 건강 위험 분석 및 맞춤형 건강 관리 서비스",
    company: "Team Project",
    summary: "복약·건강·환경 데이터를 통합 분석하여 개인 맞춤형 건강 위험을 예측하는 서비스.",
    tags: ["FastAPI", "OpenAI SDK", "OAuth 2.0", "Redis", "WeasyPrint", "Pydantic", "pytest"],
    year: "2026.05.08 ~ 2026.05.29",
    images: [
      { src: "/projects/pillcare_thum.webp", caption: "PillCare 서비스 화면" },
    ],
    sections: {
      아키텍처: "/projects/pillcare-arch.svg",
      기획의도: [
        "복약 불이행으로 인한 치료 실패·부작용이 고령자·만성질환자에게 반복적으로 발생",
        "기존 복약 앱은 단순 알림 수준 — 개인 맞춤 건강 리스크 감지는 없음",
        "처방봉투 사진 한 장으로 복약 스케줄 자동 등록, 수동 입력 단계 제거",
        "복약 이행률·약물 안전도·환경 지수를 통합 분석해 사전 건강 리스크 감지",
        "AI Agent가 MCP로 실시간 건강 데이터를 직접 조회 — 단순 알림을 넘어 관리 플랫폼으로",
      ],
      기술: [
        {
          title: "FastMCP 기반 건강 데이터 MCP 서버",
          description: "건강 데이터 분석 로직을 MCP Tool로 표준화, AI 어시스턴트가 실시간 건강 데이터 직접 조회 · 개인화 응답 생성",
          points: [
            "FastMCP로 MCP 서버 구현, 건강 지수·약물 안전도·환경 지수 3개 Tool 등록",
            "AI 어시스턴트가 실시간 사용자 건강 데이터를 직접 조회해 개인화 응답 생성",
            "Tool 단위 분리로 유지보수성 및 기능 확장 용이",
          ],
        },
        {
          title: "DDD 기반 도메인 레이어 설계",
          description: "11개 도메인 · 15개 테이블, 각 도메인 router → service → repository → model 독립 구성, 도메인 간 의존성 분리 · 영향 범위 한정",
          points: [
            "도메인별 router → service → repository → model 레이어 독립 구성",
            "도메인 간 의존성 최소화, 기능 변경 시 영향 범위 한정",
            "8개 도메인 통합 테스트 작성 (정상·예외 케이스 포함)",
          ],
        },
        {
          title: "3단계 멀티 레이어 캐시 (메모리 → Redis → OpenAI)",
          description: "LLM 비용·속도·장애 격리를 위한 3단계 캐시 설계, L2 히트 시 L1 자동 워밍업 · Redis 장애 시 OpenAI 폴백으로 무중단 보장",
          points: [
            "L1 인메모리(6h TTL) → L2 Redis(자정 초기화) → L3 OpenAI 순으로 캐시 히트 처리",
            "L2 히트 시 L1 자동 워밍업으로 후속 요청 응답 속도 향상",
            "Redis 장애 시 L3 폴백으로 서비스 무중단 보장",
          ],
        },
        {
          title: "OpenAI Vision API 처방봉투 OCR",
          description: "처방봉투 이미지 → OpenAI Vision API 파싱 → 약품명·용량·복용 시점 추출, 복약 스케줄 자동 등록",
          points: [
            "처방봉투 이미지 업로드 → OCR 파싱 → 약품명·용량·복용 시점 자동 추출",
            "파싱 결과를 복약 스케줄에 즉시 자동 등록, 수동 입력 단계 제거",
            "구조화된 응답 포맷으로 파싱 결과 검증 및 오류 처리",
          ],
        },
        {
          title: "asyncio 기반 비동기 알람 스케줄러",
          description: "FastAPI lifespan에 asyncio 스케줄러 통합, 30분 주기로 복약·병원·식사·수면·물·일지 6종 알람 스캔 · 중복 차단",
          points: [
            "FastAPI lifespan에 asyncio 스케줄러 통합, 별도 태스크 큐 불필요",
            "30분 주기 스캔으로 6종 알람 발화 시각 계산",
            "인메모리 세트로 동일 알람 중복 등록 차단",
          ],
        },
      ],
      기대효과: [
        "복약 관리 디지털화로 고령자·만성질환자의 자가 건강 관리 접근성 향상",
        "복약 이행률 개선을 통한 치료 효과 증대 및 의료비 절감 가능성 확보",
        "건강 데이터 누적 기반의 개인화 리포트로 환자-의사 간 진료 커뮤니케이션 효율화",
        "DUR 연계를 통한 복약 사고 예방으로 의료 안전망 보완 기여 가능",
      ],
    },
  },
  {
    id: "dear-me",
    type: "personal",
    title: "Dear Me",
    company: "Personal Project",
    summary: "오늘의 감정을 말로 기록하면 AI가 미래의 나에게 보내는 편지를 써주고 TTS로 낭독해주는 AI 타임캡슐 서비스.",
    tags: ["Python", "FastAPI", "React", "Azure Speech", "Azure OpenAI GPT-4o", "APScheduler", "SQLite"],
    year: "2026.06",
    images: [
      { src: "/projects/Dearme1.png", caption: "음성 녹음 메인 화면 · AI 비밀 친구 채팅" },
      { src: "/projects/Dearme2.png", caption: "감정 분석 결과 · GPT-4o 생성 편지" },
      { src: "/projects/Dearme3.png", caption: "QR 카드 저장 · 발송 날짜 및 채널 선택" },
    ],
    sections: {
      아키텍처: "/projects/dearme-arch.svg",
      기획의도: [
        "바쁜 일상 속에서 감정과 생각을 기록하고 되돌아볼 기회 부족",
        "기존 일기 서비스는 텍스트 작성 부담이 크고 기록 보관에만 집중",
        "음성 기록만으로 AI가 미래의 나에게 보내는 편지 자동 생성",
        "TTS 기반 편지 낭독 및 QR 카드 저장으로 특별한 회고 경험 제공",
        "지정한 날짜에 카카오톡·Discord·이메일로 자동 전달하여 과거와 미래의 나를 연결",
      ],
      기술: [
        {
          title: "Azure Speech SDK — STT · TTS 파이프라인",
          description: "Azure Speech STT로 음성 녹음 → 텍스트 변환, GPT-4o가 생성한 편지를 Azure Speech TTS로 낭독 — 입력부터 출력까지 음성 End-to-End",
          points: [
            "Azure Speech STT: 음성 녹음 스트림을 실시간으로 텍스트 변환",
            "Azure Speech TTS: 생성된 편지를 자연스러운 음성으로 합성·재생",
            "STT → GPT-4o → TTS 단일 파이프라인으로 음성 입출력 완결",
          ],
        },
        {
          title: "Azure OpenAI GPT-4o — 감정 분석 및 편지 생성",
          description: "STT 변환 텍스트에서 감정·맥락을 추출하고 '미래의 나에게' 형식의 편지 자동 생성, 지정 날짜·수신 채널을 반영한 개인화 메시지 작성",
          points: [
            "감정 분석: 음성 텍스트에서 감정 상태·핵심 키워드 추출",
            "편지 생성: 감정과 맥락을 바탕으로 미래의 나에게 보내는 편지 형식으로 작성",
            "지정 발송일·채널(카카오톡·Discord·이메일)을 컨텍스트에 반영한 개인화 메시지",
          ],
        },
        {
          title: "APScheduler 기반 자동 발송 스케줄러",
          description: "사용자가 지정한 날짜에 카카오톡·Discord·이메일 채널로 편지 자동 발송, FastAPI 내장 실행으로 별도 태스크 큐 없이 운영",
          points: [
            "APScheduler를 FastAPI lifespan에 통합, 별도 인프라 없이 스케줄 관리",
            "발송 채널별 Webhook·API 연동 (카카오톡·Discord·이메일) 분기 처리",
            "SQLite에 편지·발송 예약·상태 저장, 발송 완료 후 이력 기록",
          ],
        },
      ],
      기대효과: [
        "음성 입력만으로 기록 부담 없이 감정 일기 습관 형성 가능",
        "AI 생성 편지와 TTS 낭독으로 미래의 자신과 감성적으로 연결되는 회고 경험 제공",
        "QR 카드 출력·다채널 자동 발송으로 디지털 타임캡슐을 실물과 메신저 모두에서 수령",
        "텍스트 중심 일기 서비스와 차별화된 음성 기반 감정 아카이빙 플랫폼 가능성",
      ],
    },
  },
];
