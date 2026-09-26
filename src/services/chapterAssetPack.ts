import { assets } from "../data/assets";
import { bookmarkArt } from "../data/bookmarkArt";
import type { PlayableChapterId } from "../data/catalog";

export const chapterImageCacheName = "night-bookshop-chapter-images-v1";

export const chapterImages: Record<PlayableChapterId, readonly string[]> = {
  // The first night is installed with the app shell by Workbox.
  jinglan: [],
  boyan: [
    bookmarkArt["boyan-rest"],
    bookmarkArt["boyan-leave"],
    bookmarkArt["boyan-boundary"],
    bookmarkArt["boyan-overwork"],
    assets.characters.boyan,
    assets.memories.office,
    assets.mobileMemories.office,
    assets.memories.clinic,
    assets.mobileMemories.clinic,
    assets.memories.train,
    assets.mobileMemories.train,
  ],
  ruoyin: [
    bookmarkArt["ruoyin-one"],
    bookmarkArt["ruoyin-stage"],
    bookmarkArt["ruoyin-score"],
    bookmarkArt["ruoyin-echo"],
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
    bookmarkArt["yenuan-share"],
    bookmarkArt["yenuan-reopen"],
    bookmarkArt["yenuan-rest"],
    bookmarkArt["yenuan-copy"],
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
    bookmarkArt["yuhang-today"],
    bookmarkArt["yuhang-future"],
    bookmarkArt["yuhang-past"],
    bookmarkArt["yuhang-unknown"],
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
    bookmarkArt["haiming-light"],
    bookmarkArt["haiming-voice"],
    bookmarkArt["haiming-boat"],
    bookmarkArt["haiming-hero"],
    assets.characters.haiming,
    assets.characters.haimingSearching,
    assets.characters.haimingWarm,
    assets.characters.yuhang,
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
    bookmarkArt["lincheng-dawn"],
    bookmarkArt["lincheng-keeper"],
    bookmarkArt["lincheng-shelf"],
    bookmarkArt["lincheng-midnight"],
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
