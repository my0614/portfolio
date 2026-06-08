export type Project = {
  id: string;
  type: "company" | "team";
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
          description:  "OAuth 2.0 하나로 Google Spreadsheet(신청 접수·상품 선별)와 Gmail(파트너사별 결과 발송)을 하나의 파이프라인으로 연결. 별도 시스템 구축 없이 기존 Google Workspace를 자동화 파이프라인으로 전환.",
          points: [
            "OAuth 2.0 인증으로 Google Sheets API · Gmail API 동시 연동",
            "파트너사 계정별 신청 결과·선정 목록·오픈 일정을 파일로 생성 → Gmail 자동 발송",
            "별도 시스템 구축 없이 Google Workspace를 자동화 파이프라인으로 활용",
          ],
        },
        {
          title: "Google Spreadsheet 내 상품 매칭 및 랭킹 알고리즘",
          description: "파트너사 신청 데이터를 Shopby API와 자동 매칭하고, 할인율·가격 경쟁력·재고 수량 가중치 스코어링으로 상위 200개를 선별. 신청 집계부터 선별 자동화 구현",
          points: [
            "Shopby API 연동으로 신청 상품의 상품명·상품번호 자동 매칭",
            "할인율·가격 경쟁력·재고 가중치 스코어링 → 상위 200개 자동 선별",
            "신청 집계부터 선별까지 Spreadsheet 내에서 완결",
          ],
        },
        {
          title: "AWS EC2 + cron 실행 환경 및 CI/CD",
          description: "AWS EC2에서 cron으로 새벽 배치를 자동 실행해 핫딜 오픈 시각 정확도를 확보. Bitbucket Pipelines로 push 시 테스트·빌드·EC2 배포까지 자동화해 수동 배포 완전 제거.",
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
          description: "배송 문의 응답에 필요한 정보는 주문번호·송장번호·배송 상태·입고 예정일로 정형화되어 있다. LLM 도입 시 환각 리스크와 운영 비용이 크고, 규칙 기반으로도 대부분의 케이스를 커버 가능하다고 판단했다. 규칙 범위를 벗어난 케이스는 자동화에서 제외하고 CS 담당자에게 플래그 처리해 오답 발송 리스크를 원천 차단했다.",
          points: [
            "정형화된 배송 문의 패턴 분석 → 케이스별 응답 템플릿 설계",
            "규칙 범위 외 케이스는 CS 담당자 플래그 처리, 오답 발송 방지",
          ],
        },
        {
          title: "Shopby / Sellmate API 이중 연동",
          description: "주문 정보(Shopby)와 배송 현황(Sellmate)이 별도 API에 분리되어 있어 완전한 자동 응답을 위해 양 API를 동시 연동했다. 주문번호 기반으로 송장번호·배송 상태·입고 예정일을 자동 조회해 응답 메시지를 생성한다.",
          points: [
            "Shopby API: 주문 상품 정보·옵션 코드 조회",
            "Sellmate API: 송장번호·현재 배송 상태·입고 예정일 조회",
            "두 API 응답 매칭 → 배송 상태 판단 후 자동 응답 생성",
          ],
        },
        {
          title: "배치 스케줄러 기반 자동 처리",
          description: "실시간 웹훅 대신 일정 주기 배치로 미처리 문의를 일괄 조회한다. 구조가 단순하고 안정적이며, 주말·야간에도 최신 배송 정보를 기반으로 24/7 무중단 대응이 가능하다.",
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
          description: "RGB 카메라와 Depth 카메라의 publish 주기가 달라 ExactTimeSynchronizer로는 프레임 매칭이 거의 이루어지지 않았다. ApproximateTimeSynchronizer의 slop·queue size를 실제 하드웨어 publish 주기를 직접 측정해 튜닝했다. 동기화된 프레임에서 bounding box 중심 픽셀의 Depth 값을 읽고, RealSense intrinsic 파라미터로 3D 좌표를 계산한다.",
          points: [
            "ApproximateTimeSynchronizer: slop·queue size 실측 기반 튜닝으로 프레임 정합성 확보",
            "Depth 픽셀 → RealSense intrinsic → 3D XYZ 좌표 변환 파이프라인",
            "ROS Topic으로 3D 좌표 발행 → 지상 관제 시스템 실시간 가시화 연동",
          ],
        },
        {
          title: "Hard Negative Mining 기반 검출 성능 개선",
          description: "조도 변화·부분 가림(Occlusion)·배경 유사 환경에서 오탐·미탐이 빈번하게 발생했다. 실제 오탐·미탐 케이스를 직접 수집·분석하고 Hard Negative Mining을 적용해 데이터셋을 강화했다. 배경 이미지 다양화와 맞춤 데이터 보강 재학습을 통해 현장 검출 성능을 끌어올렸다.",
          points: [
            "오탐·미탐 케이스 직접 수집 및 원인 분석 (조도·Occlusion·배경 유사성)",
            "Hard Negative Mining으로 어려운 케이스를 데이터셋에 반영 후 재학습",
            "mAP 61% → 75% (14%p 향상), KTL 시험 성적서 발급 완료",
          ],
        },
        {
          title: "네트워크 환경 자동 감지 및 설정",
          description: "드론·현장 환경마다 IP를 수동으로 설정해야 해서 현장 세팅에 2시간 이상이 소요됐다. 프로세스 시작 시 네트워크 환경을 자동 탐지해 MASTER IP 및 드론 통신 설정을 동적으로 구성하는 자동 설정 로직을 구현했다.",
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
          description: "기존에는 모델마다 PyTorch 학습 루프를 직접 구현해야 해서 신규 모델 온보딩에 1~2주가 소요됐다. MMDetection의 config 기반 선언적 구조를 채택하면 모델 아키텍처·데이터셋·학습 파라미터를 config 파일 하나로 정의하고, 기존 파이프라인을 그대로 재사용할 수 있다. DINO·Co-DETR 등 transformer 계열 모델도 config 교체만으로 온보딩했다.",
          points: [
            "신규 모델 온보딩: 코드 수정 없이 config 파일 교체만으로 처리",
            "model / dataset / schedule / runtime 4개 블록으로 학습 구성 표준화",
            "온보딩 기간 1~2주 → 1일 이내로 단축",
          ],
        },
        {
          title: "Redis BRPOP 기반 학습 작업 큐",
          description: "DB 폴링 방식으로는 다수의 Worker Pod가 동시에 같은 job을 꺼내는 race condition이 발생했다. Redis의 BRPOP은 원자적 연산으로 한 번에 하나의 Worker만 job을 꺼낼 수 있어, 분산 락 없이 순차 처리를 보장한다. job_id 기반 Redis Hash로 상태(대기/실행 중/완료/실패)·GPU 번호·에러 로그를 중앙 관리해 실시간 진행 상태 API를 제공했다.",
          points: [
            "BRPOP: 원자적 pop으로 race condition 없는 작업 분배 보장",
            "Redis Hash: job 상태·GPU 번호·에러 로그 중앙 관리 → 실시간 상태 API",
            "작업 실패 시 에러 메시지 저장으로 디버깅 가능한 구조 확보",
          ],
        },
        {
          title: "nvidia-smi 기반 GPU 동적 분배",
          description: "Worker가 job을 꺼낸 뒤 GPU가 이미 포화 상태면 OOM으로 학습이 중단되는 문제가 반복됐다. job 처리 전 nvidia-smi로 가용 메모리를 체크해 모델별 최소 요구량과 비교 후 배치한다. 조건을 만족하는 GPU가 없으면 job을 다시 큐에 반환해 메모리 여유가 생길 때까지 대기하는 구조로 OOM 장애를 제거했다.",
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
          description: "건강 데이터 분석 로직을 MCP Tool로 표준화해 LLM이 실시간 사용자 건강 데이터를 직접 조회·활용할 수 있는 AI Agent 연동 구조를 구축했다. 건강 지수·약물 안전도·환경 지수를 별도 Tool로 등록해 AI 어시스턴트가 컨텍스트에 맞게 호출할 수 있도록 설계했다.",
          points: [
            "FastMCP로 MCP 서버 구현, 건강 지수·약물 안전도·환경 지수 3개 Tool 등록",
            "AI 어시스턴트가 실시간 사용자 건강 데이터를 직접 조회해 개인화 응답 생성",
            "Tool 단위 분리로 유지보수성 및 기능 확장 용이",
          ],
        },
        {
          title: "DDD 기반 도메인 레이어 설계",
          description: "auth·users·hospitals·medications·events 등 도메인별로 router → service → repository → model 레이어를 독립적으로 구성했다. 도메인 간 의존성을 최소화하고 기능 추가·변경 시 영향 범위를 해당 도메인으로 한정했다. 도메인 8개 통합 테스트를 작성해 정상·예외 케이스를 코드로 검증했다.",
          points: [
            "도메인별 router → service → repository → model 레이어 독립 구성",
            "도메인 간 의존성 최소화, 기능 변경 시 영향 범위 한정",
            "8개 도메인 통합 테스트 작성 (정상·예외 케이스 포함)",
          ],
        },
        {
          title: "3단계 멀티 레이어 캐시 (메모리 → Redis → OpenAI)",
          description: "LLM 호출 비용·응답 속도·장애 격리를 동시에 해결하기 위해 3단계 캐시를 설계했다. 동일 위험 요소 팁은 하루 OpenAI 1회 호출로 제한하고, L2 히트 시 L1을 자동 워밍업하며, Redis 장애 시에도 L3 폴백으로 서비스가 중단되지 않는다.",
          points: [
            "L1 인메모리(6h TTL) → L2 Redis(자정 초기화) → L3 OpenAI 순으로 캐시 히트 처리",
            "L2 히트 시 L1 자동 워밍업으로 후속 요청 응답 속도 향상",
            "Redis 장애 시 L3 폴백으로 서비스 무중단 보장",
          ],
        },
        {
          title: "OpenAI Vision API 처방봉투 OCR",
          description: "처방봉투 이미지에서 병원명·처방일·약품명·용량·복용 시점을 자동 파싱한다. 파싱 결과를 복약 스케줄에 즉시 등록해 수동 입력 단계를 완전히 제거했다.",
          points: [
            "처방봉투 이미지 업로드 → OCR 파싱 → 약품명·용량·복용 시점 자동 추출",
            "파싱 결과를 복약 스케줄에 즉시 자동 등록, 수동 입력 단계 제거",
            "구조화된 응답 포맷으로 파싱 결과 검증 및 오류 처리",
          ],
        },
        {
          title: "asyncio 기반 비동기 알람 스케줄러",
          description: "Celery 등 별도 태스크 큐 없이 FastAPI lifespan에 asyncio를 통합해 알람 스케줄러를 구현했다. 인메모리 세트로 동일 알람 중복 등록을 차단하고, 복약·병원예약·식사·수면·물·일지 6종 알람을 30분 주기로 스캔해 발화 시각을 계산한다.",
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
];
