# Mizuki Extensions (Official Sample Repository & Developer Guide)

Official public extension repository and reference content provider implementations for **Mizuki (瑞気)**.  
Mizuki uses an isolated, high-performance QuickJS sandbox to run user-defined media source add-ons and stream providers.

---

## 1. How to Add This Repository in Mizuki

1. Open **Mizuki**.
2. Navigate to **Settings > Extensions** (or during the initial **Setup Wizard**).
3. Click **+ Add Extension**.
4. Paste the official repository URL:
   ```
   https://raw.githubusercontent.com/Sylent-Sys/mizuki-extensions/main/index.json
   ```
5. Click **Install**. The sample extension will be installed immediately.

---

## 2. Available Extensions in This Repository

| Extension | Version | Type | Description | License |
|---|---|---|---|---|
| **Blender Open Movies** | `1.0.0` | `torrent` | Streams legal Creative Commons open-source animated films (*Sintel*, *Tears of Steel*, *Big Buck Bunny*) | CC-BY |

---

## 3. Extension Specification & Developer Guide

Mizuki supports custom third-party media source add-ons executed within an isolated, sandboxed **QuickJS runtime** (`rquickjs`).  
Extensions enable resolving media streams, torrents, magnets, or direct media links.

### A. Repository Index (`index.json`)
A repository hosts an `index.json` manifest listing available add-ons:

```json
[
  {
    "id": "my-media-extension",
    "name": "My Media Provider",
    "version": "1.0.0",
    "description": "Custom media source provider for community releases",
    "author": "Community Developer",
    "icon": "https://example.com/icon.png",
    "type": "torrent",
    "accuracy": "high",
    "media": "sub",
    "nsfw": false,
    "code": "extensions/my-media.js"
  }
]
```

#### Manifest Fields:
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g. `open-blender-movies`). |
| `name` | `string` | Human-readable name displayed in Mizuki UI. |
| `version` | `string` | Semver string (e.g. `1.0.0`). |
| `description`| `string`| Short description of the media source. |
| `author` | `string` | Author name or handle. |
| `icon` | `string` | Square icon URL (PNG/SVG). |
| `type` | `string` | Media protocol: `"torrent"` or `"direct"`. |
| `media` | `string` | Audio/subtitle classification: `"sub"` or `"dub"`. |
| `nsfw` | `boolean`| Whether the content contains 18+ themes. |
| `code` | `string` | Relative or absolute URL to the JavaScript entry point. |

---

## B. JavaScript Provider Implementation (`my-media.js`)

Mizuki executes standard ES Modules or Classes exporting a `single(query, options)` function:

```javascript
/**
 * Media Provider class invoked by Mizuki Core
 */
export default class {
  /**
   * Search and resolve streams for a given media query
   * @param {Object} query - Search parameters
   * @param {Array<string>} query.titles - List of romaji, english, and native titles
   * @param {number} query.episode - Target episode number
   * @param {number} [query.season] - Target season
   * @param {Object} [options] - User-configured extension options
   * @returns {Promise<Array<StreamItem>>}
   */
  async single(query, options = {}) {
    const titles = Array.isArray(query?.titles) ? query.titles : [String(query?.title || query || "")];
    const episode = Number(query?.episode || 1);
    
    // Standard fetch() and URLSearchParams are available in the sandbox:
    // const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(titles[0])}`);
    // const data = await response.json();

    return [
      {
        title: "[ReleaseGroup] Media Title - 01 [1080p HEVC AAC]",
        link: "magnet:?xt=urn:btih:...&dn=...",
        seeders: 42,
        leechers: 8,
        size: 1468006400, // Size in bytes
        type: "episode"
      }
    ];
  }
}
```

#### Return Object (`StreamItem`):
| Property | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Display title / release name (including group & resolution). |
| `link` | `string` | Yes | Magnet URI (`magnet:?xt=urn:btih:...`) or direct stream HTTP URL. |
| `seeders` | `number` | No | Number of active seeders (used for sorting). |
| `leechers` | `number` | No | Number of active leechers. |
| `size` | `number` | No | Size in bytes (e.g. `1468006400`). |
| `type` | `string` | No | `"episode"` or `"movie"`. |
