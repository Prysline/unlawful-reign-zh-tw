'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText};\n})();');
assert.notEqual(source, instrumented, '找不到使用者腳本結尾');

class ElementMock {
    constructor(icon = false) { this.icon = icon; }
    closest() { return null; }
}
const store = {
    ur_zh_tw_custom: {'Custom Phrase': '自訂文字'},
    ur_zh_tw_untranslated: {'既有待翻譯記錄': ''}
};
const sandbox = {
    Element: ElementMock,
    HTMLInputElement: class {},
    Node: {TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9},
    NodeFilter: {SHOW_TEXT: 4, SHOW_ELEMENT: 1},
    MutationObserver: class {},
    document: {body: null, addEventListener() {}},
    window: {addEventListener() {}},
    GM_getValue: (key, fallback) => store[key] ?? fallback,
    GM_setValue: (key, value) => {store[key] = value;},
    GM_registerMenuCommand() {},
    getComputedStyle: element => ({fontFamily: element.icon ? 'Material Symbols Outlined' : 'Arial'})
};
vm.createContext(sandbox);
vm.runInContext(instrumented, sandbox);
const {lookup, translateString, translateText} = sandbox.testAPI;
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'batch_v0321.json'), 'utf8'));
assert.equal(Object.keys(data).length, 22);

for (const original of Object.keys(data)) {
    const output = translateString(original);
    assert.notEqual(output, original, '未翻譯：' + original);
}

const expected = {
    '+ Unlocks Followers': '＋解鎖追隨者',
    '+ Unlocks New Rune': '＋解鎖新符文',
    '+ Unlock New Rune': '＋解鎖新符文',
    '+ Unlock New Equipment': '＋解鎖新裝備',
    '+ Unlock New Structures': '＋解鎖新建築',
    '+5% Chance of success when gambling': '賭博獲勝機率：+5%',
    'Dig for Treasure (5%)': '挖掘寶藏（5%）',
    '+3 Max Crewmates': '船員上限：+3',
    '+4 Max Crewmates': '船員上限：+4',
    '+11 Max Crewmates': '船員上限：+11',
    '-2.5 Max Crewmates': '船員上限：-2.5',
    '20 Max Crewmates': '船員上限：20',
    'Bunk Beds': '雙層床',
    'Expanded Quarters': '擴建艙室',
    'Holy Slippers': '神聖拖鞋',
    'Spiked Peg Legs': '帶刺木製義腿',
    "Step into God's light": '踏入神的光芒',
    'Create Replica Artworks in the comfort of your hideout': '在舒適的藏身處製作藝術品仿作',
    'Undead Offering': '亡靈供品',
    'Undead Minion': '亡靈僕從',
    'Armed Robbery (8 G.M, 3 Pistols)': '持械搶劫（8 名幫派成員、3 把手槍）',
    'Custom Phrase': '自訂文字'
};
for (const [original, translation] of Object.entries(expected)) {
    assert.equal(translateString(original), translation, original);
}
const iconText = {nodeType: 3, nodeValue: 'settings', parentElement: new ElementMock(true)};
translateText(iconText);
assert.equal(iconText.nodeValue, 'settings', '圖示字型不應受翻譯影響');
const normalText = {nodeType: 3, nodeValue: 'settings', parentElement: new ElementMock(false)};
translateText(normalText);
assert.equal(normalText.nodeValue, '設定');
assert.equal(store.ur_zh_tw_untranslated['既有待翻譯記錄'], '');
assert.equal(lookup('Bunk Beds'), '雙層床');
console.log('v0.3.21：22 筆文字、' + Object.keys(expected).length + ' 組翻譯與回歸案例通過。');
