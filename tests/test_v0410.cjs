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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0410.json'),'utf8'));
const expected={
    '+15% Pickpocket and Shoplift Money':'+15% 扒竊及商店行竊的金錢收益',
    '+15% Research Speed':'+15% 研究速度',
    'Chimpanzee':'黑猩猩',
    'Elephant':'大象',
    'Ending in 1 Days':'將於 1 天後結束',
    'Ending in 2 Days':'將於 2 天後結束',
    'Exotic Wildlife Trade':'珍奇野生動物交易',
    'Save exported to unlawful_reign_save.txt.':'存檔已匯出至 unlawful_reign_save.txt。',
    'Snow Leopard':'雪豹',
    'Takes 10 days to readjust':'需要 10 天重新適應',
    'The Navy Ship fires their cannons, dealing':'海軍艦艇開砲，造成',
    'Wildlife Trade':'野生動物交易',
    'Your ship rams into the side of the Navy Ship, dealing':'你的船撞向海軍艦艇的側舷，造成'
};
assert.equal(Object.keys(batch).length,13);
assert.equal(Object.keys(expected).length,13);
for(const key of Object.keys(batch))assert.equal(translateString(key),expected[key],'本批原文：'+key);
for(const [key,value] of Object.entries({
    'Takes 1 day to readjust':'需要 1 天重新適應',
    'Takes 27 days to readjust':'需要 27 天重新適應',
    'Ending in 7 Days':'將於 7 天後結束',
    '-5% Research Speed':'-5% 研究速度',
    'Your fire your cannons at the Navy Ship, dealing':null
})){
    if(value!==null)assert.equal(translateString(key),value,'動態格式：'+key);
}
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'');
console.log('v0.4.10：13 筆原文、4 組動態變化與儲存測試通過。');
