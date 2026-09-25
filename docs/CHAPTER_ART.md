# 章節美術交付

以下二十二組是本機生成、轉成 WebP 後接入遊戲的無介面文字背景；第一夜另有三組既有背景。每組橫圖為 1672×941、直圖為 941×1672；`src/data/assets.ts` 負責場景對照，`GameView.vue` 依章節與記憶段落選圖。來源 PNG 留在本機 `~/.codex/generated_images/`，遊戲只使用此表的 WebP。

| 記憶段落 | 桌機／手機檔案 | 生成提示詞主軸 |
| --- | --- | --- |
| 柏言 · 凌晨辦公室 | `memory-office.webp`／`memory-office-mobile.webp` | 台北雨夜的空編輯辦公室、未亮的螢幕、散落稿紙與一盞暖色桌燈；日系手繪電影背景，深藍與琥珀色，無人物、可讀文字或介面，下方留對話安全區。 |
| 柏言 · 醫院候診區 | `memory-clinic.webp`／`memory-clinic-mobile.webp` | 延續辦公室的台北雨夜與藍金燈光，空候診椅上的檢查單與小藥袋、昏暗櫃台與不顯示可讀號碼的叫號燈；不描繪急診或醫療恐怖感，下方留對話安全區。 |
| 柏言 · 沒有終點的通勤列車 | `memory-train.webp`／`memory-train-mobile.webp` | 雨夜空車廂、重複至遠方的門與座椅、沒有文字的路線燈板，近處座位上留一封摺起的信與手錶；不出現人物或通知 UI，下方留對話安全區。 |
| 若音 · 童年練習室 | `memory-practice-room.webp`／`memory-practice-room-mobile.webp` | 雨後午後的空學校練琴教室、木椅上的小提琴與譜架；孩子視角、內斂的手繪電影質感，無人物、可讀文字或介面，下方留對話安全區。 |
| 若音 · 比賽後台 | `memory-backstage.webp`／`memory-backstage-mobile.webp` | 延續練習室的雨色與琥珀燈光；空化妝間的鏡子、無字評審表、舊票、護手繃帶與琴盒，門外可見沒有人的演出廳；不繪出人物照片或可讀文字。 |
| 若音 · 散場的宴會廳 | `memory-banquet.webp`／`memory-banquet-mobile.webp` | 婚禮賓客離開後的空宴會廳、成疊椅子、清潔車、雨窗與小舞台上的空椅及琴盒；門邊留下暖光，沒有角色或介面，下方保留對話區。 |
| 若音 · 沒有盡頭的舞台 | `memory-grandstage.webp`／`memory-grandstage-mobile.webp` | 從大幕邊望向層層延伸的空觀眾席；譜架上是沒有可讀文字的末頁，側門透出光，藉燈與座位的重複暗示掌聲循環，不出現觀眾。 |
| 葉暖 · 清晨廚房 | `memory-bakery.webp`／`memory-bakery-mobile.webp` | 台北黎明前的小型家庭烘焙廚房、舊磚烤箱、歪斜的蘋果麵團、蘋果片與食譜卡；暖爐光和雨夜藍色，無人物、可讀文字或介面，下方留對話安全區。 |
| 葉暖 · 週年活動 | `memory-anniversary.webp`／`memory-anniversary-mobile.webp` | 延續廚房的磚爐與麵包店空間；雨夜店面留有週年彩旗、母女共畫的無字招牌、麵包盤、收銀機旁螢幕朝下的手機。店內無角色，下方保留對話區。 |
| 葉暖 · 醫院走廊 | `memory-hospital-return.webp`／`memory-hospital-return-mobile.webp` | 台北雨夜的安靜醫院走廊，長椅上留下麵包紙袋、空白掛號紙和手機；遠處自動門與牆上時鐘，藍色窗景配少量暖光，不使用急診或恐怖意象。 |
| 葉暖 · 熄火的老烤箱 | `memory-old-oven.webp`／`memory-old-oven-mobile.webp` | 返回同一間廚房，磚爐火已熄，只餘深處微光；工作桌有略焦的蘋果麵包、翻面的空白食譜卡和未點燃的蠟燭。維持雨夜藍與晨光交界。 |
| 雨航 · 舊郵局 | `memory-post-office.webp`／`memory-post-office-mobile.webp` | 臺灣沿海雨夜的關閉郵局、拆除郵筒後的褪色紅漆、空白明信片、郵袋與遠處末班車；沉靜的手繪電影背景，無人物、可讀文字或介面，下方留對話安全區。 |
| 雨航 · 沒有人下車的末班公車 | `memory-last-bus.webp`／`memory-last-bus-mobile.webp` | 沿海雨夜的空公車、雨窗外的公路與遠處燈火，座位上留下假單與舊車票；沒有乘客或可讀站名。 |
| 雨航 · 鎖住的空店面 | `memory-empty-shop.webp`／`memory-empty-shop-mobile.webp` | 濱海街道上的舊店門、兩個空書架、過期租約與未用鑰匙，室內殘留暖光，門外下雨。 |
| 雨航 · 夜行書店門外 | `memory-bookshop-door.webp`／`memory-bookshop-door-mobile.webp` | 書店在海邊雨街亮著燈，門前有藍色信與黑貓，屋內可見書架；讓簽收印章與「自己的名字」落在故事前景。 |
| 海明 · 暴風燈塔 | `memory-lighthouse.webp`／`memory-lighthouse-mobile.webp` | 暴風雨中的舊石造燈塔燈室、琥珀色燈光、深藍色海面、航海日誌、紙船與舊照片；溫柔而克制的手繪電影背景，無人物、可讀文字或介面，下方留對話安全區。 |
| 海明 · 夏日探視 | `memory-summer-visit.webp`／`memory-summer-visit-mobile.webp` | 延續暴風燈塔的石造與銅燈語彙，改為安靜夏日塔頂；小顧川未放起的紙風箏與午餐袋留在矮牆，海面與漁村在遠處，沒有角色、可讀文字或介面，下方留對話安全區。 |
| 海明 · 最後一次值班 | `memory-last-watch.webp`／`memory-last-watch-mobile.webp` | 同一座燈塔在颱風前的值班室；婚禮信封、風暴圖、航海日誌與一張空椅子分別指向責任和未到場的家人。延續舊石、銅燈與深藍海面，無人物或可讀文字。 |
| 海明 · 沒有海的白色房間 | `memory-white-room.webp`／`memory-white-room-mobile.webp` | 海明想像中的一般城市房間；窗外只有雨中的屋頂與樹，桌上是未點亮的壞煤油燈、姓名卡與日誌。保留生活痕跡，不使用醫院、恐怖或魔法治癒符號。 |
| 林澄 · 書架後的收藏室 | `memory-hidden-room.webp`／`memory-hidden-room-mobile.webp` | 夜行書店活動書架後的窄收藏室、六封信、月亮銅飾、兒童身高線、停在午夜的鐘與窗外晨光；舊紙、深藍與暖金色，無人物、可讀文字或介面，下方留對話安全區。 |
| 林澄 · 童年住處 | `memory-child-home.webp`／`memory-child-home-mobile.webp` | 孩子的低視角看臺北雨夜住處：餐桌上未寄出的信、空椅子，門邊的行李箱與黃色兒童雨衣；藍色雨窗配暖燈，留出對話安全區。 |
| 林澄 · 童年書店櫃台 | `memory-child-bookshop.webp`／`memory-child-bookshop-mobile.webp` | 孩子的低視角看高木櫃台、未交出的信、墨水、熟睡黑貓、月亮刻痕與雨夜街燈；深藍和暖金的手繪電影感，無人物、可讀文字或介面，下方留對話安全區。橫直圖分別生成。 |

## 訪客立繪

使用內建 `image_gen` 生成透明背景 PNG，再以 Sharp 轉為保留 alpha 的 1024×1536 WebP。以下檔案位於 `public/images/characters/`；`src/data/assets.ts` 對照章節，`GameView.vue` 僅在訪客本人於書店對話時顯示。立繪在對話框後方，不攔截點擊。六位人物沿用深藍夜色、琥珀燈光與手繪電影質感。

| 訪客 | 遊戲檔案 | 生成提示詞主軸 |
| --- | --- | --- |
| 靜蘭 | `jinglan.webp` | 參照原第一夜場景右側的年長臺灣女性：銀灰色低髮髻、深紫花紋外套、舊信封、溫柔而疲憊的神情；透明背景全身立繪，不含場景或文字。 |
| 柏言 | `boyan.webp` | 31 歲疲憊的臺灣科技專案經理、深藍外套、識別證、手錶與筆電包；透明背景全身立繪。 |
| 若音 | `ruoyin.webp` | 28 歲小提琴家、深紫禮服、琴盒與琴弓、包紮的手；透明背景全身立繪。 |
| 葉暖 | `yenuan.webp` | 34 歲麵包店主、沾麵粉的圍裙、燙傷痕跡、藤籃，笑容底下有哀傷；透明背景全身立繪。 |
| 雨航 | `yuhang.webp` | 29 歲夜間郵務員、深藍防水外套、郵袋與信封、木製書店鑰匙圈；透明背景全身立繪。 |
| 海明 | `haiming.webp` | 68 歲退休燈塔守護人、舊針織衫與深藍外套、航海日誌，手提**未點亮**的舊燈；透明背景全身立繪。最初生成的燈誤亮，已用內建 `image_gen` 局部修正後才匯入。 |

第一夜書店對話另以原場景為參考，生成去除舊人物與非中文文字的橫向、直向背景 `public/images/jinglan-room.webp` 和 `public/images/jinglan-room-mobile.webp`；保留林澄、雨窗、書架與空訪客席，在右側疊加靜蘭立繪。章節選單的六張訪客縮圖也由各自背景與立繪組合。七章目前列出的 25 段記憶皆有專屬橫直背景；對應瀏覽器截圖與驗證範圍見 [驗證紀錄](VERIFICATION.md)。
