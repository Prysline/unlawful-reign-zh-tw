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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0417.json'),'utf8'));
const keys=Object.keys(batch.translations);
assert.equal(keys.length,4);
assert.equal(batch.contexts.length,45);
assert.equal(batch.contexts.filter(c=>c.complete).length,1);
const expected={
  '+$1.1K (80%)':'+$1.1K (80%)',
  'The alarms go off and the police come rushing to the scene, catching you!':'警報響起，警察迅速趕到現場並抓住了你！',
  'You continue making detailed heist preparations...':'你繼續進行詳盡的劫案準備……',
  'You continue to decipher cryptic symbols and pirate texts...':'你繼續解讀晦澀的符號與海盜文字……'
};
for(const [source,want] of Object.entries(expected)){
    assert.notEqual(lookup(source),null,'待翻譯詞條未被處理：'+source);
    assert.equal(translateString(source),want,'來源文字翻譯：'+source);
}
assert.equal(context.testAPI.isUntranslatedSource('+$1.1K (80%)'),false,'只有金額與百分比的文字不應再收集');
assert.equal(context.testAPI.isUntranslatedSource('+$4.5M (42.5%)'),false,'不同金額及百分比亦不需收集');

const fullVariants={
 'You continue making detailed heist preparations... (5/100)':'你繼續進行詳盡的劫案準備…… (5/100)',
 'You continue making detailed heist preparations... (47/120)':'你繼續進行詳盡的劫案準備…… (47/120)',
 'You continue to decipher cryptic symbols and pirate texts... (10/100)':'你繼續解讀晦澀的符號與海盜文字…… (10/100)',
 'You continue to decipher cryptic symbols and pirate texts... (95/100)':'你繼續解讀晦澀的符號與海盜文字…… (95/100)'
};
for(const [source,want] of Object.entries(fullVariants)){
    assert.equal(translateString(source),want,'進度數值可變的完整句：'+source);
}
for(const [source,progress,want] of [
    ['You continue making detailed heist preparations... ','(5/100)','你繼續進行詳盡的劫案準備…… (5/100)'],
    ['You continue to decipher cryptic symbols and pirate texts... ','(10/100)','你繼續解讀晦澀的符號與海盜文字…… (10/100)']
]){
    const log=new Elem();
    text(log,'[D71 Y23]: ');
    text(log,source);
    const progressNode=element(log,'strong');
    text(progressNode,progress);
    assert.equal(normalizeCompositeEvent(log),true,'原句跨節點：'+source);
    assert.equal(log.textContent,'[D71 Y23]: '+want,'跨節點翻譯不得破壞前綴或進度');
    assert.equal(progressNode.textContent,progress,'粗體進度原樣保留');
    assert.equal(normalizeCompositeEvent(log),false,'不可重複修改已完成的中文事件');
}
const unsafe=new Elem();
text(unsafe,'You continue making detailed heist preparations... ');
text(element(unsafe,'button'),'(5/100)');
assert.equal(normalizeCompositeEvent(unsafe),false,'不可修改互動控制');
const caught=batch.contexts.find(c=>c.fullText.startsWith('The alarms go off'));
assert.ok(caught);
assert.equal(caught.complete,true);
const heist=batch.contexts.find(c=>c.fullText.startsWith('You continue making detailed'));
const pirate=batch.contexts.find(c=>c.fullText.startsWith('You continue to decipher'));
assert.equal(heist.complete,false,'進度事件原始紀錄未確認完整');
assert.equal(pirate.complete,false,'海盜地圖事件原始紀錄未確認完整');
assert.equal(heist.fragments.length,3);
assert.equal(pirate.fragments.length,3);
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','應保留既有未翻譯紀錄');
console.log('v0.4.17：4 筆來源、45 筆上下文、動態進度、跨粗體節點、數字排除與互動控制保護通過。');
