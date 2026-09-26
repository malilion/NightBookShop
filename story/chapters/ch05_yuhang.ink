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
VAR promise_frame = ""
VAR ending_kind = ""
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
    -> observe
* [問他要不要進來躲雨]
    他說沒關係，卻把郵袋往屋簷下挪了一點。黑貓坐在門檻正中間，替他留了一條進來的路。 # speaker:旁白
    -> observe
=== observe ===
郵袋內的信都乾燥，唯有這封藍色信滲著雨水。袋側派送簿的最後一頁，反覆寫著「明年再開始」。 # scene:yuhang # speaker:旁白 # section:observations # clue:wet-envelope # clue:delivery-ledger
他的鑰匙圈是一間小書店的木製模型。妳問起回家的方向，他能背出整條街的門牌，卻避開自己的住址。 # clue:wooden-shop
書店模型的一扇窗還沒刻完。他用拇指擋住那個缺口，報出下一條街的收件戶數，像是多說一個地址，今晚就能少留一點時間給自己。
* [問那間木製書店是誰做的]
    ~ trust += 1
    「妹妹。」他把鑰匙圈放回口袋。「她以前說，我們可以賣書，也可以去旅行。後來她沒能去了。」 # speaker:程雨航
    -> tea_start
* [先問派送簿為何停在明年]
    ~ read_ledger = true
    「我寫給自己的備忘。」他合上簿子。「每年換一次年份，算不上什麼大事。」他說完又看了一眼那封信。 # speaker:程雨航
    -> tea_start
=== tea_start ===
妳把茶席移到門邊。薄荷可加檸檬與淡紅茶；洋甘菊旁有蜂蜜，焙茶旁放著蘋果乾。 # scene:counter # speaker:旁白 # section:tea
雨航仍站著，卻把郵袋放在地上。他說只喝幾口，等雨停了就走。
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
-> tea_aftercare
=== tea_followup ===
雨航把杯子放在郵袋旁，身體卻仍朝向門。妳可以問他自己的住址，或讓他先看清那封信的收件欄。 # speaker:旁白
* [問他若寄給自己會寫哪個住址]
    ~ trust += 1
    「我記得每個人的門牌，卻很久沒寫過自己的。」他念出住處的街名，第一次沒有用派送路線代替回答。 # clue:own-address # speaker:程雨航
    -> tea_aftercare
* [讓他先看清信的收件欄]
    他把信翻正，承認上面寫的是自己的名字。「地址等我想好再填。」 # speaker:程雨航
    -> tea_aftercare
=== tea_aftercare ===
藍色信的地址又變了。郵戳、雨痕與字跡分別指向一處地方；桌面像城市地圖一樣展開。
依三個線索選擇投遞地點。走錯不會失敗，也會看見雨航避開的某段生活。 # minigame:route
-> DONE
=== route_result ===
{
- route_correct == 3:
    ~ understanding += 1
三條地址都能在舊地圖上找到。雨航說，這些地方他曾經想去，後來只從它們門前經過。 # scene:yuhang # speaker:旁白 # section:mail-route
- route_detours > 0:
    妳們走過幾條沒有寫在信上的路。雨航指出哪戶人家搬走、哪間店關了，卻發現自己很久沒有問過那些人後來如何。 # scene:yuhang # speaker:旁白 # section:mail-route
- else:
    地址仍在雨裡變換。妳們先從那個已拆除的郵局找起。 # scene:yuhang # speaker:旁白 # section:mail-route
}
他說自己會送到，卻不確定那究竟算誰的信。妳們先走向第一個仍記得的地方。
雨航照習慣走在前面，遇到轉角卻停下來等妳。他知道送達一封信需要地址，今晚第一次試著問：收件人若不想打開，算不算送達？
* [到已拆除的老郵局]
    -> old_post_office
=== old_post_office ===
郵局只剩牆角的紅色漆線。七年前，雨航和妹妹坐在階梯上，替未來的旅行書店寫明信片：賣二手書，沿海走，冬天回來。 # scene:memory # speaker:旁白 # section:old-post-office
妹妹畫了一輛很小的書車，說若租不到店，先在市集擺一張桌子也好。
雨航記得自己當時拿尺畫出店面平面圖，妹妹卻在旁邊把車輪畫得比書架還大。她說書賣完也可以去看海，隔年換一座城市；他回她，至少先算清楚房租。兩人在明信片背面各寫了半張清單，誰也沒劃掉對方的字。
階梯上留著那張明信片、舊郵戳與派送簿。雨航不催妳選哪一件。 # speaker:旁白
-> post_hub
=== post_hub ===
雨水把紅漆線映得像還有人在這裡排隊。 # speaker:旁白
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
    妳想起葉暖曾把原配方重新放上架，也說出母親的名字。雨航指出簿上第二次派送的簽收欄：「她現在願意讓別人知道這張卡從哪裡來了。」 # speaker:旁白
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
    ~ trust += 1
    「這是我父親的紀錄，也是別人的信。」他把簿子合上，只把自己需要記住的兩個日期寫在掌心。 # speaker:程雨航
    妳們沿著舊郵局的紅漆線往前走，沒有把葉暖的選擇當作雨航必須照做的答案。
    -> post_hub
=== post_end ===
郵戳後卡著第一片信紙，正面寫著「明年再開始」。 # fragment:tomorrow # speaker:旁白
* [搭上末班公車]
    -> last_bus
=== last_bus ===
末班車開過一站又一站，沒有人下車。車窗映出雨航七年間的班表：每次休假剛排好，總有一筆夜班把它蓋掉。 # scene:memory # speaker:旁白 # section:last-bus
他把「存夠錢以後」改成「明年」，再改成下一個明年。座位旁放著一張從未兌換的海邊車票。
車上廣播念到海邊那一站，雨航說妹妹曾想在冬天去看沒有遊客的海。他買票的那年已經只剩自己，便告訴同事票是別人送的。其實每到休假前，他都會把車票重新放進口袋，又在接班電話響起時塞回簿裡。
假單、車票與窗上的站名都還看得清。 # speaker:旁白
-> bus_hub
=== bus_hub ===
車停了一會，雨航沒有立刻回到工作時間表。 # speaker:旁白
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
* [去鎖住的空店面]
    -> empty_shop
=== empty_shop ===
店門後擺著兩個空書架。租約過了期，鑰匙卻一直掛在雨航身上；他曾想像妹妹會站在哪一邊收銀。 # scene:memory # speaker:旁白 # section:empty-shop
他把租約背面翻出來。那上面不是妹妹的簽名，而是他自己的：妹妹離世後，他仍曾來看過這間店。
玻璃上還貼著一張褪色的出租告示。雨航說自己每隔一段時間都會路過，從不查這裡是否已換房東；只要店還鎖著，他就能說計畫仍在等待合適的時候。門口的灰塵卻留著他反覆停步的鞋印。
門邊留著過期租約、沒有用過的鑰匙與兩個空書架。 # speaker:旁白
-> shop_hub
=== shop_hub ===
鎖還在門上。雨航把鑰匙放在手心，等妳看完。 # speaker:旁白
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
* [回到夜行書店門外]
    -> bookshop_door
=== bookshop_door ===
書店門外，雨航又拿出簽收印章。他說每晚替別人證明一封信抵達，卻一直不肯在自己的名字旁蓋章。 # scene:memory # speaker:旁白 # section:bookshop-door
他試著用手掌遮住信封上的未來日期，收件人仍然是自己。日期一露出來，名字旁又多了一道像路線的雨痕，連回剛走過的三個地方。雨航說那些地方從未真的消失，只是他每晚選擇繞開。
郵袋裡還有妹妹寄回的照片，印章底座鬆了，門牌上的雨痕正慢慢聚成一個地址。 # speaker:旁白
-> door_hub
=== door_hub ===
黑貓守在門檻，沒有替任何人蓋章。 # speaker:旁白
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
* [回櫃台拼起藍色信]
    -> promise_conversation
=== promise_conversation ===
走回櫃台的路上，雨航把四片紙握在手裡。「她不在了，這封信卻每年都由我重寫。我到底是在守約，還是不敢承認自己也想過別的生活？」 # scene:yuhang # speaker:程雨航 # section:letter
{compared_postmarks:妳想起老郵局派送簿上相隔許久的兩次日期。雨航說：「我父親能敲第二次門，是因為他沒把第一次沒人簽收當作最後的回答。我也可以問問現在的自己。」 # speaker:程雨航}
妳沒有妹妹的答案，雨航也還沒有自己的。可以先說出妳在那些地址看見了什麼，再讓他自己決定如何收信。
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
雨航拿起印章，重新看著收件人的名字。接下來的路，不能只由一封神祕的信替他決定。
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
-> today_afterword
=== today_afterword ===
書籤後記：假期裡，雨航整理出妹妹留下的書，帶幾本去市集。他還沒有決定要開哪一家店，卻開始和人聊每本書從哪裡來。 # scene:counter # speaker:旁白 # section:afterword
夜班照舊有人接手。他第一次把休假的日期寫進簿裡，沒有塗掉。
~ ending_kind = "today"
-> chapter_coda
=== end_future ===
雨航選了七年後的地址，卻先在信封內寫下下個月的日期：「整理第一箱書，去看一間店。」 # speaker:旁白
他承認今晚還做不到更多，也把第一步寫得能由未來的自己查對。
這次他把日期寫在派送簿的今日欄，而不是又翻到「明年」。信可以晚一點抵達；下個月那箱書則要由他親手打開。
-> future_afterword
=== future_afterword ===
書籤後記：下個月他果然打開了第一箱書。店還沒開，他把新的日期寄回書店，請黑貓替他壓在手冊裡。 # scene:yuhang # speaker:旁白 # portrait:yuhang-hopeful # section:afterword
有些路還遠；至少這一次，他能指出自己已經走到哪裡。
~ ending_kind = "future"
-> chapter_coda
=== end_past ===
雨航把信放進妹妹的紀念盒，也把木製書店放在旁邊。「我愛她，但不一定要照那張明信片生活。」 # speaker:旁白
他寫下一封新的信，沒有收件日期，問自己若不開店，想去哪裡看看。
他把明信片翻到背面，讀完兩個人當年的清單，才合上盒蓋。共同想過的生活仍然存在過，現在不把它實現，也不是把妹妹再失去一次。
-> past_afterword
=== past_afterword ===
書籤後記：他請了三天假，搭車到海邊。回來後仍送信，也開始學攝影；那不是妹妹替他選的路，是他自己想走的。 # scene:counter # speaker:旁白 # section:afterword
紀念盒放在家裡，不再跟著郵袋每晚出門。
~ ending_kind = "past"
-> chapter_coda
=== end_unknown ===
雨航說這不是自己的信，把它放進錯誤郵件夾。門鈴響時，他已背起郵袋，不肯看簽收欄。 # speaker:旁白
妳沒有追出去替他蓋章。黑貓只是坐在門口，讓雨停下來。
派送簿上還有他的筆跡和今天的日期。那兩樣東西沒有隨信一起消失；雨航出門時避開它們，腳步卻在門檻外慢了一瞬。
-> unknown_afterword
=== unknown_afterword ===
書籤後記：此後每晚，那封藍色信仍出現在郵袋最底下。雨航知道它在，卻一次次先送完別人的信。 # scene:counter # speaker:旁白 # section:afterword
有一天他也許會停下；今晚他仍把自己的地址留白。
~ ending_kind = "unknown"
-> chapter_coda
=== chapter_coda ===
妳把空信封轉向燈下。郵戳日期是七年後，中央刻的不是郵政編號，而是夜行書店的門牌。 # scene:counter # speaker:旁白 # section:coda # clue:future-postmark
書架上那封五十年前的信、柏言的七年前草稿、葉暖母親更早的食譜，如今都指向這個不守時間順序的地址。
{compared_postmarks:妳在手冊旁畫下兩道郵戳。一道記著送達，另一道記著再次詢問；它們沒有替任何收件人寫下回答。 # speaker:旁白}
妳想起手冊的第一頁：店員也要留下自己的故事。黑貓盯著妳，像在等妳承認已知道自己該寫給誰。
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
