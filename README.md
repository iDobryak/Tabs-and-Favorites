# Tab Duplicate Cleaner

Chrome extension for reviewing open tabs across all browser windows, finding duplicates, sorting tabs, and redistributing sites into separate windows.

## What it does

- Scans all open `http` and `https` tabs when the popup opens.
- Groups tabs first by site, then by normalized URL.
- Shows the window id for each tab.
- Highlights duplicate tabs and tabs inside Chrome tab groups.
- Removes duplicates globally or within a single site.
- Closes individual tabs or all closable tabs for a site.
- Sorts tabs in the current window.
- Sorts tabs in every open window independently.
- Redistributes sites into newly created windows using a per-window tab limit.
- Stores popup settings in `chrome.storage.local`.
- Supports UI localization for English, Russian, Spanish, French, German, and Chinese.

## Current project structure

```text
tabs/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── lib/
│   ├── groups.js
│   ├── i18n.js
│   ├── settings.js
│   ├── tabActions.js
│   ├── ui.js
│   └── url.js
├── test/
│   ├── groups.test.js
│   ├── i18n.test.js
│   └── url.test.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── LICENSE
├── README.md
├── package.json
└── tasks.md
```

## Installation for development

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Open `chrome://extensions/`.
4. Enable `Developer mode`.
5. Click `Load unpacked`.
6. Select the project directory.

## Usage

1. Open tabs in one or more Chrome windows.
2. Open the extension popup.
3. Review the generated tree:

```text
site
  normalized URL
    tab
```

4. Use the actions in the popup:

| Action                            | Behavior                                                               |
| --------------------------------- | ---------------------------------------------------------------------- |
| `Refresh list`                    | Re-scan all open tabs                                                  |
| `Remove all duplicates`           | Remove all duplicate tabs that are allowed to be removed               |
| `Remove site duplicates`          | Remove duplicates only inside one site                                 |
| `Close site`                      | Close all closable tabs for one site                                   |
| `Sort current window`             | Sort only the active Chrome window                                     |
| `Sort all windows`                | Sort every open Chrome window independently                            |
| `Distribute sites across windows` | Create new windows and move sites into them using the configured limit |
| `Go to`                           | Focus the target window and activate the tab                           |
| `Close`                           | Close one tab if current settings allow it                             |

## How grouping works

### Site grouping

- The top-level key is the hostname without the leading `www.`.
- `www.example.com` and `example.com` are treated as the same site.
- Subdomains stay distinct, so `docs.example.com` and `example.com` are different site groups.
- Site groups are sorted lexicographically by hostname.

### URL normalization

Normalization is performed before duplicate detection and before sort keys are built.

- Only `http:` and `https:` URLs are processed.
- The leading `www.` is removed from the hostname.
- If `Include query parameters` is disabled, the query string is removed.
- If `Include query parameters` is enabled, query parameters are sorted into stable order before comparison.
- If `Include hash fragments` is disabled, the hash part is removed.
- If `Treat /page and /page/ as the same` is enabled, trailing slashes are removed from non-root paths.

Example with default settings:

```text
https://www.example.com/path/?b=2&a=1#x
-> https://example.com/path
```

## Duplicate retention rules

Duplicate selection is deterministic and based on the normalized URL group.

- If pinned tab protection is enabled, pinned tabs are never removed.
- If duplicate removal inside tab groups is disabled, tabs inside Chrome tab groups are never removed.
- If at least one protected tab exists in the duplicate set, every removable copy is deleted and the protected tabs remain.
- If there are no protected tabs, the kept tab is chosen by priority:
  1. tab inside a Chrome tab group;
  2. pinned tab;
  3. lower `windowId`;
  4. lower tab index inside the window.

This means a grouped tab wins over an ungrouped duplicate, and an earlier tab wins only when higher-priority signals are equal.

## Sorting algorithm

### Sort current window

`Sort current window` does not move tabs between windows. It only reorders tabs in the active Chrome window.

- Pinned tabs are fixed in place.
- Tabs inside Chrome tab groups are fixed in place.
- Only unpinned tabs outside groups participate in sorting.
- The extension collects the free indexes currently occupied by those movable tabs.
- The movable tabs are sorted by:
  1. site key;
  2. normalized URL;
  3. title.
- After that, the sorted movable tabs are written back only into the collected free indexes.

Result: grouped and pinned tabs keep their positions, while the normal tabs around them are reordered into a stable site-first order.

### Sort all windows

`Sort all windows` applies the same algorithm to every open Chrome window independently.

- There is no cross-window migration during this action.
- Each window keeps the same set of tabs it had before sorting.
- The extension builds a separate sort plan for each window and executes it sequentially.

## Site distribution across windows

`Distribute sites across windows` is the only action that moves tabs between windows.

- Pinned tabs are excluded from the move when `Do not close or move pinned tabs` is enabled.
- For each site, movable tabs are first collected from all URL groups.
- Tabs inside a site are internally sorted by the same keys used for normal sorting: site, normalized URL, title.
- Sites are processed in the same lexicographic order in which they appear in the popup.
- The numeric field `Tabs per window` is normalized to a positive integer; invalid values fall back to `20`.

Window packing rules:

- If one site has more tabs than the configured limit, that site gets its own window anyway.
- Otherwise, sites are appended to the current target window while the sum stays within the limit.
- When the next site would exceed the limit, the current batch is finalized and a new target window starts.
- For each batch, the first tab is moved by creating a new Chrome window from it, and the remaining tabs are moved into that new window in order.

This packing is greedy and order-preserving. The extension does not attempt bin packing or global optimization.

## Settings

| Setting                               | Default | Effect                                                                |
| ------------------------------------- | ------- | --------------------------------------------------------------------- |
| `Interface language`                  | `Auto`  | Chooses an explicit UI language or resolves it from browser languages |
| `Include query parameters`            | `true`  | Makes `?a=1` and `?a=2` distinct when enabled                         |
| `Include hash fragments`              | `false` | Makes `#a` and `#b` distinct when enabled                             |
| `Treat /page and /page/ as the same`  | `true`  | Normalizes trailing slashes on non-root paths                         |
| `Do not close or move pinned tabs`    | `true`  | Protects pinned tabs from delete and redistribution operations        |
| `Show only sites with duplicates`     | `false` | Filters the popup list, but does not change internal grouping         |
| `Remove duplicates inside tab groups` | `false` | Allows grouped tabs to become deletion candidates                     |
| `Tabs per window`                     | `20`    | Sets the greedy packing limit for redistribution into new windows     |

## Security review

The current implementation is in a good baseline state for a local browser utility.

- The manifest requests only `tabs` and `storage`.
- There is no external network access, remote script loading, analytics, or telemetry code.
- Tab titles, hostnames, and URLs are rendered with `textContent`, which avoids HTML injection in the popup.
- The extension operates only on `http` and `https` tabs and ignores unsupported schemes such as `file:` and `chrome:`.
- Bulk-destructive actions require explicit user confirmation.

Known operational limits:

- The extension can close or move tabs only after the user triggers an action; there is no background automation.
- The popup trusts Chrome tab metadata such as title, URL, `pinned`, and `groupId`, which is acceptable for an extension working entirely inside browser APIs.
- Redistributing tabs creates new windows and does not preserve the original window composition for moved tabs.

## Permissions

`manifest.json` currently uses:

```json
"permissions": ["tabs", "storage"]
```

- `tabs` is required to enumerate tabs, read URLs and titles, activate tabs, close tabs, and move tabs.
- `storage` is required to persist popup settings.

## Development

Useful commands:

```bash
npm test
npm run lint
npm run format:check
```

After editing extension files:

1. Open `chrome://extensions/`.
2. Find `Tab Duplicate Cleaner`.
3. Click reload.
4. Reopen the popup.

## Privacy

The extension processes tab metadata locally in the browser.

- No tab data is sent to external services.
- No user data is stored outside Chrome local extension storage.
- The project does not include tracking, ads, or telemetry.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
