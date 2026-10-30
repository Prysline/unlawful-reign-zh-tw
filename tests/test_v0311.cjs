'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const file = path.resolve(__dirname, 'unlawful_reign_zh_tw.user.js');
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
