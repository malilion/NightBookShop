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
    available: true,
  },
  {
    id: "ruoyin",
    name: "在最後一個音符之後",
    visitor: "沈若音",
    theme: "還沒寫完的，也是一首曲子。",
    available: true,
  },
  {
    id: "yenuan",
    name: "沒有送到的生日麵包",
    visitor: "葉暖",
    theme: "爐火裡，留著一個人的位置。",
    available: true,
  },
  {
    id: "yuhang",
    name: "收件人是我自己",
    visitor: "程雨航",
    theme: "這一次，請為自己簽收。",
    available: true,
  },
  {
    id: "haiming",
    name: "熄燈以前，請記得海",
    visitor: "顧海明",
    theme: "還有一盞燈，等著回家的人。",
    available: true,
  },
  {
    id: "lincheng",
    name: "黎明以前，留下我的故事",
    visitor: "林澄",
    theme: "從櫃台走到訪客席。",
    available: true,
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
  "boyan-rest": {
    title: "明日可以晚一點",
    bookmark: "停在 23:47 的月亮",
    note: "他先請假就醫，再慢慢安排工作。",
    quote: "休息不必等所有事情都完成。",
  },
  "boyan-leave": {
    title: "空白履歷的第一行",
    bookmark: "重新上弦的手錶",
    note: "他確認生活所需後，選擇離開。",
    quote: "下一步可以晚點寫，方向由他自己決定。",
  },
  "boyan-boundary": {
    title: "被聽見的界線",
    bookmark: "沒有寄出的交接表",
    note: "他與主管談清楚責任和人力。",
    quote: "工作可以交接，身體無法交給別人。",
  },
  "boyan-overwork": {
    title: "再撐一下就好",
    bookmark: "未讀通知",
    note: "報告交了出去，求助的話仍未說出口。",
    quote: "被稱讚的那一刻，問題沒有消失。",
  },
  "ruoyin-one": {
    title: "只為一個人演奏",
    bookmark: "最後一小節的星光",
    note: "若音把曲子拉給一位夜歸的人聽。",
    quote: "沒有掌聲，也有人在這三分鐘裡被接住。",
  },
  "ruoyin-stage": {
    title: "寄往有光的舞台",
    bookmark: "觀眾席的票根",
    note: "她給季晴寄了信，也坐進觀眾席。",
    quote: "朋友的光，不必照出我的缺口。",
  },
  "ruoyin-score": {
    title: "另一種樂章",
    bookmark: "交換簿上的音符",
    note: "她開始替平凡人的故事寫旋律。",
    quote: "夢想換了形狀，仍能繼續呼吸。",
  },
  "ruoyin-echo": {
    title: "掌聲的回音",
    bookmark: "反覆的終止線",
    note: "她帶傷參賽，曲子卻仍停在舊的比較裡。",
    quote: "掌聲落下後，空白還在。",
  },
  "yenuan-share": {
    title: "留一口給妳",
    bookmark: "爐火旁的蘋果香",
    note: "葉暖加了自己喜歡的柚子，替母親留下一小片。",
    quote: "記得一個人，不必停在失去的那一天。",
  },
  "yenuan-reopen": {
    title: "明天仍會出爐",
    bookmark: "晨麥的第一爐",
    note: "她保留原配方，重新向常客說起母親。",
    quote: "同樣的味道，也能帶著新的日子繼續。",
  },
  "yenuan-rest": {
    title: "休息中的晨麥",
    bookmark: "暫停營業的小牌",
    note: "她關店一週，第一次允許自己停下來。",
    quote: "休息的日子，不會把愛沖淡。",
  },
  "yenuan-copy": {
    title: "永遠相同的味道",
    bookmark: "不敢改動的食譜",
    note: "麵包和母親做的一樣，她仍害怕任何改變。",
    quote: "把一切做得相同，也留不住那一天。",
  },
  "yuhang-today": {
    title: "今日簽收",
    bookmark: "無法退回的藍色信封",
    note: "雨航請了假，重新查看那間空店面。",
    quote: "承諾可以帶著想念，從今天開始。",
  },
  "yuhang-future": {
    title: "寄往七年後",
    bookmark: "寫下日期的郵戳",
    note: "他留下明確日期與第一步，讓以後的自己能找到。",
    quote: "延期若有日期，就不必再叫作明年。",
  },
  "yuhang-past": {
    title: "退回過去",
    bookmark: "妹妹的紀念盒",
    note: "他告別共同的店，開始尋找自己的新方向。",
    quote: "放下原來的計畫，不等於忘記她。",
  },
  "yuhang-unknown": {
    title: "查無此人",
    bookmark: "反覆出現的藍色信",
    note: "雨航拒絕簽收，郵袋每晚仍出現同一封信。",
    quote: "沒有簽收的那一頁，仍在等他。",
  },
  "haiming-light": {
    title: "燈仍然在這裡",
    bookmark: "霧海中最後一盞燈",
    note: "海明與兒子一起讀下真實、不整齊的信。",
    quote: "我也曾害怕，只是一直不知道怎麼告訴你。",
  },
  "haiming-voice": {
    title: "替記憶留一盞燈",
    bookmark: "會說笑的航海誌",
    note: "日常、恐懼與笑話都留進了聲音航海誌。",
    quote: "記住我說過的笑話，也記住我害怕過。",
  },
  "haiming-boat": {
    title: "讓紙船出海",
    bookmark: "海邊的紙船",
    note: "海明在海邊說出一部分，其餘留白。",
    quote: "沒說完的，也能由我自己決定停在哪裡。",
  },
  "haiming-hero": {
    title: "完美的守塔人",
    bookmark: "無瑕的航海日誌",
    note: "流暢的英雄傳記，仍沒有讓父子真正說話。",
    quote: "他救過很多人，信裡卻沒有我認識的父親。",
  },
  "lincheng-dawn": {
    title: "天亮以後",
    bookmark: "取回的月亮徽章",
    note: "林澄帶著完整而不必完美的記憶，回到自己的生活。",
    quote: "我可以記得那個夜晚，也可以走到今天。",
  },
  "lincheng-keeper": {
    title: "下一任守夜人",
    bookmark: "寫上林澄的門牌",
    note: "她完成自己的故事，自願留下接待後來的人。",
    quote: "今夜留下，是我自己的選擇。",
  },
  "lincheng-shelf": {
    title: "留在書架上的信",
    bookmark: "仍能取回的信封",
    note: "她承認過去存在，保留一些細節，帶著未完的信離開。",
    quote: "不必想起所有細節，我也能繼續生活。",
  },
  "lincheng-midnight": {
    title: "不會天亮的書店",
    bookmark: "停在十二點的鐘",
    note: "她不願坐到訪客席，繼續替別人寫信。",
    quote: "只要還有人來，我就可以不讀自己的那封。",
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
export const boyanLetterPieces = [
  {
    id: "status",
    text: "我目前無法維持原來的工作量。",
    back: "第一版草稿寫滿了道歉。",
  },
  {
    id: "boundary",
    text: "看診與休息以前，我不能再接臨時工作。",
    back: "候診單標著上週三的日期。",
  },
  {
    id: "handoff",
    text: "現有資料已交接，其餘安排需團隊一起決定。",
    back: "第二版只列了別人的待辦。",
  },
  {
    id: "next",
    text: "等身體狀況清楚，再決定接下來怎麼工作。",
    back: "第三版只有一句：我真的很累。",
  },
] as const;
export const ruoyinLetterPieces = [
  {
    id: "greeting",
    text: "季晴，我以為我恨妳走得比我遠。",
    back: "給十歲的若音：妳在雨裡拉琴，沒有一個觀眾。",
  },
  {
    id: "fear",
    text: "後來才知道，我怕看見沒有成為的自己。",
    back: "妳想要的，也許從來不只是最大的舞台。",
  },
  {
    id: "music",
    text: "我還想聽妳把那首曲子拉完。",
    back: "妳想讓孤單的人，在三分鐘裡覺得有人理解。",
  },
] as const;
export const yenuanLetterPieces = [
  {
    id: "flour",
    text: "麵粉揉至不黏手，先讓麵團安靜一會。",
    back: "小暖，麵包要等，人也要。",
  },
  {
    id: "apple",
    text: "蘋果切薄片，拌入一點肉桂。",
    back: "店是我們一起開始的，但妳要把它做成自己的。",
  },
  {
    id: "waiting",
    text: "等待二次發酵，再送進烤箱。",
    back: "哪天做出不一樣的味道，記得留一口給我。",
  },
] as const;
export const yuhangLetterPieces = [
  { id: "tomorrow", text: "如果你又說明年再開始，", back: "這一行每年都換了日期。" },
  { id: "admit", text: "請至少承認，你不是在等更好的時機。", back: "筆跡是雨航自己的。" },
  { id: "without-her", text: "你只是不敢在沒有她的世界裡，", back: "「她」字旁有一滴乾了的雨水。" },
  { id: "begin", text: "完成我們一起想過的旅行書店。", back: "最後一行是今年重新寫的。" },
] as const;
export const haimingLetterPieces = [
  { id: "light", text: "小川，我總說燈不能滅，", back: "原句在「不能」下方重寫兩次。", polished: "小川，我盡責守護燈塔。" },
  { id: "shore", text: "卻沒有看見你也一直在岸上等我。", back: "海明在這一行停筆很久。", polished: "我救助許多船隻平安靠岸。" },
  { id: "return", text: "我救過一些回家的人，卻不知道怎麼回到你身邊。", back: "「回家」兩字有一處墨漬。", polished: "燈塔的紀錄證明我完成了任務。" },
  { id: "remember", text: "如果有一天我不記得你，請不要因此懷疑，我曾經想你。", back: "末行寫得不整齊，卻是他自己的字。", polished: "願你以我的功績為榮。" },
] as const;
export const linchengLetterPieces = [
  { id: "kept", text: "我把那封信藏起來，", back: "童年的字跡很用力。" },
  { id: "afraid", text: "因為我怕他們分開，也怕自己成為原因。", back: "紙角有一個小月亮。" },
  { id: "two-wishes", text: "我想讓他留下，也想讓媽媽走到安全的地方。", back: "兩個願望被圈在同一行。" },
  { id: "embrace", text: "長大後，請不要只記得我藏了信；那晚我也想有人抱抱我。", back: "最後一行沒有寫收件日期。" },
] as const;
export const playableChapters = ["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming", "lincheng"] as const;
export type PlayableChapterId = (typeof playableChapters)[number];
export const nightNames = [
  "第一夜",
  "第二夜",
  "第三夜",
  "第四夜",
  "第五夜",
  "第六夜",
] as const;
export function nightName(chapterId: string) {
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  return nightNames[index] ?? "終章";
}
export const previousChapter: Record<
  PlayableChapterId,
  PlayableChapterId | null
> = {
  jinglan: null,
  boyan: "jinglan",
  ruoyin: "boyan",
  yenuan: "ruoyin",
  yuhang: "yenuan",
  haiming: "yuhang",
  lincheng: "haiming",
};
export const chapterForVersion = (version: string) =>
  version === "lincheng-chapter-1" || version === "lincheng-chapter-2" || version === "lincheng-chapter-3" || version === "lincheng-chapter-4" || version === "lincheng-chapter-5" || version === "lincheng-chapter-6"
    ? "lincheng"
    : version === "haiming-chapter-1" || version === "haiming-chapter-2" || version === "haiming-chapter-3" || version === "haiming-chapter-4" || version === "haiming-chapter-5" || version === "haiming-chapter-6"
    ? "haiming"
    : version === "yuhang-chapter-1" || version === "yuhang-chapter-2" || version === "yuhang-chapter-3" || version === "yuhang-chapter-4" || version === "yuhang-chapter-5" || version === "yuhang-chapter-6"
    ? "yuhang"
    : version === "yenuan-chapter-1" || version === "yenuan-chapter-2" || version === "yenuan-chapter-3" || version === "yenuan-chapter-4"
    ? "yenuan"
    : version === "ruoyin-chapter-1" || version === "ruoyin-chapter-2" || version === "ruoyin-chapter-3" || version === "ruoyin-chapter-4" || version === "ruoyin-chapter-5"
    ? "ruoyin"
    : version === "boyan-chapter-1" || version === "boyan-chapter-2" || version === "boyan-chapter-3" || version === "boyan-chapter-4" || version === "boyan-chapter-5" || version === "boyan-chapter-6" || version === "boyan-chapter-7"
      ? "boyan"
      : "jinglan";
export const chapterForEnding = (ending: EndingId) =>
  ending.startsWith("lincheng-")
    ? "lincheng"
    : ending.startsWith("haiming-")
    ? "haiming"
    : ending.startsWith("yuhang-")
    ? "yuhang"
    : ending.startsWith("yenuan-")
    ? "yenuan"
    : ending.startsWith("ruoyin-")
    ? "ruoyin"
    : ending.startsWith("boyan-")
      ? "boyan"
      : "jinglan";

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
