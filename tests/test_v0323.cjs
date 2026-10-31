'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText};\n})();');
assert.notEqual(instrumented, source, '無法取得使用者腳本 API');

class ElementMock {
    constructor(icon = false) { this.icon = icon; }
    closest() { return null; }
}
const storage = {
    ur_zh_tw_custom: {'My Term': '我的自訂翻譯'},
    ur_zh_tw_untranslated: {'舊版尚未翻譯文字': ''}
};
const context = {
    Element: ElementMock, HTMLInputElement: class {},
    Node: {TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9},
    NodeFilter: {SHOW_TEXT: 4, SHOW_ELEMENT: 1},
    MutationObserver: class {},
    document: {body: null, addEventListener() {}},
    window: {addEventListener() {}},
    GM_getValue: (key, fallback) => storage[key] ?? fallback,
    GM_setValue: (key, value) => {storage[key] = value;},
    GM_registerMenuCommand() {},
    getComputedStyle: e => ({fontFamily: e.icon ? 'Material Symbols Outlined' : 'Arial'})
};
vm.createContext(context);
vm.runInContext(instrumented, context);
const {lookup, translateString, translateText} = context.testAPI;

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'batch_v0323.json'), 'utf8'));
assert.equal(Object.keys(data).length, 22, '本批應有 22 筆');
const expected = {
    '+ Sell prices boosted by +10% (+5% Per Lvl)': '＋出售價格加成 +10%（每級 +5%）',
    '+ Sell prices boosted by +5% (+5% Per Lvl)': '＋出售價格加成 +5%（每級 +5%）',
    '+1 Finance EXP': '財務經驗值：+1',
    '+1 Stealth EXP': '潛行經驗值：+1',
    '+3 Finance EXP': '財務經驗值：+3',
    '+3 Stealth EXP': '潛行經驗值：+3',
    '+5% Money when you gamble and win than lose': '賭博獲勝時相較落敗，多獲得 +5% 金錢',
    'Ace of Guns': '槍械王牌',
    'Clean Gambling': '乾淨的賭博',
    'Finance': '財務',
    'Finance Lv. 2': '財務專精等級 2',
    'Gang Armory': '幫派軍械庫',
    'Launder your dirty money into clean money at the Casino': '在賭場將黑錢洗成乾淨的錢',
    'Marked Cards': '做過記號的牌',
    'Rob Casino (10 G.M, 5 S.M.G)': '搶劫賭場（10 名幫派成員、5 把衝鋒槍）',
    'Study Operations': '研究營運',
    "Superman's Glasses": '超人的眼鏡',
    'Windy': '多風',
    'You parlay with the Navy Captain, bribing him to let you pass without conflict...': '你與海軍艦長交涉，賄賂他讓你不經衝突便能通過……',
    "Your 'Finance' Expertise increases to Level 2!": '你的「財務」專精提升至等級 2！',
    'x1.5 Money earned from Casino Robbery': '賭場搶劫獲得的金錢 ×1.5',
    'x2 Max Pistols and Submachine Guns': '手槍與衝鋒槍上限 ×2'
};
for (const key of Object.keys(data)) {
    assert.equal(translateString(key), expected[key], '原文翻譯：' + key);
}
const variants = {
    '+ Sell prices boosted by +12.5% (+2% Per Lvl)': '＋出售價格加成 +12.5%（每級 +2%）',
    '+7 Finance EXP': '財務經驗值：+7',
    '-2.5 Stealth EXP': '潛行經驗值：-2.5',
    '+9 Brutality EXP': '蠻力經驗值：+9',
    'Artistry Lv. 5': '藝術專精等級 5',
    'Rob Casino (12 G.M, 3 Pistols)': '搶劫賭場（12 名幫派成員、3 把手槍）',
    'Rob Casino (9 G.M, 2 Submachine Guns)': '搶劫賭場（9 名幫派成員、2 把衝鋒槍）',
    'Your "Stealth" Expertise increases to Level 9!': '你的「潛行」專精提升至等級 9！',
    'x3.25 Money earned from Casino Robbery': '賭場搶劫獲得的金錢 ×3.25',
    'x2.5 Max Submachine Guns and Pistols': '衝鋒槍與手槍上限 ×2.5',
    'Armed Robbery (8 G.M, 3 Pistols)': '持械搶劫（8 名幫派成員、3 把手槍）',
    '+ Unlocks New Rune': '＋解鎖新符文',
    'Undead Minion': '亡靈僕從',
    'My Term': '我的自訂翻譯'
};
for (const [original, result] of Object.entries(variants)) {
    assert.equal(translateString(original), result, '數值變化或舊版回歸：' + original);
}
const icon = {nodeType:3, nodeValue:'settings', parentElement:new ElementMock(true)};
translateText(icon);
assert.equal(icon.nodeValue, 'settings', '不得損壞 Material Symbols 圖示');
const ordinary = {nodeType:3, nodeValue:'settings', parentElement:new ElementMock(false)};
translateText(ordinary);
assert.equal(ordinary.nodeValue, '設定', '一般文字仍應翻譯');
assert.equal(storage.ur_zh_tw_untranslated['舊版尚未翻譯文字'], '', '不得清除舊紀錄');
assert.equal(lookup('Finance'), '財務');
console.log('v0.3.23：22 筆原始翻譯、' + Object.keys(variants).length + ' 組變動與回歸案例、圖示保護及保存功能通過。');
