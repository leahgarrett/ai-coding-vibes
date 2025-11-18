# Tower Defense (Vanilla JS / HTML / CSS)

A fast, extensible tower defense game implemented with zero frameworks: just semantic HTML, modern CSS, and modular, standards-based JavaScript.

## Core Goals
- Performance: minimal layout thrashing, requestAnimationFrame game loop, object pooling for entities.
- Extensibility: pluggable tower types, enemy behaviors, levels, and UI panels via well-defined interfaces.
- Maintainability: clear separation of concerns (rendering, state management, input, logic).
- Zero dependencies: easy to audit, easy to extend.

## Architecture Overview
- index.html: static shell; loads a single bootstrap script.
- /css/: BEM-inspired class naming; prefers CSS variables for theming.
- /js/
  - game/engine/: loop, timing, scheduler.
  - game/entities/: towers, projectiles, enemies (each with a factory + base class).
  - game/state/: immutable snapshots for tick evaluation; diff-based rendering.
  - ui/: HUD, build panel, event bindings.
  - util/: math, spatial partitioning (grid / quad-tree), pooling.

## JavaScript Practices
- ES modules; no global namespace pollution.
- Avoid premature abstraction; extract only repeated patterns.
- Prefer pure functions for calculations (range checks, damage formulas).
- Use classes sparingly; favor composition (capabilities: targetSelection, firingPattern, upgradePath).
- Defensive programming: validate configs on load.
- Avoid magic numbers: central constants (tick rate, tile size).
- Event-driven: custom events for tower placed, enemy killed, wave started.
- Memory-conscious: reuse arrays; recycle projectile objects.

## Performance Techniques
- Single animation frame loop controlling update + render phases.
- Spatial partitioning for collision and targeting (grid buckets).
- Batched DOM updates: render layer uses document fragments or canvas.
- Optional canvas for projectile and particle effects.
- Lazy initialization of non-visible UI panels.
- Asset preloading (images, audio) with async registry.

## Extensibility Points
- Register new tower via TowerRegistry.register(config).
- Enemy behaviors injected via strategy objects (pathing, resistance).
- Level definitions: JSON describing waves, map layout, spawn points.
- Upgrades: declarative trees (cost, effect modifiers).
- Theme swapping via CSS variable sets.

## Suggested Folder Structure
```
/assets
  /images
  /audio
/css
/js
  main.js
  /game
  /ui
  /util
```

## Roadmap
- Phase 1: Core loop, basic enemy pathing, single tower.
- Phase 2: Multiple tower types, upgrades, wave scaling.
- Phase 3: Effects layer (canvas), audio feedback.
- Phase 4: Save/load system, difficulty presets.

## Getting Started
1. Open index.html in a modern browser.
2. Place initial tower via UI panel.
3. Start wave; monitor performance stats (optional debug overlay).

## Future Enhancements
- Accessibility: focus states, ARIA landmarks.
- Mobile optimizations: touch input abstraction.
- Replay system: deterministic seed + logged inputs.

## Open Questions / Required Specs For 95% Implementation Confidence
1. Map format: tile grid vs path waypoints; file format (JSON schema?). Need dimensions, coordinate system (top-left origin?).
2. Pathfinding: fixed pre-authored path, or dynamic (A* over grid)? Handling blocked placements?
3. Tower config schema: required fields (id, name, cost, range, damage, rate, targeting strategy, upgrade tree). Validation rules.
4. Enemy attributes: health scaling formula, speed units, resist types (e.g., armor, element), spawn cadence specification.
5. Wave definition: structure (array of {timeOffset, enemyType, count}?); boss waves; pacing curve.
6. Rendering layer decision: pure DOM vs hybrid DOM + canvas (projectiles/particles). If hybrid, layering strategy (z-index / separate canvases).
7. Collision model: circle vs axis-aligned box; precision vs performance tradeoffs.
8. Target selection strategies: nearest, first-in-path, lowest HP, highest threat—extensibility interface.
9. Upgrade system: linear vs branching; stacking rules; cost scaling formula.
10. Resource economy: currencies (gold only? experience?); reward formula for kills and wave completion.
11. Persistence: save format (localStorage key, JSON schema); versioning plan.
12. Audio: required events; preload manifest format.
13. Debug tooling: dev overlay contents (FPS, entity counts, memory pools).
14. Error handling: hard fail vs graceful degrade when asset/tower config invalid.
15. Testing scope: unit (pure functions), integration (game loop ticks), performance benchmarks (target ms per tick).
16. Accessibility requirements: keyboard-only placement flow, color contrast constraints.
17. Mobile: minimum target sizes, gesture mapping (tap to place, pinch to zoom?).
18. Theming: list of CSS variables (colors, sizes, animation durations).
19. Security: sandboxing user-provided level JSON (if any).
20. Internationalization: needed or out of scope.

<!-- Implementation decisions (best guesses to proceed) -->
## Implementation Decisions (Resolved)
- Map: fixed 20x15 tile grid (32px tiles), top-left origin, predefined waypoint path.
- Pathfinding: enemies follow static waypoint list; tower placement disallowed on path tiles.
- Rendering: hybrid (canvas for board + projectiles, DOM for UI).
- Collision: circular distance checks.
- Tower schema: {id,name,cost,range,damage,rateMs,targeting:'nearest',projectileSpeed,upgrade?:[]}.
- Enemy schema: {type,maxHp,speed,payout,resist?:{}}; simple linear wave scaling not needed (easy mode).
- Waves: array of spawn events {timeOffsetMs, enemyType, count}.
- Economy: single currency (gold). StartGold=500, towers cheap.
- Persistence: omitted (future).
- Audio/i18n/security: out of scope for MVP.
- Testing: manual; pure functions isolated (math util).
- Accessibility: keyboard: focus canvas, press 'T' to place tower at hover tile.
- Mobile: basic touch (tap to place).
- Theming: CSS variables --bg, --accent, --danger, --text.
- Victory: after last wave cleared and no active enemies.
- Difficulty: easy (tower damage high, enemy HP low).
<!-- End implementation decisions -->


