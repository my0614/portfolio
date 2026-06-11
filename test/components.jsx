// ===== Toss-style icon set (stroke, 24px) + shared UI =====
const { useState, useEffect, useRef } = React;

function Icon({ name, size = 24, stroke = 2, color = "currentColor", fill = "none" }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: fill, stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    back: <path d="M15 19l-7-7 7-7" />,
    home: <path d="M3 11l9-8 9 8M5 9.5V20h5v-6h4v6h5V9.5" />,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></>,
    phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L16 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
    github: <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.3 4.3 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
    chev: <path d="M9 6l6 6-6 6" />,
    chevDown: <path d="M6 9l6 6 6-6" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    link: <><path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" /><path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" /></>,
    doc: <><path d="M6 2.5h7l5 5V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" /><path d="M13 2.5V8h5" /></>,
    check: <path d="M5 12.5l4.5 4.5L19 7" />,
    spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
    download: <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
    moon: <path d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z" />,
  };
  return <svg {...p} style={{ display: "block" }}>{paths[name] || null}</svg>;
}

// avatar squircle: image or initial
function Avatar({ src, initial, size = 56, font = 22, bg = "var(--bg-gray)", color = "var(--text-2)" }) {
  return (
    <div className="squircle" style={{ width: size, height: size, background: bg }}>
      {src
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: font, fontWeight: 800, color }}>{initial}</span>}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <div className="sb-right">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M8.5 2.5c2 0 3.8.8 5.1 2l1.3-1.4A9.3 9.3 0 008.5.5 9.3 9.3 0 002.1 3.1L3.4 4.5a7.3 7.3 0 015.1-2z" opacity="0.9"/><path d="M8.5 6c1.1 0 2.1.4 2.8 1.1l1.3-1.4A6 6 0 008.5 4a6 6 0 00-4.1 1.7l1.3 1.4A4 4 0 018.5 6z"/><circle cx="8.5" cy="10" r="1.6"/></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.6" y="0.6" width="21" height="10.8" rx="2.6" stroke="currentColor" strokeOpacity="0.4"/><rect x="2" y="2" width="17" height="8" rx="1.4" fill="currentColor"/><rect x="23" y="3.6" width="1.6" height="4.8" rx="0.8" fill="currentColor" fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

// app bar with optional back; shows title on scroll
function AppBar({ title, onBack, scrolled, right }) {
  return (
    <div className={"appbar" + (scrolled ? " scrolled" : "")}>
      {onBack && <button className="iconbtn" onClick={onBack} aria-label="back"><Icon name="back" size={26} /></button>}
      <div className="appbar-title" style={{ paddingLeft: onBack ? 0 : 18 }}>{title}</div>
      <div className="appbar-spacer" />
      {right}
    </div>
  );
}

// reveal-on-scroll wrapper handled by CSS .rise; track scroll to toggle appbar title
function useScrolled(threshold = 40) {
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > threshold);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return [ref, scrolled];
}

// reveal: returns [ref, isIn]. Copies stagger delay to transitionDelay, flips `in` after mount.
function useReveal() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (el) el.querySelectorAll(".rise").forEach(n => {
      if (n.style.animationDelay) n.style.transitionDelay = n.style.animationDelay;
    });
    const id = setTimeout(() => setOn(true), 30);
    return () => clearTimeout(id);
  }, []);
  return [ref, on];
}

Object.assign(window, { Icon, Avatar, StatusBar, AppBar, useScrolled, useReveal });
