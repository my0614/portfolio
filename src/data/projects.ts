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
    핵심기술?: { title: string; description: string }[];
    구현포인트?: string[];
    성과: string[];
    회고?: string[];
  };
};

export const projects: Project[] = [
  {
    id: "dflow",
    type: "company",
    title: "사내 MLOps 플랫폼 DFLOW",
    company: "한컴인스페이스",
    summary: "지원 모델 3개 → 20개 이상 확장, 학습 대기 시간을 하루 → 수십 분으로 단축한 사내 MLOps 자동화 플랫폼.",
    description: "모델마다 학습 스크립트를 새로 짜야 하는 구조를 표준화하고, 멀티 GPU 환경에서 안정적으로 동작하는 학습·추론 파이프라인을 구축",
    tags: ["MMDetection", "Redis", "Docker", "K8s", "PostgreSQL", "PyTorch"],
    year: "2022 ~ 2024",
    images: [
      { src: "/projects/dflow-training-ui.png", caption: "모델 학습 상태 관리 (Connected → Preparing → Training)" },
      { src: "/projects/dflow-performance.png", caption: "모델 성능 평가 대시보드" },
    ],
    sections: {
      핵심기술: [
        {
          title: "MMDetection 도입",
          description: "자체 추상화 레이어 대신 config 기반 선언적 구조를 선택. 신규 모델 추가 시 config 파일 하나만 작성하면 기존 파이프라인이 그대로 동작하도록 설계",
        },
        {
          title: "Redis Queue",
          description: "DB 폴링 방식은 다수 Worker Pod 환경에서 같은 job을 중복 처리하는 race condition 발생. BRPOP의 원자적 특성으로 분산 락 없이 순차 처리 보장",
        },
        {
          title: "GPU 분배 로직",
          description: "Worker가 job을 꺼내기 전 nvidia-smi로 가용 메모리를 체크해 모델별 최소 요구량과 비교 후 배치. OOM으로 학습이 중단되는 문제 제거",
        },
      ],
      구현포인트: [
        "job_id 기반 Redis Hash로 상태(대기/실행 중/완료/실패), GPU 번호, 에러 로그를 중앙 관리 → 실시간 진행 상태 API 제공",
        "신규 모델 온보딩 시 코드 수정 없이 config 교체만으로 처리 (DINO, Co-DETR 등 transformer 계열도 동일)",
        "K8s + Docker 기반 컨테이너 환경으로 배포 및 운영, Pod 단위 스케일링으로 학습 요청 급증 시에도 안정적 처리",
      ],
      성과: [
        "지원 모델 수 3개 → 20개 이상",
        "신규 모델 온보딩 1~2주 → 1일 이내",
        "멀티 GPU OOM 장애 제거, 학습 대기 시간 하루 → 자동 순차 처리로 대폭 단축",
      ],
    },
  },
  {
    id: "drone",
    type: "company",
    title: "민군겸용기술개발 R&D — 드론 탑재 실시간 객체 탐지",
    company: "한컴인스페이스",
    summary: "객체 탐지 mAP 61% → 75% 달성, 네트워크 세팅 2시간 → 1분으로 단축한 정찰 드론 실시간 위협 탐지 및 3D 가시화 시스템.",
    description: "정찰 드론에 RGB + Depth 카메라를 탑재해 위협 객체를 실시간 탐지하고, 3D 좌표를 계산해 지상 관제 시스템으로 전송하는 End-to-End AI 시스템을 개발",
    tags: ["ROS", "Docker", "Faster R-CNN", "RealSense D435i", ],
    year: "2023 ~ 2025",
    images: [
      { src: "/projects/drone-detection.png", caption: "실시간 위협 객체 6종 클래스" },
    ],
    sections: {
      핵심기술: [
        {
          title: "ApproximateTimeSynchronizer 적용",
          description: "두 카메라의 publish 주기가 달라 ExactTimeSynchronizer로는 매칭이 거의 안 됨. slop·queue size를 실측 기반으로 튜닝해 프레임 정합성 확보",
        },
        {
          title: "Hard Negative Mining 기반 객체 검출 성능 개선",
          description: "조도·고조도 환경 데이터 부족으로 오탐·미탐이 빈번하게 발생. 오탐·미탐 케이스를 수집하여 Hard Negative Mining을 수행하고, 배경 이미지 다양화 및 데이터 보강 재학습을 통해 현장 검출 성능 개선",
        },
        {
          title: "네트워크 자동 감지·세팅",
          description: "드론·환경마다 IP 수동 설정에 2시간 이상 소요. 환경 자동 감지 및 IP 자동 세팅 로직으로 설정 시간 2시간 → 1분 이하로 단축",
        },
      ],
      구현포인트: [
        "동기화된 Depth 프레임에서 bounding box 중심 픽셀의 Depth 값을 읽고, RealSense intrinsic 파라미터로 3D 좌표 변환 → ROS Topic으로 발행해 가시화 연동",
        "오탐·미탐 케이스를 직접 수집·분석하고, Hard Negative Mining을 통해 조도 변화·부분 가림(Occlusion)·배경 유사 객체 등 검출이 어려운 사례를 데이터셋에 반영하여 재학습 수행",
        "프로세스 시작 시 네트워크 환경을 자동 탐지하여 MASTER IP 및 드론 통신 설정을 동적으로 구성하는 자동 설정 기능 구현",
      ],
      성과: [
        "RGB/Depth 동기화로 프레임 정합성 확보, 거리 정확히 일치",
        "객체 탐지 mAP 61% → 75% (14%p 향상) 달성, KTL 시험 성적서 목표 달성 및 성적서 발급 완료",
        "네트워크 세팅 시간 2시간 이상 → 1분 이하로 단축",
      ],
    },
  },
  {
    id: "hotdeal",
    type: "company",
    title: "핫딜 자동화 시스템",
    company: "(주)무무즈",
    summary: "핫딜 등록 작업 평균 4시간 → 2분으로 단축, 파트너사 상품 신청부터 오픈까지 End-to-End 자동화.",
    description: "파트너사 상품 신청부터 등록·오픈까지 전 과정이 수작업으로 운영되던 핫딜 프로세스를 자동화",
    images: [
    { src: "/projects/hotdeal-app.png", caption: "무무즈 핫딜 오픈 화면" },
    ],
    link: "https://moomooz.co.kr/product/hotdeal",
    tags: ["Python", "OAuth 2.0", "BigQuery", "Cron"],
    year: "2025.12.15 ~ 2026.03.13",
    sections: {
      핵심기술: [
        {
          title: "핫딜 상품 랭킹 알고리즘 설계",
          description: "할인율, 가격 경쟁력, 재고 수량 등을 가중치 기반으로 평가하여 핫딜 후보 상품을 자동 선별하는 스코어링 로직 설계",
        },
        {
          title: "OAuth 2.0 기반 파트너사별 메일 발송",
          description: "파트너사별 인증 정보를 활용해 상품 등록 결과 및 선정 목록을 자동 발송하는 시스템을 구축하여 데이터 정합성을 확보하고 누락·오입력 리스크를 제거",
        },
        {
          title: "Bitbucket Pipelines + AWS EC2 CI/CD",
          description: "코드 푸시 시 테스트·빌드·배포가 자동 수행되도록 파이프라인 구축. 수동 배포 과정을 제거해 운영 안정성 확보 및 배포 리드타임 단축"
        }
      ],
      구현포인트: [
        "할인율·가격 경쟁력·재고 수량에 항목별 가중치를 부여해 상품별 점수를 산출하고, 상위 200개를 자동 선별해 Shopby 등록까지 이어지는 파이프라인 구축",
        "OAuth 2.0 인증 기반으로 파트너사별 인증 정보를 관리하고, 상품 등록 결과·선정 목록을 HTML 템플릿으로 각 파트너사에 개별 자동 발송",
        "Bitbucket Pipelines으로 push 이벤트 트리거 → 테스트·빌드·AWS EC2 배포까지 자동화, 브랜치별 배포 환경 분리로 운영 안정성 확보",
        "cron 기반 스케줄러로 새벽 시간대 배치 자동 실행, 서버 리소스 효율화 및 오픈 시각 정확도 확보",
        "BigQuery 기반 핫딜 등록·오픈 이력 적재 및 운영 데이터 조회 환경 구축",
      ],
      성과: [
        "핫딜 등록 작업 시간 4시간 이상 → 2분 이내로 단축 (약 99% 감소)",
        "상품 선정부터 등록·오픈·파트너사 알림까지 전 과정 자동화로 담당자 운영 리소스 절감",
        "가중치 기반 랭킹 알고리즘 도입으로 상품 선정 기준 일관성 확보, 수작업 검토 과정 제거",
        "OAuth 2.0 기반 파트너사별 자동 발송으로 누락·오입력 리스크 제거 및 커뮤니케이션 자동화",
        "CI/CD 파이프라인 구축으로 수동 배포 제거, 배포 안정성 확보"
      ],
    },
  },
  {
    id: "yiyakmoya",
    type: "team",
    title: "이약머약 — AI 알약 식별 서비스",
    company: "MS AI School 10기 | Team 4 U",
    summary: "성능지표 평균 97% 달성, 사진 한 장으로 약물 정보·DUR·도핑 금지 여부를 즉시 제공하는 Azure Custom Vision 기반 알약 식별 서비스.",
    tags: ["Python", "FastAPI", "PostgreSQL", "Azure Custom Vision", "Azure SDK", "Azure VM", "Fast API"],
    year: "2026.05.08 ~ 2026.05.20",
    link: "https://eyakmeoyak.koreacentral.cloudapp.azure.com/",
    video: "/projects/eyak.MOV",
    images: [
      { src: "/projects/performance_it3.png", caption: "Azure Custom Vision 모델 성능 지표 (Recall 97%)" },
    ],
    sections: {
      핵심기술: [
        {
          title: "Azure Custom Vision 선택",
          description: "2주 일정 내 모델 학습·배포가 목표. 자체 학습 인프라 없이 클라우드에서 색상·모양·각인을 종합 분석하는 엔터프라이즈 AI를 즉시 활용 가능한 구조 선택",
        },
        {
          title: "Background Augmentation 전략",
          description: "공공 데이터 배경 4종만으로 학습 시 실사용 환경(탁자·손바닥 등)에서 심각한 도메인 갭 발생. 배경 제거 전처리 후 다양한 실사용 배경을 합성 증강하여 과적합 해소",
        },
        {
          title: "회전 범위 제한 + 취약 클래스 맞춤 증강",
          description: "복합 증강 적용 시 알약 각인·형태 훼손으로 Custom Vision 학습 품질 저하. 회전 범위 ±45° → ±10° 축소로 각인 보존, Recall 기준치 이하 7종만 선별해 맞춤 증강하여 재현율 상향 평준화",
        },
      ],
      구현포인트: [
        "Azure Python SDK로 Custom Vision 예측 API 연동, FastAPI 비동기 엔드포인트와 통합해 평균 응답 2.4초 확보",
        "처방 통계·판매량 기반으로 핵심 90종만 선별 수집 → 클라우드 비용 절감 및 모델 실용성 향상",
        "Azure VM(Korea Central) 단일 서버에 FastAPI + PostgreSQL + Nginx 올인원 배포, Nginx 리버스 프록시로 외부 트래픽 처리 및 보안 강화",
      ],
      성과: [
        "Azure Custom Vision 모델 성능지표 평균 97% 달성 — 학습 데이터 3,773개, 분류 클래스 90종",
        "Azure SDK 기반 예측 API 연동으로 AI 분석 평균 2.4초, 전체 응답 3초 이내 확보",
        "Azure VM 단일 환경에서 2주 내 기획·학습·배포 풀스택 완성, 사진 한 장으로 DUR·도핑·병용금기까지 제공하는 고령자 친화 서비스 출시",
      ],
      회고: [
        "수익화 구조 및 비즈니스성이 부족하여 아쉬움 — 약국 SaaS(월 구독), 보험사 파트너십, 요양원 월정액 등 B2B 수익 모델을 초기부터 함께 설계했다면 서비스 방향이 더 뾰족했을 것",
        "약국 카운터 옆에 하드웨어와 함께 서비스를 두는 비즈니스성 기획을 했다면 훨씬 확장성이 높았을 것 같음",
        "클라우드 비용 사전 설계 미흡으로 초기 예산 초과 → 이후 실험 범위 제약, 인프라 비용 추정과 PoC 규모 결정을 먼저 하는 습관의 필요성을 체감",
        "향후 보완 방향: 처방전 OCR 연동으로 '약 봉투 없이도 복약 관리' 확장 / 약국 5~10곳 파일럿 도입 후 피드백 기반 개선 / Flutter 크로스플랫폼으로 모바일 앱 출시",
      ],
    },
  },
  {
    id: "cs",
    type: "company",
    title: "CS 문의 자동화",
    company: "(주)무무즈",
    summary: "전체 CS 문의 1/3 자동 처리, 응답 지연 시간 80% 단축한 배송 문의 자동화 시스템.",
    tags: ["Python", "Shopby API", "Sellmate API", "Batch"],
    year: "2025.12.15 ~ 2026.03.13",
    sections: {
      핵심기술: [
        {
          title: "배치 + 규칙 기반 방식 선택",
          description: "실시간 웹훅이나 AI 챗봇은 개발 비용 대비 실효성 낮음. 배송 문의 패턴이 고정적이므로 규칙 기반으로 충분하고, 배치 주기 처리로 서버 부담도 최소화",
        },
        {
          title: "Shopby / Sellmate API 이중 연동",
          description: "주문 정보와 배송 현황이 별도 API에 분리되어 있어 완전한 자동 응답을 위해 양 API 동시 연동 필요. 두 API에서 필요 데이터를 수집·매칭하여 배송 상태 판단 로직 구성",
        },
      ],
      구현포인트: [
        "주문번호 기반 주문 상품 정보 자동 조회, 송장번호·상품 옵션 코드·입고 예정일 등을 조건으로 자동 응답 로직 구현",
        "배치 프로세스를 통해 일정 주기로 배송 상태 데이터 갱신, 주말·비업무 시간에도 대응 가능한 구조 확보",
      ],
      성과: [
        "반복적인 배송 문의 자동화로 전체 CS 문의의 약 1/3 자동 처리, CS 응답 지연 시간 80% 단축",
        "정해진 규칙 기반 자동 응답으로 응답 품질 일관성 유지, 담당자 부재 시에도 무중단 운영 환경 구축",
      ],
    },
  },
];
