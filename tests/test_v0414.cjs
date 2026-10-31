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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0414.json'),'utf8'));
const expected={
    '+12% Fake Identity Speed and conservation':'+12% 假身分建立速度與保留機率',
    '+15% Graffiti and Shady Stranger Talk Notoriety':'+15% 塗鴉及與可疑陌生人交談獲得的惡名',
    'Komodo Dragon':'科莫多巨蜥',
    'Python':'蟒蛇'
};
assert.equal(Object.keys(batch.translations).length,4);
assert.equal(batch.contexts.length,0);
for(const [source,translation] of Object.entries(expected)){
    assert.equal(translateString(source),translation,'來源原文：'+source);
}
const variants={
    '+25% Fake Identity Speed and conservation':'+25% 假身分建立速度與保留機率',
    '-2.5% Fake Identity Speed and conservation':'-2.5% 假身分建立速度與保留機率',
    '+7.5% Graffiti and Shady Stranger Talk Notoriety':'+7.5% 塗鴉及與可疑陌生人交談獲得的惡名',
    '-5% Graffiti and Shady Stranger Talk Notoriety':'-5% 塗鴉及與可疑陌生人交談獲得的惡名',
    'Fake Identity':'假身分',
    'Graffiti':'塗鴉',
    'Snow Leopard':'雪豹'
};
for(const [source,translation] of Object.entries(variants)){
    assert.equal(translateString(source),translation,'數值及既有詞條：'+source);
}
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','保留待翻譯紀錄');
console.log('v0.4.14：4 筆來源、4 組動態數值與 3 個既有詞條測試通過。');
