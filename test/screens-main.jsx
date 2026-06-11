// ===== Screens =====
const { useState: useS, useEffect: useE } = React;

/* ---------- HOME ---------- */
function HomeScreen({ openProject, goTab }) {
  const [ref, scrolled] = useScrolled();
  const [reveal, revIn] = useReveal();
  const P = window.PROFILE, projects = window.PROJECTS;
  const featured = [projects[0], projects[2], projects[3]];
  return (
    <div className={"screen" + (revIn ? " in" : "")} ref={reveal} data-active>
      <AppBar title={P.name} scrolled={scrolled} />
      <div className="scroll" ref={ref}>
        {/* hero */}
        <div className="pad" style={{ paddingTop: 8, paddingBottom: 28 }}>
          <div className="rise" style={{ animationDelay: ".02s" }}>
            <div className="chip accent" style={{ display: "inline-block", marginBottom: 16 }}>5년차 · {P.roleShort}</div>
            <div className="h1">안녕하세요,<br/>{P.role.split(" · ")[0]} 개발자<br/><span style={{ color: "var(--accent)" }}>{P.name}</span>입니다</div>
          </div>
          <div className="rise" style={{ animationDelay: ".10s", marginTop: 22, display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar src={P.photo} size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{P.name} <span style={{ color: "var(--text-3)", fontWeight: 600, fontSize: 13 }}>{P.nameEn}</span></div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--green)", display: "inline-block", flex: "none" }} />
                Open for opportunities
              </div>
            </div>
          </div>
          <p className="body rise" style={{ animationDelay: ".16s", marginTop: 20 }}>{P.intro[0]}</p>
        </div>

        <div className="divider" />

        {/* metrics */}
        <div className="pad" style={{ paddingTop: 26, paddingBottom: 26 }}>
          <div className="section-label rise">대표 성과</div>
          <div className="metric-row rise" style={{ animationDelay: ".04s" }}>
            <div className="metric"><div className="mv accent">4시간→2분</div><div className="ml">핫딜 등록 작업 시간</div></div>
          </div>
          <div className="metric-row rise" style={{ animationDelay: ".08s", marginTop: 10 }}>
            <div className="metric"><div className="mv">61→75%</div><div className="ml">객체 탐지 mAP</div></div>
            <div className="metric"><div className="mv">3→20<span style={{fontSize:16}}>+</span></div><div className="ml">DFLOW 지원 모델</div></div>
          </div>
        </div>

        <div className="divider" />

        {/* projects preview */}
        <div className="pad" style={{ paddingTop: 24, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div className="section-label rise" style={{ marginBottom: 4 }}>대표 프로젝트</div>
            <button className="rise" onClick={() => goTab("projects")} style={{ border: "none", background: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>전체 {projects.length}개 보기</button>
          </div>
        </div>
        <div className="pad" style={{ paddingBottom: 24 }}>
          {featured.map((pr, i) => (
            <button key={pr.id} className="row rise" style={{ animationDelay: (i * 0.05 + 0.05) + "s" }} onClick={() => openProject(pr.id)}>
              <Avatar src={pr.thumb} size={52} />
              <div className="r-body">
                <div className="r-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>{pr.title}</div>
                <div className="r-sub">{pr.company} · {pr.year}</div>
              </div>
              <Icon name="chev" size={18} color="var(--text-4)" />
            </button>
          ))}
        </div>

        <div className="divider" />

        {/* skills */}
        <div className="pad" style={{ paddingTop: 26, paddingBottom: 30 }}>
          <div className="section-label rise">기술 스택</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {P.skills.map((g, i) => (
              <div key={g.category} className="rise" style={{ animationDelay: (i * 0.03) + "s" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-4)", marginBottom: 8 }}>{g.category}</div>
                <div className="chips">{g.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pad" style={{ paddingBottom: 36, display: "flex", gap: 10 }}>
          <button className="btn btn-weak rise" style={{ flex: 1 }} onClick={() => goTab("about")}>About</button>
          <button className="btn btn-primary rise" style={{ flex: 1.4 }} onClick={() => goTab("contact")}>연락하기</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- PROJECTS LIST ---------- */
function ProjectsScreen({ openProject }) {
  const [ref, scrolled] = useScrolled(20);
  const [reveal, revIn] = useReveal();
  const [filter, setFilter] = useS("all");
  const projects = window.PROJECTS;
  const shown = projects.filter(p => filter === "all" ? true : p.type === filter);
  const segs = [["all", "전체"], ["company", "회사"], ["team", "팀"]];
  return (
    <div className={"screen" + (revIn ? " in" : "")} ref={reveal} data-active>
      <AppBar title="프로젝트" scrolled={scrolled} />
      <div className="scroll" ref={ref}>
        <div className="pad" style={{ paddingTop: 4, paddingBottom: 18 }}>
          <div className="h1 rise">프로젝트</div>
          <p className="body rise" style={{ animationDelay: ".05s", marginTop: 6, fontSize: 14 }}>데이터 수집부터 모델 개발·배포까지, 직접 만든 {projects.length}개의 프로젝트예요.</p>
          {/* segmented control */}
          <div className="rise" style={{ animationDelay: ".1s", display: "flex", background: "var(--bg-gray)", borderRadius: 12, padding: 4, marginTop: 18 }}>
            {segs.map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                flex: 1, border: "none", cursor: "pointer", fontFamily: "inherit",
                height: 36, borderRadius: 9, fontSize: 14, fontWeight: 700,
                background: filter === k ? "#fff" : "transparent",
                color: filter === k ? "var(--text)" : "var(--text-3)",
                boxShadow: filter === k ? "0 1px 4px rgba(0,25,54,.10)" : "none",
                transition: "background .2s, color .2s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div className="pad" style={{ paddingBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {shown.map((pr, i) => (
            <button key={pr.id} className="rise" style={{ animationDelay: (i * 0.05) + "s", border: "1px solid var(--border)", background: "#fff", borderRadius: "var(--r-card)", padding: 0, overflow: "hidden", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }} onClick={() => openProject(pr.id)}>
              <div style={{ height: 150, background: "var(--bg-gray)", overflow: "hidden" }}>
                <img src={pr.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span className={"chip " + (pr.type === "team" ? "accent" : "")} style={{ fontSize: 11, padding: "4px 8px" }}>{pr.type === "team" ? "팀 프로젝트" : pr.company}</span>
                  <span style={{ fontSize: 12, color: "var(--text-4)", fontWeight: 600 }}>{pr.year}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{pr.title}</div>
                {pr.subtitle && <div style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, marginTop: 2 }}>{pr.subtitle}</div>}
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-2)", marginTop: 8 }}>{pr.summary}</p>
                <div className="metric-row" style={{ marginTop: 14, gap: 8 }}>
                  {pr.metrics.slice(0, 3).map((m, j) => (
                    <div key={j} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: j === 0 ? "var(--accent)" : "var(--text)", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, marginTop: 3, lineHeight: 1.3 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.ProjectsScreen = ProjectsScreen;
