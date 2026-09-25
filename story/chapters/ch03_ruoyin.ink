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
* [問她左手是否還痛]
    ~ read_injury = true
    她說天冷時會麻，長時間練琴也會痛。「醫師說得很清楚。我那時只聽見不能照原來的方式練。」 # clue:injury # speaker:沈若音
    -> tea_start
* [問她那張舊票是誰的]
    她把票翻過來。背面有季晴的字：「等我們一起站上那個舞台。」她說兩人後來真的去過，只是走向了不同的出口。 # clue:concert-ticket # speaker:沈若音
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
    薰衣草與佛手柑的氣味升起。若音說小時候，母親會在練琴後的手帕上放一點薰衣草。那不是比賽日，只是普通的星期三。 # scene:ruoyin # speaker:沈若音 # section:listening
- tea_type == "osmanthus":
    桂花香使她想起音樂院的走廊。她先報出兩位同學的比賽名次，停了停，才說起走廊窗外那棵樹。 # scene:ruoyin # speaker:旁白 # section:listening
- tea_type == "black":
    她喝了一口紅茶，開始列出新的練習計畫。妳沒有跟著填日期，先問她手現在有沒有痛。 # scene:ruoyin # speaker:旁白 # section:listening
- else:
    她慢慢握住杯子。琴弓還在桌上，暫時不需要立刻拿起來。 # scene:ruoyin # speaker:旁白 # section:listening
}
茶匙碰到杯緣，發出四個高低不同的音。若音放下茶杯，低聲說：「那是我小時候寫的開頭。」
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
* [請她從第一次喜歡演奏的地方說起]
    ~ trust += 1
    -> childhood
* [問她為何不把這段曲子寫完]
    她望向書架間的黑暗。「因為後來的我，總想替十歲的我改掉第一個音。」 # speaker:沈若音
    -> childhood
=== childhood ===
書架轉成一間兒時的空教室。午後的雨打在鐵窗上，十歲的若音把譜架推向窗邊，一個人拉給雨聽。 # scene:memory # speaker:旁白 # section:childhood
那時沒有觀眾、沒有評審，她拉錯了兩次，都自己笑了，從頭再來。
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
    若音伸手壓住快被風吹走的紙。「我以前會畫這些。」她把那一頁折好，沒有再說幼稚。 # speaker:沈若音
    -> childhood_hub
* [從譜架下拾起第一片信紙]
    -> childhood_end
=== childhood_end ===
第一片信紙藏在譜架下。正面以「季晴」開頭，背面卻寫給十歲的若音。 # fragment:greeting # speaker:旁白
* [走向音樂院的比賽後台]
    -> backstage
=== backstage ===
後台的鏡子把若音的肩膀照得很僵。演出海報上，季晴的照片貼在她的舊號碼旁邊。 # scene:memory # speaker:旁白 # section:backstage
那次比賽她失常，隔年手又受了傷。她說自己最難忘的不是名次，而是賽後季晴來敲門，她卻說了句「別假裝妳懂」。
鏡框夾著評審講評，化妝桌上有季晴留下的舊票，最下面壓著練習時用過的護手繃帶。 # speaker:旁白
-> backstage_hub
=== backstage_hub ===
後台的門沒有鎖。若音站在鏡前，等妳把想看的紙放回去。 # speaker:旁白
* {not read_review} [讀評審講評，分清曲子與那次失常]
    ~ read_review = true
    ~ understanding += 1
    講評談到速度與呼吸，沒有一句寫她從此不配演奏。她把那張紙折了很多次，折痕剛好蓋住最後一行。 # clue:stage-review # speaker:旁白
    妳把紙攤平，若音看見評審最後寫的「第二段有自己的聲音」。她沒有立刻相信，也沒再把那行摺回去。 # speaker:旁白
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
* [陪她走進散場後的宴會廳]
    -> banquet
=== banquet ===
婚禮賓客已離開。燈只剩靠門的一排，一位清潔人員在疊椅子，若音還坐在舞台邊調弦。 # scene:memory # speaker:旁白 # section:banquet
琴盒裡還有另一場企業尾牙的節目單，桌上是今晚的演出時程，門邊那把摺椅仍沒有收起。她說最後一首原本該在新人退場前結束。 # speaker:旁白
-> banquet_hub
=== banquet_hub ===
燈只照著半個舞台。若音坐在那裡，似乎終於能想起演出結束後發生的事。 # speaker:旁白
* {not read_banquet_program} [翻看琴盒裡的企業尾牙節目單]
    ~ read_banquet_program = true
    地址是柏言的公司。若音記得台下匆匆離席，只有一位掛著「許柏言」識別證的人停到最後一個音。她不知道他那晚也急著回去完成報告。 # clue:company-recital # speaker:旁白
    {previous_ending == "boyan-overwork":妳想起他昨夜仍把報告寄出，卻沒有回診。若音握著弓的手也在痛；妳沒有再把「撐完」當作唯一值得稱讚的事。 # speaker:旁白}
    -> banquet_hub
* {not heard_cleaner} [問門邊那位清潔人員有沒有聽完]
    ~ heard_cleaner = true
    ~ understanding += 1
    「有。」若音看著自己的手。「她哭了，然後說她今晚本來不想回家。我不知道該怎麼回，只把琴盒留在椅子上，陪她坐了一會。」 # clue:cleaner # speaker:沈若音
    那位客人沒問曲名，只在走前說了聲謝謝。若音沒有記住她的名字，卻記得自己當時並不想立刻離開。 # speaker:旁白
    -> banquet_hub
* {not read_banquet_schedule} [核對桌上被改過的演出時程]
    ~ read_banquet_schedule = true
    原定結束時間被劃掉，旁邊寫了短短三分鐘。若音說她不是因為這三分鐘便決定再接商演。 # speaker:旁白
    她搖頭。「沒有那麼快。隔天我還是討厭自己站在那個台上。但那三分鐘，我不討厭音樂。」 # speaker:沈若音
    -> banquet_hub
* [把節目單背面的第三片信紙收好]
    -> banquet_end
=== banquet_end ===
第三片信紙黏在節目單背面。正面想聽季晴把曲子拉完，背面想讓孤單的人被理解。 # fragment:music # speaker:旁白
* [看最後那個沒有盡頭的舞台]
    -> grandstage
=== grandstage ===
大幕一層一層打開。掌聲從四面湧來，卻沒有一張看得清楚的臉。若音越往前走，空椅子越多。 # scene:memory # speaker:旁白 # section:grandstage
最前方的樂譜每翻一頁，最後一小節便回到開頭。她一直在拉同一段，好像只有不停止，才不必承認台下沒有人。
第一排的座位號碼被擦掉了；譜架上的最後一頁始終翻不過去，側門卻透進一點燈光。 # speaker:旁白
-> grandstage_hub
=== grandstage_hub ===
掌聲仍在遠處。妳可以和她看清這裡留下的痕跡，再決定何時回書店。 # speaker:旁白
* {not read_grand_seats} [陪她坐下，看看第一排的空椅子]
    ~ read_grand_seats = true
    ~ trust += 1
    妳們在第一排坐下。掌聲停了，若音聽見自己的呼吸，也聽見弦上還有一點細小的震動。 # speaker:旁白
    其中一張椅背刻著她小時候畫過的雲。她把手放上去，沒有說這個位置一定要坐滿。 # speaker:旁白
    -> grandstage_hub
* {not read_grand_score} [翻開一直回到開頭的最後一頁]
    ~ read_grand_score = true
    最後一行只寫了前四個音，後面全是擦掉的痕跡。若音說：「我一直以為停下來，就代表我再也寫不出下一個音。」 # speaker:沈若音
    妳把樂譜放回她面前，讓她自己決定要不要再拉一次。 # speaker:旁白
    -> grandstage_score
* {not read_grand_exit} [查看側門透進的那道燈光]
    ~ read_grand_exit = true
    側門通向空蕩的走廊，門上沒有寫出口，也沒有寫下一場演出。若音握住門把，發現它可以由裡面打開。 # speaker:旁白
    她說：「我以前以為離開舞台，只能從後台被人帶出去。」妳們先把門留開一條縫。 # speaker:旁白
    -> grandstage_hub
* [帶著琴盒回書店，拼起信的兩面]
    -> grandstage_end
=== grandstage_score ===
* [先請她休息，等她想好再碰琴弓]
    ~ trust += 1
    她放下弓，聽見自己的呼吸。「原來休止符也能寫進去。」 # speaker:沈若音
    -> grandstage_hub
* [鼓勵她再拉一次，證明自己仍做得到]
    ~ intervention += 1
    她重新起弓，掌聲又響起，剛才那句話也被蓋過了。妳等她停下，這次沒有要求她證明。 # speaker:旁白
    -> grandstage_hub
=== grandstage_end ===
她把樂譜收進琴盒。「那張信，看起來只寫給季晴。」她說。「可我記得每片紙的背面也有字。」
* [回書店，拼起信的兩面]
    -> letter_start
=== letter_start ===
三片紙的正面寫給季晴，背面寫給十歲的若音。妳可以分別排列兩面，再把信交還給她。 # scene:counter # speaker:旁白 # section:letter # minigame:letter
-> DONE
=== letter_result ===
{
- letter_understood:
    ~ understanding += 2
    若音先讀完給季晴的那面，再翻過來讀給十歲的自己。她讀到「孤單的人」時停下，想起宴會廳那位客人。 # scene:ruoyin # speaker:旁白 # section:response
- letter_completion >= 50:
    她把還沒排好的背面留給自己。「我今晚可以先知道這封信有兩個收件人。」 # scene:ruoyin # speaker:沈若音 # section:response
- else:
    她沒有催妳填空。桌上至少留下了一片能讀清楚的字，她說想把剩下的帶回去慢慢看。 # scene:ruoyin # speaker:旁白 # section:response
}
妳把空白樂譜推回她面前。最後一小節還等著她決定，不一定要用最響亮的音收尾。
* [回到最初的四個音]
    ~ final_bar = "return"
    ~ final_bar_sincere = heard_rain
    她把童年那段旋律拉了一遍，這回沒有急著修改第一個音。 # speaker:旁白 # section:finalbar
    {heard_rain:她在雨聲變小的那一拍等了一下。妳們都記得空教室裡原本就有這個停頓。 # speaker:旁白}
    -> final_choice
* [加入一小段新的簡單旋律]
    ~ final_bar = "new"
    ~ final_bar_sincere = heard_cleaner
    她試著把雨聲與宴會廳那段安靜放進去。曲子變短了，也能完整落下。 # speaker:旁白 # section:finalbar
    {heard_cleaner:若音說，那位聽完的客人沒有要她證明什麼；這段新的旋律可以只送給願意坐下來聽的人。 # speaker:沈若音}
    -> final_choice
* [先留下休止符]
    ~ final_bar = "rest"
    ~ final_bar_sincere = read_injury
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
{
- final_bar == "return":
    最後一小節回到最初的四個音。若音在雨聲變小的那一拍停住，才把弓輕輕放下。 # speaker:旁白
- final_bar == "new":
    最後一小節多了一段新的簡單旋律，像宴會廳那三分鐘，有人願意留下來聽。 # speaker:旁白
- else:
    最後一小節留下休止符。若音沒有急著填滿它，讓那個人和她一起聽見安靜。 # speaker:旁白
}
謝謝。我今晚本來不想回家。 # speaker:旁白
若音沒有問為什麼，也沒有急著把曲子解釋完。她把琴放低，在那人旁邊坐了一會。
-> one_afterword
=== one_afterword ===
書籤後記：若音後來偶爾在小場地演出。她仍會想起舊比賽，也仍須照顧手的狀況，但不再要求每一場都回答她的人生是否成功。 # scene:counter # speaker:旁白 # section:afterword
那首曲子有了名字，叫〈三分鐘〉。樂譜上保留了雨聲的空拍，演出時她會先等一下，再落弓。
~ ending_kind = "one"
-> chapter_coda
=== end_stage ===
若音重讀寫給季晴的那面，刪掉想讓對方負責的句子，留下自己想說的話。她親手把信封口，沒有請妳替她寄。 # speaker:旁白
「我可以聽她拉完，不代表我要變成她。」若音說。「那天我沒說完的，也許可以現在說。」
-> stage_afterword
=== stage_afterword ===
書籤後記：季晴回了一張演出邀請。若音坐在觀眾席，聽完整場，謝幕後兩人才在走廊裡見面。 # scene:counter # speaker:旁白 # section:afterword
她們沒有把那次爭吵說成誤會，只是第一次聽彼此把話講完。
~ ending_kind = "stage"
-> chapter_coda
=== end_score ===
若音在書店留下一本沒有封面的簿子。第一頁寫：「留一封信，換一段旋律。」她沒有保證每封都能寫完。 # speaker:旁白
黑貓在頁角留下爪印。她想擦，最後決定把那個不整齊的記號留著。
-> score_afterword
=== score_afterword ===
書籤後記：有人的信只有一句話，有人寫滿十頁。若音替他們寫短短的旋律，也把自己寫不出的日子留在簿子裡。 # scene:counter # speaker:旁白 # section:afterword
簿子漸漸厚了，沒有一頁標著「重新成為獨奏家」。
~ ending_kind = "score"
-> chapter_coda
=== end_echo ===
妳說既然她還能拉，就該再試一次大賽。若音看了一眼左手，沒有反駁，反而把熟悉的練習時程重新列出來。 # speaker:旁白
妳聽見她說「好」，卻沒問那是答應妳，還是答應自己。
-> echo_afterword
=== echo_afterword ===
書籤後記：她帶傷參賽，取得名次。海報重新貼上她的名字，某個雨夜，她又把那首未完成曲拉到最後一小節。 # scene:counter # speaker:旁白 # section:afterword
終止線後面仍是開頭的四個音。掌聲響起，她卻想不起自己上一次沒有痛地拉琴，是什麼時候。
~ ending_kind = "echo"
-> chapter_coda
=== chapter_coda ===
若音離開後，妳在鋼琴裡找到一只上了發條的八音盒。它播放的，正是她十歲寫下、剛才在茶杯邊聽見的四個音。 # scene:counter # speaker:旁白 # section:coda # clue:motif
手冊原本缺失的第一頁，被黑貓從櫃台下拖出來。紙邊有妳童年畫過的小月亮，墨水早已乾了。
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
