'use client';
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "사내 MLOps 플랫폼 DFLOW",
    description: "이미지 전처리·라벨링·학습 데이터셋 포맷팅 등 MLOps 반복 작업 자동화. 지원 모델 3개 → 20개 이상 확장, GPU 상태 기반 병렬 학습 환경 구축.",
    tags: ["Python", "MMDetection", "Redis", "Docker", "K8s", "PostgreSQL", "PyTorch"],
    year: "2024",
  },
  {
    title: "민군겸용기술개발 R&D",
    description: "정찰 드론 기반 위협 객체 탐지 및 3D 가시화·실시간 모니터링 시스템. 거리 오차 30~40% 감소, mAP 61% → 75% 달성, KTL 성적서 발급 완료.",
    tags: ["ROS", "Docker", "Faster R-CNN", "RealSense D435i", "PyTorch"],
    year: "2024",
  },
  {
    title: "UAV 대공감시",
    description: "EO/IR 센트리 카메라 기반 UAV 실시간 탐지·추적 및 모니터링 시스템. EO/IR 도메인별 데이터셋 분리 구축으로 주야간 안정적 탐지 성능 확보.",
    tags: ["Python", "RTSP", "YOLOv5", "MMDetection", "PyTorch"],
    year: "2024",
  },
  {
    title: "핫딜 자동화 시스템",
    description: "파트너사 핫딜 상품 신청부터 오픈까지 수작업 프로세스를 End-to-End 자동화. cron 배치 아키텍처 기반 운영 리소스 절감 및 핫딜 운영 안정성 확보.",
    tags: ["Python", "Shopby API", "BigQuery", "Cron", "HTML Template"],
    year: "2023",
  },
  {
    title: "CS 문의 자동화 시스템",
    description: "반복 배송 문의 패턴 분석 및 자동 응답 시나리오 설계. CS 응답 지연 시간 80% 단축, 전체 CS 문의의 약 1/3 자동 처리.",
    tags: ["Python", "Shopby API", "Sellmate API", "Batch"],
    year: "2023",
  },
];

const ProjectsWindow = () => {
  return (
    <div className="flex flex-col gap-3">
      {projects.map((p) => (
        <div
          key={p.title}
          className="group p-4 rounded-lg bg-foreground/[0.03] border border-foreground/[0.05] hover:border-primary/20 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground/90">{p.title}</h3>
            <ExternalLink size={12} strokeWidth={1.5} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{p.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{t}</span>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{p.year}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsWindow;
