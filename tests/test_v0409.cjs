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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0409.json'),'utf8'));
const expected={
  "+15% Mugging, Robbery, and Casino Robbery Money": "+15% 行搶、搶劫及賭場搶劫的金錢收益",
  "+15% Pickpocket and Shoplift Money": "+15% 扒竊及商店行竊的金錢收益",
  "+15% Research Speed": "+15% 研究速度",
  "+15% Sell Prices": "+15% 出售價格",
  "+25% Global Money": "+25% 全域金錢",
  "Brown Bear": "棕熊",
  "Chimpanzee": "黑猩猩",
  "Elephant": "大象",
  "Ending in 4 Days": "將於 4 天後結束",
  "Ending in 5 Days": "將於 5 天後結束",
  "Exotic Wildlife Trade": "珍奇野生動物交易",
  "Panda": "熊貓",
  "Snow Leopard": "雪豹",
  "Tiger": "老虎",
  "Wildlife Trade": "野生動物交易",
  "You have been invited to the Exotic Wildlife Trade": "你收到了珍奇野生動物交易的邀請",
  "You try to steer your ship away from the aggressive Navy Ship, but the winds are not on your side": "你試圖駕船避開那艘具有敵意的海軍艦艇，但風向對你不利"
};
assert.equal(Object.keys(batch).length,17);
assert.equal(Object.keys(expected).length,17);
for(const key of Object.keys(batch))assert.equal(translateString(key),expected[key],'本批原文：'+key);
const variants={
    '+8% Mugging, Robbery, and Casino Robbery Money':'+8% 行搶、搶劫及賭場搶劫的金錢收益',
    '+2.5% Pickpocket and Shoplift Money':'+2.5% 扒竊及商店行竊的金錢收益',
    '-3% Research Speed':'-3% 研究速度',
    '+28% Sell Prices':'+28% 出售價格',
    '+45% Global Money':'+45% 全域金錢',
    'Ending in 1 Day':'將於 1 天後結束',
    'Ending in 12 Days':'將於 12 天後結束',
    'Navy Ship':'海軍艦艇',
    'Casino Robbery':'賭場搶劫',
    'Zodiacs':'十二星座',
    'Custom Label:':'使用者標籤：'
};
for(const [key,val] of Object.entries(variants))assert.equal(translateString(key),val,'變動值與既有詞條：'+key);
// 天數與百分比被分離成粗體數字時，也應翻譯且保留 DOM 結構。
for(const [start,num,end,want] of [
    ['Ending in ','4',' Days','將於 4 天後結束'],
    ['Ending in ','12',' Days','將於 12 天後結束'],
    ['+','15','% Sell Prices','+15% 出售價格'],
    ['+','25','% Global Money','+25% 全域金錢']
]) {
    const el=new Elem();
    text(el,start);
    const bold=element(el,'strong');text(bold,num);
    text(el,end);
    assert.equal(normalizeCompositeEvent(el),true,'跨節點轉譯：'+start+num+end);
    assert.equal(el.textContent,want);
    assert.equal(bold.textContent,num);
    assert.equal(normalizeCompositeEvent(el),false,'不可重複翻譯');
}
const unsafe=new Elem();
text(unsafe,'Ending in ');
const button=element(unsafe,'button');text(button,'4');
text(unsafe,' Days');
assert.equal(normalizeCompositeEvent(unsafe),false,'不可修改互動元素');
const icon={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
translateText(icon);assert.equal(icon.nodeValue,'settings');
const ordinary={nodeType:3,nodeValue:'settings',parentElement:new Elem()};
translateText(ordinary);assert.equal(ordinary.nodeValue,'設定');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','舊版待翻譯記錄不得清除');
console.log('v0.4.9：17 筆原文、11 組變動與既有詞條、4 組粗體節點、圖示與儲存測試通過。');
