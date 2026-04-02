import { useState } from "react";

const HEALTH_QUESTIONS = [
  { id: "usage", label: "Product Usage Trend", category: "health", weight: 3, options: [{ label: "Declining >20%", value: 1 }, { label: "Flat", value: 2 }, { label: "Growing", value: 3 }, { label: "Significantly Up", value: 4 }] },
  { id: "champion", label: "Champion Status", category: "health", weight: 3, options: [{ label: "Left / Unknown", value: 1 }, { label: "Passive", value: 2 }, { label: "Engaged", value: 3 }, { label: "Active Advocate", value: 4 }] },
  { id: "nps", label: "Last NPS / Sentiment", category: "health", weight: 2, options: [{ label: "Detractor (<6)", value: 1 }, { label: "Passive (7–8)", value: 2 }, { label: "Promoter (9–10)", value: 3 }, { label: "No Data", value: 2 }] },
  { id: "support", label: "Support Ticket Volume", category: "health", weight: 2, options: [{ label: "High / Escalated", value: 1 }, { label: "Moderate", value: 2 }, { label: "Low", value: 3 }, { label: "None", value: 4 }] },
  { id: "qbr", label: "Last Executive Check-in", category: "health", weight: 1, options: [{ label: ">6 months ago", value: 1 }, { label: "3–6 months", value: 2 }, { label: "1–3 months", value: 3 }, { label: "<1 month", value: 4 }] },
  { id: "adoption", label: "Feature Adoption Depth", category: "health", weight: 2, options: [{ label: "<25% of core features", value: 1 }, { label: "25–50%", value: 2 }, { label: "50–75%", value: 3 }, { label: ">75%", value: 4 }] },
  { id: "renewal", label: "Renewal Timeline", category: "health", weight: 2, options: [{ label: "<60 days", value: 1 }, { label: "60–120 days", value: 2 }, { label: "120–180 days", value: 3 }, { label: ">180 days", value: 4 }] },
];

const EXPANSION_QUESTIONS = [
  { id: "companyGrowth", label: "Company Growth Signals", category: "expansion", weight: 3, options: [{ label: "Declining / Layoffs", value: 1 }, { label: "Flat", value: 2 }, { label: "Moderate Growth", value: 3 }, { label: "Strong Growth / Funding", value: 4 }] },
  { id: "useCaseWidth", label: "Use Case Coverage", category: "expansion", weight: 3, options: [{ label: "Single use case only", value: 1 }, { label: "2 use cases", value: 2 }, { label: "3+ use cases", value: 3 }, { label: "Platform-wide", value: 4 }] },
  { id: "budgetSignals", label: "Budget Signals", category: "expansion", weight: 2, options: [{ label: "Budget freeze / cuts", value: 1 }, { label: "Unknown", value: 2 }, { label: "Stable", value: 3 }, { label: "Expanding / New budget", value: 4 }] },
  { id: "executiveSponsor", label: "Executive Sponsor Engagement", category: "expansion", weight: 2, options: [{ label: "None", value: 1 }, { label: "Passive", value: 2 }, { label: "Engaged", value: 3 }, { label: "Champion for expansion", value: 4 }] },
  { id: "referrals", label: "Referral / Advocacy Activity", category: "expansion", weight: 1, options: [{ label: "No activity", value: 1 }, { label: "Open to reference", value: 2 }, { label: "Active reference", value: 3 }, { label: "Proactively referring", value: 4 }] },
  { id: "whitespace", label: "Untapped Product Whitespace", category: "expansion", weight: 3, options: [{ label: "Fully deployed", value: 1 }, { label: "Minor whitespace", value: 2 }, { label: "Moderate whitespace", value: 3 }, { label: "Significant whitespace", value: 4 }] },
];

const QUADRANTS = {
  "protect": { label: "Protect & Grow", color: "#22c55e", bg: "#0a1a0f", border: "#22c55e33", icon: "↑", desc: "Healthy and primed for expansion. These are your highest-priority accounts for structured growth plays. Move fast — conditions won't stay this favorable indefinitely.", play: "Launch a formal expansion conversation this quarter. Map the whitespace to a specific business outcome and present a proposal, not a feature list." },
  "nurture": { label: "Nurture to Expand", color: "#3b82f6", bg: "#0a0f1a", border: "#3b82f633", icon: "◈", desc: "Strong expansion signals but health needs attention first. Expansion is possible but premature until the retention risk is stabilized.", play: "Address the health gap before any commercial conversation. Identify the root cause — adoption, champion, or outcome gap — and resolve it within 60 days." },
  "save": { label: "Intervention Required", color: "#ef4444", bg: "#1a0a0a", border: "#ef444433", icon: "⚠", desc: "High churn risk with limited expansion signals. These accounts need immediate intervention — a formal save play, not a QBR.", play: "Escalate to CS leadership this week. Define a 30-day success plan with the customer, identify whether there's a sponsor willing to commit to it, and make a go/no-go decision on retention investment." },
  "maintain": { label: "Maintain & Monitor", color: "#f59e0b", bg: "#1a1200", border: "#f59e0b33", icon: "◎", desc: "Healthy but limited near-term expansion potential. Valuable for retention; not a short-term growth vehicle.", play: "Maintain the relationship efficiently. Automate check-ins where possible, ensure renewal is on track, and revisit expansion potential in the next planning cycle." },
};

function getQuadrant(healthScore, expansionScore) {
  const highHealth = healthScore >= 55;
  const highExpansion = expansionScore >= 55;
  if (highHealth && highExpansion) return "protect";
  if (!highHealth && highExpansion) return "nurture";
  if (!highHealth && !highExpansion) return "save";
  return "maintain";
}

function computeScore(questions, answers) {
  let weighted = 0, totalWeight = 0;
  questions.forEach(q => {
    if (answers[q.id] !== undefined) {
      weighted += answers[q.id] * q.weight;
      totalWeight += q.weight * 4; // max value is 4
    }
  });
  return totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;
}

function OptionButton({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {options.map(opt => (
        <button key={opt.value + opt.label} onClick={() => onChange(opt.value)} style={{
          textAlign: "left", padding: "9px 14px",
          background: value === opt.value ? "#1e293b" : "transparent",
          border: value === opt.value ? "1px solid #f59e0b44" : "1px solid #1e293b",
          borderLeft: value === opt.value ? "3px solid #f59e0b" : "3px solid transparent",
          borderRadius: 6, cursor: "pointer",
          fontFamily: "'Inter', sans-serif", fontSize: 13,
          color: value === opt.value ? "#f1f5f9" : "#475569",
          transition: "all 0.15s"
        }}>{opt.label}</button>
      ))}
    </div>
  );
}

const emptyAccount = () => ({ name: "", arr: "", answers: {} });

export default function ChurnExpansionScorecard() {
  const [accounts, setAccounts] = useState([{ ...emptyAccount(), name: "Account 1" }]);
  const [activeAccount, setActiveAccount] = useState(0);
  const [activeTab, setActiveTab] = useState("health");
  const [showMatrix, setShowMatrix] = useState(false);

  const updateAccount = (idx, key, val) => {
    setAccounts(prev => prev.map((a, i) => i === idx ? { ...a, [key]: val } : a));
  };
  const updateAnswer = (idx, qid, val) => {
    setAccounts(prev => prev.map((a, i) => i === idx ? { ...a, answers: { ...a.answers, [qid]: val } } : a));
  };
  const addAccount = () => {
    setAccounts(prev => [...prev, { ...emptyAccount(), name: `Account ${prev.length + 1}` }]);
    setActiveAccount(accounts.length);
  };
  const removeAccount = (idx) => {
    if (accounts.length === 1) return;
    setAccounts(prev => prev.filter((_, i) => i !== idx));
    setActiveAccount(Math.max(0, activeAccount - 1));
  };

  const scored = accounts.map(a => {
    const healthScore = computeScore(HEALTH_QUESTIONS, a.answers);
    const expansionScore = computeScore(EXPANSION_QUESTIONS, a.answers);
    const quadrant = getQuadrant(healthScore, expansionScore);
    const answered = Object.keys(a.answers).length;
    return { ...a, healthScore, expansionScore, quadrant, answered };
  });

  const current = scored[activeAccount];
  const allQuestions = [...HEALTH_QUESTIONS, ...EXPANSION_QUESTIONS];
  const canShowMatrix = scored.some(a => a.answered >= 4);

  const quadrantGroups = { protect: [], nurture: [], save: [], maintain: [] };
  scored.forEach(a => { if (a.answered >= 4) quadrantGroups[a.quadrant].push(a); });

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0a0e14", borderBottom: "1px solid #1e293b", padding: "24px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#22c55e", marginBottom: 6 }}>CS Intelligence · Portfolio Health</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Churn & Expansion Scorecard</h1>
            <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 13 }}>Score multiple accounts. See the portfolio view. Know where to spend your time.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowMatrix(false)} style={{ background: !showMatrix ? "#1e293b" : "transparent", border: "1px solid #1e293b", borderRadius: 6, padding: "8px 14px", color: !showMatrix ? "#f1f5f9" : "#475569", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Score Accounts</button>
            <button onClick={() => setShowMatrix(true)} disabled={!canShowMatrix} style={{ background: showMatrix ? "#22c55e" : "transparent", border: `1px solid ${canShowMatrix ? "#22c55e44" : "#1e293b"}`, borderRadius: 6, padding: "8px 14px", color: showMatrix ? "#000" : canShowMatrix ? "#22c55e" : "#334155", cursor: canShowMatrix ? "pointer" : "not-allowed", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Portfolio Matrix →</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px 80px" }}>

        {!showMatrix ? (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>

            {/* Account list */}
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: 12 }}>Accounts ({accounts.length})</div>
              {scored.map((a, i) => {
                const q = QUADRANTS[a.quadrant];
                return (
                  <div key={i} onClick={() => setActiveAccount(i)} style={{
                    background: activeAccount === i ? "#0f172a" : "transparent",
                    border: activeAccount === i ? `1px solid #1e293b` : "1px solid transparent",
                    borderLeft: a.answered >= 4 ? `3px solid ${q.color}` : "3px solid #1e293b",
                    borderRadius: 6, padding: "10px 12px", cursor: "pointer", marginBottom: 4,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: activeAccount === i ? "#f1f5f9" : "#94a3b8" }}>{a.name || `Account ${i + 1}`}</div>
                      {a.arr && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#334155", marginTop: 2 }}>{a.arr}</div>}
                      {a.answered >= 4 && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: q.color, marginTop: 2 }}>{q.icon} {q.label}</div>}
                    </div>
                    {accounts.length > 1 && (
                      <button onClick={e => { e.stopPropagation(); removeAccount(i); }} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button>
                    )}
                  </div>
                );
              })}
              <button onClick={addAccount} style={{ width: "100%", marginTop: 8, padding: "10px", background: "transparent", border: "1px dashed #1e293b", borderRadius: 6, color: "#475569", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                + Add Account
              </button>
            </div>

            {/* Scoring panel */}
            <div style={{ background: "#0a0e14", border: "1px solid #1e293b", borderRadius: 12, padding: "24px" }}>
              {/* Account name/ARR */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #1e293b" }}>
                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", display: "block", marginBottom: 6 }}>Account Name</label>
                  <input value={current.name} onChange={e => updateAccount(activeAccount, "name", e.target.value)}
                    style={{ width: "100%", background: "#080c10", border: "1px solid #1e293b", borderRadius: 6, padding: "10px 12px", color: "#f1f5f9", fontSize: 14, fontFamily: "'Inter', sans-serif" }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", display: "block", marginBottom: 6 }}>ARR</label>
                  <input value={current.arr} onChange={e => updateAccount(activeAccount, "arr", e.target.value)} placeholder="$48K"
                    style={{ width: "100%", background: "#080c10", border: "1px solid #1e293b", borderRadius: 6, padding: "10px 12px", color: "#f1f5f9", fontSize: 14, fontFamily: "'Inter', sans-serif" }} />
                </div>
              </div>

              {/* Live scores */}
              {current.answered >= 4 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                  {[
                    { label: "Health Score", value: current.healthScore, color: current.healthScore >= 55 ? "#22c55e" : "#ef4444" },
                    { label: "Expansion Score", value: current.expansionScore, color: current.expansionScore >= 55 ? "#22c55e" : "#f59e0b" },
                    { label: "Quadrant", value: QUADRANTS[current.quadrant].icon + " " + QUADRANTS[current.quadrant].label, color: QUADRANTS[current.quadrant].color, small: true },
                  ].map(m => (
                    <div key={m.label} style={{ background: "#080c10", border: `1px solid ${m.color}22`, borderRadius: 8, padding: "12px 14px" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: m.small ? 14 : 24, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.small ? m.value : m.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #1e293b" }}>
                {["health", "expansion"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    background: "none", border: "none", padding: "10px 18px",
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: activeTab === tab ? "#f1f5f9" : "#475569",
                    borderBottom: activeTab === tab ? `2px solid ${tab === "health" ? "#22c55e" : "#f59e0b"}` : "2px solid transparent",
                    cursor: "pointer", transition: "all 0.15s"
                  }}>
                    {tab === "health" ? "Health Signals" : "Expansion Signals"}
                    <span style={{ marginLeft: 8, color: "#334155" }}>
                      {(tab === "health" ? HEALTH_QUESTIONS : EXPANSION_QUESTIONS).filter(q => current.answers[q.id] !== undefined).length}/
                      {(tab === "health" ? HEALTH_QUESTIONS : EXPANSION_QUESTIONS).length}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {(activeTab === "health" ? HEALTH_QUESTIONS : EXPANSION_QUESTIONS).map(q => (
                  <div key={q.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>{q.label}</label>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#334155" }}>weight {q.weight}</span>
                      {current.answers[q.id] !== undefined && <span style={{ color: "#22c55e", fontSize: 11 }}>✓</span>}
                    </div>
                    <OptionButton options={q.options} value={current.answers[q.id]} onChange={v => updateAnswer(activeAccount, q.id, v)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* 2x2 Matrix */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569", marginBottom: 16 }}>Portfolio Matrix — {scored.filter(a => a.answered >= 4).length} accounts scored</div>

              {/* Axis labels */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 80 }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#334155" }}>← Low Health</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#334155" }}>High Health →</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 0 }}>
                {/* Y axis label */}
                <div style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#334155", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>Expansion Potential →</span>
                </div>

                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1, background: "#1e293b", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
                  {[
                    { key: "nurture", gridArea: "1 / 1" },
                    { key: "protect", gridArea: "1 / 2" },
                    { key: "save", gridArea: "2 / 1" },
                    { key: "maintain", gridArea: "2 / 2" },
                  ].map(({ key, gridArea }) => {
                    const q = QUADRANTS[key];
                    const qAccounts = quadrantGroups[key];
                    return (
                      <div key={key} style={{ background: q.bg, gridArea, padding: "20px", minHeight: 160 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: q.color, marginBottom: 4 }}>{q.icon} {q.label}</div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#334155" }}>{qAccounts.length} account{qAccounts.length !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                        {qAccounts.map((a, i) => (
                          <div key={i} style={{ background: "#0a0e14", border: `1px solid ${q.color}22`, borderRadius: 5, padding: "8px 10px", marginBottom: 6 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{a.name}</div>
                            {a.arr && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569", marginTop: 2 }}>{a.arr}</div>}
                            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569" }}>H: <span style={{ color: a.healthScore >= 55 ? "#22c55e" : "#ef4444" }}>{a.healthScore}</span></span>
                              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569" }}>E: <span style={{ color: a.expansionScore >= 55 ? "#22c55e" : "#f59e0b" }}>{a.expansionScore}</span></span>
                            </div>
                          </div>
                        ))}
                        {qAccounts.length === 0 && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1e293b", fontStyle: "italic" }}>No accounts</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recommended plays */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {Object.entries(QUADRANTS).filter(([key]) => quadrantGroups[key].length > 0).map(([key, q]) => (
                <div key={key} style={{ background: "#0a0e14", border: `1px solid ${q.border}`, borderLeft: `3px solid ${q.color}`, borderRadius: 8, padding: "16px 18px" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: q.color, marginBottom: 6 }}>{q.icon} {q.label} · {quadrantGroups[key].length} account{quadrantGroups[key].length !== 1 ? "s" : ""}</div>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{q.desc}</p>
                  <div style={{ background: "#080c10", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#334155", marginBottom: 4 }}>Recommended Play</div>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{q.play}</p>
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
