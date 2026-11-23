# Mizuki Extensions (Official Sample Repository & Format v2 Specification)

Official public sample repository and developer guide for the **Mizuki Extension Format v2** contract used by **Mizuki (瑞気)**.
All user-supplied media source extensions execute inside an isolated JavaScript sandbox with strict memory, stack, and timeout limits and zero access to local files or user credentials.

---

## Legal & Compliance Notice

> *"Mizuki is a free-to-use, neutral media player and BitTorrent client. It does not host, provide, index, or distribute any copyrighted media content or torrent metadata out of the box. Users are solely responsible for the content they choose to stream or download."*

---

## 1. How to Add This Repository in Mizuki

1. Open **Mizuki**.
2. Go to **Extensions** (or the **Setup Wizard**).
3. Click **+ Add Extension**.
4. Paste the official public repository URL:
   ```text
   https://raw.githubusercontent.com/Sylent-Sys/mizuki-extensions/main/index.json
   ```
5. Confirm installation to test legal Creative Commons sample streams from the Blender Foundation.

---

## 2. Included Sample Extensions

| Extension | Version | Type | Description | License |
|---|---|---|---|---|
| **Blender Open Movies (Sample)** | `1.1.0` | `torrent` | Creative Commons open animated short films (*Sintel*, *Tears of Steel*, *Big Buck Bunny*) | CC-BY |

---

## 3. Accepted Install Inputs

Mizuki accepts HTTPS URLs in three forms:

1. **Repository Index (`index.json`):** JSON array `[ { ... }, { ... } ]` listing one or more extensions.
2. **Single Extension Manifest (`.json`):** JSON object `{ ... }` describing a single provider.
3. **Standalone Script URL (`.js`):** Direct JavaScript module file (default metadata is inferred from the URL).

---

## 4. Extension Manifest Schema (`index.json`)

Every JSON entry **requires** `"code"`. All other fields and interactive user `"options"` are optional:

```json
[
  {
    "id": "open-blender-movies",
    "name": "Blender Open Movies (Sample)",
    "version": "1.1.0",
    "description": "Official Creative Commons sample extension streaming Blender Foundation open films.",
    "author": "Sylent-Sys",
    "icon": "https://raw.githubusercontent.com/Sylent-Sys/mizuki-extensions/main/assets/icon.png",
    "type": "torrent",
    "accuracy": "high",
    "media": "sub",
    "nsfw": false,
    "update": "https://raw.githubusercontent.com/Sylent-Sys/mizuki-extensions/main/index.json",
    "code": "extensions/blender-movies.js",
    "options": {
      "preferred_quality": {
        "type": "select",
        "description": "Preferred sample video resolution",
        "default": "All",
        "choices": ["All", "4K", "1080p", "720p"]
      }
    }
  }
]
```

### Manifest Fields Reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `code` | `string` | **Yes** | Relative (resolved against the manifest URL) or absolute HTTPS URL to the JS module. |
| `id` | `string` | Recommended | Unique extension ID (defaults to sanitized `name` if omitted). |
| `name` | `string` | Recommended | Display title shown in Mizuki **Extensions**. |
| `version` | `string` | No | Version string (`"1.0.0"` default). |
| `description` | `string` | No | Short plain-text summary of the extension. |
| `author` | `string` | No | Maintainer name or handle. |
| `icon` | `string` | No | **Absolute HTTPS raster image URL (`PNG`, `JPG`, or `WebP`).** Keep icons publicly accessible; never reference private repositories or SVG images. |
| `type` | `string` | No | `"torrent"` (default) or `"direct"` (HTTP / HLS streams). |
| `accuracy` | `string` | No | `"high"` or `"low"` (default `"low"`). |
| `media` | `string` | No | `"sub"` (default) or `"dub"`. |
| `nsfw` | `boolean` | No | Defaults to `false`. Extensions marked `true` install disabled by default. |
| `update` | `string` | No | Optional manifest URL for refreshing metadata/code updates. |
| `options` | `object` | No | User-configurable extension settings rendered in **Extensions > Options**. Supports `{ type, description, default, choices/enum/options }`, shorthand arrays (`select`), or scalar defaults (`string`, `boolean`, `number`). |

---

## 5. JavaScript Module Contract (V2)

### Supported Module Export Forms
1. **ES Module (recommended):** `export default class { ... }`, `export default { ... }`, or `export default async function(query, options) { ... }`.
2. **CommonJS:** `module.exports = ...` or `module.exports.default = ...`.
3. **Classic Global Functions:** `async function single(query, options) { ... }`.

### Entry Point Resolution Order
For each query, Mizuki invokes methods in fallback order:
1. `single(query, options)` — primary episode and general search lookup.
2. `movie(query, options)` — invoked if `single()` returns no items and `query.episode` is unset/null.
3. `batch(query, options)` — invoked if previous calls return no items.

### Runtime Sandbox Globals
Extensions run isolated (64 MiB memory cap, 1 MiB stack cap, 15s per-query timeout, no local filesystem or native module access):
- `fetch(url, init)` (routed through Mizuki's configured Encrypted DNS / DoH client and per-domain session cookies; edge verification responses can trigger an interactive browser session verification prompt in the app)
- `URL`, `URLSearchParams`, `Headers`, `AbortController`, `AbortSignal`, `setTimeout`, `clearTimeout`, `atob`, `btoa`, `console`

### Input `query` Object

```ts
interface ExtensionQuery {
  anilistId: number;
  titles: string[];      // Candidate titles (Romaji, English, Native, synonyms)
  episode?: number;      // Episode number (omitted for movies/specials)
  season: number;        // Inferred season number (defaults to 1)
  resolution?: string;   // Optional requested resolution
  exclusions: string[];  // Excluded keywords
  fetch: typeof fetch;   // Convenience handle to globalThis.fetch
}
```

### Example Direct & Torrent Provider (`my-provider.js`)

```javascript
export default class {
  async single(query, options = {}) {
    const titles = Array.isArray(query?.titles) ? query.titles : [String(query?.title || "")];
    const episode = Number(query?.episode || 1);

    // Example torrent stream result
    return [
      {
        title: `[OpenRelease] ${titles[0]} - ${String(episode).padStart(2, "0")} [1080p HEVC]`,
        link: "magnet:?xt=urn:btih:...&dn=...",
        seeders: 42,
        leechers: 8,
        size: 1468006400,
        type: "episode"
      }
    ];
  }

  async movie(query, options = {}) {
    return [
      {
        title: `${query?.titles?.[0] || "Sample Film"} [1080p HLS]`,
        link: "https://cdn.example.org/stream/master.m3u8",
        type: "movie",
        headers: {
          Referer: "https://player.example.org/"
        },
        subtitles: [
          {
            url: "https://cdn.example.org/subs/en.vtt",
            label: "English",
            lang: "en",
            format: "vtt"
          }
        ]
      }
    ];
  }
}
```

### Return Object (`StreamItem`)

| Property | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | **Yes** | Release or stream title displayed in the source picker. |
| `link` | `string` | **Yes** | Magnet URI (`magnet:?xt=urn:btih:...`) or direct HTTPS video / `.m3u8` URL. |
| `seeders` | `number` | No | Active seeders (torrent results). |
| `leechers` | `number` | No | Active leechers (torrent results). |
| `downloads` | `number` | No | Total download count. |
| `size` | `number` | No | Byte size of the stream/release. |
| `hash` | `string` | No | Hex info-hash (extracted from `magnet:` automatically when omitted). |
| `date` | `string` | No | Release publish date string. |
| `accuracy` | `string` | No | `"high"` or `"low"`. |
| `type` | `string` | No | `"episode"`, `"movie"`, or `"batch"`. |
| `headers` | `object` | V2 Direct | Optional custom HTTP request headers forwarded cleanly during direct playback. |
| `referer` | `string` | V2 Direct | Optional shorthand `Referer` header string. |
| `subtitles` / `tracks` | `array` | V2 Direct | Optional external subtitle tracks: `{ url/file/src, label/title/name, lang/language, format: "ass" \| "vtt" \| "srt" }`. |

---

## 6. Third-Party Compatibility Note

- Mizuki runs self-contained JavaScript modules following **Mizuki Extension Format v2**.
- Community and third-party repositories work cleanly when pasted manually inside **Mizuki > Extensions > + Add Extension**, provided they conform to this schema.
- Binary plugins built for unrelated desktop applications compiled with external toolchains or tied to another app's internal SDK are not supported unless authored as plain JS conforming to this specification.
