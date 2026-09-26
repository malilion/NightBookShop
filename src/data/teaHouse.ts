import type { PlayableChapterId } from "./catalog";
import type { FlavorAxis } from "./teaFlavor";
import type { IngredientId, TeaId } from "../types/game";

export type WishLevel = "low" | "mid" | "high";
export interface FlavorWish {
  axis: FlavorAxis;
  level: WishLevel;
}
export type OrderRequirement =
  | { kind: "blend" }
  | { kind: "garnish" }
  | { kind: "ingredient"; id: IngredientId }
  | { kind: "boil" }
  | { kind: "recipe"; recipeId?: string };
export interface GuestOrder {
  id: string;
  name: string;
  /** One character pressed into the order ticket's seal. */
  seal: string;
  line: string;
  wishes: FlavorWish[];
  require?: OrderRequirement;
  /** A recipe id or tea id the guest is especially glad to receive. */
  favorite?: string;
  tier: 1 | 2 | 3;
  /** Reactions for three stars, one or two stars, and none. */
  reactions: [string, string, string];
  chapter?: PlayableChapterId;
}
export interface SignatureRecipe {
  id: string;
  name: string;
  teas: TeaId[];
  /** The exact set of ingredients, in any amount, in the pot or the cup. */
  ingredients: IngredientId[];
  hint: string;
  text: string;
}

export const signatureRecipes: SignatureRecipe[] = [
  {
    id: "golden-osmanthus",
    name: "金桂蜜韻",
    teas: ["osmanthus", "black"],
    ingredients: [],
    hint: "桂花，遇見一罐蜜香",
    text: "桂花的清甜被蜜香紅茶托住，像把整個秋天收進一只溫熱的杯子。",
  },
  {
    id: "autumn-puer",
    name: "秋夜陳香",
    teas: ["puer", "osmanthus"],
    ingredients: [],
    hint: "陳年木香裡，開出一朵花",
    text: "普洱的沉穩墊在底下，桂花在上頭輕輕浮著。適合聽一段很長的故事。",
  },
  {
    id: "moonlit-dew",
    name: "月光清露",
    teas: ["jasmine", "mint"],
    ingredients: [],
    hint: "花與涼意，在月光下相遇",
    text: "茉莉與薄荷一起醒來，喝下去像推開一扇夜裡的窗。",
  },
  {
    id: "violet-night",
    name: "紫夜安眠",
    teas: ["chamomile", "lavender"],
    ingredients: [],
    hint: "兩種讓人放下的花",
    text: "洋甘菊的蘋果香疊上薰衣草，連時鐘都會走得慢一點。",
  },
  {
    id: "honey-chamomile",
    name: "安眠蜜菊",
    teas: ["chamomile"],
    ingredients: ["honey"],
    hint: "給一個總在數通知的人",
    text: "柏言那晚的茶。蜂蜜在洋甘菊裡慢慢化開；休息不必等所有事情都完成。",
  },
  {
    id: "after-rain-mint",
    name: "雨後薄荷",
    teas: ["mint"],
    ingredients: ["lemon"],
    hint: "清涼，再擠一點陽光",
    text: "薄荷配一片檸檬，清醒得剛剛好，不會把人推向下一站。",
  },
  {
    id: "postman-mint",
    name: "薄荷檸檬紅茶",
    teas: ["mint", "black"],
    ingredients: ["lemon"],
    hint: "郵差需要的清醒，還要一點暖",
    text: "雨航的茶。薄荷、蜜香紅茶與檸檬；先坐下喝一口，再決定下一站。",
  },
  {
    id: "hearth-apple",
    name: "爐邊蘋果焙",
    teas: ["hojicha"],
    ingredients: ["apple"],
    hint: "麵包店打烊後的爐火",
    text: "葉暖的茶。焙火香裡藏著一片蘋果乾，像母親留在爐邊的位置。",
  },
  {
    id: "lighthouse-caramel",
    name: "燈塔焦糖焙",
    teas: ["hojicha"],
    ingredients: ["caramel"],
    hint: "燈塔廚房的鹹甜",
    text: "海明的茶。海鹽焦糖在焙茶裡化開；燈照船，也照到吃飯的桌子。",
  },
  {
    id: "dusk-lemon",
    name: "黃昏檸檬紅",
    teas: ["black"],
    ingredients: ["lemon"],
    hint: "蜜香紅茶，切一片夕陽",
    text: "蜜香與檸檬一起，把下班路上的黃昏留在杯裡。",
  },
  {
    id: "ember-puer",
    name: "焙火陳韻",
    teas: ["puer", "hojicha"],
    ingredients: [],
    hint: "兩種火候，一樣沉穩",
    text: "普洱的厚與焙茶的香互相扶著，是冬夜裡最耐喝的一壺。",
  },
  {
    id: "jasmine-honey",
    name: "茉莉蜜露",
    teas: ["jasmine"],
    ingredients: ["honey"],
    hint: "清香裡藏著一匙甜",
    text: "茉莉的鮮爽加上蜂蜜，是給考完試的人的小獎勵。",
  },
  {
    id: "earl-sunset",
    name: "伯爵晚霞",
    teas: ["lavender", "black"],
    ingredients: [],
    hint: "佛手柑與蜜香的黃昏",
    text: "薰衣草伯爵混進蜜香紅茶，琥珀色裡帶一點紫。若音說，像普通星期三的傍晚。",
  },
  {
    id: "rose-puer",
    name: "玫瑰陳香",
    teas: ["puer"],
    ingredients: ["rose"],
    hint: "沉穩的木香，別上一朵花",
    text: "熟普洱的厚墊著玫瑰，花香短，得趁它還在時提壺。",
  },
  {
    id: "ginger-hojicha",
    name: "暖薑焙茶",
    teas: ["hojicha"],
    ingredients: ["ginger"],
    hint: "冬夜裡的爐邊",
    text: "薑片要跟焙茶一起慢慢泡，辛暖才會從杯底升上來。",
  },
  {
    id: "milk-black",
    name: "蜜香奶茶",
    teas: ["black"],
    ingredients: ["milk"],
    hint: "紅茶與牛奶，最平凡的溫柔",
    text: "牛奶倒進杯裡，把紅茶的澀收成圓潤。開夜車的人最常點這一杯。",
  },
  {
    id: "night-fog",
    name: "夜霧伯爵",
    teas: ["lavender"],
    ingredients: ["milk", "honey"],
    hint: "伯爵、牛奶與一匙蜜",
    text: "薰衣草伯爵加奶與蜂蜜，都要等茶倒進杯裡再加，才像起霧的夜。",
  },
  {
    id: "cinnamon-apple",
    name: "肉桂蘋果紅茶",
    teas: ["black"],
    ingredients: ["apple", "cinnamon"],
    hint: "秋天烤爐裡的蘋果",
    text: "蘋果乾與肉桂都要和紅茶一起泡夠久，香氣才會暖起來。",
  },
  {
    id: "throat-soother",
    name: "雨夜暖喉茶",
    teas: ["black"],
    ingredients: ["ginger", "honey"],
    hint: "明天還要開口的人",
    text: "薑片放進壺裡泡，蜂蜜等茶入杯再加。歌手說，喉嚨像被圍巾圍住。",
  },
  {
    id: "osmanthus-rose",
    name: "桂花玫瑰露",
    teas: ["osmanthus"],
    ingredients: ["rose"],
    hint: "兩種花，一個秋天",
    text: "桂花與玫瑰一起開，花香最盛只有短短幾秒。",
  },
];

const three = (great: string, good: string, miss: string): [string, string, string] => [great, good, miss];

export const guestOrders: GuestOrder[] = [
  {
    id: "nurse",
    name: "剛下夜班的護理師",
    seal: "護",
    line: "剛交完班。想喝點甜甜的、不要太提神的，等一下才睡得著。",
    wishes: [
      { axis: "sweet", level: "high" },
      { axis: "fresh", level: "low" },
    ],
    tier: 1,
    reactions: three(
      "……好甜。今天第一次覺得肩膀鬆下來了。",
      "謝謝，這杯很暖。回家路上應該不會太累。",
      "嗯，比想像中提神一點。沒關係，我會慢慢喝。",
    ),
  },
  {
    id: "student",
    name: "考前的學生",
    seal: "學",
    line: "明天第一堂就是期末考，腦袋一團亂。可以給我清醒一點的嗎？不要甜的。",
    wishes: [
      { axis: "fresh", level: "high" },
      { axis: "sweet", level: "low" },
    ],
    tier: 1,
    reactions: three(
      "哇，整個人醒過來了。我再讀最後一章就回家睡。",
      "清爽多了。考完再來喝一次！",
      "好像……還是有點想睡。不過謝謝妳陪我熬夜。",
    ),
  },
  {
    id: "birthday",
    name: "過生日的女孩",
    seal: "壽",
    line: "今天是我十八歲生日！想喝甜甜的、有一點花香的茶。",
    wishes: [
      { axis: "sweet", level: "high" },
      { axis: "floral", level: "mid" },
    ],
    tier: 1,
    reactions: three(
      "這是今年收到最好的禮物！我可以拍一張照嗎？",
      "好喝！明年生日也要來這裡。",
      "嗯……我想像的甜再多一點點。還是謝謝妳記得我生日。",
    ),
  },
  {
    id: "librarian",
    name: "喉嚨沙啞的圖書館員",
    seal: "書",
    line: "今天在書庫吹了一整天冷氣，喉嚨有點啞。想要不太甜、帶點清新的茶。",
    wishes: [
      { axis: "fresh", level: "mid" },
      { axis: "sweet", level: "mid" },
    ],
    tier: 1,
    reactions: three(
      "喉嚨一下子舒服了。這杯茶該收進參考書目。",
      "很溫和。明天值班前我會想起它。",
      "有點不太一樣……不過熱熱的，總是好的。",
    ),
  },
  {
    id: "guard",
    name: "值夜的警衛",
    seal: "守",
    line: "整晚都要站崗。給我一杯厚實、耐喝的，不要那種涼涼的。",
    wishes: [
      { axis: "body", level: "high" },
      { axis: "fresh", level: "low" },
    ],
    tier: 1,
    reactions: three(
      "夠味！這杯能陪我撐到天亮。",
      "不錯，喝了身體暖起來了。",
      "有點太淡了，不過我還是會喝完。",
    ),
  },
  {
    id: "traveler",
    name: "想家的旅人",
    seal: "旅",
    line: "離家太久了，突然很想念家門口那棵秋天的桂花樹。",
    wishes: [
      { axis: "floral", level: "high" },
      { axis: "sweet", level: "mid" },
    ],
    favorite: "osmanthus",
    tier: 2,
    reactions: three(
      "……就是這個味道。我好像站在家門口了。",
      "有一點像家裡的香氣。謝謝妳。",
      "嗯，是很好的茶，只是不太像我記得的那棵樹。",
    ),
  },
  {
    id: "writer",
    name: "失眠的作家",
    seal: "文",
    line: "稿子卡在最後一章。想要一杯花香明亮、卻不會太沉的茶，讓心靜下來。",
    wishes: [
      { axis: "floral", level: "high" },
      { axis: "fresh", level: "mid" },
      { axis: "body", level: "mid" },
    ],
    tier: 2,
    reactions: three(
      "我好像知道最後一章要怎麼寫了。",
      "心靜了一點。今晚可以再寫一頁。",
      "味道很特別，但我的腦袋還是很吵。",
    ),
  },
  {
    id: "teacher",
    name: "退休的老師",
    seal: "師",
    line: "年紀大了，喝不了太濃的。清清淡淡、有點花香就好。",
    wishes: [
      { axis: "body", level: "low" },
      { axis: "floral", level: "mid" },
    ],
    tier: 2,
    reactions: three(
      "清爽又溫柔，像以前學生送我的那一罐茶。",
      "剛剛好。年輕人，泡得很用心。",
      "這個對我來說有點重了，我慢慢喝。",
    ),
  },
  {
    id: "barista",
    name: "下班的咖啡師",
    seal: "焙",
    line: "聞了一整天咖啡豆，想喝點有焙火香、但不要太厚重的。",
    wishes: [
      { axis: "roast", level: "high" },
      { axis: "body", level: "mid" },
    ],
    tier: 2,
    reactions: three(
      "烘得真好。我應該跟妳請教火候。",
      "焙香很舒服，比咖啡溫柔。",
      "唔，我以為會有更多焙火的味道。",
    ),
  },
  {
    id: "heartbroken",
    name: "剛分手的上班族",
    seal: "念",
    line: "今天被分手了。不想喝甜的……但想要一點暖、很厚實的東西陪我。",
    wishes: [
      { axis: "sweet", level: "low" },
      { axis: "roast", level: "mid" },
      { axis: "body", level: "high" },
    ],
    tier: 2,
    reactions: three(
      "……謝謝。這杯茶沒有勸我，只是陪著我。",
      "暖一點了。我可以再坐一會兒嗎？",
      "有點太甜了。今天的我喝不下甜的。",
    ),
  },
  {
    id: "runner",
    name: "晨跑前的夜貓子",
    seal: "晨",
    line: "天亮要去河堤跑步，想要清爽、再帶一點甜的。",
    wishes: [
      { axis: "fresh", level: "high" },
      { axis: "sweet", level: "mid" },
    ],
    tier: 2,
    reactions: three(
      "清爽又有精神！今天一定能跑完十公里。",
      "很提神，謝啦。",
      "嗯……好像不是我要的那種清爽。",
    ),
  },
  {
    id: "engineer",
    name: "加班的工程師",
    seal: "工",
    line: "還有三個小時的程式要寫。想要一杯濃一點、但喝起來清爽的茶。",
    wishes: [
      { axis: "body", level: "high" },
      { axis: "fresh", level: "mid" },
    ],
    tier: 2,
    reactions: three(
      "這杯茶比任何提神飲料都有用。Bug 應該會自己投降。",
      "不錯，腦袋清楚了一點。",
      "有點……太溫和了？我再撐一下好了。",
    ),
  },
  {
    id: "rider",
    name: "淋雨的外送騎士",
    seal: "雨",
    line: "外面一直下雨，手都凍僵了。想喝有烤過的香氣、又很厚實的熱茶。",
    wishes: [
      { axis: "roast", level: "high" },
      { axis: "body", level: "high" },
    ],
    tier: 3,
    reactions: three(
      "整個人暖回來了！下一單我騎慢一點。",
      "暖了一些，謝謝妳。",
      "還是有點冷……不過謝謝妳讓我躲一下雨。",
    ),
  },
  {
    id: "vendor",
    name: "收攤的夜市阿姨",
    seal: "攤",
    line: "收攤了，腰好痠。來一杯甜甜的、有焦香的，像小時候的烤番薯。",
    wishes: [
      { axis: "sweet", level: "high" },
      { axis: "roast", level: "high" },
    ],
    tier: 3,
    reactions: three(
      "哎呀，就是這個！阿姨明天多送妳一包烤玉米。",
      "甜甜的不錯，腰都鬆了一點。",
      "少了點焦香啦。不過妹妹妳人真好。",
    ),
  },
  {
    id: "perfumer",
    name: "深夜的調香師",
    seal: "香",
    line: "我想聞見兩種花香疊在一起的樣子。請一定用兩種茶來調。",
    wishes: [{ axis: "floral", level: "high" }],
    require: { kind: "blend" },
    tier: 3,
    reactions: three(
      "前調、中調、尾調，全都在杯子裡。妳是天生的調香師。",
      "兩種香氣都在，只是還能更靠近一點。",
      "嗯，我想要的是兩種花香一起開的樣子。",
    ),
  },
  {
    id: "voyager",
    name: "明天遠行的人",
    seal: "遠",
    line: "明天搭早班船離開這座城市。想要一杯有名字、能記一輩子的特調。",
    wishes: [{ axis: "sweet", level: "mid" }],
    require: { kind: "recipe" },
    tier: 3,
    reactions: three(
      "我會記得這個名字，也記得這間店。",
      "謝謝妳，這杯茶會跟我一起上船。",
      "很好喝……只是我想要一杯有名字的茶。",
    ),
  },
  {
    id: "cat-boy",
    name: "抱著貓的少年",
    seal: "貓",
    line: "貓咪在我懷裡睡著了，我也想睡了。要一杯輕輕的、帶點甜、不涼的花草茶。",
    wishes: [
      { axis: "floral", level: "mid" },
      { axis: "sweet", level: "mid" },
      { axis: "fresh", level: "low" },
      { axis: "body", level: "low" },
    ],
    tier: 3,
    reactions: three(
      "好香……貓咪也聞到了，牠在打呼嚕。",
      "謝謝，這杯很安靜。",
      "有一點太重了，貓咪醒了。",
    ),
  },
  {
    id: "driver",
    name: "開夜車的司機",
    seal: "駕",
    line: "還要開三小時的夜車。來杯奶茶，濃一點、甜一點，別讓我打瞌睡。",
    wishes: [
      { axis: "body", level: "high" },
      { axis: "sweet", level: "high" },
    ],
    require: { kind: "ingredient", id: "milk" },
    favorite: "milk-black",
    tier: 2,
    reactions: three(
      "就是這個！濃、甜、又不苦。今晚的路我不怕了。",
      "奶茶很香，謝謝。我會小心開車。",
      "嗯……少了我想要的那種奶茶味。",
    ),
  },
  {
    id: "child",
    name: "怕苦的小朋友",
    seal: "童",
    line: "我不喜歡苦苦的茶……可以淡淡的、甜甜的嗎？",
    wishes: [
      { axis: "sweet", level: "high" },
      { axis: "body", level: "low" },
    ],
    tier: 2,
    reactions: three(
      "好好喝！一點都不苦，像糖果一樣。",
      "嗯，甜甜的。我可以喝完。",
      "唔……有一點苦苦的。",
    ),
  },
  {
    id: "connoisseur",
    name: "講究水溫的老茶客",
    seal: "老",
    line: "泡烏龍，水要剛好，不能煮老。花香要亮，茶湯別太重。",
    wishes: [
      { axis: "floral", level: "high" },
      { axis: "body", level: "mid" },
    ],
    require: { kind: "boil" },
    favorite: "osmanthus",
    tier: 3,
    reactions: three(
      "水是剛起的魚眼泡，花香一點都沒散。好手藝。",
      "不錯。水再講究一點，就更好了。",
      "水不對，花香就出不來。年輕人，慢慢練。",
    ),
  },
  {
    id: "singer",
    name: "喉嚨沙啞的歌手",
    seal: "歌",
    line: "明天還有演出，喉嚨好痛。想要暖暖的、甜甜的，有薑更好。",
    wishes: [
      { axis: "sweet", level: "high" },
      { axis: "body", level: "high" },
    ],
    require: { kind: "ingredient", id: "ginger" },
    favorite: "throat-soother",
    tier: 3,
    reactions: three(
      "喉嚨像被圍巾圍住了。明天我會唱得很好。",
      "暖多了，謝謝妳。",
      "謝謝……但我想要有薑的那種暖。",
    ),
  },
];

/** Story visitors who come back as regulars once their night is complete. */
export const regularOrders: GuestOrder[] = [
  {
    id: "jinglan",
    chapter: "jinglan",
    name: "周靜蘭",
    seal: "蘭",
    line: "今晚不寄信了。只想再聞一次，窗邊的桂花。",
    wishes: [
      { axis: "floral", level: "high" },
      { axis: "sweet", level: "mid" },
    ],
    favorite: "osmanthus",
    tier: 2,
    reactions: three(
      "就是這個香氣。五十年了，原來它一直在這裡等我。",
      "謝謝妳，林澄。這杯茶很像那年的秋天。",
      "很溫柔的一杯。只是今晚，我更想念桂花。",
    ),
  },
  {
    id: "boyan",
    chapter: "boyan",
    name: "許柏言",
    seal: "柏",
    line: "我今天準時下班了。可以給我那杯……讓人慢下來的茶嗎？",
    wishes: [
      { axis: "sweet", level: "high" },
      { axis: "fresh", level: "low" },
    ],
    favorite: "honey-chamomile",
    tier: 2,
    reactions: three(
      "手機放在口袋裡，今晚一次都沒有響。這杯茶剛剛好。",
      "謝謝。我會把這半小時留給自己。",
      "有點提神……沒關係，我記得要先休息。",
    ),
  },
  {
    id: "ruoyin",
    chapter: "ruoyin",
    name: "沈若音",
    seal: "音",
    line: "今天是個普通的星期三。想喝一杯平衡一點的茶，像一段剛好的旋律。",
    wishes: [
      { axis: "floral", level: "high" },
      { axis: "fresh", level: "mid" },
      { axis: "body", level: "mid" },
    ],
    favorite: "lavender",
    tier: 2,
    reactions: three(
      "杯緣又響了四個音。今晚我想把它們寫下來。",
      "很平衡。謝謝妳，這樣的星期三也很好。",
      "嗯……少了一點點和聲。不過，我還是喜歡這裡。",
    ),
  },
  {
    id: "yenuan",
    chapter: "yenuan",
    name: "葉暖",
    seal: "暖",
    line: "晨麥的第一爐麵包出爐了。想配一杯有爐火香、甜甜的茶。",
    wishes: [
      { axis: "roast", level: "high" },
      { axis: "sweet", level: "mid" },
    ],
    favorite: "hearth-apple",
    tier: 2,
    reactions: three(
      "蘋果和焙火的香氣……媽媽一定也會喜歡。我替她留一口。",
      "謝謝，配麵包剛剛好。",
      "焙火香少了一點。下次我帶麵包來，我們一起試試。",
    ),
  },
  {
    id: "yuhang",
    chapter: "yuhang",
    name: "程雨航",
    seal: "航",
    line: "今天輪休。還是想要那杯讓我清醒的茶，不用加糖。",
    wishes: [
      { axis: "fresh", level: "high" },
      { axis: "sweet", level: "low" },
    ],
    favorite: "postman-mint",
    tier: 2,
    reactions: three(
      "就是這杯。今天我不送信，只想坐著喝完它。",
      "清醒多了。等一下去看看那間店面。",
      "嗯，還是有點昏沉。不過今天不用趕路。",
    ),
  },
  {
    id: "haiming",
    chapter: "haiming",
    name: "顧海明",
    seal: "海",
    line: "小川說下次要一起來。先替我們留一杯鹹甜的，像燈塔的廚房。",
    wishes: [
      { axis: "sweet", level: "high" },
      { axis: "roast", level: "high" },
    ],
    favorite: "lighthouse-caramel",
    tier: 2,
    reactions: three(
      "海風、焦糖、焙火……燈塔的廚房就在這裡。",
      "謝謝。下次，我會帶小川一起來。",
      "味道淡了點。不過燈還亮著，我們還會再來。",
    ),
  },
];

export const teaHouseRanks = [
  { stars: 0, title: "見習茶童" },
  { stars: 12, title: "夜班茶師" },
  { stars: 36, title: "月下茶人" },
  { stars: 72, title: "夜行茶主" },
] as const;

export const nightLength = 5;
