// UI renderers — pure DOM, no framework.
const LABEL_META = {
  likely_supported:     { text: "Likely supported",     tone: "good" },
  needs_verification:   { text: "Needs verification",   tone: "warn" },
  possibly_misleading:  { text: "Possibly misleading",  tone: "warn" },
  likely_unsupported:   { text: "Likely unsupported",   tone: "bad"  },
  insufficient_context: { text: "Insufficient context", tone: "warn" },
};

const WARNING_TEXT = {
  likely_unsupported: "Likely unsupported",
  needs_verification: "Needs verification",
  possibly_misleading: "Possibly misleading",
  sensational_language: "Sensational language",
  absolute_claim: "Absolute wording",
  too_short: "Very short claim",
};

function toneColor(tone) {
  if (tone === "good") return "#22c55e";
  if (tone === "bad")  return "#ef4444";
  return "#f59e0b";
}

function renderResult(data) {
  const scoreEl = document.getElementById("scoreValue");
  const fillEl  = document.getElementById("scoreFill");
  const chipEl  = document.getElementById("labelChip");
  const warnEl  = document.getElementById("warnings");
  const explEl  = document.getElementById("explanation");
  const evidEl  = document.getElementById("evidence");
  const dbgEl   = document.getElementById("debug");
  const discEl  = document.getElementById("disclaimer");

  const score = Math.max(0, Math.min(100, Number(data.score ?? 0)));
  scoreEl.textContent = score;
  fillEl.style.width = `${score}%`;

  const meta = LABEL_META[data.label] || { text: data.label || "unknown", tone: "warn" };
  fillEl.style.background = toneColor(meta.tone);
  chipEl.className = `chip ${meta.tone}`;
  chipEl.textContent = meta.text;

  warnEl.innerHTML = "";
  (data.warnings || []).forEach((w) => {
    const el = document.createElement("span");
    el.className = "chip";
    el.textContent = WARNING_TEXT[w] || w;
    warnEl.appendChild(el);
  });

  explEl.textContent = data.explanation || "No explanation available.";

  evidEl.innerHTML = "";
  const items = data.evidence || [];
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "No trusted evidence links found for this claim.";
    li.style.color = "#94a3b8";
    evidEl.appendChild(li);
  } else {
    items.slice(0, 3).forEach((e) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = e.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.textContent = e.title || e.url;
      const src = document.createElement("span");
      src.className = "src";
      src.textContent = e.source || new URL(e.url).hostname;
      a.appendChild(src);
      li.appendChild(a);
      evidEl.appendChild(li);
    });
  }

  dbgEl.textContent = JSON.stringify(data.debug ?? {}, null, 2);
  discEl.textContent = data.disclaimer || "Heuristic assistant — verify independently.";
}

window.MisinfoUI = { renderResult };
