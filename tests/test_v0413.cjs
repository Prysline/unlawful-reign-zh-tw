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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0413.json'),'utf8'));
const expected={
  '+ Chance to get away with crime +10% (+2% Per Lvl)':'＋犯罪後逃過追究的機率 +10%（每級 +2%）',
  '+ Gang Passive Income boosted by +25% (+5% Per Lvl)':'＋幫派被動收入增加 +25%（每級 +5%）',
  '+1 Treasure Map':'藏寶圖：+1',
  '300 Doubloons and':'300 枚杜布隆金幣及',
  'Loses +0.25 Souls per Gang Member (+4 Total) per Sacrifice':'每次獻祭失去的靈魂：每名幫派成員 +0.25（總計 +4）',
  'Saves 1 Not. per day':'每天節省 1 點惡名',
  'You strike a burried treasure chest, containing':'你挖到一個埋藏的寶箱，裡面有',
  'You use your Stealth expertise to sneak away before your crimes are found out...':'你運用潛行專精，在自己的罪行被發現之前悄悄離開……'
};
assert.equal(Object.keys(batch).length,8);
for(const [source,translated] of Object.entries(expected)){
  assert.equal(translateString(source),translated,'匯出原文：'+source);
}
const variations={
  '+ Chance to get away with crime +24% (+4% Per Lvl)':'＋犯罪後逃過追究的機率 +24%（每級 +4%）',
  '-2 Treasure Maps':'藏寶圖：-2',
  '+15 Treasure Maps':'藏寶圖：+15',
  'Loses +1.25 Souls per Gang Member (+20 Total) per Sacrifice':'每次獻祭失去的靈魂：每名幫派成員 +1.25（總計 +20）',
  'Loses 0.5 Souls per Gang Member (8 Total) per Sacrifice':'每次獻祭失去的靈魂：每名幫派成員 0.5（總計 8）',
  'Saves 10 Not. per day':'每天節省 10 點惡名',
  '+ Gang Passive Income boosted by +40% (+8% Per Lvl)':'＋幫派被動收入增加 +40%（每級 +8%）',
  '500 Doubloons and':'500 枚杜布隆金幣及'
};
for(const [source,translated] of Object.entries(variations)){
  assert.equal(translateString(source),translated,'可變數值：'+source);
}
const known=new Elem();
text(known,'［第 14 天／第 14 年］： You strike a burried treasure chest, containing ');
const bold=element(known,'strong');text(bold,'+300');
text(known,' Doubloons and +');
const jewel=element(known,'strong');text(jewel,'10');
text(known,' Stolen Jewels!');
assert.equal(normalizeCompositeEvent(known),true);
assert.equal(known.textContent,'［第 14 天／第 14 年］： 你挖到一個埋藏的寶箱，裡面有 +300 枚杜布隆金幣及 +10 件偷來的珠寶！');
assert.equal(bold.textContent,'+300');
assert.equal(jewel.textContent,'10');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'');
console.log('v0.4.13：8 筆來源文字、8 組數值變化、舊版尋寶跨節點與紀錄保護通過。');
