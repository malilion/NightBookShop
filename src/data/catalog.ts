import type { TeaId } from "../types/game";
export const teas: Record<
  TeaId,
  {
    name: string;
    note: string;
    scent: string;
    temperature: number;
    seconds: number;
    match: number;
    color: string;
    family: string;
  }
> = {
  osmanthus: {
    name: "桂花烏龍",
    color: "#c8994e",
    family: "花香烏龍",
    note: "花香輕柔，茶韻回甘。",
    scent: "桂花・懷念",
    temperature: 90,
    seconds: 45,
    match: 100,
  },
  puer: {
    name: "熟普洱",
    color: "#9c6250",
    family: "熟茶",
    note: "沉穩的木香，慢慢暖進心裡。",
    scent: "木香・安定",
    temperature: 95,
    seconds: 60,
    match: 75,
  },
  mint: {
    name: "薄荷茶",
    color: "#91b4a0",
    family: "草本",
    note: "清涼的香氣，使思緒清晰。",
    scent: "薄荷・清醒",
    temperature: 80,
    seconds: 30,
    match: 25,
  },
  jasmine: {
    name: "茉莉綠茶",
    color: "#afbc90",
    family: "窨花綠茶",
    note: "清淡花香，茶湯鮮爽。",
    scent: "茉莉・清新",
    temperature: 80,
    seconds: 30,
    match: 65,
  },
  black: {
    name: "蜜香紅茶",
    color: "#ba774f",
    family: "紅茶",
    note: "熟果與蜜香，茶湯溫潤。",
    scent: "蜜香・溫柔",
    temperature: 90,
    seconds: 45,
    match: 70,
  },
  chamomile: {
    name: "洋甘菊",
    color: "#d1ba75",
    family: "花草",
    note: "淡淡蘋果香，適合慢慢喝。",
    scent: "花草・休息",
    temperature: 90,
    seconds: 60,
    match: 75,
  },
  lavender: {
    name: "薰衣草伯爵",
    color: "#a39bbd",
    family: "調香紅茶",
    note: "佛手柑與花香，尾韻輕柔。",
    scent: "花香・平衡",
    temperature: 90,
    seconds: 45,
    match: 60,
  },
  hojicha: {
    name: "炭焙焙茶",
    color: "#ac9476",
    family: "焙茶",
    note: "穀物與烘焙香，口感厚實。",
    scent: "焙火・安定",
    temperature: 95,
    seconds: 60,
    match: 70,
  },
};
export const chapters = [
  {
    id: "jinglan",
    name: "月下未寄出的信",
    visitor: "周靜蘭",
    theme: "一封遲了五十年的信。",
    available: true,
  },
  {
    id: "boyan",
    name: "明日之前，請讓我停一下",
    visitor: "許柏言",
    theme: "在明日到來以前，歇一歇。",
    available: false,
  },
  {
    id: "ruoyin",
    name: "在最後一個音符之後",
    visitor: "沈若音",
    theme: "還沒寫完的，也是一首曲子。",
    available: false,
  },
  {
    id: "yenuan",
    name: "沒有送到的生日麵包",
    visitor: "葉暖",
    theme: "爐火裡，留著一個人的位置。",
    available: false,
  },
  {
    id: "yuhang",
    name: "收件人是我自己",
    visitor: "程雨航",
    theme: "這一次，請為自己簽收。",
    available: false,
  },
  {
    id: "haiming",
    name: "熄燈以前，請記得海",
    visitor: "顧海明",
    theme: "還有一盞燈，等著回家的人。",
    available: false,
  },
];
export const endings = {
  moonlight: {
    title: "月光抵達之處",
    bookmark: "月台上的桂花",
    note: "她寫了一封信，給年輕的自己。",
    quote: "妳沒有辜負誰，妳只是同時愛著太多人。",
  },
  recipient: {
    title: "遲來的收件人",
    bookmark: "月台上的桂花",
    note: "在她的同意下，信寄往了舊址。",
    quote: "有些信不是為了抵達某個人，而是為了讓寫信的人終於離開原地。",
  },
  unfinished: {
    title: "再等一個夜晚",
    bookmark: "月台上的桂花・未完",
    note: "她將信收回包裡。今晚，還不用決定。",
    quote: "還沒準備好，也可以是一個答案。",
  },
  intervention: {
    title: "替她決定的人",
    bookmark: "月台上的桂花・裂痕",
    note: "信寄出了，有一句話卻留在書店。",
    quote: "這一次，我本來想自己決定。",
  },
} as const;
export type EndingId = keyof typeof endings;
export const letterPieces = [
  {
    id: "address",
    text: "岳川，我不是不願意跟你走。",
    back: "紙角畫著一枚小小的月亮。",
  },
  {
    id: "reason",
    text: "只是那一晚，我也有不能離開的人。",
    back: "淺藍墨水旁，是醫院便箋的水印。",
  },
  {
    id: "wait",
    text: "請不要等我。",
    back: "「請原諒我」是多年後用深色墨水補寫的。",
  },
] as const;

// Brewed liquor is independent of the label / jar accent colour.
export const teaLiquorColors: Record<TeaId, string> = {
  osmanthus: "#d7a958",
  puer: "#9b532b",
  mint: "#b9b773",
  jasmine: "#d1c278",
  black: "#bd792e",
  chamomile: "#e0bf69",
  lavender: "#b77a37",
  hojicha: "#ac7239",
};
