import { PROFILE, PROJECTS } from "@/data/portfolio";

export const metadata = {
  title: "포트폴리오 | 김민영 | 김민영",
};

const ACCENT = "#1b64da";
const BLUE = "#3182f6";
const BLUE_LIGHT = "#e8f2ff";

const noBreak: React.CSSProperties = {
  breakInside: "avoid",
  pageBreakInside: "avoid",
};

export default function PortfolioPDF() {
  return (
    <div
      style={{
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
        background: "#fff",
        color: "#111",
        fontSize: "13px",
        lineHeight: "1.65",
        maxWidth: "860px",
        margin: "0 auto",
        padding: "40px 48px",
      }}
    >
      <style>{`
        @media print {
          @page { margin: 12mm 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          .page-break { page-break-before: always; }
          .no-break { break-inside: avoid; page-break-inside: avoid; }
        }
        .page-break { margin-top: 48px; }
        .no-break { break-inside: avoid; page-break-inside: avoid; }
        img { max-width: 100%; display: block; object-fit: contain; }
      `}</style>

      {/* ── COVER ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#999", fontWeight: 600, margin: "0 0 12px" }}>
              P O R T F O L I O
            </p>
            <h1 style={{ fontSize: "48px", fontWeight: 900, lineHeight: 1.05, margin: "0 0 14px" }}>
              ML / MLOps<span style={{ color: BLUE }}>.</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#555", fontWeight: 600, margin: 0 }}>
              ML 모델 개발 / MLOps 개발자
            </p>
          </div>
          <img
            src={PROFILE.photo}
            alt={PROFILE.name}
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #e5e5e5",
              flexShrink: 0,
            }}
          />
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: "24px 0" }} />

        <NarrativeSection title="여러 모델, 하나의 안정적인 구조">
          위성영상·드론영상·EO/IR 영상 등 도메인 특성에 맞춰 CNN 계열과 Transformer 계열 모델을 함께 다뤄왔습니다.
          EO·IR 이중 도메인 UAV 탐지 프로젝트에서는 도메인별 모델 분리 학습으로 주야간 모두 안정적인 탐지 성능을 확보했고,
          위험 지역 드론 탐지 프로젝트에서는 <B>mAP 75%</B> 수준의 실시간 탐지를 구현했습니다.
        </NarrativeSection>
        <NarrativeSection title="모델보다 모델이 도는 환경">
          사내 MLOps 플랫폼을 구축해 <B>20개 이상의 모델</B>을 표준 파이프라인 위에서 운영하며
          신규 모델 온보딩을 <B>1일</B>로 단축했고, Kubernetes 기반 RTSP 병렬 처리 환경을 설계해
          복수 카메라 실시간 스트림을 끊김 없이 처리했습니다.
        </NarrativeSection>
        <NarrativeSection title="기술을 업무 효율로 연결">
          핫딜 등록 자동화로 <B>4시간 작업을 2분</B>으로(99%) 단축했고,
          CS 문의 자동화로 응답 지연을 <B>80% 줄이며</B> 24/7 무중단 운영 체계를 만들었습니다.
        </NarrativeSection>

        {/* ABOUT + SKILLS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "28px" }}>
          <div>
            <SmallLabel>ABOUT</SmallLabel>
            <InfoRow k="EMAIL" v="premierckim@gmail.com" />
            <InfoRow k="GITHUB" v="github.com/my0614" />
            <InfoRow k="BASE" v="Seoul, Korea" />
            <InfoRow k="CAREER" v="5년차" />
          </div>
          <div>
            <SmallLabel>SKILLS</SmallLabel>
            {PROFILE.skills.map((cat) => (
              <p key={cat.category} style={{ margin: "3px 0", fontSize: "12px" }}>
                <span style={{ fontWeight: 700 }}>{cat.category}</span>
                <span style={{ color: "#555" }}> · {cat.skills.join(", ")}</span>
              </p>
            ))}
          </div>
        </div>

      </div>

      {/* ── PROJECTS ── */}
      <div className="page-break">
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: BLUE, margin: "0 0 4px" }}>Projects</h2>
        <hr style={{ border: "none", borderTop: "2px solid #111", margin: 0 }} />
      </div>
      {PROJECTS.map((proj) => {
        const techList = proj.type === "company" ? proj.sections.tech : proj.sections.tech.slice(0, 3);
        return (
        <div key={proj.id} className={["drone", "cs", "eyakmeoyak", "ppurine"].includes(proj.id) ? "page-break" : undefined} style={{ marginTop: "48px" }}>
          {/* 헤더 */}
          <div className="no-break">
            <h2 style={{ fontSize: "24px", fontWeight: 900, margin: "0 0 6px" }}>{proj.title}</h2>
            <p style={{ margin: "0 0 14px", fontSize: "12px" }}>
              <span style={{ color: BLUE, fontWeight: 700 }}>{proj.company}</span>
              <span style={{ color: "#888" }}> · {proj.year}</span>
            </p>
            <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: "0 0 20px" }} />
          </div>

          {/* 이미지 */}
          <ProjectImages proj={proj} />

          {/* 개요 */}
          <div className="no-break">
            <p style={{ fontSize: "11px", color: "#999", fontWeight: 600, margin: "18px 0 6px" }}>개요</p>
            <p style={{ margin: "0 0 20px", color: "#333", lineHeight: 1.8, fontSize: "13px" }}>{proj.summary}</p>
          </div>

          {/* 메트릭 — 역할 위 */}
          {proj.metrics.length > 0 && (
            <div className="no-break" style={{ display: "flex", gap: "28px", marginBottom: "20px", flexWrap: "wrap" }}>
              {proj.metrics.map((m, i) => (
                <div key={i} style={{ textAlign: "center", minWidth: "56px" }}>
                  <div style={{ fontSize: "10px", color: "#bbb", textDecoration: m.from ? "line-through" : "none", minHeight: "15px", visibility: m.from ? "visible" : "hidden" }}>
                    {m.from ?? "　"}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: BLUE, lineHeight: 1.1 }}>{m.value}</div>
                  <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* 역할 */}
          <div className="no-break" style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", color: "#999", fontWeight: 600, margin: "0 0 8px" }}>역할</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {techList.map((t, i) => (
                <li key={i} style={{ fontSize: "12px", fontWeight: 600, marginBottom: "5px", paddingLeft: "2px" }}>
                  {t.title.split("—")[0].split(":")[0].trim()}
                </li>
              ))}
            </ul>
          </div>

          {/* SKILLS 태그 */}
          <div className="no-break" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
            {proj.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  border: `1px solid ${BLUE}44`,
                  borderRadius: "4px",
                  padding: "2px 8px",
                  color: ACCENT,
                  background: BLUE_LIGHT,
                  fontFamily: "monospace",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 기술 상세 */}
          {techList.map((t, i) => {
            const points = proj.type === "company" ? t.points : t.points?.slice(0, 2);
            return (
            <div key={i} className="no-break" style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", margin: "0 0 7px" }}>{t.title}</p>
              <div style={{ border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden", fontSize: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "56px 1fr" }}>
                  <div style={{ background: "#f8f8f8", padding: "8px", color: "#999", fontWeight: 600, fontSize: "10px", borderRight: "1px solid #e5e5e5" }}>
                    배경
                  </div>
                  <div style={{ padding: "8px 12px", color: "#444", lineHeight: 1.7 }}>{t.description}</div>
                </div>
                {points && points.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", borderTop: "1px solid #dbeafe" }}>
                    <div style={{ background: BLUE_LIGHT, padding: "8px", color: BLUE, fontWeight: 700, fontSize: "10px", borderRight: "1px solid #dbeafe" }}>
                      해결
                    </div>
                    <div style={{ padding: "8px 12px" }}>
                      <ul style={{ margin: 0, paddingLeft: "14px" }}>
                        {points.map((pt, j) => (
                          <li key={j} style={{ color: "#333", marginBottom: "2px", lineHeight: 1.65 }}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {proj.type === "company" && t.images && t.images.length > 0 && (
                  <div style={{ display: "flex", gap: "12px", padding: "12px", borderTop: "1px solid #e5e5e5" }}>
                    {t.images.map((img, j) => (
                      <div key={j} style={{ flex: "1 1 0" }}>
                        <img
                          src={img.src}
                          alt={img.caption ?? ""}
                          style={{ width: "100%", maxHeight: "320px", borderRadius: "6px", objectFit: "contain" }}
                        />
                        {img.caption && (
                          <p style={{ fontSize: "10.5px", color: "#888", margin: "4px 0 0", textAlign: "center" }}>{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {t.table && (
                  <div className="no-break" style={{ padding: "8px 12px", borderTop: "1px solid #e5e5e5" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                      <thead>
                        <tr style={{ background: "#f8f8f8" }}>
                          {t.table.headers.map((h) => (
                            <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #e5e5e5", color: "#555" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.table.rows.map((row, ri) => (
                          <tr key={ri} style={{ background: row.highlight ? BLUE_LIGHT : "transparent", breakInside: "avoid", pageBreakInside: "avoid" }}>
                            {row.cells.map((cell, ci) => (
                              <td key={ci} style={{ padding: "5px 8px", borderBottom: "1px solid #f0f0f0", fontWeight: row.highlight ? 700 : 400, color: row.highlight ? ACCENT : "#333" }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            );
          })}

          {/* 결과 */}
          {proj.sections.result && proj.sections.result.length > 0 && (
            <div className="no-break" style={{ marginTop: "4px" }}>
              {proj.sections.result.map((r, i) => (
                <p key={i} style={{ margin: "5px 0", fontSize: "12px", color: "#333" }}>
                  <span style={{ fontWeight: 800, color: BLUE }}>→</span> {r}
                </p>
              ))}
            </div>
          )}
        </div>
        );
      })}

      {/* FOOTER */}
      <div style={{ marginTop: "40px", paddingTop: "12px", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999" }}>
        <span>{PROFILE.name} · {PROFILE.roleShort}</span>
        <span>premierckim@gmail.com</span>
      </div>
    </div>
  );
}

function ProjectImages({ proj }: { proj: (typeof PROJECTS)[0] }) {
  const isCompany = proj.type === "company";
  const arch = isCompany ? proj.sections.arch : undefined;
  const main = proj.image;
  const extra = isCompany
    ? ([proj.image2, proj.image3, proj.image4].filter(Boolean) as { src: string; caption?: string }[])
    : [];

  if (proj.id === "uav") return null;

  return (
    <div className="no-break">
      {/* 아키텍처 — 높이 제한 */}
      {arch && (
        <div style={{ marginBottom: "8px", textAlign: "center" }}>
          <img
            src={arch}
            alt="아키텍처"
            style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "6px", margin: "0 auto" }}
          />
          <p style={{ fontSize: "10px", color: "#999", textAlign: "center", margin: "2px 0 0" }}>아키텍처</p>
        </div>
      )}
      {/* 메인 + 서브 이미지 */}
      {(main || extra.length > 0) && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          {main && main.src !== proj.sections.arch && (
            <div style={{ flex: extra.length > 0 ? "1 1 50%" : "1 1 100%" }}>
              <img
                src={main.src}
                alt={main.caption ?? ""}
                style={{ width: "100%", maxHeight: isCompany ? "150px" : "300px", objectFit: "contain", borderRadius: "6px" }}
              />
              {main.caption && (
                <p style={{ fontSize: "10px", color: "#999", textAlign: "center", margin: "2px 0 0" }}>{main.caption}</p>
              )}
            </div>
          )}
          {extra.slice(0, 2).map((img, i) => (
            <div key={i} style={{ flex: "1 1 50%" }}>
              <img
                src={img.src}
                alt={img.caption ?? ""}
                style={{ width: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "6px" }}
              />
              {img.caption && (
                <p style={{ fontSize: "10px", color: "#999", textAlign: "center", margin: "2px 0 0" }}>{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NarrativeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <h3 style={{ fontSize: "15px", fontWeight: 800, margin: "0 0 6px", display: "flex", alignItems: "center", gap: "7px" }}>
        <span style={{ display: "inline-block", width: "3px", height: "16px", background: BLUE, borderRadius: "2px", flexShrink: 0 }} />
        {title}
      </h3>
      <p style={{ margin: 0, color: "#333", lineHeight: 1.8, fontSize: "13px" }}>{children}</p>
    </div>
  );
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#bbb", fontWeight: 600, margin: "0 0 8px" }}>
      {children}
    </p>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "4px", fontSize: "12px" }}>
      <span style={{ color: "#bbb", fontSize: "10px", letterSpacing: "0.08em", minWidth: "52px", paddingTop: "1px" }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return (
    <strong style={{ fontWeight: 800, textDecoration: "underline", textDecorationColor: BLUE }}>
      {children}
    </strong>
  );
}
