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

export type VerificationStat = { value: string; label: string; category?: string };

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
    verification?: {
      title: string;
      description?: string;
      stats: VerificationStat[];
    };
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
  introShort: string;
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
  introShort: "이커머스 도메인에서 데이터 파이프라인 구축부터 모델 학습·서빙·인프라 운영까지 End-to-End를 직접 담당해온 5년 차 ML 엔지니어입니다.",
  intro: [
    "다양한 영상 데이터를 기반으로 AI 서비스를 개발해온 ML Engineer입니다. RealSense 카메라, 드론 영상, 항공 영상, RTSP 스트리밍 데이터를 활용하여 데이터 수집·가공, 객체 탐지 모델 개발, 학습 환경 구축, 배포 및 운영까지 End-to-End ML Pipeline을 구축하며 실제 서비스에 적용한 경험을 보유하고 있습니다.",
    "이와 함께 Azure OpenAI GPT-4o, LangChain LCEL, ChromaDB 기반의 RAG 시스템을 설계·구현하며 생성형 AI 서비스 개발 경험도 쌓았습니다. 영상 AI 분야에서 축적한 실무 경험을 기반으로 LLM 기술을 접목하여 실제 문제를 해결하는 AI 서비스를 만드는 데 강점을 가지고 있습니다.",
  ],
  systemInfo: [
    ["Location", "Seoul, South Korea"],
    ["Experience", "5년차"],
    ["Specialization", "ML/MLOps · Computer Vision"],
    ["Education", "마이크로소프트 AI 10기 수료 중"],
    ["Status", "Open for opportunities"],
  ],
  skills: [
    { category: "Language", skills: ["Python", "C"] },
    { category: "NLP/LLM", skills: ["LLM", "RAG", "Azure OpenAI", "Prompt Engineering"] },
    { category: "Vision", skills: ["YOLOv5", "Faster R-CNN", "RetinaNet", "MMDetection", "MambaCD"] },
    { category: "AI Framework", skills: ["PyTorch", "LangChain"] },
    { category: "Backend", skills: ["Flask", "FastAPI"] },
    { category: "DB", skills: ["PostgreSQL", "Redis", "ChromaDB(Vector DB)"] },
    { category: "Infra", skills: ["Docker", "Kubernetes"] },
    { category: "Cloud", skills: ["Azure", "AWS EC2"] },
    { category: "Else", skills: ["Git", "Jira", "Label Studio", "MLflow"] },
  ],
  contact: [
    {
      kind: "mail",
      label: "premierckim@gmail.com",
      href: "mailto:premierckim@gmail.com",
    },
    {
      kind: "github",
      label: "github.com/my0614",
      href: "https://github.com/my0614",
    },
  ],
};

export const PROJECTS: ProjectData[] = [
  {
    id: "dflow",
    type: "company",
    title: "사내 MLOps 플랫폼 DFLOW",
    company: "한컴인스페이스",
    initial: "한",
    summary:
      "AI 모델 개발 과정에서 반복적으로 발생하는 데이터 라벨링, 학습 환경 구축, GPU 자원 관리, 성능 검증, 모델 배포 준비 과정을 표준화하기 위해 통합 MLOps 플랫폼을 구축했습니다. 데이터셋 관리부터 학습 작업 스케줄링, 학습 추적, 성능 평가, ONNX 모델 추출까지 End-to-End 파이프라인을 제공하여 개발 효율성과 모델 품질 관리 체계를 강화했습니다.",
    thumb: "/projects/dflow0.png",
    image: { src: "/projects/dflow0.png", caption: "사내 MLOps 플랫폼 DFLOW" },
    tags: [
      "MMDetection",
      "MMYOLO",
      "GOD",
      "Redis",
      "K8s",
      "PyTorch",
      "Docker",
      "PostgreSQL",
      "ONNX",
    ],
    year: "2022 ~ 2024",
    metrics: [
      { value: "20+", label: "지원 모델 수", from: "3개" },
      { value: "1일", label: "신규 모델 온보딩", from: "1~2주" },
      { value: "K8s", label: "전 컴포넌트 파드 운영" },
    ],
    sections: {
      arch: "/projects/dflow_ar2.png",
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
          title:
            "GOD(General Object Detection): YOLO · Faster R-CNN · RetinaNet ML 백엔드 직접 구현 — MMDetection · MMYOLO와 동일한 공통 인터페이스로 추상화",
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
          description:
            "DB 폴링 race condition → Redis BRPOP 원자적 연산으로 해결, Redis Hash로 job 상태·GPU·에러 로그 중앙 관리",
          points: [
            "BRPOP: 원자적 pop으로 race condition 없는 작업 분배 보장",
            "Redis Hash: job 상태·GPU 번호·에러 로그 중앙 관리 → 실시간 상태 API",
            "작업 실패 시 에러 메시지 저장으로 디버깅 가능한 구조 확보",
          ],
          images: [
            {
              src: "/projects/dflow-training-ui.png",
              caption: "모델 학습 상태 관리 (Connected → Preparing → Training)",
            },
            {
              src: "/projects/dflow_error.png",
              caption: "학습 작업 에러 로그 확인",
            },
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
            {
              src: "/projects/dflow_predict.png",
              caption: "학습 완료 weight 기반 자동 라벨링",
            },
            {
              src: "/projects/dflow-performance.png",
              caption: "모델 성능 평가 대시보드",
            },
          ],
        },
        {
          title: "nvidia-smi 기반 GPU 동적 분배",
          description:
            "job 처리 전 nvidia-smi로 가용 메모리 체크 → 모델 요구량 비교 후 GPU 할당, 조건 미충족 시 재큐잉으로 OOM 제거",
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
            {
              src: "/projects/dflow_addmodel.png",
              caption: "모델 선택 및 학습 파라미터 입력 UI",
            },
          ],
        },
      ],
      result: [
        "멀티 GPU OOM 장애 제거, 학습 대기 하루 이상 → Redis 큐 자동 순차 처리로 해소",
        "라벨링 결과 COCO·YOLO 포맷 export + 자동 라벨링(Pre-annotation) 연계로 라벨링 사이클 단축",
        "학습 완료 weights PyTorch(.pt) · TensorFlow(.pb) · ONNX(.onnx) 3포맷 export 지원",
        "데이터 import → 라벨링 → 학습 → 성능 평가 → weights export 전 과정 단일 플랫폼에서 완결",
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
    summary:
      "전쟁 지역, 붕괴 위험이 있는 터널, 저조도 환경 등 사람이 직접 접근하기 어려운 위험 지역을 안전하게 탐색하기 위해 개발한 드론 기반 객체 탐지 시스템. 드론 영상에서 위협 객체를 실시간으로 탐지하고 3D 좌표로 시각화하여 현장 상황을 원격으로 파악할 수 있도록 지원했습니다.",
    thumb: "/projects/drone-detection.png",
    image: {
      src: "/projects/drone-detection.png",
      caption: "실시간 위협 객체 6종 클래스",
    },
    tags: ["Faster R-CNN", "ROS", "RealSense D435i", "Docker"],
    year: "2023 ~ 2025",
    metrics: [
      { value: "75%", label: "객체 탐지 mAP", from: "61%" },
      { value: "1분", label: "네트워크 세팅", from: "2시간+" },
      { value: "KTL", label: "시험 성적서 발급" },
    ],
    sections: {
      arch: "/projects/drone_arch.png",
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
            headers: ["모델", "Precision", "FPS", "결과"],
            rows: [
              { cells: ["YOLOv5", "58%", "~80", "탈락"] },
              { cells: ["YOLOv7", "59%", "~59", "탈락"] },
              { cells: ["RetinaNet", "96.8%", "~17", "탈락"] },
              {
                cells: ["Faster R-CNN", "95%", "~12.5", "선정"],
                highlight: true,
              },
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
          images: [
            {
              src: "/projects/drone_result.png",
              caption: "클래스별 성능 지표 (Precision · Recall · AP@0.5)",
            },
          ],
          table: {
            headers: ["클래스", "Precision", "Recall", "AP@0.5"],
            rows: [
              { cells: ["bomb", "56.5%", "76.7%", "70.2%"] },
              { cells: ["exit", "72.9%", "73.8%", "73.1%"] },
              { cells: ["fire", "89.3%", "87.9%", "86.8%"], highlight: true },
              { cells: ["injured_person", "87.0%", "60.4%", "59.2%"] },
              { cells: ["oil", "77.7%", "75.9%", "73.9%"] },
              { cells: ["person", "78.1%", "76.1%", "72.2%"] },
            ],
          },
        },
      ],
      result: [
        "Faster R-CNN 선정 (Precision 95%, ~12.5 FPS) — 4종 모델 비교 평가 후 오탐 최소화 기준으로 채택",
        "데이터셋 2,000장 → 6,000~7,000장 확장, 저조도·빛번짐·Occlusion 실환경 이슈 3건 원인별 대응",
        "RGB/Depth 동기화 기반 실시간 3D 좌표 복원 — GCS에서 위협 객체 위치를 3D 포인터로 확인",
      ],
    },
  },
  {
    id: "uav",
    type: "company",
    title: "EO/IR 센트리 카메라 기반 UAV 실시간 탐지·추적 및 모니터링 시스템",
    subtitle: "군보안기관",
    company: "한컴인스페이스",
    initial: "한",
    summary:
      "EO·IR 이중 도메인 환경에서 소형 UAV를 실시간으로 탐지·추적하기 위해 구축한 모니터링 시스템. 도메인별 모델 분리 학습과 소형 객체 특화 최적화를 통해 주야간 모두에서 안정적인 탐지 성능을 확보하고, Kubernetes 6개 파드 기반 RTSP 병렬 스트리밍으로 복수 카메라 실시간 처리 환경을 구현했습니다.",
    thumb: "/projects/hancom-logo.png",
    image: {
      src: "/projects/hancom-logo.png",
      caption: "군보안사업으로 실제 서비스 이미지는 공개할 수 없습니다.",
    },
    tags: ["YOLOv5", "Kubernetes", "Docker", "RTSP", "Python", "PyTorch"],
    year: "2024.06 ~ 2024.12",
    metrics: [
      { value: "EO/IR", label: "도메인별 모델 분리" },
      { value: "6채널", label: "실시간 병렬 처리" },
      { value: "K8s", label: "파드 기반 운영" },
    ],
    sections: {
      flow: [
        {
          title: "RTSP 스트림 수신 — 6채널 병렬 처리",
          description:
            "Kubernetes 6개 파드가 각각 EO·IR 카메라의 RTSP 스트림을 독립적으로 수신, 카메라별 장애가 타 파드에 영향을 미치지 않도록 격리",
        },
        {
          title: "도메인 판별 및 모델 라우팅",
          description:
            "수신 스트림의 도메인(EO·IR)에 따라 각각 최적화된 YOLO 모델로 라우팅, 도메인 혼용 없이 독립 추론",
        },
        {
          title: "실시간 UAV 탐지 및 추적",
          description:
            "도메인별 YOLO 모델이 프레임 단위로 소형 UAV를 탐지, 탐지 결과를 추적 알고리즘과 연계해 연속적인 객체 추적 수행",
        },
        {
          title: "탐지 결과 모니터링 시스템 전송",
          description:
            "탐지·추적 결과를 실시간으로 모니터링 시스템에 전달, 운용자가 전 채널 상황을 통합 화면에서 확인",
        },
      ],
      tech: [
        {
          title: "K8s 6파드 기반 RTSP 병렬 스트림 처리",
          description:
            "Kubernetes 위에 파드 6개를 배포하여 EO·IR 카메라별 RTSP 스트림을 독립 파드에서 병렬 수신·추론. Docker 이미지로 모델·런타임 환경을 통일하여 파드 간 일관성 확보",
          points: [
            "파드별 RTSP 스트림 독립 수신으로 단일 카메라 장애가 전체 시스템에 미치는 영향 차단",
            "Docker 이미지로 YOLO 모델·의존성 패키징, 파드 재시작 시 동일 환경 즉시 복원",
            "Kubernetes 리소스 제한 설정으로 파드 간 GPU·CPU 자원 경합 방지",
          ],
        },
        {
          title: "EO/IR 도메인별 YOLO 모델 분리 학습",
          description:
            "EO·IR 이미지를 단일 데이터셋으로 학습 시 IR 환경에서 새·항공기 오탐이 빈번하게 발생하는 문제를 도메인별 데이터셋 분리 및 독립 학습으로 해결",
          points: [
            "EO/IR 도메인별 데이터셋 분리 구축, 오탐 케이스 및 다양한 배경 이미지를 추가 학습하여 UAV 고유 패턴 학습",
            "IR 모델: 새·항공기 등 비객체 오탐 케이스를 background 클래스로 명시적 학습하여 오탐 빈도 감소",
            "EO 모델: 주간 다양한 조도·각도 환경 데이터 확보로 배경 유사 객체 탐지율 향상",
          ],
        },
        {
          title: "소형 UAV 특화 모델 최적화",
          description:
            "원거리 소형 UAV는 표준 앵커 설정과 입력 해상도에서 탐지율이 저하되는 문제를 고해상도 입력·소형 객체 특화 앵커·데이터 증강으로 개선",
          points: [
            "고해상도 입력 적용으로 원거리 소형 객체 특징 보존 및 탐지율 향상",
            "소형 객체 특화 앵커 설정 조정으로 작은 바운딩 박스 예측 정확도 개선",
            "mosaic·확대 crop 등 데이터 증강 기법으로 소형 객체 학습 샘플 다양성 확보",
          ],
        },
      ],
      result: [
        "EO/IR 환경별 최적화로 주야간 모두에서 안정적인 탐지 성능 확보, IR 오탐 발생 빈도 감소",
        "소형 UAV 탐지율 향상 및 미탐 케이스 감소, 원거리 소형 객체에 대한 모델 탐지 신뢰도 개선",
        "6개 파드 병렬 처리로 복수 카메라 실시간 탐지 환경 구현, 단일 파드 장애 시에도 나머지 채널 정상 운영",
      ],
    },
  },
  {
    id: "hotdeal",
    type: "company",
    title: "핫딜 자동화 시스템",
    company: "(주)무무즈",
    initial: "무",
    summary:
      "단독 최저가 상품을 빠르게 발굴하고 경쟁사보다 먼저 프로모션을 진행하기 위해 구축한 핫딜 운영 자동화 시스템. 파트너사 신청부터 상품 선정, 등록, 결과 메일 발송까지의 업무를 자동화하여 운영 시간을 단축하고, 더 많은 핫딜을 안정적으로 운영할 수 있는 환경을 구축했습니다.",
    thumb: "/projects/hotdeal-app.png",
    image: {
      src: "/projects/hotdeal-app.png",
      caption: "무무즈 핫딜 오픈 화면",
    },
    link: "https://moomooz.co.kr/product/hotdeal",
    tags: [
      "OAuth 2.0",
      "Google Sheets API",
      "Gmail API",
      "Shopby API",
      "AWS EC2",
      "Bitbucket Pipelines",
      "Cron",
      "Python",
    ],
    year: "2025.12 ~ 2026.03",
    metrics: [
      { value: "2분", label: "등록 작업 시간", from: "4시간+" },
      { value: "99%↓", label: "작업 시간 단축" },
      { value: "무인", label: "전 과정 자동화" },
    ],
    sections: {
      arch: "/projects/hotdeal_ar.png",
      flow: [
        {
          title: "파트너사 핫딜 신청 집계",
          description:
            "파트너사가 Google Spreadsheet에 신청 상품을 입력하면 배치가 신청 목록을 자동 수집",
        },
        {
          title: "Shopby API 상품 매칭 및 랭킹 선별",
          description:
            "신청 상품을 Shopby API로 매칭하여 할인율·가격 경쟁력·재고 수량 기반 동적 스코어링으로 상위 200개 자동 선별",
        },
        {
          title: "핫딜 자동 등록",
          description:
            "선별된 상품을 Shopby 핫딜 등록 API로 자동 등록, 수동 입력 없이 전 과정 완결",
        },
        {
          title: "파트너사별 결과 메일 자동 발송",
          description:
            "계정별 결과 파일 자동 생성 후 Gmail API로 개별 발송, BCC 처리로 수신자 정보 노출 차단",
        },
        {
          title: "Slack 실행 결과 알림",
          description:
            "배치 완료 후 정상·실패 건수 요약을 Slack Webhook으로 자동 발송, 오류 발생 시 즉시 알림",
        },
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
          description:
            "EC2에서 cron 배치 자동 실행, Bitbucket Pipelines로 push → 테스트 → EC2 배포 완전 자동화",
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
        "파트너사 계정별 결과 파일 메일 발송 자동화로 누락·오입력 리스크 제거",
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
    summary:
      "반복적인 배송 문의로 인해 상담 인력이 단순 응대에 집중되는 문제를 해결하고자 구축한 CS 자동화 시스템. 주문 정보를 기반으로 문의를 자동 분류·응답하여 고객 응답 시간을 단축하고 상담 인력이 고부가가치 업무에 집중할 수 있도록 지원했습니다.",
    thumb: "/projects/cs-main.png",
    image: {
      src: "/projects/cs-main.png",
      caption: "CS 문의 자동화 시스템 개요",
    },
    image2: {
      src: "/projects/cs-process.png",
      caption: "CS 문의 자동화 프로세스",
    },
    tags: ["Shopby API", "Sellmate API", "Batch", "Python"],
    year: "2025.12 ~ 2026.03",
    metrics: [
      { value: "1/3", label: "문의 자동 처리" },
      { value: "80%↓", label: "응답 지연 시간" },
      { value: "24/7", label: "무중단 운영" },
    ],
    sections: {
      arch: "/projects/cs-process.png",
      result: [
        "CS 담당자가 단순 반복 문의에서 벗어나 클레임·환불 등 고부가가치 업무에 집중할 수 있는 운영 환경 구축",
        "Shopby·Sellmate 등 이종 API를 단일 인터페이스로 통합하여 신규 판매 채널 연동 및 확장 용이성 확보",
        "자동화된 응답 로직을 통해 상담원 간 응답 편차를 줄이고 일관된 고객 응대 품질 제공",
      ],
      flow: [
        {
          title: "배송 문의 일괄 수집",
          description:
            "cron 스케줄러가 1시간 주기로 Shopby API를 통해 미처리 배송 문의 목록을 자동 수집",
        },
        {
          title: "주문·배송 상태 조회",
          description:
            "Shopby(주문)·Sellmate(배송) 이중 API를 호출해 상품코드·송장번호·입고예정일 정보를 매칭",
        },
        {
          title: "케이스 분기 판단",
          description:
            "상품코드·송장번호 유무 조합으로 3가지 케이스 분기, 자동 처리 불가 케이스는 담당자 플래그로 분리",
        },
        {
          title: "템플릿 자동 선택 및 답변 등록",
          description:
            "케이스에 맞는 HTML 템플릿을 자동 선택 후 Shopby answer API로 답변 등록, 주말·야간 포함 24/7 무중단 처리",
        },
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
            "Shopby API: 문의 목록 조회 → 주문 상세 조회 → 답변 등록 순으로 처리",
            "Sellmate API: 주문 조회 → 상품 옵션 조회 → 입고예정일 조회 순으로 처리",
            "두 API 응답 매칭 → 상품코드·송장번호 조합으로 케이스 판단 후 자동 응답 생성",
            "API 인증 정보(systemkey, mallkey, auth token)를 코드에서 분리하여 JSON config 파일로 관리",
          ],
        },
        {
          title: "배치 스케줄러 기반 자동 처리",
          description:
            "웹훅 대신 주기 배치로 미처리 문의 일괄 조회, 주말·야간 포함 24/7 무중단 자동 처리",
          points: [
            "cron 기반 스케줄러로 1시간 주기 배송 문의 일괄 수집 및 자동 응답 처리",
            "배송 상태 데이터 주기적 갱신으로 응답 정확도 유지",
            "주말·비업무 시간 포함 24/7 무중단 운영",
          ],
        },
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
    summary:
      "사용자의 복약 이력, 건강 지표, 생활 환경 데이터를 통합 분석하여 잠재적인 건강 위험을 조기에 예측하기 위해 개발한 서비스. 멀티모달 데이터를 기반으로 개인 맞춤형 건강 인사이트를 제공하고 예방 중심의 건강 관리를 지원했습니다.",
    thumb: "/projects/pillcare_thum.webp",
    image: {
      src: "/projects/pillcare_thum.webp",
      caption: "PillCare 서비스 화면",
    },
    tags: [
      "FastAPI",
      "FastMCP",
      "OpenAI SDK",
      "Redis",
      "OAuth 2.0",
      "Pydantic",
      "WeasyPrint",
      "pytest",
    ],
    year: "2026.05",
    metrics: [
      { value: "11", label: "도메인 설계", from: "15 테이블" },
      { value: "3단계", label: "멀티 레이어 캐시" },
      { value: "MCP", label: "AI Agent 연동" },
    ],
    sections: {
      arch: "/projects/pillcare_ar.png",
      flow: [
        {
          title: "처방봉투 OCR → 복약 스케줄 자동 등록",
          description:
            "처방봉투 사진 업로드 → OpenAI Vision API로 약품명·용량·복용 시점 자동 추출 → 복약 스케줄 즉시 등록",
        },
        {
          title: "복약·건강 데이터 기록",
          description:
            "복약 이행 여부, 건강 지표(혈압·혈당 등), 생활 환경 데이터를 지속 누적 기록",
        },
        {
          title: "AI Agent 실시간 건강 분석",
          description:
            "FastMCP 서버의 건강 지수·약물 안전도·환경 지수 Tool을 AI Agent가 직접 호출해 개인화 건강 인사이트 생성",
        },
        {
          title: "멀티 레이어 캐시 처리",
          description:
            "L1 인메모리 → L2 Redis → L3 OpenAI 순으로 캐시 히트 처리, 비용 절감 및 응답 속도 최적화",
        },
        {
          title: "알람 스케줄러 → 알림 발송",
          description:
            "asyncio 스케줄러가 30분 주기로 복약·병원·식사·수면·물·일지 6종 알람을 스캔하여 적시에 푸시 알림 발송",
        },
      ],
      tech: [
        {
          title: "FastMCP 기반 건강 데이터 MCP 서버",
          description:
            "건강 데이터 분석 로직을 MCP Tool로 표준화, AI 어시스턴트가 실시간 건강 데이터 직접 조회 · 개인화 응답 생성",
          points: [
            "FastMCP로 MCP 서버 구현, 건강 지수·약물 안전도·환경 지수 3개 Tool 등록",
            "AI 어시스턴트가 실시간 사용자 건강 데이터를 직접 조회해 개인화 응답 생성",
            "Tool 단위 분리로 유지보수성 및 기능 확장 용이",
          ],
        },
        {
          title: "3단계 멀티 레이어 캐시 (메모리 → Redis → OpenAI)",
          description:
            "LLM 비용·속도·장애 격리를 위한 3단계 캐시 설계, L2 히트 시 L1 자동 워밍업 · Redis 장애 시 OpenAI 폴백으로 무중단 보장",
          points: [
            "L1 인메모리(6h TTL) → L2 Redis(자정 초기화) → L3 OpenAI 순으로 캐시 히트 처리",
            "L2 히트 시 L1 자동 워밍업으로 후속 요청 응답 속도 향상",
            "Redis 장애 시 L3 폴백으로 서비스 무중단 보장",
          ],
        },
        {
          title: "OpenAI Vision API 처방봉투 OCR",
          description:
            "처방봉투 이미지 → OpenAI Vision API 파싱 → 약품명·용량·복용 시점 추출, 복약 스케줄 자동 등록",
          points: [
            "처방봉투 이미지 업로드 → OCR 파싱 → 약품명·용량·복용 시점 자동 추출",
            "파싱 결과를 복약 스케줄에 즉시 자동 등록, 수동 입력 단계 제거",
            "구조화된 응답 포맷으로 파싱 결과 검증 및 오류 처리",
          ],
        },
        {
          title: "DDD 기반 도메인 레이어 설계",
          description:
            "11개 도메인 · 15개 테이블, 각 도메인 router → service → repository → model 독립 구성, 도메인 간 의존성 분리 · 영향 범위 한정",
          points: [
            "도메인별 router → service → repository → model 레이어 독립 구성",
            "도메인 간 의존성 최소화, 기능 변경 시 영향 범위 한정",
            "8개 도메인 통합 테스트 작성 (정상·예외 케이스 포함)",
          ],
        },
        {
          title: "asyncio 기반 비동기 알람 스케줄러",
          description:
            "FastAPI lifespan에 asyncio 스케줄러 통합, 30분 주기로 복약·병원·식사·수면·물·일지 6종 알람 스캔 · 중복 차단",
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
    id: "ppurine",
    type: "team",
    title: "쀼라인드",
    subtitle: "부부·연인 관계 케어 AI 웹앱",
    company: "Team Project",
    initial: "쀼",
    summary:
      "부부·연인의 말하지 못한 속마음과 반복되는 갈등 패턴을 기록하면 AI가 감정을 분석하고, 거친 말투를 부드럽게 변환하고, 관계 회복 액션을 제안하는 관계 케어 웹앱. 5인 팀에서 DB·AI 분석 파이프라인을 담당해 LangChain 기반 RAG 상담 챗봇, pgvector 벡터 유사도 검색, LLM 구조화 분석까지 실제 운영을 가정한 데이터 설계를 맡았습니다.",
    thumb: "/projects/ppurine_home.png",
    image: {
      src: "/projects/ppurine_home.png",
      caption: "홈 대시보드 — 관계 상태를 한 화면에서 확인",
    },
    image2: {
      src: "/projects/ppurine_record.png",
      caption: "기록 → AI 감정 분석 — 이중 기록 구조 · 3종 입력",
    },
    image3: {
      src: "/projects/ppurine_rag.png",
      caption: "LangChain + Azure AI Search 기반 RAG 상담 챗봇",
    },
    image4: {
      src: "/projects/ppurine_admin.png",
      caption: "관리자 콘솔 — 운영 대시보드 (Research Preview)",
    },
    tags: [
      "LangChain",
      "pgvector",
      "Azure OpenAI",
      "Azure AI Search(RAG)",
      "FastAPI",
      "PostgreSQL",
      "Azure AI Speech",
      "Azure AI Vision(OCR)",
      "Azure AI Language",
      "Azure Content Safety",
      "React",
    ],
    year: "2026.06 ~ 2026.07",
    metrics: [
      { value: "RAG", label: "LangChain 기반 법령·판례 상담 챗봇" },
      { value: "pgvector", label: "임베딩 유사도 검색 — 추천·중복판별" },
      { value: "81개", label: "LLM 구조화 분석 라벨", from: "14개 그룹" },
    ],
    sections: {
      arch: "/projects/ppurine_ar.png",
      flow: [
        {
          title: "3종 입력 수집 — 텍스트·음성·채팅 캡처",
          description:
            "텍스트 직접 입력, 음성 녹음(Azure AI Speech STT), 채팅 캡처 이미지(Blob Storage 원본 저장 후 OCR 텍스트 추출) 중 원하는 방식으로 기록. " +
            "입력 방식과 무관하게 동일한 정규화 텍스트로 통합되어 이후 파이프라인은 하나의 흐름으로 처리",
        },
        {
          title: "PII 탐지 및 개인정보 마스킹",
          description:
            "Azure AI Language로 이름·전화번호·주소 등 개인정보를 자동 탐지·마스킹. " +
            "단, 남편·아내 등 관계어까지 지워지면 부부 갈등 분석의 핵심 맥락이 사라지므로 관계어는 보존하는 마스킹 경계 기준을 별도 수립",
        },
        {
          title: "LLM 감정·원인·패턴 구조화 분석",
          description:
            "Azure OpenAI가 감정·갈등 원인·반복 패턴·숨은 욕구를 14개 그룹 · 81개 라벨 JSON Schema 강제 포맷으로 구조화 추출. " +
            "자유 문장이 아닌 정형 데이터로 저장해 DB 집계·리포트 신뢰성 확보",
        },
        {
          title: "pgvector 유사도 검증 후 DB 반영",
          description:
            "정규화 텍스트를 임베딩해 최근 5분 이내 동일 사용자 기록과 pgvector 코사인 유사도를 비교, 80% 이상이면 기존 기록을 업데이트, " +
            "미만이면 신규 저장으로 분기해 감정 통계·리포트 데이터 오염을 방지",
        },
        {
          title: "위험도별 분기 — RAG 상담 · CTA · 커뮤니티",
          description:
            "위험 신호 감지 시 자가점검·공식 상담기관 CTA를 우선 노출, 법률·제도 질문은 LangChain 기반 RAG 챗봇으로, " +
            "일반 기록은 리포트·커뮤니티 흐름으로 React Web App에 제공",
        },
      ],
      tech: [
        {
          title: "LangChain + Azure AI Search 기반 RAG 상담 챗봇",
          description:
            "가사소송법·양육비 관련 법령과 최근 20년 이혼 재산분할·양육비 대법원 판례를 Azure AI Search로 벡터 검색하고, " +
            "LangChain으로 리트리버·프롬프트·LLM을 체인으로 엮어 근거를 명시한 상담 응답을 생성하는 RAG 파이프라인을 설계",
          points: [
            "LangChain 체인 구성: 질문 → AI Search 리트리버로 관련 법령·판례 검색 → 프롬프트에 근거 주입 → GPT가 출처를 명시해 답변 생성",
            "응답 분기 설계: 일반 관계 상담은 GPT 공감·정리 응답, 위험 신호는 Safety Card + 상담기관 CTA 우선, 법률·제도 질문만 RAG로 전환",
            "법률 자문이 아닌 '정보 제공' 범위로 한정하고 RAG 실패 시 안전한 fallback을 둬 전문가 판단을 대신하는 것처럼 보이는 리스크 차단",
            "QA 중 같은 답변이 반복되는 RAG 미호출 이슈를 발견 — 법률성 고민에만 RAG를 연결하는 rule을 추가해 해결",
          ],
          images: [
            {
              src: "/projects/ppurine_rag.png",
              caption: "RAG 상담 챗봇 — 법령·판례 근거 기반 답변",
            },
          ],
        },
        {
          title: "pgvector 기반 벡터 유사도 검색 — 유사 고민 추천 · 중복 저장 판별",
          description:
            "PostgreSQL에 pgvector 확장을 적용해 별도 벡터 DB 인프라 없이 커뮤니티 유사 고민 추천과 감정 기록 중복 저장 판별을 " +
            "동일 DB에서 임베딩 유사도 검색으로 처리하는 구조를 설계",
          points: [
            "커뮤니티 게시글을 임베딩으로 변환해 pgvector 코사인 유사도로 나와 가장 비슷한 상황의 공감 글을 우선 노출",
            "키워드 매칭의 한계(표현은 달라도 감정·상황 맥락이 유사한 글을 못 찾는 문제)를 임베딩 유사도 검색으로 해결",
            "감정 기록도 정규화 텍스트를 임베딩해 최근 5분 이내 동일 사용자 기록과 유사도 80% 이상이면 기존 기록을 업데이트 — 별도 캐시·큐 없이 PostgreSQL 하나로 추천·중복판별 두 기능을 모두 처리",
          ],
          images: [
            {
              src: "/projects/ppurine_community.png",
              caption: "pgvector 유사도 기반 비슷한 고민 추천 커뮤니티",
            },
          ],
        },
        {
          title: "LLM 감정 분석 파이프라인 — 14그룹 81라벨 JSON Schema 구조화",
          description:
            "Azure OpenAI가 감정·갈등 원인·반복 패턴·숨은 욕구를 자유 문장이 아닌 14개 그룹 · 81개 라벨의 JSON Schema 강제 포맷으로 " +
            "구조화 추출하도록 프롬프트와 스키마를 설계",
          points: [
            "Gottman 4대 파괴 대화 패턴(비난·방어·경멸·담쌓기) + PHQ-9 척도를 라벨 판단 기준으로 결합해 도메인 전문성 반영",
            "emotion·cause·pattern·risk 등 필수 필드와 enum 값을 JSON Schema로 강제해 LLM 응답의 필드 누락·중복·포맷 깨짐을 방지하고 DB에 안정적으로 저장",
            "위험 신호(risk) 필드를 감정 라벨과 분리해 안전 개입 로직이 감정 분석 로직에 흔들리지 않도록 독립 설계",
          ],
          images: [
            {
              src: "/projects/ppurine_schema.png",
              caption: "14개 그룹 · 81개 라벨 JSON Schema",
            },
          ],
        },
        {
          title: "공식 기관 데이터 기반 갈등 원인 통합 라벨 설계",
          description:
            "라벨을 임의로 만들지 않고 통계청·여성가족부·가족센터·가정법률상담소 4개 기관의 갈등 원인 분류 기준을 교차 비교해, " +
            "공식 통계 근거와 앱 UX 요구를 모두 반영한 통합 갈등 라벨 체계를 설계",
          points: [
            "4개 공식 기관 분류 항목을 표로 정리해 겹치는 항목과 기관별 고유 항목을 구분",
            "통계청 이혼 사유 비중(성격·가치관 차이 45.2% 등)을 라벨 우선순위 산정 근거로 활용",
            "온보딩에서 선택한 관계 상태(연애·신혼·기혼-자녀없음·기혼-자녀있음)에 따라 노출되는 고민 항목을 다르게 분기",
          ],
          table: {
            headers: ["갈등 원인", "통계청", "여가부 조사", "가족센터", "가정법률상담소"],
            rows: [
              {
                cells: ["성격·가치관 차이", "O (45.2%)", "O", "O", "O"],
                highlight: true,
              },
              { cells: ["경제·소비 갈등", "O (10.2%)", "O", "-", "O"] },
              { cells: ["시댁·처가 갈등", "O (7.4%)", "O", "-", "O"] },
              { cells: ["외도·신뢰 손상", "O (7.0%)", "-", "-", "O"] },
              { cells: ["신체·정신 학대", "O (3.6%)", "-", "O", "O"] },
              { cells: ["의사소통 단절", "-", "O", "O", "-"] },
            ],
          },
        },
        {
          title: "PostgreSQL + Blob Storage 이원화 데이터 모델 설계",
          description:
            "사용자 정보·감정 기록 메타데이터·분석 결과·커뮤니티 글 등 구조적 데이터는 PostgreSQL(RDBMS)에, " +
            "음성 파일·채팅 캡처 이미지·원본 입력 파일 등 비정형 데이터는 Azure Blob Storage에 분리 저장하는 데이터 모델을 설계",
          points: [
            "구조적 데이터와 비정형 데이터 저장소를 분리해 RDBMS 부하를 줄이고 원본 파일은 객체 스토리지 특성에 맞게 관리",
            "감정 기록·분석 결과·커뮤니티 데이터를 도메인별 테이블로 분리해 관리자 콘솔의 집계·모니터링 쿼리 확장에 대비",
            "기록 ID·분석 버전·생성 시각을 기준으로 분석 결과를 관리해 재분석 시에도 데이터가 중복 누적되지 않도록 방지",
          ],
        },
        {
          title: "상용화 준비 — Responsible AI 검증 지표 · 관리자 콘솔 · 수익화 정책",
          description:
            "MVP 시연에서 끝나지 않고 실제 운영 가능한 서비스로 이어지도록 AI 파이프라인 품질·윤리 검증 지표, " +
            "원문을 노출하지 않는 관리자 콘솔, 감정 데이터를 오남용하지 않는 수익화 정책까지 설계",
          points: [
            "PII 마스킹 성공률·위험 콘텐츠 차단률·JSON 생성 성공률·OCR·STT 성공률·평균 응답시간을 운영 검증 지표로 정의",
            "관리자 콘솔은 감정 기록 원문을 노출하지 않고 익명 요약·위험 플래그만으로 안전 신호를 검토하도록 설계 (Research Preview)",
            "감정 기록·AI 분석 결과 기반 광고 타겟팅은 금지하고, 기념일 등 맥락 기반 개인화 광고만 허용하는 수익화 정책 수립",
            "B2C 개인 구독 → B2B 기업 복지 → B2G 공공 연계로 이어지는 단계적 확장 로드맵과 Azure 클라우드 비용 효율화(예산 60만 원 중 10만 원 사용)로 상용화 가능성 확보",
          ],
          images: [
            {
              src: "/projects/ppurine_admin_safety.png",
              caption: "관리자 콘솔 — 원문 비공개 감정 안전 모니터링 · 기관 연계",
            },
          ],
        },
      ],
      verification: {
        title: "AI 파이프라인 품질·윤리 검증 지표",
        description: "MVP 시연에 그치지 않고 실제 운영 가능한 서비스임을 증명하기 위해 정의·측정한 안전성 검증 지표",
        stats: [
          { value: "90.3%", label: "위험 신호 탐지 Recall", category: "안전 지표" },
          { value: "91.5%", label: "위험 신호 탐지 F1-score", category: "안전 지표" },
          { value: "97.8%", label: "PII 마스킹 성공률", category: "개인정보 보호" },
          { value: "98.5%", label: "단정 회피율", category: "의료·법률 안전성" },
          { value: "99.2%", label: "금지 표현 회피율", category: "생성 안전성" },
        ],
      },
      result: [
        "22개 핵심 화면·기능, LangChain·pgvector·Azure OpenAI를 엮은 81라벨 AI 분석 파이프라인을 기획 → 구현 → Azure 연동 → 교차 검증까지 완주",
        "PII 마스킹 이후 100% 분석·게시 처리 — 개인정보 노출 없이 감정 데이터를 분석할 수 있는 구조 확보",
        "전체 예산 약 60만 원 중 약 10만 원(16.7%) 사용 — MVP 검증 비용을 예산 내에서 안정적으로 관리",
      ],
      expect: [
        "sLLM 경량화로 운영 비용을 낮추고 응답 속도를 높여, 더 많은 사용자에게 부담 없는 실시간 정서 케어 제공",
        "성인 인증·맥락 커머스 연동으로 신뢰 기반 결제·수익 구조를 갖춰 MVP를 넘어 실제 매출을 만드는 서비스로 전환",
        "B2C→B2B→B2G→B2B2C로 접점을 넓혀 개인을 넘어 기업 복지·공공기관·보험사까지 아우르는 관계 케어 인프라로 자리매김, 사회적 임팩트 확대",
        "화해 선물 추천·갈등 키워드 트렌드 리포트 등 데이터 기반 신사업으로 광고 외 매출원을 다각화해 안정적 수익 구조 확보",
        "앱스토어 정식 등록으로 접근 장벽을 낮춰 더 많은 부부·연인이 언제든 서비스에 접근 가능",
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
    summary:
      "바쁜 일상 속에서 쉽게 잊히는 감정과 순간들을 기록하고 미래의 자신에게 전달하기 위해 개발한 서비스. 음성으로 남긴 하루의 이야기를 AI가 편지 형태로 재구성하고, TTS를 통해 미래의 내가 직접 듣는 듯한 타임캡슐 경험을 제공합니다.",
    thumb: "/projects/Dearme0.png",
    image: { src: "/projects/Dearme0.png", caption: "Dear Me 서비스 소개" },
    image2: {
      src: "/projects/Dearme1.png",
      caption: "음성 녹음 메인 화면 · AI 비밀 친구 채팅",
    },
    image3: {
      src: "/projects/Dearme2.png",
      caption: "감정 분석 결과 · GPT-4o 생성 편지",
    },
    image4: {
      src: "/projects/Dearme3.png",
      caption: "QR 카드 저장 · 발송 날짜 및 채널 선택",
    },
    tags: [
      "Azure OpenAI GPT-4o",
      "LangChain",
      "Azure Speech",
      "RAG",
      "FastAPI",
      "React",
      "Python",
    ],
    year: "2026.06",
    metrics: [
      { value: "Azure", label: "Speech · OpenAI 연동" },
      { value: "3채널", label: "카카오·Discord·메일" },
      { value: "TTS", label: "AI 편지 낭독" },
    ],
    sections: {
      arch: "/projects/dearme_ar.png",
      flow: [
        {
          title: "음성 녹음 → STT 텍스트 변환",
          description:
            "사용자가 음성으로 하루를 기록하면 Azure Speech STT가 실시간으로 텍스트로 변환",
        },
        {
          title: "감정 분석 · 키워드 추출",
          description:
            "GPT-4o가 음성 텍스트에서 감정 상태·핵심 키워드를 분석하여 오늘의 감정 리포트 생성",
        },
        {
          title: "RAG로 과거 일기 컨텍스트 주입",
          description:
            "ChromaDB에서 과거 일기 유사도 검색(k=3) → 검색 결과를 프롬프트에 주입해 서사적 맥락이 담긴 개인화 편지 생성",
        },
        {
          title: "TTS 편지 낭독 · QR 카드 저장",
          description:
            "GPT-4o가 생성한 편지를 Azure Speech TTS로 낭독, QR 카드로 저장하여 미래의 나에게 전달할 타임캡슐 완성",
        },
        {
          title: "발송 날짜 예약 · 멀티채널 자동 전달",
          description:
            "APScheduler가 지정한 날짜에 카카오 알림톡·Discord·이메일 중 선택한 채널로 편지를 자동 발송",
        },
      ],
      tech: [
        {
          title:
            "LangChain LCEL + RAG — LLM 서비스 상용화 및 개인화 파이프라인",
          description:
            "Azure OpenAI GPT-4o를 단발성 API 호출이 아닌 STT→감정분석→RAG 컨텍스트 주입→편지 생성→TTS로 이어지는 End-to-End 실서비스 파이프라인으로 통합. LangChain LCEL로 프롬프트·LLM·파서를 선언형 체인으로 구성하고 RAG 리트리버를 결합하여 사용자별 맥락이 반영된 응답을 생성하는 구조를 직접 설계",
          points: [
            "LangChain LCEL 체인 설계: ChatPromptTemplate | AzureChatOpenAI | StrOutputParser — 프롬프트·LLM·파서를 선언형 체인으로 구성, 각 컴포넌트 독립 교체 가능",
            "RAG 파이프라인: ChromaDB에 과거 일기를 벡터 저장 → 유사도 검색(k=3) → 프롬프트 컨텍스트 동적 주입으로 감정 흐름 반영",
            "프롬프트 엔지니어링: 감정·맥락·발송 채널 정보를 컨텍스트로 결합해 개인화 편지 생성",
          ],
        },
        {
          title: "Azure Speech SDK — STT · TTS 파이프라인",
          description:
            "Azure Speech STT로 음성 녹음 → 텍스트 변환, GPT-4o가 생성한 편지를 Azure Speech TTS로 낭독 — 입력부터 출력까지 음성 End-to-End",
          points: [
            "STT → GPT-4o → TTS 단일 파이프라인으로 음성 입출력 완결",
            "Azure Speech STT: 음성 녹음 스트림을 실시간으로 텍스트 변환",
            "Azure Speech TTS: 생성된 편지를 자연스러운 음성으로 합성·재생",
          ],
        },
        {
          title: "Azure OpenAI GPT-4o — 감정 분석 및 편지 생성",
          description:
            "STT 변환 텍스트에서 감정·맥락을 추출하고 '미래의 나에게' 형식의 편지 자동 생성",
          points: [
            "편지 생성: 감정과 맥락을 바탕으로 미래의 나에게 보내는 편지 형식으로 작성",
            "감정 분석: 음성 텍스트에서 감정 상태·핵심 키워드 추출",
            "지정 발송일·채널(카카오톡·Discord·이메일)을 컨텍스트에 반영한 개인화 메시지",
          ],
        },
        {
          title: "카카오 OAuth 2.0 · 알림톡 연동",
          description:
            "카카오 OAuth 2.0 소셜 로그인으로 별도 회원가입 없이 인증 처리, 카카오 알림톡 비즈니스 API로 지정 날짜에 편지 자동 발송",
          points: [
            "카카오 OAuth 2.0: 인가 코드 흐름으로 액세스 토큰 발급 → /v2/user/me 호출로 사용자 프로필 조회 → users 테이블 저장 후 세션 관리",
            "카카오 알림톡: 비즈니스 채널 연동 후 템플릿 기반 메시지로 편지 내용 발송 — 카카오톡 미설치 환경에서도 SMS 대체 발송",
            "채널별 발송 로직 분리 (알림톡·Discord Webhook·이메일) — 실패 시 채널 이력에 에러 상태 기록",
          ],
        },
        {
          title: "일기 캘린더 · 날짜별 조회 REST API",
          description:
            "DiaryCalendar.jsx 월별 달력에 작성일을 금색 점으로 시각화, 날짜 클릭 시 그날 편지·감정·키워드를 즉시 조회 — /api/me · /api/calendar · /api/diary/{date} 3개 엔드포인트 설계",
          points: [
            "DiaryCalendar.jsx: 월별 달력 UI, 일기가 작성된 날짜에 금색 점 표시로 기록 현황 시각화",
            "날짜 클릭 → /api/diary/{date} 호출로 해당 날짜 편지·감정·키워드 목록 즉시 조회",
            "헤더 유저바: 닉네임 뱃지 + 캘린더 버튼 + 로그아웃 우측 상단 고정",
            "/api/me: 세션 기반 로그인 유저 정보 반환",
            "/api/calendar: 월별 날짜별 일기 건수 반환 → 달력 금색 점 렌더링에 활용",
            "/api/diary/{date}: 특정 날짜 일기 목록 반환 → 날짜별 상세 조회 지원",
          ],
        },
        {
          title: "APScheduler — 경량 스케줄러 선택 이유",
          description:
            "Celery + Redis 대신 APScheduler를 선택한 핵심 이유는 단일 프로세스 내 통합 — 브로커·워커 인프라 없이 FastAPI lifespan에 직접 내장하여 운영 복잡도를 최소화",
          points: [
            "개인 프로젝트 규모에서 Redis + Celery 스택은 오버엔지니어링 — APScheduler로 동일 기능을 단일 프로세스에서 구현",
            "SQLiteJobStore로 예약 정보 영속화, 서버 재시작 시 스케줄 자동 복구 — 별도 메시지 큐 없이 durability 확보",
            "발송 빈도가 최대 1일 1회 수준으로 낮아 경량 스케줄러로 처리량 충분, FastAPI lifespan 이벤트에 통합하여 앱 생명주기와 동기화",
          ],
        },
      ],
      expect: [
        "LangChain LCEL + RAG 기반 STT → 감정 분석 → 개인화 편지 생성 → TTS End-to-End 파이프라인을 Azure 단일 스택으로 설계·구현",
        "LLM을 단발 API 호출이 아닌 인증·예약 발송·멀티채널이 결합된 운영 가능한 서비스 구조로 구축",
      ],
    },
  },
];
