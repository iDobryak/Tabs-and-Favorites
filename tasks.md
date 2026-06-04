# Tasks

## Status Legend

- `done` - completed and verified
- `in_progress` - currently in work
- `todo` - planned but not started

## Current Plan

### done

- Review the project structure, manifest, popup UI, and core tab-management logic.
- Identify key improvement areas across architecture, security, reliability, and performance.
- Create and maintain a shared execution plan in `tasks.md` with explicit statuses.
- Fix the `protectPinnedTabs` behavior so code, UX, and documentation match.
- Remove the misleading per-tab checkboxes or implement real manual selection behavior.
- Add error handling around `chrome.tabs.*` and `chrome.windows.*` mutation flows.
- Add confirmation UX for destructive bulk actions.
- Restrict supported URLs to an explicit allowlist such as `http:` and `https:`.
- Reduce repeated URL parsing and repeated option reads during sorting and grouping.

### in_progress

- Split `popup.js` into smaller modules with separate domain, action, and UI responsibilities.

### todo

- Add basic project tooling such as `package.json`, linting, and formatting configuration.
- Add unit tests for URL normalization, grouping, and duplicate detection behavior.
- Update `README.md` so the documented behavior matches the implemented behavior.
