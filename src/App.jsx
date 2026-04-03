import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  headerBg: "#0f172a", headerBorder: "#1e293b",
  pageBg: "#f8f9fb", cardBg: "#ffffff", cardBorder: "#e5e7eb",
  textPrimary: "#111827", textSecondary: "#374151",
  textMuted: "#6b7280", textFaint: "#9ca3af",
  accent: "#1a6b3c", accentLight: "#f0fdf4",
  accentBorder: "#bbf7d0", accentText: "#166534",
  success: "#16a34a", successLight: "#f0fdf4", successBorder: "#bbf7d0",
  warning: "#d97706", warningLight: "#fffbeb", warningBorder: "#fde68a",
  danger: "#dc2626", dangerLight: "#fef2f2", dangerBorder: "#fecaca",
  mono: "'DM Mono', monospace", sans: "'Inter', sans-serif",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

// ─── INDUSTRY PROFILES ────────────────────────────────────────────────────────
const INDUSTRIES = {
  saas: {
    label: "B2B SaaS",
    usageTracked: true, npsRelevant: true, expansionType: "seats / modules / tiers",
    healthNote: "Usage trend is your strongest leading indicator. A declining DAU/MAU ratio typically precedes churn by 60–90 days.",
    expansionNote: "Land-and-expand is the primary growth motion. Map whitespace to specific teams or use cases the account hasn't activated yet.",
  },
  industrial: {
    label: "Industrial / Manufacturing",
    usageTracked: false, npsRelevant: false, expansionType: "additional SKUs / locations / volume",
    healthNote: "Usage metrics don't apply. Relationship depth, reorder frequency, and account team stability are your leading indicators.",
    expansionNote: "Expansion typically means new product lines, additional plants, or volume increases. Fleet and multi-site accounts have the most whitespace.",
  },
  professional_services: {
    label: "Professional Services",
    usageTracked: false, npsRelevant: true, expansionType: "additional engagements / retainer scope",
    healthNote: "Client satisfaction and relationship breadth matter most. Single-threaded relationships (one contact) are a significant churn risk.",
    expansionNote: "Expansion is relationship-driven. The question is whether the client sees you as a vendor or a partner. Partners get early access to new problems.",
  },
  healthcare: {
    label: "Healthcare & Life Sciences",
    usageTracked: true, npsRelevant: false, expansionType: "additional facilities / departments / indications",
    healthNote: "Clinical adoption depth is the health signal that matters. A product used in one unit but not enterprise-wide is vulnerable at renewal.",
    expansionNote: "IDN and health system accounts have significant whitespace across facilities and service lines. Formulary and contract status are expansion preconditions.",
  },
  financial_services: {
    label: "Financial Services",
    usageTracked: true, npsRelevant: true, expansionType: "additional business lines / AUM / entities",
    healthNote: "Compliance and audit outcomes signal relationship health. A client who passes audits cleanly is far less likely to churn than one dealing with compliance issues on your platform.",
    expansionNote: "Expansion follows M&A and growth in AUM or entity count. Stay close to finance and legal teams — they see these signals before anyone else.",
  },
  logistics: {
    label: "Logistics & Supply Chain",
    usageTracked: true, npsRelevant: false, expansionType: "additional lanes / volume / services",
    healthNote: "On-time and claims performance are your health metrics. A shipper tracking your performance is building the case for either expansion or a competitor RFP.",
    expansionNote: "Expansion is volume and lane-driven. Accounts that add lanes or increase freight volume are showing trust signals — treat them as expansion opportunities proactively.",
  },
  government: {
    label: "Government & Public Sector",
    usageTracked: false, npsRelevant: false, expansionType: "additional agencies / task orders / options",
    healthNote: "Budget cycle timing and contract vehicle status are your health indicators. A contract up for recompete without a clear incumbent advantage is at risk.",
    expansionNote: "Expansion in government comes through task orders, contract options, and new agencies on existing vehicles. Relationship with the contracting officer matters as much as the program office.",
  },
};

// Health question weights reflect actual churn prediction research:
// Champion loss and usage decline are the two strongest leading indicators (~60 days lead time)
// Feature adoption depth is the strongest structural health signal
// Support ticket volume is a lagging indicator — lower weight
const HEALTH_QUESTIONS = [
  { id: "champion",  label: "Champion Status",            category: "health", weight: 5, predictive: true,  options: [{ label: "Left / Unknown", value: 1 }, { label: "Passive", value: 2 }, { label: "Engaged", value: 3 }, { label: "Active Advocate", value: 4 }] },
  { id: "usage",     label: "Product Usage Trend",       category: "health", weight: 5, predictive: true,  options: [{ label: "Declining >20%", value: 1 }, { label: "Flat", value: 2 }, { label: "Growing", value: 3 }, { label: "Significantly Up", value: 4 }] },
  { id: "adoption",  label: "Feature Adoption Depth",     category: "health", weight: 4, predictive: true,  options: [{ label: "<25% of core features", value: 1 }, { label: "25–50%", value: 2 }, { label: "50–75%", value: 3 }, { label: ">75%", value: 4 }] },
  { id: "renewal",   label: "Renewal Timeline",           category: "health", weight: 3, predictive: false, options: [{ label: "<60 days", value: 1 }, { label: "60–120 days", value: 2 }, { label: "120–180 days", value: 3 }, { label: ">180 days", value: 4 }] },
  { id: "nps",       label: "Last NPS / Sentiment",       category: "health", weight: 2, predictive: false, options: [{ label: "Detractor (<6)", value: 1 }, { label: "Passive (7–8)", value: 2 }, { label: "Promoter (9–10)", value: 3 }, { label: "No Data", value: 2 }] },
  { id: "qbr",       label: "Last Executive Check-in",   category: "health", weight: 2, predictive: false, options: [{ label: ">6 months ago", value: 1 }, { label: "3–6 months", value: 2 }, { label: "1–3 months", value: 3 }, { label: "<1 month", value: 4 }] },
  { id: "support",   label: "Support Ticket Volume",      category: "health", weight: 1, predictive: false, options: [{ label: "High / Escalated", value: 1 }, { label: "Moderate", value: 2 }, { label: "Low", value: 3 }, { label: "None", value: 4 }] },
];

// Expansion weights: whitespace + active sponsor are the strongest predictors of near-term expansion
// Company growth is important but slower-moving; referrals are a strong signal of advocacy readiness
const EXPANSION_QUESTIONS = [
  { id: "whitespace",       label: "Untapped Product Whitespace",    category: "expansion", weight: 5, options: [{ label: "Fully deployed", value: 1 }, { label: "Minor whitespace", value: 2 }, { label: "Moderate whitespace", value: 3 }, { label: "Significant whitespace", value: 4 }] },
  { id: "executiveSponsor", label: "Executive Sponsor Engagement",   category: "expansion", weight: 4, options: [{ label: "None", value: 1 }, { label: "Passive", value: 2 }, { label: "Engaged", value: 3 }, { label: "Champion for expansion", value: 4 }] },
  { id: "companyGrowth",    label: "Company Growth Signals",         category: "expansion", weight: 3, options: [{ label: "Declining / Layoffs", value: 1 }, { label: "Flat", value: 2 }, { label: "Moderate Growth", value: 3 }, { label: "Strong Growth / Funding", value: 4 }] },
  { id: "useCaseWidth",     label: "Use Case Coverage",              category: "expansion", weight: 3, options: [{ label: "Single use case only", value: 1 }, { label: "2 use cases", value: 2 }, { label: "3+ use cases", value: 3 }, { label: "Platform-wide", value: 4 }] },
  { id: "budgetSignals",    label: "Budget Signals",                 category: "expansion", weight: 2, options: [{ label: "Budget freeze / cuts", value: 1 }, { label: "Unknown", value: 2 }, { label: "Stable", value: 3 }, { label: "Expanding / New budget", value: 4 }] },
  { id: "referrals",        label: "Referral / Advocacy Activity",   category: "expansion", weight: 2, options: [{ label: "No activity", value: 1 }, { label: "Open to reference", value: 2 }, { label: "Active reference", value: 3 }, { label: "Proactively referring", value: 4 }] },
];

const QUADRANTS = {
  protect:  { label: "Protect & Grow",       color: T.success, bg: T.successLight, border: T.successBorder, icon: "↑", desc: "Healthy and primed for expansion. Highest-priority accounts for structured growth plays.", play: "Launch a formal expansion conversation this quarter. Map the whitespace to a specific business outcome and present a proposal, not a feature list." },
  nurture:  { label: "Nurture to Expand",    color: T.accent,  bg: T.accentLight,  border: T.accentBorder,  icon: "◈", desc: "Strong expansion signals but health needs attention first. Expansion is possible but premature until the retention risk is stabilized.", play: "Address the health gap before any commercial conversation. Identify the root cause — adoption, champion, or outcome gap — and resolve it within 60 days." },
  save:     { label: "Intervention Required", color: T.danger,  bg: T.dangerLight,  border: T.dangerBorder,  icon: "⚠", desc: "High churn risk with limited expansion signals. Needs immediate intervention — a formal save play, not a QBR.", play: "Escalate to CS leadership this week. Define a 30-day success plan with the customer, identify whether there's a sponsor willing to commit to it, and make a go/no-go decision on retention investment." },
  maintain: { label: "Maintain & Monitor",   color: T.warning, bg: T.warningLight, border: T.warningBorder, icon: "◎", desc: "Healthy but limited near-term expansion potential. Valuable for retention; not a short-term growth vehicle.", play: "Maintain the relationship efficiently. Automate check-ins where possible, ensure renewal is on track, and revisit expansion potential in the next planning cycle." },
};

function getQuadrant(h, e) {
  if (h >= 55 && e >= 55) return "protect";
  if (h < 55  && e >= 55) return "nurture";
  if (h < 55  && e < 55)  return "save";
  return "maintain";
}

function computeScore(questions, answers) {
  let weighted = 0, totalWeight = 0;
  questions.forEach(q => {
    if (answers[q.id] !== undefined) {
      weighted += answers[q.id] * q.weight;
      totalWeight += q.weight * 4;
    }
  });
  return totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function OptionBtn({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {options.map(opt => (
        <button key={opt.value + opt.label} onClick={() => onChange(opt.value)} style={{
          textAlign: "left", padding: "9px 14px",
          background: value === opt.value ? T.accentLight : T.cardBg,
          border: value === opt.value ? `1px solid ${T.accentBorder}` : `1px solid ${T.cardBorder}`,
          borderLeft: value === opt.value ? `3px solid ${T.accent}` : `3px solid transparent`,
          borderRadius: 6, cursor: "pointer",
          fontFamily: T.sans, fontSize: 13,
          color: value === opt.value ? "#166534" : T.textSecondary,
          fontWeight: value === opt.value ? 500 : 400,
          transition: "all 0.15s"
        }}>{opt.label}</button>
      ))}
    </div>
  );
}

const emptyAccount = () => ({ name: "", arr: "", answers: {}, industry: "saas" });

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function ChurnExpansionScorecard() {
  const [accounts, setAccounts]       = useState([{ ...emptyAccount(), name: "Account 1" }]);
  const [activeAccount, setActiveAccount] = useState(0);
  const [activeTab, setActiveTab]     = useState("health");
  const [showMatrix, setShowMatrix]   = useState(false);

  const updateAccount = (idx, key, val) => setAccounts(prev => prev.map((a, i) => i === idx ? { ...a, [key]: val } : a));
  const updateAnswer  = (idx, qid, val) => setAccounts(prev => prev.map((a, i) => i === idx ? { ...a, answers: { ...a.answers, [qid]: val } } : a));
  const addAccount    = () => { setAccounts(prev => [...prev, { ...emptyAccount(), name: `Account ${prev.length + 1}` }]); setActiveAccount(accounts.length); };
  const removeAccount = (idx) => { if (accounts.length === 1) return; setAccounts(prev => prev.filter((_, i) => i !== idx)); setActiveAccount(Math.max(0, activeAccount - 1)); };

  const scored = accounts.map(a => {
    const h = computeScore(HEALTH_QUESTIONS, a.answers);
    const e = computeScore(EXPANSION_QUESTIONS, a.answers);
    return { ...a, healthScore: h, expansionScore: e, quadrant: getQuadrant(h, e), answered: Object.keys(a.answers).length };
  });

  const current    = scored[activeAccount];
  const totalQ     = HEALTH_QUESTIONS.length + EXPANSION_QUESTIONS.length;
  const canMatrix  = scored.some(a => a.answered >= 4);
  const qGroups    = { protect: [], nurture: [], save: [], maintain: [] };
  const currentIndustry = INDUSTRIES[current.industry] || INDUSTRIES.saas;
  scored.forEach(a => { if (a.answered >= 4) qGroups[a.quadrant].push(a); });

  return (
    <div style={{ minHeight: "100vh", background: T.pageBg, fontFamily: T.sans, color: T.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        input:focus { outline: 2px solid #1a6b3c; outline-offset: 1px; }
      `}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, padding: "20px 40px", borderBottom: `1px solid ${T.headerBorder}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.accent, marginBottom: 5 }}>
              CS Intelligence · Portfolio Health
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Churn & Expansion Scorecard</h1>
            <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: 13 }}>Score multiple accounts. See the portfolio view. Know where to spend your time.</p>
          </div>
          <div style={{ display: "flex", gap: 1, background: T.headerBorder, borderRadius: 7, padding: 2 }}>
            {[{ v: false, l: "Score Accounts" }, { v: true, l: `Matrix${canMatrix ? "" : ""}` }].map(tab => (
              <button key={String(tab.v)} onClick={() => setShowMatrix(tab.v)} disabled={tab.v && !canMatrix} style={{
                padding: "8px 14px", background: showMatrix === tab.v ? "#1e293b" : "transparent",
                border: "none", borderRadius: 5, cursor: tab.v && !canMatrix ? "not-allowed" : "pointer",
                fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                color: showMatrix === tab.v ? "#f1f5f9" : tab.v && !canMatrix ? "#475569" : "#94a3b8",
                transition: "all 0.15s"
              }}>{tab.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px 80px" }}>

        {!showMatrix ? (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>

            {/* Account list */}
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>
                Accounts ({accounts.length})
              </div>
              {scored.map((a, i) => {
                const q = QUADRANTS[a.quadrant];
                return (
                  <div key={i} onClick={() => setActiveAccount(i)} style={{
                    background: activeAccount === i ? T.cardBg : "transparent",
                    border: activeAccount === i ? `1px solid ${T.accentBorder}` : "1px solid transparent",
                    borderLeft: a.answered >= 4 ? `3px solid ${q.color}` : `3px solid ${T.cardBorder}`,
                    borderRadius: 6, padding: "10px 12px", cursor: "pointer", marginBottom: 4,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "all 0.15s"
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: activeAccount === i ? T.textPrimary : T.textMuted }}>{a.name || `Account ${i+1}`}</div>
                      {a.arr && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, marginTop: 2 }}>{a.arr}</div>}
                      {a.answered >= 4 && <div style={{ fontFamily: T.mono, fontSize: 10, color: q.color, marginTop: 2 }}>{q.icon} {q.label}</div>}
                    </div>
                    {accounts.length > 1 && (
                      <button onClick={e => { e.stopPropagation(); removeAccount(i); }} style={{ background: "none", border: "none", color: T.textFaint, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button>
                    )}
                  </div>
                );
              })}
              <button onClick={addAccount} style={{ width: "100%", marginTop: 8, padding: "10px", background: "transparent", border: `1px dashed ${T.cardBorder}`, borderRadius: 6, color: T.textMuted, cursor: "pointer", fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                + Add Account
              </button>
            </div>

            {/* Scoring panel */}
            <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {/* Industry + Name / ARR */}
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.cardBorder}` }}>
                <label style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, display: "block", marginBottom: 6 }}>Industry</label>
                <select value={current.industry} onChange={e => updateAccount(activeAccount, "industry", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                    fontFamily: T.mono, fontSize: 11, color: T.textPrimary, background: T.cardBg, cursor: "pointer" }}>
                  {Object.entries(INDUSTRIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              {/* Name / ARR */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${T.cardBorder}` }}>
                {[{ key: "name", label: "Account Name", placeholder: "Acme Corp" }, { key: "arr", label: "ARR", placeholder: "$48K" }].map(f => (
                  <div key={f.key}>
                    <label style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input value={current[f.key]} onChange={e => updateAccount(activeAccount, f.key, e.target.value)} placeholder={f.placeholder}
                      style={{ width: "100%", background: T.pageBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: "9px 12px", color: T.textPrimary, fontSize: 14, fontFamily: T.sans }} />
                  </div>
                ))}
              </div>

              {/* Live scores */}
              {current.answered >= 4 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Health Score",    value: current.healthScore,    color: current.healthScore >= 55 ? T.success : T.danger },
                    { label: "Expansion Score", value: current.expansionScore, color: current.expansionScore >= 55 ? T.success : T.warning },
                    { label: "Quadrant",        value: `${QUADRANTS[current.quadrant].icon} ${QUADRANTS[current.quadrant].label}`, color: QUADRANTS[current.quadrant].color, small: true },
                  ].map(m => (
                    <div key={m.label} style={{ background: T.pageBg, border: `1px solid ${T.cardBorder}`, borderTop: `2px solid ${m.color}`, borderRadius: 7, padding: "10px 12px" }}>
                      <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textFaint, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: T.mono, fontSize: m.small ? 12 : 22, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Industry health note */}
              {current.industry && (
                <div style={{ background: T.accentLight, border: `1px solid ${T.accentBorder}`, borderRadius: 6,
                  padding: "10px 12px", marginBottom: 14 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    {activeTab === "health" ? "Health Signal Context" : "Expansion Signal Context"}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.accentText, lineHeight: 1.5 }}>
                    {activeTab === "health"
                      ? (INDUSTRIES[current.industry]||INDUSTRIES.saas).healthNote
                      : (INDUSTRIES[current.industry]||INDUSTRIES.saas).expansionNote}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${T.cardBorder}`, marginBottom: 18 }}>
                {["health", "expansion"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    background: "none", border: "none", padding: "9px 16px",
                    fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: activeTab === tab ? T.accent : T.textMuted,
                    borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent",
                    cursor: "pointer", transition: "all 0.15s", fontWeight: activeTab === tab ? 600 : 400
                  }}>
                    {tab === "health" ? "Health Signals" : "Expansion Signals"}
                    <span style={{ marginLeft: 6, color: T.textFaint }}>
                      {(tab === "health" ? HEALTH_QUESTIONS : EXPANSION_QUESTIONS).filter(q => current.answers[q.id] !== undefined).length}/
                      {(tab === "health" ? HEALTH_QUESTIONS : EXPANSION_QUESTIONS).length}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {(activeTab === "health" ? HEALTH_QUESTIONS : EXPANSION_QUESTIONS).map(q => (
                  <div key={q.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <label style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted }}>{q.label}</label>
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.textFaint }}>weight {q.weight}</span>
                      {current.answers[q.id] !== undefined && <span style={{ color: T.success, fontSize: 11 }}>✓</span>}
                    </div>
                    <OptionBtn options={q.options} value={current.answers[q.id]} onChange={v => updateAnswer(activeAccount, q.id, v)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 16 }}>
              Portfolio Matrix · {scored.filter(a => a.answered >= 4).length} accounts scored
            </div>

            {/* Axis labels */}
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 70 }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint }}>← Low Health</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint }}>High Health →</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 0 }}>
              <div style={{ width: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Expansion →</span>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8 }}>
                {[
                  { key: "nurture",  gridArea: "1 / 1" },
                  { key: "protect",  gridArea: "1 / 2" },
                  { key: "save",     gridArea: "2 / 1" },
                  { key: "maintain", gridArea: "2 / 2" },
                ].map(({ key, gridArea }) => {
                  const q = QUADRANTS[key];
                  const accs = qGroups[key];
                  return (
                    <div key={key} style={{ background: q.bg, border: `1px solid ${q.border}`, borderTop: `3px solid ${q.color}`, borderRadius: 8, padding: "16px", gridArea, minHeight: 140 }}>
                      <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: q.color, marginBottom: 8 }}>
                        {q.icon} {q.label} · {accs.length}
                      </div>
                      {accs.map((a, i) => (
                        <div key={i} style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 5, padding: "8px 10px", marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{a.name}</div>
                          {a.arr && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, marginTop: 2 }}>{a.arr}</div>}
                          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint }}>H: <span style={{ color: a.healthScore >= 55 ? T.success : T.danger, fontWeight: 600 }}>{a.healthScore}</span></span>
                            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint }}>E: <span style={{ color: a.expansionScore >= 55 ? T.success : T.warning, fontWeight: 600 }}>{a.expansionScore}</span></span>
                          </div>
                        </div>
                      ))}
                      {accs.length === 0 && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, fontStyle: "italic" }}>No accounts</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended plays */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              {Object.entries(QUADRANTS).filter(([key]) => qGroups[key].length > 0).map(([key, q]) => (
                <div key={key} style={{ background: q.bg, border: `1px solid ${q.border}`, borderLeft: `3px solid ${q.color}`, borderRadius: 8, padding: "16px 18px" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: q.color, marginBottom: 6 }}>
                    {q.icon} {q.label} · {qGroups[key].length} account{qGroups[key].length !== 1 ? "s" : ""}
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{q.desc}</p>
                  <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textFaint, marginBottom: 4 }}>Recommended Play</div>
                    <p style={{ margin: 0, fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>{q.play}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
