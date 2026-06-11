// ===== About & Contact =====
function AboutScreen({ goTab }) {
  const [ref, scrolled] = useScrolled(20);
  const [reveal, revIn] = useReveal();
  const P = window.PROFILE;
  return (
    <div className={"screen" + (revIn ? " in" : "")} ref={reveal} data-active>
      <AppBar title="About" scrolled={scrolled} />
      <div className="scroll" ref={ref}>
        <div className="pad" style={{ paddingTop: 4, paddingBottom: 24 }}>
          <div className="h1 rise">About</div>
          <div className="rise" style={{ animationDelay: ".05s", marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar src={P.photo} size={68} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{P.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, marginTop: 1 }}>{P.nameEn}</div>
              <div style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 700, marginTop: 5 }}>{P.role}</div>
            </div>
          </div>
          {P.intro.map((t, i) => (
            <p key={i} className="body rise" style={{ animationDelay: (0.1 + i * 0.04) + "s", marginTop: 16 }}>{t}</p>
          ))}
        </div>

        <div className="divider" />

        <div className="pad" style={{ paddingTop: 26, paddingBottom: 24 }}>
          <div className="section-label rise">System Info</div>
          <div className="rise" style={{ animationDelay: ".04s" }}>
            {P.systemInfo.map(([k, v]) => (
              <div key={k} className="row" style={{ cursor: "default", padding: "13px 0" }}>
                <div className="r-body"><span style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{k}</span></div>
                <div className="r-val" style={{ fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="pad" style={{ paddingTop: 26, paddingBottom: 30 }}>
          <div className="section-label rise">Skills</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {P.skills.map((g, i) => (
              <div key={g.category} className="rise" style={{ animationDelay: (i * 0.03) + "s" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-4)", marginBottom: 8 }}>{g.category}</div>
                <div className="chips">{g.skills.map(sk => <span key={sk} className="chip">{sk}</span>)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pad" style={{ paddingBottom: 36 }}>
          <button className="btn btn-weak rise" onClick={() => goTab("contact")}>
            <Icon name="mail" size={18} stroke={2} /> 연락처 보기
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactScreen() {
  const [ref, scrolled] = useScrolled(20);
  const [reveal, revIn] = useReveal();
  const P = window.PROFILE;
  const iconFor = { phone: "phone", mail: "mail", github: "github" };
  const [sent, setSent] = React.useState(false);
  return (
    <div className={"screen" + (revIn ? " in" : "")} ref={reveal} data-active>
      <AppBar title="Contact" scrolled={scrolled} />
      <div className="scroll" ref={ref}>
        <div className="pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
          <div className="h1 rise">함께 일해요</div>
          <p className="body rise" style={{ animationDelay: ".05s", marginTop: 8 }}>새로운 기회나 협업 제안은 언제든 환영이에요. 편하게 연락 주세요.</p>
        </div>

        <div className="pad" style={{ paddingTop: 18, paddingBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {P.contact.map((c, i) => (
            <a key={c.kind} href={c.href} target="_blank" rel="noreferrer" className="rise" style={{
              animationDelay: (i * 0.05) + "s", display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px", borderRadius: 16, background: "var(--bg-gray)", textDecoration: "none",
            }}>
              <div className="squircle" style={{ width: 42, height: 42, background: "#fff" }}>
                <span style={{ color: "var(--accent)" }}><Icon name={iconFor[c.kind]} size={20} stroke={1.9} /></span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>{c.kind}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</div>
              </div>
              <Icon name="chev" size={18} color="var(--text-4)" />
            </a>
          ))}
        </div>

        <div className="divider" />

        <div className="pad" style={{ paddingTop: 26, paddingBottom: 36 }}>
          <div className="section-label rise">Quick Message</div>
          <div className="rise" style={{ animationDelay: ".04s", display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="회신 받을 이메일" style={inputStyle} />
            <textarea placeholder="전하고 싶은 메시지를 남겨주세요" rows={4} style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }} />
            <button className="btn btn-primary" onClick={() => { setSent(true); setTimeout(() => setSent(false), 2200); }}>
              {sent ? "전송되었어요 ✓" : "메시지 보내기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "14px 16px", fontSize: 15, fontFamily: "inherit",
  borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-soft)",
  color: "var(--text)", outline: "none",
};

window.AboutScreen = AboutScreen;
window.ContactScreen = ContactScreen;
