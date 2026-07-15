// Service worker: sets up the right-click "Check with Misinformation Checker"
// menu and forwards the selected text to the popup via chrome.storage.

const MENU_ID = "misinfo-check-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Check with Misinformation Checker",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  const text = (info.selectionText || "").trim();
  if (!text) return;

  // Stash the selection so the popup can pick it up on open.
  await chrome.storage.local.set({ pendingCheck: { text, ts: Date.now() } });

  // Open the popup programmatically where supported.
  try {
    await chrome.action.openPopup();
  } catch {
    // Some Chromium builds disallow programmatic popup opening — the user
    // can click the toolbar icon; the pending selection will still be there.
  }
});

// Simple message bus in case content scripts want to push text directly.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "PING") {
    sendResponse({ ok: true });
    return true;
  }
});
