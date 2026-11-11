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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0429.json'),'utf8'));
const source=Object.keys(batch.translations);
assert.equal(source.length,22,'原始待翻譯數量');
assert.equal(batch.contexts.length,181,'原始上下文數量');
assert.equal(batch.contexts.filter(x=>x.complete).length,0,'全部保留原始未確認狀態');
const expected={
    '+1 Art gallery plan heist speed':'美術館劫案策劃速度：+1',
    '+10% Pickpocket Stolen Jewels chance':'扒竊取得偷來的珠寶的機率：+10%',
    '+15% Notoriety if criminal status >= 5':'犯罪狀態 ≥ 5 時，惡名 +15%',
    '1K 份補給品':'1K 份補給品',
    'Art school arrogance stitched into a hat that begs to be seen at the scene':'藝術學院的傲慢縫進了一頂迫不及待想在現場引人注目的帽子裡',
    'Find x1.4 more Doubloons when diving Shipwrecks':'潛入沉船時找到的杜布隆金幣數量 ×1.4',
    'French Beret':'法式貝雷帽',
    'Gallery Floor Plans':'美術館樓層平面圖',
    "Gambler's Getaway":'賭徒的脫身之道',
    'Life Buoy Ring':'救生圈',
    'Midas Touch':'點石成金',
    'Reduce Casino Robbery crime and max crime penalty by 1':'賭場搶劫的犯罪值與最高犯罪懲罰各減少 1',
    'Reinforced Diving Bell':'強化潛水鐘',
    'Removed unripe narcotics plant, refunded':'移除了未成熟的麻醉品植株，退還',
    'Save capsized crewmates and earn their loyalty':'救起遭遇翻船的船員，並贏得他們的忠誠',
    "Thief's Toolbag":'竊賊工具袋',
    'Whale Status':'豪賭客身分',
    'Wildly Notorious':'極度惡名昭彰',
    'x1.2 Deface Artwork Notoriety':'污損藝術品獲得的惡名 ×1.2',
    'x2.5 Gamble amount':'賭博金額 ×2.5',
    'x3.83 Expertise EXP (33 days)':'專精經驗值 ×3.83（33 天）',
    '你花費 1.9K 枚杜布隆金幣，雇用一名新船員登船':'你花費 1.9K 枚杜布隆金幣，雇用一名新船員登船'
};
assert.equal(Object.keys(expected).length,source.length);
for(const original of source){
    assert.ok(Object.prototype.hasOwnProperty.call(expected,original),'測試缺少來源詞條：'+original);
    assert.notEqual(lookup(original),null,'來源文字沒有規則：'+original);
    assert.equal(translateString(original),expected[original],'翻譯與來源不符：'+original);
    assert.equal(/原文異常|無法確認/.test(translateString(original)),false,'玩家畫面不得加入維護註記：'+original);
}
const variable={
    '+10 Art gallery plan heist speed':'美術館劫案策劃速度：+10',
    '+35% Pickpocket Stolen Jewels chance':'扒竊取得偷來的珠寶的機率：+35%',
    '+5% Notoriety if criminal status >= 7':'犯罪狀態 ≥ 7 時，惡名 +5%',
    'Find x2.25 more Doubloons when diving Shipwrecks':'潛入沉船時找到的杜布隆金幣數量 ×2.25',
    'Reduce Casino Robbery crime and max crime penalty by 2':'賭場搶劫的犯罪值與最高犯罪懲罰各減少 2',
    'x1.65 Deface Artwork Notoriety':'污損藝術品獲得的惡名 ×1.65',
    'x3 Gamble amount':'賭博金額 ×3',
    'x1.80 Expertise EXP (4 days)':'專精經驗值 ×1.80（4 天）',
    'x2.5 Expertise EXP (1 day)':'專精經驗值 ×2.5（1 天）',
    'Removed unripe narcotics plant, refunded +$1.5K':'移除了未成熟的麻醉品植株，退還 +$1.5K'
};
for(const [original,want] of Object.entries(variable)){
    assert.equal(translateString(original),want,'動態數值不符合來源：'+original);
}
for(const phrase of [
    '1K 份補給品',
    '20M 份補給品',
    '你花費 1.9K 枚杜布隆金幣，雇用一名新船員登船',
    '你花費 25M 枚杜布隆金幣，雇用一名新船員登船'
]){
    assert.equal(context.testAPI.isUntranslatedSource(phrase),false,'已中文化內容不應收集：'+phrase);
    assert.equal(translateString(phrase),phrase,'已中文化內容不應改寫：'+phrase);
}
const refund=batch.contexts.find(x=>x.fullText==='Removed unripe narcotics plant, refunded +$480');
assert.ok(refund,'來源退款事件不得遺漏');
assert.equal(refund.complete,false,'原始退款事件未確認完整');
assert.equal(refund.datePrefix,'[D24 Y40]:','原始事件日期');
assert.deepEqual(refund.fragments,['[D24 Y40]: ','Removed unripe narcotics plant, refunded ','+','$480']);
function make(parts){
    const root=new Elem();
    for(const part of parts) {
        if(typeof part==='string')text(root,part);
        else text(element(root,part.tag),part.value);
    }
    return root;
}
function verify(name,parts,want,boldWant) {
    const root=make(parts);
    assert.equal(normalizeCompositeEvent(root),true,'無法辨識事件：'+name);
    assert.equal(root.textContent,want,'事件譯文不符：'+name);
    if(boldWant) {
        const strong=root.querySelector('strong');
        assert.ok(strong,'應保留粗體節點：'+name);
        assert.equal(strong.textContent,boldWant,'不可改動粗體金額：'+name);
    }
    assert.equal(normalizeCompositeEvent(root),false,'不可重複翻譯：'+name);
}
verify('原始退款節點',
    ['[D24 Y40]: ','Removed unripe narcotics plant, refunded ','+','$480'],
    '[D24 Y40]: 移除了未成熟的麻醉品植株，退還 +$480');
verify('退款金額為粗體',
    ['[D24 Y40]: ','Removed unripe narcotics plant, refunded ','+',{tag:'strong',value:'$480'}],
    '[D24 Y40]: 移除了未成熟的麻醉品植株，退還 +$480','$480');
verify('可變退款金額',
    ['[D24 Y40]: ','Removed unripe narcotics plant, refunded ','+',{tag:'strong',value:'$1.5K'}],
    '[D24 Y40]: 移除了未成熟的麻醉品植株，退還 +$1.5K','$1.5K');
const unsafe=make(['[D24 Y40]: ','Removed unripe narcotics plant, refunded ','+',{tag:'button',value:'$480'}]);
assert.equal(normalizeCompositeEvent(unsafe),false,'不得修改互動控制');
for(const [name,description] of [
    ['French Beret','x1.2 Deface Artwork Notoriety'],
    ['Gallery Floor Plans','+1 Art gallery plan heist speed'],
    ["Gambler's Getaway",'Reduce Casino Robbery crime and max crime penalty by 1'],
    ['Reinforced Diving Bell','Find x1.4 more Doubloons when diving Shipwrecks'],
    ['Whale Status','x2.5 Gamble amount'],
    ['Wildly Notorious','+15% Notoriety if criminal status >= 5']
]){
    assert.ok(batch.contexts.some(c=>c.fragments.some(f=>f.trim()===name)&&c.fragments.some(f=>f.trim()===description)),'來源裝備效果對應：'+name);
}
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','不可清除既有待翻譯紀錄');
console.log('v0.4.29：22 筆詞條、181 筆上下文、動態加成、已翻譯數值排除及跨節點退款事件測試通過。');
