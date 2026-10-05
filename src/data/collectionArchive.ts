import type { EndingId, PlayableChapterId } from "./catalog";

interface ChapterArchive {
  sentence: string;
  clue: string;
  recipe: { title: string; text: string };
  afterword: { ending: EndingId; title: string; text: string };
}

export const chapterArchive: Record<PlayableChapterId, ChapterArchive> = {
  jinglan: {
    sentence: "有些信不是為了抵達某個人，而是為了讓寫信的人終於離開原地。",
    clue: "信封背面印著夜行書店五十年前的地址；書店理應從未固定存在。",
    recipe: { title: "靜蘭的桂花烏龍", text: "茶葉三匙，九十度的水，浸泡四十五秒。留一點空間，讓香氣慢慢回來。" },
    afterword: {
      ending: "moonlight",
      title: "一張還沒寫的明信片",
      text: "過了幾個星期，靜蘭把一張空白明信片留在櫃台。她說，這次要等自己真的想寫了，才把它填滿。",
    },
  },
  boyan: {
    sentence: "休息不是完成所有事情後的獎勵，而是讓你仍能成為自己的必要條件。",
    clue: "最早一封辭職信的建立時間，與林澄進書店的月日相同，卻早了七年。",
    recipe: { title: "柏言的洋甘菊蜂蜜茶", text: "洋甘菊三匙，九十度的水，浸泡六十秒。杯裡留一點蜂蜜，也給今晚留一段不被通知打斷的時間。" },
    afterword: {
      ending: "boyan-rest",
      title: "修好的手錶",
      text: "柏言把修好的手錶戴回手上，沒有把它調快。他先去回診，再把下一週的一個下午留白。",
    },
  },
  ruoyin: {
    sentence: "夢想不一定消失，有時只是換了一個能繼續呼吸的形狀。",
    clue: "未完成旋律與書店關門時的八音盒相同；若音說，那是她童年自己寫下的曲子。",
    recipe: { title: "若音的薰衣草伯爵", text: "茶葉三匙，九十度的水，浸泡四十五秒。杯緣留下四個輕輕的音。" },
    afterword: {
      ending: "ruoyin-one",
      title: "留給一個人的安可",
      text: "若音後來又在書店拉了一次最後一小節。那位夜歸的聽眾沒有鼓掌，只在出門前說，今晚的路似乎沒有那麼長了。",
    },
  },
  yenuan: {
    sentence: "記得一個人，不代表必須永遠停在失去他的那一天。",
    clue: "母親的食譜卡印著夜行書店的月亮標誌，日期早於葉暖出生。",
    recipe: { title: "葉暖的焙茶蘋果茶", text: "炭焙焙茶三匙，配一小片蘋果乾。等茶香與烤蘋果的氣味一起舒展。" },
    afterword: {
      ending: "yenuan-share",
      title: "第一片麵包",
      text: "晨麥第一次把加了柚子的麵包放到最前排。葉暖切下第一片，先坐下來吃完自己的早餐。",
    },
  },
  yuhang: {
    sentence: "有些承諾不是要求你照原樣完成，而是提醒你別把自己也留在過去。",
    clue: "藍色信封的郵戳日期來自七年後，中央刻著夜行書店的門牌。",
    recipe: { title: "雨航的薄荷檸檬紅茶", text: "薄荷三匙，用八十度熱水沖開；加檸檬與淡紅茶。先坐下喝一口，再決定下一站。" },
    afterword: {
      ending: "yuhang-today",
      title: "今日的門牌",
      text: "雨航帶著鑰匙走到那間空店面。門還沒打開，他先在窗上貼了今天的日期，寫下可以從哪一步開始。",
    },
  },
  haiming: {
    sentence: "記憶也許會熄滅，但曾被照亮的人，會替那道光記得。",
    clue: "三十年前的燈塔照片裡，海上倒映著書店；岸邊站著與林澄相似的人。",
    recipe: { title: "海明的海鹽焦糖焙茶", text: "炭焙焙茶三匙，配一點海鹽焦糖。讓鹹甜與烘香慢慢留在杯裡。" },
    afterword: {
      ending: "haiming-light",
      title: "沒有改順的字",
      text: "顧川沒有把父親的信改成順暢的傳記。他保留那些顛倒的字句，下次探望時，帶了一張新的白紙。",
    },
  },
  lincheng: {
    sentence: "把自己的故事留在這裡，不表示必須留下來。",
    clue: "六夜留下的水痕、油漬與摺線在書店交會；最後一封信仍由林澄決定是否取回。",
    recipe: { title: "林澄寫給自己的信", text: "六夜的痕跡會在書店相遇；信是否取回、何時讀完，仍由寫信的人自己決定。" },
    afterword: {
      ending: "lincheng-dawn",
      title: "天亮後的空白頁",
      text: "天亮後，林澄在自己的桌上放了一本空白筆記。她不必每天寫，但知道想說話時，可以自己把它打開。",
    },
  },
};

export const collectionAchievements = [
  { id: "first", title: "第一封留下的信", text: "有人在這裡把故事說完了。" },
  { id: "seven", title: "七夜的書架", text: "七個夜晚都有了自己的書籤。" },
  { id: "understanding", title: "讓他們自己決定", text: "七夜都留下最能理解當事人的結局。" },
  { id: "all", title: "每一頁都讀過", text: "二十八種結局都曾被好好讀完。" },
  { id: "crack", title: "沒有說完的版本", text: "收下一枚有裂痕的書籤，也記得那一夜沒能說出口的話。" },
  { id: "golden", title: "共鳴的茶香", text: "一杯剛好的茶，讓書籤染上金色。" },
  { id: "golden-all", title: "六盞金色的燈", text: "六位訪客的書籤都曾因為一杯茶而發光。" },
  { id: "threads", title: "城市的地圖", text: "手記裡的五段關係都已接上。" },
] as const;
export type AchievementId = (typeof collectionAchievements)[number]["id"];

// 每一夜的四種書籤：最能理解當事人的「真相」、一般的「故事」，與留下裂痕的「未完成版本」。
export const crackedEndings = new Set<EndingId>([
  "intervention",
  "boyan-overwork",
  "ruoyin-echo",
  "yenuan-copy",
  "yuhang-unknown",
  "haiming-hero",
  "lincheng-midnight",
]);
export type BookmarkRarity = "truth" | "story" | "crack";
export function bookmarkRarity(id: EndingId): BookmarkRarity {
  if (crackedEndings.has(id)) return "crack";
  return Object.values(chapterArchive).some((chapter) => chapter.afterword.ending === id)
    ? "truth"
    : "story";
}
export const rarityLabel: Record<BookmarkRarity, string> = {
  truth: "真相書籤",
  story: "故事書籤",
  crack: "裂痕書籤",
};
