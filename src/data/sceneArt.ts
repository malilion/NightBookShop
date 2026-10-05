import { assets } from "./assets";
import type { StoryFrame } from "../types/game";
import type { PlayableChapterId } from "./catalog";
// 桌機背景：遊戲畫面與存檔縮圖共用，讓存檔格顯示當時所在的場景。
export function sceneBackground(
  frame: StoryFrame | null | undefined,
  chapterId: PlayableChapterId,
  openingComplete: boolean,
) {
  if (!frame || !openingComplete || frame.mode === "tea") return assets.scenes.counter;
  if (frame.mode === "ending") return assets.scenes[chapterId];
  if (frame.scene === "memory") {
    if (frame.section === "school") return assets.memories.school;
    if (frame.section === "hospital") return assets.memories.hospital;
    if (frame.section === "platform") return assets.memories.platform;
    if (frame.section === "office") return assets.memories.office;
    if (frame.section === "clinic") return assets.memories.clinic;
    if (frame.section === "train") return assets.memories.train;
    if (frame.section === "hidden-room") return assets.memories.hiddenRoom;
    if (frame.section === "storm-tower") return assets.memories.lighthouse;
    if (frame.section === "summer-visit") return assets.memories.summerVisit;
    if (frame.section === "last-watch") return assets.memories.lastWatch;
    if (frame.section === "white-room") return assets.memories.whiteRoom;
    if (frame.section === "childhood" && chapterId === "ruoyin") return assets.memories.practiceRoom;
    if (frame.section === "backstage") return assets.memories.backstage;
    if (frame.section === "banquet") return assets.memories.banquet;
    if (frame.section === "grandstage") return assets.memories.grandstage;
    if (frame.section === "dawn-kitchen") return assets.memories.bakery;
    if (frame.section === "anniversary") return assets.memories.anniversary;
    if (frame.section === "hospital-return") return assets.memories.hospitalReturn;
    if (frame.section === "old-oven") return assets.memories.oldOven;
    if (frame.section === "old-post-office") return assets.memories.postOffice;
    if (frame.section === "last-bus") return assets.memories.lastBus;
    if (frame.section === "empty-shop") return assets.memories.emptyShop;
    if (frame.section === "bookshop-door") return assets.memories.bookshopDoor;
    if (frame.section === "child-home") return assets.memories.childHome;
    if (frame.section === "hidden-envelope") return assets.memories.childBookshop;
  }
  return assets.scenes[frame.scene];
}
