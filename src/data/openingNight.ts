import { endings, teas, type EndingId, type PlayableChapterId } from "./catalog";
import type { TeaId } from "../types/game";

type OpeningNight = {
  sky: string;
  area: string;
  event: string;
  tea: TeaId;
  teaNote: string;
};

export const openingNights: Record<PlayableChapterId, OpeningNight> = {
  jinglan: {
    sky: "雨停在書店門外，石板路伸進霧裡。座鐘指向十二點十二分。",
    area: "今晚可先查看櫃台、茶架與書架；來客願意時，舊書會打開她的記憶。",
    event: "黑貓守著缺了第一頁的員工手冊，門邊的鑰匙卻只能從外側開鎖。",
    tea: "osmanthus",
    teaNote: "桂花烏龍的香氣和校刊室有關；也可以依訪客當下的需要選別種茶。",
  },
  boyan: {
    sky: "玻璃上有細雨，夜裡的通知聲比門鈴先抵達。",
    area: "今晚可能走進凌晨辦公室、候診區與沒有終點的列車。",
    event: "手冊旁多出一張寫著 23:47 的便箋，墨水像還沒乾。",
    tea: "chamomile",
    teaNote: "洋甘菊可以慢慢冷下來；泡茶不會替人完成工作或就醫。",
  },
  ruoyin: {
    sky: "屋簷滴下最後幾滴雨，書架深處的八音盒只響四個音。",
    area: "今晚可能走進練習室、比賽後台、宴會廳與空舞台。",
    event: "櫃台留著一張沒有署名的節目單，末行的音符還沒畫完。",
    tea: "lavender",
    teaNote: "薰衣草伯爵在架上；客人若想換味道，茶架也有其他選擇。",
  },
  yenuan: {
    sky: "街口飄來麵包香，夜色還未退去。",
    area: "今晚可能走進清晨廚房、週年活動、醫院走廊與舊烤箱。",
    event: "黑貓在門口坐著，鼻尖對準一張邊角焦黃的食譜卡。",
    tea: "hojicha",
    teaNote: "炭焙焙茶有烘烤氣味；架上另有薰衣草伯爵與蜜香紅茶。",
  },
  yuhang: {
    sky: "門外有一條乾的路和一條濕的路，末班車仍未駛過。",
    area: "今晚可能走進老郵局、末班車、空店面與書店門外。",
    event: "郵筒口卡著一張沒有日期的投遞單；黑貓沒有替任何人簽收。",
    tea: "mint",
    teaNote: "薄荷茶能讓人清醒；架上另有洋甘菊與炭焙焙茶。",
  },
  haiming: {
    sky: "窗上留著海霧，遠處亮起一盞不屬於街道的燈。",
    area: "今晚可能走進暴風燈塔、夏日塔頂、最後值班日與白色病房。",
    event: "櫃台擺著一艘紙船，旁邊的燈不亮，船上的字仍清楚。",
    tea: "hojicha",
    teaNote: "炭焙焙茶有燈塔廚房的暖味；茶架另有熟普洱與薄荷。",
  },
  lincheng: {
    sky: "天色比前六夜都淡，書店的鐘卻仍停在午夜。",
    area: "今晚可比對六夜紙背、走進書架後的收藏室，並回到童年的櫃台。",
    event: "訪客席空著，月亮徽章壓在手冊上。這一回，茶杯要放在自己面前。",
    tea: "osmanthus",
    teaNote: "茶架仍有八種茶；林澄可以為自己選一杯，不必沿用任何訪客的偏好。",
  },
};

type VisitorEndingId = Exclude<EndingId, `lincheng-${string}`>;
const endingEchoes: Record<VisitorEndingId, string> = {
  moonlight: "黑貓從書架推下一片桂花紙。靜蘭寫給自己的信已帶走，桌上還留著她親手摺好的書籤。",
  recipient: "信箱旁留著詢問短箋的複寫紙。真正的舊信仍由靜蘭保管，等她自己決定寄出的時候。",
  unfinished: "黑貓把昨夜的椅子拉出半寸。靜蘭帶走了信，這個位置仍可以等她回來。",
  intervention: "杯墊下壓著裂了的桂花書籤。手冊提醒妳：寄信以前，要讓寫信的人親自封口。",
  "boyan-rest": "櫃台的便箋寫著柏言請假與回診的日期。報告還在，他先把看診時間留了下來。",
  "boyan-leave": "一張空白履歷紙被壓在手冊下。柏言沒有寫好下一份工作，卻已替離開做了準備。",
  "boyan-boundary": "交接表上多了一行別人的筆跡。柏言說出的工作界線，終於有人接住。",
  "boyan-overwork": "手冊夾著一張已送出的報告收據，旁邊的回診日期仍空著。黑貓用爪子按住那格空白。",
  "ruoyin-one": "八音盒旁多了一張只寫著一位聽眾的節目單。若音把那三分鐘完整留給了她。",
  "ruoyin-stage": "書架間夾著寄給季晴的信封副本，票根背面寫著若音重新進入觀眾席的日期。",
  "ruoyin-score": "櫃台上的交換簿多了四個音。若音留一封信、換一段旋律，第一頁還能繼續寫。",
  "ruoyin-echo": "一張比賽海報被風吹到門邊，四周都是掌聲的字。黑貓把它翻過去，背面仍空白。",
  "yenuan-share": "麵包籃裡留著一小片帶柚子香的蘋果麵包。葉暖也替母親留了一口。",
  "yenuan-reopen": "晨麥的第一爐出爐時間寫在櫃台紙條上。原配方旁添了葉暖自己的日期。",
  "yenuan-rest": "門邊的小牌寫著晨麥休息一週。黑貓沒有把它翻成『永久停業』。",
  "yenuan-copy": "食譜卡被壓得很平，每一筆都照著舊字描過。葉暖還不敢改動下一行。",
  "yuhang-today": "郵袋少了一封藍色信。雨航請了假，手冊上記著他今天去看空店面的路。",
  "yuhang-future": "一張七年後日期的投遞單夾在手冊裡，下面另寫了今天就能做的第一步。",
  "yuhang-past": "櫃台放著妹妹紀念盒的素描。雨航沒有再把共同的計畫當成唯一能走的路。",
  "yuhang-unknown": "同一封藍色信又出現在郵筒口，簽收欄仍空著。黑貓沒有替雨航補上名字。",
  "haiming-light": "燈塔照片旁添了顧川的字。父子一起讀過那封不整齊的信，沒有把害怕擦掉。",
  "haiming-voice": "櫃台的錄音紙條記著海明說過的笑話，也記著他曾經怕過的事。",
  "haiming-boat": "紙船晾在杯旁。海明說出了能說的一部分，餘下的話沒有被旁人替他補完。",
  "haiming-hero": "航海日誌封面平整得沒有摺痕，顧川的回話卻沒有夾在裡面。",
};

export function openingCounterNote(previousEndingId: EndingId | null) {
  if (!previousEndingId) return "妳把散落的書籤收回手冊。黑貓確認櫃台有一個空位，留給今晚的人。";
  if (previousEndingId in endingEchoes) return endingEchoes[previousEndingId as VisitorEndingId];
  return endings[previousEndingId].note;
}

export function openingTeaNote(chapterId: PlayableChapterId) {
  const night = openingNights[chapterId];
  const stock = Object.values(teas).map((tea) => tea.name).join("、");
  return `茶架備有${stock}。${teas[night.tea].name}放在順手處。${night.teaNote}`;
}
