// ===== WEB: Projects grid + filter + detail overlay =====
const { useState: useWS, useEffect: useWE, useRef: useWR } = React;

// Reveal hook: enables a subtle entrance ONLY in real browsers where CSS
// transitions actually tick. We probe once; if transitions don't progress
// (e.g. offscreen/headless render), we never hide content — it stays visible.
let __revealProbe = null;
function transitionsTick() {
  if (__revealProbe !== null) return __revealProbe;
  try {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;left:-9999px;opacity:0;transition:opacity .05s linear";
    document.body.appendChild(d);
    void d.offsetWidth; d.style.opacity = "1";
    const v = parseFloat(getComputedStyle(d).opacity);
    // mid-transition value should be between 0 and 1 if the clock is ticking
    __revealProbe = v > 0 && v < 1;
    document.body.removeChild(d);
  } catch (e) { __revealProbe = false; }
  return __revealProbe;
}

function useReveal2() {
  const ref = useWR(null);
  useWE(() => {
    const el = ref.current; if (!el) return;
    const items = el.classList.contains("reveal") ? [el] : Array.from(el.querySelectorAll(".reveal"));
    const animate = transitionsTick() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate) return; // leave content visible (base .reveal = opacity 1)
    document.documentElement.classList.add("reveal-ready");
    let pending = items.slice();
    const revealVisible = () => {
      const vh = window.innerHeight || 800;
      pending = pending.filter(i => {
        const r = i.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { i.classList.add("in"); return false; }
        return true;
      });
      if (!pending.length) cleanup();
    };
    const onScroll = () => revealVisible();
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t0 = setTimeout(revealVisible, 40);
    const t1 = setTimeout(() => { pending.forEach(i => i.classList.add("in")); cleanup(); }, 2400);
    return () => { clearTimeout(t0); clearTimeout(t1); cleanup(); };
  }, []);
  return ref;
}

function ProjectCard({ pr, onOpen, idx }) {
  return (
    <button className="proj-card reveal" style={{ transitionDelay: (idx % 2) * 0.07 + "s" }} onClick={() => onOpen(pr.id)}>
      <div className="proj-thumb"><img src={pr.thumb} alt="" loading="lazy" /></div>
      <div className="proj-body">
        <div className="proj-meta">
          <span className={"proj-tag" + (pr.type === "team" ? " team" : "")}>{pr.type === "team" ? "팀 프로젝트" : pr.company}</span>
          <span className="proj-year">{pr.year}</span>
        </div>
        <div className="proj-title">{pr.title}</div>
        {pr.subtitle && <div className="proj-subtitle">{pr.subtitle}</div>}
        <p className="proj-summary">{pr.summary}</p>
        <div className="proj-stats">
          {pr.metrics.slice(0, 3).map((m, j) => (
            <div className="proj-stat" key={j}>
              <div className="sv">{m.value}</div>
              <div className="sl">{m.label}</div>
            </div>
          ))}
        </div>
        <span className="proj-more">자세히 보기 <Icon name="arrow" size={17} stroke={2.2} /></span>
      </div>
    </button>
  );
}

function ProjectsSection({ onOpen }) {
  const [filter, setFilter] = useWS("all");
  const ref = useReveal2();
  const projects = window.PROJECTS;
  const shown = projects.filter(p => filter === "all" ? true : p.type === filter);
  const segs = [["all", "전체"], ["company", "회사"], ["team", "팀"]];
  return (
    <section id="projects" className="sec-pad">
      <div className="container" ref={ref}>
        <div className="proj-head">
          <div className="reveal">
            <div className="eyebrow">Work</div>
            <h2 className="sec-title">프로젝트</h2>
            <p className="sec-sub">데이터 수집부터 모델 개발·배포·운영까지, 직접 설계하고 만든 {projects.length}개의 프로젝트예요.</p>
          </div>
          <div className="filter reveal">
            {segs.map(([k, label]) => (
              <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="proj-grid">
          {shown.map((pr, i) => <ProjectCard key={pr.id} pr={pr} idx={i} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------- Detail overlay ---------- */
function DetailEyebrowTitle({ eyebrow, title }) {
  return (
    <div className="dt-sec-head">
      <div className="dt-sec-eyebrow">{eyebrow}</div>
      <div className="dt-sec-title">{title}</div>
    </div>
  );
}

function ProjectDetailWeb({ id, onClose }) {
  const [scrolled, setScrolled] = useWS(false);
  const scRef = useWR(null);
  const pr = window.PROJECTS.find(p => p.id === id);
  useWE(() => {
    const el = scRef.current; if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 180);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [id]);
  useWE(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!pr) return null;
  const s = pr.sections;
  return (
    <div className={"detail" + (id ? " open" : "")} ref={scRef}>
      <div className={"detail-bar" + (scrolled ? " scrolled" : "")}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 0 }}>
          <span className="dt-title">{pr.title}</span>
          <div style={{ display: "flex", gap: 10 }}>
            {pr.link && <a className="btn btn-ghost btn-sm" href={pr.link} target="_blank" rel="noreferrer"><Icon name="link" size={16} /> 서비스</a>}
            <button className="detail-close" onClick={onClose} aria-label="close"><Icon name="close" size={22} /></button>
          </div>
        </div>
      </div>
      <div className="detail-inner">
        <div className="dt-hero-meta">
          <div className={"dt-avatar" + (pr.type === "team" ? " team" : "")}>{pr.initial}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{pr.company}</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>{pr.year}</div>
          </div>
        </div>
        {pr.subtitle && <div className="dt-subtitle">{pr.subtitle}</div>}
        <h1 className="dt-title-lg">{pr.title}</h1>
        <p className="dt-summary">{pr.summary}</p>
        <div className="chips" style={{ marginTop: 24 }}>{pr.tags.map(t => <span key={t} className="chip">{t}</span>)}</div>

        <div className="dt-hero-img"><img src={pr.image.src} alt="" /></div>
        {pr.image.caption && <div className="dt-cap">{pr.image.caption}</div>}

        <div className="dt-section">
          <DetailEyebrowTitle eyebrow="IMPACT" title="핵심 성과" />
          <div className="dt-metrics">
            {pr.metrics.map((m, i) => (
              <div className="dt-metric" key={i}>
                <div className="mv">{m.value}</div>
                {m.from && <div className="mfrom">{m.from}</div>}
                <div className="ml">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dt-section">
          <DetailEyebrowTitle eyebrow="WHY" title="기획 의도" />
          <div className="dt-intent">
            {s.intent.map((t, i) => (
              <div className="dt-intent-row" key={i}><div className="dt-intent-num">{i + 1}</div><p>{t}</p></div>
            ))}
          </div>
        </div>

        <div className="dt-section">
          <DetailEyebrowTitle eyebrow="HOW" title="핵심 기술" />
          <div className="dt-tech">
            {s.tech.map((t, i) => (
              <div className="dt-tech-card" key={i}>
                <div className="dt-tech-top">
                  <span className="dt-tech-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="dt-tech-title">{t.title}</div>
                </div>
                <p className="dt-tech-desc">{t.description}</p>
                {t.points && (
                  <div className="dt-tech-points">
                    {t.points.map((pt, j) => (
                      <div className="dt-point" key={j}><Icon name="check" size={17} stroke={2.4} /><span>{pt}</span></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {s.arch && (
          <div className="dt-section">
            <DetailEyebrowTitle eyebrow="SYSTEM" title="아키텍처" />
            <div className="dt-arch"><img src={s.arch} alt="아키텍처 다이어그램" /></div>
          </div>
        )}

        <div className="dt-section">
          <DetailEyebrowTitle eyebrow="RESULT" title={s.expect ? "기대 효과" : "성과"} />
          <div className="dt-result">
            {(s.result || s.expect).map((t, i) => (
              <div className="dt-result-row" key={i}><Icon name="check" size={20} stroke={2.4} /><p>{t}</p></div>
            ))}
          </div>
        </div>

        {pr.link && (
          <div style={{ marginTop: 56 }}>
            <a className="btn btn-primary" href={pr.link} target="_blank" rel="noreferrer">실제 서비스 보기 <Icon name="arrow" size={18} stroke={2.2} /></a>
          </div>
        )}
      </div>
    </div>
  );
}

window.ProjectsSection = ProjectsSection;
window.ProjectDetailWeb = ProjectDetailWeb;
window.useReveal2 = useReveal2;
