# Zenith — Goal Tracking Adventure

A pixel‑adventure themed goal tracker inspired by Codédex aesthetics. Includes parallax hero, scroll reveals, cursor sparkle, tasks with localStorage, an AI Companion (on‑device heuristic), avatar customization, and a Sync XP system with inactivity‑driven glitch/energy effects.

## Pages
- `index.html` — Home hero with parallax and CTA
- `storyline.html` — Narrative intro
- `app.html` — Main hub: Tasks, Companion, Avatar, Progress
- `sync.html` — XP stats, rank, and Sync Stability with idle‑glitch
- `avatar.html` — Avatar customization (saved to localStorage)

## Run locally
You can open the HTML files directly. For best results, serve with a local web server so navigation and caching behave consistently.

```
# Option 1 (Python 3)
python3 -m http.server 5173

# Then open http://localhost:5173/ in your browser
```

## Notes
- All data is stored in your browser's localStorage under the `goaltrack.v1` key.
- To swap the hero background with your own reference image, replace or update the SVGs in `assets/img/` or set custom CSS background images for `.layer.mountains`, `.layer.hills`, `.layer.ground`.
- The design is mobile‑responsive and mirrors the feel of Codédex while staying original.
