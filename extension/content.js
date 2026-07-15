// Content script: exposes the current selection to the popup on demand.
// The popup calls chrome.scripting.executeScript to run getSelection() in
// the active tab, so this file mostly exists to keep a hook for future
// features (page-scan, inline banners, etc.).

window.__misinfoChecker = window.__misinfoChecker || {
  getSelection() {
    const s = window.getSelection?.();
    return s ? String(s).trim() : "";
  },
};
