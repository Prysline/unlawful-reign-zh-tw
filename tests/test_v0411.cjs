'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = script.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,normalizeCompositeEvent,normalizeSplitFragment};\n})();');
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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0411.json'),'utf8'));
const samples={
    '+ Gang Passive Income boosted by +25% (+5% Per Lvl)':'＋幫派被動收入增加 +25%（每級 +5%）',
    '300 Doubloons and':'300 枚杜布隆金幣及',
    'You strike a burried treasure chest, containing':'你挖到一個埋藏的寶箱，裡面有'
};
assert.equal(Object.keys(batch).length,3);
for(const [original,expected] of Object.entries(samples)){
    assert.equal(translateString(original),expected,'匯出片段：'+original);
}
const start='You strike a burried treasure chest, containing ';
const full=start+'+300 Doubloons and +10 Stolen Jewels!';
const mixed=start+'+300 Doubloons and +偷來的珠寶：10!';
const expected='你挖到一個埋藏的寶箱，裡面有 +300 枚杜布隆金幣及 +10 件偷來的珠寶！';
assert.equal(translateString(full),expected,'完整原文');
assert.equal(translateString(mixed),expected,'混合中文與英文的完整句');
assert.equal(translateString(start+'+900 Doubloons and +40 Stolen Jewels!'),
    '你挖到一個埋藏的寶箱，裡面有 +900 枚杜布隆金幣及 +40 件偷來的珠寶！');
for(const [isMixed,form] of [[false,'raw'],[true,'mixed']]){
    const el=new Elem();
    text(el,'［第 14 天／第 14 年］： '+start);
    const gold=element(el,'strong');text(gold,'+300');
    text(el,' Doubloons and +');
    const jewel=element(el,'strong');
    text(jewel,isMixed?'偷來的珠寶：10':'10');
    text(el,isMixed?'!':' Stolen Jewels!');
    assert.equal(normalizeCompositeEvent(el),true,'跨節點事件：'+form);
    assert.equal(el.textContent,'［第 14 天／第 14 年］： '+expected);
    assert.equal(gold.textContent,'+300','金幣粗體數值保留');
    assert.equal(jewel.textContent,isMixed?'10':'10','珠寶粗體仍保留');
    assert.equal(normalizeCompositeEvent(el),false,'不得重複翻譯');
}
const unsafe=new Elem();
text(unsafe,start+'+300 Doubloons and +');
const button=element(unsafe,'button');text(button,'10');
text(unsafe,' Stolen Jewels!');
assert.equal(normalizeCompositeEvent(unsafe),false,'不可修改互動控制');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','不得清除原有待翻譯記錄');
console.log('v0.4.11：3 筆新增片段、完整與混合句型、動態數值、跨粗體節點及互動控制保護測試通過。');
