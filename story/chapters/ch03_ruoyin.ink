// 第三夜：沈若音。獨立版本，避免更動前兩夜已保存的 Ink 位置。
VAR trust = 0
VAR understanding = 0
VAR intervention = 0
VAR previous_ending = ""
VAR tea_type = ""
VAR tea_quality = 0
VAR tea_emotional_match = 0
VAR melody_correct = false
VAR letter_completion = 0
VAR letter_understood = false
VAR letter_alternate = false
VAR heard_rain = false
VAR read_injury = false
VAR read_review = false
VAR heard_cleaner = false
VAR read_child_score = false
VAR read_child_award = false
VAR read_backstage_ticket = false
VAR read_backstage_bandage = false
VAR read_banquet_program = false
VAR read_banquet_schedule = false
VAR read_grand_seats = false
VAR read_grand_score = false
VAR read_grand_exit = false
VAR final_bar = ""
VAR final_bar_sincere = false
VAR score_rain = false
VAR score_person = false
VAR score_rest = false
VAR asked_ticket = false
VAR asked_phone = false
VAR asked_labels = false
VAR asked_blank_bar = false
VAR asked_corridor_tree = false
VAR heard_rankings = false
VAR asked_plan_hand = false
VAR left_plan_blanks = false
VAR asked_share_load = false
VAR asked_bow = false
VAR read_child_rosin = false
VAR read_backstage_order = false
VAR read_banquet_chair = false
VAR heard_grand_gap = false
VAR score_own = false
VAR ending_jinglan = ""
VAR told_jinglan_notes = false
VAR lincheng_paused = ""
VAR one_hand = ""
VAR stage_post = ""
VAR score_first = ""
VAR echo_reply = ""
VAR ending_kind = ""
-> arrival

=== arrival ===
一點三十六分。妳正把柏言用過的杯子收好，書架深處傳來四個音，最後一個音總在落下以前被拉回去。 # scene:ruoyin # speaker:旁白 # section:arrival
{
- previous_ending == "boyan-rest":
    柏言寫下的回診日期還夾在手冊裡。琴聲停住時，妳沒有急著請坐在琴旁的人證明自己已經準備好。 # speaker:旁白
- previous_ending == "boyan-leave":
    柏言留下的空白履歷紙被風翻起。坐在琴旁的人看了一眼，問：「沒寫下一步，也能先離開嗎？」妳說可以先停。 # speaker:旁白
- previous_ending == "boyan-boundary":
    交接表多了一行別人的筆跡。琴旁的人看見它，將琴弓從緊握的手裡鬆開一點。 # speaker:旁白
- previous_ending == "boyan-overwork":
    報告送出收據壓著空白回診單。琴旁的人望向那張紙，說自己也很熟悉「再一次就好」這句話。 # speaker:旁白
- else:
    昨夜的杯子還有餘溫。妳將它收好，沒有用上一位客人的答案替今晚的人開口。 # speaker:旁白
}
黑貓沒有往門邊走，反而鑽進無人鋼琴的琴腳。椅旁坐著一個年輕女人，琴弓握在手裡，琴盒卻始終沒有打開。盒角貼著幾張婚禮與餐廳演出的標籤。
一首永遠寫不完的曲子，還算是一首曲子嗎？ # speaker:沈若音
妳說不知道，想先聽她怎麼拉。她笑了一聲，把弓毛往掌心收了一點。
我叫沈若音。原本想來找一根琴弦。這裡的店員，會替人修琴嗎？ # speaker:沈若音
* [先讓她把琴盒放穩，問是哪根弦斷了]
    ~ trust += 1
    她指著細細的第一弦。「昨天婚禮快結束時斷的。我把後半段用另外三根拉完了，沒人發現。」 # clue:broken-string # speaker:沈若音
    -> observe
* [說她能把曲子拉完，已經很厲害]
    她搖頭。「這句話他們也常說。我想知道的是，我還能不能寫。」 # speaker:沈若音
    -> observe
=== observe ===
她摘下琴盒的舊貼紙。底下露出音樂院的徽章，旁邊壓著一張泛黃的比賽票根。左手拇指不自覺地按著虎口。 # scene:ruoyin # speaker:旁白 # section:listening
手機裡收藏了季晴近期演出的頁面，購票欄卻一直空著。季晴曾是她在音樂院最親近的朋友，現在每張海報上都有她的名字。
琴盒的提把纏過兩圈膠帶，邊角磨出了木色。若音說這只盒子跟了她很多年，搬過幾次家，換過兩條肩帶，裡面那把琴倒是一直沒換。 # speaker:旁白
-> observe_hub
=== observe_hub ===
若音把琴弓橫放在膝上，等妳開口，又像希望妳什麼都別問。 # speaker:旁白
* {not asked_bow} [問她為什麼一直握著琴弓，卻不打開琴盒]
    ~ asked_bow = true
    若音低頭看手裡的弓，像這才發現自己握著它。「習慣。在後台等上場的時候，我都會先把弓拿在手上。手裡有東西，比較不會抖。」 # speaker:沈若音
    「可是琴盒一打開，就好像有人在等我拉。」她把弓換到右手，左手在膝上慢慢張開。「今晚我還不確定，有沒有人在等。」 # speaker:沈若音
    妳說書店裡沒有人在等她拉琴，只有一壺水快要燒開。她聽了，肩膀往下沉了一點。 # speaker:旁白
    -> observe_hub
* {not read_injury} [問她左手是否還痛]
    ~ read_injury = true
    她說天冷時會麻，長時間練琴也會痛。「醫師說得很清楚。我那時只聽見不能照原來的方式練。」 # clue:injury # speaker:沈若音
    她說話時，拇指一直按在虎口同一個位置，按得指甲邊發白。妳把剛溫過的空茶杯先推到她手邊，她看了一眼，用左手握住。 # speaker:旁白
    -> observe_hub
* {not asked_ticket} [問她那張舊票是誰的]
    ~ asked_ticket = true
    她把票翻過來。背面有季晴的字：「等我們一起站上那個舞台。」她說兩人後來真的去過，只是走向了不同的出口。 # clue:concert-ticket # speaker:沈若音
    她用指腹摸過那行字，墨水已經暈開了一點。「她的字一直比我好看。以前交樂理作業，我都偷看她的。」 # speaker:沈若音
    -> observe_hub
* {not asked_phone} [問她收藏了演出頁面，為什麼沒買票]
    ~ asked_phone = true
    若音把手機螢幕朝下蓋在琴盒上。「每一場我都收藏了。開賣那天我會設鬧鐘，鬧鐘響了，我就看著座位圖一格一格變灰。」 # speaker:沈若音
    「我不是買不起。我是怕坐在台下，聽到一半會開始數她換弓的位置，數我會在哪裡拉錯。」她笑了一下，「聽別人的音樂會聽成一場考試，很累。」
    -> observe_hub
* {not asked_labels} [問她琴盒上那些演出標籤]
    ~ asked_labels = true
    ~ trust += 1
    若音用指甲沿著一張標籤的邊緣刮了刮，沒有撕下來。「婚禮、尾牙、飯店大廳、新店開幕。一年大概一百多場。」 # speaker:沈若音
    她說同學聽到會替她惋惜，她就先開玩笑，說自己是全城最會拉〈卡農〉的人。「可是有些場子我很喜歡。有一對新人請我拉他們阿嬤以前唱的歌，我前一晚自己改了三次編曲。」
    她說完停住，像不確定這件事能不能算數。 # speaker:旁白
    -> observe_hub
* {not asked_blank_bar} [看看她樂譜最後那一大片空白]
    ~ asked_blank_bar = true
    未完成的樂譜攤在琴盒蓋上。前面的音符密密麻麻，擦了又寫；最後一小節卻乾乾淨淨，連一個鉛筆點都沒有。 # speaker:旁白
    「那一格我從來沒寫過。」若音說，「每次寫到那裡，我都會回頭去改第一個音。好像只要開頭夠好，結尾就會自己出現。」 # speaker:沈若音
    -> observe_hub
* [先替她泡一杯茶]
    -> tea_start
=== tea_start ===
妳替她找了一張不會碰到琴弓的桌子。茶架上有薰衣草伯爵、桂花烏龍、蜜香紅茶，也有別的茶可以試。 # scene:counter # speaker:旁白 # section:tea
為若音泡一杯茶。她說自己不趕下一場演出，卻還是盯著牆上的鐘。
妳把茶罐推到她能看見的位置，等她自己選一個喜歡的氣味。 # minigame:tea
-> DONE
=== tea_result ===
{
- tea_type == "lavender":
    ~ trust += 2
    薰衣草與佛手柑的氣味升起。若音說小時候，母親會在練琴後的手帕上放一點薰衣草。那不是比賽日，只是普通的星期三。 # scene:ruoyin # speaker:旁白 # section:listening
- tea_type == "osmanthus":
    桂花香使她想起音樂院的走廊。她先報出兩位同學的比賽名次，停了停，才說起走廊窗外那棵樹。 # scene:ruoyin # speaker:旁白 # section:listening
- tea_type == "black":
    她喝了一口紅茶，開始列出新的練習計畫。妳沒有跟著填日期，先問她手現在有沒有痛。 # scene:ruoyin # speaker:旁白 # section:listening
- else:
    她慢慢握住杯子。琴弓還在桌上，暫時不需要立刻拿起來。 # scene:ruoyin # speaker:旁白 # portrait:ruoyin-reflective # section:listening
}
{
- tea_quality >= 90:
    ~ understanding += 1
    若音又聞了一次茶香，想起小學放學的公車。她把剛寫的四個音哼錯，母親沒有糾正，只跟著唱到下車。「那時沒有人替我打分數。」 # clue:bus-hum # speaker:沈若音
- tea_quality >= 70:
    ~ trust += 1
    茶的溫度讓她肯把琴弓擱在一旁。她看著窗外，先說起自己今晚想聽的聲音，而不是下一場演出的曲目。 # speaker:旁白
- tea_quality >= 50:
    -> tea_followup
- else:
    茶有些澀，若音立刻說自己也常把拍子拉錯，像要替杯子接受一次評分。妳請她不用替這杯茶辯護；她才發現，自己連休息時都在等一句「夠好」。 # clue:tea-score # speaker:旁白
}
-> tea_mood
=== tea_followup ===
若音喝了幾口，仍把杯子放在琴盒旁。若想知道她為何一直看時鐘，可以請她多說一句，也可以陪她先聽完杯緣的餘音。 # speaker:旁白
* [問她今晚最怕錯過哪個時刻]
    ~ trust += 1
    「沒有演出要趕。我怕的是停下來以後，連自己喜歡哪個音都認不出來。」她說，這比錯過下一班車更讓她不安。 # clue:tea-breath # speaker:沈若音
    -> tea_mood
* [先陪她聽完杯緣的餘音]
    她沒有立刻答話，只把琴盒推遠一點。「我可以先聽，再決定要不要拉。」 # speaker:沈若音
    -> tea_mood
=== tea_mood ===
{
- tea_type == "osmanthus":
    -> osmanthus_rankings
- tea_type == "black":
    -> black_plan
- else:
    -> tea_aftercare
}
=== osmanthus_rankings ===
她又說起音樂院那年的名次：誰進了決賽，誰拿到交換名額，誰後來簽了經紀公司。每個名字後面都跟著一個數字。 # speaker:旁白
說到窗外那棵樹時，她停了一下，像那是一個不該出現在名單裡的東西。
* [問她，走廊窗外那棵樹是什麼樣子]
    ~ asked_corridor_tree = true
    ~ trust += 1
    「桂花。考試週剛好開花。」若音想了想，「香味會從琴房的窗縫飄進來。我那時候只顧著聽隔壁拉得比我快，忘了自己也會把窗推開一點。」 # speaker:沈若音
    她把杯子轉了半圈。「原來那條走廊，不是只有分數。」 # speaker:沈若音
    -> tea_aftercare
* [陪她把名單念完，不打斷]
    ~ heard_rankings = true
    ~ understanding += 1
    她一路念到最後一個名字，才說出自己的：「第七名。」念完她笑了一下。「從來沒有人問過我第七名的事，只有我自己每年都在問。」 # speaker:沈若音
    妳沒有替那個數字說好話。她把名單念完，第一次聽見它原來那麼短。 # speaker:旁白
    -> tea_aftercare
=== black_plan ===
紅茶讓她坐直了。若音從琴盒側袋拿出筆，在節目單背面寫：每天練六小時、三個月後報名、半年後回到大賽。 # speaker:旁白
她寫得很快，左手一直壓著紙角，沒有握筆。那張計畫裡，沒有一行寫到她的手。
* [看著她壓紙的左手，問她寫計畫時會不會痛]
    ~ asked_plan_hand = true
    ~ trust += 1
    她把左手收到桌下。「寫字就會。」停了一會，她又說：「所以我先寫計畫。寫完，就好像已經練過了一樣。」 # speaker:沈若音
    妳沒有叫她把計畫撕掉。她自己在「六小時」旁邊畫了一個問號。 # speaker:旁白
    -> tea_aftercare
* [陪她把計畫寫完，只在每一行後面留一格空白]
    ~ left_plan_blanks = true
    若音看著那些空格。「這格要寫什麼？」 # speaker:沈若音
    「寫那天的手怎麼樣。」妳說。她握著筆很久，一格也沒填，卻也沒有把它們劃掉。 # speaker:林澄
    -> tea_aftercare
=== tea_aftercare ===
茶匙碰到杯緣，發出四個高低不同的音。若音放下茶杯，低聲說：「那是我小時候寫的開頭。」
妳問她怎麼聽得出來。若音說，學琴的人會把自己寫過的東西記在手指上；就算很多年沒拉，一聽見，指尖還是會先動一下。 # speaker:旁白
她的左手果然在杯邊輕輕點了四下，第四下停在半空。「最後一個音，我一直不確定要落在哪裡。」 # speaker:沈若音
她輕敲杯緣示範了一遍。妳想用四個音回應，最後一個音，先由她自己聽。 # minigame:melody
-> DONE
=== melody_result ===
{
- melody_correct:
    ~ understanding += 1
    她聽完沒有說對或錯，只是把第四個音輕輕接上。那一小節第一次沒有中途停住。 # clue:motif # scene:ruoyin # speaker:旁白 # section:listening
- else:
    旋律與她剛才敲的不一樣。若音又敲了一次，妳說自己沒有記牢，她便放慢速度。 # scene:ruoyin # speaker:旁白 # section:listening
}
這段旋律是妳寫的？ # speaker:林澄
十歲那年。她說。「那時我還不知道，寫完曲子可以拿去參加比賽。」 # speaker:沈若音
「音樂課剛教完五線譜，我回家就把它用掉了。寫在數學作業簿的背面，還被老師沒收過一次。」她說到這裡笑了，像這件事很久沒對人提起。 # speaker:沈若音
* [請她從第一次喜歡演奏的地方說起]
    ~ trust += 1
    若音想了很久，說不是第一次上台，也不是第一次得獎，是一個下雨的下午。 # speaker:旁白
    -> childhood
* [問她為何不把這段曲子寫完]
    她望向書架間的黑暗。「因為後來的我，總想替十歲的我改掉第一個音。」 # speaker:沈若音
    -> childhood
=== childhood ===
書架轉成一間兒時的空教室。午後的雨打在鐵窗上，十歲的若音把譜架推向窗邊，一個人拉給雨聽。 # scene:memory # speaker:旁白 # section:childhood
那時沒有觀眾、沒有評審，她拉錯了兩次，都自己笑了，從頭再來。
教室的桌椅推到牆邊，黑板上還留著值日生的名字。十歲的她穿著過大的制服外套，袖口捲了兩折，拉琴時一直往下滑。 # speaker:旁白
若音站在門口看了很久，沒有走近。「我以為我會記得更清楚。結果最清楚的是這件外套，是表姊穿過的。」 # speaker:沈若音
{
- tea_type == "lavender":
    薰衣草的味道又回到她手邊。若音忽然記起那天回家時，明明沒有演出，她仍把琴盒抱在懷裡，想著明天還要拉給雨聽。這是她第一次因為喜歡聲音本身，盼著再拿起琴。 # clue:first-joy # speaker:沈若音
- else:
    她記得這間教室的窗，卻還想不起那天離開時自己在想什麼。妳們先看看留在屋裡的樂譜。 # speaker:旁白
}
窗邊留著她畫滿雨點的樂譜，講台上有隔年的獎狀，雨聲仍在窗框間拍出一個空位。妳不必依照獎狀的順序看。 # speaker:旁白
-> childhood_hub
=== childhood_hub ===
雨沒有停。若音坐在窗邊，等妳決定先看哪一處。 # speaker:旁白
* {not read_child_rosin} [看看窗台上那塊磨出凹痕的松香]
    ~ read_child_rosin = true
    松香裝在一只舊餅乾盒裡，中間磨出一道深深的凹痕。盒蓋內側用鉛筆寫著日期，一天接著一天，排得歪歪斜斜。 # speaker:旁白
    「我那時以為松香擦越多，聲音就越大。」若音說。「每拉一天，就在盒蓋上寫一天。寫滿了，我又翻過來寫在盒底。」 # speaker:沈若音
    盒底的日期在某一天停住，旁邊沒有寫原因。若音看了一會，說大概是那陣子開始有老師替她記練習時數，她就不再自己寫了。 # speaker:旁白
    -> childhood_hub
* {not heard_rain} [聽窗邊的雨聲與她的最後一拍]
    ~ heard_rain = true
    ~ understanding += 1
    雨聲在第三拍稍稍變小，她便留了一個空位給它。那個停頓，後來一直在曲子裡。 # speaker:旁白
    小若音把弓停在半空，像在等窗外回答。這一拍沒有名字，也不屬於任何比賽。 # speaker:旁白
    -> childhood_hub
* {not read_child_award} [查看講台上隔年的獎狀]
    ~ read_child_award = true
    獎狀是隔年才拿到的。第一頁樂譜右上角的日期，比獎狀早整整一年。 # speaker:旁白
    她記得領獎那天的照片，卻想不起照片之前這間教室裡的笑聲。妳把兩個日期並排記下，沒有替她排出哪一個比較重要。 # speaker:旁白
    -> childhood_hub
* {not read_child_score} [翻看畫著雨點的第一頁樂譜]
    ~ read_child_score = true
    譜紙角落不是老師的評語，而是一排小小的雲。四個音之間留著空格，旁邊寫：「下雨的時候比較像我自己。」 # speaker:旁白
    若音伸手壓住快被風吹走的紙。「我以前會畫這些。」她把那一頁摺好，沒有再說幼稚。 # speaker:沈若音
    -> childhood_hub
* [從譜架下拾起第一片信紙]
    -> childhood_end
=== childhood_end ===
第一片信紙藏在譜架下。正面以「季晴」開頭，背面卻寫給十歲的若音。 # fragment:greeting # speaker:旁白
若音想把信紙摺回去，卻被背面的字留住。「我以前一提到這間教室，就會接著說隔年拿了什麼獎。好像不先說那個，這一天就不算數。」 # speaker:沈若音
{
- heard_rain && read_child_score && read_child_award:
    妳指給她看雲朵旁的日期，又聽見窗邊留下的空拍。她在得獎前便寫了這四個音，也知道何時讓雨聲進來。 # speaker:旁白
- heard_rain && read_child_score:
    妳指給她看譜紙上的雲朵，又聽見窗邊留下的空拍。這四個音最初是寫給雨的，不必靠一張獎狀才能成立。 # speaker:旁白
- heard_rain:
    她試著把那一拍留給雨。即使妳們沒翻到樂譜，她也記得那不是老師教的。 # speaker:旁白
- read_child_score:
    妳讀到「比較像我自己」。她看了很久，才承認那句話比獎狀上的名次更早寫下。 # speaker:旁白
- else:
    妳們沒有看完教室裡的東西。她把那一天先當成一段尚未查清的記憶，不急著替自己下結論。 # speaker:旁白
}
* [問她願不願意說，當年拉完第一遍想做什麼]
    她想了想。「再拉一遍。我那時連譜都沒寫完，就想試試第二遍會不會跟雨聲不一樣。」她笑得很短，沒有立刻拿獎狀來補充。 # speaker:沈若音
    妳問她第二遍有沒有不一樣。「有。雨停了一下，我就跟著停。那是我第一次覺得，曲子可以等別的東西。」 # speaker:沈若音
    -> childhood_depart
* [問她後來為何不願再聽這段開頭]
    她摸到樂譜上的雲。「後來只要我拉這四個音，就有人說：那個拿獎的小孩回來了。我開始害怕下一個音不像她。」 # speaker:沈若音
    妳沒有說那個小孩應該回來，只問她是否還想繼續看下去。她點頭，把信紙翻到背面收好。 # speaker:旁白
    -> childhood_depart
=== childhood_depart ===
她沒有帶走獎狀，只帶走還沒寫完的樂譜。走廊盡頭傳來一聲換場鈴，和當年的雨聲混在一起。 # speaker:旁白
走出教室前，若音回頭看了一眼那扇窗。「那時候，我沒有想過要拉給誰聽。現在想起來，這好像才是最奇怪的地方。」 # speaker:沈若音
妳沒有說那不奇怪，只等她自己把門帶上。 # speaker:旁白
* [走向音樂院的比賽後台]
    -> backstage
=== backstage ===
後台的鏡子把若音的肩膀照得很僵。演出海報上，季晴的照片貼在她的舊號碼旁邊。 # scene:memory # speaker:旁白 # section:backstage
那次比賽她失常，隔年手又受了傷。她說自己最難忘的不是名次，而是賽後季晴來敲門，她卻說了句「別假裝妳懂」。
後台走廊很窄，參賽者抱著琴盒側身讓路，沒有人說話。牆的另一邊有人在調音，同一個音拉了很多次。 # speaker:旁白
「那是季晴。」若音說。「她緊張的時候會一直調音，調到上一位拉完才停。我以前都笑她。那天我沒有笑，我在數她調了幾次。」 # speaker:沈若音
鏡框夾著評審講評，化妝桌上有季晴留下的舊票，最下面壓著練習時用過的護手繃帶。 # speaker:旁白
-> backstage_hub
=== backstage_hub ===
後台的門沒有鎖。若音站在鏡前，等妳把想看的紙放回去。 # speaker:旁白
* {not read_backstage_order} [看貼在鏡子邊的出場順序表]
    ~ read_backstage_order = true
    出場順序表用膠帶貼在鏡角。若音排在第四位，季晴排在第五位；兩個名字中間，有人用原子筆畫了一顆很小的星星。 # speaker:旁白
    「是她畫的。」若音說。「她說排在我後面很好，聽完我拉，她就不緊張了。」她的手指停在那顆星星上。「結果我上台以後，滿腦子只想著她在側台聽。」 # speaker:沈若音
    妳沒有問那顆星星是什麼意思。若音也沒有解釋，只把膠帶翹起的一角按平。 # speaker:旁白
    -> backstage_hub
* {not read_review} [讀評審講評，分清曲子與那次失常]
    ~ read_review = true
    ~ understanding += 1
    講評談到速度與呼吸，沒有一句寫她從此不配演奏。她把那張紙摺了很多次，摺痕剛好蓋住最後一行。 # clue:stage-review # speaker:旁白
    妳把紙攤平，若音看見評審最後寫的「第二段有自己的聲音」。她沒有立刻相信，也沒再把那行摺回去。 # speaker:旁白
    「那天回家，我把這張紙夾進一本不再翻的樂理課本。」若音說。「夾了很多年，搬家時都帶著，就是沒有再打開。」 # speaker:沈若音
    -> backstage_hub
* {not read_backstage_ticket} [看季晴留在化妝桌上的舊票]
    ~ read_backstage_ticket = true
    票背寫著「等我們一起站上那個舞台」。若音說季晴當時來敲門，自己卻回了句「別假裝妳懂」。 # clue:concert-ticket # speaker:沈若音
    她說：「我怕她伸手拉我，而我只能看到她已經站得那麼遠。」說完又把那句改成「那時候我怕」。 # speaker:沈若音
    -> backstage_hub
* {not read_backstage_bandage} [查看壓在桌下的護手繃帶]
    ~ read_backstage_bandage = true
    ~ read_injury = true
    繃帶的標籤寫著復健日期，比比賽晚一年。她知道受傷和那次失常不是同一件事，卻常在心裡把兩者疊成一個理由。 # speaker:旁白
    若音把手掌慢慢張開。「我會問醫師現在適合怎麼練。」這一次，她沒有把疼痛當作必須熬過去的練習。 # clue:injury # speaker:沈若音
    -> backstage_hub
* [從鏡框背後收起第二片信紙]
    -> backstage_end
=== backstage_end ===
鏡框背後卡著第二片。正面寫著「沒有成為的自己」，背面是「不只是最大的舞台」。 # fragment:fear # speaker:旁白
若音把信紙壓在票背，不肯立刻念出季晴的名字。「如果我當時不說那句話，她會不會以為我只是在嫉妒？」 # speaker:沈若音
{
- read_review && read_backstage_ticket:
    妳把沒有摺住的講評和季晴留下的票放在一起。一張記錄當晚的演奏，一張記錄她們曾約好同行；沒有一張紙能替季晴說出她那天在門外等了多久。 # speaker:旁白
- read_backstage_bandage:
    她看著復健日期。「我一直把比賽、受傷、我們吵架排成同一天。這樣就不用分別想起每件事。」她將三個日期重新寫開。 # speaker:沈若音
- else:
    妳們還沒有讀全桌上的記錄。她承認自己記得說過什麼，卻不敢猜季晴當時聽見了什麼。 # speaker:旁白
}
* [問她想補給季晴的是道歉，還是沒說完的恐懼]
    「兩個都是。」她把「別假裝妳懂」寫在信紙邊，沒有塗掉。「我說的話傷了她，不能因為我害怕，就當作沒發生。」 # speaker:沈若音
    她另起一行，寫下自己怕的是被朋友看見落空的樣子，而不是朋友不該成功。 # speaker:旁白
    寫到「怕」那個字時，她的筆停了很久。「這個字我從來沒對她說過。在她面前，我只會說累。」 # speaker:沈若音
    -> backstage_depart
* [先讓她把那句傷人的話原樣念完]
    她念到一半停住。「她那時說，只是想問我有沒有吃飯。我連這句都沒讓她說完。」 # speaker:沈若音
    妳不替季晴回答會不會原諒。若音把未寫完的道歉留在信上，決定等讀完背面，再想要不要寄。 # speaker:旁白
    -> backstage_depart
=== backstage_depart ===
{
- heard_rankings:
    鏡子旁的名單上，她的舊號碼後面寫著「7」。若音想起剛才在書店念完的那串名字，這次沒有再從第一名數下來。 # speaker:旁白
- asked_corridor_tree:
    鏡子映著後台的窗。若音說，比賽那天走廊外的桂花應該也開著；她只記得季晴的名次，不記得自己有沒有聞到。 # speaker:沈若音
}
{
- asked_plan_hand:
    她從琴盒裡翻出書店那張計畫，在畫了問號的「六小時」旁邊，補上一行小字：先問醫師。 # speaker:旁白
- left_plan_blanks:
    她想起計畫表上那些空格，在第一格寫下今晚的手：有點緊，還能握弓。 # speaker:旁白
}
走出化妝間前，若音在門口站了一下。「如果那天我開門，我們大概會像每次比賽完一樣，去後門那家麵店。」她說完自己也愣了，「我好像比較記得沒有發生的事。」 # speaker:沈若音
化妝間的燈逐一熄滅。若音把票放進琴盒，沒再用那張票替自己量出與季晴的距離。 # speaker:旁白
* [陪她走進散場後的宴會廳]
    -> banquet
=== banquet ===
婚禮賓客已離開。燈只剩靠門的一排，一位清潔人員在疊椅子，若音還坐在舞台邊調弦。 # scene:memory # speaker:旁白 # section:banquet
琴盒裡還有另一場企業尾牙的節目單，桌上是今晚的演出時程，門邊那把摺椅仍沒有收起。她說最後一首原本該在新人退場前結束。 # speaker:旁白
舞台邊的桌巾還沒收，角落擺著一盤切了一半的蛋糕。若音說婚禮的曲目多半是新人挑的，她負責讓每一首在對的時間結束。「進場、交換戒指、敬酒、送客。我看的不是譜，是主持人的手勢。」 # speaker:沈若音
{
- tea_type == "osmanthus":
    桂花烏龍的香氣讓她又想起那份名單。若音看著疊起來的椅子，說婚禮沒有名次，只要準時結束。 # speaker:旁白
- tea_type == "black":
    濃紅茶讓她坐得很直。若音說那晚她也是這樣坐著調弦，左手已經在痛，計畫表上卻一個字也沒寫。 # speaker:旁白
}
-> banquet_hub
=== banquet_hub ===
燈只照著半個舞台。若音坐在那裡，似乎終於能想起演出結束後發生的事。 # speaker:旁白
* {not read_banquet_chair} [看看門邊那把沒有收起的摺椅]
    ~ read_banquet_chair = true
    那不是賓客坐的椅子。椅背上搭著一條擰乾的抹布，椅腳旁放著一只水桶，水面已經不晃了。 # speaker:旁白
    「那是她自己打開的。」若音說。「我拉到一半，她把椅子打開，坐在門邊。我還以為她要叫我快點收，結果她只是坐著。」 # speaker:沈若音
    她說自己拉過那麼多場婚禮，很少看到有人為了聽，特地把椅子打開。 # speaker:旁白
    -> banquet_hub
* {not read_banquet_program} [翻看琴盒裡的企業尾牙節目單]
    ~ read_banquet_program = true
    地址是柏言的公司。若音記得台下匆匆離席，只有一位掛著「許柏言」識別證的人停到最後一個音。她不知道他那晚也急著回去完成報告。 # clue:company-recital # speaker:旁白
    若音說：「我不知道他為什麼留下，也沒和他說過話。那晚我只記得，最後一個音落下時，台下還有人。」 # speaker:沈若音
    {
    - previous_ending == "boyan-rest":
        妳想起柏言昨夜寫下回診日期。他曾聽完若音的曲子，但這張節目單不能證明他已經好起來；她也不必因一次被聽見，就立刻答應下一場演出。 # speaker:旁白
    - previous_ending == "boyan-leave":
        妳想起柏言把履歷的下一欄留白。那晚他停下來聽完一首曲子，如今也能停下自己的工作；若音不需要替他的空白填上答案。 # speaker:旁白
    - previous_ending == "boyan-boundary":
        妳想起柏言的交接表終於有別人的筆跡。若音那晚獨自拉完最後一曲，此刻也可以問自己：下一次演出，能不能有人與她分擔收尾。 # speaker:旁白
    - previous_ending == "boyan-overwork":
        妳想起他昨夜仍把報告寄出，卻沒有回診。若音握著弓的手也在痛；妳沒有再把「撐完」當作唯一值得稱讚的事。 # speaker:旁白
    - else:
        妳只知道那位聽眾曾留下來。節目單沒有寫他後來的生活，也沒有替若音決定下一場該去哪裡。 # speaker:旁白
    }
    -> banquet_hub
* {not heard_cleaner} [問門邊那位清潔人員有沒有聽完]
    ~ heard_cleaner = true
    ~ understanding += 1
    「有。」若音看著自己的手。「她哭了，然後說她今晚本來不想回家。我不知道該怎麼回，只把琴盒留在椅子上，陪她坐了一會。」 # clue:cleaner # speaker:沈若音
    那位客人沒問曲名，只在走前說了聲謝謝。若音沒有記住她的名字，卻記得自己當時並不想立刻離開。 # speaker:旁白
    「那是我第一次在演出後，不是先檢查自己拉錯了哪裡。」她說。 # speaker:沈若音
    -> banquet_hub
* {not read_banquet_schedule} [核對桌上被改過的演出時程]
    ~ read_banquet_schedule = true
    原定結束時間被劃掉，旁邊寫了短短三分鐘。若音說她不是因為這三分鐘便決定再接商演。 # speaker:旁白
    她搖頭。「沒有那麼快。隔天我還是討厭自己站在那個台上。但那三分鐘，我不討厭音樂。」 # speaker:沈若音
    時程表最下面印著一行小字：「樂手自行離場」。若音說每一場的時程都有這句，她以前從沒注意過，那天卻是第一次沒有照著做。 # speaker:旁白
    -> banquet_hub
* [把節目單背面的第三片信紙收好]
    -> banquet_end
=== banquet_end ===
第三片信紙黏在節目單背面。正面想聽季晴把曲子拉完，背面想讓孤單的人被理解。 # fragment:music # speaker:旁白
「她哭的時候，我差點問是不是我拉得太難聽。」若音說。「後來我只是坐著。那場婚禮的主角早走了，我第一次不知道自己算不算還在工作。」 # speaker:沈若音
{
- heard_cleaner && read_banquet_schedule:
    妳們核對了那三分鐘，也聽她說出清潔人員留下的話。這不是一場替她解決人生的演出；她只是願意停下來，和一個人一起待在還亮著燈的地方。 # speaker:旁白
- heard_cleaner:
    若音記得有人留下，但沒有把對方的眼淚寫成自己的功勞。「我不知道她後來怎樣。」她說。 # speaker:沈若音
- else:
    妳們尚未問門邊的人聽見了什麼。若音知道自己曾多留三分鐘，卻還不敢替那三分鐘命名。 # speaker:旁白
}
* [問那三分鐘與海報上的名字，哪一個讓她想再拿起琴]
    她看著空桌。「海報會讓我想證明我還在；那三分鐘讓我想到下一次拉琴時，對面可能也有人坐著。」 # speaker:沈若音
    她停了停，補了一句：「兩個都是真的。我還會在意海報。」 # speaker:沈若音
    妳說在意也沒關係。她點點頭：「我只是不想再讓它決定我要不要拉。」 # speaker:沈若音
    {read_banquet_program:「尾牙那位聽眾聽完就走了；門邊的人等我坐下來。」若音說。「兩次我都不知道他們需要什麼，但被人聽見，不等於往後每一場都得替誰撐到底。」 # speaker:沈若音}
    -> banquet_depart
* [問她會不會想替那位客人寫一段旋律]
    「可能會。但我沒有問她願不願意讓我寫她的事。」若音把節目單翻過去。「如果真要寫，我得先學會聽，不只記住自己被需要的感覺。」 # speaker:沈若音
    -> banquet_depart
=== banquet_depart ===
最後一排燈暗下時，若音沒有把這裡說成比音樂廳更好的舞台。她只承認，在這裡也曾有值得被聽見的聲音。 # speaker:旁白
若音把弓收進琴盒前，用拇指順了順弓毛。「那天收琴的時候，我第一次想的不是下一場在哪裡，是剛才那個人有沒有平安到家。」 # speaker:沈若音
* [看最後那個沒有盡頭的舞台]
    -> grandstage
=== grandstage ===
大幕一層一層打開。掌聲從四面湧來，卻沒有一張看得清楚的臉。若音越往前走，空椅子越多。 # scene:memory # speaker:旁白 # section:grandstage
最前方的樂譜每翻一頁，最後一小節便回到開頭。她一直在拉同一段，好像只有不停止，才不必承認台下沒有人。
第一排的座位號碼被擦掉了；譜架上的最後一頁始終翻不過去，側門卻透進一點燈光。 # speaker:旁白
地板亮得能映出人影。若音每往前一步，掌聲就跟著大一點，像有人在台下替她計數。 # speaker:旁白
「這是我小時候想像的樣子。」她說。「後來真的站上去過幾次，燈太亮，其實看不見台下。我一直以為是自己不夠好，才看不見。」 # speaker:沈若音
-> grandstage_hub
=== grandstage_hub ===
掌聲仍在遠處。妳可以和她看清這裡留下的痕跡，再決定何時回書店。 # speaker:旁白
* {not heard_grand_gap} [聽聽掌聲的空隙裡還有什麼聲音]
    ~ heard_grand_gap = true
    妳們站著不動，等掌聲換氣。每一陣掌聲之間都有一個極短的空隙，空隙裡有細細的雨聲，像空教室的窗沒有關好。 # speaker:旁白
    若音側過頭聽了很久。「原來一直都在。」她說。「只是我每次都拉得太大聲，把它蓋過去了。」 # speaker:沈若音
    -> grandstage_hub
* {not read_grand_seats} [陪她坐下，看看第一排的空椅子]
    ~ read_grand_seats = true
    ~ trust += 1
    妳們在第一排坐下。掌聲停了，若音聽見自己的呼吸，也聽見弦上還有一點細小的震動。 # speaker:旁白
    其中一張椅背刻著她小時候畫過的雲。她把手放上去，沒有說這個位置一定要坐滿。 # speaker:旁白
    「小時候我以為第一排坐的都是評審。」若音說。「後來才知道，第一排常常是家人。媽媽每次都坐在靠走道那一格，方便我一下台就看到她。」 # speaker:沈若音
    -> grandstage_hub
* {not read_grand_score} [翻開一直回到開頭的最後一頁]
    ~ read_grand_score = true
    最後一行只寫了前四個音，後面全是擦掉的痕跡。若音說：「我一直以為停下來，就代表我再也寫不出下一個音。」 # speaker:沈若音
    妳把樂譜放回她面前，讓她自己決定要不要再拉一次。 # speaker:旁白
    {
    - previous_ending == "boyan-rest":
        她握弓的手有點抖。妳想起柏言把回診排在報告前面；那一晚，他也是先承認自己累了，才決定明天要做什麼。 # speaker:旁白
    - previous_ending == "boyan-leave":
        妳想起柏言寫下的那張空白履歷。他還沒想好下一份工作，只先承認這一份不能再照原樣做下去。 # speaker:旁白
    - previous_ending == "boyan-boundary":
        妳想起柏言交接表上多出的那行別人的筆跡。有些重量要先說出口，旁邊的人才接得住。 # speaker:旁白
    - previous_ending == "boyan-overwork":
        妳想起柏言在書店送出報告，回診那格仍空著。那時妳說先做完比較安心；他點頭的樣子，和若音現在握弓的手很像。 # speaker:旁白
    }
    -> grandstage_score
* {not read_grand_exit} [查看側門透進的那道燈光]
    ~ read_grand_exit = true
    側門通向空蕩的走廊，門上沒有寫出口，也沒有寫下一場演出。若音握住門把，發現它可以由裡面打開。 # speaker:旁白
    她說：「我以前以為離開舞台，只能從後台被人帶出去。」妳們先把門留開一條縫。 # speaker:旁白
    -> grandstage_hub
* [帶著琴盒回書店，拼起信的兩面]
    -> grandstage_end
=== grandstage_score ===
* {not asked_share_load} [問她，手累的時候，有沒有哪一段能交給別人]
    ~ asked_share_load = true
    ~ understanding += 1
    「二重奏的時候可以。」若音想了很久。「可是獨奏的譜上，每一個音都寫著我的名字。」 # speaker:沈若音
    {
    - previous_ending == "boyan-boundary":
        妳說起有人把工作界線寫進交接表，另一個人就把那一行接了過去。若音笑了一下：「那我至少可以在譜上標出，哪裡需要鋼琴多撐一點。」 # speaker:沈若音
    - previous_ending == "boyan-overwork":
        妳說起一個人在深夜把報告送出，回診卻一直空著。妳沒有說他錯了，只說那天妳也勸他先做完。若音看著自己的手：「那我不要再請妳勸我了。」 # speaker:沈若音
    - else:
        她把譜翻到最長的那一段，在旁邊畫了一個小小的逗號。「這裡，也許可以讓鋼琴先走。」 # speaker:沈若音
    }
    -> grandstage_score
* [先請她休息，等她想好再碰琴弓]
    ~ trust += 1
    她放下弓，聽見自己的呼吸。「原來休止符也能寫進去。」 # speaker:沈若音
    -> grandstage_hub
* [鼓勵她再拉一次，證明自己仍做得到]
    ~ intervention += 1
    她重新起弓，掌聲又響起，剛才那句話也被蓋過了。妳等她停下，這次沒有要求她證明。 # speaker:旁白
    -> grandstage_hub
=== grandstage_end ===
她把樂譜收進琴盒。「那封信，看起來只寫給季晴。」她說。「可我記得每片紙的背面也有字。」
{
- read_grand_seats && read_grand_exit:
    妳們坐過空椅，也摸過能從裡面打開的側門。若音說，自己一直把「留下」和「逃走」當成僅有的兩個選擇，卻沒想過能拉完一段，再自己決定是否起身。 # speaker:沈若音
- read_grand_score:
    她看著被擦白的最後一行。空白不是判決，也不會因為今晚寫上音符，就替過去的比賽改寫結果。 # speaker:旁白
- else:
    掌聲還在重複。若音暫時說不清台下有誰，至少已經知道不必再往沒有臉的觀眾席走。 # speaker:旁白
}
* [問她若能把掌聲停下，想先聽見什麼]
    她試了試。大幕後的回音漸低，琴弦摩擦指腹的細聲反而清楚起來。「我想聽見自己什麼時候累了。」 # speaker:沈若音
    妳問她，累的時候聽起來是什麼樣子。她想了想：「弓會先變重，換弦會慢半拍。以前我都假裝沒聽見。」 # speaker:沈若音
    她把手放回琴盒上，等那一點聲音完全停住，才說可以回去看信。 # speaker:旁白
    -> grandstage_depart
* [問她是否仍想站上真正的大舞台]
    「有時想。」她說得很慢。「我不想把想上台的自己說成錯。但如果每次都要先忘記疼痛、忘記台下的人，才能站上去，我還需要時間想清楚。」 # speaker:沈若音
    -> grandstage_depart
=== grandstage_depart ===
妳們從側幕走回書架間。那疊信紙輕得幾乎被風翻走；若音先按住背面，才看正面。 # scene:ruoyin # speaker:旁白
走過側幕時，她回頭看了一眼。大幕還在開合，掌聲小了很多。「我沒有討厭那裡。」她說，「我只是不想再一個人走到那麼前面。」 # speaker:沈若音
* [回書店，拼起信的兩面]
    -> letter_start
=== letter_start ===
-> tea_before_letter ->
三片紙的正面寫給季晴，背面寫給十歲的若音。妳可以分別排列兩面，再把信交還給她。 # scene:counter # speaker:旁白 # section:letter # minigame:letter
-> DONE
=== letter_result ===
{
- letter_understood:
    ~ understanding += 2
    若音先讀完給季晴的那面，再翻過來讀給十歲的自己。她讀到「孤單的人」時停下，想起宴會廳那位客人。 # scene:ruoyin # speaker:旁白 # section:response
    她把信紙翻過來又翻回去，像在確認兩面是不是同一個人寫的。「寫給季晴的時候，我一直在解釋。寫給十歲的我，反而不用。」 # speaker:沈若音
- letter_completion >= 50:
    她把還沒排好的背面留給自己。「我今晚可以先知道這封信有兩個收件人。」 # scene:ruoyin # speaker:沈若音 # section:response
- else:
    她沒有催妳填空。桌上至少留下了一片能讀清楚的字，她說想把剩下的帶回去慢慢看。 # scene:ruoyin # speaker:旁白 # section:response
}
妳把空白樂譜推回她面前。最後一小節還等著她決定，不一定要用最響亮的音收尾。
-> score_table
=== score_table ===
若音把琴盒裡的舊稿攤在茶杯旁。譜上的擦痕一層疊一層，有些音是她改的，有些是她怕別人失望才改的。她拿起鉛筆，卻先把橡皮擦放遠。 # speaker:旁白 # section:finalbar
妳在她對面坐下，替茶壺添了熱水。鉛筆在紙上停停走走，妳沒有催，像在聽一段還沒定拍的曲子。 # speaker:旁白
「我以前總想直接寫一個正確的結尾。」她說。「今晚可以先弄清楚，我想把什麼留在曲子裡嗎？」 # speaker:沈若音
-> score_table_hub
=== score_table_hub ===
她沒有催妳替她填音符。妳可以聽她多談幾句，也可以把最後一小節交還給她。 # speaker:旁白
* {not score_own} [問她這些年拉別人的曲子時，有沒有偷偷留下自己的地方]
    ~ score_own = true
    若音想了一下，笑了。「有。婚禮進場那首，我每次都在第二段多停半拍。新娘走得慢，我就等她。」 # speaker:沈若音
    「這不算作曲吧。」她說完，又自己搖頭。「可是換別人去拉，那半拍就不見了。這樣想，它好像是我的。」 # speaker:沈若音
    {asked_labels:她說起那首替阿嬤改編的歌，改了三次，最後留下的仍是第一次寫的那個轉音。 # speaker:旁白}
    妳說那半拍聽起來像一個人在等另一個人。她把鉛筆在指間轉了一圈，沒有反駁。 # speaker:旁白
    -> score_table_hub
* {not score_rain} [請她說說最初四個音裡的停頓]
    ~ score_rain = true
    若音用指尖在桌面敲出前三個音，第四下卻沒有落下。「我小時候拉給雨聽。雨小一點，我就等它；不是忘了下一個音。」 # speaker:沈若音
    {heard_rain:妳記得空教室裡那個空拍。她點頭：「那時我已經會讓別的聲音進來，不必把它補成比賽用的整齊拍子。」 # speaker:沈若音}
    {not heard_rain:妳們先前沒有停下來聽那場雨。她現在重新敲給妳聽，讓妳知道空拍是她自己留下的。 # speaker:旁白}
    -> score_table_hub
* {not score_person} [問她新的旋律想先給誰聽]
    ~ score_person = true
    若音說，散場後曾有一個人留在門邊，聽她把最後三分鐘拉完。「我不知道她後來過得怎樣，也不想把她的故事拿來替自己證明。」 # speaker:沈若音
    {heard_cleaner:妳們先前聽過那位清潔人員的話。若音說，她想先問對方願不願意聽，再決定是否把新的旋律交出去。 # speaker:旁白}
    {not heard_cleaner:妳們沒有問過那位聽眾的想法。若音說，若再見面，她會先問對方願不願意聽，不把眼淚當成一份委託。 # speaker:旁白}
    -> score_table_hub
* {not score_rest} [問她手累時能不能把休止符留下]
    ~ score_rest = true
    她把左手平放在譜紙邊。「可以。我還想拉琴，但不想再用疼痛證明自己沒有放棄。下次練習前，我會先問清楚適合的方式。」 # speaker:沈若音
    {read_injury:她想起妳們看過的復健日期，把「停一下」寫在新曲旁，沒有把舊傷與那場比賽混成同一個失敗。 # speaker:旁白}
    {not read_injury:妳們沒有讀到過去的復健紀錄；她此刻說的是現在的手。妳不替她推斷還能拉多久。 # speaker:旁白}
    -> score_table_hub
* {ending_jinglan != "" && not told_jinglan_notes} [告訴她，第一晚有位老師也聽過這四個音]
    ~ told_jinglan_notes = true
    妳說起第一晚那位退休的國文老師。她在櫃台前坐到很晚，書架深處也傳來四個音，最後一個音沒有落下。 # speaker:旁白
    若音停住筆。「她聽完，有說什麼嗎？」 # speaker:沈若音
    {
    - ending_jinglan == "moonlight":
        妳說她沒提琴聲，只在最後寫了一封信給年輕時的自己。若音看著譜角十歲時畫的雲：「那這一小節，我也可以先寫給那個十歲的人聽。」 # speaker:沈若音
    - ending_jinglan == "recipient":
        妳說她先寫了一張短箋，問收信的人願不願意收。若音點頭：「那我也先問。想聽的人，我再拉給他。」 # speaker:沈若音
    - ending_jinglan == "unfinished":
        妳說她把信帶回家，還沒決定要不要寄。若音笑了一下：「原來她也還沒寫完。那最後一個音晚一點落下，也沒關係。」 # speaker:沈若音
    - else:
        妳說那封信最後是妳替她封口的，她說過「等等」。若音把鉛筆握緊了一點，又放鬆：「那最後一小節，請讓我自己寫。」 # speaker:沈若音
    }
    -> score_table_hub
* {score_rest && lincheng_paused == ""} [聽她反問妳停下過什麼]
    若音的手還平放在譜紙邊。她看了看妳，像在看一個坐錯位置的聽眾。 # speaker:旁白
    「一直是我在說。妳呢？妳有沒有一件小時候很喜歡、後來停下來的事？」 # speaker:沈若音
    ** [說小時候常畫月亮，搬家以後就沒再畫]
        ~ lincheng_paused = "moon"
        ~ trust += 1
        妳說小時候常在紙角畫月亮，課本、作業簿，連媽媽的購物清單都有。搬家以後，不知道為什麼就沒再畫了。 # speaker:林澄
        若音低頭看杯底那枚小月亮，沒有說像不像。「我的四個音也停了十幾年。」 # speaker:沈若音
        她把譜紙的角落推到妳面前，連同鉛筆。「要不要畫一個？不用畫好。」妳畫了，比杯底那個歪得多。她看了一眼，說留著。 # speaker:旁白
        -> score_table_hub
    ** [說妳想不起來有什麼停下的]
        ~ lincheng_paused = "unsure"
        妳想了一會，說想不起來。好像有，又好像只是一直沒有開始。 # speaker:林澄
        若音點點頭。「想不起來也像休止符。不一定是結束，可能只是還沒到下一拍。」 # speaker:沈若音
        她在譜紙最邊上畫了一個休止符，沿著摺線撕下那一小角，遞給妳。 # speaker:旁白
        -> score_table_hub
* [把鉛筆交回若音，聽她決定最後一小節]
    -> final_bar_choice
=== final_bar_choice ===
若音把譜紙轉向自己。「這三種寫法都可以是我的。我要知道的是，今晚哪一種最貼近我說過的話。」 # speaker:沈若音 # section:finalbar
{asked_blank_bar:她這次沒有回頭去改第一個音。鉛筆直接停在最後那一格上，那片空白第一次有了要落筆的地方。 # speaker:旁白}
* [回到最初的四個音]
    ~ final_bar = "return"
    ~ final_bar_sincere = heard_rain || score_rain
    她把童年那段旋律拉了一遍，這回沒有急著修改第一個音。 # speaker:旁白 # section:finalbar
    {heard_rain:她在雨聲變小的那一拍等了一下。妳們都記得空教室裡原本就有這個停頓。 # speaker:旁白}
    -> final_choice
* [加入一小段新的簡單旋律]
    ~ final_bar = "new"
    ~ final_bar_sincere = heard_cleaner || score_person
    她試著把雨聲與宴會廳那段安靜放進去。曲子變短了，也能完整落下。 # speaker:旁白 # section:finalbar
    {heard_cleaner:若音說，那位聽完的客人沒有要她證明什麼；這段新的旋律可以只送給願意坐下來聽的人。 # speaker:沈若音}
    -> final_choice
* [先留下休止符]
    ~ final_bar = "rest"
    ~ final_bar_sincere = read_injury || score_rest
    她畫了一個休止符，說這不是放棄，只是今晚還不想填滿。 # speaker:旁白 # section:finalbar
    {read_injury:她摸了摸舊傷，說想先把能夠舒服地拉琴的方式問清楚，再決定要把休止符留多久。 # speaker:沈若音}
    -> final_choice
=== final_choice ===
若音把琴弓放在桌上。信已經能讀，曲子也暫時有了最後一小節；接下來仍由她選擇要把它帶去哪裡。 # scene:ruoyin # speaker:旁白 # section:response
* {letter_understood && melody_correct && final_bar_sincere} [陪她只為一個人拉完這首曲子]
    -> end_one
* [問她是否想把給季晴的信寄出]
    -> end_stage
* [提議替普通人的故事寫旋律]
    -> end_score
* [勸她帶著舊傷重新參賽，用名次證明自己]
    ~ intervention += 2
    -> end_echo
=== end_one ===
書店門鈴響時，一位夜歸的客人在門邊停下。若音問他要不要聽一首還沒有名字的曲子，他點頭。 # speaker:旁白
她只拉三分鐘。曲子從雨聲開始，留一拍給呼吸。 # speaker:旁白
{asked_bow:這一次，她是先打開琴盒，才去拿弓的。 # speaker:旁白}
那人沒有坐下，站在門邊的傘架旁聽。黑貓走過去，在他腳邊停住。妳站在櫃台後面，發現自己也在等最後一拍落下。 # speaker:旁白
{
- final_bar == "return":
    最後一小節回到最初的四個音。若音在雨聲變小的那一拍停住，才把弓輕輕放下。 # speaker:旁白
- final_bar == "new":
    最後一小節多了一段新的簡單旋律，像宴會廳那三分鐘，有人願意留下來聽。 # speaker:旁白
- else:
    最後一小節留下休止符。若音沒有急著填滿它，讓那個人和她一起聽見安靜。 # speaker:旁白
}
那人臨走前說：「謝謝。我今晚本來不想回家。」 # speaker:旁白
若音沒有問為什麼，也沒有急著把曲子解釋完。她把琴放低，在那人旁邊坐了一會。
客人走後，她把左手攤在膝上，指節一張一合，像在數剛才用了幾分力。 # speaker:旁白
* [遞一條溫毛巾，讓她先暖手]
    ~ one_hand = "towel"
    妳把熱水壺邊的毛巾擰乾遞過去。若音把手整個包進去，過了一會才說：「以前拉完都直接收琴。原來可以先等手回來。」 # speaker:旁白
* [問她手還好嗎，等她自己說]
    ~ one_hand = "asked"
    ~ trust += 1
    若音看著自己的手，想了一下才回答。「有一點痠。」她笑了，「這句我以前不會說，怕說了就不能上台。」 # speaker:沈若音 # portrait:ruoyin-smile
- -> one_afterword
=== one_afterword ===
書籤後記：若音後來偶爾在小場地演出。她仍會想起舊比賽，也仍須照顧手的狀況，但不再要求每一場都回答她的人生是否成功。 # scene:counter # speaker:旁白 # section:afterword
那首曲子有了名字，叫〈三分鐘〉。樂譜上保留了雨聲的空拍，演出時她會先等一下，再落弓。
{asked_share_load:〈三分鐘〉的譜上留著一個鉛筆畫的記號。演出到那裡，鋼琴會先走一小段，她的左手在琴頸上歇一拍。 # speaker:旁白}
{asked_labels:琴盒上的商演標籤她一張也沒撕。最新一張貼在最上面，寫著一間小咖啡館的名字。 # speaker:旁白}
{asked_plan_hand:她現在的練習表第一欄不是時數，是手的狀況。痛的日子，她只拉那四個音。 # speaker:旁白}
{told_jinglan_notes:她後來在譜紙角落寫了一行小字：「給第一晚也聽見的人。」 # speaker:旁白}
{lincheng_paused == "moon":〈三分鐘〉的譜角，雲旁邊多了一個歪歪的月亮。重抄過幾次，她都照樣畫上。 # speaker:旁白}
{lincheng_paused == "unsure":演出時，她在空拍那裡等一下。有時會想起書店裡那個說想不起來的店員。 # speaker:旁白}
{one_hand == "towel":演出結束後，她會先把手泡進溫水裡，再出去跟聽眾說話。 # speaker:旁白}
{one_hand == "asked":有人問她手還好嗎，她會照實說：「有一點痠。」說完仍把下一首拉完，或者不拉。 # speaker:旁白}
-> tea_afterword ->
~ ending_kind = "one"
-> chapter_coda
=== end_stage ===
若音重讀寫給季晴的那面，刪掉想讓對方負責的句子，留下自己想說的話。她親手把信封口，沒有請妳替她寄。 # speaker:旁白
「我可以聽她拉完，不代表我要變成她。」若音說。「那天我沒說完的，也許可以現在說。」
她把信封拿在手上，翻過來看了看自己寫的地址，沒有立刻起身。 # speaker:旁白
* [陪她走到門邊的信箱]
    ~ stage_post = "tonight"
    妳們一起走到門邊。若音把信封捏了一下，才放進投信口。蓋子落下時，她小聲說：「好了。」 # speaker:旁白
* [讓她把信帶回去，明天自己寄]
    ~ stage_post = "tomorrow"
    ~ trust += 1
    若音把信收進琴盒的內袋。「明天我自己去郵局。」她說，「想用掛號，讓她簽名才算收到。」 # speaker:沈若音
- -> stage_afterword
=== stage_afterword ===
書籤後記：季晴回了一張演出邀請。若音坐在觀眾席，聽完整場，謝幕後兩人才在走廊裡見面。 # scene:counter # speaker:旁白 # section:afterword
她們沒有把那次爭吵說成誤會，只是第一次聽彼此把話講完。
{asked_corridor_tree:散場後，兩人沿著音樂廳外的人行道走了一段。路邊有一棵桂花，她們都沒有提起那年的名次。 # speaker:旁白}
{asked_phone:那張票是她自己在開賣那天買的。鬧鐘響了，她沒有只看著座位圖變灰。演出中她數過一次季晴換弓的位置，後來便忘了數。 # speaker:旁白}
{told_jinglan_notes:寄給季晴的信裡，她提到一位也聽過這四個音的老師。她沒寫名字，只寫：「她也在等最後一個音。」 # speaker:旁白}
{lincheng_paused == "moon":季晴問她譜角那個歪月亮是誰畫的。若音說，是一個很多年沒畫的人。 # speaker:旁白}
{lincheng_paused == "unsure":她在給季晴的信裡寫：休止符不一定是結束。這句話，她先對一個店員說過。 # speaker:旁白}
{stage_post == "tonight":季晴說那封信的郵戳是半夜。她也是在半夜讀完的。 # speaker:旁白}
{stage_post == "tomorrow":掛號回執寄回來時，簽名欄是季晴的字。若音把它夾進樂譜，和那張舊票根放在一起。 # speaker:旁白}
-> tea_afterword ->
~ ending_kind = "stage"
-> chapter_coda
=== end_score ===
若音在書店留下一本沒有封面的簿子。第一頁寫：「留一封信，換一段旋律。」她沒有保證每封都能寫完。 # speaker:旁白
黑貓在頁角留下爪印。她想擦，最後決定把那個不整齊的記號留著。
她把簿子推到櫃台中央，又拉回來一點，像不確定第一頁該留給誰。 # speaker:旁白
* [請她先替自己寫第一段]
    ~ score_first = "self"
    ~ understanding += 1
    若音把最初的四個音寫在第一頁，空拍也照樣留著。「先交我自己的。」她說，「不然好像在跟別人要故事，自己卻什麼都沒給。」 # speaker:旁白
* [把簿子放在櫃台最顯眼的地方，留給下一位客人]
    ~ score_first = "guest"
    妳把簿子立在茶罐旁邊，封面朝外。若音看了一會，說這樣很好，第一個寫的人不必知道她是誰。 # speaker:旁白
- -> score_afterword
=== score_afterword ===
書籤後記：有人的信只有一句話，有人寫滿十頁。若音替他們寫短短的旋律，也把自己寫不出的日子留在簿子裡。 # scene:counter # speaker:旁白 # section:afterword
簿子漸漸厚了，沒有一頁標著「重新成為獨奏家」。
{asked_labels:她仍接婚禮和尾牙。遇到有人請她拉家人以前唱的歌，她會先把那段故事記進簿子，再動手改編曲。 # speaker:旁白}
{told_jinglan_notes:她替普通人寫的第一首曲子，開頭仍是那四個音。她說是借來的，借給所有沒聽完的人。 # speaker:旁白}
{lincheng_paused == "moon":交換簿第一頁，黑貓的爪印旁邊，是那個歪歪的月亮。 # speaker:旁白}
{lincheng_paused == "unsure":簿子最後留了一頁空白，標題寫著：「給還想不起來的人。」 # speaker:旁白}
{score_first == "self":簿子第一頁是她自己的四個音。後來每個人翻開，都會先聽見那個雨天。 # speaker:旁白}
{score_first == "guest":第一個在簿子裡留信的人，是一位夜班的計程車司機。他只寫了一句，若音替那一句寫了八小節。 # speaker:旁白}
-> tea_afterword ->
~ ending_kind = "score"
-> chapter_coda
=== end_echo ===
妳說既然她還能拉，就該再試一次大賽。若音看了一眼左手，沒有反駁，反而把熟悉的練習時程重新列出來。 # speaker:旁白
妳聽見她說「好」，卻沒問那是答應妳，還是答應自己。
她把時程表推到妳面前，像在等誰替它蓋章。 # speaker:旁白
* [告訴她妳剛才說得太快，她可以再想]
    ~ echo_reply = "retract"
    若音看了妳一眼。「我知道。」她把表格收回去，「可是我習慣聽別人說快的那一句。」 # speaker:沈若音
* [替她把練習時程抄得工整一點]
    ~ echo_reply = "copied"
    ~ intervention += 1
    妳把時數一格一格抄好，字比她的整齊。若音道了謝，把那張紙摺好，放進琴盒最上層。 # speaker:旁白
- -> echo_afterword
=== echo_afterword ===
書籤後記：她帶傷參賽，取得名次。海報重新貼上她的名字，某個雨夜，她又把那首未完成曲拉到最後一小節。 # scene:counter # speaker:旁白 # section:afterword
終止線後面仍是開頭的四個音。掌聲響起，她卻想不起自己上一次沒有痛地拉琴，是什麼時候。
{asked_share_load:比賽曲沒有伴奏可以分擔。她在書店譜上畫過的那個記號，比賽前被她自己擦掉了。 # speaker:旁白}
{heard_rankings:成績公布那天，她排在第二。她第一個找的，仍是其他人的名字排在哪裡。 # speaker:旁白}
{left_plan_blanks:書店那張計畫表的空格，她一直沒有填。比賽前一晚，她把它們全塗成了練習時數。 # speaker:旁白}
{asked_phone:季晴來聽了那場比賽。若音在台上數著台下的換弓，數到最後，發現自己一直在等對方拉錯。 # speaker:旁白}
{told_jinglan_notes:比賽那天，拉到第四個音時她想起那位老師。她沒有停，掌聲蓋過了那一拍。 # speaker:旁白}
{lincheng_paused == "moon":比賽用的譜重抄過一次。譜角那個歪月亮，沒有抄過去。 # speaker:旁白}
{lincheng_paused == "unsure":比賽曲裡沒有休止符。她撕給店員的那一小角，是她那陣子畫過的唯一一個。 # speaker:旁白}
{echo_reply == "retract":比賽前一晚，她想起書店店員說過可以再想。她還是去了，只是那晚提早一小時收琴。 # speaker:旁白}
{echo_reply == "copied":練習表是書店店員替她抄的，字很工整。她照著練，一格也沒有空下來。 # speaker:旁白}
-> tea_afterword ->
~ ending_kind = "echo"
-> chapter_coda
=== chapter_coda ===
若音離開後，妳在鋼琴裡找到一只上了發條的八音盒。它播放的，正是她十歲寫下、剛才在茶杯邊聽見的四個音。 # scene:counter # speaker:旁白 # section:coda # clue:motif
手冊原本缺失的第一頁，被黑貓從櫃台下拖出來。紙邊有妳童年畫過的小月亮，墨水早已乾了。
{
- lincheng_paused == "moon":
    妳剛才在若音譜角畫的那個，比紙邊這個歪得多，彎的方向卻一樣。 # speaker:旁白
- lincheng_paused == "unsure":
    妳把若音撕給妳的休止符夾在第一頁旁。妳還想不起來；那一小角紙說，也許只是還沒到下一拍。 # speaker:旁白
}
店員也必須留下自己的故事，才能在黎明以前離開。 # speaker:員工手冊 # clue:manual-page
妳看著杯底相同的記號。若音的曲子不是書店先寫下的；書店只是一直替她保管著沒拉完的那一小節。
窗外仍沒有天亮。妳把第一頁放回手冊，終於不再把它壓在最後。
-> final_bookmark
=== final_bookmark ===
{
- ending_kind == "one":
    她只為一個人拉完曲子，最後一拍沒有被掌聲蓋住。 # scene:moon-sea # ending:ruoyin-one
- ending_kind == "stage":
    寫給季晴的信由她親手封好。兩個人終於有機會聽完彼此。 # scene:moon-sea # ending:ruoyin-stage
- ending_kind == "score":
    交換簿裡的旋律仍在增加。沒有名字的故事，也能被人聽見。 # scene:moon-sea # ending:ruoyin-score
- else:
    掌聲在大幕後反覆響起。樂譜仍在最後一小節折回開頭。 # scene:moon-sea # ending:ruoyin-echo
}
-> END

=== tea_afterword ===
{
- tea_type == "lavender":
    她的琴盒裡多了一小包薰衣草。打開琴盒時先聞到它，手會比較慢一點才放上琴弦。 # speaker:旁白
- tea_type == "osmanthus":
    每到桂花開，她會想起放學公車上那首沒被打分數的歌，在路邊哼一兩句。 # speaker:旁白
- tea_type == "black":
    她仍在練琴前喝一杯濃紅茶。有幾次喝到一半，她想起書店裡那張計畫表，停下來看了看手。 # speaker:旁白
}
->->
=== tea_before_letter ===
{
- tea_type == "lavender":
    薰衣草的香氣留在琴盒邊。若音的左手攤在桌上，第一次沒有握成拳。 # speaker:旁白
- tea_type == "osmanthus":
    桂花烏龍放涼了。若音聞了一下杯口，說桂花開的那幾天，她練琴總是比較慢。 # speaker:旁白
- tea_type == "black":
    濃紅茶的杯緣留著一圈茶漬。若音看著那份計畫表，筆在指間轉了一圈，沒有再加任何一行。 # speaker:旁白
}
->->
