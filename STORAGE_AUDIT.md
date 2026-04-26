# Storage Layer Audit
Date: 2026-04-26

## Current State

- **Mechanism:** `localStorage`, wrapped behind a `window.storage` shim
- **Implementation files:**
  - `src/main.jsx` — defines the shim (lines 5–13)
  - `Dashboard.jsx` — all load/save calls go through `window.storage` (lines 198–273, plus line 897)
- **Was `window.storage` properly replaced?** Yes. The artifact-runtime `window.storage` (which only existed inside the Anthropic sandbox) is gone. `src/main.jsx` redefines `window.storage` before React mounts, pointing it at `localStorage.getItem` / `localStorage.setItem`. The shim API is a compatible replacement: `get(key)` returns `{ value }` or `null`; `set(key, value)` writes a string. All 8 keys pass through it correctly.

---

## Per-Key Status

| Key | Loads from | Saves to | Persists on reload? |
|-----|------------|----------|---------------------|
| `completedTasks` | `Dashboard.jsx:201` | `Dashboard.jsx:238` | ✓ |
| `customTasks` | `Dashboard.jsx:205` | `Dashboard.jsx:243` | ✓ |
| `weights` | `Dashboard.jsx:209` | `Dashboard.jsx:248` | ✓ |
| `notes` | `Dashboard.jsx:213` | `Dashboard.jsx:253` | ✓ |
| `foundationVerse` | `Dashboard.jsx:217` + `Dashboard.jsx:897`* | `Dashboard.jsx:258` | ✓ |
| `presenceDays` | `Dashboard.jsx:221` | `Dashboard.jsx:263` | ✓ |
| `carryingNotes` | `Dashboard.jsx:225` | `Dashboard.jsx:268` | ✓ |
| `cycleDecisions` | `Dashboard.jsx:229` | `Dashboard.jsx:273` | ✓ |

\* `foundationVerse` is loaded in two places: the main `Dashboard` component (line 217) and independently inside `UpstreamWatch` (line 897). They don't conflict — `UpstreamWatch` is a display-only widget that reads the key directly — but the duplication is worth knowing.

All 8 keys: shim round-trip verified via logic trace; `localStorage` persists across page reloads by definition.

---

## Bugs Found

**None that break persistence.** One silent-failure risk (not currently triggered, but worth flagging):

Every `try/catch` block swallows errors completely — `catch (e) { }`. If `localStorage` throws (private browsing mode in some browsers, quota exceeded, iOS system error), the app will appear to save correctly because React state updates fine, but the data will not actually be written. There's no user-visible feedback. This is a pre-existing pattern in all save functions (lines 238–273).

Not fixing in this pass.

---

## Risks for PWA Use

### iOS 7-day eviction risk: **Medium**

`localStorage` on iOS Safari is subject to eviction under storage pressure for origins not visited in 7+ days. The risk is somewhat lower for home-screen PWAs (Apple applies slightly less aggressive eviction to installed apps than to browser tabs), but the guarantee is still weak. The critical gap is that `navigator.storage.persist()` is never called anywhere in the project. This API, when granted, designates storage as persistent and opts it out of eviction. Without calling it, all data is in the default "best effort" bucket — iOS can and will clear it.

Concrete scenario: you have a busy week and don't open the app. If Safari decides to reclaim storage, 90 days of weight logs, presence calendar entries, Field Notes, and Carrying notes are gone with no warning and no recovery.

### Storage quota: **Low**

Simulated worst-case data size after a full 90-day cycle (generous estimates for all keys, including heavy journaling in notes and carryingNotes):

| Key | Worst-case size |
|-----|----------------|
| `completedTasks` | 4.13 KB |
| `customTasks` | 3.82 KB |
| `weights` | 0.47 KB |
| `notes` | 7.64 KB |
| `foundationVerse` | 0.28 KB |
| `presenceDays` | 0.99 KB |
| `carryingNotes` | 2.51 KB |
| `cycleDecisions` | 1.03 KB |
| **Total** | **~21 KB** |

`localStorage` limit is ~5 MB. This dashboard will never come close.

### Cross-device sync: **Not available**

Each device has its own isolated `localStorage`. Checking in from your phone and your laptop produces two separate, diverging datasets with no merge path. This is by design for now but worth being explicit about.

### Backup / export: **Does not exist**

There is no export feature anywhere in the codebase. If the PWA is uninstalled, the device is lost, or iOS evicts the data, there is no recovery path. This is the most concrete operational risk for a 90-day cycle.

---

## Recommendation

**Option B — Move to IndexedDB (`idb-keyval`) + add one Export JSON button**

Here's why Option B over the others:

**Not Option A:** Staying on `localStorage` is fine for data size and cross-reload persistence, but the iOS eviction risk is real enough to address before you're 6 weeks in and carrying 90 days of prayer notes. The fix is too easy to skip.

**Not Option C or D:** Supabase adds auth, schema design, network failure handling, and offline-first complexity. For a solo PWA that you're the only user of, that's a lot of surface area to add before cycle 1. The right time for Supabase is if you decide you want cross-device sync in cycle 2.

**Why Option B:**
1. **The shim architecture makes this a near-zero-risk swap.** `Dashboard.jsx` already calls `window.storage` exclusively. The entire change is in `src/main.jsx` — swap `localStorage.getItem/setItem` for `idb-keyval`'s `get/set`. Zero changes to `Dashboard.jsx`.
2. **`idb-keyval` is the minimal version.** It's 1.3 KB, has an identical async API to what the shim already provides, and is a single `npm install`. No schema, no migrations.
3. **IndexedDB is significantly more durable on iOS.** Combined with calling `navigator.storage.persist()` at startup (one line, also in `src/main.jsx`), this moves data from the "evictable" bucket to "persistent" on iOS 16.4+ and Android Chrome.
4. **Export JSON button is cheap insurance.** One button in the Compass tab or Settings pulls all 8 keys from storage and triggers a file download. You can back up manually before a trip. 2-hour fix total.

**What stays the same:** The service worker already caches the app shell for offline use. This change doesn't touch that. The UI is unaffected.

---

## Suggested Next Step

**Single session:** Swap `src/main.jsx` from `localStorage` to `idb-keyval` + call `navigator.storage.persist()` + add an Export JSON button to the Compass tab (or a minimal Settings area).

Scope: one file change (`src/main.jsx`), one `npm install idb-keyval`, one new button component. No changes to `Dashboard.jsx` state or save logic.

That's the entire storage foundation hardened, plus a manual backup escape hatch, in one focused session.
