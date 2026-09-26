// 終章：林澄。六位訪客之後，她坐到自己的訪客席。
VAR trust = 0
VAR understanding = 0
VAR intervention = 0
VAR previous_ending = ""
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
* [先坐到訪客席，替自己留一杯茶]
    ~ sat_down = true
    妳從櫃台後走出來。椅子沒有把門鎖上，徽章仍在桌上。第一次，妳不用替下一位客人安排座位。 # speaker:旁白
    -> self_tea
* [拒絕坐下，繼續替別人整理故事]
    ~ intervention += 1
    妳把椅子推回原位，說還有六份手記要整理。店主沒有攔妳，黑貓只是把自己的尾巴從手冊第一頁移開。 # speaker:旁白
    -> end_midnight
=== self_tea ===
茶席還在原處。妳可以拿任何一罐茶；這次沒有人等著妳判斷他的情緒，也沒有哪一種香氣能替妳決定要想起什麼。 # scene:counter # speaker:旁白 # section:tea
妳把杯子放在自己面前。慢慢泡一杯，然後帶著它看六夜留下的紙。 # minigame:tea
-> DONE
=== tea_result ===
{
- tea_type == "osmanthus":
    靜蘭杯裡的桂花香回來了。妳記得她說，幸福與遺憾能同時存在；今天也許不用立刻替自己選一種心情。 # scene:lincheng # speaker:旁白 # section:archive
- tea_type == "lavender":
    若音的茶有淡淡花香。八音盒的四個音響過，最後一拍終於落下。 # scene:lincheng # speaker:旁白 # section:archive
- tea_type == "hojicha":
    焙茶讓妳想起葉暖的爐火與海明的燈。留住熱度不需要把火開到最旺。 # scene:lincheng # speaker:旁白 # section:archive
- else:
    這杯茶是妳自己選的。水溫與時間不必剛好對應任何訪客；杯口的暖意是此刻真實的。 # scene:lincheng # speaker:旁白 # section:archive
}
六張紙背相互重疊，店主沒有替妳指出那些摺痕通往哪裡。妳逐一翻看，確認每位訪客留下的不是同一個答案。
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
我以為讓妳看見別人的故事會幫妳走到自己的信前。但我不該讓妳以為沒有選擇。對不起。 # speaker:店主 # portrait:owner
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
* {letter_understood && archive_complete} [取回記憶，摘下徽章，在天亮後走出書店]
    ~ remembered_all = true
    -> end_dawn
* {letter_understood && archive_complete} [完成自己的故事，自願成為下一任守夜人]
    ~ remembered_all = true
    -> end_keeper
* [承認那段過去，讓信暫留書架，帶著未完的記憶離開]
    -> end_shelf
=== end_dawn ===
妳把四片信放進自己的口袋，摘下月亮徽章。店主把門打開；這一次，門內沒有任何聲音催妳回頭。 # speaker:旁白
早晨的街道跟妳記得的一樣，也有妳以往沒看過的細節。那封兒時沒交出去的信不能重寄，但妳可以重新跟母親談談那段日子，也可以選擇先去吃早餐。
-> dawn_afterword
=== dawn_afterword ===
書籤後記：林澄回到自己的生活。有些晚上仍想起那封信，也會想起書店裡六個人各自走出門的樣子。 # scene:counter # speaker:旁白 # section:afterword
她偶爾能在需要時找到書店，進門坐一會；不再需要靠忘記才能離開。
~ ending_kind = "dawn"
-> chapter_coda
=== end_keeper ===
妳先把童年的信讀完，再把徽章拿回手裡。「如果我留下，是因為我願意，不是因為我還不能走。」妳讓店主確認門已能打開。 # speaker:旁白
他點頭，把櫃台的鑰匙交給妳。天光照進來，書店門牌慢慢浮出「林澄」兩個字。 # clue:nameplate
-> keeper_afterword
=== keeper_afterword ===
書籤後記：林澄成為下一任守夜人。有時她需要休息，便把茶席收好、讓門關一晚；她不再把照顧所有人當成離開自己的理由。 # scene:counter # speaker:旁白 # section:afterword
有人帶著未寫完的信來時，她會先問對方願不願意坐下。
~ ending_kind = "keeper"
-> chapter_coda
=== end_shelf ===
妳把信放回書架，記下它的位置。妳知道自己藏過那封信，也知道那時很害怕；有些細節現在還不想讀，仍可由以後的妳來決定。 # speaker:旁白
店主把門打開，沒有要求妳交出徽章或承諾回來。妳把徽章留在櫃台，帶著已讀的那幾句走出去。
-> shelf_afterword
=== shelf_afterword ===
書籤後記：林澄回到日常。她記得書店的路，卻沒有每晚都去；某些記憶仍像信封裡的空白，不妨礙她往前生活。 # scene:counter # speaker:旁白 # section:afterword
那封信留在書架上，名字朝外，等她哪天想再讀。
~ ending_kind = "shelf"
-> chapter_coda
=== end_midnight ===
妳把訪客席推回去，替下一個尚未到來的人擺好茶杯。店主問妳是否確定；妳說今晚還能先處理別人的事。 # scene:lincheng # speaker:旁白 # section:dawn-choice
鐘聲響過十二下，又從第一下開始。門鈴終於響了，妳起身去開門，沒有再看那封寫給自己的信。
-> midnight_afterword
=== midnight_afterword ===
書籤後記：夜行書店仍在午夜開門。林澄接待了許多訪客，手冊一頁頁變厚，寫給自己的那封信一直留在櫃台最底下。 # scene:counter # speaker:旁白 # section:afterword
黑貓偶爾會坐到那張空椅子上。今夜，她還沒願意坐過去。
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
