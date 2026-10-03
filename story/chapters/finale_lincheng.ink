// 終章：林澄。六位訪客之後，她坐到自己的訪客席。
VAR trust = 0
VAR understanding = 0
VAR intervention = 0
VAR previous_ending = ""
VAR ending_jinglan = ""
VAR ending_boyan = ""
VAR ending_ruoyin = ""
VAR ending_yenuan = ""
VAR ending_yuhang = ""
VAR tea_type = ""
VAR tea_quality = 0
VAR tea_emotional_match = 0
VAR archive_count = 0
VAR archive_complete = false
VAR letter_completion = 0
VAR letter_understood = false
VAR letter_alternate = false
VAR remembered_all = false
VAR sat_down = false
VAR read_hidden_cabinet = false
VAR read_hidden_height = false
VAR read_hidden_clock = false
VAR read_home_letter = false
VAR read_home_note = false
VAR read_home_coat = false
VAR read_envelope_wishes = false
VAR read_envelope_height = false
VAR read_envelope_ink = false
VAR demanded_exit_answer = false
VAR let_owner_observe = false
VAR obs_badge = false
VAR obs_cups = false
VAR obs_door = false
VAR thought_mother = false
VAR thought_father = false
VAR refuse_asked_chair = false
VAR refuse_tried_door = false
VAR refuse_read_notes = false
VAR overstep_count = 0
VAR owned_overstep = false
VAR named_own_choices = false
VAR asked_embrace = false
VAR embrace_kind = ""
VAR read_blank = false
VAR read_ink_line = false
VAR ink_word = ""
VAR flipped_jinglan = false
VAR flipped_boyan = false
VAR flipped_ruoyin = false
VAR flipped_yenuan = false
VAR flipped_yuhang = false
VAR flipped_haiming = false
VAR flipped_count = 0
VAR lincheng_destination = ""
VAR lincheng_shift = ""
VAR lincheng_paused = ""
VAR lincheng_mother = ""
VAR lincheng_card = ""
VAR lincheng_fear = ""
VAR answered_visitors = false
VAR ending_kind = ""
-> threshold

=== threshold ===
六夜的書籤排在櫃台上。靜蘭的信、柏言的草稿、若音的樂譜、葉暖的食譜、雨航的郵戳與海明的照片，背面各有一道水痕或摺線。妳還沒有把它們逐張翻開。 # scene:lincheng # speaker:旁白 # section:visitor-seat
{
- previous_ending == "haiming-light":
    海明與顧川一起讀過的信仍不整齊，父子兩人的字卻靠在同一頁。妳第一次想，自己的信或許也不必修得平整才能讀。 # speaker:旁白
- previous_ending == "haiming-voice":
    海明的聲音航海誌停在一段笑話後面。妳聽見自己的笑聲，才發現記得害怕與記得快樂可以在同一頁。 # speaker:旁白
- previous_ending == "haiming-boat":
    紙船在杯旁晾乾，還有一行留白。妳把它放回六張紙旁，不再要求每封信都在今晚寫完。 # speaker:旁白
- previous_ending == "haiming-hero":
    海明那份流暢的英雄日誌平整得沒有摺痕。妳想到顧川沒有回話，終於不想把自己的舊信也修成只剩漂亮句子。 # speaker:旁白
- else:
    海明的燈塔照片壓在最上面。妳把它移到旁邊，讓六張紙都能被看見。 # speaker:旁白
}
窗外快天亮了。店主把一張空椅子推到櫃台另一側，沒有坐在妳旁邊。黑貓從手冊裡叼出那枚月亮形店員徽章，放在椅面。 # portrait:owner
這一張椅子也可以留給妳。若妳今天不想坐，我不會讀那封信。 # speaker:店主 # portrait:owner
-> seat_choice
=== seat_return ===
{flipped_count == 6:六張書籤都翻過了。妳把它們疊回原位，沒有替任何一張改寫結尾。|書籤還攤在櫃台上，椅子仍在那裡。} # speaker:旁白
-> seat_choice
=== seat_choice ===
* {not flipped_jinglan} [翻開靜蘭的書籤]
    ~ flipped_jinglan = true
    ~ flipped_count += 1
    {
    - ending_jinglan == "moonlight":
        書籤背面是靜蘭的字：「給二十四歲的周靜蘭。」那晚她最後寫信的對象，是自己。 # speaker:旁白
    - ending_jinglan == "recipient":
        書籤裡夾著那張短箋的草稿，第一句是：「如果您願意收下這封舊信。」她先問了，才寄。 # speaker:旁白
    - ending_jinglan == "unfinished":
        書籤背面只有「尚未完成」四個字，是妳自己的筆跡。那晚她說還不想決定，妳就等了。 # speaker:旁白
    - ending_jinglan == "intervention":
        書籤上有一道裂痕。妳到現在還記得，她說「等等」時的聲音。 # speaker:旁白
    - else:
        書籤上壓著一片乾掉的桂花，聞起來仍有一點甜。 # speaker:旁白
    }
    -> seat_return
* {not flipped_boyan} [翻開柏言的書籤]
    ~ flipped_boyan = true
    ~ flipped_count += 1
    {
    - ending_boyan == "boyan-rest":
        書籤背面抄著他的請假訊息：「明天上午需就醫，無法出席會議。」沒有一句道歉。 # speaker:旁白
    - ending_boyan == "boyan-leave":
        書籤背面是一行空白，旁邊是柏言的字：「這裡我自己填。」 # speaker:旁白
    - ending_boyan == "boyan-boundary":
        書籤背面是那張分過欄的工作表，其中一欄寫著別人的名字。 # speaker:旁白
    - ending_boyan == "boyan-overwork":
        書籤上的錶仍停在 23:47。旁邊是妳抄下的那行醫囑。 # speaker:旁白
    - else:
        書籤上畫著一只停住的錶，指針在十一點四十七分。 # speaker:旁白
    }
    -> seat_return
* {not flipped_ruoyin} [翻開若音的書籤]
    ~ flipped_ruoyin = true
    ~ flipped_count += 1
    {
    - ending_ruoyin == "ruoyin-one":
        書籤背面畫了一個小小的休止符，旁邊寫：「只拉給一個人。」 # speaker:旁白
    - ending_ruoyin == "ruoyin-stage":
        書籤背面寫著季晴的名字，地址是若音一筆一筆抄的。 # speaker:旁白
    - ending_ruoyin == "ruoyin-score":
        書籤背面抄著四個音，後面多了一段別人的故事寫成的旋律。 # speaker:旁白
    - ending_ruoyin == "ruoyin-echo":
        書籤上有一道裂痕，壓著一張比賽報名表。妳記得她說「好」的時候，沒有看妳。 # speaker:旁白
    - else:
        書籤上抄著四個音，最後一個音沒有寫完。 # speaker:旁白
    }
    -> seat_return
* {not flipped_yenuan} [翻開葉暖的書籤]
    ~ flipped_yenuan = true
    ~ flipped_count += 1
    {
    - ending_yenuan == "yenuan-share":
        書籤上還有一點柚子皮的香氣。那晚她留了一口給母親，也留了一口給自己。 # speaker:旁白
    - ending_yenuan == "yenuan-reopen":
        書籤背面是母親原來的比例，被劃掉的「等待」又寫了回去。 # speaker:旁白
    - ending_yenuan == "yenuan-rest":
        書籤背面寫著「休息一週，下週見」。字有點歪，是她站在門口寫的。 # speaker:旁白
    - ending_yenuan == "yenuan-copy":
        書籤有一道裂痕，夾著被翻得起毛的食譜卡影本。每個數字都描過兩遍。 # speaker:旁白
    - else:
        書籤上沾著一點麵粉，拍不太掉。 # speaker:旁白
    }
    -> seat_return
* {not flipped_yuhang} [翻開雨航的書籤]
    ~ flipped_yuhang = true
    ~ flipped_count += 1
    {
    - ending_yuhang == "yuhang-today":
        書籤背面的簽收欄寫著「程雨航」，日期是今天，沒有再改成明年。 # speaker:旁白
    - ending_yuhang == "yuhang-future":
        書籤上寫著一個下個月的日期，和「整理第一箱書」。 # speaker:旁白
    - ending_yuhang == "yuhang-past":
        書籤旁夾著一張明信片的影本，背面是兄妹兩人只寫了一半的清單。 # speaker:旁白
    - ending_yuhang == "yuhang-unknown":
        書籤上蓋著「查無此人」。妳記得，那是妳替他找的理由。 # speaker:旁白
    - else:
        書籤上有一枚郵戳，日期在七年後。 # speaker:旁白
    }
    -> seat_return
* {not flipped_haiming} [翻開海明的書籤]
    ~ flipped_haiming = true
    ~ flipped_count += 1
    {
    - previous_ending == "haiming-light":
        書籤上有兩種筆跡：海明的字，和顧川補在旁邊的時間。 # speaker:旁白
    - previous_ending == "haiming-voice":
        書籤背面記著一段錄音的開頭：先是風向，再是一個講了兩次的笑話。 # speaker:旁白
    - previous_ending == "haiming-boat":
        書籤摺成一艘小紙船，沒有攤開。 # speaker:旁白
    - previous_ending == "haiming-hero":
        書籤平整得沒有一條摺痕。妳翻了兩次，找不到他說害怕的那一句。 # speaker:旁白
    - else:
        書籤上是燈塔的剪影，燈還亮著。 # speaker:旁白
    }
    -> seat_return
* [先坐到訪客席，替自己留一杯茶]
    ~ sat_down = true
    妳從櫃台後走出來。椅子沒有把門鎖上，徽章仍在桌上。第一次，妳不用替下一位客人安排座位。 # speaker:旁白
    -> self_tea
* [拒絕坐下，繼續替別人整理故事]
    ~ intervention += 1
    妳把椅子推回原位，說還有六份手記要整理。店主沒有攔妳，黑貓只是把自己的尾巴從手冊第一頁移開。 # speaker:旁白
    -> refuse_hub
=== refuse_hub ===
店主沒有把椅子收走，也沒有再推過來。妳站在櫃台後，手邊還有一點時間。 # speaker:旁白 # portrait:owner
* {not refuse_asked_chair} [問他那張椅子會一直留著嗎]
    ~ refuse_asked_chair = true
    「會留著。」店主說。「我不會替妳推過來，也不會替妳收走。」 # speaker:店主 # portrait:owner
    黑貓跳上椅面，轉了兩圈，坐在徽章旁邊。牠沒有看妳，好像只是替那個位置占著，等誰都可以。 # speaker:旁白
    -> refuse_hub
* {not refuse_tried_door} [走到玻璃門邊，試試它能不能打開]
    ~ refuse_tried_door = true
    妳握住門把，這次沒有用力，門就開了一道縫。外頭的石板路是濕的，空氣裡有早班公車的柴油味。 # speaker:旁白
    第一夜妳推了兩下，門紋絲不動。今天它開著，妳卻自己把它帶上了。鎖舌扣回去的聲音很輕。
    「我只是想知道。」妳對著門說。店主沒有回答，也沒有把這件事記進手冊。 # speaker:林澄
    -> refuse_hub
* {not refuse_read_notes} [翻看六位訪客的手記，不碰自己的信]
    ~ refuse_read_notes = true
    妳一頁頁翻過去：靜蘭坐在椅子前緣，柏言把手機翻面，若音把琴盒放在腳邊，葉暖先替別人切麵包，雨航把郵袋抱在膝上，海明說他怕自己忘記。 # speaker:旁白
    六個人都坐下過。有人坐得很久，有人一直想站起來，可他們都在那張椅子上待到把話說出口。
    妳把手記合上，壓在自己那封信上面。 # speaker:旁白
    -> refuse_hub
* [還是坐下，先替自己泡一杯茶]
    ~ sat_down = true
    妳把椅子拉回來，坐下的動作比想像中慢。{refuse_asked_chair:黑貓從椅面跳開，把位置讓給妳。}店主點點頭，把茶席推到妳這一側。 # speaker:旁白 # portrait:owner
    -> self_tea
* [仍然拒絕坐下，繼續替別人整理故事]
    -> end_midnight
=== self_tea ===
茶席還在原處。妳可以拿任何一罐茶；這次沒有人等著妳判斷他的情緒，也沒有哪一種香氣能替妳決定要想起什麼。 # scene:counter # speaker:旁白 # section:tea
妳把杯子放在自己面前。慢慢泡一杯，然後帶著它看六夜留下的紙。 # minigame:tea
-> DONE
=== tea_result ===
{
- tea_type == "osmanthus":
    靜蘭杯裡的桂花香回來了。妳記得她說，幸福與遺憾能同時存在；今天也許不用立刻替自己選一種心情。 # scene:lincheng # speaker:旁白 # section:archive
- tea_type == "puer":
    熟普洱沉在杯底，顏色深得看不見葉子。妳想起靜蘭說過，喝了不心慌；以前有話說不出口，她就一直喝水。 # scene:lincheng # speaker:旁白 # section:archive
    妳喝了一口，沒有急著把杯子喝空。今晚妳想留一點位置給還沒說的話。
- tea_type == "mint":
    薄荷的涼味先到舌尖。雨航那晚也喝過一杯，說像半夜騎車時灌進領口的風，冷，但讓人醒著。 # scene:lincheng # speaker:旁白 # section:archive
    妳發現自己也一直醒著。六夜都醒著，只是從沒問過自己為什麼不睡。
- tea_type == "jasmine":
    茉莉的香氣在杯口散開。六位訪客沒有一個人選過這罐，它在茶架上放了六夜，罐蓋上的灰都還是完整的。 # scene:lincheng # speaker:旁白 # section:archive
    這一杯不讓妳想起任何人。妳捧著它，才想到自己其實不知道自己喜歡什麼茶。
- tea_type == "black":
    蜜香紅茶很濃。妳記得柏言喝了這一種，手又伸回筆電；妳端起杯子時，眼睛也先看向桌上那疊還沒整理的手記。 # scene:lincheng # speaker:旁白 # section:archive
    妳把手記推遠一點。這杯茶可以提神，但今晚不用拿它撐過什麼。
- tea_type == "chamomile":
    洋甘菊的氣味很淡，像晾在陽台一整天的被子。柏言喝這杯時說不出哪裡好，只說胸口沒有那麼緊。 # scene:lincheng # speaker:旁白 # section:archive
    妳沒有替這杯茶找理由。胸口鬆了一點，就先讓它鬆著。
- tea_type == "lavender":
    若音的茶有淡淡花香。八音盒的四個音響過，最後一拍終於落下。 # scene:lincheng # speaker:旁白 # section:archive
- tea_type == "hojicha":
    焙茶讓妳想起葉暖的爐火與海明的燈。留住熱度不需要把火開到最旺。 # scene:lincheng # speaker:旁白 # section:archive
- else:
    這杯茶是妳自己選的。水溫與時間不必剛好對應任何訪客；杯口的暖意是此刻真實的。 # scene:lincheng # speaker:旁白 # section:archive
}
{
- tea_quality >= 90:
    妳注意到自己泡得很慢。注水時沒有抬頭看門，也沒有在心裡替下一位客人數時間；這是六夜以來，妳第一次照自己的節奏泡完一杯。 # speaker:旁白
- tea_quality < 50:
    水倒得急，茶有點澀。妳下意識想倒掉重泡，手伸到一半才想起，這一杯不必端給任何人。 # speaker:旁白
    妳把它喝了一口。澀味留在舌根，妳沒有替它道歉。
}
-> seat_observed
=== seat_observed ===
店主在櫃台另一側坐下，隔著茶杯看妳。那是妳這六夜一直坐的位置。 # speaker:旁白 # portrait:owner
妳每次都先看客人的手，再決定要不要開口。我可以也這樣看妳一次嗎？妳可以說不。 # speaker:店主 # portrait:owner
* [點頭，讓他說他看見了什麼]
    ~ let_owner_observe = true
    -> observed_hub
* [請他先別說，妳想直接看六夜的紙]
    ~ trust += 1
    「好。」店主把視線移回自己的杯子。妳發現被人問過「可不可以」之後再拒絕，比想像中容易。 # speaker:旁白 # portrait:owner
    -> archive_start
=== observed_hub ===
店主說得很慢，每說一件就停下來，等妳決定要不要回答。 # speaker:旁白 # portrait:owner
* {not obs_badge} [他說妳一直用拇指按著徽章的邊]
    ~ obs_badge = true
    妳低頭，才發現拇指真的按在月亮的尖角上，按出一道淺紅的印子。 # speaker:旁白
    「六夜都這樣。」妳說，「好像只要按著，就記得自己還在上班，還有事要做。」 # speaker:林澄
    店主沒有叫妳放開，只說那枚徽章不會因為妳鬆手就掉下去。 # speaker:旁白 # portrait:owner
    -> observed_hub
* {not obs_cups} [他說妳洗好了六位客人的杯子，自己的卻最後才拿]
    ~ obs_cups = true
    妳想起葉暖替每個人切麵包，自己一口也不吃；想起柏言替整個部門接下報告。妳曾在心裡替他們難過，卻沒發現自己每晚也是最後一個坐下。 # speaker:旁白
    「我以為那是店員該做的。」妳說。店主說：「店員該做的，是先讓自己能坐得住。」 # speaker:林澄
    -> observed_hub
* {not obs_door} [他說妳坐下以後，第一眼看的是門]
    ~ obs_door = true
    ~ understanding += 1
    「我想確定它還能開。」妳說得比自己預期的快。 # speaker:林澄
    第一夜，妳推過那扇玻璃門，推不動。那之後的每一夜，妳都會在客人進來前看它一眼，好像只要確認它關著，就不必去想自己為什麼走不了。 # speaker:旁白
    店主沒有替門辯解。「今天它能開。妳可以隨時去試。」妳沒有起身，但肩膀鬆了一點。 # speaker:旁白 # portrait:owner
    -> observed_hub
* [夠了，先看六夜留下的紙]
    -> archive_start
=== archive_start ===
六張紙背相互重疊，店主沒有替妳指出那些摺痕通往哪裡。妳逐一翻看，確認每位訪客留下的不是同一個答案。 # speaker:旁白
把六夜的線索攤開，找出地圖真正的中心。 # minigame:archive
-> DONE
=== archive_result ===
{
- archive_complete:
    ~ understanding += 2
    六條水痕、油漬與摺線接在夜行書店的門牌上。它們來自不同年月，卻都曾帶著一封沒能說完的信到這裡。 # scene:lincheng # speaker:旁白 # section:archive # clue:sixfold-map
    -> hidden_room
- else:
    地圖還沒有接全。妳先把看到的紙放在一起；至少知道最早的痕跡不是今夜才留下。 # scene:lincheng # speaker:旁白 # section:archive
    -> archive_retry
}
=== archive_retry ===
還有紙背的關係沒找齊。妳把六張紙攤回桌面，再比對一次。 # minigame:archive
-> DONE
=== hidden_room ===
妳沿著六條摺線走到最裡面的書架。黑貓跳上第三層，碰歪一本沒有書名的薄冊；整排書架向內退開，露出一間窄小的收藏室。 # scene:memory # speaker:旁白 # section:hidden-room
桌上有六個空信格，門框留著孩子的身高線，牆上的鐘停在午夜。窗外卻已經有晨光。這裡沒有替任何人寫好的結局。
-> hidden_hub
=== hidden_hub ===
書架仍留著可退回櫃台的縫；妳可以再看一件物品。 # speaker:旁白
* {not read_hidden_cabinet} [查看六格信櫃]
    ~ read_hidden_cabinet = true
    靜蘭的校刊夾著若音旋律的四個音。柏言母親留下的舊刊與若音在尾牙演出的節目單疊在一起；食譜卡的郵戳、燈塔照片的月亮又各自接上下一夜。六封信曾從不同的人手中經過。 # speaker:旁白
    {
    - ending_jinglan == "moonlight":
        第一格書籤旁，是靜蘭寫給年輕自己的信的抄頁。她沒有寄走岳川那封，也沒有把後來的幸福從紙上刪掉。 # speaker:旁白
    - ending_jinglan == "recipient":
        第一格夾著岳川女兒回寄的校刊照片。靜蘭得到收信的同意，才自己封好那封舊信。 # speaker:旁白
    - ending_jinglan == "unfinished":
        第一格只有一張留白的書籤；藍信仍由靜蘭帶回家。妳沒有把空格當成她欠書店的答案。 # speaker:旁白
    - ending_jinglan == "intervention":
        第一格書籤有一道裂痕。信雖已寄出，妳還記得靜蘭說過，她本來想自己決定。 # speaker:旁白
    }
    {
    - ending_boyan == "boyan-rest":
        第二格壓著柏言寫下的回診日期；工作仍在，但他先替身體留出了一個上午。 # speaker:旁白
    - ending_boyan == "boyan-leave":
        第二格的履歷第一行還空著。柏言確認生活所需後離開，下一份工作不必由這裡替他填上。 # speaker:旁白
    - ending_boyan == "boyan-boundary":
        第二格攤著交接表，責任旁寫了其他人的名字。柏言說出的界線，並沒有讓工作憑空消失。 # speaker:旁白
    - ending_boyan == "boyan-overwork":
        第二格有一則亮著的未讀通知。報告已送出，求助的話卻還沒被他說出口。 # speaker:旁白
    }
    {
    - ending_ruoyin == "ruoyin-one":
        第三格留下那位夜歸聽眾的一句謝謝。若音沒有等掌聲，才拉完最後一小節。 # speaker:旁白
    - ending_ruoyin == "ruoyin-stage":
        第三格夾著寄給季晴的信與一張觀眾席票根。若音沒有再讓朋友的舞台替自己評分。 # speaker:旁白
    - ending_ruoyin == "ruoyin-score":
        第三格的交換簿添了幾行陌生人的故事。若音仍在寫曲，沒有替那些人指定結局。 # speaker:旁白
    - ending_ruoyin == "ruoyin-echo":
        第三格貼著新的比賽海報，樂譜的終止線仍折回舊日的四個音。妳記得她那晚沒有停下來照顧手傷。 # speaker:旁白
    }
    {
    - ending_yenuan == "yenuan-share":
        第四格的食譜添了葉暖喜歡的柚子，旁邊仍留一小口給母親。兩種味道都在。 # speaker:旁白
    - ending_yenuan == "yenuan-reopen":
        第四格記著晨麥重新開門的日期。原來的配方還在，這一次由葉暖親口向常客說起。 # speaker:旁白
    - ending_yenuan == "yenuan-rest":
        第四格放著寫有「下週見」的小牌。葉暖的爐火暫停一週，沒有因此把母親忘掉。 # speaker:旁白
    - ending_yenuan == "yenuan-copy":
        第四格的配方被描得很深，每個步驟都和照片一樣。葉暖仍怕明天的味道有一點不同。 # speaker:旁白
    }
    {
    - ending_yuhang == "yuhang-today":
        第五格是雨航親手簽的今日回條。他請了假，重新走到那間空店面前。 # speaker:旁白
    - ending_yuhang == "yuhang-future":
        第五格留下下個月的日期與第一箱書的清單。雨航知道可以改變做法，沒有再把一切推給沒有日期的明年。 # speaker:旁白
    - ending_yuhang == "yuhang-past":
        第五格放著妹妹的紀念盒；共同開店的夢被他收好，自己的下一條路仍可繼續走。 # speaker:旁白
    - ending_yuhang == "yuhang-unknown":
        第五格是仍未簽收的藍信。雨航不在這一夜接受它，妳也不能替他寫上名字。 # speaker:旁白
    }
    {
    - previous_ending == "haiming-light":
        第六格攤著海明與顧川一起讀過的那頁信，旁邊放著顧川補寫過的日誌。信上的塗改沒有被擦掉；妳讓兩種筆跡都留在桌上。 # speaker:旁白
    - previous_ending == "haiming-voice":
        第六格放著聲音航海誌的索引。海明重說的那句笑話標了兩次時間，沒有剪成一段流暢的英雄事蹟；妳把索引放回錄音旁，沒有替他的聲音改字。 # speaker:旁白
    - previous_ending == "haiming-boat":
        第六格只留著燈塔照片與空信套。紙船由海明和顧川帶到海邊，還有幾句沒說；妳沒有在空信套上寫好寄出的日期。 # speaker:旁白
    - previous_ending == "haiming-hero":
        海明被修平的傳記放在第六格。妳沒有把他真正寫下的猶豫也藏進抽屜，讓那頁原稿與整齊的版本並排。 # speaker:旁白
    }
    -> hidden_hub
* {not read_hidden_height} [摸摸門框上的身高線]
    ~ read_hidden_height = true
    最矮的一筆旁畫著月亮。妳把手放在刻痕上，發現它與手冊封面的筆畫一樣；那不是店主替妳留下的標記。 # speaker:旁白
    -> hidden_hub
* {not read_hidden_clock} [查看停住的時鐘與窗]
    ~ read_hidden_clock = true
    長針停在十二點，窗邊的光卻每過一刻就亮一些。鐘沒有能力把任何人留在昨夜；妳可以在想離開時推開門。 # speaker:旁白
    -> hidden_hub
* [帶著看到的線索回到櫃台]
    妳把書架推回去，留一條能再打開的縫。手冊最後一頁就在櫃台上。 # speaker:旁白
    -> archive_owner_reveal
=== archive_owner_reveal ===
店主指向一頁被折起的手冊。「妳小時候把一封信留在這裡，親口要我替妳保管。我答應了。但我也知道，這讓長大後的妳失去能自己決定的時間。」 # portrait:owner
* [問店主為何一直沒有告訴妳]
    ~ trust += 1
    「那是妳當時的請求。我不能替那個孩子反悔。」店主停了一下。「但我讓妳成為店員，卻沒有說清楚妳也能離開。這件事我做得不好。」 # speaker:店主 # portrait:owner
    -> child_home
* [問童年的保管請求，為何變成成年後推不開的門]
    ~ demanded_exit_answer = true
    「妳只請我保管那封信。」店主看向門口。「第一夜的門在黎明前確實不能從內側開。我知道規則，仍讓妳在不知情時進來；不能拿童年的請求，當成妳成年後同意守夜的證據。」 # speaker:店主 # portrait:owner
    「我現在坐在這裡，是為了拿回自己的話，不是替你當初的決定簽名。」妳把徽章放到桌子的另一邊。 # speaker:林澄
    -> child_home
* [先問信是不是由店主寫的]
    店主把手冊翻過來。紙角是妳自己畫的小月亮，字也屬於童年的妳。「我保存的是妳的字，不是替妳編好的答案。」 # speaker:店主 # portrait:owner
    -> child_home
=== child_home ===
妳看見小時候住的房子。父母那段日子常在深夜爭吵；母親已決定暫時帶妳去姨媽家，父親寫了一封信，說他也會搬出去。 # scene:memory # speaker:旁白 # section:child-home # portrait:lincheng-child
年幼的妳拿到信，沒有交給母親。妳怕母親讀了便走，也怕父親讀不到回信就不會留下。隔天，母親仍帶妳搬走；大人的決定從來不由那一封信單獨造成。 # portrait:lincheng-child
桌上有父親的信、母親留下的便條；妳兒時的外套掛在門邊。 # speaker:旁白
-> home_hub
=== home_hub ===
這間房子的門已經打開。妳可以先看看當年留在裡面的東西。 # speaker:旁白
* {not read_home_letter} [讀父親信封上沒有寄出的地址]
    ~ read_home_letter = true
    ~ understanding += 1
    妳記得把信塞進外套內袋，整夜沒有睡。妳那時真的做了一個選擇，也真的還是需要大人照顧的孩子。 # speaker:旁白
    信封上的地址寫給母親，裡面說父親也準備搬出去；這不是由妳能決定的搬家。 # speaker:旁白
    -> home_hub
* {not read_home_note} [看當晚母親留下的便條]
    ~ read_home_note = true
    便條寫著：「我們先去一個安靜的地方，明天再談。」她的決定早在父親寫信以前便有了形狀。妳把便條與信放在一起。 # speaker:旁白
    -> home_hub
* {not read_home_coat} [摸摸兒時外套的內袋]
    ~ read_home_coat = true
    袋角磨得發白，正好容得下一封信。小時候的妳把它藏在這裡，並不是因為不在乎母親；妳那晚很怕兩個人都離開。 # speaker:旁白
    -> home_hub
* [從兒時外套裡收起第一片信紙]
    -> home_end
=== home_end ===
第一片紙在妳兒時外套裡。「我把那封信藏起來」寫得很用力。 # fragment:kept # speaker:旁白
-> home_after
=== home_after ===
房子裡的燈一盞盞暗下來。妳還站在門邊，想起那晚以後的許多年。 # speaker:旁白
* {not thought_mother} [想想後來有沒有問過母親那一晚]
    ~ thought_mother = true
    妳沒有問過。每年過年，妳們一起包餃子，談工作、談天氣、談姨媽家那台總是太吵的冰箱，就是沒談過那一夜。 # speaker:旁白
    妳一直以為不提是體貼她。站在這間房子裡，妳才想到，她也許同樣以為不提是在體貼妳。
    -> home_after
* {not thought_father} [想想父親後來收到過什麼]
    ~ thought_father = true
    父親後來搬到另一座城市，每年寄一張卡片，字總是很少。妳一直以為那是他不擅長說話。 # speaker:旁白
    他從來不知道有一封信沒有送到。妳也從來沒問過，他那時有沒有等過回音。
    -> home_after
* [走到童年的夜行書店]
    -> hidden_envelope
=== hidden_envelope ===
那晚妳抱著沒有交出去的信，從姨媽家路口走到書店。店門在街燈下亮著，櫃台比現在高得多。 # scene:memory # speaker:旁白 # section:hidden-envelope # portrait:lincheng-child
店主沒有問妳哪個大人是對的，只給妳一張紙，讓妳寫自己怕什麼。黑貓趴在桌沿，尾巴碰到尚未乾的墨水。 # portrait:lincheng-child
紙上有兩個願望，桌沿刻著身高線，黑貓留下半枚墨色腳印。 # speaker:旁白
-> envelope_hub
=== envelope_hub ===
這張童年的櫃台沒有催妳挑出一個比較正確的願望。 # speaker:旁白
* {not read_envelope_wishes} [讀自己當年寫的兩個願望]
    ~ read_envelope_wishes = true
    ~ understanding += 1
    妳寫：「我想讓爸爸留下，也想讓媽媽去安全、安靜的地方。」那時妳以為兩個願望不能同時說，所以把它們都藏起來。 # speaker:旁白
    -> envelope_hub
* {not read_envelope_height} [摸摸童年櫃台的身高線]
    ~ read_envelope_height = true
    木頭上的刻痕只到妳當時的肩膀。旁邊的月亮與現在手冊封面一樣，是妳親手畫的。 # speaker:旁白
    -> envelope_hub
* {not read_envelope_ink} [看黑貓留在紙角的墨色腳印]
    ~ read_envelope_ink = true
    腳印壓住一個沒寫完的字。妳不記得那一筆原想寫什麼，店主也說沒有替妳補上；今天可以讓它仍然空著。 # speaker:旁白
    -> envelope_hub
* [從高高的櫃台下收起另外兩片信紙]
    -> envelope_end
=== envelope_end ===
第二片紙夾在高高的櫃台下，寫著妳怕自己成為分開的理由。 # fragment:afraid # speaker:旁白
第三片紙貼在身高線旁，圈住了那兩個願望。 # fragment:two-wishes
* [問店主保存了什麼，還有什麼沒有保存]
    -> owner_talk
=== owner_talk ===
書店保管了妳的信，沒有讓大人的爭吵消失。妳後來長大、上學、交朋友，也會在一些夜裡覺得自己不該難過，因為已經過了很多年。 # scene:lincheng # speaker:旁白 # section:owner-talk
我只保管妳要求我留住的紙。當時妳說：「先不要讓我想起來。」妳也說，等妳能替別人泡完一杯茶，再問妳一次。 # speaker:店主 # portrait:owner
妳問他為何把這當成挑選店員的理由。店主沒有拿書店規則擋住問題。 # speaker:旁白
我以為讓妳看見別人的故事會幫妳走到自己的信前。但我不該讓妳以為沒有選擇。對不起。 # speaker:店主 # portrait:owner-apology
{demanded_exit_answer:妳沒有立刻接受道歉，只請他把「保管信」與「讓門在黎明前打不開」分開記進手冊。店主照做，沒有把理由寫成妳同意過的事。 # speaker:旁白}
{
- previous_ending == "haiming-light":
    妳想起海明與顧川共讀時，兩人仍可以停在不同的句子上。妳告訴店主：「我讀自己的信，也不必先同意你對那晚的解釋。」 # speaker:林澄
- previous_ending == "haiming-voice":
    妳記得海明的笑聲被錄下來時，重複的一句也沒被剪掉。妳告訴店主：「我的信也請照原樣交給我，連停筆的地方一起。」 # speaker:林澄
- previous_ending == "haiming-boat":
    海明的紙船沒有在那夜拆完。妳把手放在信封上，說：「我可以先拿到它，再決定今天讀到哪一句。」 # speaker:林澄
- previous_ending == "haiming-hero":
    妳想到自己曾把海明的猶豫修成好看的傳記，顧川卻仍找不到父親真正要說的話。妳對店主說：「別替我刪去難看的句子。」 # speaker:林澄
}
~ overstep_count = 0
{ending_jinglan == "intervention": 
    ~ overstep_count += 1
}
{ending_boyan == "boyan-overwork": 
    ~ overstep_count += 1
}
{ending_ruoyin == "ruoyin-echo": 
    ~ overstep_count += 1
}
{ending_yenuan == "yenuan-copy": 
    ~ overstep_count += 1
}
{ending_yuhang == "yuhang-unknown": 
    ~ overstep_count += 1
}
{previous_ending == "haiming-hero": 
    ~ overstep_count += 1
}
-> owner_choice
=== owner_choice ===
店主等著。他沒有催妳原諒，也沒有把道歉收回去。 # speaker:旁白
* {overstep_count > 0 && not owned_overstep} [告訴店主，自己也曾替訪客做過決定]
    ~ owned_overstep = true
    ~ understanding += 1
    妳把六夜的書籤一張張想過去，停在那幾張有裂痕或太平整的上面。 # speaker:旁白
    {ending_jinglan == "intervention":妳替靜蘭封了口，她說過「等等」。 # speaker:林澄}
    {ending_boyan == "boyan-overwork":妳告訴柏言先把報告做完，他聽起來像終於接到熟悉的指令。 # speaker:林澄}
    {ending_ruoyin == "ruoyin-echo":妳勸若音帶著舊傷回到比賽，她說「好」，妳沒問那是答應誰。 # speaker:林澄}
    {ending_yenuan == "yenuan-copy":妳要葉暖一筆不改地照舊做，她從此不敢讓麵包有一點不同。 # speaker:林澄}
    {ending_yuhang == "yuhang-unknown":妳說雨航的信是地址寫錯，他就不必再看簽收欄。 # speaker:林澄}
    {previous_ending == "haiming-hero":妳把海明的猶豫刪成一份整齊的傳記。 # speaker:林澄}
    我不是要拿這些抵掉你的道歉。只是你說不該讓我以為沒有選擇的時候，我想起我也這樣對過別人。 # speaker:林澄
    店主點頭，過了一會才說：「那妳也知道，被替決定的人，事情也許辦成了，自己卻少了一塊。」他沒有說妳因此比較懂他，也沒有說妳因此該原諒。 # speaker:店主 # portrait:owner
    -> owner_choice
* {overstep_count == 0 && not named_own_choices} [告訴店主，六位訪客都是自己做的決定]
    ~ named_own_choices = true
    ~ trust += 1
    靜蘭自己封口，柏言自己決定明天，若音自己挑最後一小節，葉暖、雨航、海明也都是。妳只是在旁邊泡茶。 # speaker:林澄
    所以我也想要一樣的待遇。你可以陪我，可以等我，但我的信，要我自己拆。 # speaker:林澄
    店主把手從信封上收回，放到桌子自己那一側。「好。」 # speaker:店主 # portrait:owner
    -> owner_choice
* [讓他把手冊最後一頁交給妳]
    ~ trust += 1
    他把紙放在桌面，不伸手替妳翻。上面寫著：「保管不等於擁有。取回與否，應由寫信的人決定。」 # clue:hidden-page # speaker:旁白
    -> owner_end
* [告訴他還需要一點時間才會讀]
    妳把杯子挪近自己。「可以。」店主說。窗外的灰白沒有因此退回黑夜，時鐘仍往前走。 # clue:hidden-page # speaker:旁白
    -> owner_end
=== owner_end ===
第四片紙藏在月亮徽章背面。「那晚我也想有人抱抱我。」妳把它放在前三片旁邊。 # fragment:embrace # clue:child-note # speaker:旁白
* [把童年的信拼給現在的自己]
    -> letter_start
=== letter_start ===
四片紙是年幼的妳寫給長大後的自己。可以看清、拼回，也能保留空白；今晚沒有人替妳設定必須記起多少。 # scene:counter # speaker:旁白 # section:self-letter # minigame:letter
-> DONE
=== letter_result ===
{
- letter_understood:
    ~ understanding += 2
    妳從第一句讀到最後一句。藏信是真的，害怕也是真的；那時妳同時想留住父親、保護母親，還想有人先抱一抱自己。 # scene:lincheng # speaker:旁白 # section:dawn-choice
- letter_completion >= 50:
    信還有空白，已讀清的幾句也屬於妳。妳把未拼完的紙放在杯旁，沒有請店主替妳填字。 # scene:lincheng # speaker:旁白 # section:dawn-choice
- else:
    妳只讀了一小片，仍知道這是童年的自己留下的。妳可以把它收著，不必今晚替所有細節命名。 # scene:lincheng # speaker:旁白 # section:dawn-choice
}
店門仍在妳面前。六夜的手記留在書架上，徽章放在妳與店主之間；從哪一側拿起，終於由妳決定。
{demanded_exit_answer:妳想起第一夜推不開的玻璃門。今天它開著，妳可以讀完信再走，也可以把信留下；這一次不需要替店主的決定辯護。 # speaker:旁白}
-> dawn_choice
=== dawn_return ===
信還在杯旁，店門也還開著。 # speaker:旁白
-> dawn_choice
=== dawn_choice ===
* {letter_understood && not asked_embrace} [問店主，那晚有沒有人抱過妳]
    ~ asked_embrace = true
    ~ trust += 1
    那天晚上，有人抱過我嗎？ # speaker:林澄
    店主想了很久。「沒有。我給妳倒了一杯溫開水，讓黑貓睡在妳腳邊。我那時以為，不碰妳才是尊重妳。」 # speaker:店主 # portrait:owner
    妳想起靜蘭說到月台時，妳把紙巾放在桌角，手收回自己這一側。六夜裡妳遞過許多杯茶，沒有一次先問對方，要不要被抱一下。 # speaker:旁白
    ** [請店主現在抱妳一下]
        ~ embrace_kind = "owner"
        可以抱一下嗎？不用很久。 # speaker:林澄
        店主先問妳要站著還是坐著，才繞過櫃台。那個擁抱比妳想像中短，手臂也有點僵，像他同樣很久沒這樣做過。 # speaker:旁白
        這樣就夠了。不是因為它補回了那一晚，而是這一次妳先說出口，也有人聽見。
        -> dawn_return
    ** [說妳想把這個擁抱留給母親]
        ~ embrace_kind = "mother"
        不用了。這一個，我想留著回去問我媽。 # speaker:林澄
        店主沒有勸。他把妳的杯子往妳那邊推近一點，像在說這個答案也算數。 # speaker:旁白
        -> dawn_return
    ** [把黑貓抱到腿上]
        ~ embrace_kind = "cat"
        黑貓本來就在椅邊繞。妳把牠抱起來，牠只掙了一下，便在妳腿上找好位置，暖得像那晚腳邊的那一團。 # speaker:旁白
        妳不必今晚就決定要向誰要這個擁抱。先讓自己被一點重量壓住，也是一種開始。
        -> dawn_return
* {not letter_understood && not read_blank} [看看信上還空著的地方]
    ~ read_blank = true
    ~ understanding += 1
    空著的格子沒有撕過的痕跡。紙還在，字也許也還在，只是今晚妳沒有把它們翻到正面。 # speaker:旁白
    妳想起六夜裡那些沒寫滿的信：訪客走的時候，空白也一起被帶走，沒有人因此說那封信是假的。
    -> dawn_return
* {read_envelope_ink && not read_ink_line} [再看一次被貓腳印壓住的那一筆]
    ~ read_ink_line = true
    半枚腳印仍在紙角，正好壓在兩個願望下面。腳印底下是第三行的開頭，只寫了半個「我」字。 # speaker:旁白
    小時候的妳替爸爸許了一個願，替媽媽許了一個願；第三行才剛要寫到自己，就被貓踩住了。
    ** [讓那一行繼續空著]
        ~ ink_word = "blank"
        妳沒有替它補字。那一行停在半個「我」，至少那晚已經有人開始提到自己。 # speaker:旁白
        -> dawn_return
    ** [用現在的筆跡在旁邊補完它]
        ~ ink_word = "self"
        ~ understanding += 1
        妳向店主借了筆，在腳印旁邊用小一號的字寫：「我也想被好好照顧。」新舊兩種筆跡並排，看得出隔了很多年。 # speaker:旁白
        店主看了一眼，沒有說寫得對不對。「這一行是妳現在寫的。我會記得，不把它當成那時的妳。」 # speaker:店主 # portrait:owner
        -> dawn_return
* {letter_understood && not answered_visitors && (lincheng_destination != "" || lincheng_shift != "" || lincheng_paused != "" || lincheng_mother != "" || lincheng_card != "" || lincheng_fear != "")} [回答六夜裡訪客問過妳的問題]
    ~ answered_visitors = true
    ~ understanding += 1
    -> visitor_answers
* {letter_understood && archive_complete} [取回記憶，摘下徽章，在天亮後走出書店]
    ~ remembered_all = true
    -> end_dawn
* {letter_understood && archive_complete} [完成自己的故事，自願成為下一任守夜人]
    ~ remembered_all = true
    -> end_keeper
* [承認那段過去，讓信暫留書架，帶著未完的記憶離開]
    -> end_shelf
=== visitor_answers ===
六夜裡，妳一直是問問題的人。可是也有人反問過妳；那時妳答得很短，或把問題推回去。現在信讀完了，妳一題一題想。 # speaker:旁白
{
- lincheng_destination == "home":
    靜蘭問過妳今晚本來要去哪裡。妳說要走回住處。其實這幾年，妳每晚都只是走回去，很久沒想過自己要去哪裡。 # speaker:旁白
- lincheng_destination == "unsure":
    靜蘭說白卷可以晚交，名字要先寫上。妳在自己那封信的最上方，用現在的筆跡寫下「林澄」。 # speaker:旁白
}
{
- lincheng_shift == "locked":
    柏言要妳天亮後先讓一個人知道妳在哪裡。那時第一個想到的號碼，妳現在知道是誰的：是母親。 # speaker:旁白
- lincheng_shift == "fine":
    柏言聽得出妳的「還好」。這一次妳對店主說：「我不太好。可是我想慢慢好起來。」 # speaker:林澄
}
{
- lincheng_paused == "moon":
    若音問妳停下過什麼。妳不再畫月亮，是搬家那一年，也是藏起那封信的那一年。 # speaker:旁白
- lincheng_paused == "unsure":
    若音說想不起來也像休止符。妳現在想起來了；那一拍停了很多年，下一拍落在這裡。 # speaker:旁白
}
{
- lincheng_mother == "dumplings":
    葉暖說，手忙的時候有些話比較說得出口。妳想到過年包餃子時，或許可以問母親那一晚。 # speaker:旁白
- lincheng_mother == "rarely":
    葉暖說，打電話就說今天吃了什麼。妳今晚喝了一杯自己泡的茶；這可以是第一句。 # speaker:旁白
}
{
- lincheng_card == "told":
    雨航說，寄件的人每年寫同一個地址，是在確認那個地址還對。父親不知道有一封信沒送到。今年的卡片，妳想回一句。 # speaker:旁白
- lincheng_card == "kept":
    雨航說妳跟他一樣，先送別人的。今晚妳送出的，是寫給自己的那一封。 # speaker:旁白
}
{
- lincheng_fear == "remember":
    妳對海明說過，怕的是想起來。現在妳想起來了，燈還亮著，妳也還坐在這裡。 # speaker:旁白
- lincheng_fear == "guests":
    海明借妳的鉛筆還在口袋裡。妳用它在信紙邊上寫：「我也是這幾晚的客人。」 # speaker:旁白
}
店主一直沒有插話。妳說完，他把手冊翻到新的一頁，推到妳面前，沒有說要寫什麼。 # speaker:旁白
-> dawn_return
=== end_dawn ===
妳把四片信放進自己的口袋，摘下月亮徽章。店主把門打開；這一次，門內沒有任何聲音催妳回頭。 # speaker:旁白
早晨的街道跟妳記得的一樣，也有妳以往沒看過的細節。那封兒時沒交出去的信不能重寄，但妳可以重新跟母親談談那段日子，也可以選擇先去吃早餐。
{obs_door:妳走過門檻，沒有回頭確認它還開著。 # speaker:旁白}
{thought_mother:妳想起過年的餃子。也許今年，可以在包到一半時先問一句：「那天晚上，妳怕不怕？」 # speaker:旁白}
-> dawn_afterword
=== dawn_afterword ===
書籤後記：林澄回到自己的生活。有些晚上仍想起那封信，也會想起書店裡六個人各自走出門的樣子。 # scene:counter # speaker:旁白 # section:afterword
她偶爾能在需要時找到書店，進門坐一會；不再需要靠忘記才能離開。
{owned_overstep:她有時仍想替別人把事情辦完。想起那一夜，她會先問一句：「要我幫忙，還是要我等？」 # speaker:旁白}
{thought_father:父親的下一張卡片寄來時，她回了一封比平常長的信。信裡沒有提那一晚，只問他那座城市冬天冷不冷。 # speaker:旁白}
{embrace_kind == "mother":那年過年包餃子時，她問母親那一晚怕不怕。母親說怕，手上的麵粉還沒拍掉，就先抱了她。 # speaker:旁白}
{embrace_kind == "owner":她回書店坐坐時，店主仍會先問一句：「今天要站著，還是坐著？」 # speaker:旁白}
{embrace_kind == "cat":黑貓有時跟她走到街口，看她過了馬路，才自己回去。 # speaker:旁白}
{ink_word == "self":那張新舊筆跡並排的信紙，她夾在每天用的筆記本裡。 # speaker:旁白}
{flipped_count == 6:她把六張書籤的影本夾在筆記本最後幾頁。有些晚上睡不著，她會翻一張，想想那個人現在在哪裡。 # speaker:旁白}
{answered_visitors:訪客問過她的那幾個問題，她寫在同一頁上，每題底下留著回答。有幾題的答案，後來又改過。 # speaker:旁白}
{answered_visitors && lincheng_card == "told":她回了父親今年的卡片，只有一行：「地址還對。」 # speaker:旁白}
~ ending_kind = "dawn"
-> chapter_coda
=== end_keeper ===
妳先把童年的信讀完，再把徽章拿回手裡。「如果我留下，是因為我願意，不是因為我還不能走。」妳讓店主確認門已能打開。 # speaker:旁白
他點頭，把櫃台的鑰匙交給妳。天光照進來，書店門牌慢慢浮出「林澄」兩個字。 # clue:nameplate
-> keeper_afterword
=== keeper_afterword ===
書籤後記：林澄成為下一任守夜人。有時她需要休息，便把茶席收好、讓門關一晚；她不再把照顧所有人當成離開自己的理由。 # scene:counter # speaker:旁白 # section:afterword
有人帶著未寫完的信來時，她會先問對方願不願意坐下。
{obs_cups:每晚開門以前，她會先替自己倒一杯茶，再去洗客人的杯子。 # speaker:旁白}
{owned_overstep:手冊第一頁多了一行她自己的字：「寄信以前，請讓寫信的人親自封口。也包括我。」 # speaker:旁白}
{named_own_choices:有客人問她該怎麼辦時，她會把筆放在對方那一側的桌上。 # speaker:旁白}
{asked_embrace:有訪客哭的時候，她不再只把紙巾放在桌角。她會先問：「要不要抱一下，還是我坐在這裡就好？」 # speaker:旁白}
{embrace_kind == "mother":休店的那一晚，她回家陪母親包餃子，終於問了那一夜的事。 # speaker:旁白}
{ink_word == "self":每位訪客的手記頁底，她都留一行空白，請對方寫一句給自己的話。 # speaker:旁白}
{flipped_count == 6:她把六張書籤釘在櫃台後的牆上。新來的客人問那是什麼，她說：「之前坐過這張椅子的人。」 # speaker:旁白}
{answered_visitors:有客人反問起她的事時，她不再說「今晚先說你的」。她會先回答一句，再把話還給對方。 # speaker:旁白}
~ ending_kind = "keeper"
-> chapter_coda
=== end_shelf ===
妳把信放回書架，記下它的位置。妳知道自己藏過那封信，也知道那時很害怕；有些細節現在還不想讀，仍可由以後的妳來決定。 # speaker:旁白
店主把門打開，沒有要求妳交出徽章或承諾回來。妳把徽章留在櫃台，帶著已讀的那幾句走出去。
-> shelf_afterword
=== shelf_afterword ===
書籤後記：林澄回到日常。她記得書店的路，卻沒有每晚都去；某些記憶仍像信封裡的空白，不妨礙她往前生活。 # scene:counter # speaker:旁白 # section:afterword
那封信留在書架上，名字朝外，等她哪天想再讀。
{named_own_choices:信留在書架上，是她自己放的。店主沒有替她挑位置。 # speaker:旁白}
{obs_badge:沒有了徽章，她的拇指在口袋裡空了好幾天。後來她發現，自己不按著什麼，也能記得接下來要做的事。 # speaker:旁白}
{read_blank:那封信的空格還在。她經過書架時不急著翻開，知道空白不等於丟了。 # speaker:旁白}
{ink_word == "blank":信上第三行仍停在半個「我」字。她想，等哪天知道後面要寫什麼，再回來寫。 # speaker:旁白}
{ink_word == "self":信上多了一行現在的字，和童年的筆跡並排放在書架上。 # speaker:旁白}
{embrace_kind == "mother":她沒有每晚去書店，卻在某個週末回家，讓母親抱了一下。兩個人都沒說是為了哪一晚。 # speaker:旁白}
{flipped_count == 6:她沒有帶走六張書籤。它們跟她的信放在同一層書架，名字朝外。 # speaker:旁白}
{answered_visitors:六夜裡被問過的那些問題，她回答了想得到的幾題。其餘的，跟信一起留在書架上。 # speaker:旁白}
~ ending_kind = "shelf"
-> chapter_coda
=== end_midnight ===
妳把訪客席推回去，替下一個尚未到來的人擺好茶杯。店主問妳是否確定；妳說今晚還能先處理別人的事。 # scene:lincheng # speaker:旁白 # section:dawn-choice
鐘聲響過十二下，又從第一下開始。門鈴終於響了，妳起身去開門，沒有再看那封寫給自己的信。
{refuse_tried_door:妳知道那扇門能開。所以這一次留下，不是誰把妳關在裡面。 # speaker:旁白}
-> midnight_afterword
=== midnight_afterword ===
書籤後記：夜行書店仍在午夜開門。林澄接待了許多訪客，手冊一頁頁變厚，寫給自己的那封信一直留在櫃台最底下。 # scene:counter # speaker:旁白 # section:afterword
黑貓偶爾會坐到那張空椅子上。今夜，她還沒願意坐過去。
{refuse_read_notes:她的手記越寫越厚，每一頁都有人坐下過。只有最底下那一封，還沒有椅子。 # speaker:旁白}
{flipped_count == 6:她把六張書籤翻過一遍又一遍。自己的那張一直在最底下，她沒有翻開過。 # speaker:旁白}
{lincheng_destination != "" || lincheng_shift != "" || lincheng_paused != "" || lincheng_mother != "" || lincheng_card != "" || lincheng_fear != "":訪客們問過她的那幾個問題，她都記得。只是每次有人再問起，她仍說：「今晚先說你的。」 # speaker:旁白}
~ ending_kind = "midnight"
-> chapter_coda
=== chapter_coda ===
六位訪客的書籤仍在書架上。靜蘭曾在月台停留，柏言攤開過未寄出的信，若音寫過四個音，葉暖留下食譜，雨航面對寫給自己的信，海明想把話留給顧川。後來他們各自做出的選擇，沒有一種能由妳替他們改寫。 # scene:counter # speaker:旁白 # section:coda
他們的故事沒有替妳選答案。夜行書店只是保管了那些沒被說完的話，直到寫信的人有機會親手碰到它們。
妳也在其中。 # speaker:旁白
-> final_bookmark
=== final_bookmark ===
{
- ending_kind == "dawn":
    天亮以後，林澄帶著自己的信走上街道。店門在身後安靜地合上。 # scene:moon-sea # ending:lincheng-dawn
- ending_kind == "keeper":
    書店門牌第一次寫上林澄的名字。今夜留下，明日仍能離開。 # scene:moon-sea # ending:lincheng-keeper
- ending_kind == "shelf":
    她把信留在書架上，帶著已讀的一部分走向晨光。 # scene:moon-sea # ending:lincheng-shelf
- else:
    時鐘又回到午夜十二點。空椅子仍在那裡，等她肯坐下。 # scene:moon-sea # ending:lincheng-midnight
}
-> END
