'use client';

const AboutWindow = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">👩‍💻</span>
        </div>
        <div>
          <h2 className="text-lg font-medium text-foreground">김민영 | KIM MIN YOUNG</h2>
          <p className="text-sm text-muted-foreground">ML 모델 개발 / MLOps 개발자</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">About</h3>
        <p className="text-xs text-foreground/70 leading-relaxed">
          위성영상 및 다양한 영상 데이터를 활용하여 ML 모델을 개발하고, 실제 서비스 환경에 적용하기 위한 MLOps 파이프라인을 구축·운영한 경험이 있는 5년 차 개발자입니다.
        </p>
        <p className="text-xs text-foreground/70 leading-relaxed">
          RealSense 카메라, 드론 영상, 항공 영상, RTSP 영상 등 다양한 영상 데이터를 다루며 데이터 수집부터 모델 개발, 배포 및 운영까지 이어지는 End-to-End ML 파이프라인 구축에 강점을 가지고 있습니다.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">System Info</h3>
        <div className="space-y-2 font-mono-code text-xs">
          {[
            ["Location", "Seoul, South Korea"],
            ["Experience", "5년차"],
            ["Specialization", "ML/MLOps, Computer Vision"],
            ["Status", "Open for opportunities"],
            ["OS Version", "Portfolio.v2026.1"],
          ].map(([key, value]) => (
            <div key={key} className="flex justify-between py-1.5 border-b border-foreground/[0.05]">
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground/80">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Skills</h3>
        <div className="space-y-2">
          {[
            { category: "Language", skills: ["Python", "C"] },
            { category: "Framework", skills: ["PyTorch", "Flask", "FastAPI", "Label Studio", "MLflow"] },
            { category: "Database", skills: ["PostgreSQL", "Redis"] },
            { category: "Infra", skills: ["Docker", "Kubernetes"] },
            { category: "Models", skills: ["YOLOv5", "Faster R-CNN", "RetinaNet", "MMDetection", "MambaCD"] },
            { category: "Else", skills: ["Git", "Jira"] },
          ].map(({ category, skills }) => (
            <div key={category} className="py-1.5 border-b border-foreground/[0.05]">
              <p className="text-[10px] text-muted-foreground mb-1.5">{category}</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-foreground/[0.05] text-foreground/70">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutWindow;
