// Popup controller: wires the UI to the API client and renderers.
/* global MisinfoAPI, MisinfoUI */

const $ = (id) => document.getElementById(id);

const els = {
  claim: $("claim"),
  grabBtn: $("grabSelection"),
  checkBtn: $("checkBtn"),
  inputError: $("inputError"),
  loading: $("loading"),
  error: $("error"),
  errorMsg: $("errorMsg"),
  retryBtn: $("retryBtn"),
  result: $("result"),
};

async function readActiveTabSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return "";
    const [{ result } = {}] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => String(window.getSelection?.() || "").trim(),
    });
    return result || "";
  } catch (err) {
    console.warn("selection read failed", err);
    return "";
  }
}

function showState({ loading = false, error = null, result = null } = {}) {
  els.loading.classList.toggle("hidden", !loading);
  els.error.classList.toggle("hidden", !error);
  els.result.classList.toggle("hidden", !result);
  if (error) els.errorMsg.textContent = error;
  if (result) MisinfoUI.renderResult(result);
}

function validate(text) {
  if (!text) return "Please enter or select some text to check.";
  if (text.length < 8) return "That's too short — try a full claim (8+ chars).";
  if (text.length > 1000) return "Please keep the claim under 1000 characters.";
  return null;
}

async function runCheck() {
  const text = els.claim.value.trim();
  const err = validate(text);
  els.inputError.classList.toggle("hidden", !err);
  els.inputError.textContent = err || "";
  if (err) return;

  els.checkBtn.disabled = true;
  showState({ loading: true });

  try {
    const data = await MisinfoAPI.check(text);
    showState({ result: data });
  } catch (e) {
    showState({ error: e.message || "Something went wrong. Try again." });
  } finally {
    els.checkBtn.disabled = false;
  }
}

els.checkBtn.addEventListener("click", runCheck);
els.retryBtn.addEventListener("click", runCheck);

els.grabBtn.addEventListener("click", async () => {
  const sel = await readActiveTabSelection();
  if (sel) {
    els.claim.value = sel.slice(0, 1000);
  } else {
    els.inputError.textContent = "No text is selected on the page.";
    els.inputError.classList.remove("hidden");
  }
});

// On open: prefill from context-menu selection if present, else from active tab.
(async function init() {
  const { pendingCheck } = await chrome.storage.local.get("pendingCheck");
  if (pendingCheck?.text && Date.now() - pendingCheck.ts < 60_000) {
    els.claim.value = pendingCheck.text.slice(0, 1000);
    await chrome.storage.local.remove("pendingCheck");
    runCheck();
    return;
  }
  const sel = await readActiveTabSelection();
  if (sel) els.claim.value = sel.slice(0, 1000);
})();
