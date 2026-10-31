'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText};\n})();');
assert.notEqual(instrumented, source, '未找到使用者腳本結尾');

class ElementMock {
    constructor(icon=false) {this.icon=icon;}
    closest() {return null;}
}
const store = {ur_zh_tw_custom:{'Custom Phrase':'自訂文字'}, ur_zh_tw_untranslated:{'既有紀錄':''}};
const sandbox = {
    Element:ElementMock, HTMLInputElement:class {},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
    NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    MutationObserver:class {},
    document:{body:null,addEventListener(){}},
    window:{addEventListener(){}},
    GM_getValue:(key,fallback)=>store[key]??fallback,
    GM_setValue:(key,value)=>{store[key]=value;},
    GM_registerMenuCommand(){},
    getComputedStyle:element=>({fontFamily:element.icon?'Material Symbols Outlined':'Arial'})
};
vm.createContext(sandbox);
vm.runInContext(instrumented,sandbox);
const api = sandbox.testAPI;
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0320.json'),'utf8'));
assert.equal(Object.keys(fixture).length,15);
for(const original of Object.keys(fixture)) {
    assert.notEqual(api.translateString(original),original,'未翻譯：'+original);
}
const cases={
    '+ Unlocks Followers':'＋解鎖追隨者',
    '+ Unlocks New Rune':'＋解鎖新符文',
    '+ Unlock New Rune':'＋解鎖新符文',
    '+ Unlock New Equipment':'＋解鎖新裝備',
    '+ Unlock New Ritual':'＋解鎖新儀式',
    '+ Unlock New Structures':'＋解鎖新建築',
    '+ Unlock Followers':'＋解鎖追隨者',
    '+ Unlocks New Followers':'＋解鎖新追隨者',
    '+5% Chance of success when gambling':'賭博獲勝機率：+5%',
    '+12.5% Chance to win when gambling':'賭博獲勝機率：+12.5%',
    '-6% Chance of success when gambling':'賭博獲勝機率：-6%',
    'Dig for Treasure (5%)':'挖掘寶藏（5%）',
    'Dig for Treasure (17.5%)':'挖掘寶藏（17.5%）',
    'Dig for Treasure (100%)':'挖掘寶藏（100%）',
    'Create Replica Artworks in the comfort of your hideout':'在舒適的藏身處製作藝術品仿作',
    'Deserted Island':'荒島',
    'Document Forger':'文件偽造者',
    'Forge documents at your safehouse':'在安全屋偽造文件',
    'Hobby Artist':'業餘藝術家',
    'Lucky Harvest':'幸運收成',
    'Lucky Horseshoe':'幸運馬蹄鐵',
    'Undead Offering':'亡靈供品',
    'You dig and dig from sunrise to sunset with nothing to show for it...':'你從日出挖到日落，卻一無所獲……',
    'You spot a suspicious island that you feel may be ripe with treasure':'你發現了一座可疑的島嶼，覺得那裡可能藏有豐富的寶藏',
    'Your Gardener waters your plants for you':'你的園丁替你的植物澆水',
    'Unlocks Shoplift':'解鎖商店行竊',
    'Armed Robbery (8 G.M, 3 Pistols)':'持械搶劫（8 名幫派成員、3 把手槍）',
    'Undead Minion':'亡靈僕從',
    'Custom Phrase':'自訂文字'
};
for(const [original,expected] of Object.entries(cases)) {
    assert.equal(api.translateString(original),expected,original);
}
const icon = new ElementMock(true);
const iconText={nodeType:3,nodeValue:'settings',parentElement:icon};
api.translateText(iconText);
assert.equal(iconText.nodeValue,'settings','設定圖示不得損壞');
const label = new ElementMock();
const labelText={nodeType:3,nodeValue:'settings',parentElement:label};
api.translateText(labelText);
assert.equal(labelText.nodeValue,'設定');
assert.equal(store.ur_zh_tw_untranslated['既有紀錄'],'');
console.log('v0.3.20：15 筆新文字、'+Object.keys(cases).length+' 組翻譯與數值案例，以及圖示、舊譯文和資料保留測試通過。');
