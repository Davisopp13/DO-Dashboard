import { useState, useEffect, useRef } from "react";
import { Dumbbell, Briefcase, Wallet, Compass, Calendar, Check, Plus, Trash2, AlertCircle, Edit2, X, Code2, BookOpen, Heart, Sunrise, Flag, Download, FileSpreadsheet, ExternalLink } from "lucide-react";

// ============================================================
// THE PLAN — locked April 25, 2026 / cycle ends ~July 25, 2026
// ============================================================

const CYCLE_START = new Date("2026-04-28");
const CYCLE_END = new Date("2026-07-25");

const WEEKS = Array.from({ length: 13 }, (_, i) => {
  const start = new Date(CYCLE_START);
  start.setDate(start.getDate() + i * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { num: i + 1, start, end };
});

// DO brand palette — forest greens with earth accents, off-white background
const PALETTE = {
  bg: "#FAFBF7",
  bgAlt: "#F1F4EA",
  card: "#FFFFFF",
  border: "#D9DFCB",
  borderSoft: "#E7EBDC",
  ink: "#1F3A1F",
  inkSoft: "#3F5F3F",
  inkMuted: "#6B7F6B",
  inkFaint: "#9AAA9A",
  trail: "#2E6B2E",
  trailDeep: "#1F4D1F",
  trailLight: "#5A8C5A",
  blaze: "#D9A441",
  warn: "#B85450",
  ok: "#5A8C5A",
};

const TRACK_PHASES = {
  business: [
    { weeks: [1, 2, 3], label: "Testimonials", color: PALETTE.blaze, focus: "Capture testimonials while enthusiasm is fresh." },
    { weeks: [2, 3, 4, 5, 6], label: "Foundation Docs", color: PALETTE.trailLight, focus: "Pricing logic → discovery process → templates." },
    { weeks: [7, 8, 9], label: "Site Copy", color: PALETTE.trail, focus: "Positioning + structure built around real testimonials." },
    { weeks: [10, 11, 12, 13], label: "Visual Rebuild + Ship", color: PALETTE.trailDeep, focus: "Layout, design, polish, push live. SiteForge as the tool." },
  ],
  body: [
    { weeks: [1, 2, 3, 4], label: "Foundation", color: PALETTE.blaze, focus: "Build the habit. Consistency before intensity." },
    { weeks: [5, 6, 7, 8], label: "Progression", color: PALETTE.trailLight, focus: "Add weight to the bar. Tighten nutrition." },
    { weeks: [9, 10, 11, 12], label: "Acceleration", color: PALETTE.trail, focus: "Dial in. Push harder. Measure what's changed." },
    { weeks: [13], label: "Reassess", color: PALETTE.trailDeep, focus: "Compare to Day 1. Plan the next 90." },
  ],
};

const DEFAULT_TASKS = {
  1: {
    business: ["Draft testimonial requests for Lance, BB, Mariah", "Send all three with specific prompts"],
    body: ["3 gym sessions (Mon Push / Wed Pull / Fri Legs)", "9am first meal — every day", "Whataburger swap: 2x egg & cheese taquitos"],
  },
  2: {
    business: ["Follow up on testimonial non-responses", "Start pricing logic doc — internal scoping math"],
    body: ["3 gym sessions", "9am first meal streak continues", "Hit 180g protein"],
  },
  3: {
    business: ["Consolidate testimonial responses", "Continue pricing logic doc"],
    body: ["3 gym sessions", "Note: are lifts going up?", "Mid-Phase 1 check"],
  },
  4: {
    business: ["Wrap pricing logic doc", "Begin discovery / intake process design"],
    body: ["End of Phase 1 — log baseline measurements", "Final week before progression"],
  },
  5: {
    business: ["Discovery process: call structure + follow-up template"],
    body: ["PHASE 2 STARTS — heavier sets, fewer reps", "Add protein shake on gym days if under 180g"],
  },
  6: {
    business: ["Wrap discovery process", "Proposal/contract templates", "Write down capacity rule"],
    body: ["3 gym sessions — track which lifts went up", "100oz water/day"],
  },
  7: {
    business: ["MID-CYCLE CHECK-IN — all foundation docs done?", "Begin website copy + structure"],
    body: ["3 gym sessions", "Energy levels — note them"],
  },
  8: {
    business: ["New positioning written", "Site structure around testimonials"],
    body: ["End of Phase 2 — second measurements log"],
  },
  9: {
    business: ["Two-modes framing locked in (build + teach)", "Decide: feature personal builds in copy?"],
    body: ["PHASE 3 STARTS — heavy + recomp range", "Loose calorie target 2,400–2,600/day"],
  },
  10: {
    business: ["Begin docodelab.com rebuild — using SiteForge as the tool", "Layout + components"],
    body: ["Track protein for 2 weeks straight", "Cut fast food to 5x/week max"],
  },
  11: {
    business: ["Visual rebuild continues", "Polish design"],
    body: ["3 gym sessions — add resistance to planks"],
  },
  12: {
    business: ["Final polish", "Test all flows"],
    body: ["Take measurements: waist, chest, arms"],
  },
  13: {
    business: ["PUSH SITE LIVE", "Capture lessons for next cycle"],
    body: ["Compare Day 1 to today", "Plan the next 90"],
  },
};

const RESOURCES = [
  {
    id: "budget-plan",
    title: "Budget Plan Spreadsheet",
    description: "Full monthly cash flow, 5-year glide path, this-week actions",
    icon: FileSpreadsheet,
    storageKey: "resourceUrl_budgetPlan",
  },
];

const BUDGET_TRIPWIRES = [
  { date: "2026-04-30", title: "Five Lakes Law Group — FINAL PAYMENT", detail: "$244/mo recovered starting May", urgent: true },
  { date: "2026-05-01", title: "Auto-transfer kicks in", detail: "$200 → Way2Save on each Hapag payday", urgent: false },
  { date: "2026-05-02", title: "Send BSD transfer email", detail: "In writing, specific ask. Cost: nothing. Worst case: no response.", urgent: true },
  { date: "2026-06-15", title: "Call SoFi about repayment term", detail: "Worth asking. Bridge plan absorbs the tightening either way.", urgent: false },
  { date: "2026-07-01", title: "Forbearance window narrowing", detail: "SoFi jumps from $725 → ~$1,250. Stable margin still positive at $371/mo.", urgent: false },
];

// ============================================================
// HELPERS
// ============================================================

const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtDateLong = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getCurrentWeek = () => {
  const now = new Date();
  if (now < CYCLE_START) return 0;
  if (now > CYCLE_END) return 13;
  const diff = Math.floor((now - CYCLE_START) / (1000 * 60 * 60 * 24 * 7));
  return Math.min(13, diff + 1);
};

const getPhaseFor = (track, weekNum) => {
  return TRACK_PHASES[track].find(p => p.weeks.includes(weekNum)) || TRACK_PHASES[track][0];
};

const daysUntil = (dateStr) => {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

// ============================================================
// MOUNTAIN BACKDROP
// ============================================================

function MountainBackdrop({ height = 200, opacity = 1 }) {
  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        width: "100%", height: `${height}px`,
        opacity,
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A8C5A" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#5A8C5A" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E6B2E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2E6B2E" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="mtn3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F4D1F" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1F4D1F" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path d="M0,140 L120,80 L220,120 L340,60 L460,100 L580,50 L720,110 L860,70 L980,120 L1100,80 L1200,110 L1200,200 L0,200 Z" fill="url(#mtn1)" />
      <path d="M0,160 L100,110 L240,150 L380,90 L520,140 L660,100 L800,150 L940,110 L1080,150 L1200,130 L1200,200 L0,200 Z" fill="url(#mtn2)" />
      <path d="M0,180 L160,140 L300,170 L460,130 L620,170 L780,140 L940,170 L1100,150 L1200,170 L1200,200 L0,200 Z" fill="url(#mtn3)" />
    </svg>
  );
}

// ============================================================
// MAIN
// ============================================================

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("this-week");
  const [completedTasks, setCompletedTasks] = useState({});
  const [customTasks, setCustomTasks] = useState({});
  const [weights, setWeights] = useState([]);
  const [newWeight, setNewWeight] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [foundationVerse, setFoundationVerse] = useState("");
  const [presenceDays, setPresenceDays] = useState({});
  const [carryingNotes, setCarryingNotes] = useState("");
  const [cycleDecisions, setCycleDecisions] = useState([]);
  const [resourceUrls, setResourceUrls] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [viewWeek, setViewWeek] = useState(getCurrentWeek() || 1);

  const currentWeek = getCurrentWeek();

  useEffect(() => {
    (async () => {
      try {
        const tasks = await window.storage.get("completedTasks");
        if (tasks) setCompletedTasks(JSON.parse(tasks.value));
      } catch (e) { }
      try {
        const c = await window.storage.get("customTasks");
        if (c) setCustomTasks(JSON.parse(c.value));
      } catch (e) { }
      try {
        const w = await window.storage.get("weights");
        if (w) setWeights(JSON.parse(w.value));
      } catch (e) { }
      try {
        const n = await window.storage.get("notes");
        if (n) setCustomNotes(n.value);
      } catch (e) { }
      try {
        const fv = await window.storage.get("foundationVerse");
        if (fv) setFoundationVerse(fv.value);
      } catch (e) { }
      try {
        const pd = await window.storage.get("presenceDays");
        if (pd) setPresenceDays(JSON.parse(pd.value));
      } catch (e) { }
      try {
        const cn = await window.storage.get("carryingNotes");
        if (cn) setCarryingNotes(cn.value);
      } catch (e) { }
      try {
        const cd = await window.storage.get("cycleDecisions");
        if (cd) setCycleDecisions(JSON.parse(cd.value));
      } catch (e) { }
      try {
        const urls = {};
        for (const r of RESOURCES) {
          const stored = await window.storage.get(r.storageKey);
          if (stored) urls[r.storageKey] = stored.value;
        }
        if (Object.keys(urls).length) setResourceUrls(urls);
      } catch (e) { }
      setLoaded(true);
    })();
  }, []);

  const saveTasks = async (next) => {
    setCompletedTasks(next);
    try { await window.storage.set("completedTasks", JSON.stringify(next)); } catch (e) { }
  };

  const saveCustomTasks = async (next) => {
    setCustomTasks(next);
    try { await window.storage.set("customTasks", JSON.stringify(next)); } catch (e) { }
  };

  const saveWeights = async (next) => {
    setWeights(next);
    try { await window.storage.set("weights", JSON.stringify(next)); } catch (e) { }
  };

  const saveNotes = async (val) => {
    setCustomNotes(val);
    try { await window.storage.set("notes", val); } catch (e) { }
  };

  const saveFoundationVerse = async (val) => {
    setFoundationVerse(val);
    try { await window.storage.set("foundationVerse", val); } catch (e) { }
  };

  const savePresenceDays = async (next) => {
    setPresenceDays(next);
    try { await window.storage.set("presenceDays", JSON.stringify(next)); } catch (e) { }
  };

  const saveCarryingNotes = async (val) => {
    setCarryingNotes(val);
    try { await window.storage.set("carryingNotes", val); } catch (e) { }
  };

  const saveCycleDecisions = async (next) => {
    setCycleDecisions(next);
    try { await window.storage.set("cycleDecisions", JSON.stringify(next)); } catch (e) { }
  };

  const saveResourceUrl = async (storageKey, url) => {
    setResourceUrls(prev => ({ ...prev, [storageKey]: url }));
    try { await window.storage.set(storageKey, url); } catch (e) { }
  };

  const togglePresenceDay = (dateStr) => {
    const next = { ...presenceDays };
    if (next[dateStr]) delete next[dateStr];
    else next[dateStr] = true;
    savePresenceDays(next);
  };

  const toggleTask = (id) => {
    saveTasks({ ...completedTasks, [id]: !completedTasks[id] });
  };

  const getTasksForWeek = (week, track) => {
    const defaults = DEFAULT_TASKS[week]?.[track] || [];
    const custom = customTasks[`${track}-w${week}`] || { added: [], deletedDefaults: [], edits: {} };

    const defaultsMapped = defaults
      .map((task, i) => ({
        id: `${track}-w${week}-d${i}`,
        text: custom.edits?.[`d${i}`] || task,
        kind: "default",
        defaultIdx: i,
      }))
      .filter(t => !custom.deletedDefaults?.includes(t.defaultIdx));

    const addedMapped = (custom.added || []).map((task, i) => ({
      id: `${track}-w${week}-c${i}`,
      text: task,
      kind: "custom",
      customIdx: i,
    }));

    return [...defaultsMapped, ...addedMapped];
  };

  const addCustomTask = (week, track, text) => {
    if (!text?.trim()) return;
    const key = `${track}-w${week}`;
    const existing = customTasks[key] || { added: [], deletedDefaults: [], edits: {} };
    saveCustomTasks({
      ...customTasks,
      [key]: { ...existing, added: [...(existing.added || []), text.trim()] },
    });
  };

  const editTask = (week, track, taskItem, newText) => {
    if (!newText?.trim()) return;
    const key = `${track}-w${week}`;
    const existing = customTasks[key] || { added: [], deletedDefaults: [], edits: {} };
    if (taskItem.kind === "default") {
      saveCustomTasks({
        ...customTasks,
        [key]: { ...existing, edits: { ...(existing.edits || {}), [`d${taskItem.defaultIdx}`]: newText.trim() } },
      });
    } else {
      const next = [...(existing.added || [])];
      next[taskItem.customIdx] = newText.trim();
      saveCustomTasks({ ...customTasks, [key]: { ...existing, added: next } });
    }
  };

  const deleteTask = (week, track, taskItem) => {
    const key = `${track}-w${week}`;
    const existing = customTasks[key] || { added: [], deletedDefaults: [], edits: {} };
    if (taskItem.kind === "default") {
      saveCustomTasks({
        ...customTasks,
        [key]: { ...existing, deletedDefaults: [...(existing.deletedDefaults || []), taskItem.defaultIdx] },
      });
    } else {
      const next = (existing.added || []).filter((_, i) => i !== taskItem.customIdx);
      saveCustomTasks({ ...customTasks, [key]: { ...existing, added: next } });
    }
    const next = { ...completedTasks };
    delete next[taskItem.id];
    saveTasks(next);
  };

  const addWeight = () => {
    const n = parseFloat(newWeight);
    if (!n || n < 100 || n > 400) return;
    const entry = { date: new Date().toISOString().split("T")[0], weight: n };
    saveWeights([...weights, entry].sort((a, b) => a.date.localeCompare(b.date)));
    setNewWeight("");
  };

  const removeWeight = (idx) => {
    saveWeights(weights.filter((_, i) => i !== idx));
  };

  return (
    <div style={{
      fontFamily: "'Iowan Old Style', 'Palatino', Georgia, serif",
      background: PALETTE.bg,
      minHeight: "100vh",
      color: PALETTE.ink,
    }}>
      <Header currentWeek={currentWeek} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px 80px" }}>
        {!loaded ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: PALETTE.inkFaint, fontFamily: "monospace", fontSize: "12px", letterSpacing: "2px" }}>
            LOADING...
          </div>
        ) : (
          <>
            {activeTab === "this-week" && (
              <ThisWeek
                viewWeek={viewWeek} setViewWeek={setViewWeek} currentWeek={currentWeek}
                completedTasks={completedTasks} toggleTask={toggleTask}
                getTasksForWeek={getTasksForWeek}
                addCustomTask={addCustomTask} editTask={editTask} deleteTask={deleteTask}
              />
            )}
            {activeTab === "business" && (
              <BusinessTrack
                viewWeek={viewWeek} setViewWeek={setViewWeek} currentWeek={currentWeek}
                completedTasks={completedTasks} toggleTask={toggleTask}
                getTasksForWeek={getTasksForWeek}
                addCustomTask={addCustomTask} editTask={editTask} deleteTask={deleteTask}
              />
            )}
            {activeTab === "body" && (
              <BodyTrack
                viewWeek={viewWeek} setViewWeek={setViewWeek} currentWeek={currentWeek}
                weights={weights} newWeight={newWeight} setNewWeight={setNewWeight}
                addWeight={addWeight} removeWeight={removeWeight}
                completedTasks={completedTasks} toggleTask={toggleTask}
                getTasksForWeek={getTasksForWeek}
                addCustomTask={addCustomTask} editTask={editTask} deleteTask={deleteTask}
              />
            )}
            {activeTab === "budget" && (
              <BudgetTrack completedTasks={completedTasks} toggleTask={toggleTask} resourceUrls={resourceUrls} saveResourceUrl={saveResourceUrl} />
            )}
            {activeTab === "compass" && (
              <CompassTab
                customNotes={customNotes}
                saveNotes={saveNotes}
                foundationVerse={foundationVerse}
                saveFoundationVerse={saveFoundationVerse}
                presenceDays={presenceDays}
                togglePresenceDay={togglePresenceDay}
                carryingNotes={carryingNotes}
                saveCarryingNotes={saveCarryingNotes}
                cycleDecisions={cycleDecisions}
                saveCycleDecisions={saveCycleDecisions}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================

function Header({ currentWeek }) {
  const cycleProgress = currentWeek === 0 ? 0 : Math.min(100, (currentWeek / 13) * 100);

  return (
    <div style={{
      background: PALETTE.bgAlt,
      borderBottom: `1px solid ${PALETTE.border}`,
      padding: "36px 20px 100px",
      position: "relative",
      overflow: "hidden",
    }}>
      <MountainBackdrop height={140} opacity={1} />
      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(18px, 3vw, 28px)", marginBottom: "10px" }}>
          <img
            src="/icon-192.png"
            alt="DO"
            style={{
              width: "clamp(22px, 4vw, 30px)",
              height: "clamp(22px, 4vw, 30px)",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <h1 style={{
            fontSize: "clamp(28px, 5.5vw, 44px)",
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.05,
            letterSpacing: "-0.5px",
            color: PALETTE.trailDeep,
            fontFamily: "'Iowan Old Style', 'Palatino', Georgia, serif",
          }}>
            Dashboard
          </h1>
        </div>
        <div style={{
          fontSize: "11px", letterSpacing: "3px", color: PALETTE.trail,
          textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600,
          marginBottom: "16px",
        }}>
          90 Days · Apr 28 → Jul 25, 2026
        </div>
        <p style={{
          color: PALETTE.inkSoft, fontSize: "15px", margin: "0 0 24px",
          maxWidth: "600px", lineHeight: 1.5, fontStyle: "italic",
        }}>
          Does this serve the version of myself I'm becoming, or does it cut against it?
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "500px" }}>
          <div style={{
            flex: 1, height: "4px", background: PALETTE.border, borderRadius: "2px", overflow: "hidden",
          }}>
            <div style={{
              width: `${cycleProgress}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${PALETTE.blaze} 0%, ${PALETTE.trailLight} 50%, ${PALETTE.trailDeep} 100%)`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{
            fontSize: "11px", fontFamily: "monospace", color: PALETTE.inkMuted,
            letterSpacing: "1.5px", fontWeight: 600,
          }}>
            {currentWeek === 0 ? "PRE-LAUNCH" : `WEEK ${currentWeek} / 13`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TABS
// ============================================================

function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "this-week", label: "This Week", icon: Calendar },
    { id: "business", label: "DO Code Lab", icon: Briefcase },
    { id: "body", label: "Body", icon: Dumbbell },
    { id: "budget", label: "Money", icon: Wallet },
    { id: "compass", label: "Compass", icon: Compass },
  ];

  return (
    <div style={{
      borderBottom: `1px solid ${PALETTE.border}`,
      background: PALETTE.card,
      position: "sticky",
      top: 0,
      zIndex: 10,
      boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", overflowX: "auto" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "16px 18px",
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${PALETTE.trail}` : "2px solid transparent",
                color: active ? PALETTE.trail : PALETTE.inkMuted,
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: active ? 700 : 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// WEEK PICKER
// ============================================================

function WeekPicker({ viewWeek, setViewWeek, currentWeek }) {
  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: "8px",
      padding: "12px 14px",
      marginBottom: "24px",
    }}>
      <div style={{
        fontSize: "10px", letterSpacing: "2px", color: PALETTE.inkMuted,
        textTransform: "uppercase", fontFamily: "monospace", marginBottom: "10px", fontWeight: 600,
      }}>
        Jump to Week
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {WEEKS.map(w => {
          const isView = viewWeek === w.num;
          const isCurrent = currentWeek === w.num;
          return (
            <button
              key={w.num}
              onClick={() => setViewWeek(w.num)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "6px",
                border: isView ? `2px solid ${PALETTE.trail}` : `1px solid ${PALETTE.border}`,
                background: isView ? PALETTE.trail : isCurrent ? PALETTE.bgAlt : PALETTE.card,
                color: isView ? PALETTE.card : isCurrent ? PALETTE.trail : PALETTE.inkSoft,
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: isView || isCurrent ? 700 : 500,
                position: "relative",
                transition: "all 0.15s",
              }}
              title={`${fmtDate(w.start)} – ${fmtDate(w.end)}`}
            >
              {w.num}
              {isCurrent && !isView && (
                <div style={{
                  position: "absolute", top: "3px", right: "3px",
                  width: "6px", height: "6px", borderRadius: "50%", background: PALETTE.blaze,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// TASK LIST — editable
// ============================================================

const miniBtn = (bg, color, bordered) => ({
  background: bg,
  color,
  border: bordered ? `1px solid ${PALETTE.border}` : "none",
  borderRadius: "4px",
  padding: "6px 12px",
  fontSize: "11px",
  fontFamily: "monospace",
  letterSpacing: "1.5px",
  fontWeight: 600,
  cursor: "pointer",
  textTransform: "uppercase",
});

function TaskList({ title, color, tasks, week, track, completedTasks, toggleTask, addCustomTask, editTask, deleteTask }) {
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const handleAdd = () => {
    if (newText.trim()) {
      addCustomTask(week, track, newText);
      setNewText("");
    }
    setAdding(false);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (task) => {
    if (editText.trim()) {
      editTask(week, track, task, editText);
    }
    setEditingId(null);
  };

  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: "8px",
      padding: "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{
          fontSize: "10px", letterSpacing: "3px", color, textTransform: "uppercase",
          fontFamily: "monospace", fontWeight: 700,
        }}>
          {title}
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            style={{
              background: "none", border: "none", color: PALETTE.inkMuted,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
              fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px",
              padding: "4px 8px", borderRadius: "4px",
            }}
          >
            <Plus size={12} /> ADD
          </button>
        )}
      </div>

      {tasks.length === 0 && !adding && (
        <div style={{ fontSize: "13px", color: PALETTE.inkFaint, fontStyle: "italic", padding: "8px 0" }}>
          No tasks yet — tap ADD to create one.
        </div>
      )}

      {tasks.map((task, i) => {
        const done = completedTasks[task.id];
        const isEditing = editingId === task.id;

        if (isEditing) {
          return (
            <div key={task.id} style={{ padding: "10px 0", borderBottom: i < tasks.length - 1 ? `1px solid ${PALETTE.borderSoft}` : "none" }}>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(task);
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                style={{
                  width: "100%",
                  border: `1px solid ${PALETTE.trail}`,
                  borderRadius: "4px",
                  padding: "8px 10px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  outline: "none",
                  color: PALETTE.ink,
                  background: PALETTE.bg,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button onClick={() => saveEdit(task)} style={miniBtn(PALETTE.trail, PALETTE.card)}>Save</button>
                <button onClick={() => setEditingId(null)} style={miniBtn(PALETTE.card, PALETTE.inkMuted, true)}>Cancel</button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={task.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 0",
              borderBottom: i < tasks.length - 1 ? `1px solid ${PALETTE.borderSoft}` : "none",
            }}
          >
            <div
              onClick={() => toggleTask(task.id)}
              style={{
                width: "18px", height: "18px", borderRadius: "4px",
                border: `1.5px solid ${done ? color : PALETTE.border}`,
                background: done ? color : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: "2px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {done && <Check size={12} color={PALETTE.card} strokeWidth={3} />}
            </div>
            <div
              onClick={() => toggleTask(task.id)}
              style={{
                flex: 1,
                fontSize: "14px",
                color: done ? PALETTE.inkFaint : PALETTE.ink,
                textDecoration: done ? "line-through" : "none",
                lineHeight: 1.5,
                cursor: "pointer",
              }}
            >
              {task.text}
            </div>
            <div style={{ display: "flex", gap: "2px" }}>
              <button
                onClick={() => startEdit(task)}
                style={{ background: "none", border: "none", color: PALETTE.inkFaint, cursor: "pointer", padding: "4px", display: "flex" }}
                aria-label="Edit"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => deleteTask(week, track, task)}
                style={{ background: "none", border: "none", color: PALETTE.inkFaint, cursor: "pointer", padding: "4px", display: "flex" }}
                aria-label="Delete"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        );
      })}

      {adding && (
        <div style={{ paddingTop: tasks.length > 0 ? "12px" : "0", borderTop: tasks.length > 0 ? `1px solid ${PALETTE.borderSoft}` : "none" }}>
          <input
            ref={inputRef}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setAdding(false); setNewText(""); }
            }}
            placeholder="New task…"
            style={{
              width: "100%",
              border: `1px solid ${PALETTE.trail}`,
              borderRadius: "4px",
              padding: "10px 12px",
              fontFamily: "inherit",
              fontSize: "14px",
              outline: "none",
              color: PALETTE.ink,
              background: PALETTE.bg,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={handleAdd} style={miniBtn(PALETTE.trail, PALETTE.card)}>Add</button>
            <button onClick={() => { setAdding(false); setNewText(""); }} style={miniBtn(PALETTE.card, PALETTE.inkMuted, true)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// THIS WEEK
// ============================================================

function ThisWeek({ viewWeek, setViewWeek, currentWeek, completedTasks, toggleTask, getTasksForWeek, addCustomTask, editTask, deleteTask }) {
  const week = viewWeek;
  const weekData = WEEKS[week - 1];
  const businessPhase = getPhaseFor("business", week);
  const bodyPhase = getPhaseFor("body", week);
  const businessTasks = getTasksForWeek(week, "business");
  const bodyTasks = getTasksForWeek(week, "body");
  const isCurrentView = week === currentWeek;

  return (
    <div>
      <WeekPicker viewWeek={viewWeek} setViewWeek={setViewWeek} currentWeek={currentWeek} />

      <SectionLabel text={`Week ${week}${isCurrentView ? " (this week)" : ""} — ${fmtDate(weekData.start)} → ${fmtDate(weekData.end)}`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <PhaseCard track="DO Code Lab" phase={businessPhase} icon={Code2} />
        <PhaseCard track="Body" phase={bodyPhase} icon={Dumbbell} />
      </div>

      <SectionLabel text="This Week's Moves" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <TaskList
          title="DO Code Lab"
          color={businessPhase.color}
          tasks={businessTasks}
          week={week}
          track="business"
          completedTasks={completedTasks}
          toggleTask={toggleTask}
          addCustomTask={addCustomTask}
          editTask={editTask}
          deleteTask={deleteTask}
        />
        <TaskList
          title="Body"
          color={bodyPhase.color}
          tasks={bodyTasks}
          week={week}
          track="body"
          completedTasks={completedTasks}
          toggleTask={toggleTask}
          addCustomTask={addCustomTask}
          editTask={editTask}
          deleteTask={deleteTask}
        />
      </div>

      <SectionLabel text="Money Watch" />
      <BudgetWatch />

      <UpstreamWatch />
    </div>
  );
}

// Small surface on This Week that gently surfaces the upstream layer
// without making it loud. Only shows if a verse has been captured.
function UpstreamWatch() {
  const [verse, setVerse] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const fv = await window.storage.get("foundationVerse");
        if (fv) setVerse(fv.value);
      } catch (e) { }
    })();
  }, []);

  if (!verse) return null;

  return (
    <>
      <SectionLabel text="Upstream" />
      <div style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.trail}33`,
        borderLeft: `3px solid ${PALETTE.trail}`,
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <BookOpen size={13} color={PALETTE.trail} />
          <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.trail, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>
            Foundation
          </div>
        </div>
        <div style={{
          fontSize: "15px",
          color: PALETTE.trailDeep,
          lineHeight: 1.55,
          fontStyle: "italic",
          whiteSpace: "pre-wrap",
        }}>
          {verse.length > 220 ? verse.slice(0, 220) + "…" : verse}
        </div>
      </div>
    </>
  );
}

function PhaseCard({ track, phase, icon: Icon }) {
  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderLeft: `3px solid ${phase.color}`,
      borderRadius: "8px",
      padding: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        {Icon && <Icon size={14} color={PALETTE.inkMuted} />}
        <div style={{
          fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.inkMuted,
          textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600,
        }}>
          {track}
        </div>
      </div>
      <div style={{ fontSize: "22px", color: PALETTE.trailDeep, marginBottom: "8px", fontWeight: 600 }}>
        {phase.label}
      </div>
      <div style={{ fontSize: "13px", color: PALETTE.inkSoft, lineHeight: 1.5, fontStyle: "italic" }}>
        {phase.focus}
      </div>
    </div>
  );
}

// ============================================================
// BUSINESS TRACK
// ============================================================

function BusinessTrack({ viewWeek, setViewWeek, currentWeek, completedTasks, toggleTask, getTasksForWeek, addCustomTask, editTask, deleteTask }) {
  const week = viewWeek;
  const weekData = WEEKS[week - 1];
  const phase = getPhaseFor("business", week);
  const tasks = getTasksForWeek(week, "business");

  return (
    <div>
      <SectionLabel text="DO Code Lab — 13 Week Sequence" />
      <div style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "20px 24px",
        marginBottom: "24px",
      }}>
        <div style={{ fontSize: "14px", color: PALETTE.inkSoft, lineHeight: 1.65, marginBottom: "14px" }}>
          Foundation in writing, then ship the rebuild. Testimonials first while enthusiasm is fresh.
          Foundation docs in parallel. Website rebuild in the back half — designed around real content, not aspirations.
        </div>
        <div style={{ fontSize: "11px", fontFamily: "monospace", color: PALETTE.inkMuted, letterSpacing: "1.5px", fontWeight: 600 }}>
          CAPACITY · 2.5 HRS / WEEK · SATURDAYS 1:00–3:30 PM · 32.5 HRS TOTAL
        </div>
      </div>

      <SectionLabel text="The Trail" />
      {TRACK_PHASES.business.map((p, idx) => {
        const isActive = p.weeks.includes(week);
        return (
          <div key={idx} style={{ marginBottom: "12px" }}>
            <div style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.border}`,
              borderLeft: `4px solid ${p.color}`,
              borderRadius: "8px",
              padding: "16px 20px",
              opacity: isActive ? 1 : 0.7,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontFamily: "monospace", color: PALETTE.inkMuted, letterSpacing: "2px", fontWeight: 600 }}>
                    WEEKS {p.weeks[0]}–{p.weeks[p.weeks.length - 1]}
                  </div>
                  <div style={{ fontSize: "18px", color: PALETTE.trailDeep, marginTop: "4px", fontWeight: 600 }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: "13px", color: PALETTE.inkSoft, marginTop: "4px", fontStyle: "italic" }}>
                    {p.focus}
                  </div>
                </div>
                {isActive && (
                  <div style={{
                    fontSize: "9px", fontFamily: "monospace", letterSpacing: "1.5px",
                    background: p.color, color: PALETTE.card,
                    padding: "4px 10px", borderRadius: "4px", fontWeight: 700,
                  }}>
                    ACTIVE
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div style={{
        marginTop: "24px",
        background: "#FAF5E8",
        border: `1px solid ${PALETTE.blaze}66`,
        borderRadius: "8px",
        padding: "18px 20px",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <AlertCircle size={15} color={PALETTE.blaze} />
          <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: "#8B6914", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>
            Mid-Cycle Check-In · Week 7
          </div>
        </div>
        <div style={{ fontSize: "13px", color: PALETTE.ink, lineHeight: 1.6 }}>
          Foundation docs done? Testimonials in hand? Inbound conversations happening?
          If anything is meaningfully behind, the visual rebuild gets compressed or copy-only fallback (Swap C) kicks in.
        </div>
      </div>

      <div style={{
        background: PALETTE.bgAlt,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "18px 20px",
        marginBottom: "32px",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "8px" }}>
          Saturday Block · Sacred
        </div>
        <div style={{ fontSize: "13px", color: PALETTE.inkSoft, lineHeight: 1.65 }}>
          Personal builds (In DO Time, SiteForge, Sketch Health) live outside the 1:00–3:30 PM Saturday block.
          Weeks 10–13 use SiteForge to <em>rebuild docodelab.com</em> — that's a use, not a launch. No stealth scope creep.
        </div>
      </div>

      <SectionLabel text="Cycle Win Condition" />
      <div style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "32px",
      }}>
        <div style={{ fontSize: "13px", color: PALETTE.inkSoft, fontStyle: "italic", lineHeight: 1.6, marginBottom: "16px" }}>
          By end of July, the system that produces revenue exists — not just the foundation that will.
        </div>
        {[
          "Foundation docs used on at least one new client conversation",
          "Website live and bringing in at least one inbound conversation",
          "Three testimonials in hand and doing reputation work",
          "One new piece of paid work generated through the new system",
        ].map((task, i, arr) => {
          const id = `cycle-win-${i}`;
          const done = completedTasks[id];
          return (
            <div
              key={id}
              onClick={() => toggleTask(id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${PALETTE.borderSoft}` : "none",
                cursor: "pointer",
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "4px",
                border: `1.5px solid ${done ? PALETTE.ok : PALETTE.border}`,
                background: done ? PALETTE.ok : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: "2px",
              }}>
                {done && <Check size={12} color={PALETTE.card} strokeWidth={3} />}
              </div>
              <div style={{
                fontSize: "14px",
                color: done ? PALETTE.inkFaint : PALETTE.ink,
                textDecoration: done ? "line-through" : "none",
                lineHeight: 1.5,
              }}>
                {task}
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: "12px", color: PALETTE.inkMuted, fontStyle: "italic", lineHeight: 1.5, marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${PALETTE.borderSoft}` }}>
          Dollar amount is beside the point. The win is that the system produces revenue.
        </div>
      </div>

      <SectionLabel text="Week-by-Week Tasks" />
      <WeekPicker viewWeek={viewWeek} setViewWeek={setViewWeek} currentWeek={currentWeek} />
      <div style={{ marginBottom: "12px", fontSize: "13px", color: PALETTE.inkMuted, fontStyle: "italic" }}>
        Week {week} · {fmtDate(weekData.start)} → {fmtDate(weekData.end)} · <span style={{ color: phase.color, fontWeight: 600, fontStyle: "normal" }}>{phase.label}</span>
      </div>
      <TaskList
        title={`Week ${week} · DO Code Lab`}
        color={phase.color}
        tasks={tasks}
        week={week}
        track="business"
        completedTasks={completedTasks}
        toggleTask={toggleTask}
        addCustomTask={addCustomTask}
        editTask={editTask}
        deleteTask={deleteTask}
      />
    </div>
  );
}

// ============================================================
// BODY TRACK
// ============================================================

function BodyTrack({ viewWeek, setViewWeek, currentWeek, weights, newWeight, setNewWeight, addWeight, removeWeight, completedTasks, toggleTask, getTasksForWeek, addCustomTask, editTask, deleteTask }) {
  const week = viewWeek;
  const weekData = WEEKS[week - 1];
  const phase = getPhaseFor("body", week);
  const tasks = getTasksForWeek(week, "body");

  const startWeight = weights[0]?.weight;
  const latestWeight = weights[weights.length - 1]?.weight;
  const weightDelta = startWeight && latestWeight ? (latestWeight - startWeight).toFixed(1) : null;

  return (
    <div>
      <SectionLabel text="Body Recomp — 13 Week Cycle" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <StatBox label="Start" value={startWeight ? `${startWeight} lb` : "—"} hint="Day 1 baseline" />
        <StatBox label="Current" value={latestWeight ? `${latestWeight} lb` : "—"} hint={`${weights.length} weigh-in${weights.length === 1 ? "" : "s"}`} />
        <StatBox
          label="Delta"
          value={weightDelta ? `${weightDelta > 0 ? "+" : ""}${weightDelta} lb` : "—"}
          hint="Trend > any single number"
          accent={weightDelta && parseFloat(weightDelta) <= 0 ? PALETTE.ok : null}
        />
      </div>

      {weights.length > 0 && (
        <div style={{
          background: PALETTE.card,
          border: `1px solid ${PALETTE.border}`,
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "24px",
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "16px" }}>
            Weight Trend
          </div>
          <WeightChart weights={weights} />
        </div>
      )}

      <div style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "32px",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "12px" }}>
          Monday Weigh-In
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: weights.length > 0 ? "16px" : 0 }}>
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWeight()}
            placeholder="lbs"
            style={{
              flex: 1,
              background: PALETTE.bg,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: "6px",
              padding: "10px 14px",
              color: PALETTE.ink,
              fontFamily: "monospace",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={addWeight}
            style={{
              background: PALETTE.trail,
              color: PALETTE.card,
              border: "none",
              borderRadius: "6px",
              padding: "0 20px",
              fontFamily: "monospace",
              fontSize: "11px",
              letterSpacing: "2px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <Plus size={14} /> LOG
          </button>
        </div>
        {weights.length > 0 && (
          <div style={{ maxHeight: "180px", overflowY: "auto", borderTop: `1px solid ${PALETTE.borderSoft}`, paddingTop: "12px" }}>
            {[...weights].reverse().map((entry, i) => {
              const realIdx = weights.length - 1 - i;
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0",
                  borderBottom: i < weights.length - 1 ? `1px solid ${PALETTE.borderSoft}` : "none",
                }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontFamily: "monospace", color: PALETTE.inkMuted }}>{entry.date}</span>
                    <span style={{ fontSize: "14px", color: PALETTE.ink, fontFamily: "monospace", fontWeight: 600 }}>{entry.weight} lb</span>
                  </div>
                  <button
                    onClick={() => removeWeight(realIdx)}
                    style={{ background: "none", border: "none", color: PALETTE.inkFaint, cursor: "pointer", padding: "4px" }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SectionLabel text="The Trail" />
      {TRACK_PHASES.body.map((p, idx) => {
        const isActive = p.weeks.includes(week);
        return (
          <div key={idx} style={{ marginBottom: "12px" }}>
            <div style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.border}`,
              borderLeft: `4px solid ${p.color}`,
              borderRadius: "8px",
              padding: "16px 20px",
              opacity: isActive ? 1 : 0.7,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontFamily: "monospace", color: PALETTE.inkMuted, letterSpacing: "2px", fontWeight: 600 }}>
                    WEEKS {p.weeks[0]}{p.weeks.length > 1 ? `–${p.weeks[p.weeks.length - 1]}` : ""}
                  </div>
                  <div style={{ fontSize: "18px", color: PALETTE.trailDeep, marginTop: "4px", fontWeight: 600 }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: "13px", color: PALETTE.inkSoft, marginTop: "4px", fontStyle: "italic" }}>
                    {p.focus}
                  </div>
                </div>
                {isActive && (
                  <div style={{
                    fontSize: "9px", fontFamily: "monospace", letterSpacing: "1.5px",
                    background: p.color, color: PALETTE.card,
                    padding: "4px 10px", borderRadius: "4px", fontWeight: 700,
                  }}>
                    ACTIVE
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: "32px" }}>
        <SectionLabel text="Week-by-Week Tasks" />
        <WeekPicker viewWeek={viewWeek} setViewWeek={setViewWeek} currentWeek={currentWeek} />
        <div style={{ marginBottom: "12px", fontSize: "13px", color: PALETTE.inkMuted, fontStyle: "italic" }}>
          Week {week} · {fmtDate(weekData.start)} → {fmtDate(weekData.end)} · <span style={{ color: phase.color, fontWeight: 600, fontStyle: "normal" }}>{phase.label}</span>
        </div>
        <TaskList
          title={`Week ${week} · Body`}
          color={phase.color}
          tasks={tasks}
          week={week}
          track="body"
          completedTasks={completedTasks}
          toggleTask={toggleTask}
          addCustomTask={addCustomTask}
          editTask={editTask}
          deleteTask={deleteTask}
        />
      </div>

      <div style={{ marginTop: "32px" }}>
        <SectionLabel text="Body Principles" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {[
            "Progressive overload — add weight or reps every 1–2 weeks",
            "Protein anchor every meal · 180–200g daily",
            "Sleep 7–9 hrs · muscle is built while you sleep",
            "Monday morning weigh-in · same conditions",
            "Consistency > Perfection · the plan only fails if you quit",
          ].map((p, i) => (
            <div key={i} style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: "6px",
              padding: "14px 16px",
              fontSize: "13px",
              color: PALETTE.inkSoft,
              lineHeight: 1.5,
            }}>
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WEIGHT CHART
// ============================================================

function WeightChart({ weights }) {
  if (weights.length === 0) return null;
  const w = 600, h = 200, pad = 36;
  const ys = weights.map(d => d.weight);
  const minY = Math.min(...ys) - 2;
  const maxY = Math.max(...ys) + 2;
  const xScale = (i) => pad + (i / Math.max(1, weights.length - 1)) * (w - pad * 2);
  const yScale = (v) => h - pad - ((v - minY) / (maxY - minY || 1)) * (h - pad * 2);
  const path = weights.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.weight)}`).join(" ");
  const area = `${path} L ${xScale(weights.length - 1)} ${h - pad} L ${pad} ${h - pad} Z`;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: "100%", height: "auto", minHeight: "180px" }}>
        <defs>
          <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.trail} stopOpacity="0.18" />
            <stop offset="100%" stopColor={PALETTE.trail} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[minY, (minY + maxY) / 2, maxY].map((v, i) => (
          <text key={i} x={4} y={yScale(v) + 4} fill={PALETTE.inkFaint} fontSize="10" fontFamily="monospace">
            {v.toFixed(0)}
          </text>
        ))}
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line key={i} x1={pad} y1={pad + (h - pad * 2) * p} x2={w - pad} y2={pad + (h - pad * 2) * p} stroke={PALETTE.borderSoft} strokeDasharray="2 4" />
        ))}
        <path d={area} fill="url(#weightArea)" />
        <path d={path} fill="none" stroke={PALETTE.trail} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {weights.map((d, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d.weight)} r="4" fill={PALETTE.card} stroke={PALETTE.trail} strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// BUDGET TRACK
// ============================================================

function BudgetTrack({ completedTasks, toggleTask, resourceUrls, saveResourceUrl }) {
  return (
    <div>
      <SectionLabel text="Money — Hapag-Only Baseline" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <StatBox label="Take-Home" value="$3,783" hint="Hapag-Lloyd · monthly" />
        <StatBox label="Margin Today" value="$652" hint="Flexible spending. Whataburger, Target runs, life." accent={PALETTE.ok} />
        <StatBox label="Stable State" value="$371" hint="June 2026 onward. Post-forbearance, post-Five Lakes." />
      </div>

      <SectionLabel text="Tripwires & Deadlines" />
      <div style={{ marginBottom: "32px" }}>
        {BUDGET_TRIPWIRES.map((t, i) => {
          const days = daysUntil(t.date);
          const past = days < 0;
          return (
            <div key={i} style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.border}`,
              borderLeft: `4px solid ${t.urgent ? PALETTE.warn : PALETTE.inkMuted}`,
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "10px",
              opacity: past ? 0.55 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: "15px", color: PALETTE.ink, marginBottom: "4px", fontWeight: 600 }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: "13px", color: PALETTE.inkSoft, lineHeight: 1.5 }}>
                    {t.detail}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: PALETTE.inkMuted, letterSpacing: "1px" }}>
                    {fmtDateLong(new Date(t.date))}
                  </div>
                  <div style={{
                    fontSize: "11px", fontFamily: "monospace",
                    color: past ? PALETTE.inkFaint : t.urgent ? PALETTE.warn : PALETTE.inkMuted,
                    marginTop: "4px", letterSpacing: "1px", fontWeight: 700,
                  }}>
                    {past ? "PASSED" : `${days} DAYS`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionLabel text="Foundation Moves" />
      <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "20px", marginBottom: "32px" }}>
        {[
          "Set up auto-transfer: $200 → Way2Save on each Hapag payday",
          "Confirm ChatGPT Plus is canceled (expires May 23)",
          "Audit Apple subscriptions: cancel anything unused",
          "Call SoFi: ask about longest available repayment term",
        ].map((task, i, arr) => {
          const id = `budget-foundation-${i}`;
          const done = completedTasks[id];
          return (
            <div
              key={id}
              onClick={() => toggleTask(id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${PALETTE.borderSoft}` : "none",
                cursor: "pointer",
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "4px",
                border: `1.5px solid ${done ? PALETTE.ok : PALETTE.border}`,
                background: done ? PALETTE.ok : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: "2px",
              }}>
                {done && <Check size={12} color={PALETTE.card} strokeWidth={3} />}
              </div>
              <div style={{
                fontSize: "14px",
                color: done ? PALETTE.inkFaint : PALETTE.ink,
                textDecoration: done ? "line-through" : "none",
                lineHeight: 1.5,
              }}>
                {task}
              </div>
            </div>
          );
        })}
      </div>

      <SectionLabel text="Bridge Plan" />

      <div style={{
        background: PALETTE.bgAlt,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "20px 24px",
        marginBottom: "16px",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.trail, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "14px" }}>
          The Actual Cliff
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "14px" }}>
          {[
            { label: "Today", value: "$652", hint: "flexible margin" },
            { label: "Post-Forbearance", value: "$127", hint: "June only" },
            { label: "Post-Five Lakes", value: "$896", hint: "May–June" },
            { label: "Stable State", value: "$371", hint: "June onward" },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600, marginBottom: "6px" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "22px", color: PALETTE.trailDeep, fontFamily: "monospace", fontWeight: 700, lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: "10px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", marginTop: "4px", letterSpacing: "1px" }}>
                {item.hint}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "13px", color: PALETTE.inkSoft, fontStyle: "italic", lineHeight: 1.6 }}>
          Tight, not catastrophic. The post-forbearance state is positive but thin. The bridge moves below protect a comfortable margin — they don't bridge a deficit.
        </div>
      </div>

      <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "20px", marginBottom: "32px" }}>
        {[
          "Track dog-sitting income deliberately ($150–300/mo reliable, summer ramp likely)",
          "Send the BSD transfer email this week (in writing, specific ask)",
          "Light expense audit ($20–50/mo cuts compound permanently — lift stable margin from $371 toward $400+)",
          "Track real numbers monthly going forward (Hapag + dog-sitting + DO Code Lab + real margin)",
        ].map((task, i, arr) => {
          const id = `bridge-move-${i}`;
          const done = completedTasks[id];
          return (
            <div
              key={id}
              onClick={() => toggleTask(id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${PALETTE.borderSoft}` : "none",
                cursor: "pointer",
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "4px",
                border: `1.5px solid ${done ? PALETTE.ok : PALETTE.border}`,
                background: done ? PALETTE.ok : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: "2px",
              }}>
                {done && <Check size={12} color={PALETTE.card} strokeWidth={3} />}
              </div>
              <div style={{
                fontSize: "14px",
                color: done ? PALETTE.inkFaint : PALETTE.ink,
                textDecoration: done ? "line-through" : "none",
                lineHeight: 1.5,
              }}>
                {task}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: PALETTE.bgAlt,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "20px",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.trail, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "14px" }}>
          The 50/30/20 Rule
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            { pct: "50%", label: "Savings", note: "Way2Save + cushion" },
            { pct: "30%", label: "Consumer Debt", note: "Cherry → LendingPoint" },
            { pct: "20%", label: "Guilt-Free", note: "Whataburger, Target, life" },
          ].map((a, i) => (
            <div key={i} style={{ borderLeft: i > 0 ? `1px solid ${PALETTE.border}` : "none", paddingLeft: i > 0 ? "12px" : 0 }}>
              <div style={{ fontSize: "26px", color: PALETTE.trailDeep, fontFamily: "monospace", fontWeight: 700 }}>{a.pct}</div>
              <div style={{ fontSize: "13px", color: PALETTE.ink, marginTop: "4px", fontWeight: 600 }}>{a.label}</div>
              <div style={{ fontSize: "11px", color: PALETTE.inkMuted, marginTop: "2px" }}>{a.note}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "12px", color: PALETTE.inkSoft, marginTop: "14px", lineHeight: 1.6, fontStyle: "italic" }}>
          For DO Code Lab + Family Zelles. Not for Hapag take-home — that's already allocated.
        </div>
      </div>

      <SectionLabel text="Resources" />
      <div style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "20px",
      }}>
        {RESOURCES.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            url={resourceUrls[resource.storageKey] || ""}
            onSave={saveResourceUrl}
          />
        ))}
        <div style={{ fontSize: "12px", color: PALETTE.inkMuted, fontStyle: "italic", marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${PALETTE.borderSoft}` }}>
          The dashboard is the summary. The source files are the truth.
        </div>
      </div>
    </div>
  );
}

function ResourceRow({ resource, url, onSave }) {
  const Icon = resource.icon;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(url || "");
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(url || ""); }, [url]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const handleRowClick = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setEditing(true);
    }
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) { setError("URL cannot be empty."); return; }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      return;
    }
    setError("");
    onSave(resource.storageKey, trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(url || "");
    setError("");
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ padding: "12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Icon size={16} color={PALETTE.trail} />
          <div style={{ fontSize: "14px", color: PALETTE.ink, fontWeight: 600 }}>{resource.title}</div>
        </div>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
          placeholder="Paste Google Drive share link…"
          style={{
            width: "100%",
            border: `1px solid ${PALETTE.trail}`,
            borderRadius: "6px",
            padding: "8px 10px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: PALETTE.ink,
            background: PALETTE.bg,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {error && <div style={{ fontSize: "11px", color: PALETTE.warn, marginTop: "4px" }}>{error}</div>}
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button onClick={handleSave} style={miniBtn(PALETTE.trail, PALETTE.card)}>Save</button>
          <button onClick={handleCancel} style={miniBtn(PALETTE.card, PALETTE.inkMuted, true)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 8px",
        borderRadius: "6px",
        background: hovered ? PALETTE.bgAlt : "transparent",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onClick={handleRowClick}
    >
      <Icon size={16} color={PALETTE.trail} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", color: PALETTE.ink, fontWeight: 600, marginBottom: "2px" }}>{resource.title}</div>
        <div style={{ fontSize: "12px", color: PALETTE.inkSoft, fontStyle: "italic" }}>{resource.description}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {url && (
          <button
            onClick={(e) => { e.stopPropagation(); setDraft(url); setError(""); setEditing(true); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "4px", display: "flex", alignItems: "center",
            }}
            title="Edit URL"
          >
            <Edit2 size={13} color={PALETTE.inkMuted} />
          </button>
        )}
        {url
          ? <ExternalLink size={14} color={PALETTE.inkMuted} />
          : <div style={{ fontSize: "10px", color: PALETTE.inkFaint, fontFamily: "monospace", letterSpacing: "1px" }}>CLICK TO ADD</div>
        }
      </div>
    </div>
  );
}

function BudgetWatch() {
  const next = BUDGET_TRIPWIRES
    .filter(t => daysUntil(t.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (!next) return null;
  const days = daysUntil(next.date);

  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderLeft: `4px solid ${next.urgent ? PALETTE.warn : PALETTE.inkMuted}`,
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "32px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: next.urgent ? PALETTE.warn : PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "8px" }}>
            Next Tripwire
          </div>
          <div style={{ fontSize: "16px", color: PALETTE.ink, marginBottom: "4px", fontWeight: 600 }}>
            {next.title}
          </div>
          <div style={{ fontSize: "13px", color: PALETTE.inkSoft }}>
            {next.detail}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "36px", color: next.urgent ? PALETTE.warn : PALETTE.inkSoft, fontFamily: "monospace", lineHeight: 1, fontWeight: 700 }}>
            {days}
          </div>
          <div style={{ fontSize: "10px", fontFamily: "monospace", color: PALETTE.inkMuted, letterSpacing: "2px", marginTop: "4px", fontWeight: 600 }}>
            DAYS
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CYCLE DECISIONS
// ============================================================

function CycleDecisionsSection({ cycleDecisions, saveCycleDecisions }) {
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const handleAdd = () => {
    if (newText.trim()) {
      saveCycleDecisions([...cycleDecisions, { id: Date.now().toString(), text: newText.trim() }]);
      setNewText("");
    }
    setAdding(false);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) {
      saveCycleDecisions(cycleDecisions.map(d => d.id === id ? { ...d, text: editText.trim() } : d));
    }
    setEditingId(null);
  };

  const handleDelete = (id) => {
    saveCycleDecisions(cycleDecisions.filter(d => d.id !== id));
  };

  return (
    <div>
      <SectionLabel text="Cycle Decisions" />
      <div style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "12px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Flag size={13} color={PALETTE.trail} />
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.trail, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>
              Locked for This Cycle
            </div>
          </div>
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              style={{
                background: "none", border: "none", color: PALETTE.inkMuted,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px",
                padding: "4px 8px", borderRadius: "4px",
              }}
            >
              <Plus size={12} /> ADD
            </button>
          )}
        </div>

        {cycleDecisions.length === 0 && !adding && (
          <div style={{ fontSize: "13px", color: PALETTE.inkFaint, fontStyle: "italic", padding: "8px 0" }}>
            No decisions yet — tap ADD to capture a commitment for this cycle.
          </div>
        )}

        {cycleDecisions.map((decision, i) => {
          const isEditing = editingId === decision.id;
          const isLast = i === cycleDecisions.length - 1;

          if (isEditing) {
            return (
              <div key={decision.id} style={{ padding: "10px 0", borderBottom: !isLast ? `1px solid ${PALETTE.borderSoft}` : "none" }}>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(decision.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  style={{
                    width: "100%",
                    border: `1px solid ${PALETTE.trail}`,
                    borderRadius: "4px",
                    padding: "8px 10px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    outline: "none",
                    color: PALETTE.ink,
                    background: PALETTE.bg,
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button onClick={() => handleSaveEdit(decision.id)} style={miniBtn(PALETTE.trail, PALETTE.card)}>Save</button>
                  <button onClick={() => setEditingId(null)} style={miniBtn(PALETTE.card, PALETTE.inkMuted, true)}>Cancel</button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={decision.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "10px 0",
                borderBottom: !isLast ? `1px solid ${PALETTE.borderSoft}` : "none",
              }}
            >
              <div style={{
                flex: 1,
                fontSize: "14px",
                color: PALETTE.ink,
                lineHeight: 1.5,
                cursor: "pointer",
              }}
                onClick={() => { setEditingId(decision.id); setEditText(decision.text); }}
              >
                {decision.text}
              </div>
              <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                <button
                  onClick={() => { setEditingId(decision.id); setEditText(decision.text); }}
                  style={{ background: "none", border: "none", color: PALETTE.inkFaint, cursor: "pointer", padding: "4px", display: "flex" }}
                  aria-label="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(decision.id)}
                  style={{ background: "none", border: "none", color: PALETTE.inkFaint, cursor: "pointer", padding: "4px", display: "flex" }}
                  aria-label="Delete"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {adding && (
          <div style={{ paddingTop: cycleDecisions.length > 0 ? "12px" : "0", borderTop: cycleDecisions.length > 0 ? `1px solid ${PALETTE.borderSoft}` : "none" }}>
            <input
              ref={inputRef}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setNewText(""); }
              }}
              placeholder="e.g. Hinge: account kept, app deleted for the cycle"
              style={{
                width: "100%",
                border: `1px solid ${PALETTE.trail}`,
                borderRadius: "4px",
                padding: "10px 12px",
                fontFamily: "inherit",
                fontSize: "14px",
                outline: "none",
                color: PALETTE.ink,
                background: PALETTE.bg,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={handleAdd} style={miniBtn(PALETTE.trail, PALETTE.card)}>Add</button>
              <button onClick={() => { setAdding(false); setNewText(""); }} style={miniBtn(PALETTE.card, PALETTE.inkMuted, true)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ fontSize: "12px", color: PALETTE.inkMuted, fontStyle: "italic", marginBottom: "32px", paddingLeft: "4px", lineHeight: 1.6 }}>
        Commitments from when I was thinking clearly. Re-read when tempted otherwise.
      </div>
    </div>
  );
}

// ============================================================
// COMPASS
// ============================================================

function CompassTab({ customNotes, saveNotes, foundationVerse, saveFoundationVerse, presenceDays, togglePresenceDay, carryingNotes, saveCarryingNotes, cycleDecisions, saveCycleDecisions }) {
  const [editingVerse, setEditingVerse] = useState(false);
  const [verseDraft, setVerseDraft] = useState(foundationVerse);
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => { setVerseDraft(foundationVerse); }, [foundationVerse]);

  useEffect(() => {
    const EXPORT_KEYS = ["completedTasks", "customTasks", "weights", "notes", "foundationVerse", "presenceDays", "carryingNotes", "cycleDecisions", "resourceUrl_budgetPlan"];
    (async () => {
      let count = 0;
      let totalBytes = 0;
      for (const key of EXPORT_KEYS) {
        const r = await window.storage.get(key);
        if (r?.value) { count++; totalBytes += r.value.length; }
      }
      setStorageInfo({ count, kb: (totalBytes / 1024).toFixed(1) });
    })();
  }, []);

  const handleExport = async () => {
    const EXPORT_KEYS = ["completedTasks", "customTasks", "weights", "notes", "foundationVerse", "presenceDays", "carryingNotes", "cycleDecisions", "resourceUrl_budgetPlan"];
    const data = {};
    for (const key of EXPORT_KEYS) {
      const r = await window.storage.get(key);
      if (r?.value) {
        try { data[key] = JSON.parse(r.value); } catch { data[key] = r.value; }
      } else {
        data[key] = null;
      }
    }
    const payload = { exportedAt: new Date().toISOString(), version: 1, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `do-dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* ============================================================ */}
      {/* FOUNDATION — the verse / scripture sitting upstream            */}
      {/* ============================================================ */}
      <SectionLabel text="Foundation" />
      <div style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.trail}44`,
        borderRadius: "12px",
        padding: "32px 28px",
        marginBottom: "12px",
        position: "relative",
        overflow: "hidden",
      }}>
        <MountainBackdrop height={50} opacity={0.3} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <BookOpen size={14} color={PALETTE.trail} />
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.trail, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>
              Verse for the Cycle
            </div>
          </div>

          {editingVerse ? (
            <div>
              <textarea
                value={verseDraft}
                onChange={(e) => setVerseDraft(e.target.value)}
                placeholder="A verse, passage, or words you're sitting with this 90 days. Reference + text, or just the part that's chewing on you."
                autoFocus
                style={{
                  width: "100%",
                  minHeight: "120px",
                  border: `1px solid ${PALETTE.trail}`,
                  borderRadius: "6px",
                  padding: "12px 14px",
                  fontFamily: "'Iowan Old Style', Georgia, serif",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: PALETTE.ink,
                  background: PALETTE.bg,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button onClick={() => { saveFoundationVerse(verseDraft); setEditingVerse(false); }} style={miniBtn(PALETTE.trail, PALETTE.card)}>Save</button>
                <button onClick={() => { setVerseDraft(foundationVerse); setEditingVerse(false); }} style={miniBtn(PALETTE.card, PALETTE.inkMuted, true)}>Cancel</button>
              </div>
            </div>
          ) : foundationVerse ? (
            <div onClick={() => setEditingVerse(true)} style={{ cursor: "pointer" }}>
              <div style={{
                fontSize: "clamp(18px, 2.6vw, 22px)",
                color: PALETTE.trailDeep,
                lineHeight: 1.55,
                fontStyle: "italic",
                whiteSpace: "pre-wrap",
                fontWeight: 500,
              }}>
                {foundationVerse}
              </div>
              <div style={{ fontSize: "10px", color: PALETTE.inkFaint, fontFamily: "monospace", letterSpacing: "1.5px", marginTop: "16px", fontWeight: 600 }}>
                TAP TO EDIT · CONSIDER REVISITING AT WEEK 7
              </div>
            </div>
          ) : (
            <div onClick={() => setEditingVerse(true)} style={{
              cursor: "pointer",
              padding: "16px 0",
              fontSize: "15px",
              color: PALETTE.inkMuted,
              fontStyle: "italic",
              lineHeight: 1.6,
            }}>
              Tap to capture a verse or passage to anchor this 90 days.
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: "12px", color: PALETTE.inkMuted, fontStyle: "italic", marginBottom: "32px", paddingLeft: "4px", lineHeight: 1.6 }}>
        Everything below flows from this. The work, the body, the money — these are downstream.
      </div>

      {/* ============================================================ */}
      {/* THE BECOMING — the decision filter, now framed as flowing     */}
      {/* ============================================================ */}
      <SectionLabel text="The Becoming" />
      <div style={{
        background: PALETTE.bgAlt,
        border: `1px solid ${PALETTE.blaze}66`,
        borderRadius: "12px",
        padding: "28px 24px",
        marginBottom: "32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.blaze, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "16px" }}>
          Decision Filter
        </div>
        <div style={{
          fontSize: "clamp(18px, 2.8vw, 24px)",
          color: PALETTE.trailDeep,
          lineHeight: 1.4,
          fontStyle: "italic",
          maxWidth: "640px",
          margin: "0 auto",
          fontWeight: 500,
        }}>
          "Does this serve the version of myself I'm becoming, or does it cut against it?"
        </div>
        <div style={{ fontSize: "11px", color: PALETTE.inkMuted, marginTop: "16px", fontFamily: "monospace", letterSpacing: "1.5px", fontWeight: 600 }}>
          BECOMING · NOT OPTIMIZING · NOT ESCAPING
        </div>
      </div>

      {/* ============================================================ */}
      {/* CYCLE DECISIONS — commitments locked at cycle start            */}
      {/* ============================================================ */}
      <CycleDecisionsSection cycleDecisions={cycleDecisions} saveCycleDecisions={saveCycleDecisions} />

      {/* ============================================================ */}
      {/* ANCHORS — Sunday + Monday rhythms                              */}
      {/* ============================================================ */}
      <SectionLabel text="Anchors" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginBottom: "32px" }}>
        {[
          { day: "Sunday", title: "Christ Covenant", detail: "Worship. Rest. Family." },
          { day: "Monday", title: "Men's Bible Study", detail: "Word + brothers." },
        ].map((a, i) => (
          <div key={i} style={{
            background: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            borderLeft: `3px solid ${PALETTE.trail}`,
            borderRadius: "8px",
            padding: "18px 20px",
          }}>
            <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600, marginBottom: "6px" }}>
              {a.day}
            </div>
            <div style={{ fontSize: "17px", color: PALETTE.trailDeep, fontWeight: 600, marginBottom: "4px" }}>
              {a.title}
            </div>
            <div style={{ fontSize: "13px", color: PALETTE.inkSoft, lineHeight: 1.5, fontStyle: "italic" }}>
              {a.detail}
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* DAILY RHYTHM — Our Daily presence calendar (no streaks)        */}
      {/* ============================================================ */}
      <SectionLabel text="Our Daily — Presence" />
      <PresenceCalendar presenceDays={presenceDays} togglePresenceDay={togglePresenceDay} />

      {/* ============================================================ */}
      {/* CARRYING — prayer, gratitude, weight                          */}
      {/* ============================================================ */}
      <SectionLabel text="Carrying" />
      <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "20px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Heart size={14} color={PALETTE.trail} />
          <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600 }}>
            Prayer · Gratitude · What I'm Sitting With
          </div>
        </div>
        <textarea
          value={carryingNotes}
          onChange={(e) => saveCarryingNotes(e.target.value)}
          placeholder="People, requests, gratitude, what's heavy, what's good. The space the dashboard doesn't usually have room for."
          style={{
            width: "100%",
            minHeight: "180px",
            background: "transparent",
            border: "none",
            color: PALETTE.ink,
            fontFamily: "'Iowan Old Style', Georgia, serif",
            fontSize: "15px",
            lineHeight: 1.7,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ fontSize: "10px", color: PALETTE.inkFaint, fontFamily: "monospace", letterSpacing: "1.5px", marginTop: "8px", fontWeight: 600 }}>
          AUTOSAVES · PRIVATE TO YOU
        </div>
      </div>

      {/* ============================================================ */}
      {/* WHAT'S ACTUALLY TRUE — strategic posture (downstream)          */}
      {/* ============================================================ */}
      <SectionLabel text="What's Actually True" />
      <div style={{ display: "grid", gap: "10px", marginBottom: "32px" }}>
        {[
          { label: "Identity", text: "Trusted advisor with real technical depth. The relationship with the client is part of the craft, not a tax on it." },
          { label: "Posture", text: "DO Code Lab is one identity in two modes — building (web dev) and teaching (DO More). Not two arms." },
          { label: "Job Question", text: "Hapag-Lloyd is a financial floor while the becoming happens. BSD transfer worth pursuing if it accelerates the becoming." },
          { label: "Structure", text: "Solo, deliberately. Partners aren't a fix for the day-job constraint, and the craft is craft I need to develop." },
          { label: "Ceiling", text: "1–2 active builds simultaneously. Never more." },
          { label: "Stretch", text: "Default failure mode is 6 small projects instead of 1 ambitious one. The stretch is the most important and easiest to skip." },
          { label: "Personal Builds", text: "In DO Time, SiteForge, Sketch Health are real, but not service offerings. Saturday block is for DO Code Lab only." },
        ].map((p, i) => (
          <div key={i} style={{
            background: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: "8px",
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.trail, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "6px" }}>
              {p.label}
            </div>
            <div style={{ fontSize: "14px", color: PALETTE.inkSoft, lineHeight: 1.6 }}>
              {p.text}
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* FIELD NOTES — strategic reflection                             */}
      {/* ============================================================ */}
      <SectionLabel text="Field Notes" />
      <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "20px" }}>
        <textarea
          value={customNotes}
          onChange={(e) => saveNotes(e.target.value)}
          placeholder="What's surfacing this week? What's working? What needs to flex?"
          style={{
            width: "100%",
            minHeight: "220px",
            background: "transparent",
            border: "none",
            color: PALETTE.ink,
            fontFamily: "'Iowan Old Style', Georgia, serif",
            fontSize: "15px",
            lineHeight: 1.7,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ fontSize: "10px", color: PALETTE.inkFaint, fontFamily: "monospace", letterSpacing: "1.5px", marginTop: "8px", fontWeight: 600 }}>
          AUTOSAVES · PERSISTS BETWEEN SESSIONS
        </div>
      </div>

      <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: `1px solid ${PALETTE.borderSoft}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: "4px" }}>
            Backup
          </div>
          <div style={{ fontSize: "12px", color: PALETTE.inkMuted, fontStyle: "italic", lineHeight: 1.5 }}>
            Download all cycle data as JSON. Manual insurance before a trip or device swap.
          </div>
          {storageInfo && (
            <div style={{ fontSize: "11px", color: PALETTE.inkFaint, fontFamily: "monospace", marginTop: "5px", letterSpacing: "0.5px" }}>
              {storageInfo.count} keys · ~{storageInfo.kb} KB
            </div>
          )}
        </div>
        <button
          onClick={handleExport}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: "6px",
            padding: "10px 16px",
            color: PALETTE.inkSoft,
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "1.5px",
            fontWeight: 700,
            cursor: "pointer",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          <Download size={13} />
          Export JSON
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PRESENCE CALENDAR — 90-day grid, no streaks, just visibility
// ============================================================

function PresenceCalendar({ presenceDays, togglePresenceDay }) {
  const days = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(CYCLE_START);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const totalMarked = Object.keys(presenceDays).filter(k => presenceDays[k]).length;

  // Group days into weeks of 7 for display
  const weekRows = [];
  for (let i = 0; i < days.length; i += 7) {
    weekRows.push(days.slice(i, i + 7));
  }

  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Sunrise size={14} color={PALETTE.trail} />
            <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600 }}>
              Days I Spent Time
            </div>
          </div>
          <div style={{ fontSize: "12px", color: PALETTE.inkMuted, fontStyle: "italic", maxWidth: "440px", lineHeight: 1.5 }}>
            Tap a day when you've spent time with the Our Daily journal. No streaks. No shame for empty days. Just what's true.
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "28px", color: PALETTE.trailDeep, fontFamily: "monospace", fontWeight: 700, lineHeight: 1 }}>
            {totalMarked}
            <span style={{ fontSize: "16px", color: PALETTE.inkMuted, fontWeight: 500 }}> / 90</span>
          </div>
          <div style={{ fontSize: "10px", color: PALETTE.inkMuted, fontFamily: "monospace", letterSpacing: "1.5px", fontWeight: 600, marginTop: "4px" }}>
            DAYS
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "auto repeat(7, 1fr)", gap: "4px", marginBottom: "6px", maxWidth: "560px" }}>
        <div style={{ width: "32px" }} />
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ fontSize: "9px", color: PALETTE.inkFaint, fontFamily: "monospace", textAlign: "center", letterSpacing: "1px" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gap: "4px", maxWidth: "560px" }}>
        {weekRows.map((row, weekIdx) => (
          <div key={weekIdx} style={{ display: "grid", gridTemplateColumns: "auto repeat(7, 1fr)", gap: "4px", alignItems: "center" }}>
            <div style={{
              fontSize: "9px",
              color: PALETTE.inkFaint,
              fontFamily: "monospace",
              fontWeight: 600,
              width: "32px",
              textAlign: "right",
              paddingRight: "4px",
            }}>
              W{weekIdx + 1}
            </div>
            {/* Pad start of first row to align with day-of-week */}
            {weekIdx === 0 && Array.from({ length: row[0].getDay() }).map((_, padIdx) => (
              <div key={`pad-${padIdx}`} />
            ))}
            {row.slice(weekIdx === 0 ? 0 : 0).map((d, dayIdx) => {
              const dateStr = d.toISOString().split("T")[0];
              const marked = presenceDays[dateStr];
              const isToday = dateStr === todayStr;
              const isFuture = d > new Date() && !isToday;
              const isSunday = d.getDay() === 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => !isFuture && togglePresenceDay(dateStr)}
                  disabled={isFuture}
                  title={`${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}${marked ? " · marked" : ""}`}
                  style={{
                    aspectRatio: "1",
                    minHeight: "28px",
                    border: isToday ? `2px solid ${PALETTE.blaze}` : `1px solid ${marked ? PALETTE.trail : PALETTE.borderSoft}`,
                    background: marked ? PALETTE.trail : isSunday ? PALETTE.bgAlt : PALETTE.card,
                    borderRadius: "4px",
                    cursor: isFuture ? "default" : "pointer",
                    opacity: isFuture ? 0.3 : 1,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: marked ? PALETTE.card : isToday ? PALETTE.blaze : PALETTE.inkFaint,
                    fontWeight: marked || isToday ? 700 : 500,
                    transition: "all 0.15s",
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
        <LegendItem color={PALETTE.trail} label="Marked" filled />
        <LegendItem color={PALETTE.blaze} label="Today" />
        <LegendItem color={PALETTE.bgAlt} label="Sunday" filled bordered />
      </div>

      <div style={{ fontSize: "12px", color: PALETTE.inkSoft, marginTop: "16px", lineHeight: 1.6, fontStyle: "italic", paddingTop: "16px", borderTop: `1px solid ${PALETTE.borderSoft}` }}>
        The pull toward consistency comes from seeing the pattern, not from chasing a streak.
        Empty days are just empty — they don't accuse. Pick it up tomorrow.
      </div>
    </div>
  );
}

function LegendItem({ color, label, filled, bordered }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{
        width: "12px", height: "12px", borderRadius: "3px",
        background: filled ? color : "transparent",
        border: `${bordered || !filled ? "1.5px" : "0"} solid ${color}`,
      }} />
      <span style={{ fontSize: "11px", color: PALETTE.inkMuted, fontFamily: "monospace", letterSpacing: "1px" }}>
        {label}
      </span>
    </div>
  );
}

// ============================================================
// SHARED PRIMITIVES
// ============================================================

function SectionLabel({ text }) {
  return (
    <div style={{
      fontSize: "10px",
      letterSpacing: "3px",
      color: PALETTE.trail,
      textTransform: "uppercase",
      fontFamily: "monospace",
      marginBottom: "14px",
      marginTop: "8px",
      fontWeight: 700,
    }}>
      {text}
    </div>
  );
}

function StatBox({ label, value, hint, accent }) {
  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: "8px",
      padding: "18px 20px",
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: PALETTE.inkMuted, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600, marginBottom: "10px" }}>
        {label}
      </div>
      <div style={{
        fontSize: "26px",
        color: accent || PALETTE.trailDeep,
        fontFamily: "monospace",
        marginBottom: "6px",
        lineHeight: 1,
        fontWeight: 700,
      }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: PALETTE.inkMuted, lineHeight: 1.4 }}>
        {hint}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      borderTop: `1px solid ${PALETTE.border}`,
      padding: "32px 24px",
      textAlign: "center",
      background: PALETTE.bgAlt,
      position: "relative",
      overflow: "hidden",
    }}>
      <MountainBackdrop height={50} opacity={0.5} />
      <div style={{ position: "relative", fontSize: "10px", color: PALETTE.inkMuted, fontFamily: "monospace", letterSpacing: "2px", fontWeight: 600 }}>
        DAVIS · 90 DAYS · APR 28 → JUL 25, 2026
      </div>
    </div>
  );
}
