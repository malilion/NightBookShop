import type { RouteDraft } from "../types/game";

type Stop = RouteDraft["stops"][number];

export const deliveryRouteScenes: {
  clue: string;
  prompt: string;
  correctStop: Stop;
  scenes: Record<Stop, string>;
}[] = [
  {
    clue: "郵戳上的舊區碼",
    prompt: "郵戳刻著已停用的區碼。收件地址被雨沖淡，只剩一個「郵」字。",
    correctStop: "post-office",
    scenes: {
      "post-office": "舊區碼對上已拆的郵局。階梯上仍有妹妹畫書車的明信片；那時兩人還在商量第一站去哪裡。",
      "last-bus": "雨痕映出另一種可能：那年他若上了開往海邊的車，會帶著妹妹的明信片先去看海，再決定要不要租店。這趟車沒有發生。",
      "empty-shop": "雨痕映出另一種可能：他若先找房東談那張租約，店門也許會為一張小小的市集桌打開。他當時只把鑰匙放回口袋。",
      "bookshop-door": "雨痕映出另一種可能：他若在這道門前為自己停下，會先打開寫給自己的信，再決定下一件送往哪裡。那晚他仍替別人送完所有信。",
    },
  },
  {
    clue: "長長的雨痕",
    prompt: "第二道雨痕像末班車的路線。派送簿裡，休假申請被一條線又一條線劃掉。",
    correctStop: "last-bus",
    scenes: {
      "post-office": "雨痕映出另一種可能：他若從夜班抽出一天，會回郵局階梯把妹妹的明信片收進防水套，而不是讓它一直夾在派送簿裡。",
      "last-bus": "雨痕對上末班車的路線。車窗映著七年的假單；有些夜班是臨時來的，有些假單是他自己在送出前抽走的。",
      "empty-shop": "雨痕映出另一種可能：他若不接那班夜班，能在空店裡待一個下午，試著替兩個人的書各留一格。門始終沒有在那天下午打開。",
      "bookshop-door": "雨痕映出另一種可能：他若在書店屋簷下等雨停，可以喝完那杯茶再回自己的住處。那晚他又記下別人的地址，繞過了自己那一站。",
    },
  },
  {
    clue: "背面的字跡",
    prompt: "第三個地址用雨航自己的筆跡寫成。那是一間租約早已過期、卻一直沒有開門的店。",
    correctStop: "empty-shop",
    scenes: {
      "post-office": "雨痕映出另一種可能：他若在明信片背面寫下自己的名字，會承認妹妹離開以後，想開店的人仍包括他自己。那一欄一直空著。",
      "last-bus": "雨痕映出另一種可能：他若把親手填好的假單交出去，海邊車票就能在那個冬天被用掉。窗外沒有店，也有他想看的海。",
      "empty-shop": "字跡對上過期租約背面的簽名。妹妹離開後，他仍曾來看這間店；鑰匙留下了，門卻一直沒有打開。",
      "bookshop-door": "雨痕映出另一種可能：他若在門前把自己的地址寫回信封，就能讓這封信有真正的收件人。現在筆仍在他手裡，名字還沒落下。",
    },
  },
];

export function deliveryRouteScene(index: number, stop: Stop) {
  const scene = deliveryRouteScenes[index];
  if (!scene) throw new RangeError(`Unknown route clue: ${index}`);
  return { matchesClue: stop === scene.correctStop, text: scene.scenes[stop] };
}
