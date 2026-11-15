/**
 * Blender Open Movies (Official Sample Extension)
 * Streams legal Creative Commons animated films from the Blender Foundation.
 * Compatible with Mizuki QuickJS Sandbox and Hayase extension specs.
 */

export default class {
  async single(query, options = {}) {
    const titles = Array.isArray(query?.titles)
      ? query.titles
      : [String(query?.title || query || "")];
    const searchStr = titles.join(" ").toLowerCase();

    const library = [
      {
        keyword: "sintel",
        title: "[Blender Foundation] Sintel (2010) [1080p HEVC AAC]",
        link: "magnet:?xt=urn:btih:08a8022b258c7c73e97042a08802651297e6b4f4&dn=sintel",
        seeders: 48,
        leechers: 6,
        size: 891289600,
        type: "movie"
      },
      {
        keyword: "tears",
        title: "[Blender Foundation] Tears of Steel (2012) [4K UHD Opus]",
        link: "magnet:?xt=urn:btih:2b2413a1a09be28f3bb1caad8cf62269a8e94a8f&dn=tears-of-steel",
        seeders: 35,
        leechers: 12,
        size: 1468006400,
        type: "movie"
      },
      {
        keyword: "bunny",
        title: "[Blender Foundation] Big Buck Bunny (2008) [720p H.264]",
        link: "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=big-buck-bunny",
        seeders: 92,
        leechers: 14,
        size: 545259520,
        type: "movie"
      }
    ];

    const matched = library.filter((item) => searchStr.includes(item.keyword));
    return matched.length > 0 ? matched : library;
  }
}
