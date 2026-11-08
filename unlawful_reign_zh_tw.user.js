// ==UserScript==
// @name         Unlawful Reign 繁體中文化（測試版）
// @namespace    https://unlawfulreign.netlify.app/
// @version      0.4.22
// @description  繁體中文化遊戲介面與動態文字，持續保存待翻譯紀錄。
// @homepageURL  https://github.com/Prysline/unlawful-reign-zh-tw
// @supportURL   https://github.com/Prysline/unlawful-reign-zh-tw/issues
// @updateURL    https://raw.githubusercontent.com/Prysline/unlawful-reign-zh-tw/main/unlawful_reign_zh_tw.user.js
// @downloadURL  https://raw.githubusercontent.com/Prysline/unlawful-reign-zh-tw/main/unlawful_reign_zh_tw.user.js
// @match        https://unlawfulreign.netlify.app/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
    'use strict';

    // 已確認出現在遊戲起始畫面的文字，加上遊戲類型常見詞彙。
    // 後者不代表已逐一核實在目前版本中的原文拼寫。
    const BUILTIN = Object.freeze({
        // v0.4.22：魚叉牽制、地圖技能、幫派征服及海軍戰鬥。
        "Alloy Nails": "合金釘",
        "Bracelet Charms": "手鍊吊飾",
        "Campaign Complete": "戰役完成",
        "Chaos Canvas": "混亂畫布",
        "Fire Harpoon": "發射魚叉",
        "Gem Hungry": "渴求寶石",
        "No rivals remaining": "沒有剩餘的對手",
        "Novice Cartographer": "新手製圖師",
        "Professor of Archaeology": "考古學教授",
        "Provoke your minions at the Cemetery": "在墓園挑釁你的僕從",
        "Restless Rest": "不安的安息",
        "Shady Employees": "可疑員工",
        "Silent Shoes": "無聲鞋",
        "Tethered": "已牽制",
        "Your crew has taken every district it can reach.": "你的船員已奪下所有能夠抵達的地區。",
        "Your harpoon bites into the Navy Ship and the line pulls taut, leaving it open to your next attack": "你的魚叉刺入海軍艦艇，繩索隨即繃緊，使它在你的下一次攻擊面前暴露破綻",
        // v0.4.21：畫廊、公司、船槳、播種與犯罪現場留下名片事件。
        "Corporate Funded Gang": "公司資助的幫派",
        "Deface Artwork": "污損藝術品",
        "Deface Artwork at the Art Gallery to send a message": "在美術館污損藝術品以傳達訊息",
        "Larger Oars": "更大的船槳",
        "Sow Max": "播種至上限",
        "Unable to plant more seeds": "無法再播下更多種子",
        "You leave your calling card at the scene of the crime...": "你在犯罪現場留下自己的名片……",
        // v0.4.20：沉船事件、魚叉、溫室及幫派名稱。
        "Be able to grow Narcotics. Doesn't like to grow next to other plants": "能夠種植麻醉品。不喜歡在其他植物旁生長",
        "Criminal Intuition": "犯罪直覺",
        "Drunkard Traders": "酒鬼商人",
        "Flower Garden": "花園",
        "Gain EXP from more sources": "從更多來源獲得經驗值",
        "Harpoon Rack": "魚叉架",
        "Harpoons": "魚叉",
        "Herbicide": "除草劑",
        "Internalized Vision": "內化視野",
        "Jagged timbers tear into your hull as you pull away, dealing": "當你駛離時，尖銳的木材撕裂你的船殼，造成",
        "Leave the wreck to the sea": "把殘骸留給大海",
        "Persistent": "持之以恆",
        "Sail Past": "駛過",
        "Salvage Wreckage": "打撈殘骸",
        "Shadowy Whispers": "暗影低語",
        "Shipwreck": "沉船",
        "Stops Weeds (The bad kind) from growing in your greenhouse": "防止雜草（有害的那種）在你的溫室中生長",
        "Street Tribute": "街頭貢金",
        "The Patient Torments": "耐心折磨者",
        "The Street Knights": "街頭騎士團",
        "Your crew picks through the wreckage and hauls aboard": "你的船員翻找殘骸，將",
        "Your lookout spots the splintered remains of a shipwreck drifting in the waves": "你的瞭望員發現一艘沉船的破碎殘骸正隨波漂流",
        // v0.4.19：博物館收藏的七種古物名稱與劫案準備通知。
        "Arcane Tome": "奧術典籍",
        "Charmcaster's Bauble": "魅惑術士的飾物",
        "Eclipse Mask": "日蝕面具",
        "Ethereal Chalice": "虛靈聖杯",
        "Monarch's Ring": "君主之戒",
        "Opulent Amulet": "華麗護符",
        "Tempest Medallion": "暴風勳章",
        "You're prepared to heist the museum's artifact collection": "你已做好洗劫博物館古物收藏的準備",
        // v0.4.18：火車、海難打撈、公司倉儲與相關升級。
        "A one-way pass to the richest carriage and the fastest exit route": "通往最富裕車廂與最快出口路線的單程通行證",
        "A wicked Train of thought": "邪惡的思緒列車",
        "Diamond Headed": "鑽石腦袋",
        "Dive the Shipwreck for loot": "潛入沉船搜尋戰利品",
        "Diving Bell": "潛水鐘",
        "Global Notoriety": "全域惡名",
        "Hollow Books": "中空書籍",
        "Make your own way through life": "走出自己的人生道路",
        "New Office Space": "新辦公空間",
        "Next Shipment in": "距離下一批貨物抵達還有",
        "Ninja Training": "忍者訓練",
        "Patented Tech": "專利技術",
        "Precious Pilfer": "珍寶偷竊",
        "Premium Coach": "高級車廂",
        "Railway Station": "火車站",
        "Red X": "紅色叉號",
        "Ride the Train": "搭乘火車",
        "Salvage Net": "打撈網",
        "Scavenge Supplies": "搜尋補給品",
        "Scavenge for supplies at Deserted Islands": "在荒島上搜尋補給品",
        "Side Skimmer": "舷側撈取器",
        "Taken Trinkets": "偷來的小飾品",
        "Towering Tides": "滔天巨浪",
        "Train": "火車",
        "Under your command, your gang strips the train's passengers of their wealth!": "在你的指揮下，你的幫派洗劫了火車乘客的財物！",
        "Warehouse Department": "倉儲部門",
        "Wealthier Victims": "更富裕的受害者",
        "Wild Bunch": "狂野幫眾",
        "You readjust the course of your ship, ready to ram again!": "你重新調整船隻航向，準備再次撞擊！",
        "You trade with the vessel, buying": "你與商船交易，購買",
        "You've deciphered the route to a cache of hidden treasure!": "你已解讀出通往一處隱藏寶藏的路線！",
        "Your Warehouse shipment of": "你的倉庫貨運，包含",
        "Your gang and you can steal the cargo off a Train": "你與幫派成員可以偷取火車上的貨物",
        "arrives!": "已送達！",
        // v0.4.17：劫案警報、策劃與海盜地圖解讀事件。
        "The alarms go off and the police come rushing to the scene, catching you!": "警報響起，警察迅速趕到現場並抓住了你！",
        "You continue making detailed heist preparations...": "你繼續進行詳盡的劫案準備……",
        "You continue to decipher cryptic symbols and pirate texts...": "你繼續解讀晦澀的符號與海盜文字……",
        // v0.4.16：博物館、公司研究、航海升級及古物相關介面。
        "(Approach closer)": "（靠近一點）",
        "All on Red": "全押紅色",
        "All the stolen splendor": "所有偷來的華美之物",
        "Art of the Deal": "交易的藝術",
        "Basic Lab": "基礎實驗室",
        "Business Diploma": "商業文憑",
        "Business School": "商學院",
        "Change Course": "改變航向",
        "Curate Exhibit": "策劃展覽",
        "Early Workforce": "早期勞動力",
        "Fake Posture": "偽裝姿態",
        "Guarantees meeting The Devil": "保證能見到魔鬼",
        "Hockey Mask": "曲棍球面具",
        "Infernal Summons": "地獄召喚",
        "Longer Scope": "更遠的觀測距離",
        "Mental Math": "心算",
        "Museum": "博物館",
        "Part-Time Archaeologist": "兼職考古學家",
        "Providing:": "提供：",
        "Say My Name": "說出我的名字",
        "Storage Shed": "儲物棚",
        "Tax Relief": "稅務減免",
        "You've planned out as much as you can for this heist": "你已經為這次劫案完成了所有能做的策劃",
        // v0.4.15：航海建築、寵物介面與幫派名稱。
        "Blackwater Market": "黑水市場",
        "Coinmaster's Den": "錢幣大師的巢穴",
        "Costs Doubloons Daily": "每日消耗杜布隆金幣",
        "Expand": "擴建",
        "Increases Doubloons Gain": "增加杜布隆金幣收益",
        "Increases Money Gain": "增加金錢收益",
        "Owned Pets": "已擁有的寵物",
        "The Crimson Ravagers": "緋紅掠奪者",
        // v0.4.14：野生動物交易中的爬行類動物。
        "Komodo Dragon": "科莫多巨蜥",
        "Python": "蟒蛇",
        // v0.4.13：潛行專精逃脫事件。
        "You use your Stealth expertise to sneak away before your crimes are found out...": "你運用潛行專精，在自己的罪行被發現之前悄悄離開……",
        // v0.4.11：尋寶事件的獨立片段，完整句與混合翻譯節點共用規則。
        "You strike a burried treasure chest, containing": "你挖到一個埋藏的寶箱，裡面有",

        // v0.4.10：存檔提示及海軍艦艇交戰片段。
        "Save exported to unlawful_reign_save.txt.": "存檔已匯出至 unlawful_reign_save.txt。",
        "The Navy Ship fires their cannons, dealing": "海軍艦艇開砲，造成",
        "Your ship rams into the side of the Navy Ship, dealing": "你的船撞向海軍艦艇的側舷，造成",

        // v0.4.9：野生動物交易、動物名稱及航海事件。
        "Brown Bear": "棕熊",
        "Chimpanzee": "黑猩猩",
        "Elephant": "大象",
        "Exotic Wildlife Trade": "珍奇野生動物交易",
        "Panda": "熊貓",
        "Snow Leopard": "雪豹",
        "Tiger": "老虎",
        "Wildlife Trade": "野生動物交易",
        "You have been invited to the Exotic Wildlife Trade": "你收到了珍奇野生動物交易的邀請",
        "You try to steer your ship away from the aggressive Navy Ship, but the winds are not on your side": "你試圖駕船避開那艘具有敵意的海軍艦艇，但風向對你不利",

        // v0.4.8：寵物、重生、博物館與契約片段固定詞條。
        "Be Reborn": "重生",
        "Current companion": "目前的夥伴",
        "Dog": "狗",
        "Personalized Collar": "客製化項圈",
        "Pet": "寵物",
        "The Museum": "博物館",
        "Visit the Museum to view ancient Artifacts": "前往博物館查看古代文物",
        "Your heist goes awry and you get caught!": "你的劫案出了差錯，你被逮住了！",
        "more pact and be reborn.": "項額外契約並重生。",

        // v0.4.6：永久解鎖項目、月相、星座、古物與海洋庇護所的功能說明。
        "Bond with a sea companion that helps you lead the oceans and eventually the world": "與一位海洋夥伴建立羈絆，牠將幫助你統領海洋，最終統領世界",
        "Knowledge you gain is retained by passing it down through the generations and decades": "你獲得的知識會透過代代相傳，在數十年間持續保留下來",
        "Permanently unlock Belt, Shoulders, and Earring equipment slots for future runs": "永久解鎖腰帶、肩部和耳環裝備欄位，供往後的遊玩輪次使用",
        "Raise an ancient sanctuary from the deep, sacrifice Doubloons to empower it, and receive the sea's blessing while sailing": "將一座古老的庇護所從深海升起，獻祭杜布隆金幣以增強它的力量，並在航行時獲得大海的祝福",
        "Restore the Black Market Bounty Board and turn completed contracts into lasting notoriety": "修復黑市懸賞公告欄，並將已完成的契約轉化為持久的惡名",
        "The moon waxes and wanes through eight phases, twisting the city's encounters with light and shadow": "月亮經歷八個月相的盈虧變化，以光與影改變城市中的遭遇",
        "Twelve zodiac years cycle across time, each twisting your cult in a different way": "十二星座隨著年份輪替，每一年都以不同方式改變你的邪教",
        "Unlock a primordial Monolith whose powers grow the more money you sacrifice to it": "解鎖一座原始巨石碑，你向它獻祭的金錢越多，它的力量就越強",
        "Unseal ancient Artifacts, permanently reveal The Museum upgrade, and preserve completed relics through rebirth": "解除古代古物的封印，永久顯示「博物館」升級項目，並在重生後保留已完成的遺物",

        // v0.4.5：威望重置、寵物、航海、邪教與存檔介面。
        "Artifacts": "古物",
        "Bounty Boards": "懸賞公告欄",
        "Change your mind": "改變主意",
        "Deal with the Devil": "與魔鬼交易",
        "First Client": "第一位客戶",
        "Ignoble Garb": "卑賤的裝束",
        "Invalid save format.": "存檔格式無效。",
        "Monolith": "巨石碑",
        "Moon Phases": "月相",
        "Pets": "寵物",
        "Prestiges the player.": "使玩家進行威望重置。",
        "Raise a loyal companion, train it over time, and discover rare exotic pet sales in the Black Market": "培養一名忠誠的夥伴，隨著時間訓練牠，並在黑市發現稀有異國寵物的販售機會",
        "Retain EXP": "保留經驗值",
        "SACRIFICE PROGRESS FOR POWER": "犧牲進度以換取力量",
        "Save imported successfully.": "存檔匯入成功。",
        "Sea Pets": "海洋寵物",
        "Sea Sanctuary": "海洋庇護所",
        "Spend": "花費",
        "The next requirement has been met.": "下一項條件已達成。",
        "Toggle menu": "切換選單",
        "Your cultish talks scare rather than persuade the Shady Stranger": "你帶有邪教色彩的言談沒能說服那名可疑陌生人，反而嚇壞了對方",
        "Zodiacs": "十二星座",
        "more pacts and be reborn.": "項額外契約並重生。",


    // 2026-10-30：依照第二批玩家匯出的文字補充。
        "+10% chance to get Stolen Goods when Shoplifting": "商店行竊時獲得贓物的機率增加 10%",
        "Be able to recruit Shady Strangers and start your Gang": "能夠招募可疑的陌生人並建立自己的幫派",
        "Black Market Invitation": "黑市邀請函",
        "Chance to steal jewels when pickpocketing": "扒竊時有機會偷到珠寶",
        "Double Shoplifting Reward": "商店行竊獎勵加倍",
        "Double notoriety when talking with shady strangers if you're not a criminal": "如果你不是罪犯，與可疑的陌生人交談時，惡名加倍",
        "Doubles Shoplifting Reward": "使商店行竊獎勵加倍",
        "Fancier Folk": "更講究穿著的人們",
        "Fancier Stores": "更高級的商店",
        "No One's Listening": "沒有人在聽",
        "Purse Snatcher": "搶包賊",
        "Shady Stranger:": "可疑的陌生人：",
        "Shoplift": "商店行竊",
        "Small Business Theft": "小型商家竊盜",
        "Squad Up": "組隊",
        "Superstores": "大型賣場",
        "Triple pickpocket reward": "扒竊獎勵變為三倍",
        "Unlock the Black Market": "解鎖黑市",
        "Year": "年份",

    // v0.3 整合版：新增玩家提供的後續遊戲文字。
        "Be able to Mug Strangers": "能夠搶劫陌生人",
        "Distracted Store Clerks": "分心的店員",
        "Increases Stolen Goods capacity": "增加贓物容量",
        "Just an everyday criminal": "只是一名普通罪犯",
        "Reduce Shoplift Crime penalty by one": "將商店行竊的犯罪懲罰減少 1",
        "Scare Tactics": "恐嚇手段",
        "Shady Stranger": "可疑的陌生人",
        "Shady Talk": "可疑交談",
        "Show purchased upgrades": "顯示已購買的升級項目",
        "Small Safe": "小型保險箱",
        "You share your misdeeds and misadventures. You gain": "你分享了自己的惡行與荒唐遭遇。你獲得",
        "You shoplift": "你在商店行竊",

    // 根據玩家實際匯出的遊戲文字補充，保持英文原文精確比對。
        "A store full of freebies (I think?)": "一間到處都是免費商品的商店（我想是吧？）",
        "Avoid Eye Contact": "避免眼神接觸",
        "Be able to find Jewelry Stores": "能夠找到珠寶店",
        "Be able to meet Shady Strangers": "能夠遇見可疑的陌生人",
        "Burst of Courage": "勇氣爆發",
        "Busted!": "被逮到了！",
        "Busted! You lose": "被逮到了！你失去",
        "Collapse log": "收合紀錄",
        "Criminal": "罪犯",
        "Crowd Diversion": "轉移人群注意力",
        "Diamonds Are Forever": "鑽石恆久遠",
        "Double Pickpocket reward": "扒竊獎勵加倍",
        "Double your pickpocket profits": "讓你的扒竊收益加倍",
        "EXPORT SAVE": "匯出存檔",
        "Encounter Chances": "遭遇機率",
        "Experienced Pick-Pocketer": "經驗豐富的扒手",
        "Hide purchased upgrades": "隱藏已購買的升級項目",
        "IMPORT SAVE": "匯入存檔",
        "Lose 50% of your money": "失去你 50% 的金錢",
        "Meet Shadier Strangers": "遇見更可疑的陌生人",
        "Oink Oink": "哼哼",
        "Pass Through": "通過",
        "Police:": "警察：",
        "Progress:": "進度：",
        "Purchased": "已購買",
        "Purchased Upgrades": "已購買的升級項目",
        "RESTART": "重新開始",
        "Shop:": "商店：",
        "Show floating numbers": "顯示浮動數字",
        "Stranger:": "陌生人：",
        "Thicker Wallets": "更厚的錢包",
        "Unlocks Shoplift": "解鎖商店行竊",
        "Warning! This will delete all of your current save data!": "警告！這將刪除你目前所有的存檔資料！",
        "You pickpocket": "你扒竊了",
        "You've recently commited a crime and the police have your arrest warrant": "你最近犯下了罪行，警方已持有對你的逮捕令",
        'Day': '天數',
        'settings': '設定',
        'Settings': '設定',
        'Money': '金錢',
        'City': '城市',
        'Player': '玩家',
        'Stranger': '陌生人',
        'Just an everyday man': '只是一名普通人',
        'Talk': '交談',
        'Pickpocket': '扒竊',
        'Back': '返回',
        'Return': '返回',
        'Continue': '繼續',
        'Close': '關閉',
        'OK': '確定',
        'Confirm': '確認',
        'Cancel': '取消',
        'Yes': '是',
        'No': '否',
        'On': '開啟',
        'Off': '關閉',
        'Enable': '啟用',
        'Disable': '停用',
        'Start': '開始',
        'Restart': '重新開始',
        'Reset': '重置',
        'Save': '儲存',
        'Load': '讀取',
        'Export': '匯出',
        'Import': '匯入',
        'Options': '選項',
        'Help': '說明',
        'Tutorial': '教學',
        'Achievements': '成就',
        'Statistics': '統計',
        'Stats': '數值',
        'Status': '狀態',
        'Level': '等級',
        'Experience': '經驗值',
        'XP': '經驗值',
        'Reputation': '聲望',
        'Notoriety': '惡名',
        'Heat': '警方關注度',
        'Health': '生命值',
        'Energy': '精力',
        'Stamina': '體力',
        'Inventory': '物品欄',
        'Items': '物品',
        'Equipment': '裝備',
        'Weapons': '武器',
        'Skills': '技能',
        'Upgrades': '升級項目',
        'Upgrade': '升級',
        'Research': '研究',
        'Unlock': '解鎖',
        'Unlocked': '已解鎖',
        'Locked': '未解鎖',
        'Requirements': '需求條件',
        'Cost': '花費',
        'Price': '價格',
        'Reward': '獎勵',
        'Rewards': '獎勵',
        'Income': '收入',
        'Expenses': '支出',
        'Profit': '利潤',
        'Buy': '購買',
        'Sell': '出售',
        'Purchase': '購買',
        'Hire': '雇用',
        'Recruit': '招募',
        'Work': '工作',
        'Rest': '休息',
        'Wait': '等待',
        'Search': '搜尋',
        'Explore': '探索',
        'Travel': '旅行',
        'Attack': '攻擊',
        'Defend': '防禦',
        'Escape': '逃跑',
        'Steal': '偷竊',
        'Crime': '犯罪',
        'Crimes': '犯罪行動',
        'Theft': '竊盜',
        'Robbery': '搶劫',
        'Heist': '重大劫案',
        'Heists': '重大劫案',
        'Bribe': '賄賂',
        'Bribery': '行賄',
        'Money Laundering': '洗錢',
        'Gang': '幫派',
        'Gangs': '幫派',
        'Gang War': '幫派戰爭',
        'Mafia': '黑手黨',
        'Cult': '邪教',
        'Pirate': '海盜',
        'Pirates': '海盜',
        'Piracy': '海盜活動',
        'Ship': '船隻',
        'Ships': '船隻',
        'Sail': '航行',
        'Sailing': '航海',
        'Sea': '海洋',
        'Port': '港口',
        'Crew': '船員',
        'Bounty': '懸賞金',
        'Bounty Board': '懸賞公告欄',
        'Prestige': '威望重置',
        'Business': '生意',
        'Businesses': '生意',
        'Police': '警察',
        'Prison': '監獄',
        'Bank': '銀行',
        'Shop': '商店',
        'Market': '市場',
        'Success': '成功',
        'Failure': '失敗',
        'Failed': '失敗',
        'Completed': '已完成',
        'Available': '可使用',
        'Owned': '已擁有',
        'Not enough money': '金錢不足',
        'Insufficient funds': '資金不足',
        'New Game': '新遊戲',
        'Game Over': '遊戲結束',

    // 由四份待翻譯文字 JSON 去重後新增的固定詞彙。
        "Access the": "進入",
        "All": "全部",
        "Be able to Graffiti the outside of stores": "能夠在商店外牆塗鴉",
        "Be able to sacrifice Strangers": "能夠獻祭陌生人",
        "Black Market": "黑市",
        "Creative Mind": "創意思維",
        "Credible Bling": "令人信服的閃亮飾品",
        "Deeper Alleys": "更深的巷弄",
        "Expensive Produce": "昂貴的農產品",
        "Find shady items to sell": "尋找可疑的物品出售",
        "Gain more Notoriety from Shady Talk per Gang Member": "每名幫派成員都會使「可疑交談」獲得更多惡名",
        "Illicit Armory": "非法軍械庫",
        "Mugging": "搶劫",
        "Naive Tourists": "天真的遊客",
        "Shadow Bazaar": "暗影市集",
        "Sinister Intent": "邪惡意圖",
        "Stolen Goods": "贓物",
        "Word on the Street": "街頭傳聞",
        "You sold": "你賣出了",
        "You talk about how great your gang is but they don't care": "你談論自己的幫派有多麼厲害，但他們並不在乎",
        "You're not Welcome here yet...": "你目前還不受這裡歡迎……",
        "and": "和",
        "and earned": "並賺得",

    // 玩家第五批待翻譯文字：裝備、技能與遊戲進程。
        "'Yeah, b*tch! Magnets!' - J. Pinkman": "「對啊，婊子！磁鐵！」，J. Pinkman",
        "2 For 1 Sale": "買一送一促銷",
        "5 Finger Discount": "五指折扣",
        "A Sinister Setting": "陰森的環境",
        "A professional look makes half the sale": "專業的外表就讓交易成功了一半",
        "Able to bribe cops if Criminal status is 1": "若罪犯狀態為 1，便能賄賂警察",
        "Able to rob Stores with your gang": "能夠與你的幫派一起搶劫商店",
        "Bandana": "頭巾",
        "Be able to visit the Cemetery": "能夠造訪墓園",
        "Better Paints": "更好的顏料",
        "Bit more hesitant to yank money away from a fellow cop": "從警察同僚手中搶錢時會稍微有些猶豫",
        "Body": "身體",
        "Collected:": "已收集：",
        "Doubles Graffiti Reward": "塗鴉獎勵加倍",
        "Easier to hide things in": "更容易在裡面藏東西",
        "Fake Body Tattoos": "假刺青",
        "Fancy Tie": "華麗的領帶",
        "Feet": "腳部",
        "Hands": "手部",
        "Head": "頭部",
        "High Resale Value": "高轉售價值",
        "I was never actually going to use it on someone... probably": "我原本真的沒打算拿它對付任何人……大概吧",
        "I'm not superstitious but I swear these pair of boots are magic": "我並不迷信，但我發誓這雙靴子有魔法",
        "I'm not sure what to get for my real tattoos yet": "我還不確定真正的刺青要刺什麼圖案",
        "Jewelry Box": "珠寶盒",
        "Jewelry Store:": "珠寶店：",
        "Knife": "刀",
        "Legs": "腿部",
        "Lesser of Two Evils": "兩害相權取其輕",
        "Lose 10% less total money when Busted": "被逮捕時，損失的總金錢減少 10%",
        "Lucky Hunting Boots": "幸運狩獵靴",
        "Magnetic Bracelet": "磁力手環",
        "Memorized Guard Shift": "熟記守衛輪班時間",
        "Representing your colors": "展現你的代表色",
        "Self-Storage Space": "自助倉儲空間",
        "Sheriff Badge": "警長徽章",
        "Store Robbery": "商店搶劫",
        "Trench Coat": "風衣",
        "You mug": "你搶劫了",
        "You pay a small finder's fee to be able to visit the Illicit Armory": "你支付了一小筆介紹費，因此能夠造訪非法軍械庫",

    // 第六批玩家回報的邪教、劫案與裝備文字（保留既有詞庫）。
        "+All": "＋全部",
        "-All": "－全部",
        "/ Built": "／已建造",
        "A thief's paradise": "小偷的天堂",
        "Activate": "啟用",
        "Active": "已啟用",
        "Altar": "祭壇",
        "Can finally find where the exit signs are located": "終於能找到出口標誌的位置了",
        "Cast": "施放",
        "Consumes Money daily": "每日消耗金錢",
        "Consumes Notoriety daily": "每日消耗惡名",
        "Cult Level": "邪教等級",
        "Cultist Training Ground": "邪教徒訓練場",
        "Deactivate": "停用",
        "Demonic Rites": "惡魔儀式",
        "Doubles Notoriety from Shady Talk": "「可疑交談」獲得的惡名加倍",
        "Flower Crown": "花冠",
        "Graffiti": "塗鴉",
        "I was born with an artist's soul": "我天生就有藝術家的靈魂",
        "Increases Souls capacity": "增加靈魂容量",
        "Increases Souls gained from Sacrifices": "增加獻祭獲得的靈魂",
        "Increases Souls gained from Sacrifices per Gang Member": "每名幫派成員都會增加獻祭獲得的靈魂",
        "Jewelry Heists are rerolled if unsuccessful": "珠寶劫案若未成功，會重新擲骰判定",
        "Jewelry Store": "珠寶店",
        "Next Level:": "下一等級：",
        "Ninja Tabi": "忍者足袋",
        "Not Active": "未啟用",
        "Occult Constructs": "秘術建築",
        "Ritual": "儀式",
        "Rituals cost 50% of your Souls to cast (Min 20 Souls)": "施放儀式需消耗你 50% 的靈魂（最低 20 個靈魂）",
        "Sacrifice": "獻祭",
        "Sacrificing just feels a little more right when I'm wearing this crown": "戴著這頂花冠獻祭時，總覺得更對勁了一點",
        "Silent but deadly": "無聲卻致命",
        "Sinner": "罪人",
        "Soul Gem": "靈魂寶石",
        "Soul Infused Dagger": "注入靈魂的匕首",
        "Souls": "靈魂",
        "Spectacles": "眼鏡",
        "Spraycan": "噴漆罐",
        "Stolen Jewels": "偷來的珠寶",
        "Strange Dagger": "奇異匕首",
        "Street Smarts": "街頭智慧",
        "Upgrade Cult": "升級邪教",
        "You can feel a strange power eminates from its blade": "你能感覺到一股奇異的力量從刀刃散發出來",
        "You continue making meticulous heist preparations...": "你繼續進行周密的劫案準備……",
        "You may encounter The Devil if your sin is at least 5": "如果你的罪孽至少為 5，就可能遇見魔鬼",
        "You sacrifice the stranger and harvest": "你獻祭了陌生人，並收穫了",
        "You tag the side of a store and earn": "你在商店側面塗鴉，並賺得",
        "You've recently commited a sin, the devil draws closer": "你最近犯下了罪孽，魔鬼正逐漸靠近",

    // 第七批：新增裝備、珠寶店劫案與邪教相關文字。
        "'Ebonics' Music CD": "「Ebonics（非裔美國英語）」音樂光碟",
        "Able to rob Jewelry Stores with your gang": "能夠與你的幫派一起搶劫珠寶店",
        "Armed Robbery": "持械搶劫",
        "Constant Surveillance": "持續監視",
        "Fake Cameras": "假監視器",
        "Master Lifter": "竊盜高手",
        "Pocket Gems": "口袋寶石",
        "Shoplift has no criminal penalty": "商店行竊沒有犯罪懲罰",
        "Sinner-gy": "罪人協同效應",
        "Soul Lantern": "靈魂提燈",
        "Triples pickpocket reward": "使扒竊獎勵變為三倍",
        "Unholy Aid": "邪惡援助",
        "Very Loose Change": "非常零散的零錢",
        "You carry out your heist and manage to get away!": "你執行了劫案，並成功逃脫！",
        "You feel fully prepared to execute your heist": "你覺得自己已做好充分準備，可以執行劫案了",
        "You've recently commited a sin, the devil haunts you": "你最近犯下了罪孽，魔鬼正糾纏著你",
        "「對啊，婊子！磁鐵！」，J. Pinkman": "「對啊，婊子！磁鐵！」，J. Pinkman",

    // 第九批：新出現的裝備、升級名稱及效果。
        "Disguise Toolkit": "偽裝工具組",
        "Doubles Stolen Goods sell price": "贓物出售價格加倍",
        "Going-out-of-business Sale": "歇業清倉特賣",
        "“How To Sell” for Dummies": "「如何出售」傻瓜指南",

    // 第八批：幫派升級、招募與懺悔相關文字。
        "Expand your Gang to new territories": "將你的幫派擴展至新的地盤",
        "Gang Level": "幫派等級",
        "Gang Members": "幫派成員",
        "Its time to repent for your sins": "是時候為你的罪孽懺悔了",
        "LOSE ALL YOUR SOULS": "失去你所有的靈魂",
        "Passive Gain": "被動獲得",
        "REPENT!": "懺悔！",
        "Recruit Member": "招募成員",
        "Soul Vessel": "靈魂容器",
        "The Devil": "魔鬼",
        "Upgrade Gang": "升級幫派",
        "You persuade your fellow criminal to join in your misdoings.": "你說服另一名罪犯加入你的惡行。",
        "You repent for your sins. The devil gladly collects your gathered souls.": "你為自己的罪孽懺悔。魔鬼欣然收走你收集的靈魂。",
        "/ Day": "／天",
        "per Member": "每名成員",
    // 2026-10-31：幫派、塗鴉、裝備與犯罪效果（有變動數字的文案改由 DYNAMIC 處理）。
        "Artistic Flair": "藝術天賦",
        "Better Artist": "更出色的藝術家",
        "Buy some seeds and pick up gardening": "買些種子，開始從事園藝",
        "Does not remove Criminal Status": "不會移除罪犯狀態",
        "Double Money gained from Store Robbery": "商店搶劫獲得的金錢加倍",
        "Double Notoriety gained from Store Robbery": "商店搶劫獲得的惡名加倍",
        "Doubles Graffiti Notoriety Reward": "塗鴉獲得的惡名獎勵加倍",
        "Filled Cash Registers": "裝滿現金的收銀機",
        "Gang Full": "幫派已滿",
        "Gang is full": "幫派人數已滿",
        "Knee Pads": "護膝",
        "Magical Beans": "魔法豆",
        "Morally Malleable": "道德觀容易動搖",
        "Perfect for sliding over counters and diving behind cover with a full bag": "非常適合帶著滿滿一袋物品滑過櫃檯，並撲到掩體後方",
        "Recruitment": "招募",
        "Sagging Jeans": "低腰垮褲",
        "Sinful Desire": "罪惡慾望",
        "The Devil:": "魔鬼：",
        "Too cool for belts": "帥到不需要皮帶",
        "Upgrade your Gang to raise the member cap": "升級你的幫派以提高成員上限",
        "Wanted Posters": "通緝海報",
        // 2026-10-31：園藝、墓園、幫派戰爭與邪教後續內容。原文 ominious 疑似拼字錯誤，仍保留原鍵名。
        "A sturdy lamp cap for digging where others were too respectful to look": "一頂堅固的帶燈帽子，適合在其他人因為心存敬意而不願挖掘的地方動土",
        "Able to deal drugs to Shady Strangers for a markup": "能夠以加價後的價格向可疑的陌生人販售毒品",
        "Able to trade your Gang Members for your freedom": "能夠用你的幫派成員交換自由",
        "An ominious vibe permeates the air": "不祥的氣息瀰漫在空氣中",
        "Armory": "軍械庫",
        "Awaiting": "等待中",
        "Backroom Safe": "後室保險箱",
        "Blood Imbued Dagger": "浸染鮮血的匕首",
        "Cooldown": "冷卻時間",
        "Damage": "傷害",
        "Deployment": "部署",
        "Double plant growth speed": "植物生長速度加倍",
        "Drug": "毒品",
        "Drugs": "毒品",
        "Empty": "空",
        "Expand Garden": "擴建花園",
        "Farmer Overalls": "農夫吊帶褲",
        "Fertilizer": "肥料",
        "Gang passively recruits new members": "幫派會被動招募新成員",
        "Getting down and dirty with Mother Earth": "親手接觸泥土，與大地母親親密接觸",
        "Greenhouse": "溫室",
        "HP": "生命值",
        "Identity Theft": "身分盜用",
        "Local Dealer": "當地毒販",
        "Members": "成員",
        "Miners Cap": "礦工帽",
        "Nefarious Campaign Ad": "邪惡的競選廣告",
        "Nomadic Wraps": "遊牧裹布",
        "Pay Respects": "致意",
        "Pay respects base souls get + Sinner amount": "致意獲得的基礎靈魂 + 罪人數值",
        "Pistols": "手槍",
        "Plants stay wet for twice as long": "植物維持濕潤的時間延長至兩倍",
        "Raid Grave": "盜墓",
        "Ready": "已就緒",
        "Regen": "恢復",
        "Shiny Splendor": "耀眼光彩",
        "Sickle": "鐮刀",
        "Snitch": "告密者",
        "Soul Chest": "靈魂寶箱",
        "Sow": "播種",
        "Start Gang War": "發動幫派戰爭",
        "Submachine Guns": "衝鋒槍",
        "Talk with Strangers to build a Fake Identity, used to escape from the Police": "與陌生人交談以建立假身分，用來逃避警方追捕",
        "The Cemetery": "墓園",
        "The Cemetery:": "墓園：",
        "The Iron Ravens": "鐵鴉",
        "Travel-worn wraps that pull more meaning, and more souls, from guilty rituals": "旅途磨損的裹布，能從充滿罪孽的儀式中汲取更多意義與靈魂",
        "Unholy Help": "邪惡援助",
        "Unlocked Display Case": "未上鎖的展示櫃",
        "Water": "澆水",
        "Watering Can": "澆水壺",
        "Weeds": "雜草",
        "You and your squad rob the store,": "你和你的隊伍搶劫了商店，",
        "You can use your souls to try awaken the dead at a Cemetery": "你可以在墓園使用靈魂，嘗試喚醒死者",
        "You pay your respects.": "你表達了敬意。",
        "You rob the grave and steal": "你盜掘墳墓，並偷走",
        "You slip some money into the cop's pockets and walk away...": "你悄悄把一些錢塞進警察的口袋，然後離開……",
        "Your Gang": "你的幫派",
        "actions equipped": "已裝備的行動",
        // 2026-10-31：賭場、裝備、幫派戰爭與園藝等固定文字。
        "Aces Up your Sleeves": "袖藏王牌",
        "Be able to visit the Casino": "能夠造訪賭場",
        "Bejeweled Jeans": "鑲寶石的牛仔褲",
        "Bulletproof Vest": "防彈背心",
        "Deal Drugs": "販售毒品",
        "Have a low chance of finding a Safe House to hide out in": "有小機率找到可用來藏身的安全屋",
        "Heavy, ugly, and exactly the kind of thing you want when bullets start flying": "又重又醜，而在子彈橫飛時，你想要的正是這種東西",
        "Not affected by Rituals": "不受儀式影響",
        "Persuasive Recruiting": "說服式招募",
        "Pesticide": "農藥",
        "Ritual Boons": "儀式恩賜",
        "Safe House": "安全屋",
        "Selective Breeding": "選擇性育種",
        "Small Shack": "小棚屋",
        "Start War": "發動戰爭",
        "Superior Spraycans": "高級噴漆罐",
        "Target Practice": "射擊練習",
        "Temperature Control": "溫度控制",
        "Undermine": "暗中破壞",
        "Weeds (The bad kind) are half as likely to grow": "雜草（有害的那種）生長的機率減半",
        "While not a criminal, undermine the police for Notoriety": "在非罪犯狀態時，暗中破壞警方的行動以獲得惡名",
        "You have active boons": "你有已啟用的恩賜",
        "Your graffiti is so beautiful, it is no longer considered a crime": "你的塗鴉美得不再被視為犯罪",
        "days remaining": "剩餘天數",
        // 2026-10-31：武裝搶劫、邪教擴建與偽造身分等後續內容。
        "(Harvestable)": "（可收成）",
        "Basic Hitmen": "基礎殺手",
        "Battle Actions": "戰鬥行動",
        "Blood Pool": "血池",
        "Build Fake Identity": "建立假身分",
        "Consumes Souls daily": "每日消耗靈魂",
        "Dirty Ambush": "卑劣伏擊",
        "Does not remove Criminal status": "不會移除罪犯狀態",
        "Double Fake Identity build speed": "建立假身分的速度加倍",
        "Drive By": "駕車掃射",
        "Efficient Looting": "高效率搜刮",
        "Engaged": "交戰中",
        "Facial hair - Nature's disguise kit": "鬍鬚，大自然的偽裝工具組",
        "Fake Identity": "假身分",
        "Fake Mustache": "假鬍子",
        "Harvested your garden plants...": "你收成了花園裡的植物……",
        "Increases Ritual Duration": "增加儀式持續時間",
        "Increases Ritual Power": "增加儀式威力",
        "Infernal Reputation": "地獄聲望",
        "Laminator": "護貝機",
        "Mildly Notorious": "略有惡名",
        "Minimal Proof": "最少的證明文件",
        "News Headlines": "新聞標題",
        "Shrine": "神龕",
        "Squad Shootout": "小隊槍戰",
        "Use Fake Identity": "使用假身分",
        "You deal your home": "你以高價販售自家",
        "You learn a little more about the stranger's life to build a fake profile...": "你進一步了解這名陌生人的生活，以建立虛假的個人資料……",
        "grown drugs for a hefty markup.": "種植的毒品。",

        // 2026-10-31：亡靈、幫派對手、特警隊與襲擊紀錄。
        "Choose to give an Undead Minion instead of souls to the Devil": "可以選擇交給魔鬼一名亡靈僕從，而不是靈魂",
        "Devilish Bargain": "魔鬼交易",
        "Gang Coupons": "幫派優惠券",
        "Grave Robber": "盜墓者",
        "LOSE ALL MONEY": "失去所有金錢",
        "LOSE ALL NOTORIETY": "失去所有惡名",
        "Large Jewelry Box": "大型珠寶盒",
        "Next Recruitment in": "距離下次招募還有",
        "No more running": "不必再逃跑了",
        "Notoriety Multiplier": "惡名倍率",
        "Raided": "已遭突襲",
        "Recruited": "已招募",
        "Rivals Defeated": "擊敗的對手",
        "SWAT Team": "特警隊",
        "SWAT Team:": "特警隊：",
        "Shady Debates": "可疑辯論",
        "Swiper, Yes Swiping": "偷竊者，沒錯，就是偷竊",
        "The Crown Cannons": "王冠火砲",
        "The Jade Blades": "翡翠之刃",
        "Undead Force": "亡靈軍團",
        "Whistle Lure": "口哨誘餌",
        "Your Gang manages to attract another Shady Associate...": "你的幫派成功吸引了另一名可疑同夥……",
        "The SWAT Team raids your safehouse and supplies,": "特警隊突襲了你的安全屋與物資，",
        // 2026-10-31：海盜、亡靈、偽裝與幫派戰爭後續固定名稱及敘述。
        "A Pirate's Life for Me": "當海盜真快活",
        "Addicted Clientele": "上癮的顧客群",
        "Blood Diamonds": "血鑽石",
        "Buy a small boat and set asail": "買艘小船，揚帆出航",
        "Convincing Fake": "以假亂真",
        "Easy Upsell": "輕鬆加價銷售",
        "Hidey Hole": "隱密藏身處",
        "Safehouse:": "安全屋：",
        "Safehouses are thrice as common": "安全屋的出現頻率變為三倍",
        "The Bloodlickers": "舔血者",
        "Undead Minion": "亡靈僕從",
        "Undead Minions": "亡靈僕從",
        "Upper Class Streets": "上流階層街區",
        "You hand the police your fake ID card and safely leave before he realizes.": "你把假身分證交給警察，並在他察覺前安全離開。",
        "You sacrifice": "你獻祭了",
        "Your petty sacrifice of": "你那微不足道的獻祭，獻上了",
        "and the dead are pleased...": "而死者們感到滿意……",
        "per Undead Minion": "每名亡靈僕從",
        "simply angers the dead... nothing happens": "卻只是激怒了死者……什麼也沒發生",
    // v0.3.16：賭場、藏身處、神龕與幫派戰爭相關固定詞彙；句子片段保持原有作用範圍。
        "A home away from home": "另一個家",
        "Accurate Crosshairs": "精準準星",
        "Better Luck Next Time": "下次好運",
        "Broken Badge": "破損的警徽",
        "Casino": "賭場",
        "Casino:": "賭場：",
        "Count Cards": "算牌",
        "Creative Stowage": "巧妙收納",
        "Doesn't hurt to tilt the odds in your favor": "讓勝算偏向自己總沒有壞處",
        "Fiendish Sacrifice": "邪魔獻祭",
        "Financial Coaxing": "金錢誘導",
        "Full Seed Bags": "裝滿種子的袋子",
        "Gang Reimbursement": "幫派補償",
        "Godless Offering": "無神供品",
        "Green Visor": "綠色遮陽帽",
        "Hideout": "藏身處",
        "Hire a Gardener to water your plants": "雇用園丁替你的植物澆水",
        "Intimidation Tactics": "威嚇戰術",
        "Loaded Dice": "灌鉛骰子",
        "Lose half of your criminal status": "罪犯狀態數值減半",
        "Make sure to play your cards right": "確保你打對手中的牌",
        "Narcotic Negotiations": "毒品談判",
        "Offer your Undead Minions to be able to collect more Souls": "獻上你的亡靈僕從，以收集更多靈魂",
        "Quick Retaliation": "迅速反擊",
        "Regular Cuff-tomer": "手銬常客",
        "Removes all criminal status": "移除所有罪犯狀態",
        "Rent '21'": "租借「21」",
        "Rune": "符文",
        "Safehouse": "安全屋",
        "Shades the eyes, hides the tells, and keeps the dealer guessing": "遮住雙眼、掩飾破綻，讓莊家難以猜透",
        "Shady Gardener": "可疑園丁",
        "The Nightmare Hyenas": "夢魘鬣狗",
        "You are able to tilt the chances in your favor using your intellect...": "你能運用智慧，讓勝算偏向自己……",
        "You gamble and win!": "你賭博獲勝了！",
        "You hideout somewhere you'll never be found, losing any chasing cop's tail": "你藏身於一個無人能找到的地方，甩掉了所有追蹤你的警察",
        "to erase some of this world's memories of your criminal misdoings": "以抹去這個世界對你部分犯罪惡行的記憶",
        "to your gang": "加入你的幫派",
    // v0.3.17：航海、船員、船艦、賭場及海戰固定詞彙；原文拼字保留為比對鍵。
        "A hardened pirate's replacement that hits decks and enemy hulls with equal menace": "一條堅固的海盜義腿，踏在甲板或敵船船殼上都同樣充滿威脅",
        "Avoid the ensuing battle": "避開接下來的戰鬥",
        "Base DMG": "基礎傷害",
        "Battle": "戰鬥",
        "Battle the Navy Ship for the potential of earning rewards": "與海軍艦艇交戰，有機會獲得獎勵",
        "Begin Voyage": "開始航程",
        "Boarding": "登船作戰",
        "Body Cam Footage": "密錄器影像",
        "Build the": "建造",
        "Charismatic Smile": "迷人的笑容",
        "Chip Multiplier": "籌碼倍率",
        "Continue Voyage": "繼續航程",
        "Corruptable Law": "可被收買的法律",
        "Crewmates": "船員",
        "DMG": "傷害",
        "DMG / Crewmate": "每名船員傷害",
        "Distance": "距離",
        "Doubloons": "杜布隆金幣",
        "Driftport": "漂流港",
        "End Voyage": "結束航程",
        "Establish": "建立",
        "Establish the": "建立",
        "Foggy": "起霧",
        "High Roller": "豪賭客",
        "Hire Crewmate": "雇用船員",
        "Hire Shipbuilder": "雇用造船工",
        "Human Calculator": "人體計算機",
        "Level Up": "升級",
        "N.M Away": "海里外",
        "Nautical Miles": "海里",
        "Nautical Miles / Day": "海里／天",
        "Navy Ship": "海軍艦艇",
        "Nimble Fingers": "靈巧的手指",
        "No Prying Eyes": "沒有窺探的目光",
        "Parlay": "交涉",
        "Passenger Boat": "客船",
        "Peg Leg": "木製義腿",
        "Pirate Cove": "海盜海灣",
        "Pirate Hat": "海盜帽",
        "Pirate Port": "海盜港口",
        "Pirating": "海盜活動",
        "Plunder": "掠奪",
        "Rainy": "下雨",
        "Recruitment paused": "招募已暫停",
        "Repair": "修理",
        "Safe Haven": "避風港",
        "Shipyard": "造船廠",
        "Speed": "速度",
        "Stormy": "暴風雨",
        "Supplies": "補給品",
        "Supplies Chance": "獲得補給品的機率",
        "Targeted Mugging": "針對性搶劫",
        "Team Effort": "團隊合作",
        "Terrorize": "恐嚇",
        "The winds carry your ship away into the horizon, leaving the Navy Ship in your wake": "風帶著你的船駛向地平線，把海軍艦艇甩在身後",
        "Treasure Maps": "藏寶圖",
        "Unlock Player Expertise": "解鎖玩家專精",
        "Yo ho, yo ho, a pirate's life for me": "喲呵，喲呵，海盜生活屬於我",
        "You dock your ship at a friendly port while you regain your strength": "你將船停靠在友善的港口，同時恢復體力",
        "You find an unsuspecting Passanger Boat, alone in the middle of the sea": "你發現一艘毫無戒心的客船，獨自在海中央航行",
        "You gamble and lose!": "你賭博輸了！",
        "You sail into a hostile Navy Ship, its crew ready for battle": "你航行時遭遇一艘敵對的海軍艦艇，船員們已準備好戰鬥",
        "You try to inspire but instead terrify the timid crew... nothing happens": "你試圖鼓舞膽小的船員，卻反而嚇壞了他們……什麼也沒發生",
        "You undermine the cop's actions, earning you": "你暗中破壞警察的行動，並獲得",
        "Your Ship": "你的船隻",
        "Your crew spots and recovers some floating supplies drifting out at sea...": "你的船員發現並打撈起一些漂浮在海上的補給品……",
        "Your sails unfurl and you catch the breeze, setting off towards the horizon...": "你展開船帆，乘著微風朝地平線啟航……",
        "day remaining": "天剩餘",
        // v0.3.18：船艦裝備、靈魂與航海升級固定詞彙。
        "Available Upgrades": "可用的升級項目",
        "Be able to fly false colors to get past Navy Ships": "能夠懸掛假旗幟以避開海軍艦艇",
        "Captured Flag": "繳獲的旗幟",
        "Crew Carnage": "船員屠戮",
        "Crow's Nest": "桅頂瞭望台",
        "High Quality Rope": "高品質繩索",
        "Install a Wooden Ram to the front of your ship": "在你的船首安裝木製撞角",
        "Install rusted Cannons to your ship": "在你的船上安裝生鏽的大砲",
        "New Sails": "新船帆",
        "No effects": "沒有效果",
        "Offer Unholy Oblation": "獻上邪惡祭品",
        "Rusted Harpoons": "生鏽的魚叉",
        "Second Hand Cannons": "二手大砲",
        "Sharpened Cutlasses": "磨利的彎刀",
        "Skeletal Overtime": "骸骨加班",
        "Soul Discount": "靈魂折扣",
        "Spot Shipwrecks in the ocean": "發現海上的沉船",
        "Sunny": "晴朗",
        "Unlock Harpoons": "解鎖魚叉",
        "Wooden Ram": "木製撞角",
        "You offer your Undead Minions so to hold more Souls of the dead...": "你獻出亡靈僕從，以容納更多死者的靈魂……",
        "You turn your ship around and sail back to the Safe Haven": "你調轉船頭，駛回避風港",
        // v0.3.19：港口交易、海盜升級、園丁與裝備固定譯文。
        "25 Karat Gold": "25K 黃金",
        "Able to smuggle drugs at ports": "能夠在港口走私毒品",
        "Acquired Blueprints": "取得的藍圖",
        "Days": "天",
        "Decently Notorious": "小有惡名",
        "Delayed Alarms": "延遲警報",
        "Ghost Ship": "幽靈船",
        "Health Packs": "醫療包",
        "Ignore the Trading Vessel and continue with your voyage": "無視商船，繼續航程",
        "Keep Sailing": "繼續航行",
        "Lightweight Cargo": "輕量化貨物",
        "Pirate Flag": "海盜旗",
        "Resets to": "重設為",
        "Sailor's Spoils": "水手的戰利品",
        "Sharper Swords": "更鋒利的劍",
        "Smuggler's Cove": "走私者海灣",
        "Teak Planks": "柚木板材",
        "Tidy Poop Deck": "整潔的艉樓甲板",
        "Titanium Shovel": "鈦製鏟子",
        "Tractor": "拖拉機",
        "Trading Vessel": "商船",
        "Use Healthpacks to heal during a Gang War": "在幫派戰爭中使用醫療包恢復生命值",
        "Waters plants in": "距離為植物澆水還有",
        "You give a rousing speech about the freedom and joys of piracy...": "你慷慨激昂地演說，述說海盜生活的自由與樂趣……",
        "You hand the police your fake ID card and he hands it back before you safely leave.": "你把假身分證交給警察，他將證件還給你，你便安全離開。",
        "You meet an amiable Trading Vessel with business to conduct": "你遇到一艘友善的商船，可以進行交易",
        "You trade with the vessel, selling": "你與商船交易，出售",
        "Your Gardener helps with sowing your seeds": "你的園丁協助你播種",
        // v0.3.20：藝術品偽造、荒島、園丁及新道具名稱。
        "Create Replica Artworks in the comfort of your hideout": "在舒適的藏身處製作藝術品仿作",
        "Deserted Island": "荒島",
        "Document Forger": "文件偽造者",
        "Forge documents at your safehouse": "在安全屋偽造文件",
        "Hobby Artist": "業餘藝術家",
        "Lucky Harvest": "幸運收成",
        "Lucky Horseshoe": "幸運馬蹄鐵",
        "Undead Offering": "亡靈供品",
        "You dig and dig from sunrise to sunset with nothing to show for it...": "你從日出挖到日落，卻一無所獲……",
        "You spot a suspicious island that you feel may be ripe with treasure": "你發現了一座可疑的島嶼，覺得那裡可能藏有豐富的寶藏",
        "Your Gardener waters your plants for you": "你的園丁替你的植物澆水",
        // v0.3.21：船員艙室、服飾及海盜升級名稱。
        "Bunk Beds": "雙層床",
        "Expanded Quarters": "擴建艙室",
        "Holy Slippers": "神聖拖鞋",
        "Spiked Peg Legs": "帶刺木製義腿",
        "Step into God's light": "踏入神的光芒",
        // v0.3.22：海戰、藝術專精與藝術品仿製的固定名稱及已知句子片段。
        "Arise": "甦醒",
        "Board": "登船",
        "Boutique Bounty": "精品店獎勵",
        "Business 101": "商業入門",
        "Buy Max": "購買最大數量",
        "Cannonballs": "砲彈",
        "Cannons": "大砲",
        "Casino Robbery": "賭場搶劫",
        "Combo Deals": "組合優惠",
        "Disciplined greaves that reward every quiet step with sharper technique": "這副講求紀律的護脛，讓每一步悄然無聲的步伐都能換來更精湛的技巧",
        "Double Barrel": "雙管",
        "EXP": "經驗值",
        "Expertise": "專精",
        "Fire Cannons": "開砲",
        "Greek Inspiration": "希臘式靈感",
        "Hone your creativity and gain Artistry expertise": "磨練你的創造力，獲得藝術專精",
        "Inner Beast": "內在野獸",
        "Larger Chests": "更大的寶箱",
        "Lvl.": "等級",
        "Rabbits Foot": "兔腳護符",
        "Removed unripe drug plant, refunded": "已移除未成熟的毒品作物，退還",
        "Rich Skeletons": "富有的骷髏",
        "Rob the Casino with your gang": "與你的幫派一起搶劫賭場",
        "Seafaring Artists": "航海藝術家",
        "Shinobi Greaves": "忍者護脛",
        "Shot Locker": "砲彈庫",
        "Start studying Store operations and gain Finance expertise": "開始研究商店營運，獲得財務專精",
        "Stealth": "潛行",
        "Trading vessels can sometimes sell or buy Replica Artworks": "商船有時會出售或收購藝術品仿作",
        "Unlock your inner brute and gain Brutality Expertise": "釋放內在的蠻力，獲得蠻力專精",
        "Valuable Invaluables": "有價的無價之物",
        "You continue your work replicating the masterpiece...": "你繼續仿製那件傑作……",
        "You destroy the opposing Navy Ship and manage to scavenge": "你摧毀了敵方海軍艦艇，並成功搜刮到",
        "You fire your cannons at the Navy Ship, dealing": "你向海軍艦艇開砲，造成",
        "You rally your scallywag crewmates and ready them to fight!": "你召集那群海盜船員，讓他們做好戰鬥準備！",
        "You spend": "你花費了",
        "Your cannons are reloaded, ready to fire at will!": "大砲已重新裝填完畢，可以隨時開火！",
        "Your crew regroups and reloads, ready to re": "你的船員重新集結並裝填彈藥，準備再次",
        "Your crew regroups and reloads, ready to reboard the enemy ship!": "你的船員重新集結並裝填彈藥，準備再次登上敵船！",
        "Your crew swings on board the Navy Ship, dealing": "你的船員盪上了海軍艦艇，造成",
        "board the enemy ship!": "登上敵船！",
        "to repair": "以修復",
        // v0.3.23：財務專精、賭場裝備與海軍交涉的固定譯文。
        "Ace of Guns": "槍械王牌",
        "Clean Gambling": "乾淨的賭博",
        "Finance": "財務",
        "Gang Armory": "幫派軍械庫",
        "Launder your dirty money into clean money at the Casino": "在賭場將黑錢洗成乾淨的錢",
        "Marked Cards": "做過記號的牌",
        "Study Operations": "研究營運",
        "Superman's Glasses": "超人的眼鏡",
        "Windy": "多風",
        "You parlay with the Navy Captain, bribing him to let you pass without conflict...": "你與海軍艦長交涉，賄賂他讓你不經衝突便能通過……",
        // v0.3.24：新增詞彙與事件片段。
        "Art Gallery": "美術館",
        "Artistry": "藝術",
        "Aspire to be more cultured and visit the Art Gallery": "渴望增進文化涵養，前往美術館參觀",
        "Double Stolen Jewels sell price": "偷來的珠寶出售價格加倍",
        "Every day on the run sharpens your timing, and your take, a little more": "每一天的逃亡都讓你更善於掌握時機，也讓收穫稍微增加",
        "Exquisite Clarity": "絕妙的清晰感",
        "Fake Accent": "假口音",
        "Gain Notoriety per day while sailing": "航行期間每日獲得惡名",
        "Pirate’s Shanties": "海盜船歌",
        "Pistol Circus": "手槍馬戲團",
        "Political Art": "政治藝術",
        "Secret Agent Watch": "特務手錶",
        "Select Actions": "選擇行動",
        "Skull Hilted Swords": "骷髏柄劍",
        "Submachine Slaughter": "衝鋒槍屠戮",
        "The Navy Ship rams against your ship, dealing": "海軍艦艇撞上你的船，造成",
        "You and your gang go guns blazing into the Casino!": "你與幫派成員火力全開地衝進賭場！",
        "You load": "你裝載",
        "You offer": "你提供",
        "Your ship was destroyed and crewmates killed while you drift back to the Safe Haven": "你的船遭到摧毀，船員也被殺害，而你漂流回避風港",
        "and in return an Undead Minion is promised to work for you": "而作為回報，承諾會有一名亡靈僕從為你效力",
        // v0.4.0：補充單複數別名與美術館劫案名稱。
        "Art Collector": "藝術品收藏家",
        "Back to Gang War": "返回幫派戰爭",
        "Beauty is in the eye of the buyer": "美感取決於買家",
        "Bone Shovel": "骨製鏟子",
        "Brutality": "蠻力",
        "Buy Treasure Map": "購買藏寶圖",
        "Choose the actions your crew can use once the fight starts.": "選擇戰鬥開始後船員可以使用的行動。",
        "Health Pack": "醫療包",
        "Hostile Delay": "敵方延遲",
        "Loadout": "裝備配置",
        "Local Protest": "當地抗議",
        "Paint Palette": "調色盤",
        "Raider’s Rampage": "掠奪者的狂暴",
        "Royal Price": "皇家價格",
        "Select Combat Actions": "選擇戰鬥行動",
        "So much beauty to steal": "有這麼多美麗的東西可以偷",
        "Study Art": "研究藝術",
        "You and your crew plunder the feeble passenger boat, earning you": "你與船員掠奪了那艘不堪一擊的客船，獲得",
        "You take your time studying every brush stroke and detail": "你仔細研究每一道筆觸與細節",
        // v0.4.1：追隨者、邪教、鑰匙與能力事件固定譯文。
        // 原文 vial display 疑似將 vile 誤拼為 vial；依此假設翻譯，原文比對鍵維持不變。
        "Follower": "追隨者",
        "Followers": "追隨者",
        "Cult Follower": "邪教追隨者",
        "Follower Buffs": "追隨者增益效果",
        "Gang Members provide passive notoriety": "幫派成員被動提供惡名",
        "Gang Signs": "幫派標誌",
        "Guru's Gaze": "導師的凝視",
        "Heathen Seduction": "異教徒誘惑",
        "Indoctrinate Shady Strangers into your Cult": "向可疑的陌生人灌輸教義，使他們加入你的邪教",
        "Jeweled Key": "鑲寶石的鑰匙",
        "Jewelry Chest": "珠寶箱",
        "Next Milestone at": "下一個里程碑在",
        "Respectably Notorious": "頗有惡名",
        "The power of": "……的力量",
        "You stage a vial display of what you and your crew are capable of...": "你與船員上演了一場令人不寒而慄的表演，展現了你們的能耐……",
        "seduces a new Follower to join your cult!": "誘惑一名新追隨者加入你的邪教！",
        // v0.4.2：公司、走私、航海及文件偽造翻譯。emaculate 為原文異常，未推測其詞意。
        "Art Classes": "藝術課程",
        "Business License": "營業執照",
        "Bustling Harbor": "繁忙的港口",
        "Can smuggle max": "每次最多可走私",
        "Clean Money": "乾淨的錢",
        "Drugs at a time": "份毒品",
        "Forge Documents": "偽造文件",
        "Fortified Ram": "加固撞角",
        "Gang Pamphlets": "幫派宣傳冊",
        "Launder Money": "洗錢",
        "Lightning Reload": "閃電裝填",
        "Money Shower": "金錢雨",
        "Official Stamps": "官方印章",
        "Pearl Necklaces": "珍珠項鍊",
        "Pill Box": "藥盒",
        "Purchase a business license and start your own Corporation": "購買營業執照並創立自己的公司",
        "Ram": "撞角",
        "Replica Artwork": "藝術品仿作",
        "Rum Signing Bonus": "朗姆酒簽約獎金",
        "See where your ship is heading and be able to change course": "查看船隻航行方向，並能夠改變航線",
        "Smuggle Drugs": "走私毒品",
        "Smuggling": "走私",
        "Spyglass": "望遠鏡",
        "Tower of Chips": "籌碼塔",
        "You finish replicating a masterpiece...": "你完成了一件傑作的仿製……",
        "You gamble": "你賭上",
        "You smuggle your": "你走私了你的",
        "You take your time to forge emaculate fake documents...": "你花時間偽造 emaculate（原文異常，無法確認）假文件……",
        "at the port and set off again, earning you": "在港口，隨後再次啟航，獲得",
        "but manage to win back": "但設法贏回",
        "/ Day)": "／天）",
        // v0.4.3：公司部門、研究系統、原作及相關能力。
        "Employees": "員工",
        "Research Points": "研究點數",
        "Yearly Tax Rate": "年度稅率",
        "Next Unlock": "下一項解鎖",
        "Producing": "生產中",
        "Original Artwork": "原作藝術品",
        "A ridiculous upgrade until you realize efficiency can start with a single step": "這項升級看似荒謬，直到你意識到提升效率可以從單一步驟開始",
        "Allows you to prestige by making a deal with the devil": "讓你能透過與魔鬼交易進行威望重置",
        "Assigned Employees": "已指派員工",
        "Calling Card": "名片",
        "Corporate Warehouse": "公司倉庫",
        "Corporation": "公司",
        "Cult Brew": "邪教秘釀",
        "Cybernetic Toe": "機械義趾",
        "Devil Pacts": "魔鬼契約",
        "Experienced Criminal": "經驗豐富的罪犯",
        "Formal Shoes": "正式皮鞋",
        "Gain Notoriety from all successful heists": "所有成功的劫案都能獲得惡名",
        "Inaugurate a": "成立一個",
        "Inaugurate an": "成立一個",
        "Initial Hire": "初次雇用",
        "Investment Department": "投資部門",
        "Legal Department": "法務部門",
        "Mo' Money, Mo' Problems": "錢越多，麻煩越多",
        "Psych 101": "心理學入門",
        "Public Relations Department": "公關部門",
        "Research Department": "研究部門",
        "Researched Upgrades": "已研究的升級",
        "Sales Department": "銷售部門",
        "Take the train to your next destination": "搭乘火車前往下一個目的地",
        "Train Ticket": "火車票",
        "Unassigned)": "未指派）",
        "Unholier Oblation": "更邪惡的祭品",
        "Unholy Oblation": "邪惡祭品",
        "You successfully manage to steal an Original piece with none the wiser!": "你成功偷走一件原作，卻沒有人察覺！",
        "Your Corporation pays its yearly taxes...": "你的公司繳納了年度稅款……",
        "/Employee)": "／員工）",
    });

    // 動態格式只寫一條規則，不把日期、數量、快捷鍵逐一加入詞庫。
    // 本區僅替換顯示文字，所有玩家數值與正負號皆保留。
    // v0.4.9：共用百分比加成用語，供完整句與拆分 DOM 節點使用。
    const BONUS_LABELS_049 = Object.freeze({
        'mugging, robbery, and casino robbery money':'行搶、搶劫及賭場搶劫的金錢收益',
        'pickpocket and shoplift money':'扒竊及商店行竊的金錢收益',
        'research speed':'研究速度',
        'sell prices':'出售價格',
        'global money':'全域金錢'
    });

    const DYNAMIC = [
        // v0.4.22：動態數值、船艦牽制效果與各項升級加成。
        [/^\(\s*Tethered\s+x(\d+(?:[.,]\d+)?)!\s*\)$/i, m => '（牽制 ×'+m[1]+'！）'],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance pickpocket stolen jewels$/i,
            m => '扒竊取得偷來的珠寶的機率：'+m[1]+'%'],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Next Create Replica Progress$/i,
            m => '下次製作藝術品仿作的進度：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Decipher map speed$/i,
            m => '地圖解讀速度：'+m[1]],
        // 原文 "when you gamble and win than lose" 語法不明確，避免臆測具體勝率機制。
        [/^([+-]\d+(?:[.,]\d+)?)%\s+when you gamble and win than lose$/i,
            m => '賭博時獲勝而非落敗：'+m[1]+'%'],
        [/^(\d+(?:[.,]\d+)?[KMBT]?)\s+Harpoons?\s+onto your ship for$/i,
            m => m[1]+' 支魚叉到你的船上，花費'],
        [/^(\d+(?:[.,]\d+)?[KMBT]?)\s*\/\s*(\d+(?:[.,]\d+)?[KMBT]?)\s+Harpoons?\s+left$/i,
            m => '剩餘魚叉：'+m[1]+'/'+m[2]],
        [/^Deal\s+(\d+(?:[.,]\d+)?[KMBT]?)\s+DMG\s+\(\s*Tethered\s*\)$/i,
            m => '造成 '+m[1]+' 點傷害（牽制）'],
        [/^Next attack deals\s+x(\d+(?:[.,]\d+)?)\s+DMG$/i,
            m => '下一次攻擊的傷害 ×'+m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+Gang Passive Income$/i,
            m => '幫派被動收入 ×'+m[1]],
        // v0.4.21：魚叉數量片段、藝術品購買、農作物、儀式及靈魂每日消耗的可變規則。
        [/^(\/\s*\d+(?:[.,]\d+)?[KMBT]?)\s+Harpoons$/i, m => m[1]+' 魚叉'],
        [/^Buy\s+x(\d+(?:[.,]\d+)?)\s+Replica Artworks?$/i, m => '購買 ×'+m[1]+' 件藝術品仿作'],
        [/^Loses\s+([+-]\d+(?:[.,]\d+)?)%\s+Ritual Duration$/i, m => '儀式持續時間減少 '+m[1]+'%'],
        [/^Plants\s+([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Drugs$/i, m => '種植 '+m[1]+' 份毒品'],
        [/^Saves\s+(\d+(?:[.,]\d+)?)\s+Souls?\s+per\s+day$/i, m => '每天節省 '+m[1]+' 個靈魂'],
        // v0.4.20：魚叉、船體損傷、種植及航海升級的數值皆可變動。
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Max Harpoons$/i, m => '魚叉上限：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Harpoons$/i, m => '魚叉：'+m[1]],
        [/^(\d+(?:[.,]\d+)?)%\s+chance of\s+(-?\d+(?:[.,]\d+)?[KMBT]?)\s+Ship HP$/i,
            m => m[1]+'% 機率使船隻生命值'+(m[2].startsWith('-')?'減少 '+m[2].slice(1):'增加 '+m[2])+' 點'],
        [/^Failing heists retains\s+(\d+(?:[.,]\d+)?)%\s+of the progress$/i,
            m => '劫案失敗時保留 '+m[1]+'% 的進度'],
        [/^Gain x(\d+(?:[.,]\d+)?)\s+Doubloons when selling to Trading Vessels$/i,
            m => '向商船出售物品時獲得 '+m[1]+' 倍杜布隆金幣'],
        [/^Studying Art will boost next replicating art progress by\s+([+-]\d+(?:[.,]\d+)?)$/i,
            m => '研習藝術會使下一次藝術品仿製的進度增加 '+m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+Notoriety from shady talk when not a criminal$/i,
            m => '非罪犯狀態下，可疑交談獲得的惡名 ×'+m[1]],
        // 已中文化的戰鬥記錄若仍含英文幫派名稱，套用既有名稱詞庫。
        [/^你以「([^」]{1,100})」擊中「([^」]{1,100})」，造成$/u,
            m => '你以「'+translateItemName(m[1])+'」擊中「'+translateItemName(m[2])+'」，造成'],
        [/^你擊敗了「([^」]{1,100})」，並獲得$/u,
            m => '你擊敗了「'+translateItemName(m[1])+'」，並獲得'],
        // v0.4.19：碎片進度保留分子、分母，古物名稱由共用詞庫翻譯。
        [/^(\d+)\s*\/\s*(\d+)\s+pieces?\s+found$/i, m => '已找到 '+m[1]+'/'+m[2]+' 塊碎片'],
        [/^You heist the museum's artifact collection, stealing a piece of '(.{1,100})'$/i,
            m => '你洗劫博物館的古物收藏，偷走了一塊「'+translateItemName(m[1])+'」的碎片'],
        // v0.4.18：火車目的地沿用既有遭遇名稱翻譯，不預設只有四種目的地。
        [/^You ride the train and arrive at '([^']{1,100})'$/i, m => '你搭乘火車，抵達「' + translateItemName(m[1]) + '」'],
        [/^\(\s*([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s*\/\s*Employee\s*\)$/i, m => '（每名員工 '+m[1]+'）'],
        [/^\+\s*Chance to create Original Artwork\s+([+-]\d+(?:[.,]\d+)?)%\s*\(\s*([+-]\d+(?:[.,]\d+)?)%\s*Per Lvl\s*\)$/i,
            m => '＋創作原創藝術品的機率 '+m[1]+'%（每級 '+m[2]+'%）'],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Stealth EXP from pickpocketing$/i, m => '扒竊獲得的潛行經驗值：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Flee chance$/i, m => '逃跑機率：'+m[1]+'%'],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Jewelry Store Heist Planning Speed$/i, m => '珠寶店劫案策劃速度：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance to Pickpocket Jewels$/i, m => '扒竊時偷得珠寶的機率：'+m[1]+'%'],
        [/^([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Treasure Maps?$/i,
            m => /^[+-]/.test(m[1]) ? '藏寶圖：'+m[1] : m[1]+' 張藏寶圖'],
        [/^Rob Passengers\s*\(\s*(\d+)\s+G\.M\.?\s*,\s*(\d+)\s+S\.M\.G\.?\s*\)$/i,
            m => '搶劫乘客（'+m[1]+' 名幫派成員、'+m[2]+' 把衝鋒槍）'],
        [/^Gain\s+(\d+(?:[.,]\d+)?)%\s+of Supplies when sailing past Shipwrecks$/i,
            m => '航行經過沉船時獲得其補給品的 '+m[1]+'%'],
        [/^x(\d+(?:[.,]\d+)?)\s+(Train Robbery Money|Supplies from Salvaging Wreckage|Rob Passengers Reward|Pickpocket and Shoplift Reward)$/i,
            m => ({'train robbery money':'火車搶劫金錢','supplies from salvaging wreckage':'打撈殘骸獲得的補給品','rob passengers reward':'搶劫乘客獎勵','pickpocket and shoplift reward':'扒竊及商店行竊獎勵'})[m[2].toLowerCase()]+' ×'+m[1]],
        [/^Next Shipment in\s+(\d+(?:[.,]\d+)?)\s+Days?$/i, m => '距離下一批貨物抵達還有 '+m[1]+' 天'],
        // v0.4.16：以同一套可變數值格式涵蓋研究、古物、博物館策劃與部門加成。
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Finance EXP from Studying Operations$/i, m => '研究營運獲得的財務經驗值：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Random Artifact Pieces?$/i, m => '隨機古物碎片：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Not\.\s+Per Artifact Level$/i, m => '每級古物獲得的惡名：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Max Stolen Goods$/i, m => '贓物持有上限：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Museum Plan Heist Speed$/i, m => '博物館劫案策劃速度：'+m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance Fake Identity not used up$/i, m => '假身分不被消耗的機率：'+m[1]+'%'],
        [/^Decipher Map\s*\(\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*\)$/i, m => '解讀地圖（'+m[1]+'/'+m[2]+'）'],
        [/^Spyglass can see\s+(\d+(?:[.,]\d+)?)\s+Nautical Miles further$/i, m => '望遠鏡的觀測距離增加 '+m[1]+' 海里'],
        [/^x(\d+(?:[.,]\d+)?)\s+Sales Department Clean Money$/i, m => '銷售部門的合法金錢 ×'+m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+All Notoriety Rewards$/i, m => '所有惡名獎勵 ×'+m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+Casino Robbery Reward$/i, m => '賭場搶劫獎勵 ×'+m[1]],
        // 舊版僅譯出研究通知的外層時，重新翻譯引號中的研究名稱。
        [/^你的研究已完成「([^「」]{1,100})」項目的研究！$/u, m => '你的研究已完成「'+translateItemName(m[1])+'」項目的研究！'],
        // v0.4.15：以建築名稱共用數值、每日消耗與收益加成格式。
        [/^([+-]\d+(?:[.,]\d+)?)%\s+(Doubloons|Money)$/i, m => (m[2].toLowerCase()==='doubloons'?'杜布隆金幣':'金錢')+'加成：'+m[1]+'%'],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+(Blackwater Market|Coinmaster's Den)$/i, m => translateItemName(m[2])+'：'+m[1]],
        [/^\(\s*([+-]\d+(?:[.,]\d+)?)%\s+(Doubloons|Money)\s*\/\s*(Blackwater Market|Coinmaster's Den)\s*\)$/i, m => '（每座'+translateItemName(m[3])+'的'+(m[2].toLowerCase()==='doubloons'?'杜布隆金幣':'金錢')+'收益：'+m[1]+'%）'],
        [/^\(\s*([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Doubloons\s+per\s+day\s*\/\s*(Blackwater Market|Coinmaster's Den)\s*\)$/i, m => '（每座'+translateItemName(m[2])+'每天的杜布隆金幣變動：'+m[1]+'）'],
        [/^([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Doubloons\s+per\s+day$/i, m => '每天的杜布隆金幣變動：'+m[1]],
        [/^Readjusting\s*\(\s*(\d+)\s+Days?\s+Left\s*\)$/i, m => '重新適應中（剩餘 '+m[1]+' 天）'],
        [/^([A-Za-z][A-Za-z' -]{0,64})升至等級\s*(\d+)！$/u, m => translateItemName(m[1].trim())+'升至等級 '+m[2]+'！'],
        [/^You purchase the exotic pet\s+'([^']{1,80})'\s+for$/i, m => '你購買了異國寵物「'+translateItemName(m[1])+'」，花費'],
        // v0.4.14：使用動態百分比翻譯假身分與塗鴉／可疑交談加成。
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Fake Identity Speed and conservation$/i, m => m[1] + '% 假身分建立速度與保留機率'],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Graffiti and Shady Stranger Talk Notoriety$/i, m => m[1] + '% 塗鴉及與可疑陌生人交談獲得的惡名'],
        // v0.4.13：專精升級、藏寶圖、獻祭靈魂及每日惡名消耗皆保留可變數值。
        [/^\+\s*Chance to get away with crime\s+([+-]\d+(?:[.,]\d+)?)%\s*\(\s*([+-]\d+(?:[.,]\d+)?)%\s*Per Lvl\s*\)$/i, m => '＋犯罪後逃過追究的機率 ' + m[1] + '%（每級 ' + m[2] + '%）'],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Treasure Maps?$/i, m => '藏寶圖：' + m[1]],
        [/^Loses\s+([+-]?\d+(?:[.,]\d+)?)\s+Souls per Gang Member\s*\(\s*([+-]?\d+(?:[.,]\d+)?)\s+Total\s*\)\s+per Sacrifice$/i, m => '每次獻祭失去的靈魂：每名幫派成員 ' + m[1] + '（總計 ' + m[2] + '）'],
        [/^Saves\s+(\d+(?:[.,]\d+)?)\s+Not\.\s+per day$/i, m => '每天節省 ' + m[1] + ' 點惡名'],
        // v0.4.11：幫派被動收入的等級加成。
        [/^\+\s*Gang Passive Income boosted by\s*([+-]\d+(?:[.,]\d+)?)%\s*\(\s*([+-]\d+(?:[.,]\d+)?)%\s*Per Lvl\s*\)$/i, m => '＋幫派被動收入增加 ' + m[1] + '%（每級 ' + m[2] + '%）'],
        // v0.4.11：尋寶通知中可能單獨出現的金幣數量片段。
        [/^(\+?\d+(?:[.,]\d+)?)\s+Doubloons and$/i, m => m[1] + ' 枚杜布隆金幣及'],
        // v0.4.10：重新適應所需天數，保留可變數值。
        [/^Takes\s+(\d+)\s+days?\s+to readjust$/i, m => '需要 ' + m[1] + ' 天重新適應'],
        // v0.4.9：百分比加成及活動結束倒數。
        [/^([+-]\d+(?:[.,]\d+)?)%\s+(Mugging, Robbery, and Casino Robbery Money|Pickpocket and Shoplift Money|Research Speed|Sell Prices|Global Money)$/i, m => m[1] + '% ' + BONUS_LABELS_049[m[2].toLowerCase()]],
        [/^Ending in\s+(\d+)\s+Days?$/i, m => '將於 ' + m[1] + ' 天後結束'],
        // v0.4.8：寵物經驗值、契約、全域加成及累積進度的變動值。
        [/^(\d+(?:[.,]\d+)?[KMBT]?)\s*\/\s*(\d+(?:[.,]\d+)?[KMBT]?)\s+EXP$/i, m => m[1] + '/' + m[2] + ' 經驗值'],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Global Money and Notoriety$/i, m => '全域金錢與惡名：' + m[1] + '%'],
        [/^(\d+)\s+pacts?\s+earned$/i, m => '已獲得 ' + m[1] + ' 項契約'],
        [/^([A-Za-z][A-Za-z' -]{0,64})\s+reached level\s+(\d+)!$/i, m => translateItemName(m[1].trim()) + '升至等級 ' + m[2] + '！'],
        [/^Pact Bonus:\s*([+-]\d+(?:[.,]\d+)?)%\s+Money\s*&\s*Notoriety$/i, m => '契約加成：金錢與惡名 ' + m[1] + '%'],
        [/^x(\d+(?:[.,]\d+)?)\s+pet EXP gain speed$/i, m => '寵物經驗值獲得速度 ×' + m[1]],
        // v0.4.5：員工數量、契約數量與研究完成通知。
        [/^([+-]\d+(?:[.,]\d+)?)\s+Employees?$/i, m => '員工：' + m[1]],
        [/^Select\s+(\d+)\s+more pacts?(?:\s+and be reborn\.)?$/i, m => '再選擇 ' + m[1] + ' 項契約' + (/and be reborn\.$/i.test(m[0]) ? '並重生。' : '')],
        [/^Your researches have finished researching\s+(['"])([^'"]{1,100})\1!$/i, m => '你的研究已完成「' + translateItemName(m[2]) + '」項目的研究！'],
        // v0.4.3：公司研究、員工、原作、邪教與稅率的變動格式。
        [/^\(\s*([+-]\d+(?:[.,]\d+)?)\s+R\.P\.?\s*\/\s*Employee\s*\)$/i, m => '（' + m[1] + ' 研究點數／員工）'],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Money Rewards for every\s+(\d+(?:[.,]\d+)?)\s+Notoriety\s*\(Max\s+(\d+(?:[.,]\d+)?)%\)$/i, m => '每 ' + m[2] + ' 點惡名，金錢獎勵加成 ' + m[1] + '%（最高 ' + m[3] + '%）'],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Followers?\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => '追隨者：' + m[1] + '（' + m[2] + '%）'],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Original Artworks?$/i, m => /^[+-]/.test(m[1]) ? '原作藝術品：' + m[1] : m[1] + ' 件原作藝術品'],
        [/^([+-]\d+(?:[.,]\d+)?)\s+R\.P\.?$/i, m => '研究點數：' + m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance to indoctrinate shady strangers?$/i, m => '向可疑陌生人灌輸教義的機率：' + m[1] + '%'],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Yearly Tax Rate$/i, m => '年度稅率：' + m[1] + '%'],
        [/^Try Indoctrinate\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => '嘗試灌輸教義（' + m[1] + '%）'],
        [/^Unholy Oblation increases Max Souls by\s+([+-]\d+(?:[.,]\d+)?)$/i, m => '邪惡祭品使靈魂上限增加 ' + m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+Research Speed$/i, m => '研究速度 ×' + m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+Build Fake Identity speed when talking with Strangers$/i, m => '與陌生人交談時建立假身分的速度 ×' + m[1]],
        [/^Inaugurate an?\s+(Investment|Legal|Public Relations|Research|Sales) Department$/i, m => '成立一個' + translateItemName(m[1] + ' Department')],
        // v0.4.2：仿作、假身分、藝術經驗與走私／航海能力的動態格式。
        [/^([+-]\d+(?:[.,]\d+)?)\s+Art EXP from Studying Paintings$/i, m => '研究畫作獲得的藝術經驗值：' + m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Fake Identity from Forging Documents$/i, m => '偽造文件獲得的假身分：' + m[1]],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Replica Artworks?$/i, m => /^[+-]/.test(m[1]) ? '藝術品仿作：' + m[1] : m[1] + ' 件藝術品仿作'],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Attack Cooldowns?$/i, m => '攻擊冷卻時間：' + m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+Ram Damage$/i, m => '撞角傷害 ×' + m[1]],
        [/^x(\d+(?:[.,]\d+)?)\s+Amount money laundered$/i, m => '洗錢金額 ×' + m[1]],
        // v0.4.1：追隨者與藝術品仿製速度的可變數值。
        [/^\+\s*(\?+)\s*\(\s*Unlocked at\s+(\d+(?:[.,]\d+)?)\s+Followers?\s*\)$/i, m => '＋' + m[1] + '（達到 ' + m[2] + ' 名追隨者時解鎖）'],
        [/^\+\s*Replicate Artwork Speed\s+([+-]\d+(?:[.,]\d+)?)\s*\(\s*([+-]\d+(?:[.,]\d+)?)\s+Per Lvl\s*\)$/i, m => '＋藝術品仿製速度 ' + m[1] + '（每級 ' + m[2] + '）'],
        [/^([+-]\d+(?:[.,]\d+)?)\s+(Cult\s+)?Followers?$/i, m => (m[2] ? '邪教追隨者：' : '追隨者：') + m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Souls from Sacrifices$/i, m => '獻祭獲得的靈魂：' + m[1] + '%'],
        // v0.4.0：美術館劫案、原作藝術品、條件加成、選擇數與重新集結倒數。
        [/^([+-]\d+(?:[.,]\d+)?)\s+Art Gallery Heist (Plan )?Speed$/i, m => '美術館劫案' + (m[2] ? '策劃' : '') + '速度：' + m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Navy Ship Attack Cooldown$/i, m => '海軍艦艇攻擊冷卻時間：' + m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Original Artwork\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => '原作藝術品：' + m[1] + '（' + m[2] + '%）'],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+when not a criminal$/i, m => '非罪犯狀態時：' + m[1] + '%'],
        [/^([+-]\d+(?:[.,]\d+)?)\s+HP$/i, m => '生命值：' + m[1]],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance of success if you have a Replica Artwork to swap with the original$/i, m => '若有藝術品仿作可與原作交換，成功機率：' + m[1] + '%'],
        [/^(\d+)\s*\/\s*(\d+)\s+selected$/i, m => '已選擇 ' + m[1] + '/' + m[2]],
        [/^Reduce Deal Drugs crime and max crime penalty by\s+(\d+)$/i, m => '將販售毒品的犯罪懲罰及懲罰上限降低 ' + m[1]],
        [/^(Regrouping|Reloading)\s*\(\s*(\d+)\s+Days?\s+Left\s*\)$/i, m => (m[1].toLowerCase()==='reloading'?'重新裝填中（剩餘 ':'重新集結中（剩餘 ') + m[2] + ' 天）'],
        [/^x(\d+(?:[.,]\d+)?)\s+Money from raiding graves$/i, m => '盜墓獲得的金錢 ×' + m[1]],
        // v0.3.24：技能加成與獻祭的可變數值。
        [/^\+\s*(Gambling|Graffiti|Shoplift|Store Robberies|Casino Robberies)\s+boosted by\s*([+-]\d+(?:[.,]\d+)?)%\s*\(\s*([+-]\d+(?:[.,]\d+)?)%\s*Per Lvl\s*\)$/i, m => '＋' + ({gambling:'賭博',graffiti:'塗鴉',shoplift:'商店行竊','store robberies':'商店搶劫','casino robberies':'賭場搶劫'})[m[1].toLowerCase()] + '加成 ' + m[2] + '%（每級 ' + m[3] + '%）'],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Combo to Money while staying a criminal$/i, m => '維持罪犯狀態時的金錢連續加成：' + m[1] + '%'],
        [/^(\d+(?:[.,]\d+)?)\s+Cannonballs?\s+onto your ship for$/i, m => m[1] + ' 發砲彈到你的船上，花費'],
        [/^(\d+(?:[.,]\d+)?)\s+(Pistols|Submachine Guns)\s+for$/i, m => m[1] + ' 把' + translateItemName(m[2]) + '以換取'],
        [/^Loses\s+([+-]?\d+(?:[.,]\d+)?)\s+Souls per Sacrifice$/i, m => '每次獻祭失去 ' + m[1] + ' 個靈魂'],
        [/^Saves\s+\$([\d,.]+)\s+per day$/i, m => '每天節省 $' + m[1]],
        [/^Unlock new Gang War attack using (Pistols|Submachine Guns)$/i, m => '解鎖使用' + translateItemName(m[1]) + '的新幫派戰爭攻擊招式'],
        [/^x(\d+(?:[.,]\d+)?)\s+Graffiti Notoriety Reward$/i, m => '塗鴉惡名獎勵 ×' + m[1]],
        // v0.3.23：專精、賭場搶劫需求、販售加成與倍率的可變規則。
        [/^\+\s*Sell prices boosted by\s*([+-]\d+(?:[.,]\d+)?)%\s*\(\s*([+-]\d+(?:[.,]\d+)?)%\s*Per Lvl\s*\)$/i, m=>`＋出售價格加成 ${m[1]}%（每級 ${m[2]}%）`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+(Finance|Stealth|Artistry|Brutality)\s+EXP$/i, m=>`${({finance:"財務",stealth:"潛行",artistry:"藝術",brutality:"蠻力"})[m[2].toLowerCase()]}經驗值：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Money when you gamble and win than lose$/i, m=>`賭博獲勝時相較落敗，多獲得 ${m[1]}% 金錢`],
        [/^(Finance|Stealth|Artistry|Brutality)\s+Lv\.\s*(\d+)$/i, m=>`${({finance:"財務",stealth:"潛行",artistry:"藝術",brutality:"蠻力"})[m[1].toLowerCase()]}專精等級 ${m[2]}`],
        [/^Rob Casino\s*\(\s*(\d+)\s+G\.M\.?\s*,\s*(\d+)\s+(S\.M\.G\.?|Pistols?|Submachine Guns?)\s*\)$/i, m=>`搶劫賭場（${m[1]} 名幫派成員、${m[2]} 把${translateItemName(/^(?:S\.M\.G\.?|Submachine Guns?)$/i.test(m[3])?'Submachine Guns':'Pistols')}）`],
        [/^Your (['"])(Finance|Stealth|Artistry|Brutality)\1 Expertise increases to Level\s+(\d+)!$/i, m=>`你的「${({finance:"財務",stealth:"潛行",artistry:"藝術",brutality:"蠻力"})[m[2].toLowerCase()]}」專精提升至等級 ${m[3]}！`],
        [/^x(\d+(?:[.,]\d+)?)\s+Money earned from Casino Robbery$/i, m=>`賭場搶劫獲得的金錢 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Max (Pistols|Submachine Guns) and (Pistols|Submachine Guns)$/i, m=>`${translateItemName(m[2])}與${translateItemName(m[3])}上限 ×${m[1]}`],
        // v0.3.22：經驗值、砲彈、船隻修復、仿製進度與海戰獎勵的數值模板。
        [/^\+\s*(\?+)\s*\(Unlocked at Lvl\.\s*(\d+)\)$/i, m=>`＋${m[1]}（等級 ${m[2]} 解鎖）`],
        [/^\+\s*Pickpocket boosted by\s*([+-]\d+(?:[.,]\d+)?)%\s*\(([+-]\d+(?:[.,]\d+)?)%\s*Per Lvl\)$/i, m=>`＋扒竊加成 ${m[1]}%（每級 ${m[2]}%）`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+EXP$/i, m=>`經驗值：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance of finding Stolen Jewels when Raiding Graves$/i, m=>`盜墓時找到贓珠寶的機率：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Ship HP$/i, m=>`船隻生命值：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Max Cannonballs?$/i, m=>`砲彈上限：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Cannonballs?$/i, m=>`砲彈：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Progress Replicating Artwork$/i, m=>`藝術品仿製進度：${m[1]}`],
        [/^\/\s*(\d+(?:[.,]\d+)?)\s+Cannonballs?$/i, m=>`／${m[1]} 發砲彈`],
        [/^(\d+(?:[.,]\d+)?)\s+HP to your ship$/i, m=>`船隻的 ${m[1]} 點生命值`],
        [/^(\d+)\s*\/\s*(\d+)\s+Cannonballs?\s+left$/i, m=>`剩餘砲彈：${m[1]}/${m[2]}`],
        [/^Buy\s+(\d+)$/i, m=>`購買 ${m[1]}`],
        [/^Cannons have a\s+(\d+(?:[.,]\d+)?)%\s+chance of x(\d+(?:[.,]\d+)?) Damage$/i, m=>`大砲有 ${m[1]}% 機率造成 ${m[2]} 倍傷害`],
        [/^Deal\s+(\d+(?:[.,]\d+)?)\s+DMG$/i, m=>`造成 ${m[1]} 點傷害`],
        [/^Mugging gives\s+([+-]\d+(?:[.,]\d+)?)\s+Stolen Goods$/i, m=>`搶劫獲得 ${m[1]} 件贓物`],
        [/^Replicate Artwork\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)$/i, m=>`仿製藝術品（${m[1]}/${m[2]}）`],
        [/^Takes\s+(\d+(?:[.,]\d+)?)\s+days?\s+to\s+(regroup|reload)$/i, m=>`${m[2].toLowerCase()==='regroup'?'重新集結':'重新裝填'}需要 ${m[1]} 天`],
        [/^x(\d+(?:[.,]\d+)?)\s+(Stealth EXP|Doubloons from Treasure|Store Robbery Money reward)$/i, m=>`${({'stealth exp':'潛行經驗值','doubloons from treasure':'從寶藏獲得的杜布隆金幣','store robbery money reward':'商店搶劫金錢獎勵'})[m[2].toLowerCase()]} ×${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?[KMBT])\s+Doubloons?$/i, m=>`杜布隆金幣：${m[1]}`],
        // v0.3.21：船員上限數值與正負號共用規則。
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Max Crewmates$/i, m => `船員上限：${m[1]}`],
        // v0.3.20：挖寶機率不綁定特定百分比。
        [/^Dig for Treasure\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => `挖掘寶藏（${m[1]}%）`],
        // v0.3.19：船員數量、招募機率、商船買賣數量與海盜倍率。
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Crewmates?$/i, m=>/^[+-]/.test(m[1])?`船員：${m[1]}`:`${m[1]} 名船員`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Recruit chance$/i, m=>`招募機率：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance of finding treasure$/i, m=>`發現寶藏的機率：${m[1]}%`],
        [/^(Buy|Sell)\s+x(\d+(?:[.,]\d+)?)\s+(Stolen Jewels|Stolen Goods|Pistols)$/i, m=>`${m[1].toLowerCase()==='buy'?'購買':'出售'} ×${m[2]} ${translateItemName(m[3])}`],
        [/^x(\d+(?:[.,]\d+)?)\s+(Ship Speed|Doubloons from Navy Ship|Plunder Reward|Flee chance during Foggy Weather|Terrorize Reward)$/i, m=>`${({'ship speed':'船隻速度','doubloons from navy ship':'從海軍艦艇獲得的杜布隆金幣','plunder reward':'掠奪獎勵','flee chance during foggy weather':'霧天的逃跑機率','terrorize reward':'恐嚇獎勵'})[m[2].toLowerCase()]} ×${m[1]}`],
        // v0.3.18：生命值上限、登船傷害、靈魂上限與倍率使用共用規則。
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Ship Max HP$/i, m=>`船隻生命值上限：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Boarding DMG per crewmate$/i, m=>`每名船員的登船作戰傷害：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Base Boarding DMG$/i, m=>`登船作戰基礎傷害：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Max Souls$/i, m=>`靈魂上限：${m[1]}`],
        [/^Increase Ship speed by x(\d+(?:[.,]\d+)?)$/i, m=>`船隻速度提高至 ×${m[1]}`],
        [/^Rituals cost ([+-]?\d+(?:[.,]\d+)?)% of your total Souls$/i, m=>`儀式消耗你總靈魂的 ${m[1]}%`],
        [/^Undead Minions provide x(\d+(?:[.,]\d+)?) Souls$/i, m=>`亡靈僕從提供的靈魂 ×${m[1]}`],
        // v0.3.17：航海／船員／金幣／補給／天氣及賭博數值皆使用變動格式。
        [/^([+-]\d+(?:[.,]\d+)?)\s+Crewmates?\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => `船員：${m[1]}（${m[2]}%）`],
        [/^([+-]?\d+)\s*\/\s*(\d+)\s+Crewmates?$/i, m => `船員：${m[1]} / ${m[2]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance to recruit Shady Strangers when not a criminal$/i, m => `非罪犯狀態時招募可疑陌生人的機率：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+(Ship Speed|HP|Sailing Speed|Supplies Find Chance)$/i, m => `${({'ship speed': '船隻速度', hp: '生命值', 'sailing speed': '航行速度', 'supplies find chance': '找到補給品的機率'})[m[2].toLowerCase()]}：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+during Foggy Weather$/i, m => `起霧天氣時：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Ship HP per day while docked at (?:the )?(?:Safe Haven|haven)$/i, m => `停靠在避風港時，每日船隻生命值 ${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Doubloons?$/i, m => `${/^[+-]/.test(m[1]) ? '杜布隆金幣：' + m[1] : m[1] + ' 枚杜布隆金幣'}`],
        [/^([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Supplies$/i, m => `${/^[+-]/.test(m[1]) ? '補給品：' + m[1] : m[1] + ' 份補給品'}`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Fake Identity\s*\(\s*(\d+(?:[.,]\d+)?)% Chance not Used\s*\)$/i, m => `假身分：${m[1]}（${m[2]}% 機率不消耗）`],
        [/^(\d+(?:[.,]\d+)?)%\s+chance of escaping the Navy Ship$/i, m => `逃離海軍艦艇的機率：${m[1]}%`],
        [/^(\d+(?:[.,]\d+)?)%\s+Chance of finding (\d+(?:[.,]\d+)?) to (\d+(?:[.,]\d+)?) Supplies per Day while Sailing$/i, m => `航行時每天有 ${m[1]}% 機率找到 ${m[2]} 至 ${m[3]} 份補給品`],
        [/^Flee\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => `逃離（${m[1]}%）`],
        [/^Recruit Crewmate\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => `招募船員（${m[1]}%）`],
        [/^Gain\s+([+-]\d+(?:[.,]\d+)?)% more when you gamble and win than when you lose$/i, m => `賭博獲勝時比落敗時多獲得 ${m[1]}%`],
        [/^x(\d+(?:[.,]\d+)?)\s+(Pirating Damage|Notoriety from Undermining the Police|Pickpocket and Shoplifting Rewards|Amount you (?:can )?gamble|Gang Passive Money Income)$/i, m => `${({'pirating damage':'海盜活動傷害','notoriety from undermining the police':'暗中破壞警方行動獲得的惡名','pickpocket and shoplifting rewards':'扒竊與商店行竊獎勵','amount you gamble':'賭注金額','amount you can gamble':'賭注金額','gang passive money income':'幫派被動金錢收入'})[m[2].toLowerCase()]} ×${m[1]}`],
        // v0.3.16：可變動數值、賭博倍率、每日消耗及戰鬥訊息前綴。
        [/^(['"])(.+?)\1\s+deal$/i, m => `「${translateItemName(m[2])}」造成`],
        [/^\(([+-]\d+(?:[.,]\d+)?)%\s+Ritual (Duration\/Shrine|Power\/Blood Pool)\)$/i, m => `（每座${m[2].toLowerCase().startsWith('duration') ? '神龕的儀式持續時間' : '血池的儀式威力'}：${m[1]}%）`],
        [/^\(-\$([\d,.]+)\s+per day\/Blood Pool\)$/i, m => `（每座血池每日金錢：-$${m[1]}）`],
        [/^\(([+-]\d+(?:[.,]\d+)?)\s+Souls per day\/Shrine\)$/i, m => `（每座神龕每日靈魂：${m[1]}）`],
        [/^\+\s*Unlocks?\s+(New\s+)?(Equipment|Ritual|Rune|Structures|Followers)$/i, m => `＋解鎖${m[1] ? '新' : ''}${({equipment: '裝備', ritual: '儀式', rune: '符文', structures: '建築', followers: '追隨者'})[m[2].toLowerCase()]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Ritual Duration$/i, m => `儀式持續時間：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Max bribe level$/i, m => `賄賂等級上限：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Max Drugs Capacity$/i, m => `毒品容量上限：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+(?:Chance (?:to win|of success) when gambling|Success chance gambling)$/i, m => `賭博獲勝機率：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Notoriety$/i, m => `惡名：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Souls per day$/i, m => `每日靈魂：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Gang War attack base cooldown$/i, m => `幫派戰爭攻擊的基礎冷卻時間：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Seed Prices$/i, m => `種子價格：${m[1]}%`],
        [/^(\d+(?:[.,]\d+)?)%\s+Chance to yield x(\d+(?:[.,]\d+)?) harvest$/i, m => `收成獲得 ${m[2]} 倍產量的機率：${m[1]}%`],
        [/^Gain\s+(\d+(?:[.,]\d+)?)%\s+Gamble success chance$/i, m => `賭博成功機率增加 ${m[1]}%`],
        [/^Gamble\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => `賭博（${m[1]}%）`],
        [/^Lose\s+(\d+(?:[.,]\d+)?)%\s+less money when busted$/i, m => `被逮捕時損失的金錢減少 ${m[1]}%`],
        [/^Weeds, slowing down growth by\s+(\d+(?:[.,]\d+)?)%$/i, m => `雜草，使生長速度減慢 ${m[1]}%`],
        [/^x(\d+(?:[.,]\d+)?)\s+Counting Cards money$/i, m => `算牌獲得的金錢 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Drugs Sell Price$/i, m => `毒品出售價格 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Counting cards reward$/i, m => `算牌獎勵 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+income from each gang member$/i, m => `每名幫派成員的收入 ×${m[1]}`],
        // 第十一批：亡靈數量、毒品販售上限、假身分機率與持續時間類倍率共用格式。
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Undead Minions?$/i, m => /^[+-]/.test(m[1]) ? `亡靈僕從：${m[1]}` : `${m[1]} 名亡靈僕從`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+max drugs dealt to Shady Strangers$/i, m => `向可疑陌生人販售毒品的上限：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance Fake Identity is not used up$/i, m => `假身分不被消耗的機率：${m[1]}%`],
        [/^Jewelry Store Robberies give x(\d+(?:[.,]\d+)?) Notoriety$/i, m => `珠寶店搶劫獲得的惡名 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+money earned from Pickpocket and Shoplifting$/i, m => `扒竊及商店行竊獲得的金錢 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Notoriety\s*\(\s*(\d+)\s+days?\s*\)$/i, m => `惡名 ×${m[1]}（${m[2]} 天）`],
        [/^x(\d+(?:[.,]\d+)?)\s+Stolen Goods Sell Price$/i, m => `贓物出售價格 ×${m[1]}`],
        // 亡靈、招募、幫派對手與戰鬥紀錄：保留數值、百分比及可變名稱。
        [/^([+-]\d+)\s+Undead Minions?\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => `亡靈僕從：${m[1]}（${m[2]}%）`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Shoplift Stolen Goods chance$/i, m => `商店行竊獲得贓物的機率：${m[1]}%`],
        [/^([+-]\d+)\s+Max Undead Minions$/i, m => `亡靈僕從上限：${m[1]}`],
        [/^(\d+)\s+Members? into your Gang$/i, m => `${m[1]} 名成員加入你的幫派`],
        [/^([+-]?\d+(?:[.,]\d+)?)%\s+Global Notoriety$/i, m => `全域惡名：${m[1]}%`],
        [/^New Gang Members are\s+(\d+(?:[.,]\d+)?)%\s+cheaper to recruit$/i, m => `招募新幫派成員的費用降低 ${m[1]}%`],
        [/^Try Awaken Dead\s*\(\s*(\d+(?:[.,]\d+)?)%\s*\)$/i, m => `嘗試喚醒死者（${m[1]}%）`],
        [/^You defeated (['"])(.+?)\1, earning you$/i, m => `你擊敗了「${translateItemName(m[2])}」，並獲得`],
        [/^You hit (['"])(.+?)\1 with (.+?), dealing$/i, m => `你以「${translateItemName(m[3])}」擊中「${translateItemName(m[2])}」，造成`],
        [/^x(\d+(?:[.,]\d+)?)\s+Notoriety gained from talking with Shady Strangers$/i, m => `與可疑陌生人交談獲得的惡名 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Raid Grave Money Reward$/i, m => `盜墓金錢獎勵 ×${m[1]}`],
        // 舊版本已部分中文化的幫派戰爭通知，補譯對手名稱而不再次記錄整句。
        [/^與「([^」]+)」開戰。勝利可獲得 ([+-]\d+(?:[.,]\d+)?)% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。$/u, m => `與「${translateItemName(m[1])}」開戰。勝利可獲得 ${m[2]}% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。`],
        // 2026-10-31：武裝搶劫需求、武器數量、偽造身分、傷害、邪教建築及升級等動態格式。
        [/^Armed Robbery\s*\(\s*(\d+)\s+G\.M\.?\s*,\s*(\d+)\s+([^()]+?)\s*\)$/i, m => `持械搶劫（${m[1]} 名幫派成員、${m[2]} 把${translateItemName(m[3].trim())}）`],
        [/^You need a minimum of\s+(\d+)\s+Gang Members and\s+(\d+)\s+(.+)$/i, m => `你至少需要 ${m[1]} 名幫派成員與 ${m[2]} 把${translateItemName(m[3].trim())}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Fake Identity$/i, m => `假身分：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Drugs?$/i, m => `毒品：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+Dmg$/i, m => `傷害：${m[1]}`],
        [/^([+-]\d+)\s+Stolen Jewels? from Jewelry Store Armed Robbery$/i, m => `珠寶店持械搶劫獲得的贓珠寶：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Notoriety if criminal status is at least\s+(\d+)$/i, m => `罪犯狀態至少為 ${m[2]} 時，惡名：${m[1]}%`],
        [/^Cult Lv\.\s*(\d+)$/i, m => `邪教等級 ${m[1]}`],
        [/^Your Cult grows to Level\s+(\d+)$/i, m => `你的邪教升至等級 ${m[1]}`],
        [/^Not ready, refunds\s+(\d+(?:[.,]\d+)?)% of seed cost$/i, m => `尚未準備好，退還種子成本的 ${m[1]}%`],
        [/^Reduce (Jewelry )?Store Robbery crime and max crime Penalty by\s+(\d+)$/i, m => `將${m[1] ? '珠寶店' : '商店'}搶劫的犯罪懲罰及懲罰上限降低 ${m[2]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Build Fake Identity Speed$/i, m => `建立假身分的速度 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Notoriety from Store Robberies and Jewelry Store Armed Robberies$/i, m => `商店搶劫與珠寶店持械搶劫獲得的惡名 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Notoriety Rewards$/i, m => `惡名獎勵 ×${m[1]}`],
        // 2026-10-31：數量、持續天數、幫派戰爭、惡名單位縮寫與農作物的倍率。
        [/^([+-]\d+(?:[.,]\d+)?)\s+(Pistols|Submachine Guns)$/i, m => `${translateItemName(m[2])}：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance for x(\d+(?:[.,]\d+)?) Drugs on harvest$/i, m => `收成時獲得 ${m[2]} 倍毒品的機率：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Max Drugs$/i, m => `毒品持有上限：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Drugs?$/i, m => `毒品：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?[KMBT])\s+Not\.$/i, m => `惡名：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Gang War Damage Taken$/i, m => `幫派戰爭承受的傷害：${m[1]}%`],
        [/^Go to war with (['"])(.+?)\1\. Win to gain ([+-]\d+(?:[.,]\d+)?)% Global Notoriety\. If your Gang falls, you lose ALL of your Notoriety and Gang Members\.$/i, m => `與「${translateItemName(m[2])}」開戰。勝利可獲得 ${m[3]}% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。`],
        [/^You give up (\d+) Gang Members in return for your freedom$/i, m => `你交出了 ${m[1]} 名幫派成員，以換取自由`],
        [/^x(\d+(?:[.,]\d+)?)\s+Greenhouse growth speed$/i, m => `溫室生長速度 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Gang War attack damage$/i, m => `幫派戰爭攻擊傷害 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Money \(\s*(\d+)\s+days?\s*\)$/i, m => `金錢 ×${m[1]}（${m[2]} 天）`],
        [/^x(\d+(?:[.,]\d+)?)\s+Notoriety when not a criminal$/i, m => `非罪犯狀態時的惡名 ×${m[1]}`],
        // 2026-10-31：可變動的靈魂、祭壇、園藝、墓園、生命值、犯罪門檻及幫派戰爭。
        [/^\(([+-]\d+(?:[.,]\d+)?) Souls per Gang Member \(([+-]\d+(?:[.,]\d+)?) Total\) per Sacrifice\/Cultist Training Ground\)$/i, m => `（每座邪教徒訓練場每次獻祭，每名幫派成員獲得 ${m[1]} 靈魂（總計 ${m[2]}））`],
        [/^\(([+-]\d+(?:[.,]\d+)?) Not\. per day\/Cultist Training Ground\)$/i, m => `（每座邪教徒訓練場每天的惡名：${m[1]}）`],
        [/^\((Sickle|Sow|Water)\)$/i, m => `（${translateItemName(m[1])}）`],
        [/^([+-]\d+(?:[.,]\d+)?) Souls per Gang Member \(([+-]\d+(?:[.,]\d+)?) Total\) per Sacrifice$/i, m => `每次獻祭每名幫派成員獲得 ${m[1]} 靈魂（總計 ${m[2]}）`],
        [/^([+-]\d+)\s+(Altar|Cultist Training Ground|Shrine|Blood Pool)$/i, m => `${({altar: "祭壇", "cultist training ground": "邪教徒訓練場", shrine: "神龕", "blood pool": "血池"})[m[2].toLowerCase()]}：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)% Chance for bonus Drugs on harvest$/i, m => `收成時獲得額外毒品的機率：${m[1]}%`],
        [/^([+-]\d+) Stolen Jewels? from Raid Grave$/i, m => `盜墓獲得的贓珠寶：${m[1]}`],
        [/^([+-]\d+) Stolen Jewels? from Jewelry Store Heists?$/i, m => `珠寶店劫案獲得的贓珠寶：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?) Not\. per day$/i, m => `每天的惡名：${m[1]}`],
        [/^(\d+(?:[.,]\d+)?[KMBT]?)\s*\/\s*(\d+(?:[.,]\d+)?[KMBT]?)\s+HP$/i, m => `生命值：${m[1]}/${m[2]}`],
        [/^(\d+) Days?$/i, m => `${m[1]} 天`],
        [/^A SWAT Team will try raid you if your criminality is at least (\d+)$/i, m => `如果你的犯罪程度至少為 ${m[1]}，特警隊將嘗試突襲你`],
        [/^Dry, slowing down growth by (\d+(?:[.,]\d+)?)%$/i, m => `乾燥，使生長速度減慢 ${m[1]}%`],
        [/^(Growth|Wetness):\s*(\d+(?:[.,]\d+)?)%$/i, m => `${m[1].toLowerCase() === "growth" ? "生長進度" : "濕潤度"}：${m[2]}%`],
        [/^Sell Stolen Jewels for x(\d+(?:[.,]\d+)?) more$/i, m => `以 ×${m[1]} 的價格出售偷來的珠寶`],
        [/^Too high Criminal Status \(Max (\d+)\)$/i, m => `罪犯狀態過高（上限 ${m[1]}）`],
        [/^Win and gain ([+-]\d+(?:[.,]\d+)?)% global notoriety\. Lose and lose all notoriety and gang members\.$/i, m => `獲勝並獲得 ${m[1]}% 全域惡名。失敗則失去所有惡名與幫派成員。`],
        [/^x(\d+(?:[.,]\d+)?) Money gained from Store Robbery$/i, m => `商店搶劫獲得的金錢 ×${m[1]}`],
        // 舊詞庫中的變動數值文案；「2 For 1 Sale」等道具固有名稱不拆成數值規則。
        [/^([+-])(\d+(?:[.,]\d+)?)%\s+chance to get Stolen Goods when Shoplifting$/i, m => `商店行竊時獲得贓物的機率${m[1] === '+' ? '增加' : '減少'} ${m[2]}%`],
        [/^Lose\s+(\d+(?:[.,]\d+)?)%\s+of your money$/i, m => `失去你 ${m[1]}% 的金錢`],
        [/^Able to bribe cops if Criminal status is\s+(\d+)$/i, m => `若罪犯狀態為 ${m[1]}，便能賄賂警察`],
        [/^Lose\s+(\d+(?:[.,]\d+)?)%\s+less total money when Busted$/i, m => `被逮捕時，損失的總金錢減少 ${m[1]}%`],
        [/^Rituals cost\s+(\d+(?:[.,]\d+)?)%\s+of your Souls to cast \(Min\s+(\d+)\s+Souls\)$/i, m => `施放儀式需消耗你 ${m[1]}% 的靈魂（最低 ${m[2]} 個靈魂）`],
        [/^You may encounter The Devil if your sin is at least\s+(\d+)$/i, m => `如果你的罪孽至少為 ${m[1]}，就可能遇見魔鬼`],
        // 幫派、搶劫、賄賂與犯罪效果：數值、等級或倍率改變時仍可重用。
        [/^([+-]\d+(?:[.,]\d+)?)\s+Bribe Level$/i, m => `賄賂等級：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Money Synergy$/i, m => `金錢協同增益：${m[1]}%`],
        [/^([+-]\d+)\s+Gang Members needed and ([+-]\d+)\s+Notoriety from Robbery$/i, m => `搶劫所需幫派成員 ${m[1]}，搶劫獲得的惡名 ${m[2]}`],
        [/^Additional\s+([+-]\d+(?:[.,]\d+)?)%\s+Money while sinner$/i, m => `處於罪人狀態時，金錢額外 ${m[1]}%`],
        [/^Gang\s+Lv\.\s*(\d+)$/i, m => `幫派等級 ${m[1]}`],
        [/^Store Robbery\s*\(\s*(\d+)\s*\)$/i, m => `商店搶劫（${m[1]}）`],
        [/^Reduce Graffiti Crime penalty and max penalty by\s+(\d+)$/i, m => `將塗鴉的犯罪懲罰及懲罰上限降低 ${m[1]}`],
        [/^You need a minimum of\s+(\d+)\s+Gang Members$/i, m => `你至少需要 ${m[1]} 名幫派成員`],
        [/^You upgraded your Gang to Level\s+(\d+)$/i, m => `你將幫派升級到了等級 ${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Money From Robbery$/i, m => `搶劫獲得的金錢 ×${m[1]}`],
        // 第八批：幫派成員、生命值與成員上限。統一處理所有數值。
        [/^([+-]\s*\d+(?:[.,]\d+)?)\s+HP Regen$/i, m => `生命值恢復：${m[1].replace(/\s+/g, '')}`],
        [/^([+-]\s*\d+)\s+Max Members$/i, m => `成員上限：${m[1].replace(/\s+/g, '')}`],
        [/^([+-]\s*\d+)\s+Max HP$/i, m => `生命值上限：${m[1].replace(/\s+/g, '')}`],
        [/^([+-]?\s*\d+(?:[.,]\d+)?)\s+Gang Members?$/i, m => `${m[1].replace(/\s+/g, '')} 名幫派成員`],
        // 第七批：新增動態百分比與劫案策劃加成。
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Money while sinner$/i, m => `處於罪人狀態時，金錢：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)\s+Jewelry(?: Store)? Heist Plan Speed$/i, m => `珠寶店劫案策劃速度：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Ritual Power$/i, m => `儀式威力：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Pickpocket Jewels chance$/i, m => `扒竊珠寶的機率：${m[1]}%`],
        // 第六批：邪教、獻祭、劫案進度與可變化的數值。
        [/^\(\+?(\d+)\s+Souls per Sacrifice\/Altar\)$/i, m => `（每座祭壇每次獻祭獲得的靈魂 +${m[1]}）`],
        [/^\(-\$([\d,.]+)\s+per day\/Altar\)$/i, m => `（每座祭壇每天的金錢 -$${m[1]}）`],
        [/^([+-]\d+)\s+Souls per Sacrifice$/i, m => `每次獻祭獲得的靈魂：${m[1]}`],
        [/^([+-]\d+)\s+base Souls from sacrifices$/i, m => `獻祭獲得的基礎靈魂：${m[1]}`],
        [/^([+-]\d+)\s+Stolen Jewels(?:\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\))?$/i, m => `偷來的珠寶：${m[1]}${m[2] !== undefined ? `（${m[2]}%）` : ""}`],
        [/^([+-]?\d+)\s+Stolen Jewels(?:\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\))?$/i, m => `偷來的珠寶：${m[1]}${m[2] !== undefined ? `（${m[2]}%）` : ""}`],
        [/^([+-]\d+)\s+Jewelry Heist Planning Progress$/i, m => `珠寶劫案策劃進度：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)?)\s+progress$/i, m => `進度：${m[1]}`],
        [/^-\$([\d,.]+)\s+per day$/i, m => `每日金錢：-$${m[1]}`],
        [/^([+-]\d+)\s+Sinner penalty when Sacrificing$/i, m => `獻祭時的罪人懲罰：${m[1]}`],
        [/^([+-]?\d+(?:[.,]\d+)*)\s+Souls$/i, m => `靈魂：${m[1]}`],
        [/^(\d+(?:[.,]\d+)?)%\s+chance of getting busted$/i, m => `被逮捕的機率：${m[1]}%`],
        [/^(Activate|Deactivate|Activates|Deactivates)\s+(\d+|all)\s+(Altars?|Cultist Training Grounds?|Blood Pools?|Shrines?)$/i, m => `${m[1].toLowerCase().startsWith("activate") ? "啟用" : "停用"}${m[2].toLowerCase() === "all" ? "全部" : ` ${m[2]} 座`}${({altar: "祭壇", "cultist training ground": "邪教徒訓練場", "blood pool": "血池", shrine: "神龕"})[m[3].toLowerCase().replace(/s$/, '')]}`],
        [/^Heist\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\)$/i, m => `劫案（${m[1]}%）`],
        [/^Plan Heist\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)$/i, m => `策劃劫案（${m[1]}/${m[2]}）`],
        [/^Sinner:\s*([+-]?\d+(?:[.,]\d+)?)$/i, m => `罪人：${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Base Souls from Sacrifice$/i, m => `獻祭獲得的基礎靈魂 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Notoriety from Graffiti$/i, m => `塗鴉獲得的惡名 ×${m[1]}`],
        [/^x(\d+(?:[.,]\d+)?)\s+Money Rewards$/i, m => `金錢獎勵 ×${m[1]}`],
        // 共用金錢獎勵倍率格式，不依固定倍率建立重複詞條。
        [/^x(\d+(?:[.,]\d+)*)\s+(Shoplift|Mugging|Pickpocket)\s+Money rewards?$/i, m => `${({shoplift: '商店行竊', mugging: '搶劫', pickpocket: '扒竊'})[m[2].toLowerCase()]}金錢獎勵 ×${m[1]}`],
        // 裝備加成、機率、數量與搶劫獎勵的動態格式。
        [/^([+-]\d+)\s+Gang Members\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\)$/i, m => `幫派成員：${m[1]}（${m[2]}%）`],
        [/^([+-]\d+)\s+Stolen Goods from Shoplifting$/i, m => `商店行竊獲得的贓物：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Chance to pickpocket Stolen Jewels$/i, m => `扒竊贓珠寶的機率：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Recruit Shady Stranger chance$/i, m => `招募可疑陌生人的機率：${m[1]}%`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+chance (?:to shoplift items|of shoplifting item)$/i, m => `商店行竊時偷到物品的機率：${m[1]}%`],
        [/^([+-]\d+)\s+Stolen Goods capacity$/i, m => `贓物容量：${m[1]}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+Sale Prices$/i, m => `出售價格：${m[1]}%`],
        [/^([+-]\d+)\s+Jewelry Heist planning progress speed$/i, m => `珠寶劫案策劃進度速度：${m[1]}`],
        [/^([+-]\d+)\s+Notoriety when talking with shady strangers$/i, m => `與可疑陌生人交談時的惡名：${m[1]}`],
        [/^([+-]\d+)\s+Max Stolen Jewels$/i, m => `贓珠寶持有上限：${m[1]}`],
        [/^Pickpocket\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\)$/i, m => `扒竊（${m[1]}%）`],
        [/^x(\d+(?:[.,]\d+)?)\s+Money from Mugging$/i, m => `搶劫獲得的金錢 ×${m[1]}`],
        [/^([+-]?\d+(?:[,.]\d+)*)\s+Stolen Goods(?:\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\))?$/i, m => `${m[1]} 件贓物${m[2] ? `（${m[2]}%）` : ''}`],
        [/^([+-]\d+(?:[.,]\d+)?)%\s+chance to recruit Shady Strangers$/i, m => `招募可疑的陌生人的機率：${m[1]}%`],
        [/^Try Recruit\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\)$/i, m => `嘗試招募（${m[1]}%）`],
        [/^x(\d+(?:[.,]\d+)?)\s+Mugging Reward$/i, m => `搶劫獎勵 ×${m[1]}`],
        [/^Shoplift\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\)$/i, m => `商店行竊（${m[1]}%）`],
        [/^已購買(升級|裝備)「(.+)」！$/u, m => `已購買${m[1]}「${translateItemName(m[2])}」！`],
        [/^([+-]?\d+(?:[,.]\d+)*)\s+Not\.$/i, m => `惡名：${m[1]}`],
        [/^\[D(\d+)\s+Y(\d+)\](:?)$/i, m => `［第 ${m[1]} 天／第 ${m[2]} 年］${m[3] ? '：' : ''}`],
        [/^\(Max:\s*([\d,.]+)\)$/i, m => `（上限：${m[1]}）`],
        [/^(\d+)\s+days?\s+remaining$/i, m => `剩餘 ${m[1]} 天`],
        [/^Hotkey:\s*(\S+)$/i, m => `快捷鍵：${m[1]}`],
        [/^Criminal:\s*([+-]?\d+(?:[,.]\d+)*)$/i, m => `罪犯：${m[1]}`],
        [/^Pickpocket has\s+(\d+)\s+Crime Penalty$/i, m => `扒竊的犯罪懲罰為 ${m[1]}`],
        [/^Purchased (Upgrade|Equipment) (['\"])(.+)\2!$/i, m => `已購買${m[1].toLowerCase() === 'equipment' ? '裝備' : '升級'}「${translateItemName(m[3])}」！`],
        [/^Day\s+(\d+)$/i, m => `第 ${m[1]} 天`],
        [/^Level\s+(\d+)$/i, m => `等級 ${m[1]}`],
        [/^Day\s*:\s*(\d+)$/i, m => `天數：${m[1]}`],
        [/^Money\s*:\s*([$€£]?\s*[\d,.]+)$/i, m => `金錢：${m[1]}`]
    ];

    // 技術驗證標記與版本號不得翻譯，也不應加入待翻譯清單。
    // 匯出時出現的兩筆殘句：
    // "Purchased Upgrade 'Experienced Pick"、"Pocketer'!"
    // 尚不能確定其文字節點切分方式，不拆開翻譯，以免破壞介面詞序。

    // 整句與 DOM 拆句共用同一套辨識與輸出。
    const COMPOSITE_EVENT_RULES = [
        {
            // 裝載魚叉通知中，正負號與魚叉數目、價格可能被切成不同文字節點。
            pattern:/^You load\s*([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Harpoons?\s+onto your ship for\s*([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Doubloons?$/i,
            render:m=>'你裝載 '+m[1]+' 支魚叉到船上，花費 '+m[2]+' 枚杜布隆金幣',
            terms:()=>[
                [/^You load\s*/i,'你裝載 '],
                [/\s+Harpoons?\s+onto your ship for\s*/i,' 支魚叉到船上，花費 '],
                [/\s+Doubloons?$/i,' 枚杜布隆金幣']
            ]
        },
        {
            // 牽制中的登艦攻擊保留被拆分的正負號、傷害數值和倍率。
            pattern:/^Your crew swings on board the Navy Ship, dealing\s+([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+DMG\s+\(Tethered\s+x(\d+(?:[.,]\d+)?)!\)$/i,
            render:m=>'你的船員盪上海軍艦艇，造成 '+m[1]+' 點傷害（牽制 ×'+m[2]+'！）',
            terms:m=>[
                [/^Your crew swings on board the Navy Ship, dealing\s+/i,'你的船員盪上海軍艦艇，造成 '],
                [/\s+DMG(?=\s+\(Tethered\s+x\d+(?:[.,]\d+)?!\)$)/i,' 點傷害'],
                [/\s+\(Tethered\s+x\d+(?:[.,]\d+)?!\)$/i,'（牽制 ×'+m[2]+'！）']
            ]
        },
        {
            // 犯罪現場名片事件中，正號、縮寫數值與惡名單位可能在不同節點。
            pattern:/^(You leave your calling card at the scene of the crime\.\.\.)\s+([+-]\d+(?:[.,]\d+)?[KMBT]?)\s+Not\.$/i,
            render:m=>lookup(m[1])+' '+m[2]+' 惡名',
            terms:m=>[
                [/^You leave your calling card at the scene of the crime\.\.\./i,lookup(m[1])],
                [/\s+Not\.$/i,' 惡名']
            ]
        },
        {
            // 沉船的木材損傷可分開顯示傷害數字及 DMG。
            pattern:/^Jagged timbers tear into your hull as you pull away, dealing\s+(\d+(?:[.,]\d+)?[KMBT]?)\s+DMG$/i,
            render:m=>'當你駛離時，尖銳的木材撕裂你的船殼，造成 '+m[1]+' 點傷害',
            terms:()=>[
                [/^Jagged timbers tear into your hull as you pull away, dealing\s+/i,'當你駛離時，尖銳的木材撕裂你的船殼，造成 '],
                [/\s+DMG$/i,' 點傷害']
            ]
        },
        {
            // 拾取物資時，正號、數量與 Supplies 可能分屬不同節點。
            pattern:/^Your crew picks through the wreckage and hauls aboard\s+([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Supplies$/i,
            render:m=>'你的船員翻找殘骸，將 '+m[1]+' 份補給品搬上船',
            terms:()=>[
                [/^Your crew picks through the wreckage and hauls aboard\s*/i,'你的船員翻找殘骸，將 '],
                [/\s+Supplies$/i,' 份補給品搬上船']
            ]
        },
        {
            // v0.4.19：古物名稱內可含撇號（例如 Monarch's Ring），以最末引號定位名稱結尾。
            // 跨文字節點時僅改寫必要片段，不破壞日期與古物名稱所在節點。
            pattern:/^You heist the museum's artifact collection, stealing a piece of '(.{1,100})'$/i,
            render:m=>'你洗劫博物館的古物收藏，偷走了一塊「'+translateItemName(m[1])+'」的碎片',
            terms:m=>[
                [/^You heist the museum's artifact collection, stealing a piece of '/i,'你洗劫博物館的古物收藏，偷走了一塊「'],
                [/^.{1,100}(?='$)/u,translateItemName(m[1])],
                [/'$/,'」的碎片']
            ]
        },
        {
            // 下一批貨物的剩餘天數可能分成標籤、數字及單位。
            pattern:/^Next Shipment in\s+(\d+(?:[.,]\d+)?)\s+Days?$/i,
            render:m=>'距離下一批貨物抵達還有 '+m[1]+' 天',
            terms:()=>[[/^Next Shipment in\s+/i,'距離下一批貨物抵達還有 '],[/\s+Days?$/i,' 天']]
        },
        {
            // 火車目的地直接沿用詞庫，避免為遭遇機率地點逐條建立固定完整句。
            pattern:/^You ride the train and arrive at '([^']{1,100})'$/i,
            render:m=>'你搭乘火車，抵達「'+translateItemName(m[1])+'」',
            terms:m=>[
                [/^You ride the train and arrive at '/i,'你搭乘火車，抵達「'],
                [/^[^']{1,100}(?='$)/,translateItemName(m[1])],
                [/'$/,'」']
            ]
        },
        {
            // 完整火車乘客搶劫通知：金錢數值可位於獨立粗體節點。
            pattern:/^(Under your command, your gang strips the train's passengers of their wealth!)\s+([+-]?\$[\d,.]+[KMBT]?)$/i,
            render:m=>lookup(m[1])+' '+m[2],
            terms:m=>[[/^Under your command, your gang strips the train's passengers of their wealth!/i,lookup(m[1])]]
        },
        {
            // 商船購買事件中，正負號與物資數值可以分開存放。
            pattern:/^You trade with the vessel, buying\s*([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Stolen Goods\s+for\s*([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Doubloons$/i,
            render:m=>'你與商船交易，購買 '+m[1]+' 件贓物，支付 '+m[2]+' 枚杜布隆金幣',
            terms:()=>[
                [/^You trade with the vessel, buying\s*/i,'你與商船交易，購買 '],
                [/\s+Stolen Goods(?=\s+for\s+[+-]?\d+(?:[.,]\d+)?[KMBT]?\s+Doubloons$)/i,' 件贓物'],
                [/\s+for\s+/i,'，支付 '],
                [/\s+Doubloons$/i,' 枚杜布隆金幣']
            ]
        },
        {
            pattern:/^(You've deciphered the route to a cache of hidden treasure!)\s+([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Treasure Maps?$/i,
            render:m=>lookup(m[1])+' '+m[2]+' 張藏寶圖',
            terms:m=>[
                [/^You've deciphered the route to a cache of hidden treasure!/i,lookup(m[1])],
                [/\s+Treasure Maps?$/i,' 張藏寶圖']
            ]
        },
        {
            pattern:/^Your Warehouse shipment of\s*([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Stolen Goods\s+arrives!$/i,
            render:m=>'你的倉庫貨運，包含 '+m[1]+' 件贓物，已送達！',
            terms:()=>[
                [/^Your Warehouse shipment of\s*/i,'你的倉庫貨運，包含 '],
                [/\s+Stolen Goods(?=\s+arrives!$)/i,' 件贓物'],
                [/\s+arrives!$/i,'，已送達！']
            ]
        },
        {
            // v0.4.17：單段句子和獨立進度節點共用同一譯文，不改變進度節點。
            pattern:/^(You continue making detailed heist preparations\.\.\.|You continue to decipher cryptic symbols and pirate texts\.\.\.)\s+(\(\s*\d+(?:[.,]\d+)?\s*\/\s*\d+(?:[.,]\d+)?\s*\))$/i,
            render:m=>lookup(m[1])+' '+m[2],
            terms:m=>[[/^You continue (?:making detailed heist preparations|to decipher cryptic symbols and pirate texts)\.\.\./i,lookup(m[1])]]
        },
        {
            // v0.4.15：寵物購買通知兼容完整句與拆分的名稱、負號和價格。
            pattern:/^You purchase the exotic pet\s+'([^']{1,80})'\s+for\s+([+-]?\$[\d,.]+[KMBT]?)\.?$/i,
            render:m=>'你購買了異國寵物「'+translateItemName(m[1])+'」，花費 '+m[2],
            terms:m=>[
                [/^You purchase the exotic pet\s+'/i,'你購買了異國寵物「'],
                [/^[^']+(?='\s+for\s+)/i,translateItemName(m[1])],
                [/^'\s+for\s+/i,'」，花費 ']
            ]
        },
        {
            // v0.4.11：同時涵蓋整句、原始跨節點文字及珠寶數值先被獨立翻譯的混合句。
            // 原始拼字 burried 不更改，以維持遊戲事件比對。
            pattern:/^(?:You strike a burried treasure chest, containing|你挖到一個埋藏的寶箱，裡面有)\s+(\+?\d+(?:[.,]\d+)?)\s+(?:Doubloons and|枚杜布隆金幣及)\s+(\+(?:\d+(?:[.,]\d+)?\s+Stolen Jewels|偷來的珠寶：\d+(?:[.,]\d+)?))!$/i,
            render:m=>'你挖到一個埋藏的寶箱，裡面有 '+m[1]+' 枚杜布隆金幣及 '+(m[2].includes('偷來的珠寶：')? '+'+m[2].split('：')[1]:m[2].replace(/\s+Stolen Jewels$/i,''))+' 件偷來的珠寶！',
            terms:m=>{
                const edits=[];
                if(/^You strike/i.test(m[0]))edits.push([/^You strike a burried treasure chest, containing\s+/i,'你挖到一個埋藏的寶箱，裡面有 ']);
                if(/Doubloons and/i.test(m[0]))edits.push([/\s+Doubloons and\s+/i,' 枚杜布隆金幣及 ']);
                if(/偷來的珠寶：/.test(m[0])) {
                    edits.push([/偷來的珠寶：/,'']);
                    edits.push([/!$/,' 件偷來的珠寶！']);
                } else {
                    edits.push([/\s+Stolen Jewels(?=!$)/i,' 件偷來的珠寶']);
                    edits.push([/!$/,'！']);
                }
                return edits;
            }
        },
        {
            // 數值若位於粗體節點，保留原有 DOM 與百分比。
            pattern:/^([+-]\d+(?:[.,]\d+)?)%\s+(Mugging, Robbery, and Casino Robbery Money|Pickpocket and Shoplift Money|Research Speed|Sell Prices|Global Money)$/i,
            render:m=>m[1]+'% '+BONUS_LABELS_049[m[2].toLowerCase()],
            terms:m=>[[/\s+(?:Mugging, Robbery, and Casino Robbery Money|Pickpocket and Shoplift Money|Research Speed|Sell Prices|Global Money)$/i,' '+BONUS_LABELS_049[m[2].toLowerCase()]]]
        },
        {
            // 天數及結束時間可能分散在不同文字節點。
            pattern:/^Ending in\s+(\d+)\s+Days?$/i,
            render:m=>'將於 '+m[1]+' 天後結束',
            terms:()=>[[/^Ending in\s+/i,'將於 '],[/\s+Days?$/i,' 天後結束']]
        },
        {
            // 寵物名稱及等級可能被包在不同文字節點中，保留數字的既有格式。
            pattern:/^([A-Za-z][A-Za-z' -]{0,64})\s+reached level\s+(\d+)!$/i,
            render:m=>translateItemName(m[1].trim())+'升至等級 '+m[2]+'！',
            terms:m=>[[/^[A-Za-z][A-Za-z' -]{0,64}(?=\s+reached level\s+\d+!$)/i,translateItemName(m[1].trim())],[/\s+reached level\s+/i,'升至等級 '],[/!$/,'！']]
        },
        {
            // 經驗值進度可能拆在多個文字節點；只替換 EXP，保留數值與分隔位置。
            pattern:/^(\d+(?:[.,]\d+)?[KMBT]?)\s*\/\s*(\d+(?:[.,]\d+)?[KMBT]?)\s+EXP$/i,
            render:m=>m[1]+'/'+m[2]+' 經驗值',
            terms:()=>[[/\s+EXP$/i,' 經驗值']]
        },
        {
            // 支援 Spend 後接的可變契約數，保留數字的粗體節點。
            pattern:/^Spend\s+(\d+)\s+more pacts? and be reborn\.$/i,
            render:m=>'花費 ' + m[1] + ' 項額外契約並重生。',
            terms:()=>[[/^Spend\s+/i,'花費 '],[/\s+more pacts? and be reborn\.$/i,' 項額外契約並重生。']]
        },
        {
            // 契約數可能在強調節點中，維持數字與原節點不變。
            pattern:/^Select\s+(\d+)\s+more pacts? and be reborn\.$/i,
            render:m=>'再選擇 ' + m[1] + ' 項契約並重生。',
            terms:()=>[[/^Select\s+/i,'再選擇 '],[/\s+more pacts? and be reborn\.$/i,' 項契約並重生。']]
        },
        {
            // 研究名稱可能跨文字節點，保留名稱所在標記。
            pattern:/^Your researches have finished researching\s+(['"])([^'"]{1,100})\1!$/i,
            render:m=>'你的研究已完成「' + translateItemName(m[2]) + '」項目的研究！',
            terms:m=>[[/^Your researches have finished researching\s+['"]/i,'你的研究已完成「'],[/^[^'"]{1,100}(?=['"]!$)/i,translateItemName(m[2])],[/['"]!$/i,'」項目的研究！']]
        },
        {
            pattern:/^You load\s+(\d+(?:[.,]\d+)?)\s+Cannonballs?\s+onto your ship for\s+([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Doubloons?$/i,
            render:m=>'你裝載 '+m[1]+' 發砲彈到你的船上，花費 '+m[2]+' 枚杜布隆金幣',
            terms:()=>[[/You load/i,'你裝載'],[/Cannonballs?\s+onto your ship for/i,'發砲彈到你的船上，花費'],[/Doubloons?/i,'枚杜布隆金幣']]
        },
        {
            pattern:/^You offer\s+(\d+(?:[.,]\d+)?)\s+(Pistols|Submachine Guns)\s+for\s+([+-]?\d+(?:[.,]\d+)?[KMBT]?)\s+Doubloons?$/i,
            render:m=>'你提供 '+m[1]+' 把'+translateItemName(m[2])+'以換取 '+m[3]+' 枚杜布隆金幣',
            terms:m=>[[/You offer/i,'你提供'],[/(?:Pistols|Submachine Guns)\s+for/i,'把'+translateItemName(m[2])+'以換取'],[/Doubloons?/i,'枚杜布隆金幣']]
        },
        {
            pattern:/^You offer\s+(\d+(?:[.,]\d+)?)\s+Souls?\s+and in return an Undead Minion is promised to work for you$/i,
            render:m=>'你提供 '+m[1]+' 個靈魂，而作為回報，承諾會有一名亡靈僕從為你效力',
            terms:()=>[[/You offer/i,'你提供'],[/Souls?\s+/i,'個靈魂，'],[/and in return an Undead Minion is promised to work for you/i,'而作為回報，承諾會有一名亡靈僕從為你效力']]
        },
        {
            pattern:/^The Navy Ship rams against your ship,\s*dealing\s+([+-]?\d+(?:[.,]\d+)?)\s+DMG$/i,
            render:m=>'海軍艦艇撞上你的船，造成 '+m[1]+' 點傷害',
            terms:()=>[[/The Navy Ship rams against your ship,\s*dealing/i,'海軍艦艇撞上你的船，造成'],[/\bDMG\b/i,'點傷害']]
        },
        {
            pattern:/^You spend\s+(\d+(?:[.,]\d+)?[KMBT]?)\s+Doubloons?\s+to hire a new crewmate on board$/i,
            render:m=>'你花費 '+m[1]+' 枚杜布隆金幣，雇用一名新船員登船',
            terms:()=>[[/You spend/i,'你花費'],[/Doubloons?\s+to hire a new crewmate on board/i,'枚杜布隆金幣，雇用一名新船員登船']]
        },
        {
            pattern:/^You continue planning intricate heist strategies\.\.\.\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)$/i,
            render:m=>'你持續規劃精密的劫案策略……（'+m[1]+'/'+m[2]+'）',
            terms:()=>[[/You continue planning intricate heist strategies\.\.\.\s*\(/i,'你持續規劃精密的劫案策略……（'],[/\)/,'）']]
        },
        {
            // 可能由不同 DOM 節點構成，中央的名稱或能力保持原節點與格式。
            pattern:/^The power of\s+(.{1,100}?)\s+seduces a new Follower to join your cult!$/i,
            render:m=>'「' + translateItemName(m[1]) + '」的力量吸引了一名新追隨者加入你的邪教！',
            terms:m=>[[/The power of\s+/i,'「'],[/^.{1,100}?(?=\s+seduces a new Follower to join your cult!$)/i,translateItemName(m[1])],[/\s+seduces a new Follower to join your cult!$/i,'」的力量吸引了一名新追隨者加入你的邪教！']]
        },
        {
            pattern:/^Can smuggle max\s+(\d+(?:[.,]\d+)?)\s+Drugs at a time$/i,
            render:m=>'每次最多可走私 ' + m[1] + ' 份毒品',
            terms:()=>[[/Can smuggle max\s+/i,'每次最多可走私 '],[/\s+Drugs at a time$/i,' 份毒品']]
        },
        {
            pattern:/^You gamble\s+([$₵]?\d+(?:[.,]\d+)?[KMBT]?)\s+but manage to win back\s+([$₵]?\d+(?:[.,]\d+)?[KMBT]?)$/i,
            render:m=>'你賭上 ' + m[1] + '，但設法贏回 ' + m[2],
            terms:()=>[[/You gamble\s+/i,'你賭上 '],[/\s+but manage to win back\s+/i,'，但設法贏回 ']]
        },
        {
            pattern:/^You smuggle your\s+(\d+(?:[.,]\d+)?)\s+(Drugs|Stolen Goods)\s+at the port and set off again,\s*earning you\s+([$₵]?\d+(?:[.,]\d+)?[KMBT]?)(?:\s+(Money|Doubloons))?$/i,
            render:m=>'你在港口走私了 ' + m[1] + (m[2].toLowerCase()==='drugs'?' 份毒品':' 件贓物') + '，然後再次啟航，獲得 ' + m[3] + (m[4] ? (m[4].toLowerCase()==='money'?' 金錢':' 枚杜布隆金幣') : ''),
            terms:m=>[
                [/You smuggle your\s+/i,'你在港口走私了 '],
                [/\s+(?:Drugs|Stolen Goods)\s+at the port and set off again,\s*earning you\s+/i,(m[2].toLowerCase()==='drugs'?' 份毒品':' 件贓物') + '，然後再次啟航，獲得 '],
                ...(m[4] ? [[/\s+(?:Money|Doubloons)$/i,m[4].toLowerCase()==='money'?' 金錢':' 枚杜布隆金幣']] : [])
            ]
        },
        {
            // 同時支援完整字串與「(+1 R.P」「/Employee)」拆分的文字節點。
            pattern:/^\(\s*([+-]\d+(?:[.,]\d+)?)\s+R\.P\.?\s*\/\s*Employee\s*\)$/i,
            render:m=>'（' + m[1] + ' 研究點數／員工）',
            terms:()=>[[/^\(\s*/,'（'],[/\s+R\.P\.?\s*\/\s*Employee\s*\)$/i,' 研究點數／員工）']]
        },
    ];

    const NONTRANSLATABLE = [
        // v0.4.22：已翻譯的惡名數值包含 K/M/B/T 時，無需再次收集。
        /^[+-]?\d+(?:[.,]\d+)?[KMBT]?\s+惡名$/iu,
        // 進度顯示中的 K/M/B/T 為數量縮寫，不應收錄為英文待翻譯文字。
        /^\d+(?:[.,]\d+)?[KMBT]?\s*\/\s*\d+(?:[.,]\d+)?[KMBT]?$/i,
        // v0.4.17：只有金額與百分比的顯示值，K 等數量縮寫不代表未翻譯英文。
        /^[+-]?\$[\d,.]+[KMBT]?\s*\(\s*\d+(?:[.,]\d+)?%\s*\)$/i,
        // v0.4.16：中文生命值與補給品後方的 K/M/B/T 是單位，不是待翻譯英文。
        /^生命值：[+-]?\d+(?:[.,]\d+)?[KMBT]?\s*\/\s*[+-]?\d+(?:[.,]\d+)?[KMBT]?$/iu,
        /^補給品：[+-]?\d+(?:[.,]\d+)?[KMBT]?$/iu,
        // v0.4.15：已中文化的經驗值數字仍含 K/M/B/T，不能重新列為未翻譯英文。
        /^\d+(?:[.,]\d+)?[KMBT]?\s*\/\s*\d+(?:[.,]\d+)?[KMBT]?\s+經驗值$/iu,
        /^\$\d+(?:[.,]\d+)?[KMBT]?\s*\/\s*\$\d+(?:[.,]\d+)?[KMBT]?$/i, // 純金額進度，保留數值與單位，無需翻譯
        /^[+-]?₵\d+(?:[.,]\d+)?[KMBT]?$/i, // 純金額值，不翻譯或當成待翻譯詞彙
        /^杜布隆金幣：[+-]?\d+(?:[.,]\d+)?[KMBT]$/i, // 已翻譯的金幣縮寫
        /^\d+(?:[.,]\d+)?[KMBT]$/i, // 單純數量縮寫（例如 1.1K），不是英文詞彙
        /^[+-]?\$\d+(?:[.,]\d+)?[kKmMbBtT]?$/, // 單純價格，不要將金額縮寫 K 當成英文
        /^Purchased (?:Upgrade|Equipment) ['"][^'"]+$/i, // 購買通知的前段殘句；合併處理完整節點
        /^(?:Pocketer|gy)['"]!$/i, // 已觀察到的購買通知末段殘句
        /^惡名：[+-]?\d+(?:[.,]\d+)?[KMBT]$/i, // 數量縮寫保留英文單位，避免重複收集
        /^for$/i, // 只在已確認的商船交易上下文轉換成「換取」
        /^conveyor_belt$/i,
        /^groups$/i, // 圖示識別字
        /^moving$/i, // 圖示識別字
        /^gun$/i, // 疑似圖示識別字，避免像 settings 一樣被誤翻譯
        /^diamond$/i, // Material Symbols 圖示名稱，不應翻譯成文字
        /^x\d+(?:[.,]\d+)?$/i,
        /^快捷鍵：\S+$/u,
        /^\[incrementaldb_verification:\s*[^\]]+\]$/i,
        /^v\.\s*\d+(?:\.\d+)+$/i
    ];

    const getObject = key => {
        try {
            const data = GM_getValue(key, {});
            return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
        } catch {
            return {};
        }
    };

    // 既有中文化文字若仍含有英文字母，不應再被當成未翻譯原文收集。
    const translatedBuiltin = new Set(Object.values(BUILTIN));
    const custom = getObject('ur_zh_tw_custom');
    const unseen = getObject('ur_zh_tw_untranslated');
    const translatedCustom = new Set(Object.values(custom).filter(value => typeof value === 'string' && value));
    const pending = new Set();
    let translationScheduled = false;
    const MAX_CAPTURE = 3000;

    function lookup(text) {
        if (NONTRANSLATABLE.some(pattern => pattern.test(text))) return text;
        if (translatedBuiltin.has(text) || translatedCustom.has(text)) return text;
        if (Object.prototype.hasOwnProperty.call(custom, text) && typeof custom[text] === 'string' && custom[text]) {
            return custom[text];
        }
        if (Object.prototype.hasOwnProperty.call(BUILTIN, text)) {
            return BUILTIN[text];
        }
        for (const item of COMPOSITE_EVENT_RULES) {
            const match=text.match(item.pattern);
            if(match)return item.render(match);
        }
        for (const [pattern, formatter] of DYNAMIC) {
            const match = text.match(pattern);
            if (match) return formatter(match);
        }
        // 當標籤只有結尾冒號不同時，沿用既有的完整詞彙翻譯。
        const colonLabel = text.match(/^([^:：]+)[:：]$/u);
        if (colonLabel) {
            const base = colonLabel[1].trim();
            const translated = lookup(base);
            if (translated !== null && translated !== base) return translated.replace(/[:：]$/u, '') + '：';
        }
        return null;
    }

    // 立即寫入 Tampermonkey 儲存空間，避免玩家在 1.5 秒內重新整理或離開時遺失紀錄。
    // 使用固定鍵名，不覆蓋先前版本已累積的待翻譯文字。
    function saveUntranslatedNow() {
        GM_setValue('ur_zh_tw_untranslated', unseen);
    }

    function recordUntranslated(text) {
        if (
            text.length > 240 ||
            text.length < 2 ||
            !/[A-Za-z]/.test(text) ||
            Object.prototype.hasOwnProperty.call(unseen, text) ||
            Object.keys(unseen).length >= MAX_CAPTURE
        ) return;
        unseen[text] = '';
        saveUntranslatedNow();
    }

    function translateItemName(name) {
        const translated = lookup(name);
        if (translated !== null) return translated;
        recordUntranslated(name);
        return name;
    }

    function translateString(raw) {
        if (typeof raw !== 'string' || !/[A-Za-z]/.test(raw)) return raw;
        const core = raw.trim();
        if (!core) return raw;
        const replacement = lookup(core);
        if (replacement === null) {
            recordUntranslated(core);
            return raw;
        }
        if (core === replacement) return raw;
        const leading = raw.match(/^\s*/u)[0];
        const trailing = raw.match(/\s*$/u)[0];
        return leading + replacement + trailing;
    }

    // Material Icons / Symbols 以文字（例如 settings）作為圖示字型的連字名稱。
    // 翻譯此類節點會使齒輪等圖示直接顯示中文字，因此排除整個圖示子樹。
    const SKIP_SELECTOR = [
        'script', 'style', 'noscript', 'code', 'pre', 'textarea', 'svg',
        '[contenteditable=""]', '[contenteditable="true"]', '[data-ur-zh-tw-skip]',
        '.material-icons', '[class*="material-icons-"]',
        '.material-symbols', '[class*="material-symbols-"]',
        'md-icon', 'mat-icon'
    ].join(', ');

    function skipElement(element) {
        if (!(element instanceof Element)) return true;
        return !!element.closest(SKIP_SELECTOR);
    }

    // 兼容未帶標準 class、但由 CSS 指定 Material 圖示字型的元素。
    function usesIconFont(element) {
        if (!(element instanceof Element) || typeof getComputedStyle !== 'function') return false;
        try {
            const family = getComputedStyle(element).fontFamily || '';
            return /material[\s_-]*(?:icons?|symbols?)/i.test(family);
        } catch {
            return false;
        }
    }

    // 遊戲有時將購買通知拆成多個文字節點（例如 Sinner / - / gy）。
    // 僅在整個元素的內容恰好是單一購買通知時合併翻譯，避免碰觸按鈕或遊戲元件。
    function translateGroupedPurchase(element) {
        if (!(element instanceof Element) || skipElement(element)) return false;
        const original = element.textContent;
        if (!original || original.length > 240 || !original.includes('Purchased')) return false;
        if (element.querySelector('button, a, input, textarea, select, [contenteditable]')) return false;
        const normalized = original.replace(/\s+/g, ' ').trim();
        if (!/^Purchased (?:Upgrade|Equipment) (['"])[^'"]+\1!$/i.test(normalized)) return false;
        const tree = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let node;
        while ((node = tree.nextNode())) {
            if (node.nodeValue.trim()) {
                if (skipElement(node.parentElement) || usesIconFont(node.parentElement)) return false;
                nodes.push(node);
                if (nodes.length > 12) return false;
            }
        }
        if (nodes.length < 2) return false;
        const translated = lookup(normalized);
        if (translated === null || translated === normalized) return false;
        nodes[0].nodeValue = translated;
        for (const rest of nodes.slice(1)) rest.nodeValue = '';
        return true;
    }

    // 文字節點單獨更新時，父元素可能才包含完整通知。
    function translateGroupedPurchaseInAncestors(element) {
        for (let depth = 0; element && depth < 4; depth++, element = element.parentElement) {
            if (translateGroupedPurchase(element)) return true;
        }
        return false;
    }

    // 特警隊突襲的訊息可能由日期、文字、粗體金錢與粗體惡名組成。
    // 在保留粗體元素的前提下，將被拆開的負號與惡名欄位恢復成同一數值。
    const SWAT_RAID_FRAGMENT = /(?:The SWAT Team raids your safehouse and supplies|特警隊突襲了你的安全屋與物資)/;
    function normalizeSwatRaidLog(element) {
        if (!(element instanceof Element) || skipElement(element)) return false;
        const text = element.textContent;
        if (!text || text.length > 350 || !SWAT_RAID_FRAGMENT.test(text)) return false;
        const tree = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let current;
        while ((current = tree.nextNode())) {
            if (current.nodeValue.trim()) {
                if (skipElement(current.parentElement) || usesIconFont(current.parentElement)) return false;
                nodes.push(current);
                if (nodes.length > 24) return false;
            }
        }
        const parseNotoriety = value => {
            const match = value.match(/^([+-]?)([\d,.]+(?:[KMBT])?)(?:\s+Not\.|\s*點惡名)$/i)
                || value.match(/^([+-]?)惡名：([\d,.]+(?:[KMBT])?)$/u);
            return match ? {sign: match[1], value: match[2]} : null;
        };
        let updated = false;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const original = node.nodeValue;
            const content = original.trim();
            const notoriety = parseNotoriety(content);
            if (!notoriety) continue;
            const previous = i ? nodes[i - 1] : null;
            const detachedMinus = previous && /^-$/.test(previous.nodeValue.trim());
            if (detachedMinus) {
                previous.nodeValue = previous.nodeValue.replace('-', '');
                updated = true;
            }
            const sign = notoriety.sign || (detachedMinus ? '-' : '');
            const target = `惡名：${sign}${notoriety.value}`;
            const leading = original.match(/^\s*/u)[0];
            const trailing = original.match(/\s*$/u)[0];
            if (content !== target) {
                node.nodeValue = leading + target + trailing;
                updated = true;
            }
        }
        return updated;
    }

    function normalizeSwatRaidLogInAncestors(element) {
        for (let depth = 0; element && depth < 5; depth++, element = element.parentElement) {
            if (normalizeSwatRaidLog(element)) return true;
        }
        return false;
    }

    // 墓園獻祭的成功／失敗紀錄會混合文字與粗體數值。
    // 只辨識一筆完整紀錄，不重排 DOM 元素，以免破壞靈魂與獎勵的粗體。
    const SACRIFICE_LOG_PREFIX = String.raw`(?:\[D\d+\s+Y\d+\](?:\s*[:：])?|［第\s*\d+\s*天／第\s*\d+\s*年］(?:\s*[:：])?)?`;
    const SACRIFICE_SOUL_COUNT = String.raw`(?:靈魂：\s*[\d,.]+|[\d,.]+\s*(?:Souls?|個靈魂))`;
    const SACRIFICE_SUCCESS = new RegExp(
        String.raw`^${SACRIFICE_LOG_PREFIX}\s*(?:You sacrifice|你獻祭了)\s*${SACRIFICE_SOUL_COUNT}\s*(?:and the dead are pleased(?:\.\.\.|…)|而死者們感到滿意…+|，死者們感到滿意…+)\s*[+＋]?\s*\d+\s*(?:Undead Minions?|名亡靈僕從|亡靈僕從)$`, 'i'
    );
    const SACRIFICE_FAILURE = new RegExp(
        String.raw`^${SACRIFICE_LOG_PREFIX}\s*(?:Your petty sacrifice of|你那微不足道的獻祭，獻上了)\s*${SACRIFICE_SOUL_COUNT}\s*(?:simply angers the dead(?:\.\.\.|…)\s*nothing happens|卻只是激怒了死者……什麼也沒發生)[.!。]?$`, 'i'
    );

    function normalizeSacrificeLog(element) {
        if (!(element instanceof Element) || skipElement(element)) return false;
        const original = element.textContent;
        if (!original || original.length > 320) return false;
        const normalized = original.replace(/\s+/g, ' ').trim();
        if (!SACRIFICE_SUCCESS.test(normalized) && !SACRIFICE_FAILURE.test(normalized)) return false;
        if (element.querySelector('button, a, input, textarea, select, [contenteditable]')) return false;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.trim()) {
                if (skipElement(node.parentElement) || usesIconFont(node.parentElement)) return false;
                nodes.push(node);
                if (nodes.length > 24) return false;
            }
        }
        let changed = false;
        for (const item of nodes) {
            const before = item.nodeValue;
            let after = before
                .replace(/Your petty sacrifice of/gi, '你那微不足道的獻祭，獻上了')
                .replace(/You sacrifice/gi, '你獻祭了')
                .replace(/(?:靈魂：\s*([\d,.]+)|([\d,.]+)\s*Souls?)/gi,
                    (_match, zhNumber, enNumber) => `${zhNumber || enNumber} 個靈魂`)
                .replace(/\s*(?:and the dead are pleased(?:\.\.\.|…)|而死者們感到滿意…+)/gi,
                    '，死者們感到滿意……')
                .replace(/\s*(?:simply angers the dead(?:\.\.\.|…)\s*nothing happens|卻只是激怒了死者……什麼也沒發生)/gi,
                    '，卻只是激怒了死者……什麼也沒發生')
                .replace(/([\d,.]+)\s+Undead Minions?/gi, (_match, count) => `${count} 名亡靈僕從`);
            if (after !== before) {
                item.nodeValue = after;
                changed = true;
            }
        }
        return changed;
    }

    function normalizeSacrificeLogInAncestors(element) {
        for (let depth = 0; element && depth < 5; depth++, element = element.parentElement) {
            if (normalizeSacrificeLog(element)) return true;
        }
        return false;
    }

    // 小範圍跨節點文字片段：只合併整個元素恰好符合已知句子片段的情況。
    // 不處理包含粗體、互動控制或圖示的元素，避免破壞數值及原始顯示格式。
    const SPLIT_FRAGMENT = /^(?:You strike a burried treasure chest, containing|\+?\d+(?:[.,]\d+)?\s+Doubloons and|['"][^'"]+['"]\s+deal|to your gang|to erase some of this world's memories of your criminal misdoings|You gamble and win!|You undermine the cop's actions, earning you|Build the|Establish(?: the)?|day remaining|You trade with the vessel, selling|Waters plants in|Resets to|Your crew regroups and reloads, ready to reboard the enemy ship!|You finish replicating a masterpiece\.\.\.|You take your time to forge emaculate fake documents\.\.\.|You stage a vial display of what you and your crew are capable of\.\.\.|The power of|more pacts? and be reborn\.|seduces a new Follower to join your cult!|You load|You offer|The Navy Ship rams against your ship, dealing|and in return an Undead Minion is promised to work for you|\d+(?:[.,]\d+)?\s+Cannonballs?\s+onto your ship for|\d+(?:[.,]\d+)?\s+(?:Pistols|Submachine Guns)\s+for)$/i;
    function normalizeSplitFragment(element) {
        if (!(element instanceof Element) || skipElement(element)) return false;
        if (element.querySelector('button, a, input, textarea, select, strong, b, em, i, svg, [contenteditable]')) return false;
        const phrase = (element.textContent || '').replace(/\s+/g, ' ').trim();
        if (!phrase || phrase.length > 180 || !SPLIT_FRAGMENT.test(phrase)) return false;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.trim()) {
                if (skipElement(node.parentElement) || usesIconFont(node.parentElement)) return false;
                nodes.push(node);
                if (nodes.length > 10) return false;
            }
        }
        if (nodes.length < 2) return false;
        const translation = lookup(phrase);
        if (translation === null || translation === phrase) return false;
        nodes[0].nodeValue = translation;
        for (const rest of nodes.slice(1)) rest.nodeValue = '';
        return true;
    }

    function normalizeSplitFragmentInAncestors(element) {
        for (let depth = 0; element && depth < 4; depth++, element = element.parentElement) {
            if (normalizeSplitFragment(element)) return true;
        }
        return false;
    }

    // 戰鬥記錄可能拆成「敵人 deal」、粗體傷害值和「to your gang」。
    // 僅組合完整且單一的戰鬥傷害訊息，並在原本的粗體節點內修改數字文字。
    const BATTLE_DAMAGE_LOG = /^(?<date>\s*(?:(?:\[D\d+\s+Y\d+\]|［第[^］]+］)\s*[:：]?\s*)?)(?<attacker>(?:'([^']+)'|"([^"]+)")\s+deal|「([^」]+)」造成)\s*(?<damage>[+-]?\d+(?:[.,]\d+)?\s*(?:Dmg|點傷害)|傷害：[+-]?\d+(?:[.,]\d+)?)\s*(?<suffix>to your gang|加入你的幫派)\s*[.!。]?\s*$/i;

    function normalizeBattleDamageLog(element) {
        if (!(element instanceof Element) || skipElement(element)) return false;
        const original = element.textContent || '';
        if (original.length > 300 || !/deal|造成/i.test(original) || !/Dmg|傷害/i.test(original)) return false;
        if (element.querySelector('button, a, input, textarea, select, [contenteditable]')) return false;
        const match = original.match(BATTLE_DAMAGE_LOG);
        if (!match) return false;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (skipElement(node.parentElement) || usesIconFont(node.parentElement)) return false;
            nodes.push(node);
            if (nodes.length > 24) return false;
        }
        const attackerName = match[3] || match[4] || match[5];
        const number = match.groups.damage.match(/[+-]?\d+(?:[.,]\d+)?/)[0];
        const segments = [
            [match.groups.attacker, `「${translateItemName(attackerName)}」對你的幫派造成`],
            [match.groups.damage, `${number} 點傷害`],
            [match.groups.suffix, '']
        ];
        const changes = [];
        let cursor = match.groups.date.length;
        for (const [oldText, newText] of segments) {
            const index = original.indexOf(oldText, cursor);
            if (index < 0) return false;
            changes.push({start: oldText === match.groups.suffix ? cursor : index, end: index + oldText.length, replacement: newText});
            cursor = index + oldText.length;
        }
        // 由後往前修改，偏移量才不會受較後方的新字串長度影響。
        for (const change of changes.reverse()) {
            let offset = 0;
            let inserted = false;
            for (const item of nodes) {
                const begin = offset;
                const end = offset + item.nodeValue.length;
                offset = end;
                if (end <= change.start || begin >= change.end) continue;
                const from = Math.max(0, change.start - begin);
                const to = Math.min(item.nodeValue.length, change.end - begin);
                const remaining = item.nodeValue.slice(0, from) + (inserted ? '' : change.replacement) + item.nodeValue.slice(to);
                if (!inserted) inserted = true;
                item.nodeValue = remaining;
            }
        }
        return true;
    }

    function normalizeBattleDamageLogInAncestors(element) {
        for (let depth = 0; element && depth < 5; depth++, element = element.parentElement) {
            if (normalizeBattleDamageLog(element)) return true;
        }
        return false;
    }


    // 商船交易紀錄中的 for 需搭配前後資源數量判斷；不可當作一般英文詞彙全域翻譯。
    // 只更改 for 自己的文字節點，保留物品、金幣與粗體數值。
    function normalizeVesselTradeConnector(element) {
        if (!(element instanceof Element) || skipElement(element)) return false;
        // 多數元素與商船交易無關，先以文字快速過濾，再執行 DOM 子樹查詢。
        const combined = (element.textContent || '').replace(/\s+/g, ' ').trim();
        if (combined.length > 320 || !/^(?:(?:\[D\d+\s+Y\d+\]|［第[^］]+］)\s*[:：]?\s*)?(?:You trade with the vessel,\s*selling|你與商船交易，出售)/i.test(combined)) return false;
        if (element.querySelector('button, a, input, textarea, select, [contenteditable]')) return false;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (skipElement(node.parentElement) || usesIconFont(node.parentElement)) return false;
            nodes.push(node);
            if (nodes.length > 24) return false;
        }
        let before = '';
        for (let i = 0; i < nodes.length; i++) {
            const original = nodes[i].nodeValue;
            if (/^\s*for\s*$/i.test(original)
                && /(?:You trade with the vessel,\s*selling|你與商船交易，出售)/i.test(before)
                && nodes.slice(i + 1).some(item => item.nodeValue.trim())) {
                nodes[i].nodeValue = original.replace(/for/i, '換取');
                return true;
            }
            before += original;
        }
        return false;
    }

    function normalizeVesselTradeConnectorInAncestors(element) {
        for (let depth = 0; element && depth < 5; depth++, element = element.parentElement) {
            if (normalizeVesselTradeConnector(element)) return true;
        }
        return false;
    }


    // 只有整句確實符合事件格式時，才跨 DOM 節點替換固定字詞，保留粗體數值。
    const COMPOSITE_DATE_PREFIX = /^(?:\s*(?:\[D\d+\s+Y\d+\]|［第[^］]+］)\s*[:：]?\s*)/u;
    function normalizeCompositeEvent(element) {
        if (!(element instanceof Element) || skipElement(element)) return false;
        const full=element.textContent||'';
        if(full.length>400 || !/(?:Your crew swings on board the Navy Ship|You load|You leave your calling card at the scene of the crime|Jagged timbers tear into your hull|Your crew picks through the wreckage|You heist the museum's artifact collection|Next Shipment in|You ride the train and arrive at|Under your command, your gang strips|You trade with the vessel, buying|You've deciphered the route|Your Warehouse shipment of|You continue making detailed heist preparations|You continue to decipher cryptic symbols and pirate texts|You purchase the exotic pet|You strike a burried treasure chest|你挖到一個埋藏的寶箱|You load|You offer|The Navy Ship rams|You spend|You continue planning intricate heist strategies|The power of|Can smuggle max|You gamble|You smuggle your|R\.P\/Employee|Select\s+\d+\s+more pacts?|Spend\s+\d+\s+more pacts?|Your researches have finished researching|reached level\s+\d+!|\/\s*\d[\d,.]*\s+EXP|Ending in\s+\d+\s+Days?|[+-]\d+(?:[.,]\d+)?%\s+(?:Mugging|Pickpocket|Research Speed|Sell Prices|Global Money))/i.test(full)) return false;
        const line=full.replace(COMPOSITE_DATE_PREFIX,'').trim();
        const rule=COMPOSITE_EVENT_RULES.find(item=>item.pattern.test(line));
        if(!rule || element.querySelector('button, a, input, textarea, select, svg, [contenteditable]')) return false;
        const walk=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
        const nodes=[];let node;
        while((node=walk.nextNode())){
            if(skipElement(node.parentElement)||usesIconFont(node.parentElement))return false;
            nodes.push(node);if(nodes.length>24)return false;
        }
        if(nodes.length<2||nodes.map(n=>n.nodeValue).join('')!==full)return false;
        let cursor=full.indexOf(line);const edits=[];
        for(const [regex,replacement] of rule.terms(line.match(rule.pattern))){
            const found=full.slice(cursor).match(regex);
            if(!found)return false;
            const start=cursor+found.index;
            edits.push({start,end:start+found[0].length,replacement});
            cursor=start+found[0].length;
        }
        for(const edit of edits.reverse()){
            let pos=0,inserted=false;
            for(const item of nodes){
                const begin=pos;pos+=item.nodeValue.length;
                if(pos<=edit.start||begin>=edit.end)continue;
                const from=Math.max(0,edit.start-begin);
                const to=Math.min(item.nodeValue.length,edit.end-begin);
                item.nodeValue=item.nodeValue.slice(0,from)+(inserted?'':edit.replacement)+item.nodeValue.slice(to);
                inserted=true;
            }
        }
        return true;
    }
    function normalizeCompositeEventInAncestors(element) {
        for(let depth=0;element&&depth<5;depth++,element=element.parentElement){
            if(normalizeCompositeEvent(element))return true;
        }
        return false;
    }

    function translateText(node) {
        if (!node || node.nodeType !== Node.TEXT_NODE || skipElement(node.parentElement) || usesIconFont(node.parentElement)) return;
        const translated = translateString(node.nodeValue);
        if (translated !== node.nodeValue) node.nodeValue = translated;
    }

    function translateAttributes(element) {
        if (skipElement(element)) return;
        for (const attr of ['title', 'placeholder', 'aria-label', 'alt']) {
            const original = element.getAttribute(attr);
            if (original === null) continue;
            const translated = translateString(original);
            if (translated !== original) element.setAttribute(attr, translated);
        }
        if (element instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(element.type)) {
            const original = element.value;
            const translated = translateString(original);
            if (translated !== original) element.value = translated;
        }
    }


    // v0.4.12：在翻譯之前保存原始文字節點。rendered 是腳本最後寫出的值，
    // 可用來區分遊戲更改了文字，還是腳本剛把原文改成中文。
    const sourceTextNodes = new WeakMap();
    const untranslatedContexts = getObject('ur_zh_tw_contexts');
    const MAX_CONTEXTS = 800;
    const MAX_CONTEXT_LENGTH = 600;
    const LOG_DATE_PREFIX = /^\s*(?:\[D\d+\s+Y\d+\]|［第\s*\d+\s*天\s*／\s*第\s*\d+\s*年］)\s*[:：]?\s*/u;
    const LOG_DATE_OCCURRENCE = /(?:\[D\d+\s+Y\d+\]|［第\s*\d+\s*天\s*／\s*第\s*\d+\s*年］)/gu;
    const UNSAFE_CONTEXT_CHILDREN = 'button, a, input, textarea, select, svg, [contenteditable]';
    function forEachSourceText(root, callback, limit = 5000) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) {
            if (!skipElement(root.parentElement) && !usesIconFont(root.parentElement)) callback(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
        if (root.nodeType === Node.ELEMENT_NODE && skipElement(root)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node, count = 0;
        while ((node = walker.nextNode()) && count++ < limit) {
            if (!skipElement(node.parentElement) && !usesIconFont(node.parentElement)) callback(node);
        }
    }
    function snapshotOriginalText(root) {
        forEachSourceText(root, node => {
            const actual = node.nodeValue || '';
            const saved = sourceTextNodes.get(node);
            if (!saved) sourceTextNodes.set(node, {original: actual, rendered: actual});
            else if (actual !== saved.rendered) {
                saved.original = actual;
                saved.rendered = actual;
            }
        });
    }
    function markRenderedText(root) {
        forEachSourceText(root, node => {
            const saved = sourceTextNodes.get(node);
            if (saved) saved.rendered = node.nodeValue || '';
        });
    }
    function originalFragments(element) {
        if (element.querySelector(UNSAFE_CONTEXT_CHILDREN)) return null;
        const fragments = [];
        let length = 0;
        let invalid = false;
        forEachSourceText(element, node => {
            const value = sourceTextNodes.get(node)?.original ?? node.nodeValue ?? '';
            length += value.length;
            if (length > MAX_CONTEXT_LENGTH || fragments.length >= 32) invalid = true;
            if (!invalid) fragments.push(value);
        }, 36);
        return invalid || !fragments.length ? null : fragments;
    }
    // 不執行翻譯的 render()，以免在收集階段意外修改待翻譯清單。
    function isUntranslatedSource(value) {
        const text = value.trim();
        if (text.length < 2 || !/[A-Za-z]/.test(text)) return false;
        if (NONTRANSLATABLE.some(re => re.test(text))) return false;
        if (translatedBuiltin.has(text) || translatedCustom.has(text)) return false;
        if (Object.hasOwn ? Object.hasOwn(custom, text) : Object.prototype.hasOwnProperty.call(custom, text)) return false;
        if (Object.prototype.hasOwnProperty.call(BUILTIN, text)) return false;
        if (COMPOSITE_EVENT_RULES.some(item => item.pattern.test(text))) return false;
        if (DYNAMIC.some(([re]) => re.test(text))) return false;
        const label = text.match(/^([^:：]+)[:：]$/u);
        if (label && !isUntranslatedSource(label[1])) return false;
        return true;
    }
    function findContextForNode(node) {
        let element = node.parentElement, fallback = null;
        for (let depth = 0; element && depth < 8 && element !== document.body; depth++, element = element.parentElement) {
            if (skipElement(element)) break;
            const fragments = originalFragments(element);
            if (!fragments) continue;
            const full = fragments.join('');
            const dates = full.match(LOG_DATE_OCCURRENCE) || [];
            if (LOG_DATE_PREFIX.test(full) && dates.length === 1) {
                const prefix = full.match(LOG_DATE_PREFIX)[0];
                const content = full.slice(prefix.length).trim();
                if (content) return {fragments, fullText: content, datePrefix: prefix.trim(), complete: /[.!?。！？]\s*$/u.test(content)};
            }
            // 沒有可確定的事件標記時，只當作上下文片段，不能冒充完整句。
            if (!fallback && fragments.length > 1 && full.length <= 320 && !dates.length && /[A-Za-z]/.test(full)) {
                fallback = {fragments, fullText: full.trim(), complete: false};
            }
        }
        return fallback;
    }
    function contextKey(fullText) {
        return fullText.toLowerCase().replace(/[+-]?\d[\d,.]*(?:[KMBT])?/gi, '#').replace(/\s+/g, ' ').trim();
    }
    function recordEventContext(context) {
        if (!context || !context.fullText || context.fullText.length > MAX_CONTEXT_LENGTH) return false;
        const key = contextKey(context.fullText);
        const existing = untranslatedContexts[key];
        if (existing) {
            // 同一種動態事件只保留一筆範例，允許不完整的快照更新為完整句。
            if (existing.complete || !context.complete && context.fullText.length <= existing.fullText.length) return false;
        } else if (Object.keys(untranslatedContexts).length >= MAX_CONTEXTS) return false;
        // 如果遊戲逐步填入同一段訊息，較長的新紀錄可取代先前的殘句。
        for (const [oldKey, old] of Object.entries(untranslatedContexts)) {
            if (oldKey !== key && !old.complete && context.fullText.startsWith(old.fullText)
                && context.fullText.length > old.fullText.length) delete untranslatedContexts[oldKey];
        }
        untranslatedContexts[key] = context;
        return true;
    }
    function collectOriginalContexts(root) {
        let dirty = false;
        const seen = new Set();
        forEachSourceText(root, node => {
            const source = sourceTextNodes.get(node)?.original ?? node.nodeValue ?? '';
            if (!isUntranslatedSource(source)) return;
            const info = findContextForNode(node);
            if (!info || seen.has(info.fullText) || !isUntranslatedSource(info.fullText)) return;
            seen.add(info.fullText);
            if (recordEventContext(info)) dirty = true;
        });
        if (dirty) GM_setValue('ur_zh_tw_contexts', untranslatedContexts);
    }
    function sourceCaptureScope(root) {
        if (!root || root === document.body) return root;
        let element = root.nodeType === Node.TEXT_NODE ? root.parentElement : root;
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return root;
        let scope = element;
        for (let depth = 0; depth < 7 && scope.parentElement && scope.parentElement !== document.body; depth++) {
            const parent = scope.parentElement;
            if ((parent.textContent || '').length > MAX_CONTEXT_LENGTH || skipElement(parent)) break;
            scope = parent;
        }
        return scope;
    }
    function scanWithOriginalCapture(root) {
        const scope = sourceCaptureScope(root);
        snapshotOriginalText(scope);
        collectOriginalContexts(scope);
        scan(root);
        markRenderedText(scope);
    }

    function scan(root) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) {
            normalizeBattleDamageLogInAncestors(root.parentElement);
            normalizeCompositeEventInAncestors(root.parentElement);
            normalizeVesselTradeConnectorInAncestors(root.parentElement);
            normalizeSplitFragmentInAncestors(root.parentElement);
            normalizeSacrificeLogInAncestors(root.parentElement);
            normalizeSwatRaidLogInAncestors(root.parentElement);
            if (!translateGroupedPurchaseInAncestors(root.parentElement)) translateText(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
        if (root.nodeType === Node.ELEMENT_NODE) {
            if (skipElement(root)) return;
            normalizeBattleDamageLogInAncestors(root);
            normalizeCompositeEventInAncestors(root);
            normalizeVesselTradeConnectorInAncestors(root);
            normalizeSplitFragmentInAncestors(root);
            normalizeSacrificeLogInAncestors(root);
            normalizeSwatRaidLogInAncestors(root);
            translateGroupedPurchaseInAncestors(root);
            translateAttributes(root);
        }

        const iterator = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let node;
        while ((node = iterator.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) {
                translateText(node);
            } else {
                normalizeBattleDamageLog(node);
                normalizeCompositeEvent(node);
                normalizeVesselTradeConnector(node);
                normalizeSplitFragment(node);
                normalizeSacrificeLog(node);
                normalizeSwatRaidLog(node);
                translateGroupedPurchase(node);
                translateAttributes(node);
            }
        }
    }

    function scheduleScan(node) {
        if (!node) return;
        pending.add(node);
        if (translationScheduled) return;
        translationScheduled = true;
        requestAnimationFrame(() => {
            translationScheduled = false;
            const nodes = Array.from(pending);
            pending.clear();
            // 翻譯本身也會改寫文字節點；暫停監看以免將中文當成新原文。
            observer.disconnect();
            try {
                for (const item of nodes) scanWithOriginalCapture(item);
            } finally {
                observer.observe(document.body, OBSERVER_OPTIONS);
            }
        });
    }

    function downloadJson(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    }

    function exportUntranslated() {
        // 只匯出還未經自訂或內建字典翻譯的字串。
        const translations = Object.fromEntries(
            Object.keys(unseen).filter(key => lookup(key) === null).sort().map(key => [key, ''])
        );
        const contexts = Object.values(untranslatedContexts).filter(ctx =>
            ctx && typeof ctx.fullText === 'string' && Array.isArray(ctx.fragments)
            && isUntranslatedSource(ctx.fullText)
        ).sort((a, b) => a.fullText.localeCompare(b.fullText));
        downloadJson('Unlawful_Reign_待翻譯文字.json', {translations, contexts});
        alert('已匯出 ' + Object.keys(translations).length + ' 條待翻譯片段、'
            + contexts.length + ' 筆完整句或上下文範例。');
    }

    function importTranslations() {
        const selector = document.createElement('input');
        selector.type = 'file';
        selector.accept = '.json,application/json';
        selector.style.display = 'none';
        document.body.appendChild(selector);
        selector.addEventListener('change', async () => {
            try {
                if (!selector.files || !selector.files[0]) return;
                const parsed = JSON.parse(await selector.files[0].text());
                const records = parsed && typeof parsed.translations === 'object' && parsed.translations !== null
                    ? parsed.translations : parsed;
                if (!records || typeof records !== 'object' || Array.isArray(records)) {
                    throw new Error('JSON 必須是「英文原文」對應「繁體中文」的物件。');
                }
                let added = 0;
                for (const [key, value] of Object.entries(records)) {
                    if (typeof key !== 'string' || typeof value !== 'string' || !key.trim() || !value.trim()) continue;
                    if (key.length > 500 || value.length > 2000) continue;
                    custom[key] = value;
                    added += 1;
                }
                GM_setValue('ur_zh_tw_custom', custom);
                alert(`已匯入 ${added} 條翻譯。網頁將重新整理，以將翻譯套用到所有介面。`);
                if (added > 0) location.reload();
            } catch (error) {
                alert(`匯入失敗：${error.message}`);
            } finally {
                selector.remove();
            }
        }, {once: true});
        selector.click();
    }

    GM_registerMenuCommand('匯出待翻譯文字 JSON', exportUntranslated);
    GM_registerMenuCommand('匯入中文化詞庫 JSON', importTranslations);
    GM_registerMenuCommand('清除已收集的待翻譯文字', () => {
        if (!confirm('確定要清除已收集的待翻譯文字嗎？這不會刪除自訂翻譯詞庫或遊戲存檔。')) return;
        for (const key of Object.keys(unseen)) delete unseen[key];
        GM_setValue('ur_zh_tw_untranslated', {});
        for (const key of Object.keys(untranslatedContexts)) delete untranslatedContexts[key];
        GM_setValue('ur_zh_tw_contexts', {});
        alert('已清除待翻譯文字與上下文紀錄。');
    });

    window.addEventListener('pagehide', saveUntranslatedNow);

    const OBSERVER_OPTIONS = {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['title', 'placeholder', 'aria-label', 'alt', 'value']
    };
    const observer = new MutationObserver(mutations => {
        for (const change of mutations) {
            if (change.type === 'characterData') {
                scheduleScan(change.target);
            } else if (change.type === 'attributes') {
                scheduleScan(change.target);
            } else if (change.type === 'childList') {
                for (const added of change.addedNodes) scheduleScan(added);
            }
        }
    });

    function start() {
        if (!document.body) return;
        scanWithOriginalCapture(document.body);
        observer.observe(document.body, OBSERVER_OPTIONS);
    }

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start, {once: true});
})();
