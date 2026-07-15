# Misinformation Checker — Chrome Extension

Manifest V3 extension. Sends selected text to the backend and renders a
credibility score, warning labels, and 2–3 evidence links.

## Load unpacked

1. Start the backend (see `../backend/README.md`) on `http://127.0.0.1:8000`.
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, choose this folder.
3. On any page: highlight text → right-click **Check with Misinformation Checker**, or click the toolbar icon.

## Configure backend URL

Edit `lib/api.js` and change `API_BASE` to your deployed backend URL when you ship.

## Files

- `manifest.json` — MV3 manifest
- `background.js` — service worker (context menu + message routing)
- `content.js` — selection helper
- `popup/` — popup UI (HTML/CSS/JS)
- `lib/api.js` — fetch wrapper with timeout
- `lib/ui.js` — DOM renderers
- `assets/icon.png` — toolbar icon
