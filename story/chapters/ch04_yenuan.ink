// 第四夜：葉暖。獨立版本保護前三夜已保存的 Ink 位置。
VAR trust = 0
VAR understanding = 0
VAR intervention = 0
VAR previous_ending = ""
VAR tea_type = ""
VAR tea_garnish = "none"
VAR tea_quality = 0
VAR tea_emotional_match = 0
VAR hearth_heat = 50
VAR hearth_care = 0
VAR hearth_balanced = false
VAR letter_completion = 0
VAR letter_understood = false
VAR letter_alternate = false
VAR heard_mother = false
VAR noticed_waiting = false
VAR read_dawn_bread = false
VAR read_dawn_postmark = false
VAR read_dawn_cup = false
VAR read_anniversary_sign = false
VAR compared_performances = false
VAR read_anniversary_calls = false
VAR read_anniversary_ledger = false
VAR read_hospital_bench = false
VAR read_hospital_bag = false
VAR read_oven_wait = false
VAR read_oven_candles = false
VAR read_oven_note = false
VAR recipe_choice = ""
VAR recipe_sincere = false
VAR ending_kind = ""
-> arrival

=== arrival ===
門鈴響過兩聲，一個繫著麵粉圍裙的女人把麵包籃放上櫃台。夜裡還有一點烤箱的熱氣，籃底卻傳來焦味。 # scene:yenuan # speaker:旁白 # section:arrival
{
- previous_ending == "ruoyin-one":
    櫃台邊還留著若音寫給唯一聽眾的四個音。葉暖輕輕跟著哼了一句，才發現自己仍拿著切麵包的刀。 # speaker:旁白
- previous_ending == "ruoyin-stage":
    若音的票根被夾作書籤。葉暖看見日期，說晨麥那天也有人訂過演出後的麵包，卻沒有多問那場演出。 # speaker:旁白
- previous_ending == "ruoyin-score":
    若音的交換簿攤在櫃台，第一頁還空著。葉暖把麵包籃放在旁邊，問平凡的食譜能不能算一個故事。 # speaker:旁白
- previous_ending == "ruoyin-echo":
    一張比賽海報背面仍空白。葉暖抬眼看了看，低聲說店裡的週年海報也有張一直不敢收。 # speaker:旁白
- else:
    八音盒響了四個音又停下。葉暖把麵包籃移開一點，留出放茶杯的位置。 # speaker:旁白
}
我是晨麥的葉暖。剛打烊，順路送點宵夜。妳們開到這麼晚，總要吃東西吧？ # speaker:葉暖
她替妳切下一片，自己卻只拿著刀。黑貓從籃邊叼走一張沾了油的卡片，停在書架前等她。
* [先謝謝她，再問籃底那顆麵包]
    ~ trust += 1
    她把焦黑的一面翻到下面。「那顆烤過頭，不能賣。每年今天我都做一顆，天亮前扔掉。」 # clue:burnt-bread # speaker:葉暖
    -> observe
* [問她願不願意坐下吃一片]
    她說站著就好，仍把最柔軟的中間留給妳。輪到自己時，她把刀仔細擦乾淨。 # speaker:旁白
    -> observe
=== observe ===
她的圍裙口袋露出一盒沒有拆封的生日蠟燭。手背上的舊燙痕旁，還有今天新起的紅印。 # scene:yenuan # speaker:旁白 # section:observations # clue:candles # clue:burn-mark
黑貓把卡片推回她面前。正面是蘋果麵包配方，「等待二次發酵」被重重劃掉，紙背黏著薄薄的油漬。 # clue:recipe-card
今天是誰的生日？ # speaker:林澄
媽媽的。她說完立刻伸手整理麵包籃。「店裡明天還要開門，今晚本來該回去備料。」 # speaker:葉暖
* [問她為什麼劃掉等待的步驟]
    ~ noticed_waiting = true
    她說最近總等不了。「麵團稍微慢一點，我就想把火開大。可媽媽以前會叫我坐著，陪她喝完一杯茶。」 # speaker:葉暖
    -> tea_start
* [問她手上的燙傷是否需要先處理]
    ~ trust += 1
    她把手從圍裙裡拿出來。「下午碰到烤盤。謝謝妳看見。」她答應等茶泡好，先讓手涼一會。 # speaker:葉暖
    -> tea_start
=== tea_start ===
妳把茶罐排在烤箱餘溫旁。炭焙焙茶、薰衣草伯爵、蜜香紅茶都在，還有一小碟蘋果乾，可以隨熱水慢慢舒展。 # scene:counter # speaker:旁白 # section:tea
葉暖說自己喝什麼都行，視線卻一直停在那碟蘋果乾上。
為她泡一杯茶，讓她決定要不要說起那顆麵包。 # minigame:tea
-> DONE
=== tea_result ===
{
- tea_type == "hojicha" && tea_garnish == "apple":
    ~ trust += 2
    焙茶的烘香和蘋果乾的甜味升起。葉暖捧住杯子。「媽媽第一次教我做蘋果麵包，整個廚房也是這個味道。」 # scene:yenuan # speaker:葉暖 # section:hearth
- tea_type == "hojicha":
    ~ trust += 1
    焙茶的烘香使她想起清晨廚房。她看了看仍放在碟裡的蘋果乾，說：「我想起媽媽做麵包時，總先留一片蘋果給我。」 # scene:yenuan # speaker:葉暖 # section:hearth
- tea_type == "lavender":
    她喝了一口，慢慢把桌上的碎屑攏成一堆。「這味道像有人讓我坐下來。可是那件事說出來，好像會變成別人的故事。」 # scene:yenuan # speaker:葉暖 # section:hearth
- tea_type == "black":
    紅茶還燙，她已經起身替妳擦櫃台。妳把抹布放到一旁，提醒她手背正在痛。 # scene:yenuan # speaker:旁白 # section:hearth
- else:
    她聞了聞茶，不急著回答。書店裡的爐火還亮著，足夠陪她坐一會。 # scene:yenuan # speaker:旁白 # section:hearth
}
{
- tea_quality >= 90:
    ~ understanding += 1
    葉暖想起開店前的一個下午，母親在烤箱旁擺了兩只不同的杯子，只說：「這杯是妳的，不必等客人都走了才喝。」當時她把茶喝完，麵包仍在慢慢發酵。 # clue:two-cups-break # speaker:葉暖
- tea_quality >= 70:
    ~ trust += 1
    茶的香氣停在她手心。葉暖沒有起身收拾桌面，先讓那顆焦麵包留在籃子裡，說想把那天的事講清楚。 # speaker:旁白
- tea_quality >= 50:
    -> tea_followup
- else:
    茶太濃，她已經拿起抹布，說要替妳重泡一杯。妳看見她不是嫌這杯茶，而是把每次不如預期都當成自己該補做的工作。 # clue:tea-cleanup # speaker:旁白
}
-> tea_aftercare
=== tea_followup ===
葉暖接受了茶，眼睛卻仍盯著烤箱。妳可以問她為何不能等麵包慢慢發起來，也可以先讓她把杯子握暖。 # speaker:旁白
* [問她烤箱一安靜下來會想起什麼]
    ~ trust += 1
    「我會想起媽媽說『再等一下』。以前我以為她只是在教我做麵包。」葉暖望著焦黑的表面，沒有急著把它藏回籃底。 # clue:oven-pause # speaker:葉暖
    -> tea_aftercare
* [先讓她把杯子握暖]
    她坐了一會，才說：「我們不用趕在茶涼之前，把每件事都講完。」 # speaker:葉暖
    -> tea_aftercare
=== tea_aftercare ===
她指著牆邊的小烤爐。「妳們店裡也有爐。火若開太大，外皮先焦；等太久又會涼。」
葉暖開始說那年週年活動。妳在爐邊回應她，調整每一次傾聽的火候。 # minigame:hearth
-> DONE
=== hearth_result ===
{
- hearth_balanced:
    ~ understanding += 2
    爐火一直留在能照亮桌面的溫度。葉暖說完第一句，又自己接著說了第二句；妳沒有替她趕時間。 # scene:yenuan # speaker:旁白 # section:hearth
- hearth_heat > 70:
    ~ intervention += 1
    火太旺，葉暖把話說得像一份營業報表。「總之我沒去，事情就是這樣。」妳把火調小，等她重新看向爐裡。 # scene:yenuan # speaker:旁白 # section:hearth
- else:
    爐火低得幾乎看不見。她把卡片收入掌心。妳添了一小塊木柴，問她要不要先說一件比較輕的事。 # scene:yenuan # speaker:旁白 # section:hearth
}
黑貓從卡片下抽出一片沾著麵粉的紙。紙上的廚房，比書店明亮得多。
* [陪她回到清晨的廚房]
    -> dawn_kitchen
=== dawn_kitchen ===
天還沒亮，母親把第一團麵糰交到小葉暖手裡。她捏出一顆歪歪的蘋果麵包，怎麼收口都會裂開。 # scene:memory # speaker:旁白 # section:dawn-kitchen
母親沒有替她重做，只在旁邊揉自己的那顆。「先讓它睡一下，醒來就不一樣了。」
烤盤上有第一顆歪斜的麵包，桌角壓著食譜卡與兩只不同大小的杯子。 # speaker:旁白
-> dawn_hub
=== dawn_hub ===
麵糰在布巾下慢慢長大。葉暖沒有催妳，妳也可以等她把話說完。 # speaker:旁白
* {not read_dawn_bread} [請葉暖說說第一顆麵包最後如何]
    ~ read_dawn_bread = true
    ~ understanding += 1
    她笑了。「烤好更歪。媽媽說兩顆擺在一起，客人一眼就看得出是我們做的。」她終於拿起桌上一小片麵包。 # speaker:葉暖 # portrait:yenuan-thoughtful
    母親把形狀最不圓的一顆放在門口，第一位進來的客人偏偏選了它。小葉暖跟著笑，笑到麵粉沾上鼻尖。 # speaker:旁白
    -> dawn_hub
* {not read_dawn_postmark} [翻看食譜卡背面的代送郵戳]
    ~ read_dawn_postmark = true
    食譜卡背面蓋著沒有年份的郵戳，旁邊寫「程先生代送」。葉暖想起母親說過，那是雨航的父親在郵局工作時替她送到店裡的；卡片繞了一段路，仍回到這張桌上。 # clue:recipe-postmark # speaker:旁白
    她說母親那時常寄卡片給自己，即使兩人每天在同一間店裡工作。「她說，寫下來比較不會把等一下忘掉。」 # speaker:葉暖
    -> dawn_hub
* {not read_dawn_cup} [查看桌上兩只不同大小的杯子]
    ~ read_dawn_cup = true
    大杯裝著母親泡的茶，小杯留給還不敢碰熱水的小葉暖。兩人輪流把杯子放到布巾邊，提醒彼此先等麵糰醒來。 # speaker:旁白
    現在的葉暖伸手比了比小杯。「我後來用那個杯子學會喝茶，卻總忘記媽媽也會讓自己坐下。」 # speaker:葉暖
    -> dawn_hub
* [從麵粉袋下收起第一片食譜]
    -> dawn_end
=== dawn_end ===
食譜的第一片留在麵粉袋下。正面寫著揉麵的做法，背面是母親寫的「小暖」。 # fragment:flour # speaker:旁白
葉暖捏著紙角。「我後來學會把麵包做得一樣圓，卻一直記得第一顆歪的。」她看向烤盤，像在等妳說那是失敗的證據。 # speaker:葉暖
{
- read_dawn_bread && read_dawn_cup:
    妳見過母親把歪麵包擺在門口，也見過兩只杯子在布巾邊輪流停下。那天她們既把店打開，也留了時間一起等麵團。 # speaker:旁白
- read_dawn_bread:
    第一位客人選走最歪的那顆。葉暖說自己那時高興的不是賣出去，而是母親沒有叫她重新做。 # speaker:葉暖
- read_dawn_cup:
    她看著小杯，記得那個清晨曾有人陪她坐著，卻還不知道第一顆麵包最後去了哪裡。 # speaker:旁白
- else:
    烤盤上的麵包仍在，妳們沒有看清那天如何收場。葉暖暫時把這段記憶留在清晨，沒有替它補上後來的答案。 # speaker:旁白
}
* [問她第一次想把晨麥留給誰]
    「給媽媽，也給每天經過這條街的人。」葉暖說。「她說店門開著，總會有人帶著還沒吃早餐的心情進來。」 # speaker:葉暖
    她指著自己做的那顆，承認當年也想聽母親說一句「這是妳做的」。 # speaker:旁白
    -> dawn_depart
* [問她如今為何連一口麵包也不肯吃]
    「好像我一吃，就承認日子還能照常過。」她放下紙片。「可是我每天替別人切，店也一直開著。原來我早就讓日子往前走了，只是不肯讓自己跟上。」 # speaker:葉暖
    -> dawn_depart
=== dawn_depart ===
烤箱裡的第一盤麵包還歪著。葉暖沒有把它修圓；她把那片寫著「小暖」的紙帶往下一間店。 # speaker:旁白
* [走進晨麥的週年活動]
    -> anniversary
=== anniversary ===
店門口排著隊，葉暖與母親一起畫的招牌被燈照亮。手機在收銀機旁震動，醫院的號碼一次次亮起。 # scene:memory # speaker:旁白 # section:anniversary
母親那時已經住院。她希望葉暖關店回家，葉暖卻想完成兩人準備很久的週年活動。每次想到再五分鐘，五分鐘就又過了。
招牌、未接來電與活動帳本都留在收銀台旁。這裡沒有一張紙能單獨解釋整個晚上。 # speaker:旁白
-> anniversary_hub
=== anniversary_hub ===
隊伍還在移動。葉暖跟著妳停在櫃台內側，等妳看完要看的地方。 # speaker:旁白
* {not read_anniversary_sign} [查看母女一起畫的週年招牌]
    ~ read_anniversary_sign = true
    ~ understanding += 1
    「店裡那麼多人，都是媽媽以前一個個認識的。我想讓她知道，我能把我們的店照顧好。」她停了一會。「我也不想承認她可能看不到。」 # speaker:葉暖
    -> anniversary_sign_reflect
* {not read_anniversary_calls} [查看收銀台旁反覆亮起的手機]
    ~ read_anniversary_calls = true
    螢幕記著醫院的來電。葉暖說：「我知道它響了很多次。這句話我每天都對自己說。」妳沒有替她按下重撥。 # speaker:旁白
    -> anniversary_phone
* {not read_anniversary_ledger} [翻看活動帳本裡的備料欄]
    ~ read_anniversary_ledger = true
    最後一頁記著母親幾週前親手訂下的蘋果與麵粉，也留著葉暖後來自己改的份量。這場活動是兩人一起計畫的，當晚的選擇仍由葉暖承擔。 # speaker:旁白
    她摸著頁角說：「我想讓她看見，我能把我們的店照顧好。」妳把帳本放回去，沒有把那一晚的結局改寫成簡單的對錯。 # speaker:旁白
    -> anniversary_hub
* [收起活動傳單裡的第二片紙]
    -> anniversary_end
=== anniversary_sign_reflect ===
{
- previous_ending == "ruoyin-one":
    妳想起若音只為一個人彈的三分鐘。這塊招牌面向整條街，葉暖卻一直在找母親會站在哪裡。掌聲與被一個人看見，原來是兩種不同的願望。 # speaker:旁白
- previous_ending == "ruoyin-stage":
    妳想起若音親手送出的信，和她坐在台下聽完的那場演出。招牌上有母女一起畫的筆跡；葉暖想等母親來看，卻再也不能替那晚補一張觀眾席。 # speaker:旁白
- previous_ending == "ruoyin-score":
    若音的交換簿還留著空白，等人帶著自己的故事來。這塊招牌也由許多熟客記得；妳沒有因此說，客人能替葉暖回答母親當晚想說什麼。 # speaker:旁白
- previous_ending == "ruoyin-echo":
    妳想起若音那張仍在催她證明自己的比賽海報，沒有把滿座的店面當作葉暖今晚必須做到完美的理由。 # speaker:旁白
- else:
    妳看著招牌上的兩種筆跡。店裡很熱鬧，葉暖仍在等一個不在場的人看見它。 # speaker:旁白
}
* [問她滿座以外，最想讓母親看見什麼]
    ~ compared_performances = true
    ~ understanding += 1
    葉暖看著招牌角落一顆畫歪的蘋果。「那是我畫的。她說不要擦掉，這樣一眼就知道是我們一起做的。」 # speaker:葉暖
    「我想讓她看見，我也能留住自己做得不一樣的地方。」她把手從招牌邊緣收回，沒有說這足以抵過沒接到的電話。 # speaker:葉暖
    -> anniversary_hub
* [先把招牌放回，等她願意再說]
    ~ trust += 1
    葉暖讓招牌繼續朝著街道。妳沒有逼她替滿座的客人找出一個能代替母親的答案。 # speaker:旁白
    -> anniversary_hub
=== anniversary_phone ===
* [問她那時有沒有想過找人接手櫃台]
    葉暖說想過，卻怕把熟客交給不熟悉活動的人。「我現在知道可以請人幫忙。那晚的我，只覺得每一步都不能停。」 # speaker:葉暖
    -> anniversary_hub
* [責備她當時沒有立刻接電話]
    ~ intervention += 1
    她握緊手機。「我知道。」妳聽見她把這兩個字說得像每天都在說，便讓震動聲停下。 # speaker:旁白
    -> anniversary_hub
=== anniversary_end ===
第二片紙夾在活動傳單裡。正面列著蘋果與肉桂，背面有一句關於晨麥的話。 # fragment:apple # speaker:旁白
葉暖把傳單摺起又打開。「那天我一面覺得自己不能關店，一面知道手機又亮了。這兩件事都是真的。」 # speaker:葉暖
{compared_performances:她的目光落在招牌那顆畫歪的蘋果上。「我想讓她看到我做得不一樣的地方。可那晚我還是該接電話。」妳把這兩句話都留在桌上，沒有讓一句蓋過另一句。 # speaker:葉暖}
{
- read_anniversary_calls && read_anniversary_ledger:
    妳們看過未接來電，也看過母女一起訂料、葉暖後來改份量的帳本。一起準備過活動，不等於醫院那晚的電話可以被忽略；接錯了選擇，也不等於她從未愛過母親。 # speaker:旁白
- read_anniversary_calls:
    手機上留著未接來電。葉暖沒有請妳替她找藉口，只說自己曾一再對著亮起的螢幕說「再五分鐘」。 # speaker:葉暖
- read_anniversary_ledger:
    帳本記著母女一起備料，妳們卻尚未看手機裡的記錄。她說那晚自己既想守住店，也想去醫院，沒有把兩件事說成同一個願望。 # speaker:旁白
- else:
    妳們沒有翻看收銀台旁的記錄。葉暖願意說當時兩頭都想顧，妳沒有把未查的細節替她寫進傳單。 # speaker:旁白
}
* [問她當晚最不敢承認自己想要什麼]
    「我想讓媽媽看見我把店撐起來。」她說。「也想聽見她說，不必每一步都照她的方法。」 # speaker:葉暖
    她把傳單折成能放進口袋的大小，沒有把想被肯定當作那晚所有選擇的辯解。 # speaker:旁白
    -> anniversary_depart
* [問她現在若再忙不過來，會先找誰幫忙]
    葉暖說出熟客、隔壁店主和能輪班的學徒，說到學徒時停了停。「那晚我以為只有我能做。現在不能再讓這句話替我決定每一天。」 # speaker:葉暖
    -> anniversary_depart
=== anniversary_depart ===
隊伍的聲音退遠。葉暖把手機放進自己的口袋，說想親自看看那天以後留下的東西。 # speaker:旁白
* [陪她走到醫院走廊]
    -> hospital
=== hospital ===
醫院走廊的長椅空著。葉暖記得自己跑過自動門、記得牆上的鐘，卻把後來每一句話都藏在「我太晚到」裡。 # scene:memory # speaker:旁白 # section:hospital-return
手機裡有一則母親在活動當晚留下的語音。她存著，沒有刪，也沒有聽第二次。
長椅下有裝麵包的紙袋，掛號紙壓在椅背上；手機在她自己手裡。 # speaker:旁白
-> hospital_hub
=== hospital_hub ===
走廊很靜。葉暖可以先看別的，語音不會自己開始播放。 # speaker:旁白
* {not heard_mother} [問葉暖是否願意播放母親的語音]
    妳先問她。葉暖握著手機，沒有立刻回答。 # speaker:林澄
    -> hospital_phone
* {not read_hospital_bench} [查看長椅背上的掛號紙]
    ~ read_hospital_bench = true
    掛號紙上的時間比她趕到的時間早。葉暖盯著那個差距，妳請她說說從車站跑進來以後還記得什麼。 # speaker:旁白
    她記得有人替她扶著門，也記得自己當時喘得說不出話。那一晚沒有因為這些細節變得容易，卻不再只剩牆上的鐘。 # speaker:葉暖
    -> hospital_hub
* {not read_hospital_bag} [打開長椅下裝麵包的紙袋]
    ~ read_hospital_bag = true
    袋裡有一片沒有吃完的蘋果麵包，旁邊是母親從病房帶來的紙巾。葉暖說：「她以前每次看我忙，都先問我吃了沒有。」 # speaker:葉暖
    她把紙袋重新摺好。這不是替那晚補上的告別，只是她仍記得母親怎樣照顧人。 # speaker:旁白
    -> hospital_hub
* [帶著尚未回答的問題走向老烤箱]
    -> hospital_end
=== hospital_phone ===
* [等她自己按下播放]
    ~ heard_mother = true
    ~ understanding += 1
    葉暖按下播放。母親的聲音很輕：「店裡一定很忙。妳先把麵包分給大家。小暖，忙完記得吃一片。」語音沒有說她該放棄店，也沒有替那晚改寫結局。 # clue:voicemail # speaker:葉暖的母親
    -> hospital_hub
* [讓她先把語音留在手機裡]
    ~ trust += 1
    她把手機放回口袋，說今天還沒有準備好。妳們一起坐到走廊的燈慢慢暗下來，她把語音留著。 # speaker:旁白
    -> hospital_hub
=== hospital_end ===
葉暖說：「如果我有一天不再怪自己，是不是就表示我不在乎她了？」妳沒有替她回答，把食譜卡遞回她手裡。
{
- heard_mother && read_hospital_bag:
    她聽過母親要她分麵包、記得自己也要吃的語音，也看過紙袋裡剩下的一片。這些不是那晚的赦免書；那是母親直到最後仍用熟悉的方式關心她。 # speaker:旁白
- heard_mother:
    她把手機握在掌心，說自己終於聽完那則語音，卻還需要時間想它與自己的選擇如何同時存在。 # speaker:葉暖
- read_hospital_bag:
    紙袋還留著麵包與紙巾。她沒有播放語音，妳也沒有拿袋裡的東西猜母親最後想說的話。 # speaker:旁白
- else:
    語音和長椅下的紙袋都還沒看完。葉暖仍能帶著問題離開走廊，不必為了繼續故事而重聽她尚未準備好的聲音。 # speaker:旁白
}
* [問她若不靠責備，還想用什麼記得母親]
    「她切蘋果時會留最薄的一片給我。」葉暖說。「有時我想起來的不是醫院，是清晨桌上的那兩只杯子。」 # speaker:葉暖
    她說這些記憶不會因為自己有一天笑了，就被那天晚上拿走。 # speaker:旁白
    -> hospital_depart
* [陪她先承認今晚仍然難過]
    妳陪她坐回長椅。葉暖說自己現在還不能說不怪自己，也不想再每天只用「我太晚到」介紹母親。 # speaker:葉暖
    她把卡片翻回有麵粉痕的一面，決定先去看完食譜。 # speaker:旁白
    -> hospital_depart
=== hospital_depart ===
走廊的燈沒有替她答應明天會好過。葉暖自己起身，帶著手機與食譜卡，走回那台已經熄火的烤箱。 # speaker:旁白
* [回到熄火的老烤箱]
    -> old_oven
=== old_oven ===
晨麥的舊烤箱已經熄火。門上的玻璃映著兩個人：一個是小葉暖，一個是如今還戴著圍裙的她。 # scene:memory # speaker:旁白 # section:old-oven
烤箱旁有被劃掉的等待步驟、沒有拆封的生日蠟燭，還有油漬黏住的紙角。她伸手去掀，停下來問妳能不能再等一會。 # speaker:旁白
-> oven_hub
=== oven_hub ===
火已經熄了，不用急著把它重新點起來。葉暖仍站在烤箱旁。 # speaker:旁白
* {not read_oven_wait} [陪她看見被劃掉的二次發酵]
    ~ read_oven_wait = true
    ~ noticed_waiting = true
    ~ understanding += 1
    她用手指順著重重的劃痕走。「我以為等，就會錯過她。可麵包不肯照我的速度長大。」 # speaker:葉暖
    妳把「等待」兩字重新寫在便條上，交給她自己決定要不要放回食譜。她沒有擦掉劃痕，也沒有把便條丟掉。 # speaker:旁白
    -> oven_hub
* {not read_oven_candles} [查看烤箱旁未拆封的生日蠟燭]
    ~ read_oven_candles = true
    盒子上的日期是母親的生日。葉暖說自己每年都買新的，卻一次也沒有點燃；她怕一點火，就得說一句自己還說不出口的祝福。 # speaker:葉暖
    妳說今晚可以先把盒子帶回去。她放進口袋，沒有答應明年一定要點。 # speaker:旁白
    -> oven_hub
* {not read_oven_note} [掀起被油漬黏住的食譜紙角]
    ~ read_oven_note = true
    紙背露出母親細細的筆跡：「麵包要等，人也要。」葉暖先讀了這一句，沒急著把整片撕下來。 # speaker:旁白
    她問能不能在書店裡慢慢拼。妳說可以，食譜不會因為再等一杯茶就失去味道。 # speaker:林澄
    -> oven_hub
* [將第三片食譜收好，回書店]
    -> oven_end
=== oven_end ===
她把紙放在掌心，等到手不再發抖才打開。「今晚至少能先把它讀完。」 # speaker:葉暖
紙片正面寫著等待與火候，背面寫著母親對她往後生活的願望。 # fragment:waiting # speaker:旁白
黑貓坐在烤箱邊，等妳們帶著三片紙回書店。
{
- read_oven_wait && read_oven_note:
    妳們看過被劃掉的等待，也讀到紙背的第一句。葉暖說：「媽媽叫我等，不是叫我把店永遠停在她離開的那天。」她還沒讀完其餘文字，先把紙角小心放平。 # speaker:葉暖
- read_oven_candles:
    她摸到口袋裡未拆的蠟燭。「我今年可以帶它回家。點不點，明天再決定。」 # speaker:葉暖
- else:
    烤箱旁還有沒看的痕跡。她把三片紙帶回書店，說不想在黑暗裡把黏住的字硬撕開。 # speaker:旁白
}
* [問她想保存的是母親的味道，還是與母親一起做麵包的時刻]
    「都有。」葉暖說。「有些日子我想照她寫的做，有些日子我想讓她看看我現在會做什麼。」 # speaker:葉暖
    她把食譜正面朝上放好，也留了位置給背面。 # speaker:旁白
    -> oven_depart
* [問她若這次麵包仍烤焦，會怎麼做]
    她沉默了一會。「先讓它冷下來，再看看哪一步出了問題。也許我能吃掉比較不焦的一片。」 # speaker:葉暖
    她沒有說從此都不會難過，只是沒再把一顆麵包的顏色當成自己愛得夠不夠的證據。 # speaker:旁白
    -> oven_depart
=== oven_depart ===
老烤箱沒有重新亮起。葉暖說書店的桌子比較明亮，可以慢慢把正反兩面都排出來。 # scene:yenuan # speaker:旁白
* [把食譜正反兩面拼起來]
    -> letter_start
=== letter_start ===
三片紙的正面是蘋果麵包食譜，背面是母親留給葉暖的短箋。可以分別排列，再交還給她。 # scene:counter # speaker:旁白 # section:letter # minigame:letter
-> DONE
=== letter_result ===
{
- letter_understood:
    ~ understanding += 2
    葉暖先照正面讀完配方，才翻到背面。「哪天做出不一樣的味道，記得留一口給我。」她把那句話讀了兩遍。 # scene:yenuan # speaker:旁白 # section:response
- letter_completion >= 50:
    她看出卡片兩面都有字，把尚未拼好的部分留給自己。至少今晚，她知道母親還留了一句話給她。 # scene:yenuan # speaker:旁白 # section:response
- else:
    紙片還散著。葉暖把它們放進空白信封，說明天早上光線好一點時，再慢慢拼。 # scene:yenuan # speaker:旁白 # section:response
}
食譜最後一格還空著。葉暖拿起筆，卻先看了一眼籃底那顆焦掉的麵包。「我想把它填完。但我得先知道，是為了媽媽，還是怕再做錯一次。」 # speaker:葉暖
{compared_performances:她想起招牌角落那顆畫歪的蘋果，把筆尖停在空格上。「那天我不敢讓店停，現在我可以先想清楚要寫什麼。」 # speaker:葉暖}
* [問她想留下哪一口，讓自己也能吃下去]
    ~ recipe_sincere = true
    葉暖把筆放下。「我可以記得她，也可以承認我還想吃新的味道。留一口給她以前，我想先替自己留一口。」 # speaker:葉暖
    -> recipe_options
* [催她趕快填好，明早還要拿去賣]
    她把筆握緊。「我知道明天要開門。」她說。「但如果只是為了趕上明天，我又會忘記這張卡片背面寫給誰。」 # speaker:葉暖
    妳讓她把紙放平，等她決定是否還要寫。 # speaker:旁白
    -> recipe_options
=== recipe_options ===
她把空格留在自己面前，請妳先聽她說想怎麼做。 # speaker:旁白
* [照媽媽的配方，保留原來的味道]
    ~ recipe_choice = "original"
    她把母親寫的比例重新抄好。「我想先做一次，讓常客記得這個味道。」 # speaker:葉暖 # section:recipe-choice
    -> final_choice
* [問葉暖想不想加入自己喜歡的柚子]
    ~ recipe_choice = "new"
    她想了一會，把柚子皮細細削進蘋果餡。「媽媽沒做過這個。可是我想讓她嚐嚐。」 # speaker:葉暖 # section:recipe-choice
    -> final_choice
=== final_choice ===
烤箱還有餘溫。葉暖看著桌上的蠟燭與麵包籃，說明早開店以前，想先決定自己要做什麼。 # scene:yenuan # speaker:旁白 # section:response
* {letter_understood && hearth_balanced && recipe_sincere && recipe_choice == "new"} [陪她烤一顆新的麵包，留一口給母親]
    -> end_share
* {recipe_choice == "original"} [讓原配方重新上架，說出母親的故事]
    -> end_reopen
* [問她是否願意讓晨麥休息一週]
    -> end_rest
* [要求她完全複製母親的麵包，不許改動]
    ~ intervention += 2
    -> end_copy
=== end_share ===
柚子的香氣混進烤蘋果裡。葉暖等到麵團真正醒來才開火，出爐後切下一小片，放在母親生日的蠟燭旁。 # speaker:旁白
「媽媽，這次是我做的。」她沒有點燃蠟燭，只坐在爐邊，自己也吃了一口。
-> share_afterword
=== share_afterword ===
書籤後記：晨麥多了一款柚子蘋果麵包。葉暖有時仍會為那晚難過；想起母親時，她會先讓自己坐下吃一片。 # scene:counter # speaker:旁白 # section:afterword
母親的原配方仍收在店裡，新配方寫在它旁邊。她把兩張卡片都留下。
~ ending_kind = "share"
-> chapter_coda
=== end_reopen ===
葉暖把劃掉的等待重新寫上去，照母親的比例烤出一盤。隔天她對第一位常客說：「這是我媽媽教的。」 # speaker:旁白
她沒有假裝母親還在店裡，也沒有把那天說成一個沒有傷口的故事。
-> reopen_afterword
=== reopen_afterword ===
書籤後記：蘋果麵包重新放上晨麥的架子。葉暖把母親的名字寫在價牌背面，偶爾會拿給熟客看。 # scene:counter # speaker:旁白 # section:afterword
她知道自己將來也可以改配方；今天，她先把這個味道好好留下。
~ ending_kind = "reopen"
-> chapter_coda
=== end_rest ===
葉暖在晨麥門上寫：「休息一週，下週見。」寫完，她站在路邊看了一會，沒有把告示撕下來。 # speaker:旁白
她帶著生日蠟燭回家，第一次允許這一天只有想念，沒有營業額。
-> rest_afterword
=== rest_afterword ===
書籤後記：一週後她重新打開店門，先整理烤箱，再決定當天做什麼。店仍是她的，休息也由她決定。 # scene:counter # speaker:旁白 # section:afterword
她還沒烤蘋果麵包，卻不再把空著的那格當成必須補上的缺口。
~ ending_kind = "rest"
-> chapter_coda
=== end_copy ===
妳說改動配方會讓母親的味道消失。葉暖把柚子皮收回罐裡，逐克量好材料，連烤盤的位置也照舊照片擺。 # speaker:旁白
麵包出爐時香氣一模一樣，她卻沒有拿起第一片。「如果下次差了一點呢？」
-> copy_afterword
=== copy_afterword ===
書籤後記：晨麥天天賣出漂亮的蘋果麵包。葉暖每晚重算比例，不讓任何人代做；母親留下的卡片漸漸被翻得起毛。 # scene:counter # speaker:旁白 # section:afterword
她守住了味道，仍害怕自己一旦停下，就會失去最後能抓住的東西。
~ ending_kind = "copy"
-> chapter_coda
=== chapter_coda ===
葉暖離開後，黑貓把食譜卡帶回櫃台。卡片右下角印著夜行書店的月亮標誌，落款日期卻早於葉暖出生。 # scene:counter # speaker:旁白 # section:coda # clue:moon-card
妳翻看店員手冊，想起自己很小的時候也曾在這裡看過那枚月亮。桌沿刻著一道淺淺的身高線，旁邊寫著「林澄」。 # clue:childhood-glimpse
那不是妳第一次走進夜行書店。黑貓用尾巴蓋住日期，像還要等妳自己想起來。
窗外仍是夜色。妳把食譜卡放進手冊，讓葉暖的那一頁與自己的名字並排。
-> final_bookmark
=== final_bookmark ===
{
- ending_kind == "share":
    爐火旁有蘋果與柚子的香氣。葉暖替母親留下一口，也替自己留下一口。 # scene:moon-sea # ending:yenuan-share
- ending_kind == "reopen":
    晨麥明天仍會出爐。原來的配方，終於可以由葉暖親口說起。 # scene:moon-sea # ending:yenuan-reopen
- ending_kind == "rest":
    晨麥的門上寫著「下週見」。這一週，葉暖可以先照顧自己。 # scene:moon-sea # ending:yenuan-rest
- else:
    麵包每天都像照片裡一樣。葉暖仍在每一個晚上，害怕明天會有不同。 # scene:moon-sea # ending:yenuan-copy
}
-> END
