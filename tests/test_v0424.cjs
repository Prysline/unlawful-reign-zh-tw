'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = script.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,normalizeCompositeEvent,normalizeSplitFragment,isUntranslatedSource};\n})();');
assert.notEqual(instrumented, script, '找不到使用者腳本結尾');
class Elem {
    constructor(tag = 'div', icon = false) {
        this.nodeType=1;this.tagName=tag.toUpperCase();this.icon=icon;
        this.parentElement=null;this.childNodes=[];this.className='';
    }
    get textContent() {return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');}
    closest() {return null;}
    querySelector(selector) {
        const tags=selector.split(',').map(x=>x.trim().toUpperCase()).filter(x=>/^[A-Z]+$/.test(x));
        const visit=e=>{for(const n of e.childNodes){if(n.nodeType!==1)continue;if(tags.includes(n.tagName))return n;const found=visit(n);if(found)return found;}return null;};
        return visit(this);
    }
}
function text(parent, value) {
    const node={nodeType:3,nodeValue:value,parentElement:parent};
    parent.childNodes.push(node);return node;
}
function element(parent, tag='span') {
    const node=new Elem(tag);node.parentElement=parent;parent.childNodes.push(node);return node;
}
const storage={ur_zh_tw_custom:{'Custom Label':'使用者標籤'},ur_zh_tw_untranslated:{'舊版紀錄':''}};
const context={
    Element:Elem,HTMLInputElement:class{},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    MutationObserver:class{},
    document:{body:null,addEventListener(){},createTreeWalker(root,mask) {
        const found=[];const visit=e=>{for(const n of e.childNodes){if(n.nodeType===3&&(mask&4))found.push(n);if(n.nodeType===1){if(mask&1)found.push(n);visit(n);}}};
        visit(root);let i=0;return {nextNode:()=>found[i++]||null};
    }},
    window:{addEventListener(){}},
    GM_getValue:(k,def)=>storage[k]??def,
    GM_setValue:(k,v)=>{storage[k]=v;},
    GM_registerMenuCommand(){},
    getComputedStyle:e=>({fontFamily:e.icon?'Material Symbols Outlined':'Arial'})
};
vm.createContext(context);
vm.runInContext(instrumented,context);
const {lookup,translateString,translateText,normalizeCompositeEvent}=context.testAPI;

const normalizeSplitFragment=context.testAPI.normalizeSplitFragment;
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0424.json'),'utf8'));
const originals=Object.keys(batch.translations);
assert.equal(originals.length,21,'本批來源詞條');
assert.equal(batch.contexts.length,130,'本批原始上下文');
assert.ok(batch.contexts.every(c=>c.complete===false),'不能擅改完整事件判定');
const expected={
    '+1% Chance to critical strike rewards (x1.5)':'獎勵觸發暴擊（×1.5）的機率：+1%',
    '+5 Max Narcotics':'麻醉品持有上限：+5',
    '1 Followers':'1 名追隨者',
    '10% chance of x2 DMG':'10% 機率造成 2 倍傷害',
    'Artificial Demand':'人為製造需求',
    'Buy up supply to artificially raise Stolen Jewels demand and prices':'買斷供應量，以人為方式提高偷來的珠寶需求與價格',
    'Cannon Barrage':'大砲齊射',
    'Critical Strike':'暴擊',
    'Harvester':'收割者',
    'Hellish Intelect':'地獄智識',
    'Loses +25% Ritual Power':'儀式威力減少 +25%',
    'Loses +50% Ritual Power':'儀式威力減少 +50%',
    'Max Level Reached':'已達最高等級',
    'Sell x1 Replica Artwork':'出售 ×1 件藝術品仿作',
    'Suspicious Barrels':'可疑木桶',
    'Tampered Locks':'遭動過手腳的鎖',
    "Your Gardener can help with harvesting all your 'crops' in one go":'你的園丁能協助你一次收成所有「作物」',
    'Your hypnotic gaze and unethereal presence lures another naive believer...':'你催眠般的目光與不空靈的存在感又誘惑了一名天真的信徒……',
    'x1.5 Cannon Damage':'大砲傷害 ×1.5',
    'x1.5 Store and Jewelry Store Robbery Notoriety':'商店與珠寶店搶劫獲得的惡名 ×1.5',
    'x1.80 Expertise EXP':'專精經驗值 ×1.80'
};
assert.equal(Object.keys(expected).length,originals.length,'全部詞條必須在測試中核對');
for(const source of originals) {
    assert.ok(Object.prototype.hasOwnProperty.call(expected,source),'來源詞條未編列測試：'+source);
    assert.notEqual(lookup(source),null,'未處理的詞條：'+source);
    assert.equal(translateString(source),expected[source],'譯文不一致：'+source);
}
const variable={
    '+5% Chance to critical strike rewards (x2)':'獎勵觸發暴擊（×2）的機率：+5%',
    '+10 Max Narcotics':'麻醉品持有上限：+10',
    '12 Followers':'12 名追隨者',
    '+3 Followers':'追隨者：+3',
    '25% chance of x3 DMG':'25% 機率造成 3 倍傷害',
    'Loses +75% Ritual Power':'儀式威力減少 +75%',
    'Sell x4 Replica Artworks':'出售 ×4 件藝術品仿作',
    'x2 Cannon Damage':'大砲傷害 ×2',
    'x3 Store and Jewelry Store Robbery Notoriety':'商店與珠寶店搶劫獲得的惡名 ×3',
    'x1.05 Expertise EXP':'專精經驗值 ×1.05',
    'Your hypnotic gaze and unethereal presence lures another naive believer... +1 Followers':'你催眠般的目光與不空靈的存在感又誘惑了一名天真的信徒…… +1 名追隨者',
    'Your hypnotic gaze and unethereal presence lures another naive believer... +11 Followers':'你催眠般的目光與不空靈的存在感又誘惑了一名天真的信徒…… +11 名追隨者'
};
for(const [source,want] of Object.entries(variable)) {
    assert.equal(translateString(source),want,'可變數值或完整句：'+source);
}
const event=batch.contexts.find(c=>c.fullText.startsWith('Your hypnotic gaze'));
assert.ok(event,'未保存原始邪教事件');
assert.equal(event.complete,false,'原始事件不完整，不能改為完整');
assert.equal(event.datePrefix,'[D54 Y33]:');
assert.equal(event.fragments.length,4);
function make(parts) {
    const root=new Elem();
    for(const part of parts) {
        if(typeof part==='string')text(root,part);
        else text(element(root,part.tag),part.value);
    }
    return root;
}
const expectedEvent='[D54 Y33]: 你催眠般的目光與不空靈的存在感又誘惑了一名天真的信徒…… +1 名追隨者';
const plain=make(['[D54 Y33]: ','Your hypnotic gaze and unethereal presence lures another naive believer... ','+','1 Followers']);
assert.equal(normalizeCompositeEvent(plain),true,'完整跨節點信徒事件必須翻譯');
assert.equal(plain.textContent,expectedEvent,'原始文字節點翻譯錯誤');
assert.equal(normalizeCompositeEvent(plain),false,'不得二次翻譯相同事件');
const strong=make(['[D54 Y33]: ','Your hypnotic gaze and unethereal presence lures another naive believer... ','+',{tag:'strong',value:'1'},' Followers']);
assert.equal(normalizeCompositeEvent(strong),true,'強調數字的事件必須翻譯');
assert.equal(strong.textContent,expectedEvent,'包含強調節點的事件譯文');
assert.equal(strong.querySelector('strong').textContent,'1','保留強調數值節點');
const unsafe=make(['[D54 Y33]: ','Your hypnotic gaze and unethereal presence lures another naive believer... ','+',{tag:'button',value:'1 Followers'}]);
assert.equal(normalizeCompositeEvent(unsafe),false,'不能修改互動元件');
const labels=['Artificial Demand','Cannon Barrage','Critical Strike','Harvester','Suspicious Barrels','Tampered Locks'];
for(const label of labels)assert.ok(batch.contexts.some(c=>c.fragments.some(f=>f.trim()===label)),'缺少原始名稱與效果的上下文：'+label);
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','更新不得清除原有待翻譯紀錄');
console.log('v0.4.24：21 筆原文、130 筆上下文、動態加成、原文異常保留及跨節點信徒事件測試通過。');
