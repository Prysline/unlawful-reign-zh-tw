'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI = {lookup, translateString, translateText};\n})();');
assert.notEqual(instrumented, source, '無法找到腳本入口');

class ElementMock {
    constructor(icon = false) { this.icon = icon; }
    closest() { return null; }
}
const store = {
    ur_zh_tw_custom: {'Custom Translation': '自訂翻譯'},
    ur_zh_tw_untranslated: {'歷史紀錄': ''}
};
const sandbox = {
    Element: ElementMock,
    HTMLInputElement: class {},
    Node: {TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9},
    NodeFilter: {SHOW_TEXT: 4, SHOW_ELEMENT: 1},
    MutationObserver: class {},
    document: {body: null, addEventListener() {}},
    window: {addEventListener() {}},
    GM_getValue: (key, defaultValue) => store[key] ?? defaultValue,
    GM_setValue: (key, value) => {store[key] = value;},
    GM_registerMenuCommand() {},
    getComputedStyle: element => ({fontFamily: element.icon ? 'Material Symbols Outlined' : 'Arial'})
};
vm.createContext(sandbox);
vm.runInContext(instrumented, sandbox);

const {lookup, translateString, translateText} = sandbox.testAPI;
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'batch_v0318.json'), 'utf8'));
assert.equal(Object.keys(data).length, 30);
for (const original of Object.keys(data)) {
    const actual = translateString(original);
    assert.notEqual(actual, original, '仍未翻譯：' + original);
    assert.equal(typeof actual, 'string');
}

const examples = {
    '+20 Ship Max HP': '船隻生命值上限：+20',
    '+3 Boarding DMG per crewmate': '每名船員的登船作戰傷害：+3',
    '+5 Base Boarding DMG': '登船作戰基礎傷害：+5',
    '+50 Max Souls': '靈魂上限：+50',
    '50 Max Souls': '靈魂上限：50',
    'Increase Ship speed by x1.5': '船隻速度提高至 ×1.5',
    'Rituals cost -10% of your total Souls': '儀式消耗你總靈魂的 -10%',
    'Undead Minions provide x2 Souls': '亡靈僕從提供的靈魂 ×2',
    '-45 Ship Max HP': '船隻生命值上限：-45',
    '+7 Boarding DMG per crewmate': '每名船員的登船作戰傷害：+7',
    '-3 Base Boarding DMG': '登船作戰基礎傷害：-3',
    '500 Max Souls': '靈魂上限：500',
    '-10 Max Souls': '靈魂上限：-10',
    'Increase Ship speed by x2.75': '船隻速度提高至 ×2.75',
    'Rituals cost -35% of your total Souls': '儀式消耗你總靈魂的 -35%',
    'Undead Minions provide x3.2 Souls': '亡靈僕從提供的靈魂 ×3.2',
    'Captured Flag': '繳獲的旗幟',
    "Crow's Nest": '桅頂瞭望台',
    'Rusted Harpoons': '生鏽的魚叉',
    'Sunny': '晴朗',
    'No effects': '沒有效果',
    'Undead Minion': '亡靈僕從',
    'Armed Robbery (8 G.M, 3 Pistols)': '持械搶劫（8 名幫派成員、3 把手槍）',
    'Custom Translation': '自訂翻譯'
};
for(const [original, expected] of Object.entries(examples)){
    assert.equal(translateString(original), expected, original);
}

const icon = new ElementMock(true);
const iconNode = {nodeType: 3, nodeValue: 'settings', parentElement: icon};
translateText(iconNode);
assert.equal(iconNode.nodeValue, 'settings', '圖示字型不應翻譯');
const label = new ElementMock(false);
const labelNode = {nodeType: 3, nodeValue: 'settings', parentElement: label};
translateText(labelNode);
assert.equal(labelNode.nodeValue, '設定', '一般文字仍須翻譯');
assert.equal(store.ur_zh_tw_untranslated['歷史紀錄'], '');
assert.equal(lookup('Undead Minion'), '亡靈僕從');

console.log('v0.3.18：30 筆原文、24 組翻譯與數值案例，以及圖示與舊資料回歸測試通過。');
