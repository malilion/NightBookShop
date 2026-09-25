import type { StoryFrame } from "../types/game";

export type MemorySection = "school" | "hospital" | "platform" | "office" | "clinic" | "train" | "childhood" | "backstage" | "banquet" | "grandstage" | "dawn-kitchen" | "anniversary" | "hospital-return" | "old-oven" | "old-post-office" | "last-bus" | "empty-shop" | "bookshop-door" | "storm-tower" | "summer-visit" | "last-watch" | "white-room" | "hidden-room" | "child-home" | "hidden-envelope";
export type MemoryObject = {
  label: string;
  choice: string;
};
export type MemoryEvidence = {
  leave: string;
  objects: readonly [MemoryObject, MemoryObject, MemoryObject];
};

export const memoryEvidence: Record<MemorySection, MemoryEvidence> = {
  school: {
    leave: "翻到夾著月亮圖案的那一頁",
    objects: [
      { label: "校刊名單", choice: "查看校刊的編輯名單" },
      { label: "稿紙改字", choice: "辨認稿紙邊緣的改字" },
      { label: "獎學金便條", choice: "讀獎學金通知旁的便條" },
    ],
  },
  hospital: {
    leave: "把病房門口那片信紙收好",
    objects: [
      { label: "病房", choice: "先陪她看看病房裡的人" },
      { label: "繳費單", choice: "拾起長椅旁的繳費單" },
      { label: "公用電話", choice: "查看公用電話下的紙條" },
    ],
  },
  platform: {
    leave: "拾起詩集裡最後一角信紙",
    objects: [
      { label: "長椅紙角", choice: "查看長椅底下的紙角" },
      { label: "末班時刻", choice: "對照票根與末班車的時間" },
      { label: "藍色詩集", choice: "翻開岳川留下的詩集" },
    ],
  },
  office: {
    leave: "收好鍵盤下的信紙，走向候診區",
    objects: [
      { label: "識別證便條", choice: "查看識別證背面的便條" },
      { label: "第一版辭職信", choice: "查看第一版信上重複的道歉" },
      { label: "工作排程", choice: "核對排程上重疊的三份工作" },
    ],
  },
  clinic: {
    leave: "把第三封信攤平，走向列車",
    objects: [
      { label: "檢查單", choice: "看檢查單" },
      { label: "胃藥袋", choice: "看公事包裡的胃藥" },
      { label: "過號的號碼牌", choice: "翻看過號的號碼牌" },
    ],
  },
  train: {
    leave: "拾起車窗旁的信紙，回到書店",
    objects: [
      { label: "工作通知", choice: "查看手機上亮起的工作通知" },
      { label: "舊草稿日期", choice: "對照票根與最早草稿的日期" },
      { label: "列車路線圖", choice: "查看沒有出口的路線圖" },
    ],
  },
  childhood: {
    leave: "從譜架下拾起第一片信紙",
    objects: [
      { label: "雨聲與空拍", choice: "聽窗邊的雨聲與她的最後一拍" },
      { label: "隔年的獎狀", choice: "查看講台上隔年的獎狀" },
      { label: "第一頁樂譜", choice: "翻看畫著雨點的第一頁樂譜" },
    ],
  },
  backstage: {
    leave: "從鏡框背後收起第二片信紙",
    objects: [
      { label: "評審講評", choice: "讀評審講評，分清曲子與那次失常" },
      { label: "季晴的舊票", choice: "看季晴留在化妝桌上的舊票" },
      { label: "護手繃帶", choice: "查看壓在桌下的護手繃帶" },
    ],
  },
  banquet: {
    leave: "把節目單背面的第三片信紙收好",
    objects: [
      { label: "企業節目單", choice: "翻看琴盒裡的企業尾牙節目單" },
      { label: "門邊的聽眾", choice: "問門邊那位清潔人員有沒有聽完" },
      { label: "演出時程", choice: "核對桌上被改過的演出時程" },
    ],
  },
  grandstage: {
    leave: "帶著琴盒回書店，拼起信的兩面",
    objects: [
      { label: "第一排空椅", choice: "陪她坐下，看看第一排的空椅子" },
      { label: "最後一頁樂譜", choice: "翻開一直回到開頭的最後一頁" },
      { label: "側門的燈光", choice: "查看側門透進的那道燈光" },
    ],
  },
  "dawn-kitchen": {
    leave: "從麵粉袋下收起第一片食譜",
    objects: [
      { label: "第一顆麵包", choice: "請葉暖說說第一顆麵包最後如何" },
      { label: "代送郵戳", choice: "翻看食譜卡背面的代送郵戳" },
      { label: "兩只茶杯", choice: "查看桌上兩只不同大小的杯子" },
    ],
  },
  anniversary: {
    leave: "收起活動傳單裡的第二片紙",
    objects: [
      { label: "週年招牌", choice: "查看母女一起畫的週年招牌" },
      { label: "未接來電", choice: "查看收銀台旁反覆亮起的手機" },
      { label: "活動帳本", choice: "翻看活動帳本裡的備料欄" },
    ],
  },
  "hospital-return": {
    leave: "帶著尚未回答的問題走向老烤箱",
    objects: [
      { label: "母親的語音", choice: "問葉暖是否願意播放母親的語音" },
      { label: "掛號紙", choice: "查看長椅背上的掛號紙" },
      { label: "麵包紙袋", choice: "打開長椅下裝麵包的紙袋" },
    ],
  },
  "old-oven": {
    leave: "將第三片食譜收好，回書店",
    objects: [
      { label: "二次發酵", choice: "陪她看見被劃掉的二次發酵" },
      { label: "生日蠟燭", choice: "查看烤箱旁未拆封的生日蠟燭" },
      { label: "食譜紙角", choice: "掀起被油漬黏住的食譜紙角" },
    ],
  },
  "old-post-office": {
    leave: "從郵戳後收起第一片信紙",
    objects: [
      { label: "旅行書店明信片", choice: "翻看妹妹畫了書車的明信片" },
      { label: "七年前的郵戳", choice: "辨認明信片上的舊郵戳" },
      { label: "派送簿", choice: "查看郵局門前的派送簿" },
    ],
  },
  "last-bus": {
    leave: "從假單裡收起第二片信紙",
    objects: [
      { label: "取消的假單", choice: "核對七年間被取消的休假單" },
      { label: "海邊車票", choice: "拾起沒有兌換的海邊車票" },
      { label: "末班站名", choice: "查看車窗上重疊的末班站名" },
    ],
  },
  "empty-shop": {
    leave: "從門縫裡收起第三片信紙",
    objects: [
      { label: "過期租約", choice: "核對過期租約與背面的簽名" },
      { label: "未用的鑰匙", choice: "讓他試試那把沒有用過的鑰匙" },
      { label: "兩個書架", choice: "看看兩個空書架原本要放什麼" },
    ],
  },
  "bookshop-door": {
    leave: "從印章底部收起最後一片紙",
    objects: [
      { label: "燈塔照片", choice: "看妹妹寄回的北岸燈塔照片" },
      { label: "簽收印章", choice: "翻開簽收印章鬆動的底座" },
      { label: "變動地址", choice: "對照門牌與信封上變動的地址" },
    ],
  },
  "storm-tower": {
    leave: "從救援圖旁收起第一角紙船",
    objects: [
      { label: "救援紀錄", choice: "讀救援紀錄旁的塗改" },
      { label: "出生時刻", choice: "辨認顧川補寫的出生時刻" },
      { label: "潮汐圖", choice: "對照潮汐圖與救援信號" },
    ],
  },
  "summer-visit": {
    leave: "從風箏尾巴收起第二角紙船",
    objects: [
      { label: "顧川的風箏", choice: "查看顧川自己做的風箏" },
      { label: "修燈工具", choice: "看修了一整天的燈具" },
      { label: "午餐紙袋", choice: "翻開顧川留下的午餐紙袋" },
    ],
  },
  "last-watch": {
    leave: "從邀請背面收起第三角紙船",
    objects: [
      { label: "婚禮邀請", choice: "翻開婚禮邀請背面的半句話" },
      { label: "颱風警報", choice: "核對那天的颱風警報" },
      { label: "婚禮照片", choice: "查看婚禮照片裡的空椅子" },
    ],
  },
  "white-room": {
    leave: "從煤油燈內取出最後一角紙船",
    objects: [
      { label: "住址卡", choice: "請他讀一次顧川寫的住址卡" },
      { label: "沒有海的窗", choice: "陪他看沒有海的那扇窗" },
      { label: "壞煤油燈", choice: "查看壞煤油燈的玻璃與燈芯" },
    ],
  },
  "hidden-room": {
    leave: "帶著看到的線索回到櫃台",
    objects: [
      { label: "六格信櫃", choice: "查看六格信櫃" },
      { label: "門框身高線", choice: "摸摸門框上的身高線" },
      { label: "停住的時鐘", choice: "查看停住的時鐘與窗" },
    ],
  },
  "child-home": {
    leave: "從兒時外套裡收起第一片信紙",
    objects: [
      { label: "父親的信", choice: "讀父親信封上沒有寄出的地址" },
      { label: "母親便條", choice: "看當晚母親留下的便條" },
      { label: "兒時外套", choice: "摸摸兒時外套的內袋" },
    ],
  },
  "hidden-envelope": {
    leave: "從高高的櫃台下收起另外兩片信紙",
    objects: [
      { label: "兩個願望", choice: "讀自己當年寫的兩個願望" },
      { label: "童年身高線", choice: "摸摸童年櫃台的身高線" },
      { label: "黑貓腳印", choice: "看黑貓留在紙角的墨色腳印" },
    ],
  },
};

export function memorySection(
  section: StoryFrame["section"],
): MemorySection | null {
  return section in memoryEvidence ? section as MemorySection : null;
}
