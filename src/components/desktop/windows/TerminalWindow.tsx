'use client';

const TerminalWindow = () => {
  return (
    <div className="font-mono-code text-xs space-y-1 text-foreground/70">
      <div><span className="text-primary">~</span> whoami</div>
      <div className="text-foreground/50">김민영 | ML 모델 개발 / MLOps 5년차 개발자</div>
      <div className="text-foreground/50">다양한 영상 데이터 기반 End-to-End ML 파이프라인 구축 경험</div>
      <div className="mt-3"><span className="text-primary">~</span> cat skills.json</div>
      <div className="text-foreground/50">{"{"}</div>
      <div className="text-foreground/50 pl-4">"language": ["Python", "C"],</div>
      <div className="text-foreground/50 pl-4">"framework": ["PyTorch", "Flask", "FastAPI", "MLflow", "Label Studio"],</div>
      <div className="text-foreground/50 pl-4">"database": ["PostgreSQL", "Redis"],</div>
      <div className="text-foreground/50 pl-4">"infra": ["Docker", "Kubernetes"],</div>
      <div className="text-foreground/50 pl-4">"models": ["YOLOv5", "Faster R-CNN", "MMDetection", "MambaCD"]</div>
      <div className="text-foreground/50">{"}"}</div>
      <div className="mt-3"><span className="text-primary">~</span> echo $STATUS</div>
      <div className="text-primary/80">Open for opportunities ✦</div>
      <div className="mt-3 flex items-center">
        <span className="text-primary">~</span>
        <span className="ml-1 w-2 h-3.5 bg-primary animate-blink inline-block" />
      </div>
    </div>
  );
};

export default TerminalWindow;
