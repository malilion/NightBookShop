import { assets } from "../data/assets";
import type { PlayableChapterId } from "../data/catalog";

export const chapterImageCacheName = "night-bookshop-chapter-images-v1";

const chapterImages: Record<PlayableChapterId, readonly string[]> = {
  // The first night is installed with the app shell by Workbox.
  jinglan: [],
  boyan: [
    assets.characters.boyan,
    assets.memories.office,
    assets.mobileMemories.office,
    assets.memories.clinic,
    assets.mobileMemories.clinic,
    assets.memories.train,
    assets.mobileMemories.train,
  ],
  ruoyin: [
    assets.characters.ruoyin,
    assets.memories.practiceRoom,
    assets.mobileMemories.practiceRoom,
    assets.memories.backstage,
    assets.mobileMemories.backstage,
    assets.memories.banquet,
    assets.mobileMemories.banquet,
    assets.memories.grandstage,
    assets.mobileMemories.grandstage,
  ],
  yenuan: [
    assets.characters.yenuan,
    assets.memories.bakery,
    assets.mobileMemories.bakery,
    assets.memories.anniversary,
    assets.mobileMemories.anniversary,
    assets.memories.hospitalReturn,
    assets.mobileMemories.hospitalReturn,
    assets.memories.oldOven,
    assets.mobileMemories.oldOven,
  ],
  yuhang: [
    assets.characters.yuhang,
    assets.memories.postOffice,
    assets.mobileMemories.postOffice,
    assets.memories.lastBus,
    assets.mobileMemories.lastBus,
    assets.memories.emptyShop,
    assets.mobileMemories.emptyShop,
    assets.memories.bookshopDoor,
    assets.mobileMemories.bookshopDoor,
  ],
  haiming: [
    assets.characters.haiming,
    assets.characters.owner,
    assets.characters.linchengChild,
    assets.memories.lighthouse,
    assets.mobileMemories.lighthouse,
    assets.memories.summerVisit,
    assets.mobileMemories.summerVisit,
    assets.memories.lastWatch,
    assets.mobileMemories.lastWatch,
    assets.memories.whiteRoom,
    assets.mobileMemories.whiteRoom,
  ],
  lincheng: [
    assets.characters.owner,
    assets.characters.linchengChild,
    assets.memories.hiddenRoom,
    assets.mobileMemories.hiddenRoom,
    assets.memories.childHome,
    assets.mobileMemories.childHome,
    assets.memories.childBookshop,
    assets.mobileMemories.childBookshop,
  ],
};

export async function cacheChapterImages(chapter: PlayableChapterId) {
  const urls = chapterImages[chapter];
  if (!urls.length) return { cached: 0, total: 0 };
  if (typeof window === "undefined" || !("caches" in window))
    return { cached: 0, total: urls.length };

  let cache: Cache;
  try {
    cache = await caches.open(chapterImageCacheName);
  } catch {
    return { cached: 0, total: urls.length };
  }

  let next = 0;
  let cached = 0;
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++]!;
      try {
        if (await caches.match(url)) {
          cached++;
          continue;
        }
        if (!navigator.onLine) continue;
        const response = await fetch(url);
        if (!response.ok) continue;
        await cache.put(url, response.clone());
        cached++;
      } catch {
        // A partial pack can be retried the next time the chapter is opened.
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, urls.length) }, worker));
  return { cached, total: urls.length };
}
