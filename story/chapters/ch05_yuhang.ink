// 第五夜：程雨航。獨立編譯，保護既有 Ink 存檔位置。
VAR trust = 0
VAR understanding = 0
VAR intervention = 0
VAR previous_ending = ""
VAR tea_type = ""
VAR tea_garnish = "none"
VAR tea_blend = 0
VAR tea_quality = 0
VAR tea_emotional_match = 0
VAR route_correct = 0
VAR route_detours = 0
VAR letter_completion = 0
VAR letter_understood = false
VAR letter_alternate = false
VAR letter_stamp = "none"
VAR read_ledger = false
VAR saw_lease = false
VAR heard_dream = false
VAR read_postcard = false
VAR read_postmark = false
VAR read_post_ledger = false
VAR read_bus_leave = false
VAR read_bus_ticket = false
VAR read_bus_window = false
VAR read_shop_lease = false
VAR read_shop_key = false
VAR read_shop_shelf = false
VAR read_door_photo = false
VAR read_door_stamp = false
VAR read_door_address = false
VAR compared_postmarks = false
VAR looked_bag = false
VAR asked_keyring = false
VAR asked_route_left = false
VAR read_post_slot = false
VAR asked_bus_seat = false
VAR asked_first_visit = false
VAR asked_route_rest = false
VAR asked_home = false
VAR asked_sister = false
VAR asked_nightshift = false
VAR waited_quietly = false
VAR named_detour = false
VAR asked_alone = false
VAR asked_father = false
VAR promise_frame = ""
VAR rested_on_shift = false
VAR asked_dream_station = false
VAR walked_to_door = false
VAR finished_cup = false
VAR told_recipe = false
VAR sister_word = ""
VAR tried_stamp = false
VAR key_choice = ""
VAR lincheng_card = ""
VAR today_first = ""
VAR future_reminder = ""
VAR past_lid = ""
VAR unknown_parting = ""
VAR ending_kind = ""
VAR kept_ledger_closed = false
VAR read_recipient_line = false
-> arrival

=== arrival ===
一點四十二分，雨聲沿著門框往下滑。一位穿深藍雨衣的送信人站在門外，把郵袋壓在膝旁，不肯跨過門檻。 # scene:yuhang # speaker:旁白 # section:arrival
{
- previous_ending == "yenuan-share":
    櫃台留著一小片柚子麵包。送信人聞到香氣，說父親以前替晨麥送過食譜卡；他直到今晚才知道卡片又回到那張桌上。 # speaker:旁白
- previous_ending == "yenuan-reopen":
    晨麥第一爐的日期還寫在紙條上。送信人認出店名，說父親替那家店送過一張沒有年份的食譜卡。 # speaker:旁白
- previous_ending == "yenuan-rest":
    門邊放著晨麥休息一週的小牌。送信人停步看了看，說原來暫停營業也可以留下回來的日期。 # speaker:旁白
- previous_ending == "yenuan-copy":
    食譜卡上被描重的舊字還在。送信人看見背面的代送郵戳，認出那是父親在郵局工作時的筆跡。 # speaker:旁白
- else:
    櫃台有一點麵包香。送信人把郵袋放在門邊，沒有立刻跨進來。 # speaker:旁白
}
麻煩簽收。雖然我不知道，是誰要收。 # speaker:程雨航
他遞來一封藍色信。收件人先寫著「七年後仍在送信的程雨航」，墨色慢慢移動，最後只留下他的名字。
我是程雨航。這裡只是派送地址，我還有別的件要送。 # speaker:程雨航
他說「還有別的件」時，目光卻停在自己那封信上。袋口繫著一條褪色的藍繩，繩結被反覆拆開又打回去；上面的水不是今夜才沾到的。
* [先讓他確認簽收欄，不替他簽名]
    ~ trust += 1
    他看了看信封，沒有把它收回去。「寄件人呢？那一欄也是我的字。」 # speaker:程雨航
    妳把信封翻到背面。寄件人欄的字比收件人欄小，筆畫壓得很重，像寫的人很怕它被雨沖掉。 # speaker:旁白
    -> observe
* [問他要不要進來躲雨]
    他說沒關係，卻把郵袋往屋簷下挪了一點。黑貓坐在門檻正中間，替他留了一條進來的路。 # speaker:旁白
    -> observe
=== observe ===
郵袋內的信都乾燥，唯有這封藍色信滲著雨水。袋側派送簿的最後一頁，反覆寫著「明年再開始」。 # scene:yuhang # speaker:旁白 # section:observations # clue:wet-envelope # clue:delivery-ledger
他的鑰匙圈是一間小書店的木製模型。妳問起回家的方向，他能背出整條街的門牌，卻避開自己的住址。 # clue:wooden-shop
書店模型的一扇窗還沒刻完。他用拇指擋住那個缺口，報出下一條街的收件戶數，像是多說一個地址，今晚就能少留一點時間給自己。
妳把簽收單攤在櫃台邊。收件人欄、寄件人欄與日期欄都是同一種藍墨水，只有簽收欄空著。雨航的手指沿著欄位邊緣走了一遍，像在核對別人的單據，走到簽收欄就停住了。 # speaker:旁白
-> observe_hub
=== observe_hub ===
他說還要趕下一站，雨衣下擺卻已在門邊積了一小灘水。 # speaker:旁白
* {not asked_route_left} [問他今晚還剩幾戶沒送]
    ~ asked_route_left = true
    「十一戶。」他不用翻簿子。「河堤那排公寓四戶，轉角診所一件掛號，再過去是麵店樓上；那位老太太會在門縫底下塞一顆糖給送信的人。」 # speaker:程雨航
    他說得很順，連哪一戶的信箱卡住、哪一家的狗會叫都記得。夜班的人多半只認得門牌，他卻記得門牌後面的人什麼時候關燈。 # speaker:旁白
    「送到最後一戶，天差不多就亮了。」他頓了一下，「然後我走回局裡。那段路上沒有要送的東西，是一天裡最長的一段。」 # speaker:程雨航
    -> observe_hub
* {not looked_bag} [看看郵袋裡為什麼只有藍色信是濕的]
    ~ looked_bag = true
    妳請他打開郵袋。其他信都套著防水袋，依街道順序排得整整齊齊；藍色信卻沒有套子，夾在最底層，像是被人匆忙塞進去。 # speaker:旁白
    「它每年都會出現。我換過三個郵袋，它還是濕的，好像一直停在我撿到它的那場雨裡。」 # speaker:程雨航
    他說得很平，像在報一件查不到收件人的郵件。妳注意到，他沒有說那場雨是哪一天。 # speaker:旁白
    -> observe_hub
* {not read_ledger} [問派送簿為何停在明年]
    ~ read_ledger = true
    「我寫給自己的備忘。」他合上簿子。「每年換一次年份，算不上什麼大事。」他說完又看了一眼那封信。 # speaker:程雨航
    合上前，妳瞥見每個「明年」底下都有橡皮擦過的痕跡。被擦掉的不是年份，而是原本寫好的月份與日期。 # speaker:旁白
    -> observe_hub
* {not asked_keyring} [問那間木製書店是誰做的]
    ~ asked_keyring = true
    ~ trust += 1
    「妹妹。」他把鑰匙圈放回口袋。「她以前說，我們可以賣書，也可以去旅行。後來她沒能去了。」 # speaker:程雨航
    -> observe_hub
* {not asked_home} [問他送完今晚的件以後回哪裡]
    ~ asked_home = true
    「回局裡交簿子。」他答得很快。妳再問交完以後呢，他說隔壁區的早班也缺人。 # speaker:程雨航
    「我住的地方離郵局不遠。」他沒有說出街名。「反正白天只是睡覺，住哪裡都一樣。」 # speaker:程雨航
    妳問他白天睡得著嗎。他說拉上兩層窗簾就可以，只是醒來常常分不清是早上還是傍晚，要看手機才知道自己該不該出門。 # speaker:旁白
    -> observe_hub
* [請他先把郵袋放下，茶一會兒就好]
    -> tea_start
=== tea_start ===
妳把茶席移到門邊。薄荷可加檸檬與淡紅茶；洋甘菊旁有蜂蜜，焙茶旁放著蘋果乾。 # scene:counter # speaker:旁白 # section:tea
雨航仍站著，卻把郵袋放在地上。他說只喝幾口，等雨停了就走。
妳燒水時，他一直看著妳的手，像在看別人怎麼分揀郵件。水壺鳴了一聲，他下意識往門口轉頭，過了一下才想起那不是誰在按門鈴。 # speaker:旁白
為雨航泡茶；他可以自己決定要停多久。 # minigame:tea
-> DONE
=== tea_result ===
{
- tea_type == "mint" && tea_garnish == "lemon" && tea_blend >= 15:
    ~ trust += 2
    薄荷與檸檬的清香混進妳倒入的淡紅茶。雨航慢慢喝了一口，第一次沒有看門外的路況。「妹妹也喜歡把檸檬放在熱茶裡。」 # scene:yuhang # speaker:程雨航 # section:mail-route
- tea_type == "mint" && tea_blend >= 15:
    ~ trust += 1
    妳倒入少許淡紅茶，讓薄荷的清涼有了溫潤的底色。雨航看著碟裡未用的檸檬，仍把杯子放穩。 # scene:yuhang # speaker:旁白 # section:mail-route
- tea_type == "mint" && tea_garnish == "lemon":
    ~ trust += 1
    薄荷與檸檬清亮地留在杯裡。妳沒有加淡紅茶，雨航說這味道也像妹妹在夏天泡的茶。 # scene:yuhang # speaker:程雨航 # section:mail-route
- tea_type == "mint":
    ~ trust += 1
    薄荷使他清醒了一些。他看見碟裡的檸檬仍在，說妹妹以前總會替熱茶加上一片；今晚他先把杯子放穩。 # scene:yuhang # speaker:程雨航 # section:mail-route
- tea_type == "chamomile" && tea_garnish == "honey":
    洋甘菊裡的蜂蜜慢慢化開。雨航捧著茶杯，竟短短睡著了。夢裡妹妹站在一座車站，說：「你不用替我把每一站都走完。」醒來後他把那句話寫進派送簿。 # scene:yuhang # speaker:程雨航的妹妹 # section:mail-route
- tea_type == "chamomile":
    洋甘菊使他的肩膀鬆了一點。他說若是喝得再慢些，也許會想起妹妹曾在車站說過的話；今晚他先坐著，沒有替那句話補上內容。 # scene:yuhang # speaker:程雨航 # section:mail-route
- tea_type == "hojicha" && tea_garnish == "apple":
    蘋果乾的甜香混進焙茶，雨航想起家中晚飯後妹妹總把蘋果切成很薄的片。他急著說該去下一站，杯子卻還握在手裡；妳沒有攔他，只讓茶放在他能再拿到的地方。 # scene:yuhang # speaker:旁白 # section:mail-route
- tea_type == "hojicha":
    焙茶使他想起家中的餐桌。他急著說自己該去下一站；妳請他先把杯子放穩，他仍坐了一小會。 # scene:yuhang # speaker:旁白 # section:mail-route
- else:
    他把茶杯握在手裡。雨沒有停，派送路線還在；此刻可以先看清信上的地址。 # scene:yuhang # speaker:旁白 # section:mail-route
}
{
- tea_quality >= 90:
    ~ understanding += 1
    雨航想起妹妹曾在派送簿背面寫：「先問懂書的人，書架要怎麼固定。」他們那時連第一站都沒決定，卻已一起想過一件做得到的小事。 # clue:sister-route-note # speaker:程雨航
- tea_quality >= 70:
    ~ trust += 1
    茶讓他肯坐到郵袋旁。他仍記得路線，卻先把今晚尚未送完的信放好，沒有催妳立刻簽收。 # speaker:旁白
- tea_quality >= 50:
    -> tea_followup
- else:
    雨航只喝一口，便問是不是該把茶送去別桌。他連不是郵件的杯子也想替人送達，卻一直不肯看信封上自己的姓名。 # clue:delivery-reflex # speaker:旁白
}
-> tea_mood
=== tea_followup ===
雨航把杯子放在郵袋旁，身體卻仍朝向門。妳可以問他自己的住址，或讓他先看清那封信的收件欄。 # speaker:旁白
* [問他若寄給自己會寫哪個住址]
    ~ trust += 1
    「我記得每個人的門牌，卻很久沒寫過自己的。」他念出住處的街名，第一次沒有用派送路線代替回答。 # clue:own-address # speaker:程雨航
    -> tea_aftercare
* [讓他先看清信的收件欄]
    ~ read_recipient_line = true
    他把信翻正，承認上面寫的是自己的名字。「地址等我想好再填。」 # speaker:程雨航
    -> tea_mood
=== tea_mood ===
{
- tea_type == "chamomile" && tea_garnish == "honey":
    -> chamomile_wake
- tea_type == "hojicha":
    -> hojicha_leave
- else:
    -> tea_aftercare
}
=== chamomile_wake ===
雨航醒來時先摸郵袋，像怕它在夢裡被人拿走。「我睡著了？」他低頭看錶，「我在班上從來不睡。」 # speaker:程雨航
派送簿上那行剛寫下的字還沒乾。他看著它，一時不確定該先道歉，還是先把夢記完。 # speaker:旁白
* [告訴他，睡著的這幾分鐘沒有漏掉任何一封信]
    ~ rested_on_shift = true
    ~ trust += 1
    他還是把郵袋打開，一封一封點過，數目沒有少。「原來停下來，信也還在。」他說得很慢，像第一次核對這件事。 # speaker:程雨航
    -> tea_aftercare
* [問他夢裡的車站是哪一站]
    ~ asked_dream_station = true
    ~ understanding += 1
    「不是任何一條線上的站。」雨航閉了一下眼睛。「月台很短，只有一張長椅。她沒有上車，也沒有叫我上車，只是坐著等我自己決定。」 # speaker:程雨航
    他把「沒有叫我上車」也寫進派送簿，寫在妹妹那句話下面。 # speaker:旁白
    -> tea_aftercare
=== hojicha_leave ===
焙茶的味道讓書店像晚飯後的餐桌。雨航說到家裡的廚房，忽然站起來扣上郵袋。「差不多了，我還有一區沒送。」 # speaker:程雨航
他的杯子還剩一半。茶的熱氣還在，他人已經朝門口走了兩步。 # speaker:旁白
* [讓他走到門口，不攔他]
    ~ walked_to_door = true
    ~ trust += 1
    雨航握住門把，門外的雨聲一下子變大。他站了一會，沒有推門，自己走回來坐下。 # speaker:旁白
    「我每次話說到家，就想走。」他把郵袋放回椅腳，「不是因為還有信。是因為家那一站，我不知道要怎麼下車。」 # speaker:程雨航 # portrait:yuhang-worried
    -> tea_aftercare
* [請他把茶喝完再走，路線不會跑掉]
    ~ finished_cup = true
    他猶豫了一下，坐回來把剩下的半杯喝完。杯底有一點茶渣，他盯著看。 # speaker:旁白
    「家裡的茶，我好像都只喝到一半就出門。」他把空杯推回妳面前，這次沒有急著站起來。 # speaker:程雨航
    -> tea_aftercare
=== tea_aftercare ===
藍色信的地址又變了。郵戳、雨痕與字跡分別指向一處地方；桌面像城市地圖一樣展開。
雨航把杯子挪開，讓出桌面的一角。他說每次出班前都會先在腦中走一遍整條路線，今晚卻是第一次不知道哪一站該排在最前面。 # speaker:旁白
依三個線索選擇投遞地點。走錯不會失敗，也會看見雨航避開的某段生活。 # minigame:route
-> DONE
=== route_result ===
{
- route_correct == 3:
    ~ understanding += 1
三條地址都能在舊地圖上找到。雨航說，這些地方他曾經想去，後來只從它們門前經過。 # scene:yuhang # speaker:旁白 # section:mail-route
- route_detours > 0:
    你們走過幾條沒有寫在信上的路。雨航指出哪戶人家搬走、哪間店關了，卻發現自己很久沒有問過那些人後來如何。 # scene:yuhang # speaker:旁白 # section:mail-route
- else:
    地址仍在雨裡變換。你們先從那個已拆除的郵局找起。 # scene:yuhang # speaker:旁白 # section:mail-route
}
他說自己會送到，卻不確定那究竟算誰的信。你們先走向第一個仍記得的地方。
雨航照習慣走在前面，遇到轉角卻停下來等妳。他知道送達一封信需要地址，今晚第一次試著問：收件人若不想打開，算不算送達？
妳沒有答。妳想起書架上那些等了很久才被讀到的信，它們被收上架的時候，也沒有人能說那算不算送到。雨航聽完點點頭，把郵袋的背帶往肩上拉緊。 # speaker:旁白
* [到已拆除的老郵局]
    -> old_post_office
=== old_post_office ===
郵局只剩牆角的紅色漆線。七年前，雨航和妹妹坐在階梯上，替未來的旅行書店寫明信片：賣二手書，沿海走，冬天回來。 # scene:memory # speaker:旁白 # section:old-post-office
妹妹畫了一輛很小的書車，說若租不到店，先在市集擺一張桌子也好。
雨航記得自己當時拿尺畫出店面平面圖，妹妹卻在旁邊把車輪畫得比書架還大。她說書賣完也可以去看海，隔年換一座城市；他回她，至少先算清楚房租。兩人在明信片背面各寫了半張清單，誰也沒劃掉對方的字。
拆除後的空地圍著鐵皮，只有階梯還留著。第三級石階缺了一角，那是妹妹以前固定坐的位置；她說坐在那裡，父親下班推門出來時，第一眼就看得到她。雨航站在階梯下，沒有坐上去。 # speaker:旁白
階梯上留著那張明信片、舊郵戳與派送簿。雨航不催妳選哪一件。 # speaker:旁白
-> post_hub
=== post_hub ===
雨水把紅漆線映得像還有人在這裡排隊。 # speaker:旁白
* {not read_post_slot} [看看牆角那個被封住的投信口]
    ~ read_post_slot = true
    紅漆線旁還留著半截磚牆，投信口被一片鐵板焊死，邊緣生了鏽。上方的字只剩「本埠」兩個。 # speaker:旁白
    「小時候我爸讓我們在這裡投信。」雨航用指節敲了敲鐵板，聲音很悶。「妹妹每次都把耳朵貼在牆上，說要聽信掉到底的聲音。她說聽到了，才算寄出去。」 # speaker:程雨航
    「後來我送了那麼多信，從來沒有等過哪一封落到底。」他把手收回來，「放進信箱，我就走了。」 # speaker:程雨航
    -> post_hub
* {not read_postcard} [翻看妹妹畫了書車的明信片]
    ~ read_postcard = true
    ~ heard_dream = true
    ~ understanding += 1
    「她每次答案都不同。」雨航笑了一下。「後來我只記得租店、存錢，忘了她其實喜歡那張市集的桌子。」 # clue:postcard # speaker:程雨航
    清單寫得很滿，頁角卻有一行：「做不到也可以改。」雨航把字指給妳看，沒有立刻解釋。 # clue:postcard # speaker:旁白
    明信片上有三個被雨航改過的店名，妹妹在旁邊添了一句「還沒決定」。他一直把那句當成玩笑，如今才看見他們那時容得下不確定。
    -> post_hub
* {not read_postmark} [辨認明信片上的舊郵戳]
    ~ read_postmark = true
    郵戳是七年前的日期，寄送地址卻只寫「等我們準備好」。雨航摸著凹下的數字，說那時他們連第一站在哪裡都沒定。 # speaker:旁白
    他把日期和妹妹離開的年份核對了兩次，才發現這張卡是在她還能一起討論時寫的。那個「我們」原本指兩個正在商量的人，並不是一張永遠不能修改的命令。
    -> post_hub
* {not read_post_ledger} [查看郵局門前的派送簿]
    ~ read_post_ledger = true
    派送簿最早一頁寫著旅行書店，往後每年都被夜班覆蓋。雨航認出父親替晨麥送過食譜卡的簽名，停在「代送」兩字上。 # speaker:旁白
    那張卡沒有年份，派送簿卻記著收件人、退件日，以及父親第二次上門的時間。雨航一直以為父親只替人把東西送到；原來有些東西第一次無人接，也可以先帶回來，等對方準備好再問。
    -> post_ledger_reflect
* [從郵戳後收起第一片信紙]
    -> post_end
=== post_ledger_reflect ===
{
- previous_ending == "yenuan-share":
    妳想起葉暖烤出柚子蘋果麵包，替母親留了一口。雨航指出簿上第二次派送的簽收欄：「卡片送回去以後，她做出了卡片上沒有的味道。」 # speaker:旁白
    他沒有說那是父親替她做出的決定；父親當年只留下再次送達的機會。
- previous_ending == "yenuan-reopen":
    妳記得晨麥第一爐重新出爐的日期。雨航比對派送簿，發現父親將卡片交還後，仍隔了很久，葉暖才自己定下重新開店的那天。 # speaker:旁白
    「兩個日期不一樣。」他說，「原來送到，也不用立刻開始。」
- previous_ending == "yenuan-rest":
    葉暖曾讓晨麥歇一週。妳把那張有日期的小牌告訴雨航；他說原來停下來也能是一個具體的決定。 # speaker:旁白
    他把休息的起訖日寫在派送簿空白處，沒有偷偷改成下一年。
- previous_ending == "yenuan-copy":
    妳記得食譜卡上被描重的舊字。雨航說父親第二次送達時，只請葉暖核對收件姓名，沒有替她修正卡上的任何一筆。 # speaker:旁白
    「我總以為送信就是讓東西變好。」他低頭看自己的藍信，「有時候只是把原樣交回去。」
- else:
    妳不知道食譜卡後來如何，只能看見父親兩次上門的紀錄。雨航也不替收件人猜答案，把兩個日期並排指給妳看。 # speaker:旁白
}
* [對照代送郵戳與藍色信的收件欄]
    ~ compared_postmarks = true
    ~ understanding += 1
    妳把父親留下的兩次派送日期，與雨航每年改過的「明年」並排。食譜卡的收件人可以選擇何時收下；藍色信的收件人卻一直是他自己。 # speaker:旁白
    「我把寄件人的責任推給了日子。」雨航翻過自己的信，「好像日期自己會替我決定要不要開。」
    妳沒有催他現在簽收，只讓他看清兩封信的不同。
    -> post_hub
* [讓他先把派送簿收好]
    ~ kept_ledger_closed = true
    ~ trust += 1
    「這是我父親的紀錄，也是別人的信。」他把簿子合上，只把自己需要記住的兩個日期寫在掌心。 # speaker:程雨航
    你們沿著舊郵局的紅漆線往前走，沒有把葉暖的選擇當作雨航必須照做的答案。
    -> post_hub
=== post_end ===
郵戳後卡著第一片信紙，正面寫著「明年再開始」。 # fragment:tomorrow # speaker:旁白
雨航認得那是自己的字，卻想不起是哪一年寫的。他把信紙對著路燈，墨色底下還有更淡的一層，像同一句話被寫過好幾遍。 # speaker:旁白
* [搭上末班公車]
    -> bus_stop
=== bus_stop ===
離開舊郵局，街上只剩路燈和積水。雨航說末班車會在下一個站牌停，還要等七分鐘；全城每一班夜車的時刻，他都記得。 # speaker:旁白
他沒有撐傘，把郵袋抱在胸前替信擋雨。妳站到他身旁，站牌的燈閃了兩下。
站牌上的時刻表被人用原子筆補過幾個數字。雨航說那是他補的：公車處改了班次，忘了換牌子，他便在每晚經過時順手改正。「別人等車，至少該知道要等多久。」 # speaker:程雨航
妳問他自己等過最久的一班車是幾分鐘。他想了想，說他很少等車，多半用走的；走路的時候，不必決定要在哪一站下。 # speaker:旁白
-> bus_stop_hub
=== bus_stop_hub ===
雨打在站牌的鐵皮頂上，一陣密，一陣疏。 # speaker:旁白
* {not asked_sister} [問他妹妹是什麼樣的人]
    ~ asked_sister = true
    ~ trust += 1
    雨航想了很久，像在挑一個不會說錯的形容。「她做事常常只做一半。」說完他自己先笑了，「不是懶。是她每件事做到一半，就會想到更好玩的。」 # speaker:程雨航
    她學過吉他、報過潛水課，大學念到一半換了系。家裡擔心她定不下來，只有雨航替她記著每件半途的事做到了哪裡。「我以為那是我的工作。她起頭，我收尾。」 # speaker:程雨航
    「所以她走以後，我一直在收尾。」他看著積水裡的路燈，「可是那間店，她根本還沒起頭。」
    -> bus_stop_hub
* {not asked_nightshift} [問他為什麼總是接夜班]
    ~ asked_nightshift = true
    「夜班人少，路也空。」他說這是實話，只是不完整。 # speaker:程雨航
    夜裡沒有人問他週末要去哪裡、最近在忙什麼，收件人也多半睡了。他只要把信放進對的信箱，核對門牌，再走向下一戶。 # speaker:旁白
    「白天的人會問計畫。」他說，「晚上的信箱不會。」 # speaker:程雨航
    -> bus_stop_hub
* {not waited_quietly} [陪他安靜等車]
    ~ waited_quietly = true
    妳沒有再問。黑貓不知何時跟了出來，蹲在長椅下舔爪子。 # speaker:旁白
    過了一會，雨航自己開口：「妳不問我為什麼不回家嗎？」妳說，等他想說的時候再說。他點點頭，把郵袋放到長椅上，第一次讓它離開自己的手。
    -> bus_stop_hub
* {waited_quietly && lincheng_card == ""} [聽他問妳一個問題]
    站牌的燈又閃了一下。雨航看著長椅上的郵袋，說送了七年信，最常遇到的不是查無此人，是收件的人明明在，卻一直沒有回。 # speaker:旁白
    「妳呢？」他轉過頭，「妳有沒有一封一直收到、卻沒回的信？」 # speaker:程雨航
    ** [告訴他，父親每年寄來一張字很少的卡片]
        ~ lincheng_card = "told"
        ~ trust += 1
        妳說父親住在另一座城市，每年寄一張卡片，字總是很少。妳都收著，一張也沒回。 # speaker:林澄
        雨航沒有說妳該回。他想了想，說寄件的人每年都寫同一個地址，有時不是因為沒話說，是在確認那個地址還對。 # speaker:旁白
        「收得到，就表示人還在那裡。」他說，「至少寄的人是這樣想的。」 # speaker:程雨航
        -> bus_stop_hub
    ** [告訴他，今晚先送他的信]
        ~ lincheng_card = "kept"
        妳說今晚要送的是他的信，妳的可以晚一點。 # speaker:林澄
        雨航看了妳一會，笑了，笑得有點累。「妳跟我一樣。先送別人的。」 # speaker:程雨航
        他沒有追問，只把郵袋往旁邊挪，讓長椅空出一個位置。「那我也不催妳。等妳想送的時候再說。」 # speaker:旁白
        -> bus_stop_hub
* [末班車進站，和他一起上車]
    -> last_bus
=== last_bus ===
末班車開過一站又一站，沒有人下車。車窗映出雨航七年間的班表：每次休假剛排好，總有一筆夜班把它蓋掉。 # scene:memory # speaker:旁白 # section:last-bus
他把「存夠錢以後」改成「明年」，再改成下一個明年。座位旁放著一張從未兌換的海邊車票。
車上廣播念到海邊那一站，雨航說妹妹曾想在冬天去看沒有遊客的海。他買票的那年已經只剩自己，便告訴同事票是別人送的。其實每到休假前，他都會把車票重新放進口袋，又在接班電話響起時塞回簿裡。
車上只有司機和你們。司機朝雨航點了點頭，像是見過他很多次。下車鈴一路都沒有響，每到一站，車門照樣打開，又對著空無一人的站牌關上。 # speaker:旁白
妳坐在他旁邊，看窗外的站名一個個往後退。妳很久沒有在這個時間搭車了；書店開門以後，妳的夜晚都留在櫃台後面。 # speaker:旁白
假單、車票與窗上的站名都還看得清。 # speaker:旁白
{
- tea_type == "chamomile":
    洋甘菊的溫度還留在手心。雨航靠著車窗，第一次沒有去數還有幾站。 # speaker:旁白
- tea_type == "hojicha":
    車子經過他住的那條街時，雨航的手在下車鈴上停了一下，沒有按。焙茶讓他話說到家就想走，到了家門口，他又坐住了。 # speaker:旁白
}
-> bus_hub
=== bus_hub ===
車停了一會，雨航沒有立刻回到工作時間表。 # speaker:旁白
* {not asked_bus_seat} [問他平常都坐在哪個位置]
    ~ asked_bus_seat = true
    「後門旁邊那個。」他指了指，「起身最快，哪一站要下都來得及。」 # speaker:程雨航
    那個座位的椅墊磨得比別處淺。雨航說妹妹搭車總要坐最前面，看司機怎麼轉彎，看路燈一盞盞迎過來；他坐在後面，看的是已經過去的站。 # speaker:旁白
    今晚他沒有坐回後門旁，和妳一起坐在中間。「這裡前後都看得到。」他說完，自己也有點不習慣。 # speaker:程雨航
    -> bus_hub
* {not read_bus_leave} [核對七年間被取消的休假單]
    ~ read_bus_leave = true
    ~ understanding += 1
    「第一年想去看店。第二年想整理她的書。再後來，我連請假理由都不寫了。」他撕下一張空白假單，這次沒有填明年。 # clue:cancelled-leave # speaker:程雨航
    不是每張假單都被主管退回。有幾張核准欄空著，是雨航自己在送出前抽走的。他看了很久，承認自己也曾希望有人替他說「先別去」。 # speaker:旁白
    -> bus_hub
* {not read_bus_ticket} [拾起沒有兌換的海邊車票]
    ~ read_bus_ticket = true
    他把車票放進派送簿，沒有承諾立刻上車。「至少今晚我知道它還在。」 # clue:cancelled-leave # speaker:旁白
    票背面有妹妹寫的海邊書店地址，字跡只到街名，沒有門牌。雨航說她也許本來只是想走走；那張票並不欠任何人一次開店的證明。
    -> bus_hub
* {not read_bus_window} [查看車窗上重疊的末班站名]
    ~ read_bus_window = true
    每一班車都經過他住的街口；他熟記別人的門牌，卻總在自己那一站說「再搭一站」。雨航說今夜可以先記下站名，不必立刻下車。 # speaker:旁白
    -> bus_hub
* [從假單裡收起第二片信紙]
    -> bus_end
=== bus_end ===
第二片信紙夾在取消的假單裡。背面筆跡和今年派送簿的字相同。 # fragment:admit # speaker:旁白
快到終點前一站，司機從後照鏡看了他一眼，問他今天怎麼坐得這麼遠。雨航說今晚有一件還沒送到，司機便沒再問。 # speaker:旁白
{
- asked_dream_station:
    車窗外閃過一座很短的月台，只有一張長椅。雨航認出那是夢裡的站。他沒有下車，只在派送簿上記下：那一站沒有站名，也沒有人催他。 # speaker:旁白
- rested_on_shift:
    車廂搖了一下，雨航的眼皮也跟著垂下。他沒有硬撐，只把郵袋放在腿上。「書店裡睡過一次，信都還在。」 # speaker:程雨航
}
* [去鎖住的空店面]
    -> shop_walk
=== shop_walk ===
末班車停在一條他熟悉的街。雨航下車後走得很慢，比去郵局時慢得多。 # speaker:旁白
他帶妳多轉了兩個街角，說那邊的騎樓比較不會淋雨；可是那兩個街角都沒有騎樓。
這條街的店多半拉下了鐵門，只剩一間洗衣店還亮著，烘衣機在玻璃後慢慢轉。雨航說這一帶的信他送過三年，每一戶的門牌都背得出來，唯獨那間店的門牌，他從沒在派送單上見過。 # speaker:旁白
{
- walked_to_door:
    走到第二個街角，他停下來，像剛才在書店握著門把那樣站了一會，然後自己轉回正確的方向。 # speaker:旁白
- finished_cup:
    他說剛才那杯茶喝完了，現在手裡是空的，比較不會想找理由轉彎。說完他又轉錯了一次，自己笑了。 # speaker:旁白
}
他把手伸進口袋，握住那把鑰匙。七年來它一直和家門鑰匙掛在同一個圈上；每天開家門，他都要先把它撥開。 # speaker:旁白
-> shop_walk_hub
=== shop_walk_hub ===
前面的路口亮著紅燈，雨航比燈號更早停下腳步。 # speaker:旁白
* {not named_detour} [指出他在繞路]
    ~ named_detour = true
    ~ understanding += 1
    雨航沒有否認。「習慣了。送件的時候，這條街我都排在最後，常常排到一半就交班。」 # speaker:程雨航
    「這七年，我沒把那間店排進任何一條路線，也沒把它從地圖上刪掉。刪掉就像承認不會去；不排進去，就可以一直說還沒輪到。」
    -> shop_walk_hub
* {not asked_alone} [問他一個人開店，算不算違背約定]
    ~ asked_alone = true
    綠燈亮了，雨航停在斑馬線前沒有走。 # speaker:旁白
    「如果我開了，店裡每一本書都是我選的。她喜歡的旅遊書我看不懂，她嫌悶的推理小說，我會想擺一整排。」他說，「那就不是我們的店，是我的店。我不知道自己可不可以有一間自己的店。」 # speaker:程雨航
    妳沒有替他回答可以或不可以。綠燈又閃了一次，他才邁開腳步。 # speaker:旁白
    -> shop_walk_hub
* {not asked_father} [問他父親知不知道這個計畫]
    ~ asked_father = true
    「我爸聽過。」雨航說，「他送了一輩子信，只問我們打算讓誰休假。妹妹說輪流，我說先別想那麼遠。」 # speaker:程雨航
    說到這裡，他自己停住了。七年來，他替別人代班、補班、接夜班，從沒輪到過自己。「我爸那時候問的就是這個吧。只是我聽成了一句玩笑。」
    -> shop_walk_hub
* [走到那間鎖住的店門前]
    -> empty_shop
=== empty_shop ===
店門後擺著兩個空書架。租約過了期，鑰匙卻一直掛在雨航身上；他曾想像妹妹會站在哪一邊收銀。 # scene:memory # speaker:旁白 # section:empty-shop
他把租約背面翻出來。那上面不是妹妹的簽名，而是他自己的：妹妹離世後，他仍曾來看過這間店。
玻璃上還貼著一張褪色的出租告示。雨航說自己每隔一段時間都會路過，從不查這裡是否已換房東；只要店還鎖著，他就能說計畫仍在等待合適的時候。門口的灰塵卻留著他反覆停步的鞋印。
妳湊近玻璃。店裡鋪著白底綠格的舊地磚，靠窗那一塊顏色比別處淺，是先前的租戶放過什麼留下的。天花板垂著一個沒有燈泡的燈座，櫃台的位置只剩地上一圈較淺的痕跡。 # speaker:旁白
門邊留著過期租約、沒有用過的鑰匙與兩個空書架。 # speaker:旁白
-> shop_hub
=== shop_hub ===
鎖還在門上。雨航把鑰匙放在手心，等妳看完。 # speaker:旁白
* {not asked_first_visit} [問他們第一次來看這間店的那天]
    ~ asked_first_visit = true
    「那天也下雨。」雨航看著玻璃上的告示。「房東開了門，我拿捲尺量牆，一面一面記在本子上。她沒有量，從門口走到窗邊，一步一步數。」 # speaker:程雨航
    「她說十四步，剛好放一張靠窗的長椅，讓人坐著讀旅遊書。我說長椅會占掉一個書架。」他停了一下，「我們為那張長椅爭了一路，到家還沒爭完。」 # speaker:程雨航
    妳看向窗邊那塊顏色較淺的地磚，大小差不多正好是一張長椅。雨航也看見了，沒有說話。 # speaker:旁白
    -> shop_hub
* {not read_shop_lease} [核對過期租約與背面的簽名]
    ~ read_shop_lease = true
    ~ saw_lease = true
    ~ understanding += 1
    「不是因為租金。」他握著木製鑰匙圈。「我怕只有我在店裡，這就不是我們說好的那一家。」 # clue:expired-lease # speaker:程雨航
    他看見期限，說不能再用這張紙開店。那個背面的簽名卻證明，妹妹走後他也曾想過回來。 # speaker:旁白
    雨航把簽名日期讀了出來，比妹妹離開晚了四個月。「那時我不是替她簽的。」他說完沒有替這句話找藉口，也沒有急著把租約收起。
    -> shop_hub
* {not read_shop_key} [讓他試試那把沒有用過的鑰匙]
    ~ read_shop_key = true
    鑰匙還能轉，門卻因久未使用而卡住。雨航收回手，說他至少可以自己決定下一次要不要找房東開門。 # speaker:旁白
    他原本想再用力一點，最後停下來。這扇門不必在今夜被打開；現在的鑰匙也不等於現在的租約。他記下告示上的電話，是否撥出仍留給自己。
    -> shop_hub
* {not read_shop_shelf} [看看兩個空書架原本要放什麼]
    ~ read_shop_shelf = true
    一邊貼著妹妹的旅行地圖，一邊是雨航列的二手書目。他一直以為要兩邊都填滿才算開店；此刻他摸到書架上還能移動的層板。 # speaker:旁白
    他取下一片層板，書架上有了放相機或茶杯的空間。雨航說妹妹不在以後，自己總把「少了一個人」誤認成「所有位置都必須保持原樣」。
    -> shop_hub
* [從門縫裡收起第三片信紙]
    -> shop_end
=== shop_end ===
第三片信紙藏在店門的縫裡。「沒有她」三個字被反覆描過，紙幾乎磨破。 # fragment:without-her # speaker:旁白
雨航把那片紙翻過來，又翻回去。「我一直以為我寫的是『沒有她就不開』。」他說，「原來紙上只有前面三個字，後面那半句，是我自己每天補上的。」 # speaker:程雨航
* [回到夜行書店門外]
    -> bookshop_door
=== bookshop_door ===
書店門外，雨航又拿出簽收印章。他說每晚替別人證明一封信抵達，卻一直不肯在自己的名字旁蓋章。 # scene:memory # speaker:旁白 # section:bookshop-door
他試著用手掌遮住信封上的未來日期，收件人仍然是自己。日期一露出來，名字旁又多了一道像路線的雨痕，連回剛走過的三個地方。雨航說那些地方從未真的消失，只是他每晚選擇繞開。
雨從屋簷邊滴下來，落在門口的踏墊上。書店的燈從門縫透出，照到雨航的鞋尖。他站在門外的位置和今晚剛到時一樣，只是郵袋這次揹在背後，空出了兩隻手。 # speaker:旁白
「書店幾點關門？」雨航忽然問。妳說等最後一位客人離開。他點點頭，「那還來得及。」他沒說是什麼來得及。 # speaker:旁白
郵袋裡還有妹妹寄回的照片，印章底座鬆了，門牌上的雨痕正慢慢聚成一個地址。 # speaker:旁白
-> door_hub
=== door_hub ===
黑貓守在門檻，沒有替任何人蓋章。 # speaker:旁白
* {asked_route_left && not asked_route_rest} [問他今晚剩下的十一戶怎麼辦]
    ~ asked_route_rest = true
    「天亮前送得完。」他看了看錶，又把錶面轉到手腕內側。「以前我會算好每一戶要走幾分鐘，連等紅燈都算進去。」 # speaker:程雨航
    「今晚算不出來。」他說，「好像也沒關係。麵店樓上的老太太起得早，晚一點去，說不定還能當面跟她說聲謝謝。」 # speaker:程雨航
    -> door_hub
* {not read_door_photo} [看妹妹寄回的北岸燈塔照片]
    ~ read_door_photo = true
    照片角落印著月亮標誌，背面寫著守塔人的名字：顧海明。雨航一直把它和未寄出的藍色信放在一起，卻不知道妹妹那年是否真的走進過燈塔。 # clue:lighthouse-postcard # speaker:旁白
    照片背後還寫著：「今天風太大，明天再上塔也可以。」他以前只讀到地名，此刻才留意妹妹也曾允許自己改變行程。
    -> door_hub
* {not read_door_stamp} [翻開簽收印章鬆動的底座]
    ~ read_door_stamp = true
    ~ understanding += 1
    底座裡壓著去年自己用過的筆記紙。雨航讀出背面的日期：「每年都改。原來寄件人一直是我。」他把印章放到桌上，這次不急著蓋。 # clue:stamp-bottom # speaker:程雨航
    -> door_hub
* {not read_door_address} [對照門牌與信封上變動的地址]
    ~ read_door_address = true
    雨痕退開，信封收件人仍是雨航，門牌卻一度變成七年後的日期。他說地址可以變，簽收欄不能由妳替他寫。 # speaker:旁白
    -> door_hub
* [從印章底部收起最後一片紙]
    -> door_end
=== door_end ===
黑貓輕碰底座，最後一片紙滑了出來。雨航認出去年自己的筆跡；紙上寫著他與妹妹原先的夢，也寫著今年還能做的事。 # fragment:begin # speaker:旁白
雨航把四片紙疊在一起，邊緣對齊，像在整理一疊要投遞的信。疊好以後，他沒有放進郵袋，一直拿在手上。 # speaker:旁白
* [回櫃台拼起藍色信]
    -> promise_conversation
=== promise_conversation ===
走回櫃台的路上，雨航把四片紙握在手裡。「她不在了，這封信卻每年都由我重寫。我到底是在守約，還是不敢承認自己也想過別的生活？」 # scene:yuhang # speaker:程雨航 # section:letter
{compared_postmarks:妳想起老郵局派送簿上相隔許久的兩次日期。雨航說：「我父親能敲第二次門，是因為他沒把第一次沒人簽收當作最後的回答。我也可以問問現在的自己。」 # speaker:程雨航}
{asked_sister:他想起站牌下說過的話，「她起頭，我收尾」。「也許不是每件事，都要由我替她收尾。」 # speaker:程雨航}
{asked_alone:他又提起那一整排推理小說，這次沒有說「那就不是我們的店」，只說自己還沒想好該擺在哪一邊。 # speaker:旁白}
妳把他的茶杯重新斟滿，沒有立刻回答。這個問題妳也答不出來；妳只知道，一個人七年都把同一封信帶在身上，大概不只是為了守約。 # speaker:旁白
「我每天早上交完簿子，走回家的路上都會繞到那條街。」雨航說，「有時候我會想，如果哪天我直接回家倒頭就睡，不再過去看一眼，是不是表示我已經忘了她。」 # speaker:程雨航
「後來我發現，我繞過去看，也不是在想她。我只是在確認那扇門還鎖著。」 # speaker:程雨航
妳沒有妹妹的答案，雨航也還沒有自己的。可以先說出妳在那些地址看見了什麼，再讓他自己決定如何收信。
-> promise_choices
=== promise_choices ===
* {previous_ending != "" && not told_recipe} [告訴他，上一夜有人帶著母親的食譜來過]
    ~ told_recipe = true
    ~ understanding += 1
    妳說起那張由他父親代送、沒有年份郵戳的食譜卡。雨航聽到「程先生代送」時抬起頭。 # speaker:旁白
    {
    - previous_ending == "yenuan-share":
        她在母親的配方旁邊加了柚子，兩張卡都留著。妳說，她沒有把哪一張當成背叛。 # speaker:林澄
        雨航想了一下。「兩張都留著。那妹妹的明信片旁邊，也可以放一張我自己的。」 # speaker:程雨航
    - previous_ending == "yenuan-reopen":
        她照母親的比例重新上架，也知道以後可以改。妳說，照原樣做一次，不等於從此只能照原樣。 # speaker:林澄
        「先做一次她想的。」雨航慢慢說，「再看我自己想不想改。」 # speaker:程雨航
    - previous_ending == "yenuan-rest":
        她讓店休息一週，門上寫著「下週見」。妳說，停下來也是她自己決定的。 # speaker:林澄
        雨航看著手裡的信。「我從來沒讓那間店休息過。我只是一直沒去。」 # speaker:程雨航
    - else:
        她每一克都照母親的配方量，連烤盤位置也照舊。妳說，味道守住了，她卻越來越怕變。 # speaker:林澄
        雨航沉默了很久。「我照明信片過了七年。」他說，「好像也是這樣。」 # speaker:程雨航
    }
    -> promise_choices
* [提醒他，妹妹的計畫原本就容許改動]
    ~ promise_frame = "open"
    ~ trust += 1
    {read_postcard:妳提起明信片上的市集桌子與「做不到也可以改」。雨航說：「原來她說的我們，不只指那間租好的店。」|妳提起郵局階梯上的小書車。雨航說他還記得妹妹把車輪畫得太大的樣子。} # speaker:程雨航
    -> letter_start
* [指出過期租約是他在妹妹離開後親自簽的]
    ~ promise_frame = "own"
    ~ understanding += 1
    {read_shop_lease:妳念出租約背面的日期。雨航承認：「那天想進店裡的人是我。這件事不必再全算在她身上。」|妳指向他一直帶著的鑰匙。雨航說，妹妹離開後仍是自己把它留下。} # speaker:程雨航
    -> letter_start
* [先問他此刻想怎麼處理這封信]
    ~ promise_frame = "ask"
    ~ trust += 1
    雨航說他想讀完，卻不想由妳替他決定該去開店。「把它交給我就好。要不要貼郵票，我自己想。」 # speaker:程雨航
    -> letter_start
=== letter_start ===
-> tea_before_letter ->
四片信紙並非預言，而是雨航每年重新寫給自己的話。排好順序、查看墨跡，再貼一枚過去、現在或未來的郵票。 # scene:counter # speaker:旁白 # section:letter # minigame:letter
-> DONE
=== letter_result ===
{
- letter_understood:
    ~ understanding += 2
    雨航讀完自己的字，停在「沒有她」那行。他說這封信不是要他照原樣完成夢，而是問他還想不想為自己留一點位置。 # scene:yuhang # speaker:程雨航 # section:response
- letter_completion >= 50:
    幾行字已能接起來。雨航把其餘碎片收好，說今晚至少知道寄件人是誰。 # scene:yuhang # speaker:旁白 # section:response
- else:
    紙片還散著，他沒有要求妳替他讀完。「我帶回去。這一次不會假裝沒看見。」 # scene:yuhang # speaker:程雨航 # section:response
}
{
- promise_frame == "open":
    他把明信片放在信旁，讓那張還沒決定店名的小書車與自己今年的筆跡並排。兩份字都是真的，卻不必指向同一個地址。 # speaker:旁白
- promise_frame == "own":
    他摸了摸口袋裡的鑰匙，第一次用「我想過」而不是「我們約好」說出那間店。 # speaker:旁白
- else:
    他把紙片一張張轉向自己，停下來讀每年的日期。妳等他翻完，沒有催他給出答案。 # speaker:旁白
}
{
- letter_stamp == "past":
    他摸摸寫著「過去」的郵票，想起妹妹不只有開店這一個夢。 # speaker:旁白 # section:stamp-choice
- letter_stamp == "present":
    他把「現在」貼好，沒有再把今年改成明年。 # speaker:旁白 # section:stamp-choice
- letter_stamp == "future":
    他在「未來」郵票旁留下一個空白日期，說還要想清楚第一步。 # speaker:旁白 # section:stamp-choice
- else:
    郵票仍在桌上。他說也許今晚先不寄，但信要由自己收好。 # speaker:旁白 # section:stamp-choice
}
櫃台的燈照著拼好的信。妳注意到每一年的筆跡都比前一年更工整，像寫的人越來越熟練地把同一件事往後延。 # speaker:旁白
雨航用指尖點著最早那一年的字。那一年的字最亂，有一行寫到一半就斷了。「那年我還會寫錯字。」他說，「後來就不會了。」 # speaker:程雨航
雨航拿起印章，重新看著收件人的名字。接下來的路，不能只由一封神祕的信替他決定。
-> sign_choice
=== sign_return ===
印章還在他手邊，簽收欄仍空著。 # speaker:旁白
-> sign_choice
=== sign_choice ===
* {asked_sister && sister_word == ""} [問他有沒有一句話想對妹妹說]
    雨航想起站牌下說過的話。「她起頭，我收尾。」他把明信片翻到背面，兩個人當年的清單只寫到一半。 # speaker:程雨航
    ** [請他寫在明信片背面]
        ~ sister_word = "written"
        ~ understanding += 1
        他在清單最底下補了一行，字比妹妹的小：「妳起頭的事，我不一定都替妳收尾了。妳沒起頭的那間店，換我自己決定要不要起頭。」 # speaker:旁白
        寫完他吹了吹墨水，像怕它暈開。
        -> sign_return
    ** [讓他只說出口，不必寫下]
        ~ sister_word = "spoken"
        ~ trust += 1
        他對著櫃台邊的空椅子，說得很輕：「妳那把吉他我還沒賣。弦都鏽了。」 # speaker:程雨航
        說完他笑了一下，眼眶卻紅了。妳沒有遞紙巾，只把茶杯往他手邊推近一點。 # speaker:旁白
        -> sign_return
* {not tried_stamp} [問他這七年替別人蓋過幾次章]
    ~ tried_stamp = true
    雨航真的算了起來。「一晚四十幾件，一週五晚，七年……」他停下來，「大概十萬次吧。」 # speaker:程雨航
    「可是我自己的名字蓋出來是什麼顏色，我好像沒看過。」
    妳從櫃台下拿了一張紙巾給他。他在上面蓋了一次，紅色的「程雨航」有點歪，邊角缺了一點墨。 # speaker:旁白
    他看了很久，說原來是這個樣子。那不是簽收，只是讓自己先認得那個名字。
    -> sign_return
* {read_shop_key && key_choice == ""} [問他那把空店面的鑰匙打算怎麼辦]
    他把鑰匙從圈上拆下來，又裝回去。「租約過期了，它其實已經不是我的。」 # speaker:程雨航
    ** [陪他把鑰匙裝進信封，寫好房東的地址]
        ~ key_choice = "return"
        他寫地址時很熟練，寫到自己的寄件地址時停了一下，還是寫完了。「還回去。下次要進去，就重新問一次。」 # speaker:程雨航
        -> sign_return
    ** [讓他先把鑰匙留在圈上]
        ~ key_choice = "keep"
        他把鑰匙圈握在手心，木製書店壓著那把鑰匙。「留著不代表要開。只是今晚還不想拿下來。」 # speaker:程雨航
        -> sign_return
* {letter_understood && letter_stamp == "present"} [今天自己簽收，先申請休假再看店面]
    -> end_today
* {letter_stamp == "future"} [寄往七年後，寫下明確日期與第一步]
    -> end_future
* {letter_stamp == "past"} [把信放進妹妹的紀念盒，另找自己的方向]
    -> end_past
* [拒絕簽收，當作地址寫錯]
    ~ intervention += 2
    -> end_unknown
=== end_today ===
雨航把自己的名字寫在簽收欄，先請了一週假。他知道租約已過期，仍打電話約看那間空店面，想知道現在的自己喜不喜歡它。 # speaker:旁白
他在妹妹畫的書車旁加上一張市集小桌。「第一步也許不用是一間店。」
他在休假單上寫的是自己的名字與日期，沒有把妹妹的名字填成理由。同事問他要去哪裡，他說先去看幾本書，然後看看自己想留下來還是繼續走。
{told_recipe:他後來去了一趟晨麥，買了一個蘋果麵包。付錢時他說家父以前替這裡送過信，葉暖愣了一下，多切了一片給他。 # speaker:旁白}
{asked_father:代理人欄裡，他寫下同事的名字。父親當年那句「誰來休假」，他終於替自己答了一次。 # speaker:旁白}
他把休假單摺好，問妳休假第一天該做什麼。「我排班排了七年，第一天反而不知道怎麼排。」 # speaker:程雨航
* [說第一天可以什麼都不排]
    ~ today_first = "blank"
    雨航看著假單上的空格，沒有拿筆。「這是我第一次看到空格，不想把它填滿。」 # speaker:程雨航
* [說這一題要他自己回答]
    ~ today_first = "his"
    ~ trust += 1
    他想了很久。「先去吃一頓不用趕的早餐。」說完他自己也有點意外，「好像是真的想吃。」 # speaker:程雨航
- -> today_afterword
=== today_afterword ===
書籤後記：假期裡，雨航整理出妹妹留下的書，帶幾本去市集。他還沒有決定要開哪一家店，卻開始和人聊每本書從哪裡來。 # scene:counter # speaker:旁白 # section:afterword
夜班照舊有人接手。他第一次把休假的日期寫進簿裡，沒有塗掉。
{rested_on_shift:休假第一天他睡到中午。醒來先摸床邊，才想起那裡沒有郵袋。 # speaker:旁白}
{finished_cup:那天早上，他在家把一杯焙茶喝完才出門。杯子洗好，倒扣在妹妹以前用的那只旁邊。 # speaker:旁白}
{sister_word == "written":市集那天，他把明信片立在書堆旁，背面朝外。有人問那行字是什麼意思，他說是寫給起頭的人。 # speaker:旁白}
{sister_word == "spoken":休假第三天，他把妹妹的吉他拿去換了弦。 # speaker:旁白}
{tried_stamp:簽收欄那一格，他蓋得很正，和紙巾上那一枚是同一個紅色。 # speaker:旁白}
{key_choice == "return":看店面那天，房東用自己的鑰匙開了門。雨航說這次是來看的，不是來收尾的。 # speaker:旁白}
{key_choice == "keep":看店面那天，他用口袋裡那把鑰匙開門。門這次沒有卡住。 # speaker:旁白}
{lincheng_card == "told":他寄回書店的明信片背面多了一行小字：「那張卡片，回了嗎？不回也沒關係，地址還對就好。」 # speaker:旁白}
{lincheng_card == "kept":他寄回書店的明信片寫給「先送別人信的店員」。上面沒有問題，只寫他今天先送了自己的。 # speaker:旁白}
{today_first == "blank":休假第一天那格，他真的什麼都沒排。下午他在公園坐到路燈亮，才想起今天不用上班。 # speaker:旁白}
{today_first == "his":休假第一天，他吃了一頓不用趕的早餐。吐司點了兩份，吃完一份才想起不必替誰外帶。 # speaker:旁白}
{asked_first_visit:看店面那天，他從門口走到窗邊，數到第十四步才停下。 # speaker:旁白}
-> choice_afterword ->
-> tea_afterword ->
~ ending_kind = "today"
-> chapter_coda
=== end_future ===
雨航選了七年後的地址，卻先在信封內寫下下個月的日期：「整理第一箱書，去看一間店。」 # speaker:旁白
他承認今晚還做不到更多，也把第一步寫得能由未來的自己查對。
這次他把日期寫在派送簿的今日欄，而不是又翻到「明年」。信可以晚一點抵達；下個月那箱書則要由他親手打開。
他看著信封內那行下個月的日期，說怕到時候又被夜班蓋過去。 # speaker:旁白
* [陪他把日期也存進手機行事曆]
    ~ future_reminder = "phone"
    你們一起設好提醒，前一天和當天各響一次。雨航把提醒的名稱打成「打開第一箱」，沒有加上「如果有空」。 # speaker:旁白
* [請他把日期告訴一個會問他的人]
    ~ future_reminder = "colleague"
    ~ understanding += 1
    雨航想了想，說要告訴常跟他換班的同事。「他一定會問。他什麼都會問。」 # speaker:程雨航
- -> future_afterword
=== future_afterword ===
書籤後記：下個月他果然打開了第一箱書。店還沒開，他把新的日期寄回書店，請黑貓替他壓在手冊裡。 # scene:yuhang # speaker:旁白 # portrait:yuhang-hopeful # section:afterword
有些路還遠；至少這一次，他能指出自己已經走到哪裡。
{sister_word == "written":那張補過一行的明信片，他一起寄往七年後。 # speaker:旁白}
{sister_word == "spoken":七年後的信裡，他也寫了那把吉他：還沒賣，弦換過了。 # speaker:旁白}
{tried_stamp:他把紙巾上那枚章剪下來，夾進寄往七年後的信封，讓那時的自己認得。 # speaker:旁白}
{key_choice == "return":鑰匙寄回房東了。他在信裡寫：如果七年後還想要一間店，就重新去問。 # speaker:旁白}
{lincheng_card == "told":寄往七年後的信封裡，他另外夾了一張空白卡片，寫明給書店的店員：回給誰、回不回，都由她決定。 # speaker:旁白}
{lincheng_card == "kept":他在給七年後自己的信末多寫一句：站牌下那位店員也還沒送出自己的信，希望她那時已經送了。 # speaker:旁白}
{future_reminder == "phone":提醒響起那天他還在送信。送完那一區，他請了半天假，回家打開第一箱。 # speaker:旁白}
{future_reminder == "colleague":下個月那天，同事在打卡鐘旁問他：「箱子開了沒？」他說開了，裡面第一本是妹妹的旅遊書。 # speaker:旁白}
-> choice_afterword ->
-> tea_afterword ->
~ ending_kind = "future"
-> chapter_coda
=== end_past ===
雨航把信放進妹妹的紀念盒，也把木製書店放在旁邊。「我愛她，但不一定要照那張明信片生活。」 # speaker:旁白
他寫下一封新的信，沒有收件日期，問自己若不開店，想去哪裡看看。
他把明信片翻到背面，讀完兩個人當年的清單，才合上盒蓋。共同想過的生活仍然存在過，現在不把它實現，也不是把妹妹再失去一次。
他的手停在紀念盒的蓋子上，沒有往下壓。 # speaker:旁白
* [陪他把盒蓋蓋好]
    ~ past_lid = "closed"
    你們一起把蓋子壓下。卡榫響了一聲，雨航說：「不是鎖起來，是收好。」 # speaker:程雨航
* [讓盒蓋留一條縫]
    ~ past_lid = "ajar"
    ~ trust += 1
    他把手收回來，蓋子停在半開。「今天先這樣。」明信片的一角露在外面，他沒有把它推進去。 # speaker:旁白
- -> past_afterword
=== past_afterword ===
書籤後記：他請了三天假，搭車到海邊。回來後仍送信，也開始學攝影；那不是妹妹替他選的路，是他自己想走的。 # scene:counter # speaker:旁白 # section:afterword
紀念盒放在家裡，不再跟著郵袋每晚出門。
{asked_dream_station:海邊車站的月台很短，只有一張長椅。他在那裡坐了一會，沒有等任何人，才起身去看海。 # speaker:旁白}
{asked_home:他在新信的寄件人欄寫下自己住處的街名與門牌。那個地址他背了七年，今天第一次寫給自己。 # speaker:旁白}
{sister_word == "written":明信片放進紀念盒以前，他又讀了一遍自己補的那一行。 # speaker:旁白}
{tried_stamp:紙巾上那枚章，他夾在新信的第一頁。 # speaker:旁白}
{key_choice == "keep":鑰匙仍掛在鑰匙圈上，和木製書店一起。他沒打算再開那扇門，只是還不想拿下來。 # speaker:旁白}
{key_choice == "return":鑰匙寄回去那天，他順路去了海邊車站。信封投進郵筒的聲音，比他想像中輕。 # speaker:旁白}
{lincheng_card == "told":在海邊他買了兩張明信片。一張寄給自己，另一張寄到書店，只寫：「這裡的地址也還對。」 # speaker:旁白}
{lincheng_card == "kept":在海邊的長椅上，他想起有人說過「今晚先送你的」。他把那句話寫進新信，沒有寫是誰說的。 # speaker:旁白}
{past_lid == "closed":紀念盒蓋好以後放在書櫃最上層。每年妹妹生日，他拿下來一次。 # speaker:旁白}
{past_lid == "ajar":盒蓋一直沒有蓋緊。有時他經過，會把那張明信片拿出來看一眼，再放回去。 # speaker:旁白}
{read_post_slot:在海邊的郵筒前，他把寄給自己的信投進去，把耳朵貼近聽了一下。 # speaker:旁白}
-> choice_afterword ->
-> tea_afterword ->
~ ending_kind = "past"
-> chapter_coda
=== end_unknown ===
雨航說這不是自己的信，把它放進錯誤郵件夾。門鈴響時，他已背起郵袋，不肯看簽收欄。 # speaker:旁白
妳沒有追出去替他蓋章。黑貓只是坐在門口，讓雨停下來。
派送簿上還有他的筆跡和今天的日期。那兩樣東西沒有隨信一起消失；雨航出門時避開它們，腳步卻在門檻外慢了一瞬。
藍色信還留在錯誤郵件夾裡，門外的雨聲變小了。 # speaker:旁白
* [把藍色信放回他郵袋最底下，不攔他]
    ~ unknown_parting = "returned"
    妳趁他扣郵袋時，把信輕輕放回最底層。雨航沒有發現，或者發現了，也沒有說。 # speaker:旁白
* [在他身後說，信會一直在這裡]
    ~ unknown_parting = "said"
    他的手停在門把上一下。「我知道。」他沒有回頭，「就是因為知道，才不想看。」 # speaker:程雨航
- -> unknown_afterword
=== unknown_afterword ===
書籤後記：此後每晚，那封藍色信仍出現在郵袋最底下。雨航知道它在，卻一次次先送完別人的信。 # scene:counter # speaker:旁白 # section:afterword
有一天他也許會停下；今晚他仍把自己的地址留白。
{walked_to_door:他還是會在話說到家的時候站起來。只是有幾次，他握著門把站一會，又自己坐回去。 # speaker:旁白}
{told_recipe:他記得書店說起的那張食譜卡。父親送過兩次才送到；他自己的這封，還一次都沒有讓它送到。 # speaker:旁白}
{looked_bag:郵袋底層那封信依舊沒有套上防水袋。雨航每次摸到它，都會想起有人問過，那場雨是哪一天。 # speaker:旁白}
{sister_word == "written":明信片背面那一行他寫了，卻把明信片收進抽屜最底層。 # speaker:旁白}
{sister_word == "spoken":那句關於吉他的話，他後來沒有再說過。吉他仍靠在衣櫃旁。 # speaker:旁白}
{tried_stamp:那張蓋過他名字的紙巾留在櫃台上。黑貓有時睡在上面。 # speaker:旁白}
{key_choice == "keep":鑰匙還在圈上。他每次掏鑰匙開家門，都會先碰到它。 # speaker:旁白}
{lincheng_card == "told":他對妳說過，寄件的人每年寫同一個地址，是在確認它還對。他自己那封，連地址都還沒寫。 # speaker:旁白}
{lincheng_card == "kept":他說過妳跟他一樣先送別人的。後來每晚送完最後一戶，他都在路燈下停一會，像在等誰先開口。 # speaker:旁白}
{unknown_parting == "returned":那晚以後，他摸到袋底那封信時，信封總是乾的。他不知道是誰放回去的，也沒有問。 # speaker:旁白}
{unknown_parting == "said":他記得門口那句「信會一直在這裡」。有幾晚，他經過書店那條街時放慢腳步，沒有進去。 # speaker:旁白}
{asked_route_left:每晚送完最後一戶，他照舊一個人走回局裡。那段沒有東西要送的路，他仍走得很快。 # speaker:旁白}
-> choice_afterword ->
-> tea_afterword ->
~ ending_kind = "unknown"
-> chapter_coda
=== chapter_coda ===
妳把空信封轉向燈下。郵戳日期是七年後，中央刻的不是郵政編號，而是夜行書店的門牌。 # scene:counter # speaker:旁白 # section:coda # clue:future-postmark
書架上那封五十年前的信、柏言的七年前草稿、葉暖母親更早的食譜，如今都指向這個不守時間順序的地址。
{compared_postmarks:妳在手冊旁畫下兩道郵戳。一道記著送達，另一道記著再次詢問；它們沒有替任何收件人寫下回答。 # speaker:旁白}
妳想起手冊的第一頁：店員也要留下自己的故事。黑貓盯著妳，像在等妳承認已知道自己該寫給誰。
妳翻到手冊空白的那一頁，筆尖停在紙上。今晚妳陪一個人看清了收件人是誰；輪到自己時，妳發現連要從哪一句開始寫，都還沒想好。 # speaker:旁白
{
- lincheng_card == "told":
    妳想起家裡抽屜那疊卡片。最上面那張是今年的，字一樣少；妳不知道該回什麼，只知道那個地址還對。 # speaker:旁白
- lincheng_card == "kept":
    雨航那句「先送別人的」還在耳邊。妳把今晚的郵戳描好，手冊上自己那一頁仍是空的。 # speaker:旁白
}
窗外仍是夜。妳沒有替雨航留下簽名，只把那枚郵戳描進手冊。
-> final_bookmark
=== final_bookmark ===
{
- ending_kind == "today":
    雨航在今天的簽收欄寫下自己的名字。藍色信第一次沒有再改地址。 # scene:moon-sea # ending:yuhang-today
- ending_kind == "future":
    寄往七年後的信裡，多了一個下個月可以做的動作。 # scene:moon-sea # ending:yuhang-future
- ending_kind == "past":
    妹妹的紀念盒裡收著一個夢。雨航仍有自己的路可走。 # scene:moon-sea # ending:yuhang-past
- else:
    查無此人。藍色信仍在郵袋最底下，等著下一次投遞。 # scene:moon-sea # ending:yuhang-unknown
}
-> END

=== tea_afterword ===
{
- tea_type == "mint":
    他的郵袋側袋多了一包薄荷茶。夜班休息時泡一杯，喝完才去下一區。 # speaker:旁白
- tea_type == "chamomile":
    夜班前他偶爾泡一杯洋甘菊。那晚書店裡的那一杯讓他坐得住，他記得那種不用趕的感覺。 # speaker:旁白
- tea_type == "hojicha":
    他後來喝焙茶時，會先把一杯喝完再出門。不是每次都做得到。 # speaker:旁白
}
->->
=== tea_before_letter ===
{
- tea_type == "mint":
    薄荷茶喝完了。雨航把杯子轉了半圈，讓把手朝向自己，不朝向門。 # speaker:旁白
- tea_type == "chamomile":
    洋甘菊的杯子還溫著。雨航的郵袋靠在椅腳，他一次也沒有伸手去摸。 # speaker:旁白
- tea_type == "hojicha":
    焙茶喝到一半。雨航看了一眼門口，沒有站起來。 # speaker:旁白
}
->->
=== choice_afterword ===
{kept_ledger_closed:父親的派送簿他沒有再翻開，只記得那晚寫在掌心的兩個日期。那是別人的信，他終於分得清楚。 # speaker:旁白}
{read_recipient_line:信封收件欄上自己的名字，他在書店裡看清過一次。後來不論有沒有簽收，他都知道那個名字是自己的。 # speaker:旁白}
->->
