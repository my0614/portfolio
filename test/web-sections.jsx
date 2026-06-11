// ===== WEB: Hero, Impact, About, Contact, Footer =====
function Hero() {
  const P = window.PROFILE;
  const ref = window.useReveal2();
  return (
    <section id="top" className="hero">
      <div className="container hero-grid" ref={ref}>
        <div>
          <div className="hero-badge reveal"><span className="dot"></span>5년차 · ML / MLOps Engineer</div>
          <h1 className="reveal" style={{ transitionDelay: ".05s" }}>
            영상 데이터로<br />문제를 푸는<br /><span className="accent">{P.name}</span>입니다
          </h1>
          <p className="hero-role reveal" style={{ transitionDelay: ".1s" }}>{P.role}</p>
          <p className="hero-intro reveal" style={{ transitionDelay: ".14s" }}>{P.intro[0]}</p>
          <div className="hero-cta reveal" style={{ transitionDelay: ".18s" }}>
            <a className="btn btn-primary" href="#projects">프로젝트 보기 <Icon name="arrow" size={18} stroke={2.2} /></a>
            <a className="btn btn-ghost" href="#contact">연락하기</a>
          </div>
        </div>
        <div className="reveal" style={{ transitionDelay: ".12s" }}>
          <div className="hero-photo"><img src={P.photo} alt={P.name} /></div>
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const ref = window.useReveal2();
  const stats = [
    { v: <><span>4시간</span><span className="arrow">→</span><span>2분</span></>, label: "핫딜 등록 작업 시간" },
    { v: <><span>61</span><span className="arrow">→</span><span>75%</span></>, label: "드론 객체 탐지 mAP" },
    { v: <><span>3</span><span className="arrow">→</span><span>20+</span></>, label: "DFLOW 지원 모델 수" },
    { v: <>24/7</>, label: "CS 자동 응답 운영" },
  ];
  return (
    <section className="impact sec-pad-sm">
      <div className="container" ref={ref}>
        <div className="impact-grid">
          {stats.map((s, i) => (
            <div className="impact-card reveal" key={i} style={{ transitionDelay: i * 0.06 + "s" }}>
              <div className="impact-val">{s.v}</div>
              <div className="impact-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const P = window.PROFILE;
  const ref = window.useReveal2();
  return (
    <section id="about" className="sec-pad">
      <div className="container" ref={ref}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div className="eyebrow">About</div>
          <h2 className="sec-title">소개</h2>
        </div>
        <div className="about-grid">
          <div className="reveal">
            {P.intro.map((t, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-2)", marginBottom: 18 }}>{t}</p>
            ))}
            <div className="info-list" style={{ marginTop: 30 }}>
              {P.systemInfo.map(([k, v]) => (
                <div className="info-row" key={k}><span className="ik">{k}</span><span className="iv">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="about-skills reveal" style={{ transitionDelay: ".08s" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>기술 스택</div>
            {P.skills.map(g => (
              <div className="skill-group" key={g.category}>
                <div className="sg-label">{g.category}</div>
                <div className="chips">{g.skills.map(sk => <span className="chip" key={sk}>{sk}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const P = window.PROFILE;
  const ref = window.useReveal2();
  const [sent, setSent] = React.useState(false);
  const iconFor = { phone: "phone", mail: "mail", github: "github" };
  return (
    <section id="contact" className="contact sec-pad">
      <div className="container" ref={ref}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div className="eyebrow">Contact</div>
          <h2 className="sec-title">함께 일해요</h2>
          <p className="sec-sub">새로운 기회나 협업 제안은 언제든 환영이에요. 편하게 연락 주세요.</p>
        </div>
        <div className="contact-grid">
          <div className="contact-cards reveal">
            {P.contact.map(c => (
              <a className="contact-card" key={c.kind} href={c.href} target="_blank" rel="noreferrer">
                <div className="contact-ico"><Icon name={iconFor[c.kind]} size={22} stroke={1.9} /></div>
                <div style={{ minWidth: 0 }}>
                  <div className="cc-kind">{c.kind}</div>
                  <div className="cc-label">{c.label}</div>
                </div>
              </a>
            ))}
          </div>
          <form className="reveal" style={{ transitionDelay: ".08s", display: "flex", flexDirection: "column", gap: 12 }}
            onSubmit={(e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 2400); }}>
            <input className="field" placeholder="회신 받을 이메일" type="email" required />
            <textarea className="field" placeholder="전하고 싶은 메시지를 남겨주세요" required></textarea>
            <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>
              {sent ? "전송되었어요 ✓" : "메시지 보내기"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const P = window.PROFILE;
  return (
    <footer className="footer">
      <div className="container footer-in">
        <div className="fl">© 2026 {P.name} ({P.nameEn}) · ML / MLOps Engineer</div>
        <div style={{ display: "flex", gap: 8 }}>
          {P.contact.map(c => (
            <a key={c.kind} className="icon-toggle" href={c.href} target="_blank" rel="noreferrer" aria-label={c.kind}>
              <Icon name={{ phone: "phone", mail: "mail", github: "github" }[c.kind]} size={19} stroke={1.9} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Hero, Impact, About, Contact, Footer });
