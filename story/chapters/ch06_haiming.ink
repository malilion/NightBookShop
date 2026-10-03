// 第六夜：顧海明。記憶能被看見一次，不能被書店治癒。
VAR trust = 0
VAR understanding = 0
VAR intervention = 0
VAR previous_ending = ""
VAR tea_type = ""
VAR tea_garnish = "none"
VAR tea_quality = 0
VAR tea_emotional_match = 0
VAR lamp_brightness = 50
VAR lamp_steady = 0
VAR lamp_balanced = false
VAR letter_completion = 0
VAR letter_understood = false
VAR letter_alternate = false
VAR heard_fear = false
VAR kept_everyday = false
VAR read_storm_log = false
VAR read_storm_birth = false
VAR read_storm_chart = false
VAR asked_earlier_ferry = false
VAR read_summer_kite = false
VAR read_summer_lamp = false
VAR read_summer_lunch = false
VAR read_watch_invite = false
VAR read_watch_warning = false
VAR read_watch_photo = false
VAR read_white_card = false
VAR read_white_window = false
VAR read_white_lamp = false
VAR wrote_shop_name = false
VAR asked_where_start = false
VAR tucked_card = false
VAR asked_hands = false
VAR asked_sea = false
VAR asked_morning = false
VAR reoriented_gently = false
VAR told_asked_before = false
VAR heard_wind_first = false
VAR asked_where_stops = false
VAR wrote_today_date = false
VAR allowed_wrong_dates = false
VAR asked_who_delivers = false
VAR ending_ruoyin = ""
VAR told_ruoyin_tune = false
VAR read_aloud = ""
VAR tonight_mark = ""
VAR ending_kind = ""
-> arrival

=== arrival ===
{
- previous_ending == "yuhang-future":
    -> future_return
- else:
    -> haiming_arrival
}
=== future_return ===
一點五十六分，雨航把郵袋放在門外，自己走進來。上回那封寄往七年後的信仍在他手裡，封口旁多寫了一個下個月的日期。 # scene:yuhang # speaker:旁白 # section:reunion
「我路過，想確認那天寫的字還在。」他指向「整理第一箱書，去看一間店」，沒有把那兩件事說成已經完成。 # speaker:程雨航
他說日期還沒到；工作照舊，信卻不再躲在袋底。妳可以問他打算怎麼開始，也可以讓他先帶著這張紙走。 # speaker:旁白
* [問他第一箱書準備從哪裡開始整理]
    雨航說箱子還在床下，妹妹寫過店名的明信片放在最上面。「我會先把它搬到門邊。到那天，再決定要不要去看店。」他自己把日期又讀了一遍。 # speaker:程雨航
    -> future_return_end
* [請他保留日期，也保留改變方法的餘地]
    「好。」雨航把信折好。「如果那間店不合適，我還是會整理書，找下一個地方。日期是提醒我開始，不是另一張不能改的派送表。」 # speaker:程雨航
    -> future_return_end
=== future_return_end ===
他把信放回自己的口袋，沒請妳替他簽收。妳看著他走到街角；郵袋仍在肩上，腳步卻沒有再繞過自己住的那一站。 # speaker:旁白
-> haiming_arrival
=== haiming_arrival ===
兩點二十三分，一位老人推門進來，先檢查窗框，再抬頭看向書店的燈。他抱著一本缺頁航海日誌，臂彎裡還有一盞擦得發亮的煤油燈。 # scene:haiming # speaker:旁白 # section:arrival
{
- previous_ending == "yuhang-today":
    雨航今日簽收的回條還在櫃台。老人看見北岸燈塔的照片，認出自己曾守過的那扇窗，卻沒有想起拍照的人。 # speaker:旁白
- previous_ending == "yuhang-future":
    雨航剛帶著寫有下個月日期的信離開，七年後的郵戳仍壓在燈塔照片下。老人看了很久，只說照片裡的燈沒有熄；妳沒有要他解釋日期。 # speaker:旁白
- previous_ending == "yuhang-past":
    妹妹紀念盒的素描夾著燈塔照片。老人認出塔頂的欄杆，問送照片的人是否平安回家；妳只說那是她留下的影像。 # speaker:旁白
- previous_ending == "yuhang-unknown":
    同一封藍色信又卡在郵筒口。老人把它放回原處，說有些信得等寫信的人自己認出地址。 # speaker:旁白
- else:
    郵筒邊留著一張北岸燈塔照片。老人看了一眼，又去確認窗框是否關好。 # speaker:旁白
}
今晚霧大，燈不能滅。風從東北來，等天亮再換燈芯。 # speaker:顧海明
他熟練地說完，眼神忽然停住。「這裡是哪裡？我記得剛才還在塔上。」黑貓沒有繞開他，只在椅腳旁坐下。 # speaker:旁白 # portrait:haiming-searching
我是林澄，這裡是夜行書店。您可以先坐下，看看帶來的日誌。 # speaker:林澄
* [照他給的步驟一起檢查窗與燈]
    ~ trust += 1
    他慢慢指過窗框，說這盞燈已經壞了。「我知道它點不起來，只是習慣擦乾淨。」 # clue:broken-lamp # speaker:顧海明
    -> observe
* [把書店的名字寫在紙上，留在他身邊]
    ~ trust += 1
    ~ wrote_shop_name = true
    他讀了一遍，放在日誌封面。「謝謝。有時我一轉身，就得重新找起點。」 # speaker:顧海明
    -> observe
=== observe ===
外套口袋有一張兒子顧川寫的姓名與住址卡，字端正清楚。日誌裡有海明自己的字，也有顧川補寫的頁；兩種字沒有被刻意藏起來。 # scene:haiming # speaker:旁白 # section:observations # clue:address-card # clue:many-hands
他能說出三十年前某場風暴的風向，卻需要看一眼牆上的鐘，才知道今天是星期幾。煤油燈壞了，玻璃仍沒有一點灰。
我想趁還記得，給小川留一封信。他總說，我的日誌裡只寫船，沒寫他。 # speaker:顧海明
-> observe_hub
=== observe_hub ===
海明把日誌放在膝上，手指按著其中一頁，像怕它被風吹走。 # speaker:旁白
* {not asked_where_start} [問他想先說哪一天，不要求按年份排序]
    ~ asked_where_start = true
    ~ understanding += 1
    「他小時候來塔上放風箏那天。」海明想了一會。「不，先說一個暴風夜也好。兩天都在這裡。」 # speaker:顧海明
    -> observe_hub
* {not tucked_card} [先替他把住址卡夾回日誌]
    ~ tucked_card = true
    他說顧川寫得很清楚。將卡放回後，他不必再用猜測回答妳的問題。 # speaker:旁白
    -> observe_hub
* {not asked_hands} [問他日誌裡端正的那幾頁是誰寫的]
    ~ asked_hands = true
    「小川。」海明翻到那幾頁。「我寫到一半會停，他就接著寫。」 # speaker:顧海明
    他指著一行顧川的字：「爸說今天潮很高。」「他寫的是我說的話，不是他自己的。連我說錯的潮時，他也照抄，旁邊再用鉛筆小小地寫上對的。」
    海明說他以前嫌兒子的字太工整，不像海上的人寫的。如今翻到那幾頁，他會先停下來，讀得比讀自己的字還慢。 # speaker:旁白
    -> observe_hub
* {not asked_sea} [請他說說今晚的霧，像在值班時那樣]
    ~ asked_sea = true
    ~ trust += 1
    海明坐直了些。「東北風，四到五級。霧是從海面起來的，不是從山上下來，所以天亮前散不了。」他說得又快又準，像在向下一班交接。 # speaker:顧海明
    說完，他看向窗外，才發現外面是一條街。「我說得對不對？」妳說霧確實很大。他點點頭，沒有追問是哪一片海。 # speaker:旁白
    -> observe_hub
* {not asked_morning} [不問日期，問他今天早上吃了什麼]
    ~ asked_morning = true
    海明想了想。「蛋，煎得有點焦。」他說完自己也有些意外。「小川煎的。他說我以前煎的蛋也是焦的，他小時候還以為蛋本來就是那個顏色。」 # speaker:顧海明
    他記不得那是今天早上還是昨天，卻記得兒子在廚房裡笑了一下。妳沒有替他確認是哪一天。 # speaker:旁白
    -> observe_hub
* [泡一杯茶，讓他慢慢想從哪裡開始]
    -> tea_start
=== tea_start ===
茶架上有炭焙焙茶、熟普洱與薄荷。櫃台還留一小碟海鹽焦糖，海明說燈塔廚房裡偶爾也有這樣的味道。 # scene:counter # speaker:旁白 # section:tea
妳把杯子放在他能自己拿到的位置，不要讓茶替他決定哪段故事該先說。
為海明泡一杯茶。 # minigame:tea
-> DONE
=== tea_result ===
{
- tea_type == "hojicha" && tea_garnish == "caramel":
    ~ trust += 2
    焙茶與一點鹹甜氣味讓他想起燈塔廚房。顧川小時候來訪，曾把焦糖偷偷放進父親的杯裡，兩人喝了一口都笑了。 # scene:haiming # speaker:顧海明 # section:watch-lamp # portrait:haiming-warm
- tea_type == "hojicha":
    ~ trust += 1
    焙茶的烘香使他想起燈塔廚房。小碟裡的海鹽焦糖還沒加入，他說顧川小時候常在這裡翻找點心，想到這裡便先笑了一下。 # scene:haiming # speaker:顧海明 # section:watch-lamp # portrait:haiming-warm
- tea_type == "puer":
    普洱的木香讓他慢慢坐穩。他說那次海難的事並不好講，仍願意先從風向開始。 # scene:haiming # speaker:顧海明 # section:watch-lamp
- tea_type == "mint":
    薄荷讓他短暫清醒，隨即焦急問剛才是否說錯日期。妳把寫有書店名稱的紙留在手邊，說可以再看一次。 # scene:haiming # speaker:旁白 # section:watch-lamp # portrait:haiming-searching
- else:
    他握著杯子，仍記不起今天的日期。妳沒有把這杯茶說成一種治療；今晚只需要先聽清他想留下的話。 # scene:haiming # speaker:旁白 # section:watch-lamp
}
{
- tea_quality >= 90:
    ~ understanding += 1
    海明記起顧川小時候在塔裡替他擺過兩個杯墊，一個靠窗、一個靠日誌。「他說燈照船，也該照到我們吃飯的桌子。」海明沒有替這句話補上日期，只請妳把它照原樣寫下。 # clue:tower-table # speaker:顧海明 # portrait:haiming-warm
- tea_quality >= 70:
    ~ trust += 1
    茶的溫度剛好，海明把日誌移到能看清的地方。今夜能讀到哪一頁由他決定，妳等他翻開。 # speaker:旁白
- tea_quality >= 50:
    -> tea_followup
- else:
    茶涼得快，海明以為自己又記錯了沖泡的日子，急著翻日誌求證。妳告訴他茶的溫度不需要證明他的記憶，讓他自己選要讀哪一頁。 # clue:tea-date # speaker:旁白
}
-> tea_mood
=== tea_followup ===
海明把杯子放到日誌旁，說有幾頁寫得太整齊。妳可以請他指出想留下的原句，也可以先等他選好頁碼。 # speaker:旁白
* [請他指出想保留的原句]
    ~ trust += 1
    他指著一句「今天風很大，我也害怕」，說這一行不必修成勇敢的樣子；日誌裡還有他自己的聲音。 # clue:today-page # speaker:顧海明
    -> tea_mood
* [先等他選好頁碼]
    他慢慢翻過兩頁，停在自己認得的字上。「這一頁可以先看，後面的再說。」 # speaker:顧海明
    -> tea_mood
=== tea_mood ===
{
- tea_type == "puer":
    -> puer_wreck
- tea_type == "mint":
    -> mint_dates
- else:
    -> tea_aftercare
}
=== puer_wreck ===
普洱喝到第二口，海明的手不再抖。他說那晚是東北風，浪從左舷打來，說得很穩，像在交班。 # speaker:顧海明
他講到一半停下，看著妳。「這個故事我講過很多次。妳想聽哪一種？」 # speaker:顧海明
* [請他從風向慢慢說下去，不急著說到船回港]
    ~ heard_wind_first = true
    ~ understanding += 1
    他就真的從風說起：幾點轉向、浪多高、雨從哪一扇窗打進來。說到船上四個人的名字，他一個一個念，沒有漏。 # speaker:旁白
    「平常沒人要聽這段。」海明說，「大家只想知道最後怎樣。可是最後那一下，是從這些慢慢來的。」 # speaker:顧海明
    -> tea_aftercare
* [問他，這個故事他通常講到哪裡就停]
    ~ asked_where_stops = true
    ~ trust += 1
    「講到船看見岸。」他沒有想很久。「那裡有掌聲。後面我就不講了。」 # speaker:顧海明
    妳沒有問後面是什麼。他自己把杯子轉了一圈，說：「後面是醫院。」 # speaker:旁白
    -> tea_aftercare
=== mint_dates ===
薄荷的涼意讓他坐直，也讓他一下子翻遍了日誌的日期欄。「剛才我說的是哪一年？是不是說錯了？」 # speaker:顧海明 # portrait:haiming-searching
他翻得越快，手指越找不到剛才那一頁。 # speaker:旁白
* [陪他把今天的日期寫在杯墊上]
    ~ wrote_today_date = true
    ~ trust += 1
    妳把杯墊翻過來，寫下今天的日期，推到他面前。海明看了很久，自己在旁邊補了一個「晴」。 # speaker:旁白
    「寫著，就不用一直問了。」他把杯子壓在杯墊上，手慢慢停下來。 # speaker:顧海明
    -> tea_aftercare
* [告訴他今晚說錯日期也沒關係，日誌會等他]
    ~ allowed_wrong_dates = true
    ~ understanding += 1
    海明愣了一下。「說錯了，燈也不會滅嗎？」 # speaker:顧海明
    妳說不會。他笑了，笑得有點不好意思，把日誌闔上一半。「以前在塔上，記錯一個時間就是大事。原來在這裡不是。」 # speaker:顧海明
    -> tea_aftercare
=== tea_aftercare ===
妳把桌上可用的小燈點亮，讓他看得清日誌。海明說強光下每段往事都像英雄故事，太暗卻會丟掉重要的細節。
隨著他談三段往事，守住一盞柔和的燈。 # minigame:lamp
-> DONE
=== lamp_result ===
{
- lamp_balanced:
    ~ understanding += 2
    柔光照見他的字，也照見停筆與塗改。海明說自己救過人，也說那時很怕。兩句話可以留在同一頁。 # scene:haiming # speaker:旁白 # section:watch-lamp # portrait:haiming-warm
- lamp_brightness > 70:
    ~ intervention += 1
    強光把救援紀錄照得格外漂亮，旁邊寫給兒子的半句話卻更難讀。妳把燈調低一點，等他再指給妳看。 # scene:haiming # speaker:旁白 # section:watch-lamp
- else:
    燈暗下去，墨跡快看不清了。妳補了一點光，讓海明自己決定哪些字還想讀。 # scene:haiming # speaker:旁白 # section:watch-lamp
}
海明翻頁時哼出四個音，尾音停在半空。妳認出若音在茶杯旁拉過的開頭，也想起靜蘭說過校刊室有人曾哼過它；海明卻只說，很多年前燈塔外有人唱過。 # clue:shared-melody # speaker:旁白
海明翻開第一頁。他說風從東北來，屋內卻有一聲嬰兒的哭聲，像從很久以前的海上傳來。
-> tower_door
=== tower_door ===
* {ending_ruoyin != "" && not told_ruoyin_tune} [告訴他，前幾晚有位小提琴手在寫這四個音]
    ~ told_ruoyin_tune = true
    妳說起那位小提琴手。她十歲時寫下這四個音，最後一個音總在落下以前被拉回去。 # speaker:旁白
    海明又哼了一次，這回停在同一個地方。「那她後來，接上了嗎？」 # speaker:顧海明
    {
    - ending_ruoyin == "ruoyin-one":
        妳說她只為一位夜歸的客人拉完，三分鐘，留一拍給呼吸。海明點頭：「一個人聽也夠了。燈塔一整晚，常常也只照到一艘船。」 # speaker:顧海明
    - ending_ruoyin == "ruoyin-stage":
        妳說她先把一封信寄給以前一起練琴的朋友，曲子還在寫。海明笑了：「先寄信，再寫歌。我年輕時，順序常常反過來。」 # speaker:顧海明
    - ending_ruoyin == "ruoyin-score":
        妳說她開始替普通人的故事寫旋律。海明想了想：「守燈的人也算普通人吧。她要是想寫，我可以講風向給她聽。」 # speaker:顧海明
    - else:
        妳說她帶著舊傷回去比賽了。海明沉默了一會：「手會痛還要拉，跟浪大還要守燈不一樣。燈可以換人守。」 # speaker:顧海明
    }
    海明把日誌翻回第一頁。 # speaker:旁白
    -> tower_door
* [走進暴風夜的燈塔]
    -> storm_tower
=== storm_tower ===
暴風夜，燈塔的電源時明時暗。一艘漁船在浪裡失去方向，海明手動守住燈，向海上打出能看見的信號。 # scene:memory # speaker:旁白 # section:storm-tower
同一晚，顧川出生。海明沒有趕到醫院；日誌寫了漁船回港的時間，兒子的出生時刻是多年後顧川補在旁邊的。
值班室的電話響過兩次。第一通是海巡站報船失聯，第二通只留下醫院的號碼；海明把兩個號碼抄在同一頁，沒有寫哪通電話比較重要。
窗外看不見船，只有燈光每轉一圈，在浪脊上短短亮一下。他說自己那時一直數著轉動的次數，好讓雙手有事做，別去想醫院裡正在發生什麼。
日誌背頁有一行「我會趕上」，字被雨水拖成長線。海明指著它說：「我當晚寫了這句，後來才知道，寫下來跟做到是兩件事。」 # speaker:顧海明
救援圖、顧川後來補寫的時間與潮汐圖都在桌上；海明可以一件件說。 # speaker:旁白
-> storm_hub
=== storm_hub ===
燈在風中晃動。海明扶住日誌，讓妳看清上面的字。 # speaker:旁白
* {not read_storm_log} [讀救援紀錄旁的塗改]
    ~ read_storm_log = true
    ~ heard_fear = true
    ~ understanding += 1
    「我怕燈一滅，那些人回不來。」他看著兩種筆跡。「也怕到了醫院，小川已經出生，而我不知道第一句該說什麼。」 # clue:rescue-log # speaker:顧海明
    紀錄記著漁船平安回港。他不把自己害怕的句子擦掉，也不把那夜說成只有一件事。 # speaker:旁白
    右邊的欄位寫著船上四人的姓名，左邊是海明每隔幾分鐘記下的燈號。到第三次信號時，鉛筆芯斷了，後面的數字換成較粗的筆跡。
    海明說他最常講的是船終於看見岸，因為那句話有結尾。他沒向顧川講過的是：那幾分鐘他也想過，倘若燈一直亮著，自己是不是就能不用面對醫院裡的人。
    「救人的事是真的。想逃的念頭也是真的。」他把斷掉的鉛筆留在頁縫裡，沒有請妳選哪一個才算他的樣子。 # speaker:顧海明
    -> storm_hub
* {not read_storm_birth} [辨認顧川補寫的出生時刻]
    ~ read_storm_birth = true
    另一種字在多年後補上姓名與時刻。海明說：「那是小川自己寫的，不是我當晚看見的。」妳們保留兩種筆跡，不替缺席的時間填上假記憶。 # speaker:顧海明
    顧川的字很小，先寫出生時刻，再寫「媽說你隔天才來」。海明念到這裡，停下來問隔天是上午還是下午；日誌沒有答案，顧川也沒替父親編造一個。 # speaker:旁白
    海明記得病房有一張矮椅，記得自己不敢抱孩子，怕手上還有燈油味。他不能確定矮椅是在那天、還是後來某次探望才有的，於是讓兩種可能都留在紙上。
    「小川後來把時間補給我，不是要替我證明我到過。」他說。「他是要我看見，當我不在的時候，他已經來了。」 # speaker:顧海明
    -> storm_hub
* {not read_storm_chart} [對照潮汐圖與救援信號]
    ~ read_storm_chart = true
    潮汐圖留下漁船回港的航線，也圈出當夜往醫院的渡船停航。海明說自己選了留下，不願把天氣說成唯一原因。 # speaker:旁白
    圖上還有一條更早可以搭的航線，鉛筆在碼頭位置停了很久，壓出一個小洞。海明認得那個洞：「警報還沒掛上去的時候，我能走。我想著先把備用燈檢查完。」 # speaker:顧海明
    妳們照順序讀日期：他確實需要在風暴中守塔，但也曾在還能離開時，選擇把出發推到下一刻。海明沒有把這兩件事互相抵消。 # speaker:旁白
    {
    - previous_ending == "yuhang-today":
        妳想起雨航在今天的簽收欄寫下名字。他終於開始走自己的路；海明這張圖卻提醒妳，知道可以出發與真的踏上船，中間仍有一個沒人能代選的時刻。 # speaker:旁白
    - previous_ending == "yuhang-future":
        雨航替下個月的第一步寫了日期，沒有說計畫已經完成。妳看著海明未劃掉的早班船：若只把出發留到「天氣好些」，日期也可能再一次消失。 # speaker:旁白
    - previous_ending == "yuhang-past":
        妳想起雨航選擇將舊夢放進紀念盒的那夜；海明看著沒有走成的航線，說顧川的路也不該只照他的日誌安排。 # speaker:旁白
    - previous_ending == "yuhang-unknown":
        雨航沒有簽收那封藍色信，信仍會回到郵袋。妳看著紙上的早班船：海明今晚願意讀這個沒走的岔口，不表示妳可以替雨航把他尚未拆的信打開。 # speaker:旁白
    }
    -> storm_hub
* [從救援圖旁收起第一角紙船]
    -> storm_end
=== storm_end ===
缺頁的第一角夾在救援圖旁。「我總說燈不能滅」寫了又擦，字還看得見。 # fragment:light # speaker:旁白
{
- heard_wind_first:
    剛才在書店，他從風向說起。現在紙上一格格燈號，正好接上他說過的每一陣風。 # speaker:旁白
- asked_where_stops:
    他說過平常講到船看見岸就停。這一次，他的手指沒有停在那一行，往下移到醫院的號碼。 # speaker:旁白
}
{
- read_storm_log && read_storm_birth && read_storm_chart:
    三件紀錄攤在一起：被救回的人、錯過的出生、還來得及出發的那一刻。海明請妳別替他排成一條只能稱讚或只能責怪的時間線。
- read_storm_birth:
    顧川補上的時刻緊挨在父親的救援紀錄旁。海明將兩種字一起夾好，沒有說自己終於想起那晚沒看見的事。
- else:
    海明先合起日誌，說如果有一天他想知道那晚還漏了什麼，顧川或許願意陪他再翻一次。
}
-> storm_reflection
=== storm_reflection ===
* {read_storm_chart && not asked_earlier_ferry} [問海明，早班船那一格該怎麼寫給顧川]
    ~ asked_earlier_ferry = true
    「寫我那時能走，卻先去檢查了備用燈。」海明把鉛筆孔旁的問號圈起來。「後來船停了，是真的。但不能用後來的風暴，抹掉我先前做的選擇。」 # speaker:顧海明
    妳沒有把這句寫成請顧川原諒；海明說若兒子願意讀，可以讓他知道父親終於肯說完整。 # speaker:旁白
    -> storm_reflection
* [看夏天顧川來訪]
    -> summer_visit
=== summer_visit ===
夏日塔頂的風很小。小顧川拿著風箏來找父親，說今天只要飛起來一點點就好；海明卻還在修理燈具。 # scene:memory # speaker:旁白 # section:summer-visit
孩子等到夕陽落下，靠著牆睡著了。風箏線纏在他手指上，沒有飛過海。
正午時，顧川先把風箏靠在門邊，替父親撿掉落的螺絲。海明叫他別碰鋒利的工具，孩子便坐在門檻，問：「我坐這裡算不算陪你工作？」
海明在回憶裡聽見自己回答「等一下」。到了午後，風從海面換了方向，適合放風箏；他看見窗外的雲，轉身又去校正燈罩的角度。
日誌那天只寫「燈具修妥」。顧川畫的小太陽和兩人份的午餐，沒有進入任何值班紀錄；妳們現在能看見它們，卻不能替那個下午補一場從沒發生的放風箏。
風箏、修燈的工具與沒吃完的午餐都留在塔頂。 # speaker:旁白
-> summer_hub
=== summer_hub ===
風吹過紙面的聲音還在。海明說想再看一會。 # speaker:旁白
* {not read_summer_kite} [查看顧川自己做的風箏]
    ~ read_summer_kite = true
    ~ understanding += 1
    「我買了冰給他，他沒生氣。」海明停一下。「也許他生氣了，是我只記得自己後來有沒有補償。」 # clue:kite # speaker:顧海明
    海明看見風箏尾巴寫著自己的名字，說孩子那天想跟他一起放，不是等一支新的風箏。 # speaker:旁白
    風箏骨架用的是拆下的細竹條，一邊長一邊短，飛起來也許會歪。顧川在接縫上畫了一座燈塔，塔頂有兩個人，小的牽著線，大的抬頭看天。
    海明起初說那是別的孩子畫的，因為他記得顧川不喜歡畫畫。等他看見背面那個一筆一畫寫出的「爸」，才承認自己不知道兒子當時喜歡什麼。
    「我一直以為再買一支好的，就能補回來。」他將歪斜的竹條扶正，又放開。「他做這支，是想等我一起看它飛得怎麼樣。」 # speaker:顧海明
    -> summer_hub
* {not read_summer_lamp} [看修了一整天的燈具]
    ~ read_summer_lamp = true
    燈具那天確實需要修理，工具旁卻有幾次已經可以暫停的記號。海明說不清每一次停手的理由，沒有拿工作替錯過的下午畫上句點。 # speaker:旁白
    螺絲盒分成「今晚要用」和「入秋再換」兩格。後者的零件也在那天被拆開，整齊排在布上；海明說這是他慣常的做法，免得下一次風暴來時措手不及。
    顧川在布角按了一個手印，旁邊寫「我可以幫忙」。海明記得當時很怕孩子從梯上摔下去，於是讓他站遠一些，卻沒有說等自己下梯之後會去哪裡。
    妳問哪一顆螺絲使他不能停。海明挑不出來，便把布折回原處：「也許我只是不知道，停下工作後要怎麼跟他待在一起。」 # speaker:顧海明
    -> summer_hub
* {not read_summer_lunch} [翻開顧川留下的午餐紙袋]
    ~ read_summer_lunch = true
    紙袋裡有一塊海鹽焦糖，還有孩子畫的兩人坐在塔邊吃飯。海明說那天回家前，他們也許真的一起吃過一口；他不確定，就把「也許」留下。 # speaker:顧海明
    麵包被分成一大一小兩半，小的那半先被咬過，後來包進紙裡。顧川在袋口寫「要留給爸爸」，墨水沾了油，最後兩個字幾乎看不見。 # speaker:旁白
    海明說他記得食物的鹹味，也記得有人拉他的袖口；不知道那是顧川，還是另一個夏天來送飯的人。妳讓他自己決定要不要把這份不確定寫進信。
    「寫吧。」他笑了一下。「我不記得我們有沒有一起吃完，但我想讓他知道，我有看見那個袋子。」 # speaker:顧海明
    -> summer_hub
* [從風箏尾巴收起第二角紙船]
    -> summer_end
=== summer_end ===
第二角在風箏尾巴上。「你也一直在岸上等我」的「一直」寫得不整齊。 # fragment:shore # speaker:旁白
{
- read_summer_kite && read_summer_lamp && read_summer_lunch:
    風箏、零件和午餐留著同一個下午的三種時間：孩子等候的時間、海明修燈的時間，還有一小塊不知道有沒有一起吃完的麵包。
- read_summer_kite:
    海明把畫著兩個人的風箏尾巴展平。即使沒看完那天的所有東西，他也不再把買來的冰說成孩子真正等的事。
- else:
    海明把風箏折痕輕輕壓平。他說日誌沒寫的午後，不能因為想不起來，就當它不曾發生。
}
* [去最後一次值班]
    -> fog_interlude
=== fog_interlude ===
翻頁時，海明的手停住了。他抬頭看著書店的書架，像第一次看見它們。 # scene:haiming # speaker:旁白 # portrait:haiming-searching
「對不起。」他壓低聲音，「這裡是哪裡？我是不是該回塔上了？」 # speaker:顧海明
日誌仍攤在夏天那一頁，風箏尾巴那角紙船還在妳手邊。 # speaker:旁白
{
- wrote_today_date:
    杯墊還壓在他的杯子下，背面寫著今天的日期和一個「晴」。他低頭看了一眼，呼吸慢了下來，卻還想不起這是誰寫的。 # speaker:旁白
- allowed_wrong_dates:
    他沒有先道歉。「剛才妳說，說錯了也沒關係。」他看著書架，「那我問一下，應該也可以。」 # speaker:顧海明
}
* [指著寫有書店名稱的紙，再說一次]
    ~ reoriented_gently = true
    ~ trust += 1
    {wrote_shop_name:妳指向日誌封面上那張紙。|妳在紙上寫下「夜行書店」和自己的名字，放到他手邊。}海明逐字讀出來，讀到「林澄」時抬頭看妳。「對，妳剛才說過。」 # speaker:旁白
    他沒有為忘記再道歉一次。妳也沒有提醒他，這是今晚第幾次問。
    -> fog_after
* [順著他說，今晚的燈有人守著]
    ~ trust += 1
    「今晚的燈有人守著，是可靠的人。」妳說。海明的肩膀鬆了一點。 # speaker:林澄
    他低頭看了一會日誌，自己開口：「這裡不是塔吧。有茶的味道。是書店？」妳說是。他笑了一下，像找回一個熟悉的座標。 # speaker:旁白
    -> fog_after
* [告訴他，他剛才已經問過一次了]
    ~ told_asked_before = true
    ~ intervention += 1
    海明愣了一下，臉慢慢紅了。「是嗎。」他把日誌合上一半。「那我不問了。」 # speaker:顧海明
    之後好一陣子，他都沒再問任何事，只反覆摸著住址卡的邊。讓他知道自己忘了，並沒有讓他想起來。 # speaker:旁白
    -> fog_after
=== fog_after ===
黑貓跳上桌，把尾巴搭在日誌上。海明順手摸了摸牠，指尖停在最後一次值班的那一頁。 # speaker:旁白 # portrait:haiming-warm
* [陪他翻到最後一次值班]
    -> last_watch
=== last_watch ===
最後一次值班前，兒子的婚禮邀請與颱風警報一起送到。海明把邀請放在日誌裡，決定留守燈塔。 # scene:memory # speaker:旁白 # section:last-watch
他在信封背面寫「如果雨太大」，沒有寫完。顧川在婚禮照片裡笑著，照片角落留了一張本該給父親的空椅子。
邀請函上的地圖把餐廳畫在港口上方；值班表上的交接時間也已有人簽名。海明說他當時確實問過同事能否換班，卻在得到可以的回答後，又自己走回塔裡。
風暴來前兩日，父子通過一次電話。顧川沒有問燈塔需不需要人，只問父親會不會來；海明答了「我看看」，話筒那邊便安靜下來。他記得那段安靜，比記得掛電話的時間還清楚。
這裡沒有一張能替顧川回答的紙。妳能讀到父親寫過的理由，不能因此推定兒子怎樣理解，更不能讓照片裡的笑容代替他說沒關係。
邀請、警報與後來寄到的婚禮照片疊在一起，日期並不完全相同。 # speaker:旁白
-> watch_hub
=== watch_hub ===
海明摸著那張照片，讓妳先選一件想看的。 # speaker:旁白
* {not read_watch_invite} [翻開婚禮邀請背面的半句話]
    ~ read_watch_invite = true
    ~ understanding += 1
    「有。我走到碼頭又折回。」他看著空椅子。「我救過一些人，也不知道怎麼回到他身邊。我從沒告訴小川我走到碼頭。」 # clue:wedding-invite # speaker:顧海明
    信封背面除了那半句，還有渡船班次：早上七點二十、九點零五。前一班被劃去，後一班旁邊畫了問號。海明說不清他當時是在等天氣，還是在等一個可以不去的理由。 # speaker:旁白
    「若我把這些寫進信，小川可能更生氣。」他用指尖蓋住問號，卻沒有撕掉紙。「他至少可以知道，我不是連出門都沒想過。」 # speaker:顧海明
    妳將邀請與信封一起放回原位。這句話能說明他的猶豫，並不能將顧川等候的那一天還給他。 # speaker:旁白
    -> watch_hub
* {not read_watch_warning} [核對那天的颱風警報]
    ~ read_watch_warning = true
    他說有颱風警報，船可能需要燈。「理由是真的。但我不該拿它當唯一一句對兒子的話。」 # clue:wedding-invite # speaker:顧海明
    警報印著三個時段。最急的時段落在婚禮隔天，婚禮當日下午仍有船班；海明在旁邊註記自己不放心讓年輕同事獨自守夜。 # speaker:旁白
    妳請他讀一遍同事的名字。他念得出，也記得對方已經受過訓練。警報沒有變成假的，只是從「只有我能守」變回一個他可以與別人討論的難題。 # speaker:旁白
    「我怕再有一艘船回不來。」海明說。「我也怕小川問我，為什麼每次都把他排在後面。那時我只會回答第一個怕。」 # speaker:顧海明
    -> watch_hub
* {not read_watch_photo} [查看婚禮照片裡的空椅子]
    ~ read_watch_photo = true
    椅子旁放著一朵被壓扁的白花。海明說不確定顧川是不是替他留位；妳沒有說「他一定會原諒」，只問海明是否願意把自己曾走到碼頭寫進信裡。 # speaker:旁白
    照片背面有顧川寫的「大家都到了」，沒有列出誰缺席。海明盯著「大家」兩字，問顧川是不是故意不寫他的名字；妳說這張照片不能回答這個問題。
    他把照片翻回正面，看見新人身旁有許多親友，也看見自己的空椅。兩件事同時在畫面裡；顧川那天仍可以快樂，也仍可以為父親沒來而難過。
    「如果他願意談，我想聽他自己講那天。」海明說。「不要只讓我的信替他說。」 # speaker:顧海明
    -> watch_hub
* [從邀請背面收起第三角紙船]
    -> watch_end
=== watch_end ===
第三角貼在邀請背面。「回家的人」被圈了起來，旁邊寫著「我呢？」 # fragment:return # speaker:旁白
{
- read_watch_invite && read_watch_warning && read_watch_photo:
    海明把警報、航班和照片重新排開，承認每張紙只能證明一部分；那天顧川怎麼等、後來怎麼想，得由顧川自己說。
- read_watch_invite:
    他摸到信封上的問號，說願意把曾走到碼頭這件事寫給兒子，卻不要求兒子因此把空椅子忘掉。
- else:
    海明合起邀請，說自己的理由可以留在信裡，顧川那天的感受卻不能由他代寫。
}
* [看那間沒有海的白色房間]
    -> white_room
=== white_room ===
沒有海的白色房間裡，海明想像自己有一天忘了燈塔，也認不出兒子。窗外很安靜，記憶沒有像燈光那樣因妳轉動開關便回來。 # scene:memory # speaker:旁白 # section:white-room
他看向顧川寫的住址卡，說這張紙也許能幫忙，卻不能保證每一天都一樣。
{told_asked_before:「我最怕的不是忘記。」海明說，「是別人提醒我忘了的時候，臉上的那種表情。」妳想起剛才自己說過的話，沒有替它辯解。 # speaker:顧海明}
房間裡沒有護士，也沒有一張寫好結局的診斷書。這是海明害怕的未來，不是書店替他看見的預言；他仍坐在今晚的椅子上，還能回答自己想把什麼留給兒子。
床邊擺著他熟悉的杯子，杯把朝向慣用的手；桌上還有一本空白日誌。他說也許有一天要別人提醒自己喝茶，又問：「那時候我還能不能說，不想聽英雄故事？」
妳把問題重新說給他聽，沒有急著替未來的顧川回答。海明想了想，說今天先把自己不想被改寫的句子留下；往後需要什麼幫忙，可以讓父子倆在每個當下再談。
住址卡、安靜的窗與擦乾淨的壞煤油燈都在眼前。 # speaker:旁白
-> white_hub
=== white_hub ===
海明坐了一會，說今天還記得自己的名字。妳沒有請他證明以後也會記得。 # speaker:旁白
* {not read_white_card} [請他讀一次顧川寫的住址卡]
    ~ read_white_card = true
    他讀完兒子的名字，又讀了一次。「今天我記得。」他沒有把「今天」說成以後每一天。 # speaker:顧海明
    卡片正面有住址與電話，背面則寫著「如果找不到路，先坐下來，打給我」。顧川沒有寫「不要再忘了」，也沒有把父親曾經守塔的名字擦掉。 # speaker:旁白
    海明問這是不是顧川親手寫的。妳讓他比對日誌裡那幾頁端正的字；他認得筆畫，並不需要因為認得，便答應明天也一定認得。
    「小川把能幫我的方法寫下來了。」他把卡放在伸手能碰到的地方。「我也想留一件能幫他的東西，不要只讓他替我記。」 # speaker:顧海明
    -> white_hub
* {not read_white_window} [陪他看沒有海的那扇窗]
    ~ read_white_window = true
    ~ kept_everyday = true
    ~ understanding += 1
    「我也有想回家的日子。」他說。「如果哪天我叫不出他的名字，請不要替我把想念那部分刪掉。」 # speaker:顧海明
    窗外沒有燈塔，只有一條普通的街。海明說他曾把街上的聲音當成陌生的港口，後來才知道那是顧川住處附近早晨收攤的聲音。 # speaker:旁白
    他問自己如果忘了那條街，是否也會忘掉曾想靠近兒子。妳說妳不能保證記憶會怎麼變，卻能把今晚他自己說的話照原樣記下來。 # speaker:旁白
    「那就寫，寫我有時候想回去，卻不知道該從哪句話開始。」海明說。「如果我以後不承認，也先別跟我爭；可以等我願意聽的時候，再讀給我。」 # speaker:顧海明
    -> white_hub
* {not read_white_lamp} [查看壞煤油燈的玻璃與燈芯]
    ~ read_white_lamp = true
    玻璃沒有灰，燈芯卻早已不能點火。海明知道它壞了，仍願意擦乾淨；妳沒有把這個習慣當作他會恢復記憶的證據。 # speaker:旁白
    燈座底下刻著交班者的姓名，最後一個是海明自己。修理單註記零件已停產；這盞燈留在他手裡，是因為他還願意保存一件與過去有關的東西。
    海明把玻璃轉給妳看，說即使不能再照亮海面，也可以擺在桌上提醒他坐下喝茶。妳問要不要讓顧川知道它的燈芯壞了，他說要，不必請兒子陪他假裝還能點燃。
    他擦去指印，這一次沒有重複檢查燈芯。壞掉的燈仍在，照顧它的人也仍能決定怎麼使用它。
    -> white_hub
* [從煤油燈內取出最後一角紙船]
    -> white_end
=== white_end ===
黑貓輕碰那盞壞掉的煤油燈，燈內掉出一艘紙船。海明將它展開，最後一角的字是「我曾經想你」。 # fragment:remember # clue:paper-boat # speaker:旁白
這封信反覆改過，句子有重複，也有他不知道要怎麼接下去的地方。妳們把它帶回書店。
{
- read_white_card && read_white_window && read_white_lamp:
    海明將卡、窗邊聽見的日常與不能再點亮的燈記在同一頁。它們不能替他擋住遺忘，但今天他能選擇，哪些話不要被整理掉。
- read_white_window:
    他請妳把「有時候想回家」留下，不必寫成每天都知道怎麼回。妳沒有把他的猶豫修成保證。
- else:
    海明先把紙船握在掌心，說這封信可以慢慢拼，還沒看過的東西不該由書店替他補寫。
}
四片紙船拼回前，海明先問妳會不會替他改掉那些重複的句子。他想知道這封信還能不能聽起來像自己。 # speaker:旁白
* [先問海明今天想保留哪句，再照原樣寫下]
    ~ understanding += 1
    「留『我曾經想你』。還有前面那句『不知道』。」他指著紙上的停筆。「我不是每次都想不起來，也不是每次都說得好。這樣寫，小川才知道我真的在跟他說話。」 # speaker:顧海明
    -> letter_invitation
* [先替他排好年份，再請他核對]
    ~ intervention += 1
    妳把日期依序排開。海明看得出風暴與婚禮各在何年，卻找不到自己為什麼把同一句「想回家」寫了兩遍；他請妳先別刪。 # speaker:旁白
    -> letter_invitation
=== letter_invitation ===
妳們回到櫃台，燈照著紙船的摺痕。即使四片都拼上，也不能讓海明重過那些錯過的日子；它能讓他用今天還能決定的語氣，把信交給顧川。 # scene:counter # speaker:旁白
{reoriented_gently:海明把寫著書店名稱的那張紙也夾進日誌。「這張我要留著。小川可以學著這樣寫，不必每次都從頭解釋。」 # speaker:顧海明}
{asked_earlier_ferry:海明在草稿邊留著「我曾能搭上早班船」。他說這句不能替顧川補回婚禮上的空椅子，卻也不願再把它改寫成「當時沒有別的辦法」。 # speaker:顧海明}
-> letter_ready
=== letter_ready ===
* {previous_ending != "" && not asked_who_delivers} [問海明，這封信要自己交，還是請人送]
    ~ asked_who_delivers = true
    ~ understanding += 1
    妳說起前一晚來過的送信人，他背著一封寫給自己的藍色信。 # speaker:旁白
    {
    - previous_ending == "yuhang-today":
        他最後在簽收欄寫了自己的名字。海明聽完點頭：「自己的信，自己簽。那我這封，我自己交給小川。」 # speaker:顧海明
    - previous_ending == "yuhang-future":
        他把信寄到七年後，又先寫下下個月的日期。海明笑了一下：「我沒有七年。我寫明天。」 # speaker:顧海明
    - previous_ending == "yuhang-past":
        他把信放進妹妹的紀念盒，給自己另寫了一封。海明看著紙船：「寄回過去的，小川收不到。他在現在。」 # speaker:顧海明
    - else:
        他沒有簽收，那封信明天還會在郵袋底。海明沉默了一會：「那我這封，不要讓它繞一輩子。我自己交。」 # speaker:顧海明
    }
    -> letter_ready
* [在柔光下拼回四片紙船]
    -> letter_start
=== letter_start ===
四片紙船上是海明寫給顧川的信。妳可以保留原句的停頓與矛盾，也可以修成流暢的英雄敘述；選擇會影響他是否能被兒子聽見。 # scene:counter # speaker:旁白 # section:letter # minigame:letter
-> DONE
=== letter_result ===
{
- letter_understood:
    ~ understanding += 2
    海明讀到自己寫的「不知道怎麼回到你身邊」，沒有把那句修掉。他說這句不漂亮，卻是那年真正沒能說出口的話。 # scene:haiming # speaker:顧海明 # section:log-choice
- letter_alternate:
    ~ intervention += 1
    信被修得很流暢，只留下守塔與救人的功績。海明讀了兩行，問：「我寫的那句害怕，去哪裡了？」 # scene:haiming # speaker:顧海明 # section:log-choice
- else:
    他把還沒拼齊的部分折好，說想親手留著；今晚有幾句至少已能讀清。 # scene:haiming # speaker:旁白 # section:log-choice
}
妳問他想讓誰聽見這封信。海明看向兒子的住址卡，沒有要求書店替他把以後的每一天變得清楚。
-> sea_choice
=== sea_return ===
紙船在桌上，燈還亮著。 # speaker:旁白
-> sea_choice
=== sea_choice ===
* {letter_understood && read_aloud == ""} [請他把「不知道怎麼回到你身邊」念出來]
    海明把紙船攤平，手指壓在那一行底下。「寫的時候不難。念出來，好像就真的是我說的了。」 # speaker:顧海明
    ** [讓他自己念]
        ~ read_aloud = "self"
        ~ trust += 1
        他念到「不知道怎麼」就停了，嘴唇動了兩下，像在找下一個字。妳沒有替他接。 # speaker:旁白
        過了一會，他從頭再念一次。這一次念完了，聲音很低，卻沒有斷。 # portrait:haiming-warm
        -> sea_return
    ** [由妳念給他聽]
        ~ read_aloud = "lincheng"
        ~ understanding += 1
        妳照著紙上的停頓念，連他劃掉又寫回去的那兩個字也念了。 # speaker:旁白
        海明聽完，看著紙船很久。「原來別人念起來是這樣。不像英雄，像一個爸爸。」 # speaker:顧海明 # portrait:haiming-warm
        -> sea_return
* {tonight_mark == ""} [問他明天醒來，要怎麼記得今晚]
    海明想了想，笑了一下。「我也不知道。很多晚上，我都以為自己會記得。」 # speaker:顧海明
    ** [幫他在日誌今晚這一頁折個角]
        ~ tonight_mark = "corner"
        妳們一起把那頁的右下角折起來。海明用指甲把摺痕壓了兩次。「折角的地方，就是有事的地方。我在燈塔也這樣記潮汐。」 # speaker:顧海明
        -> sea_return
    ** [請他在住址卡背面寫一句給明天的自己]
        ~ tonight_mark = "card"
        ~ understanding += 1
        他把住址卡翻過來，寫得很慢：「今晚寫了信給小川。是真的。」寫完，他把「是真的」三個字又描了一遍。 # speaker:旁白
        -> sea_return
* {letter_understood && lamp_balanced} [邀請顧川到書店，一起讀海明原來的字]
    -> end_light
* [錄下日常、恐懼和笑話，做一份聲音航海誌]
    -> end_voice
* [帶紙船去海邊，先親口說能說的一部分]
    -> end_boat
* [只寄流暢的英雄故事，刪去混亂與後悔]
    ~ intervention += 2
    -> end_hero
=== end_light ===
顧川來到書店，先讀了父親的原句，又讀到自己的字曾補在日誌旁。海明說他記得風箏，卻記不準那年是哪一天。 # speaker:旁白
顧川說自己那時等了很久。海明沒有要求他立刻原諒，顧川也沒有把失去的日子改說成沒關係。兩人坐在同一張桌邊，顧川第一次握住父親的手。 # portrait:haiming-warm
-> light_afterword
=== light_afterword ===
書籤後記：顧川帶父親回來幾次。有些日子海明能說起風箏，有些日子需要再看住址卡。顧川把日誌與卡放在他容易找到的地方。 # scene:counter # speaker:旁白 # section:afterword
那封信仍有塗改與停頓；它不替兩人解決所有往事，卻讓他們知道還能從哪一句開始。
{asked_where_stops:顧川問起那艘船。海明講到船看見岸，停了一下，接著說：「然後我才去醫院。」 # speaker:旁白}
{asked_who_delivers:那封信是海明親手交的。顧川接過時，父子的手在紙船的摺痕上碰了一下。 # speaker:旁白}
{asked_morning:有天早上，顧川煎的蛋又焦了。海明看著盤子說：「跟我煎的一樣。」兩個人都笑了。 # speaker:旁白}
{read_aloud == "self":見到顧川那天，他先自己念了那一句。念到一半停住，顧川等他從頭再念。 # speaker:旁白}
{read_aloud == "lincheng":顧川問那句是誰先念的。海明說是書店的店員：「她念得比我好。可是我想自己再念一次。」 # speaker:旁白}
{tonight_mark == "corner":日誌裡那一頁的折角，顧川用一枚夾子夾住了。 # speaker:旁白}
{tonight_mark == "card":顧川在住址卡背面那行字底下，補了一句：「我收到了。」 # speaker:旁白}
{told_ruoyin_tune:顧川問父親常哼的是什麼歌。海明說不知道名字，只知道有人還在寫最後一個音。 # speaker:旁白}
~ ending_kind = "light"
-> chapter_coda
=== end_voice ===
妳把錄音機放在日誌旁。海明說起海難，也說燈塔廚房的焦糖、兒子第一次做的風箏，以及自己年輕時不敢承認的害怕。 # speaker:旁白
有一句他說了兩次。妳沒有剪掉第二次；海明聽完，笑說「原來我還是會講這個笑話」。
-> voice_afterword
=== voice_afterword ===
書籤後記：顧川收到聲音航海誌，聽見父親說的不只有英勇事蹟。往後海明忘記某個日期時，他們會一起聽一小段，不要求錄音把記憶變回原樣。 # scene:counter # speaker:旁白 # section:afterword
錄音裡有海聲，也有廚房裡沒忍住的笑聲。
{asked_who_delivers:錄音帶是海明自己拿去郵局寄的。櫃台的人問要不要掛號，他說要，還把收件人的名字念了兩遍。 # speaker:旁白}
{heard_wind_first:錄音開頭是一段很長的風向與浪高。顧川沒有快轉，聽到第三遍才明白，父親是在讓他一起站到那晚的窗前。 # speaker:旁白}
{asked_hands:錄音裡父親說錯的潮時，顧川也照抄進日誌，旁邊仍用鉛筆小小地寫上對的。 # speaker:旁白}
{read_aloud == "self":錄音裡那一句他念了兩次。第一次斷在一半，顧川沒有剪掉。 # speaker:旁白}
{read_aloud == "lincheng":錄音開頭，海明說：「有個年輕人替我念過一次，現在換我。」 # speaker:旁白}
{tonight_mark == "corner":他每次聽錄音以前，會先把日誌翻到折角的那一頁。 # speaker:旁白}
{tonight_mark == "card":隔天早上，他讀到住址卡背面那行字，第一件事是按下錄音鍵。 # speaker:旁白}
{told_ruoyin_tune:錄音裡有一段他哼那四個音，停在同一個地方。顧川後來發現，自己也會停在那裡。 # speaker:旁白}
~ ending_kind = "voice"
-> chapter_coda
=== end_boat ===
海明把紙船帶到海邊，顧川站在身旁。他先說那天曾走到碼頭，又說自己不知道要怎麼把後面的話接完。 # speaker:旁白
顧川沒有催他。紙船沒有真的放進海裡，他們把它留在手中，讓那一段先停在這裡。
-> boat_afterword
=== boat_afterword ===
書籤後記：海明日後有些話說得出來，有些仍留在紙上。顧川陪他去看海，兩人不把每次沉默都當成忘記。 # scene:counter # speaker:旁白 # section:afterword
那張紙船依然可以打開；何時讀，由海明自己選。
{asked_who_delivers:紙船還在他手裡。他說過要自己交；只是那天在海邊，他還沒交出去，顧川也沒有伸手要。 # speaker:旁白}
{wrote_today_date:從海邊回來，海明在杯墊背面寫下那天的日期，旁邊寫了顧川的名字。 # speaker:旁白}
{asked_sea:在海邊，海明又報了一次風向和霧。顧川沒有糾正，只問他是怎麼看出來的；海明講了很久。 # speaker:旁白}
{read_aloud != "":在海邊，他把那句念給海聽。風把後半句吹散了，他又念了一次。 # speaker:旁白}
{tonight_mark == "corner":折角的那頁日誌，他也帶去了海邊。 # speaker:旁白}
{tonight_mark == "card":出門前，他把住址卡背面那行字又讀了一遍，才去穿鞋。 # speaker:旁白}
{told_ruoyin_tune:在海邊，他哼了那四個音。風很大，最後一個音被吹走了，他沒有再補。 # speaker:旁白}
~ ending_kind = "boat"
-> chapter_coda
=== end_hero ===
妳把重複、猶豫與後悔刪去，只寄出一份完整的守塔人傳記。每次救援都有日期，每段話都像在表揚他。 # speaker:旁白
海明說那是自己做過的事，卻找不到想對顧川說的那一句。妳將信寄出時，他沒有攔下。
-> hero_afterword
=== hero_afterword ===
書籤後記：顧川收到傳記，珍惜父親救人的紀錄，也說：「我還是不知道他那時有沒有想回家。」 # scene:counter # speaker:旁白 # section:afterword
日誌變得整齊，父子間那張空椅子仍沒有名字。
{asked_who_delivers:海明說過這封信要自己交。最後寄出傳記的，是妳。 # speaker:旁白}
{allowed_wrong_dates:傳記裡每個日期都查證過。海明讀完說：「那晚我說錯的那幾個，比較像我。」 # speaker:旁白}
{asked_hands:傳記裡找不到顧川那幾頁端正的字。那些照抄父親說錯潮時的句子，被當作筆誤刪掉了。 # speaker:旁白}
{read_aloud == "self":傳記裡沒有那一句。他親口念過的，只有書店裡那一次。 # speaker:旁白}
{read_aloud == "lincheng":寄出傳記以前，海明問妳還記不記得那一句怎麼念。妳記得，卻沒有把它寫進去。 # speaker:旁白}
{tonight_mark == "corner":整理成傳記時，那一頁的折角被壓平了。 # speaker:旁白}
{tonight_mark == "card":住址卡背面寫著「今晚寫了信給小川。是真的。」他後來問顧川，那封信裡寫了什麼。 # speaker:旁白}
{told_ruoyin_tune:傳記裡沒有那四個音。海明說，那本來就不是他的歌。 # speaker:旁白}
~ ending_kind = "hero"
-> chapter_coda
=== chapter_coda ===
海明離開後，妳在日誌裡找到三十年前的燈塔照片。海面倒映著夜行書店的窗，岸邊站著一個和妳極為相似的孩子。 # scene:counter # speaker:旁白 # section:coda # clue:lighthouse-photo
照片背面有雨航妹妹的字：「找到月亮標誌了。」她曾到過這座燈塔，卻也沒有寫下書店從哪裡來。
海明口中哼出的四個音，與若音的未完成曲相同。靜蘭曾說她年輕時在校刊室聽過；如今那段旋律在照片背面仍像一條沒有接好的線。
黑貓把六夜留下的紙攤在桌上。水痕、油漬與摺線似乎能接起來，紙角卻還疊著；妳暫時看不出它們通往哪裡。六位訪客都曾把沒能說完的故事留在這裡，妳想等天亮前再逐張翻看。
照片裡的孩子轉過身來。她是年幼的林澄，站在店門前，像在等如今的妳認出她。 # portrait:lincheng-child
一個從未見過面的男人走到櫃台後。 # speaker:旁白 # portrait:owner
妳不是偶然來到這裡。小時候，妳親手請我替妳保管一段不願記得的故事。黎明前，妳可以自己決定要不要把它取回。 # speaker:店主 # portrait:owner
窗外第一次泛出很淡的灰白。手冊的第一頁仍寫著：店員也必須留下自己的故事，才能在黎明以前離開。
-> final_bookmark
=== final_bookmark ===
{
- ending_kind == "light":
    柔光照著海明與顧川握在一起的手，原句的停頓仍留在信裡。 # scene:moon-sea # ending:haiming-light
- ending_kind == "voice":
    航海誌裡有海聲、害怕和笑話。那些聲音還會陪他們聽一會。 # scene:moon-sea # ending:haiming-voice
- ending_kind == "boat":
    紙船停在兩人手中。海明還可以選下一句何時說。 # scene:moon-sea # ending:haiming-boat
- else:
    傳記上的守塔人毫無破綻，兒子仍在字裡尋找父親。 # scene:moon-sea # ending:haiming-hero
}
-> END
