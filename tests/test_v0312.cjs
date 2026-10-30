'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const file = path.resolve(__dirname, 'unlawful_reign_zh_tw_v0312.user.js');
const source = fs.readFileSync(file, 'utf8');
const rewritten = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI = {lookup, translateString, translateText};\n})();');
assert.notEqual(rewritten, source, '無法插入測試函式');
class ElementMock {
    constructor(icon=false) { this.nodeType=1; this.icon=icon; this.parentElement=null; }
    closest() { return null; }
}
const storage = {ur_zh_tw_untranslated: {'舊紀錄': ''}, ur_zh_tw_custom: {}};
const context = {
    Element: ElementMock,
    HTMLInputElement: class {},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
    NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    GM_getValue:(key, fallback)=>storage[key]??fallback,
    GM_setValue:(key, value)=>{storage[key]=value;},
    GM_registerMenuCommand:()=>{},
    getComputedStyle:element=>({fontFamily:element.icon?'Material Icons':'Arial'}),
    window:{addEventListener:()=>{}},
    document:{body:null, addEventListener:()=>{}},
    MutationObserver:class {},
};
vm.createContext(context);
vm.runInContext(rewritten, context, {filename:file});
const t=context.testAPI;
const cases = {
    '+1 Pistols': '手槍：+1',
    '+1 Submachine Guns': '衝鋒槍：+1',
    '+10% Chance for x2 Drugs on harvest': '收成時獲得 2 倍毒品的機率：+10%',
    '+5 Max Drugs': '毒品持有上限：+5',
    '-1 Drugs': '毒品：-1',
    '-1K Not.': '惡名：-1K',
    '-20% Gang War Damage Taken': '幫派戰爭承受的傷害：-20%',
    'Aces Up your Sleeves': '袖藏王牌',
    'Be able to visit the Casino': '能夠造訪賭場',
    'Bejeweled Jeans': '鑲寶石的牛仔褲',
    'Bulletproof Vest': '防彈背心',
    'Deal Drugs': '販售毒品',
    "Go to war with 'The Iron Ravens'. Win to gain +20% Global Notoriety. If your Gang falls, you lose ALL of your Notoriety and Gang Members.": '與「鐵鴉」開戰。勝利可獲得 +20% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。',
    'Have a low chance of finding a Safe House to hide out in': '有小機率找到可用來藏身的安全屋',
    'Heavy, ugly, and exactly the kind of thing you want when bullets start flying': '又重又醜，而在子彈橫飛時，你想要的正是這種東西',
    'Not affected by Rituals': '不受儀式影響',
    'Persuasive Recruiting': '說服式招募',
    'Pesticide': '農藥',
    'Ritual Boons': '儀式恩賜',
    'Safe House': '安全屋',
    'Selective Breeding': '選擇性育種',
    'Small Shack': '小棚屋',
    'Start War': '發動戰爭',
    'Superior Spraycans': '高級噴漆罐',
    'Target Practice': '射擊練習',
    'Temperature Control': '溫度控制',
    'Undermine': '暗中破壞',
    'Weeds (The bad kind) are half as likely to grow': '雜草（有害的那種）生長的機率減半',
    'While not a criminal, undermine the police for Notoriety': '在非罪犯狀態時，暗中破壞警方的行動以獲得惡名',
    'You give up 10 Gang Members in return for your freedom': '你交出了 10 名幫派成員，以換取自由',
    'You have active boons': '你有已啟用的恩賜',
    'Your graffiti is so beautiful, it is no longer considered a crime': '你的塗鴉美得不再被視為犯罪',
    'days remaining': '剩餘天數',
    'x1.2 Greenhouse growth speed': '溫室生長速度 ×1.2',
    'x1.5 Gang War attack damage': '幫派戰爭攻擊傷害 ×1.5',
    'x1.80 Money (14 days)': '金錢 ×1.80（14 天）',
    'x1.80 Money (15 days)': '金錢 ×1.80（15 天）',
    'x2 Notoriety when not a criminal': '非罪犯狀態時的惡名 ×2',
};
assert.equal(Object.keys(cases).length, 38);
for(const [original, expected] of Object.entries(cases)) {
    assert.equal(t.translateString(original), expected, original);
    assert.equal(t.lookup(original), expected, original);
}
const variable = {
    '+18 Pistols':'手槍：+18',
    '-2 Submachine Guns':'衝鋒槍：-2',
    '+25% Chance for x3 Drugs on harvest':'收成時獲得 3 倍毒品的機率：+25%',
    '+35 Max Drugs':'毒品持有上限：+35',
    '-7 Drugs':'毒品：-7',
    '-2.5M Not.':'惡名：-2.5M',
    '-45% Gang War Damage Taken':'幫派戰爭承受的傷害：-45%',
    "Go to war with 'The Iron Ravens'. Win to gain +45% Global Notoriety. If your Gang falls, you lose ALL of your Notoriety and Gang Members.":'與「鐵鴉」開戰。勝利可獲得 +45% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。',
    'You give up 23 Gang Members in return for your freedom':'你交出了 23 名幫派成員，以換取自由',
    'x3.5 Greenhouse growth speed':'溫室生長速度 ×3.5',
    'x2.5 Gang War attack damage':'幫派戰爭攻擊傷害 ×2.5',
    'x1.80 Money (30 days)':'金錢 ×1.80（30 天）',
    'x4 Notoriety when not a criminal':'非罪犯狀態時的惡名 ×4',
};
for(const [original,expected] of Object.entries(variable)) assert.equal(t.translateString(original),expected,original);
assert.equal(t.translateString('惡名：-1K'), '惡名：-1K', '已翻譯的縮寫不應二次收集');
assert.equal(storage.ur_zh_tw_untranslated['惡名：-1K'], undefined);
assert.equal(storage.ur_zh_tw_untranslated['舊紀錄'], '');
assert.equal(t.translateString('2 days remaining'), '剩餘 2 天');
const icon = new ElementMock(true);
const iconNode = {nodeType:3,nodeValue:'settings',parentElement:icon};
t.translateText(iconNode);
assert.equal(iconNode.nodeValue,'settings');
console.log(`通過：${Object.keys(cases).length} 筆新文字、${Object.keys(variable).length} 種數值變化及圖示／舊資料回歸測試`);

const newEntries = {
    "(Harvestable)": "（可收成）",
    "+ Unlock New Rune": "＋解鎖新符文",
    "+ Unlock New Structures": "＋解鎖新建築",
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
    "+0.10 Fake Identity": "假身分：+0.10",
    "+1 Stolen Jewels from Jewelry Store Armed Robbery": "珠寶店持械搶劫獲得的贓珠寶：+1",
    "+25% Notoriety if criminal status is at least 5": "罪犯狀態至少為 5 時，惡名：+25%",
    "-1 Fake Identity": "假身分：-1",
    "0.10 Fake Identity": "假身分：0.10",
    "1 Drugs": "毒品：1",
    "20 Dmg": "傷害：20",
    "210 Dmg": "傷害：210",
    "65 Dmg": "傷害：65",
    "90 Dmg": "傷害：90",
    "Activate 1 Blood Pool": "啟用 1 座血池",
    "Activate 1 Shrine": "啟用 1 座神龕",
    "Activate all Blood Pool": "啟用全部血池",
    "Activate all Shrine": "啟用全部神龕",
    "Armed Robbery (8 G.M, 3 Pistols)": "持械搶劫（8 名幫派成員、3 把手槍）",
    "Cult Lv. 2": "邪教等級 2",
    "Cult Lv. 3": "邪教等級 3",
    "Deactivate 1 Blood Pool": "停用 1 座血池",
    "Deactivate 1 Shrine": "停用 1 座神龕",
    "Deactivate all Blood Pool": "停用全部血池",
    "Deactivate all Shrine": "停用全部神龕",
    "Not ready, refunds 60% of seed cost": "尚未準備好，退還種子成本的 60%",
    "Reduce Store Robbery crime and max crime Penalty by 1": "將商店搶劫的犯罪懲罰及懲罰上限降低 1",
    "You need a minimum of 8 Gang Members and 3 Pistols": "你至少需要 8 名幫派成員與 3 把手槍",
    "Your Cult grows to Level 2": "你的邪教升至等級 2",
    "Your Cult grows to Level 3": "你的邪教升至等級 3",
    "x1.15 Build Fake Identity Speed": "建立假身分的速度 ×1.15",
    "x1.5 Notoriety from Store Robberies and Jewelry Store Armed Robberies": "商店搶劫與珠寶店持械搶劫獲得的惡名 ×1.5",
    "x1.80 Notoriety Rewards": "惡名獎勵 ×1.80"
};
for(const [original,expected] of Object.entries(newEntries)) {
    assert.equal(t.translateString(original), expected, original);
    assert.equal(t.lookup(original), expected, original);
}
const variants = {
    "Armed Robbery (15 G.M, 8 Pistols)": "持械搶劫（15 名幫派成員、8 把手槍）",
    "Armed Robbery (12 G.M, 6 Submachine Guns)": "持械搶劫（12 名幫派成員、6 把衝鋒槍）",
    "You need a minimum of 12 Gang Members and 6 Submachine Guns": "你至少需要 12 名幫派成員與 6 把衝鋒槍",
    "Cult Lv. 10": "邪教等級 10",
    "Your Cult grows to Level 10": "你的邪教升至等級 10",
    "+2.35 Fake Identity": "假身分：+2.35",
    "1000 Dmg": "傷害：1000",
    "-4 Drugs": "毒品：-4",
    "Activate 8 Shrine": "啟用 8 座神龕",
    "Deactivate all Blood Pool": "停用全部血池",
    "+7 Stolen Jewels from Jewelry Store Armed Robbery": "珠寶店持械搶劫獲得的贓珠寶：+7",
    "+60% Notoriety if criminal status is at least 12": "罪犯狀態至少為 12 時，惡名：+60%",
    "x3 Build Fake Identity Speed": "建立假身分的速度 ×3",
    "x2.15 Notoriety from Store Robberies and Jewelry Store Armed Robberies": "商店搶劫與珠寶店持械搶劫獲得的惡名 ×2.15",
    "x5 Notoriety Rewards": "惡名獎勵 ×5",
    "Not ready, refunds 25% of seed cost": "尚未準備好，退還種子成本的 25%",
    "Reduce Store Robbery crime and max crime Penalty by 3": "將商店搶劫的犯罪懲罰及懲罰上限降低 3",
    "Activate 3 Altar": "啟用 3 座祭壇",
    "Deactivate all Cultist Training Ground": "停用全部邪教徒訓練場"
};
for(const [original,expected] of Object.entries(variants)) {
    assert.equal(t.translateString(original), expected, original);
}
assert.equal(storage.ur_zh_tw_untranslated['舊紀錄'], '');
console.log('v0.3.12：60 筆新文字、19 組不同數值，已通過。');
