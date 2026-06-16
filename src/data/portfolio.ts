export type Metric = { value: string; label: string; from?: string };

export type TechItem = {
  title: string;
  description: string;
  points?: string[];
  images?: { src: string; caption?: string }[];
  table?: {
    headers: string[];
    rows: { cells: string[]; highlight?: boolean }[];
  };
};

export type ProjectData = {
  id: string;
  type: "company" | "team" | "personal";
  title: string;
  subtitle?: string;
  company: string;
  initial: string;
  summary: string;
  thumb: string;
  image: { src: string; caption?: string };
  image2?: { src: string; caption?: string };
  image3?: { src: string; caption?: string };
  image4?: { src: string; caption?: string };
  link?: string;
  tags: string[];
  year: string;
  metrics: Metric[];
  sections: {
    arch?: string;
    intent?: string[];
    flow?: { title: string; description: string }[];
    tech: TechItem[];
    result?: string[];
    expect?: string[];
  };
};

export type ProfileData = {
  name: string;
  nameEn: string;
  role: string;
  roleShort: string;
  photo: string;
  intro: string[];
  systemInfo: [string, string][];
  skills: { category: string; skills: string[] }[];
  contact: { kind: "phone" | "mail" | "github"; label: string; href: string }[];
};

export const PROFILE: ProfileData = {
  name: "김민영",
  nameEn: "KIM MIN YOUNG",
  role: "MLOps/Backend · MLOps 개발자",
  roleShort: "ML / MLOps",
  photo: "/profile.png",
  intro: [
    "이커머스 도메인에서 데이터 파이프라인 구축부터 모델 학습·서빙·인프라 운영까지 End-to-End를 직접 담당해온 5년 차 ML 엔지니어입니다.",
    "RealSense 카메라, 드론 영상, 항공 영상, RTSP 영상 등 다양한 영상 데이터를 다루며 데이터 수집부터 모델 개발, 배포·운영까지 이어지는 End-to-End ML 파이프라인 구축에 강점을 가지고 있습니다.",
  ],
  systemInfo: [
    ["Location", "Seoul, South Korea"],
    ["Experience", "5년차"],
    ["Specialization", "ML/MLOps · Computer Vision"],
    ["Status", "Open for opportunities"],
  ],
  skills: [
    { category: "Language", skills: ["Python", "C"] },
    { category: "Framework", skills: ["PyTorch", "Flask", "FastAPI", "Label Studio", "MLflow"] },
    { category: "Database", skills: ["PostgreSQL", "Redis"] },
    { category: "Infra", skills: ["Docker", "Kubernetes"] },
    { category: "Cloud", skills: ["Azure", "AWS EC2"] },
    { category: "Models", skills: ["YOLOv5", "Faster R-CNN", "RetinaNet", "MMDetection", "MambaCD"] },
    { category: "Else", skills: ["Git", "Jira"] },
  ],
  contact: [
    { kind: "mail", label: "premierckim@gmail.com", href: "mailto:premierckim@gmail.com" },
    { kind: "github", label: "github.com/my0614", href: "https://github.com/my0614" },
  ],
};

export const PROJECTS: ProjectData[] = [
  {
    id: "hotdeal",
    type: "company",
    title: "핫딜 자동화 시스템",
    company: "(주)무무즈",
    initial: "무",
    summary: "단독 최저가 상품을 빠르게 발굴하고 경쟁사보다 먼저 프로모션을 진행하기 위해 구축한 핫딜 운영 자동화 시스템. 파트너사 신청부터 상품 선정, 등록, 결과 메일 발송까지의 업무를 자동화하여 운영 시간을 단축하고, 더 많은 핫딜을 안정적으로 운영할 수 있는 환경을 구축했습니다.",
    thumb: "/projects/hotdeal-app.png",
    image: { src: "/projects/hotdeal-app.png", caption: "무무즈 핫딜 오픈 화면" },
    link: "https://moomooz.co.kr/product/hotdeal",
    tags: ["OAuth 2.0", "Google Sheets API", "Gmail API", "Shopby API", "AWS EC2", "Bitbucket Pipelines", "Cron", "Python"],
    year: "2025.12 ~ 2026.03",
    metrics: [
      { value: "2분", label: "등록 작업 시간", from: "4시간+" },
      { value: "99%↓", label: "작업 시간 단축" },
      { value: "무인", label: "전 과정 자동화" },
    ],
    sections: {
      arch: "/projects/hotdeal-arch.svg",
      intent: [
        "핫딜 신청 집계·상품 선정·등록·결과 공유까지 MD가 하루 4시간 이상 수작업으로 처리",
        "매 회차마다 파트너사 계정별 결과 파일을 수작업 생성 후 개별 발송 — 누락·오발송이 반복되며 운영 신뢰도 리스크로 이어짐",
        "별도 시스템 구축 없이 이미 사용 중인 Google Workspace를 자동화 인프라로 전환, OAuth 2.0으로 Spreadsheet·Gmail을 단일 파이프라인으로 연결해 전 과정 자동화",
      ],
      tech: [
        {
          title: "Google Spreadsheet 내 상품 매칭 및 랭킹 알고리즘",
          description:
            "Shopby API로 신청 상품 자동 매칭, 당회차 실제 등록 상품 비율 기반 동적 가중치 스코어링으로 상위 200개 자동 선별",
          points: [
            "고정 기준값 대신 회차별 실제 데이터를 반영한 동적 스코어링으로 상위 200개 자동 선별",
            "할인율·가격 경쟁력·재고 수량 3개 지표를 당회차 실제 등록 상품 비율 기반으로 가중치 산정",
            "Shopby API 연동으로 신청 상품의 상품명·상품번호 자동 매칭",
            "신청 집계부터 선별까지 Spreadsheet 내에서 완결, 별도 DB 없이 운영",
          ],
        },
        {
          title: "OAuth 2.0 — Google Spreadsheet · Gmail 통합 자동화",
          description:
            "InstalledAppFlow 기반 OAuth 2.0으로 Gmail · Sheets · Drive 3개 API를 단일 토큰으로 인증, " +
            "Refresh Token 자동 재발급으로 배치 실행 중 인증 단절 없는 무중단 파이프라인 구축",
          points: [
            "Gmail · Sheets · Drive 멀티 스코프를 단일 credential로 통합 인증",
            "Refresh Token 만료 감지 → 자동 재발급 로직으로 새벽 배치 중 인증 단절 방지",
            "MIMEMultipart 기반 발송 모듈 직접 설계 — HTML 템플릿 치환 · CID 인라인 이미지 · 파일 첨부 단일 클래스로 캡슐화",
            "BCC 일괄 발송으로 파트너사 간 수신자 정보 노출 차단",
          ],
        },
        {
          title: "AWS EC2 + cron 실행 환경 및 CI/CD",
          description: "EC2에서 cron 배치 자동 실행, Bitbucket Pipelines로 push → 테스트 → EC2 배포 완전 자동화",
          points: [
            "AWS EC2에서 Python 코드 실행, cron으로 새벽 배치 자동 스케줄링",
            "Bitbucket Pipelines: push → 테스트 → 빌드 → EC2 배포 자동화",
            "브랜치별 배포 환경 분리 (dev / prod)",
            "cron 실행 중 오류 발생 시 Slack Incoming Webhook으로 즉시 알림 발송",
            "배치 완료 후 정상·실패 건수 요약 메시지 Slack Incoming Webhook으로 자동 발송 → MD·개발팀이 스케줄링 실행 결과 실시간 확인 가능",
          ],
        },
      ],
      result: [
        "핫딜 등록 작업 시간 4시간 이상 → 2분 이내로 단축 (약 99% 감소)",
        "파트너사 계정별 결과 파일 메일 발송 자동화로 누락·오입력 리스크 제거",
        "상품 선정부터 등록·오픈·파트너사 알림까지 전 과정 무인 자동화",
        "별도 메일링 SaaS·인프라 도입 없이 Google Workspace만으로 자동화 파이프라인 구현",
      ],
    },
  },
  {
    id: "cs",
    type: "company",
    title: "CS 문의 자동화",
    company: "(주)무무즈",
    initial: "무",
    summary: "반복적인 배송 문의로 인해 상담 인력이 단순 응대에 집중되는 문제를 해결하고자 구축한 CS 자동화 시스템. 주문 정보를 기반으로 문의를 자동 분류·응답하여 고객 응답 시간을 단축하고 상담 인력이 고부가가치 업무에 집중할 수 있도록 지원했습니다.",
    thumb: "/projects/cs-main.png",
    image: { src: "/projects/cs-main.png", caption: "CS 문의 자동화 시스템 개요" },
    image2: { src: "/projects/CS_자동화프로세스.png", caption: "CS 문의 자동화 프로세스" },
    tags: ["Shopby API", "Sellmate API", "Batch", "Python"],
    year: "2025.12 ~ 2026.03",
    metrics: [
      { value: "1/3", label: "문의 자동 처리" },
      { value: "80%↓", label: "응답 지연 시간" },
      { value: "24/7", label: "무중단 운영" },
    ],
    sections: {
      intent: [
        "쉐어러 3명 + CS 파트 1명, 총 4인이 1:1 게시판을 직접 응대 — 배송 문의 비중이 높아 담당자 리소스의 상당 부분이 단순 반복 업무에 소모되는 구조",
        "업무 시간 외 응답 지연으로 고객 불만 누적, 주말·야간 공백 발생",
        "배송 문의는 주문번호·송장번호·배송 상태로 정형화 → LLM 없이 규칙 기반만으로 대부분 커버 가능",
        "자동화 범위를 명확히 정의하고, 범위 외 케이스는 플래그로 분리해 오답 발송 리스크 차단",
      ],
      tech: [
        {
          title: "이중 API 응답 기반 케이스 분기 설계",
          description:
            "Shopby(주문) · Sellmate(재고/배송) 두 API 응답을 매칭하여 상품코드·송장번호 유무 조합으로 3가지 케이스를 분기, 케이스별 HTML 템플릿을 자동 선택해 Shopby answer API로 등록",
          points: [
            "상품코드 X / 송장번호 O → 1-2일 내 출고 안내 템플릿",
            "상품코드 O / 송장번호 O → 입고예정일 안내 템플릿 (남대문/리오더)",
            "상품코드 O / 송장번호 X → 기본 배송 안내 템플릿",
            "두 조건 모두 없는 케이스는 자동 처리 제외 → 담당자 플래그 분리, 오답 발송 차단",
            "입고예정일 데이터 유효성 검증 — 과거 날짜 등록된 케이스 감지 시 기본 배송 안내로 자동 fallback",
          ],
        },
        {
          title: "Shopby / Sellmate API 이중 연동",
          description:
            "주문(Shopby) · 배송(Sellmate) 분리 API를 동시 연동. API 인증 정보(systemkey, mallkey, auth token)는 코드에서 분리해 JSON config 파일로 관리",
          points: [
            "Shopby API: 문의 목록 조회(/inquiries) → 주문 상세 조회(/orders) → 답변 등록(/inquiries/{id}/answer)",
            "Sellmate API: 주문 조회(/order) → 상품 옵션 조회(/products, variants_id 추출) → 입고예정일 조회(/stock-schedule)",
            "두 API 응답 매칭 → 상품코드·송장번호 조합으로 케이스 판단 후 자동 응답 생성",
            "API 인증 정보(systemkey, mallkey, auth token)를 코드에서 분리하여 JSON config 파일로 관리",
          ],
        },
        {
          title: "배치 스케줄러 기반 자동 처리",
          description: "웹훅 대신 주기 배치로 미처리 문의 일괄 조회, 주말·야간 포함 24/7 무중단 자동 처리",
          points: [
            "cron 기반 스케줄러로 1시간 주기 배송 문의 일괄 수집 및 자동 응답 처리",
            "배송 상태 데이터 주기적 갱신으로 응답 정확도 유지",
            "주말·비업무 시간 포함 24/7 무중단 운영",
          ],
        },
      ],
      result: [
        "전체 CS 문의의 약 1/3 자동 처리",
        "응답 지연 시간 80% 단축",
        "주말·비업무 시간 포함 24/7 무중단 운영",
      ],
    },
  },
  {
    id: "drone",
    type: "company",
    title: "드론 탑재 실시간 객체 탐지",
    subtitle: "보안기관 R&D",
    company: "한컴인스페이스",
    initial: "한",
    summary: "전쟁 지역, 붕괴 위험이 있는 터널, 저조도 환경 등 사람이 직접 접근하기 어려운 위험 지역을 안전하게 탐색하기 위해 개발한 드론 기반 객체 탐지 시스템. 드론 영상에서 위협 객체를 실시간으로 탐지하고 3D 좌표로 시각화하여 현장 상황을 원격으로 파악할 수 있도록 지원했습니다.",
    thumb: "/projects/drone-detection.png",
    image: { src: "/projects/drone-detection.png", caption: "실시간 위협 객체 6종 클래스" },
    tags: ["Faster R-CNN", "ROS", "RealSense D435i", "Docker"],
    year: "2023 ~ 2025",
    metrics: [
      { value: "75%", label: "객체 탐지 mAP", from: "61%" },
      { value: "1분", label: "네트워크 세팅", from: "2시간+" },
      { value: "KTL", label: "시험 성적서 발급" },
    ],
    sections: {
      flow: [
        {
          title: "드론 배치 및 네트워크 자동 구성",
          description:
            "hostname -I로 현재 IP 확인 후 서브넷(192.168.100.x) 기반으로 실환경/테스트 환경 자동 판별. " +
            "ip link show로 이더넷·USB 이더넷 인터페이스를 스캔하여 드론 통신망·GCS 통신망을 이중으로 동적 구성. " +
            "GCS에서 UDP로 START_RGB <master_ip> / START_DEPTH <master_ip> 명령 수신 시 ROS_MASTER_URI를 런타임에 주입 → " +
            "드론 교체 시 컨테이너 재빌드 없이 1분 이내 즉시 연결",
        },
        {
          title: "RGB + Depth 카메라 프레임 동기화",
          description:
            "RGB 카메라와 RealSense D435i Depth 카메라의 publish 주기 차이를 " +
            "ApproximateTimeSynchronizer slop·queue size 실측 튜닝으로 보정. " +
            "두 스트림을 단일 콜백으로 수신하여 RGB 추론과 Depth 좌표 변환이 같은 타임스탬프 기준에서 처리되도록 정합",
        },
        {
          title: "Faster R-CNN 위협 객체 실시간 추론",
          description:
            "동기화된 RGB 이미지로 위협 객체 6종 실시간 탐지 (Precision 95%, ~12.5 FPS). " +
            "오탐이 현장 대응 오류로 직결되는 환경 특성상 Precision 최우선으로 선정된 모델 적용. " +
            "탐지된 bbox 중심 좌표를 다음 단계 3D 계산으로 전달",
        },
        {
          title: "Depth 역투영 기반 실세계 3D 좌표 복원",
          description:
            "탐지된 bbox 중심 픽셀의 Depth값을 RealSense D435i intrinsic 파라미터(fx, fy, cx, cy)로 역투영하여 " +
            "객체 실제 좌표 산출. RGB 추론 결과와 동일 타임스탬프의 Depth 프레임을 사용하여 좌표 정합성 보장",
        },
        {
          title: "지상 관제 시스템 전송 및 가시화",
          description:
            "추론 결과 이미지와 3D 좌표를 각각 별도 ROS Topic으로 발행. " +
            "지상 관제 시스템(GCS)이 실시간 수신하여 위협 객체 위치를 3D 포인터로 가시화 → " +
            "운용자가 드론 영상과 공간 좌표를 동시에 확인하여 현장 대응",
        },
      ],
      tech: [
        {
          title: "모델 비교 평가 및 Faster R-CNN 선정",
          description:
            "Faster R-CNN · YOLOv5 · YOLOv7 · RetinaNet 4종을 Precision·추론 속도 기준으로 비교 평가. " +
            "드론 실시간 영상 추론 환경에서 오탐이 미탐보다 치명적인 프로젝트 특성상 Precision을 최우선 기준으로 삼아 Faster R-CNN 최종 선정.",
          points: [
            "평가 기준 1 — 오탐률: 위협 오인식은 현장 대응 오류로 직결 → Precision 최우선",
            "평가 기준 2 — 추론 속도: 드론 탑재 엣지 환경에서 실시간 처리 가능 여부 검증",
            "YOLOv5 · YOLOv7 탈락: 속도(~80 / ~59 FPS)는 우수하나 Precision 58~59%로 오탐률이 허용 기준 초과",
            "RetinaNet 탈락: Precision 96.8%로 수치상 최고이나 ~17 FPS로 실시간 처리 임계치 미달",
            "Faster R-CNN 선정: Precision 95%, ~12.5 FPS로 정밀도·실시간성 모두 임계치 충족. RetinaNet과 Precision 차이는 1.8%p로 근소하나, 속도 요건을 충족하는 모델 중 가장 높은 Precision 달성으로 최종 선정",
          ],
          table: {
            headers: ['모델', 'Precision', 'FPS', '결과'],
            rows: [
              { cells: ['YOLOv5', '58%', '~80', '탈락'] },
              { cells: ['YOLOv7', '59%', '~59', '탈락'] },
              { cells: ['RetinaNet', '96.8%', '~17', '탈락'] },
              { cells: ['Faster R-CNN', '95%', '~12.5', '선정'], highlight: true },
            ],
          },
        },
        {
          title: "위협 객체 6종 데이터셋 구축 및 희소 클래스 보완",
          description:
            "다양한 환경(조도·각도·거리)에서 위협 객체 6종 약 2,000장 수집·라벨링. " +
            "폭발물 등 실사 데이터 확보가 어려운 클래스는 Augmentation 및 목업 데이터셋으로 보완",
          points: [
            "폭발물 클래스: 실사 데이터 희소 → Augmentation(회전·밝기·노이즈) + 목업 데이터셋 생성으로 클래스 불균형 보완",
            "비탐지 클래스 추가 — 오탐 방지를 위해 탐지 대상 외 객체를 background 클래스로 명시적 학습",
            "Occlusion 대응 — 객체가 절반 이상 가려진 케이스도 탐지되도록 라벨링 기준 수정",
            "위협 객체 6종 클래스 정의, 다양한 촬영 환경에서 약 2,000장 수집 및 라벨링",
          ],
        },
        {
          title: "실환경 테스트 기반 반복 성능 개선",
          description:
            "실제 터널 환경 테스트에서 저조도·빛번짐 오탐 이슈 발견 → " +
            "원인별 데이터 확보 및 재학습으로 대응. 데이터셋 2,000장 → 6,000~7,000장으로 확장",
          points: [
            "mAP 61% → 75% (14%p 향상), KTL 시험 성적서 발급 기준 달성",
            "이슈 1 — 저조도 환경: 터널 내 조도 저하로 추론 성능 급락 → 고조도/저조도 환경 데이터 추가 확보, 총 6,000~7,000장으로 확장 재학습",
            "이슈 2 — 플래시 빛번짐 오탐: 빛번짐을 객체로 오인식, 특히 bomb 클래스 Precision 56.5%(FP 127건)로 집중 발생 → 빛번짐 패턴을 배경 이미지로 추가 학습하여 오탐률 감소",
            "이슈 3 — injured_person 탐지 누락: Recall 60.4%(FN 44건)으로 가장 낮은 검출률 → Occlusion·저조도 환경 데이터 보강으로 대응",
          ],
          table: {
            headers: ['클래스', 'Precision', 'Recall', 'AP@0.5'],
            rows: [
              { cells: ['bomb',           '56.5%', '76.7%', '70.2%'] },
              { cells: ['exit',           '72.9%', '73.8%', '73.1%'] },
              { cells: ['fire',           '89.3%', '87.9%', '86.8%'], highlight: true },
              { cells: ['injured_person', '87.0%', '60.4%', '59.2%'] },
              { cells: ['oil',            '77.7%', '75.9%', '73.9%'] },
              { cells: ['person',         '78.1%', '76.1%', '72.2%'] },
            ],
          },
        },
      ],
      result: [
        "객체 탐지 mAP 61% → 75% (14%p 향상), KTL 시험 성적서 발급 기준 달성",
        "Faster R-CNN 선정 (Precision 95%, ~12.5 FPS) — 4종 모델 비교 평가 후 오탐 최소화 기준으로 채택",
        "데이터셋 2,000장 → 6,000~7,000장 확장, 저조도·빛번짐·Occlusion 실환경 이슈 3건 원인별 대응",
        "RGB/Depth 동기화 기반 실시간 3D 좌표 복원 — GCS에서 위협 객체 위치를 3D 포인터로 확인",
        "네트워크 세팅 시간 2시간 이상 → 1분 이하 단축 (자동 감지·ROS_MASTER_URI 동적 주입)",
      ],
    },
  },
  {
    id: "dflow",
    type: "company",
    title: "사내 MLOps 플랫폼 DFLOW",
    company: "한컴인스페이스",
    initial: "한",
    summary: "AI 모델 개발 과정에서 반복적으로 발생하는 데이터 라벨링, 학습 환경 구축, GPU 자원 관리, 성능 검증, 모델 배포 준비 과정을 표준화하기 위해 통합 MLOps 플랫폼을 구축했습니다. 데이터셋 관리부터 학습 작업 스케줄링, 학습 추적, 성능 평가, ONNX 모델 추출까지 End-to-End 파이프라인을 제공하여 개발 효율성과 모델 품질 관리 체계를 강화했습니다.",
    thumb: "/projects/dflow0.png",
    image: { src: "/projects/dflow0.png", caption: "사내 MLOps 플랫폼 DFLOW" },
    tags: ["MMDetection", "MMYOLO", "GOD", "Redis", "K8s", "PyTorch", "Docker", "PostgreSQL", "ONNX"],
    year: "2022 ~ 2024",
    metrics: [
      { value: "20+", label: "지원 모델 수", from: "3개" },
      { value: "1일", label: "신규 모델 온보딩", from: "1~2주" },
      { value: "K8s", label: "전 컴포넌트 파드 운영" },
    ],
    sections: {
      flow: [
        {
          title: "데이터셋 Import 및 버전 관리",
          description:
            "외부 스토리지·로컬에서 이미지·영상 데이터를 플랫폼으로 업로드. " +
            "데이터셋 단위로 버전을 관리하여 학습 간 데이터 추적 가능",
        },
        {
          title: "라벨링 작업 진행",
          description:
            "Label Studio 기반 웹 라벨링 환경에서 Bounding Box·Polygon 등 어노테이션 작업. " +
            "학습 완료된 weight로 자동 라벨링(Pre-annotation)을 적용해 반복 작업 시간 단축. " +
            "완료된 라벨링 결과는 COCO·YOLO 등 포맷으로 Export 가능",
        },
        {
          title: "모델 선택 및 학습 작업 등록",
          description:
            "GOD · MMDetection · MMYOLO 중 모델과 프레임워크를 선택하고 학습 파라미터(epoch, batch size, lr 등)를 UI에서 입력. " +
            "작업은 Redis BRPOP 기반 큐에 적재되어 GPU 가용 시점에 순차 처리",
        },
        {
          title: "학습 실행 및 실시간 상태 모니터링",
          description:
            "K8s 파드로 학습 작업 실행. UI에서 Connected → Preparing → Training 상태를 실시간으로 확인하고, " +
            "에러 발생 시 로그를 즉시 확인 가능. MLflow로 학습별 하이퍼파라미터·loss·메트릭 자동 기록",
        },
        {
          title: "성능 지표 시각화 및 모델 비교",
          description:
            "학습 완료 후 Precision · Recall · mAP 등 성능 지표를 대시보드에서 시각화. " +
            "학습 간 성능 그래프를 비교하여 최적 모델 선정",
        },
        {
          title: "Weights Export",
          description:
            "선정된 모델의 weight를 PyTorch(.pt) · TensorFlow(.pb) · ONNX(.onnx) 3가지 포맷으로 변환·추출. " +
            "추출된 모델은 배포 파이프라인 또는 자동 라벨링 Pre-annotation으로 즉시 활용 가능",
        },
      ],
      tech: [
        {
          title: "GOD(General Object Detection): YOLO · Faster R-CNN · RetinaNet ML 백엔드 직접 구현 — MMDetection · MMYOLO와 동일한 공통 인터페이스로 추상화",
          description:
            "GOD · MMDetection · MMYOLO 프레임워크별로 상이한 학습 인터페이스를 " +
            "단일 공통 구조로 추상화. 신규 모델 추가 시 인터페이스 재구현 없이 config 교체만으로 온보딩",
          points: [
            "YOLO · Faster R-CNN · RetinaNet 등 모델별 상이한 인터페이스 → 공통 추상화 레이어 설계",
            "GOD · MMDetection · MMYOLO 3개 프레임워크를 단일 ML 백엔드 인터페이스로 통합",
            "전이학습·초기학습 선택, 학습 파라미터 주입을 공통 API로 표준화",
            "신규 모델 온보딩: 코드 수정 없이 config 파일 교체만으로 처리, 1~2주 → 1일 이내",
            "지원 모델 수 3개 → 20개 이상으로 확장",
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
          images: [
            { src: "/projects/dflow-training-ui.png", caption: "모델 학습 상태 관리 (Connected → Preparing → Training)" },
            { src: "/projects/dflow_error.png", caption: "학습 작업 에러 로그 확인" },
          ],
        },
        {
          title: "실시간 학습 모니터링 및 사용자 기능",
          description:
            "학습 진행률·버전·성능 지표를 실시간으로 시각화하고, " +
            "자동 라벨링·모델 비교·프로젝트 접근 제어 등 end-to-end 사용자 기능 제공",
          points: [
            "학습 완료 weight로 자동 라벨링 실행 — 수동 라벨링 비용 절감 및 재학습 사이클 단축",
            "학습 진행률 실시간 표시 (Connected → Preparing → Training 상태 관리)",
            "학습 결과 성능 지표(mAP · Loss 등) 그래프 시각화 대시보드 제공",
            "원하는 성능 지표 선택 후 모델 간 수치 비교 기능",
            "버전 관리: 학습 이력·파라미터·성능 지표를 버전별로 기록·조회",
            "프로젝트별 그룹 생성 + 비밀번호 인증 기반 접근 제어로 다중 프로젝트 환경 데이터 격리 지원",
          ],
          images: [
            { src: "/projects/dflow_predict.png", caption: "학습 완료 weight 기반 자동 라벨링" },
            { src: "/projects/dflow-performance.png", caption: "모델 성능 평가 대시보드" },
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
        {
          title: "사용자 입력 기반 config 자동 생성 파이프라인",
          description:
            "사용자가 UI에서 입력한 학습 파라미터·모델·데이터셋 정보를 받아 " +
            "프레임워크별 공통 config 파일을 자동 생성·수정 후 학습 실행까지 연결하는 파이프라인 구현",
          points: [
            "사용자 입력(모델 선택·파라미터·데이터셋·전이학습 여부)을 API로 수신",
            "수신 정보 기반으로 MMDetection · MMYOLO · GOD 공통 config 자동 생성·수정",
            "config 완성 → Redis 큐 등록 → Worker 학습 실행까지 자동 연결",
            "학습 완료 후 weights 다운로드 및 ONNX 변환 기능 제공",
          ],
          images: [
            { src: "/projects/dflow_addmodel.png", caption: "모델 선택 및 학습 파라미터 입력 UI" },
          ],
        },
      ],
      result: [
        "지원 모델 수 3개 → 20개 이상 확장, 신규 모델 온보딩 1~2주 → 1일 이내 (config 교체만으로 처리)",
        "멀티 GPU OOM 장애 제거, 학습 대기 하루 이상 → Redis 큐 자동 순차 처리로 해소",
        "라벨링 결과 COCO·YOLO 포맷 export + 자동 라벨링(Pre-annotation) 연계로 라벨링 사이클 단축",
        "학습 완료 weights PyTorch(.pt) · TensorFlow(.pb) · ONNX(.onnx) 3포맷 export 지원",
        "데이터 import → 라벨링 → 학습 → 성능 평가 → weights export 전 과정 단일 플랫폼에서 완결",
      ],
    },
  },
  {
    id: "pillcare",
    type: "team",
    title: "PillCare",
    subtitle: "AI 기반 건강 위험 분석 서비스",
    company: "Team Project",
    initial: "P",
    summary: "사용자의 복약 이력, 건강 지표, 생활 환경 데이터를 통합 분석하여 잠재적인 건강 위험을 조기에 예측하기 위해 개발한 서비스. 멀티모달 데이터를 기반으로 개인 맞춤형 건강 인사이트를 제공하고 예방 중심의 건강 관리를 지원했습니다.",
    thumb: "/projects/pillcare_thum.webp",
    image: { src: "/projects/pillcare_thum.webp", caption: "PillCare 서비스 화면" },
    tags: ["FastAPI", "OpenAI SDK", "Redis", "OAuth 2.0", "Pydantic", "WeasyPrint", "pytest"],
    year: "2026.05",
    metrics: [
      { value: "11", label: "도메인 설계", from: "15 테이블" },
      { value: "3단계", label: "멀티 레이어 캐시" },
      { value: "MCP", label: "AI Agent 연동" },
    ],
    sections: {
      arch: "/projects/pillcare_ar.png",
      intent: [
        "복약 불이행으로 인한 치료 실패·부작용이 고령자·만성질환자에게 반복적으로 발생",
        "기존 복약 앱은 단순 알림 수준 — 개인 맞춤 건강 리스크 감지는 없음",
        "처방봉투 사진 한 장으로 복약 스케줄 자동 등록, 수동 입력 단계 제거",
        "복약 이행률·약물 안전도·환경 지수를 통합 분석해 사전 건강 리스크 감지",
        "AI Agent가 MCP로 실시간 건강 데이터를 직접 조회 — 단순 알림을 넘어 관리 플랫폼으로",
      ],
      tech: [
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
          title: "DDD 기반 도메인 레이어 설계",
          description: "11개 도메인 · 15개 테이블, 각 도메인 router → service → repository → model 독립 구성, 도메인 간 의존성 분리 · 영향 범위 한정",
          points: [
            "도메인별 router → service → repository → model 레이어 독립 구성",
            "도메인 간 의존성 최소화, 기능 변경 시 영향 범위 한정",
            "8개 도메인 통합 테스트 작성 (정상·예외 케이스 포함)",
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
      expect: [
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
    title: "Dear Me,",
    subtitle: "AI 음성 타임캡슐",
    company: "Personal Project",
    initial: "D",
    summary: "바쁜 일상 속에서 쉽게 잊히는 감정과 순간들을 기록하고 미래의 자신에게 전달하기 위해 개발한 서비스. 음성으로 남긴 하루의 이야기를 AI가 편지 형태로 재구성하고, TTS를 통해 미래의 내가 직접 듣는 듯한 타임캡슐 경험을 제공합니다.",
    thumb: "/projects/Dearme0.png",
    image: { src: "/projects/Dearme0.png", caption: "Dear Me 서비스 소개" },
    image2: { src: "/projects/Dearme1.png", caption: "음성 녹음 메인 화면 · AI 비밀 친구 채팅" },
    image3: { src: "/projects/Dearme2.png", caption: "감정 분석 결과 · GPT-4o 생성 편지" },
    image4: { src: "/projects/Dearme3.png", caption: "QR 카드 저장 · 발송 날짜 및 채널 선택" },
    tags: ["Azure Speech", "Azure OpenAI GPT-4o", "FastAPI", "APScheduler", "Kakao OAuth 2.0", "카카오 알림톡", "React", "SQLite", "Python"],
    year: "2026.06",
    metrics: [
      { value: "Azure", label: "Speech · OpenAI 연동" },
      { value: "3채널", label: "카카오·Discord·메일" },
      { value: "TTS", label: "AI 편지 낭독" },
    ],
    sections: {
      arch: "/projects/dearme_ar.png",
      intent: [
        "바쁜 일상 속에서 감정과 생각을 기록하고 되돌아볼 기회 부족",
        "기존 일기 서비스는 텍스트 작성 부담이 크고 기록 보관에만 집중",
        "음성 기록만으로 AI가 미래의 나에게 보내는 편지 자동 생성",
        "TTS 기반 편지 낭독 및 QR 카드 저장으로 특별한 회고 경험 제공",
        "지정한 날짜에 카카오톡·Discord·이메일로 자동 전달하여 과거와 미래의 나를 연결",
      ],
      tech: [
        {
          title: "Azure Speech SDK — STT · TTS 파이프라인",
          description: "Azure Speech STT로 음성 녹음 → 텍스트 변환, GPT-4o가 생성한 편지를 Azure Speech TTS로 낭독 — 입력부터 출력까지 음성 End-to-End",
          points: [
            "STT → GPT-4o → TTS 단일 파이프라인으로 음성 입출력 완결",
            "Azure Speech STT: 음성 녹음 스트림을 실시간으로 텍스트 변환",
            "Azure Speech TTS: 생성된 편지를 자연스러운 음성으로 합성·재생",
          ],
        },
        {
          title: "Azure OpenAI GPT-4o — 감정 분석 및 편지 생성",
          description: "STT 변환 텍스트에서 감정·맥락을 추출하고 '미래의 나에게' 형식의 편지 자동 생성",
          points: [
            "편지 생성: 감정과 맥락을 바탕으로 미래의 나에게 보내는 편지 형식으로 작성",
            "감정 분석: 음성 텍스트에서 감정 상태·핵심 키워드 추출",
            "지정 발송일·채널(카카오톡·Discord·이메일)을 컨텍스트에 반영한 개인화 메시지",
          ],
        },
        {
          title: "카카오 OAuth 2.0 · 알림톡 연동",
          description: "카카오 OAuth 2.0 소셜 로그인으로 별도 회원가입 없이 인증 처리, 카카오 알림톡 비즈니스 API로 지정 날짜에 편지 자동 발송",
          points: [
            "카카오 OAuth 2.0: 인가 코드 흐름으로 액세스 토큰 발급 및 사용자 프로필 조회, 자체 회원 DB와 연동하여 세션 관리",
            "카카오 알림톡: 비즈니스 채널 연동 후 템플릿 기반 메시지로 편지 내용 발송 — 카카오톡 미설치 환경에서도 SMS 대체 발송",
            "채널별 발송 로직 분리 (알림톡·Discord Webhook·이메일) — 실패 시 채널 이력에 에러 상태 기록",
          ],
        },
        {
          title: "APScheduler — 경량 스케줄러 선택 이유",
          description: "Celery + Redis 대신 APScheduler를 선택한 핵심 이유는 단일 프로세스 내 통합 — 브로커·워커 인프라 없이 FastAPI lifespan에 직접 내장하여 운영 복잡도를 최소화",
          points: [
            "개인 프로젝트 규모에서 Redis + Celery 스택은 오버엔지니어링 — APScheduler로 동일 기능을 단일 프로세스에서 구현",
            "SQLiteJobStore로 예약 정보 영속화, 서버 재시작 시 스케줄 자동 복구 — 별도 메시지 큐 없이 durability 확보",
            "발송 빈도가 최대 1일 1회 수준으로 낮아 경량 스케줄러로 처리량 충분, FastAPI lifespan 이벤트에 통합하여 앱 생명주기와 동기화",
          ],
        },
      ],
      expect: [
        "카카오 OAuth 2.0 소셜 로그인 도입으로 자체 인증 구현 없이 보안 인증 처리 — 회원가입 마찰 제거 및 개발 공수 절감",
        "APScheduler + SQLiteJobStore 조합으로 Redis·Celery 없이 예약 발송 durability 확보 — 단일 프로세스로 운영 인프라 최소화",
        "알림톡 미수신 시 SMS 자동 대체 발송으로 발송 신뢰성 확보, 채널별 에러 이력 기록으로 장애 추적 가능",
        "STT → GPT-4o → TTS End-to-End 파이프라인 단일화로 음성 입력부터 편지 낭독까지 외부 의존성 없이 Azure 단일 스택으로 완결",
      ],
    },
  },
];
