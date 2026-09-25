// 第二夜：許柏言。章節獨立編譯，舊夜的存檔仍由原本的 Ink JSON 載入。
VAR trust = 0
VAR understanding = 0
VAR intervention = 0
VAR previous_ending = ""
VAR tea_type = ""
VAR tea_garnish = "none"
VAR tea_quality = 0
VAR tea_emotional_match = 0
VAR letter_completion = 0
VAR letter_understood = false
VAR letter_alternate = false
VAR read_badge = false
VAR read_watch = false
VAR read_medicine = false
VAR read_exam = false
VAR silenced_phone = false
VAR read_phone = false
VAR notification_all_paused = false
VAR notification_mother_replied = false
VAR read_date = false
VAR chose_support = false
VAR read_apology = false
VAR read_office_badge = false
VAR read_workload = false
VAR read_waiting_number = false
VAR read_train_map = false
-> arrival

=== arrival ===
十二點四十七分。妳把靜蘭留下的杯子洗乾淨，門鈴便又響了。黑貓領著一個年輕男人進來，他的筆電抱在胸前，像一塊擋雨的板。 # scene:boyan # speaker:旁白 # section:arrival
{
- previous_ending == "moonlight":
    妳把靜蘭親手摺好的桂花書籤放回手冊。新客人瞥見上面的名字，才把一直攥著的筆放下。 # speaker:旁白
- previous_ending == "recipient":
    信箱旁還壓著靜蘭詢問收信意願的短箋副本。新客人讀見「可以不回」，把手機翻到沒有通知的那一面。 # speaker:旁白
- previous_ending == "unfinished":
    妳替靜蘭保留的空椅子還在。新客人問能不能坐另一邊；妳說每張椅子都可以慢慢坐。 # speaker:旁白
- previous_ending == "intervention":
    裂了的桂花書籤仍在手冊旁。妳想起靜蘭說「我本來想自己決定」，把伸向新客人筆電的手收回來。 # speaker:旁白
- else:
    手冊在上夜的書籤旁留了空白。妳先替新客人騰出桌面，沒有翻開他的筆電。 # speaker:旁白
}
這裡有插座嗎？我明早還要交報告。 # speaker:許柏言
妳指向牆邊。他打開筆電，螢幕只亮了一瞬便暗下去。門外的雨街也不見了，只剩一排沒有盡頭的書架。 # speaker:旁白
他站起來又坐下，袖口沾著冷掉的便利商店咖啡。手機倒扣在桌上，每次震動，他的手都先於眼睛伸過去。
* [把插座留給他，先問要不要坐穩]
    ~ trust += 1
    妳替他拉開椅子，沒有碰他的電腦。「坐一下。水還熱著。」他看了妳一眼，終於把背包放到地上。 # speaker:林澄
    -> observe
* [先問報告做到哪裡]
    「剩三頁。」他回答得太快，才發現妳並不認識他的公司。 # speaker:許柏言
    -> observe
=== observe ===
他說叫許柏言，三十一歲，是專案經理。這是今晚第三家亮著燈的店，前兩家都要他先買東西。 # scene:boyan # speaker:旁白 # section:listening
妳看見他公事包的拉鍊沒拉好，裡頭有三張不同日期的紙，還有一板拆過的胃藥。
* [問他識別證為何仍掛著]
    ~ read_badge = true
    他把識別證翻過來，背面夾著同事寫的「有事找柏言」。他說最近連請假單都有人傳給他簽。 # clue:badge # speaker:許柏言
    -> observe_more
* [問他手錶為何停住]
    ~ read_watch = true
    「上週三，十一點四十七。」他把錶面朝下。「我在公司走廊昏倒，醒來第一句問的是投影片有沒有寄出去。」 # clue:watch # speaker:許柏言
    -> observe_more
* [先不追問，替他倒一杯水]
    ~ trust += 1
    他喝了兩口，才發現自己一直捏著手機邊框。「它又響了嗎？」妳說沒有。 # speaker:許柏言
    -> observe_more
=== observe_more ===
妳想起手冊裡那句「泡茶，傾聽」。今晚這杯茶不能替他完成報告，也不能替他看醫生，卻能讓他有時間把手從手機上移開。 # scene:counter # speaker:旁白 # section:tea
為柏言泡一杯茶。茶架上有洋甘菊、蜜香紅茶與薄荷，也有其他茶可以選。 # minigame:tea
-> DONE
=== tea_result ===
{
- tea_type == "chamomile" && tea_garnish == "honey":
    ~ trust += 2
    ~ understanding += 1
    他看著蜂蜜在洋甘菊裡化開，終於把手機推遠一點。「我一直以為胸悶只是咖啡喝太多。」妳沒有替他判斷原因，只問上週昏倒後是否回診。 # scene:boyan # speaker:許柏言 # section:listening
    「還沒。」他捧著杯子想了一會兒，「我可以先約門診，再決定明天的報告怎麼辦。」 # speaker:許柏言
- tea_type == "chamomile":
    ~ trust += 2
    他聞了聞洋甘菊的香氣，第一口只沾了嘴唇。「原來我可以等茶涼一點。」 # scene:boyan # speaker:許柏言 # section:listening
- tea_type == "black":
    他把紅茶喝得很快，伸手去拿電腦。妳把熱水壺放回架上，請他先等杯底不再燙手。 # scene:boyan # speaker:旁白 # section:listening
- else:
    他握著杯子，指尖慢慢暖起來。「謝謝。我剛才一直在數未讀訊息。」 # scene:boyan # speaker:許柏言 # section:listening
}
妳問那三張紙。他說自己寫過三封辭職信，每次都沒寄出去。第一封滿是道歉；第二封列完交接事項，連名字都忘了寫；第三封只剩一句「我真的很累」。
* [請他只說身體現在怎麼樣]
    ~ trust += 1
    他把手壓在胸口。「剛才又悶了一下。上週昏倒以後，醫生叫我回診。我還沒約。」 # speaker:許柏言
    -> office
* [問他最怕誰看到辭職信]
    他說主管會失望，母親會擔心，團隊會做不完。「我好像排在他們後面。」 # speaker:許柏言
    -> office
=== office ===
書架間忽然傳出鍵盤聲。妳們走進一間亮著螢光燈的辦公室。每張椅子都空著，柏言的桌上卻擺著別人的待辦。 # scene:memory # speaker:旁白 # section:office
桌面有三處紙張：識別證背面的便條、被折成四角的第一版辭職信，還有貼滿他名字的工作排程。柏言停在桌旁，讓妳先看。 # speaker:旁白
-> office_hub
=== office_hub ===
螢幕的藍光照著那些紙。妳可以再看一處，也可以陪柏言離開。 # speaker:旁白
* {not read_office_badge} [查看識別證背面的便條]
    ~ read_office_badge = true
    ~ read_badge = true
    「有事找柏言」底下，又貼了三張不同部門的名字。他笑了一下：「我以前覺得這代表他們信任我。」 # clue:badge # speaker:許柏言
    他指著一張便條，說對方常在下班後傳訊息來；他也常回。妳問他還記不記得第一次說「今晚不行」是什麼時候，他想了很久。 # speaker:旁白
    -> office_hub
* {not read_apology} [查看第一版信上重複的道歉]
    ~ read_apology = true
    ~ understanding += 1
    每段都以「對不起」開頭，沒有一句說他已經好幾週睡不著。妳把這張放在左邊，沒有替他撕掉。 # speaker:旁白
    柏言認出最後一行是凌晨寫的。那時他想把信寄出去，卻先去改了一份隔天的簡報。「我沒有決定留下，只是又過了一天。」 # speaker:許柏言
    -> office_hub
* {not read_workload} [核對排程上重疊的三份工作]
    ~ read_workload = true
    三種顏色代表三個部門，截止日卻落在同一個早晨。排程下方寫著「由柏言協調」，沒有任何人寫下誰會接手。 # speaker:旁白
    妳問這些工作是否都由他答應。柏言搖頭：「有些是別人幫我答應的。」他把那一格圈起來，第一次沒有替所有人找理由。 # speaker:旁白
    -> office_hub
* [收好鍵盤下的信紙，走向候診區]
    -> office_desk
=== office_desk ===
第二版信壓在鍵盤下，只列交接清單。最後一欄寫著「尚未完成」，筆跡已經淡了。
妳找到第一片信紙：「我目前無法維持原來的工作量。」這是柏言剛才說出口的話，不在任何一封舊信裡。 # fragment:status # speaker:旁白
{previous_ending == "intervention":妳記得靜蘭的書籤在別人替她決定時裂開。這次妳把筆放在桌上，等柏言自己拿起來。 # speaker:旁白}
* [陪他走向候診區]
    -> clinic
=== clinic ===
辦公室的門後是一排候診椅。叫號燈停在上週三，柏言認出自己握皺的檢查單。 # scene:memory # speaker:旁白 # section:clinic
椅上留著檢查單、藥袋與一張過號的號碼牌。他說上次走出去時，還以為只是耽誤了一個會議。 # speaker:許柏言
-> clinic_hub
=== clinic_hub ===
叫號燈沒有再跳。柏言仍坐在旁邊，願意把這幾張紙逐一看完。 # speaker:旁白
* {not read_exam} [看檢查單]
    ~ read_exam = true
    紙上寫著回診日期，還有「若胸悶持續或再度昏厥，應立即就醫」。這是醫囑，不是工作時程。 # clue:exam # speaker:旁白
    他問：「如果我明天請假，會不會太誇張？」妳說不能替醫師判斷症狀，但可以陪他先把就醫的時間留出來。 # speaker:林澄
    -> clinic_hub
* {not read_medicine} [看公事包裡的胃藥]
    ~ read_medicine = true
    他說常拿藥當晚餐後的補救，卻沒有仔細讀過包裝。妳把藥放回袋裡，請他記得向醫師說明症狀。 # clue:medicine # speaker:林澄
    柏言把藥袋與檢查單放在一起。「我原本以為說了胃痛，胸口那件事就不用講。」 # speaker:許柏言
    -> clinic_hub
* {not read_waiting_number} [翻看過號的號碼牌]
    ~ read_waiting_number = true
    號碼牌背後是一則草稿：「今天身體不舒服，下午可能需要離開。」收件人空白，日期是他昏倒的那天。 # speaker:旁白
    柏言說他那時怕同事等不到回覆，就把草稿刪掉了。妳把號碼牌放回他手裡；他說這次想把訊息寫完。 # speaker:許柏言
    -> clinic_hub
* [把第三封信攤平，走向列車]
    -> clinic_more
=== clinic_more ===
他把第三封信攤平：「我真的很累。」妳沒有說「大家都這樣」。他等了一會，補上另一句：「我需要請假就醫。」 # speaker:許柏言
第二片寫著界線：「在看診和休息以前，我不能再接臨時交付的工作。」 # fragment:boundary # speaker:旁白
* [走上那班沒有終點的列車]
    -> train
=== train ===
列車每停一站，手機便亮一次：主管、同事、母親，還有一則明早八點的會議提醒。窗外都是他熟悉的通勤路，卻沒有下車的站名。 # scene:memory # speaker:旁白 # section:train
座位旁有發亮的手機、壓在票根下的舊草稿，以及沒有出口標示的路線圖。 # speaker:旁白
-> train_hub
=== train_hub ===
車廂還在前進。妳可以等柏言讀完，也可以先回書店。 # speaker:旁白
* {not read_phone} [查看手機上亮起的工作通知]
    ~ read_phone = true
    螢幕上同時亮著主管的簡報提醒、同事的交接問題和系統累積的未讀數。母親問他明天有沒有空講電話；那則訊息和工作無關，不必一起關掉。 # speaker:旁白
    柏言把手機握在掌心：「我知道可以暫停，但以前總覺得，關掉就像丟下他們。」妳請他等列車停穩，再由自己決定要留下哪些聲音。 # speaker:林澄
    -> train_hub
* {not read_date} [對照票根與最早草稿的日期]
    ~ read_date = true
    草稿比妳進書店的今天早了七年，月日卻與識別證背面的小字相同。票根也是同一天；柏言記得那晚第一次想離職，最後仍坐到終點站。 # clue:date # speaker:旁白
    妳把日期記進手冊，暫時找不到解釋。 # speaker:旁白
    -> train_hub
* {not read_train_map} [查看沒有出口的路線圖]
    ~ read_train_map = true
    站名全是「再做完這件」、「等下個專案」、「別讓人失望」。柏言看了一會，用指尖圈出一處空白：「我想在這裡下車。」 # speaker:許柏言
    妳們在空白旁寫了兩個字：回診。列車沒有立刻停，他卻第一次知道要找哪一站。 # speaker:旁白
    -> train_hub
* [拾起車窗旁的信紙，回到書店]
    -> train_quiet
=== train_quiet ===
列車又穿過一段沒有站名的隧道。窗上的倒影被三則工作通知照得發白；柏言把手機交還到自己手裡。 # scene:memory # speaker:旁白 # section:train # minigame:notifications
-> DONE
=== notifications_result ===
~ silenced_phone = notification_all_paused
{notification_all_paused:
    ~ understanding += 1
    三則工作通知被柏言逐一暫停，螢幕終於安靜。他沒有刪掉任何人，只為今晚留出一段能看見車窗的時間。 # clue:notification # speaker:旁白
}
{
- notification_mother_replied:
    母親的訊息還在。他回覆「我明天先去看醫生，之後再打給妳」，才把手機收回口袋。 # speaker:許柏言
- else:
    母親的訊息仍留在畫面上。他說明天看完醫生再回，今晚先不替自己編一個「我沒事」。 # speaker:許柏言
}
他在車窗倒影裡看見第三片：「我能交接的資料在共用資料夾；其餘安排需要團隊一起決定。」 # fragment:handoff # speaker:旁白
{not read_date:最早那封草稿的建立日期，比妳進書店的今天早了七年，月日與識別證背面的小字完全相同。妳把這個日期記進手冊，暫時找不到解釋。 # clue:date}
最後一片不必寫成「永遠」。他讀出：「等身體狀況清楚，再決定接下來怎麼工作。」 # fragment:next # speaker:許柏言
列車靠站了。這次月台上有出口，也有可以先坐下的長椅。
* [回書店，把四句話拼在一起]
    -> letter_start
=== letter_start ===
三封辭職信攤在桌上。柏言要寫的，也許先是一封說明現況、界線、交接與下一步的信。順序與留下的空白都由他決定。 # scene:counter # speaker:旁白 # section:letter # minigame:letter
-> DONE
=== letter_result ===
{
- letter_understood:
    ~ understanding += 2
    四句話排好後，他把第一封信上反覆出現的「抱歉」留在旁邊。「原來說清楚，不一定要先認錯。」 # scene:boyan # speaker:許柏言 # section:response
- letter_completion >= 75:
    ~ understanding += 1
    他看著拼好的句子，拿出筆補了一處空白。妳等他寫完，才把信紙轉回他面前。 # scene:boyan # speaker:旁白 # section:response
- else:
    信上還有空白。柏言說今晚至少可以先講清楚哪件事不能再等：回診。 # scene:boyan # speaker:許柏言 # section:response
}
他把三封舊信疊好，問妳：「是不是一定要辭職，才算真的照顧自己？」
不是。也不是一定得留下。妳現在知道的是，今晚的胸悶和上週的昏倒需要處理。明天的決定可以等妳看過醫生、算過手上的資源，再親自作。 # speaker:林澄
* [先陪他安排就醫和請假]
    ~ chose_support = true
    -> rest
* [問他是否想先盤點離職後的生活]
    -> leave
* [陪他寫給主管的工作負荷說明]
    -> boundary
* [告訴他，先把報告做完也許比較安心]
    -> overwork
=== rest ===
柏言用自己的手機查了掛號。他把訊息草稿打成「明天上午需就醫，無法出席會議」，沒有附上一長串道歉。 # scene:boyan # speaker:旁白
{read_exam:他把檢查單放進外套口袋最容易拿到的地方。}
{read_watch:停在 23:47 的錶仍沒有走，但他說下週可以拿去修。}
* [請他親手送出請假訊息]
    他看了一眼收件人，按下送出。書店沒有替他把工作變少，明天卻終於留出了一個上午。 # speaker:旁白
    -> rest_afterword
=== rest_afterword ===
書籤後記：幾週後，柏言帶著修好的手錶路過書店。他的工作沒有一夜改變，但他和醫師談過胸悶，也和主管重新分配了值班。 # scene:counter # speaker:旁白 # section:afterword
他把晚餐放在桌上，說自己仍會緊張，只是不再把那份緊張當作必須立刻打開電腦的命令。
-> coda_rest
=== leave ===
柏言沒有立刻按下寄出。他在紙背寫下存款可以撐多久、誰願意幫忙，以及看診後需要哪些安排。 # scene:boyan # speaker:旁白
「我以前連想辭職都不敢算。」他說。「現在我想知道，離開之後要怎麼生活。」
* [讓他先把可求助的人寫在信旁]
    ~ understanding += 1
    -> leave_afterword
=== leave_afterword ===
書籤後記：柏言就醫、休息後提出離職。他的履歷第一行沒有立刻填上新職稱，而是寫了想重新學的事。 # scene:counter # speaker:旁白 # section:afterword
母親仍問他什麼時候找工作。他沒有每次都答得好，卻開始能說：「先讓我把身體照顧好。」
-> coda_leave
=== boundary ===
他把信題改為「工作負荷與人力安排」。交接清單留在附件，第一段先寫目前無法再單獨承擔的項目。 # scene:boyan # speaker:旁白
* [請他把就醫時間也保留下來]
    ~ understanding += 1
    -> boundary_afterword
=== boundary_afterword ===
書籤後記：談話並不輕鬆。主管起初說「大家都辛苦」，柏言拿出清單，說明哪些工作需要新的負責人。 # scene:counter # speaker:旁白 # section:afterword
他保留了回診時間，沒有用下一次升遷的承諾抵掉它。
-> coda_boundary
=== overwork ===
他點點頭，像終於聽到熟悉的指令。電腦其實仍沒有電，他用手機把報告最後三頁寫完。 # scene:boyan # speaker:旁白
* [看著他送出報告]
    -> overwork_afterword
=== overwork_afterword ===
書籤後記：主管在群組裡稱讚柏言可靠。那則訊息底下，很快又排進下一份工作。 # scene:counter # speaker:旁白 # section:afterword
他的錶仍停在 23:47。妳把那晚的茶方夾在書頁裡，旁邊留下一行提醒：若胸悶持續或再次昏厥，應立即尋求醫療協助。
-> coda_overwork
=== coda_rest ===
妳翻開手冊，發現一張空白頁上多了一行字：「已收存第二位訪客的故事。」 # section:coda # speaker:旁白
柏言的母親回覆他的請假訊息，還傳來一張保存多年的校刊照片。她說封面編輯周靜蘭曾是自己的老師，教她寫文章前先聽完別人的話。妳認出那是昨夜那封藍色信旁的校刊。 # clue:school-journal # speaker:旁白
黑貓按住那封最早的草稿，妳記下與自己進店同月同日、卻早了七年的日期。
停住的時間不是柏言的一生。妳把新的杯子翻正，聽見遠處有人試了一個沒拉完的音。
-> final_rest
=== coda_leave ===
妳在手冊上寫下柏言的名字。黑貓將最早那封草稿推來，日期與妳進店的月日相同，卻早了七年。 # section:coda # speaker:旁白
妳還不明白這個記號，便先把它收好。書架深處，有人試了一個沒拉完的音。
-> final_leave
=== coda_boundary ===
妳把柏言寄出的說明折成書籤。最早那封草稿的建立日期，與妳進店的月日相同，卻早了七年。 # section:coda # speaker:旁白
妳記下日期，遠處忽然傳來一小段小提琴的聲音。
-> final_boundary
=== coda_overwork ===
妳在手冊上抄下柏言留下的醫囑。他的草稿日期與妳進店的月日相同，卻早了七年。 # section:coda # speaker:旁白
這一頁沒有寫「已解決」。妳聽見遠處的小提琴聲，決定把桌上的燈再留久一點。
-> final_overwork
=== final_rest ===
柏言把修好的錶放進口袋。今晚，他替自己留出了一個上午。 # scene:moon-sea # ending:boyan-rest
-> END
=== final_leave ===
履歷的第一行仍空著。那個空白，現在由柏言自己填。 # scene:moon-sea # ending:boyan-leave
-> END
=== final_boundary ===
信上寫著一條他願意守住的界線。明天的工作，不再只靠他一個人扛。 # scene:moon-sea # ending:boyan-boundary
-> END
=== final_overwork ===
報告寄出了，手錶仍停著。妳知道今晚還有一句話沒有被聽見。 # scene:moon-sea # ending:boyan-overwork
-> END
