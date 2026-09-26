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
VAR read_summer_kite = false
VAR read_summer_lamp = false
VAR read_summer_lunch = false
VAR read_watch_invite = false
VAR read_watch_warning = false
VAR read_watch_photo = false
VAR read_white_card = false
VAR read_white_window = false
VAR read_white_lamp = false
VAR ending_kind = ""
-> arrival

=== arrival ===
兩點二十三分，一位老人推門進來，先檢查窗框，再抬頭看向書店的燈。他抱著一本缺頁航海日誌，臂彎裡還有一盞擦得發亮的煤油燈。 # scene:haiming # speaker:旁白 # section:arrival
{
- previous_ending == "yuhang-today":
    雨航今日簽收的回條還在櫃台。老人看見北岸燈塔的照片，認出自己曾守過的那扇窗，卻沒有想起拍照的人。 # speaker:旁白
- previous_ending == "yuhang-future":
    七年後的郵戳壓在燈塔照片下。老人看了很久，只說照片裡的燈沒有熄；妳沒有要他解釋日期。 # speaker:旁白
- previous_ending == "yuhang-past":
    妹妹紀念盒的素描夾著燈塔照片。老人認出塔頂的欄杆，問送照片的人是否平安回家；妳只說那是她留下的影像。 # speaker:旁白
- previous_ending == "yuhang-unknown":
    同一封藍色信又卡在郵筒口。老人把它放回原處，說有些信得等寫信的人自己認出地址。 # speaker:旁白
- else:
    郵筒邊留著一張北岸燈塔照片。老人看了一眼，又去確認窗框是否關好。 # speaker:旁白
}
今晚霧大，燈不能滅。風從東北來，等天亮再換燈芯。 # speaker:顧海明
他熟練地說完，眼神忽然停住。「這裡是哪裡？我記得剛才還在塔上。」黑貓沒有繞開他，只在椅腳旁坐下。
我是林澄，這裡是夜行書店。您可以先坐下，看看帶來的日誌。 # speaker:林澄
* [照他給的步驟一起檢查窗與燈]
    ~ trust += 1
    他慢慢指過窗框，說這盞燈已經壞了。「我知道它點不起來，只是習慣擦乾淨。」 # clue:broken-lamp # speaker:顧海明
    -> observe
* [把書店的名字寫在紙上，留在他身邊]
    ~ trust += 1
    他讀了一遍，放在日誌封面。「謝謝。有時我一轉身，就得重新找起點。」 # speaker:顧海明
    -> observe
=== observe ===
外套口袋有一張兒子顧川寫的姓名與住址卡，字端正清楚。日誌裡有海明自己的字，也有顧川補寫的頁；兩種字沒有被刻意藏起來。 # scene:haiming # speaker:旁白 # section:observations # clue:address-card # clue:many-hands
他能說出三十年前某場風暴的風向，卻需要看一眼牆上的鐘，才知道今天是星期幾。煤油燈壞了，玻璃仍沒有一點灰。
我想趁還記得，給小川留一封信。他總說，我的日誌裡只寫船，沒寫他。 # speaker:顧海明
* [問他想先說哪一天，不要求按年份排序]
    ~ understanding += 1
    「他小時候來塔上放風箏那天。」海明想了一會。「不，先說一個暴風夜也好。兩天都在這裡。」 # speaker:顧海明
    -> tea_start
* [先替他把住址卡夾回日誌]
    他說顧川寫得很清楚。將卡放回後，他不必再用猜測回答妳的問題。 # speaker:旁白
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
    焙茶與一點鹹甜氣味讓他想起燈塔廚房。顧川小時候來訪，曾把焦糖偷偷放進父親的杯裡，兩人喝了一口都笑了。 # scene:haiming # speaker:顧海明 # section:watch-lamp
- tea_type == "hojicha":
    ~ trust += 1
    焙茶的烘香使他想起燈塔廚房。小碟裡的海鹽焦糖還沒加入，他說顧川小時候常在這裡翻找點心，想到這裡便先笑了一下。 # scene:haiming # speaker:顧海明 # section:watch-lamp
- tea_type == "puer":
    普洱的木香讓他慢慢坐穩。他說那次海難的事並不好講，仍願意先從風向開始。 # scene:haiming # speaker:顧海明 # section:watch-lamp
- tea_type == "mint":
    薄荷讓他短暫清醒，隨即焦急問剛才是否說錯日期。妳把寫有書店名稱的紙留在手邊，說可以再看一次。 # scene:haiming # speaker:旁白 # section:watch-lamp
- else:
    他握著杯子，仍記不起今天的日期。妳沒有把這杯茶說成一種治療；今晚只需要先聽清他想留下的話。 # scene:haiming # speaker:旁白 # section:watch-lamp
}
妳把桌上可用的小燈點亮，讓他看得清日誌。海明說強光下每段往事都像英雄故事，太暗卻會丟掉重要的細節。
隨著他談三段往事，守住一盞柔和的燈。 # minigame:lamp
-> DONE
=== lamp_result ===
{
- lamp_balanced:
    ~ understanding += 2
    柔光照見他的字，也照見停筆與塗改。海明說自己救過人，也說那時很怕。兩句話可以留在同一頁。 # scene:haiming # speaker:旁白 # section:watch-lamp
- lamp_brightness > 70:
    ~ intervention += 1
    強光把救援紀錄照得格外漂亮，旁邊寫給兒子的半句話卻更難讀。妳把燈調低一點，等他再指給妳看。 # scene:haiming # speaker:旁白 # section:watch-lamp
- else:
    燈暗下去，墨跡快看不清了。妳補了一點光，讓海明自己決定哪些字還想讀。 # scene:haiming # speaker:旁白 # section:watch-lamp
}
海明翻頁時哼出四個音，尾音停在半空。妳認出若音在茶杯旁拉過的開頭，也想起靜蘭說過校刊室有人曾哼過它；海明卻只說，很多年前燈塔外有人唱過。 # clue:shared-melody # speaker:旁白
海明翻開第一頁。他說風從東北來，屋內卻有一聲嬰兒的哭聲，像從很久以前的海上傳來。
* [走進暴風夜的燈塔]
    -> storm_tower
=== storm_tower ===
暴風夜，燈塔的電源時明時暗。一艘漁船在浪裡失去方向，海明手動守住燈，向海上打出能看見的信號。 # scene:memory # speaker:旁白 # section:storm-tower
同一晚，顧川出生。海明沒有趕到醫院；日誌寫了漁船回港的時間，兒子的出生時刻是多年後顧川補在旁邊的。
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
    -> storm_hub
* {not read_storm_birth} [辨認顧川補寫的出生時刻]
    ~ read_storm_birth = true
    另一種字在多年後補上姓名與時刻。海明說：「那是小川自己寫的，不是我當晚看見的。」妳們保留兩種筆跡，不替缺席的時間填上假記憶。 # speaker:顧海明
    -> storm_hub
* {not read_storm_chart} [對照潮汐圖與救援信號]
    ~ read_storm_chart = true
    潮汐圖留下漁船回港的航線，也圈出當夜往醫院的渡船停航。海明說自己選了留下，不願把天氣說成唯一原因。 # speaker:旁白
    {previous_ending == "yuhang-past":妳想起雨航選擇將舊夢放進紀念盒的那夜；海明看著沒有走成的航線，說顧川的路也不該只照他的日誌安排。 # speaker:旁白}
    -> storm_hub
* [從救援圖旁收起第一角紙船]
    -> storm_end
=== storm_end ===
缺頁的第一角夾在救援圖旁。「我總說燈不能滅」寫了又擦，字還看得見。 # fragment:light # speaker:旁白
* [看夏天顧川來訪]
    -> summer_visit
=== summer_visit ===
夏日塔頂的風很小。小顧川拿著風箏來找父親，說今天只要飛起來一點點就好；海明卻還在修理燈具。 # scene:memory # speaker:旁白 # section:summer-visit
孩子等到夕陽落下，靠著牆睡著了。風箏線纏在他手指上，沒有飛過海。
風箏、修燈的工具與沒吃完的午餐都留在塔頂。 # speaker:旁白
-> summer_hub
=== summer_hub ===
風吹過紙面的聲音還在。海明說想再看一會。 # speaker:旁白
* {not read_summer_kite} [查看顧川自己做的風箏]
    ~ read_summer_kite = true
    ~ understanding += 1
    「我買了冰給他，他沒生氣。」海明停一下。「也許他生氣了，是我只記得自己後來有沒有補償。」 # clue:kite # speaker:顧海明
    海明看見風箏尾巴寫著自己的名字，說孩子那天想跟他一起放，不是等一支新的風箏。 # speaker:旁白
    -> summer_hub
* {not read_summer_lamp} [看修了一整天的燈具]
    ~ read_summer_lamp = true
    燈具那天確實需要修理，工具旁卻有幾次已經可以暫停的記號。海明說不清每一次停手的理由，沒有拿工作替錯過的下午畫上句點。 # speaker:旁白
    -> summer_hub
* {not read_summer_lunch} [翻開顧川留下的午餐紙袋]
    ~ read_summer_lunch = true
    紙袋裡有一塊海鹽焦糖，還有孩子畫的兩人坐在塔邊吃飯。海明說那天回家前，他們也許真的一起吃過一口；他不確定，就把「也許」留下。 # speaker:顧海明
    -> summer_hub
* [從風箏尾巴收起第二角紙船]
    -> summer_end
=== summer_end ===
第二角在風箏尾巴上。「你也一直在岸上等我」的「一直」寫得不整齊。 # fragment:shore # speaker:旁白
* [去最後一次值班]
    -> last_watch
=== last_watch ===
最後一次值班前，兒子的婚禮邀請與颱風警報一起送到。海明把邀請放在日誌裡，決定留守燈塔。 # scene:memory # speaker:旁白 # section:last-watch
他在信封背面寫「如果雨太大」，沒有寫完。顧川在婚禮照片裡笑著，照片角落留了一張本該給父親的空椅子。
邀請、警報與後來寄到的婚禮照片疊在一起，日期並不完全相同。 # speaker:旁白
-> watch_hub
=== watch_hub ===
海明摸著那張照片，讓妳先選一件想看的。 # speaker:旁白
* {not read_watch_invite} [翻開婚禮邀請背面的半句話]
    ~ read_watch_invite = true
    ~ understanding += 1
    「有。我走到碼頭又折回。」他看著空椅子。「我救過一些人，也不知道怎麼回到他身邊。我從沒告訴小川我走到碼頭。」 # clue:wedding-invite # speaker:顧海明
    -> watch_hub
* {not read_watch_warning} [核對那天的颱風警報]
    ~ read_watch_warning = true
    他說有颱風警報，船可能需要燈。「理由是真的。但我不該拿它當唯一一句對兒子的話。」 # clue:wedding-invite # speaker:顧海明
    -> watch_hub
* {not read_watch_photo} [查看婚禮照片裡的空椅子]
    ~ read_watch_photo = true
    椅子旁放著一朵被壓扁的白花。海明說不確定顧川是不是替他留位；妳沒有說「他一定會原諒」，只問海明是否願意把自己曾走到碼頭寫進信裡。 # speaker:旁白
    -> watch_hub
* [從邀請背面收起第三角紙船]
    -> watch_end
=== watch_end ===
第三角貼在邀請背面。「回家的人」被圈了起來，旁邊寫著「我呢？」 # fragment:return # speaker:旁白
* [看那間沒有海的白色房間]
    -> white_room
=== white_room ===
沒有海的白色房間裡，海明想像自己有一天忘了燈塔，也認不出兒子。窗外很安靜，記憶沒有像燈光那樣因妳轉動開關便回來。 # scene:memory # speaker:旁白 # section:white-room
他看向顧川寫的住址卡，說這張紙也許能幫忙，卻不能保證每一天都一樣。
住址卡、安靜的窗與擦乾淨的壞煤油燈都在眼前。 # speaker:旁白
-> white_hub
=== white_hub ===
海明坐了一會，說今天還記得自己的名字。妳沒有請他證明以後也會記得。 # speaker:旁白
* {not read_white_card} [請他讀一次顧川寫的住址卡]
    ~ read_white_card = true
    他讀完兒子的名字，又讀了一次。「今天我記得。」他沒有把「今天」說成以後每一天。 # speaker:顧海明
    -> white_hub
* {not read_white_window} [陪他看沒有海的那扇窗]
    ~ read_white_window = true
    ~ kept_everyday = true
    ~ understanding += 1
    「我也有想回家的日子。」他說。「如果哪天我叫不出他的名字，請不要替我把想念那部分刪掉。」 # speaker:顧海明
    -> white_hub
* {not read_white_lamp} [查看壞煤油燈的玻璃與燈芯]
    ~ read_white_lamp = true
    玻璃沒有灰，燈芯卻早已不能點火。海明知道它壞了，仍願意擦乾淨；妳沒有把這個習慣當作他會恢復記憶的證據。 # speaker:旁白
    -> white_hub
* [從煤油燈內取出最後一角紙船]
    -> white_end
=== white_end ===
黑貓輕碰那盞壞掉的煤油燈，燈內掉出一艘紙船。海明將它展開，最後一角的字是「我曾經想你」。 # fragment:remember # clue:paper-boat # speaker:旁白
這封信反覆改過，句子有重複，也有他不知道要怎麼接下去的地方。妳們把它帶回書店。
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
顧川說自己那時等了很久。海明沒有要求他立刻原諒，顧川也沒有把失去的日子改說成沒關係。兩人坐在同一張桌邊，顧川第一次握住父親的手。
-> light_afterword
=== light_afterword ===
書籤後記：顧川帶父親回來幾次。有些日子海明能說起風箏，有些日子需要再看住址卡。顧川把日誌與卡放在他容易找到的地方。 # scene:counter # speaker:旁白 # section:afterword
那封信仍有塗改與停頓；它不替兩人解決所有往事，卻讓他們知道還能從哪一句開始。
~ ending_kind = "light"
-> chapter_coda
=== end_voice ===
妳把錄音機放在日誌旁。海明說起海難，也說燈塔廚房的焦糖、兒子第一次做的風箏，以及自己年輕時不敢承認的害怕。 # speaker:旁白
有一句他說了兩次。妳沒有剪掉第二次；海明聽完，笑說「原來我還是會講這個笑話」。
-> voice_afterword
=== voice_afterword ===
書籤後記：顧川收到聲音航海誌，聽見父親說的不只有英勇事蹟。往後海明忘記某個日期時，他們會一起聽一小段，不要求錄音把記憶變回原樣。 # scene:counter # speaker:旁白 # section:afterword
錄音裡有海聲，也有廚房裡沒忍住的笑聲。
~ ending_kind = "voice"
-> chapter_coda
=== end_boat ===
海明把紙船帶到海邊，顧川站在身旁。他先說那天曾走到碼頭，又說自己不知道要怎麼把後面的話接完。 # speaker:旁白
顧川沒有催他。紙船沒有真的放進海裡，他們把它留在手中，讓那一段先停在這裡。
-> boat_afterword
=== boat_afterword ===
書籤後記：海明日後有些話說得出來，有些仍留在紙上。顧川陪他去看海，兩人不把每次沉默都當成忘記。 # scene:counter # speaker:旁白 # section:afterword
那張紙船依然可以打開；何時讀，由海明自己選。
~ ending_kind = "boat"
-> chapter_coda
=== end_hero ===
妳把重複、猶豫與後悔刪去，只寄出一份完整的守塔人傳記。每次救援都有日期，每段話都像在表揚他。 # speaker:旁白
海明說那是自己做過的事，卻找不到想對顧川說的那一句。妳將信寄出時，他沒有攔下。
-> hero_afterword
=== hero_afterword ===
書籤後記：顧川收到傳記，珍惜父親救人的紀錄，也說：「我還是不知道他那時有沒有想回家。」 # scene:counter # speaker:旁白 # section:afterword
日誌變得整齊，父子間那張空椅子仍沒有名字。
~ ending_kind = "hero"
-> chapter_coda
=== chapter_coda ===
海明離開後，妳在日誌裡找到三十年前的燈塔照片。海面倒映著夜行書店的窗，岸邊站著一個和妳極為相似的孩子。 # scene:counter # speaker:旁白 # section:coda # clue:lighthouse-photo
照片背面有雨航妹妹的字：「找到月亮標誌了。」她曾到過這座燈塔，卻也沒有寫下書店從哪裡來。
海明口中哼出的四個音，與若音的未完成曲相同。靜蘭曾說她年輕時在校刊室聽過；如今那段旋律在照片背面仍像一條沒有接好的線。
黑貓把六夜留下的紙攤在桌上。水痕、油漬與摺線接成一張城市地圖，中心是夜行書店。妳明白，這裡一直在保管沒有被好好說完的故事。
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
