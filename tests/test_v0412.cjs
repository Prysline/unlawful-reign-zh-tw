'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = script.replace(/\}\)\(\);\s*$/, [
    'globalThis.testAPI={scanWithOriginalCapture,sourceTextNodes,untranslatedContexts,exportUntranslated,',
    'collectOriginalContexts};',
    '})();'
].join(''));
assert.notEqual(instrumented, script, '找不到使用者腳本結尾');

class Elem {
    constructor(tag='div', icon=false) {
        this.nodeType=1; this.tagName=tag.toUpperCase(); this.parentElement=null;
        this.childNodes=[]; this.icon=icon; this.attributes={};
    }
    get textContent() {
        return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');
    }
    closest() { return null; }
    getAttribute(name) { return this.attributes[name]??null; }
    querySelector(selector) {
        const names=selector.split(',').map(x=>x.trim().toUpperCase()).filter(x=>/^[A-Z]+$/.test(x));
        const visit=elem=>{
            for (const child of elem.childNodes) {
                if(child.nodeType!==1)continue;
                if(names.includes(child.tagName))return child;
                const nested=visit(child); if(nested)return nested;
            }
            return null;
        };
        return visit(this);
    }
}
function text(parent, content) {
    const node={nodeType:3,nodeValue:content,parentElement:parent};
    parent.childNodes.push(node);
    return node;
}
function element(parent, tag='span', icon=false) {
    const node=new Elem(tag,icon);node.parentElement=parent;parent.childNodes.push(node);return node;
}
const storage={ur_zh_tw_custom:{},ur_zh_tw_untranslated:{'保留舊紀錄':''}};
const commands={};
let exported=null;
const document={
    body:null,
    addEventListener(){},
    createElement(){return {click(){},remove(){},href:'',download:''};},
    createTreeWalker(root,mask) {
        const nodes=[];
        const walk=elem=>{
            for(const child of elem.childNodes){
                if(child.nodeType===3 && (mask & 4))nodes.push(child);
                if(child.nodeType===1){
                    if(mask & 1)nodes.push(child);
                    walk(child);
                }
            }
        };
        walk(root);
        let i=0;
        return {nextNode:()=>nodes[i++]??null};
    }
};
const context={
    Element:Elem,HTMLInputElement:class{},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
    NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    MutationObserver:class{disconnect(){} observe(){}},
    document,window:{addEventListener(){}},
    GM_getValue:(key,fallback)=>storage[key]??fallback,
    GM_setValue:(key,value)=>{storage[key]=value;},
    GM_registerMenuCommand:(name,handler)=>{commands[name]=handler;},
    getComputedStyle:node=>({fontFamily:node.icon?'Material Symbols Outlined':'Arial'}),
    URL:{createObjectURL(blob){exported=blob.source;return 'blob:test';},revokeObjectURL(){}},
    Blob:class{constructor(parts){this.source=parts.join('');}},
    setTimeout(){},alert(){},confirm:()=>true,
    requestAnimationFrame:fn=>fn()
};
vm.createContext(context);
vm.runInContext(instrumented,context);
const api=context.testAPI;
function assertContext(prefix) {
    const found=Object.values(api.untranslatedContexts).find(c=>c.fullText.startsWith(prefix));
    assert.ok(found,'找不到事件上下文：'+prefix);
    return found;
}

// 原始事件由數個節點構成，且其中一部分可能有既有譯文。
const log=new Elem();
const start=text(log,'［第 14 天／第 14 年］： An unknown encounter grants ');
const bold=element(log,'strong');
const coins=text(bold,'+300');
text(log,' Doubloons and +');
const jewel=element(log,'strong');
text(jewel,'10');
text(log,' Stolen Jewels!');
api.scanWithOriginalCapture(log);
let ctx=assertContext('An unknown encounter');
assert.equal(ctx.fullText,'An unknown encounter grants +300 Doubloons and +10 Stolen Jewels!');
assert.equal(ctx.datePrefix,'［第 14 天／第 14 年］：');
assert.equal(ctx.complete,true);
assert.deepEqual(Array.from(ctx.fragments),[
    '［第 14 天／第 14 年］： An unknown encounter grants ',
    '+300',' Doubloons and +','10',' Stolen Jewels!'
]);
const firstCount=Object.keys(api.untranslatedContexts).length;
api.scanWithOriginalCapture(log);
assert.equal(Object.keys(api.untranslatedContexts).length,firstCount,'重複掃描不得新增相同上下文');

// 遊戲變更原有文字節點時，應更新原始值而非沿用上一次數值。
coins.nodeValue='+700';
api.scanWithOriginalCapture(log);
assert.equal(api.sourceTextNodes.get(coins).original,'+700');
assert.equal(Object.keys(api.untranslatedContexts).length,firstCount,'相同句型、不同數值應去重');

// 已有完整翻譯規則的事件不應當作新待翻譯資料。
const known=new Elem();
const knownStart=text(known,'［第 14 天／第 14 年］： You strike a burried treasure chest, containing ');
text(element(known,'strong'),'+300');
text(known,' Doubloons and +');
text(element(known,'strong'),'10');
text(known,' Stolen Jewels!');
api.scanWithOriginalCapture(known);
assert.match(known.textContent,/你挖到一個埋藏的寶箱/);
api.scanWithOriginalCapture(known);
assert.match(api.sourceTextNodes.get(knownStart).original,/You strike a burried/,'再次掃描不得覆蓋英文原文');
assert.equal(Object.values(api.untranslatedContexts).filter(c=>c.fullText.includes('You strike a burried')).length,0);

// 只有一個文字節點的事件，也應保存完整上下文。
const single=new Elem();
text(single,'［第 1 天／第 2 年］： A different unknown event occurs.');
api.scanWithOriginalCapture(single);
assert.equal(assertContext('A different unknown event').complete,true);

// 分批出現的事件應用完整快照取代舊的未完成紀錄。
const partial=new Elem();
text(partial,'［第 2 天／第 2 年］： A fragmentary event gives ');
text(partial,'+42');
api.scanWithOriginalCapture(partial);
assert.equal(assertContext('A fragmentary event').complete,false);
const ending=text(partial,' coins!');
api.scanWithOriginalCapture(ending);
assert.equal(assertContext('A fragmentary event').fullText,'A fragmentary event gives +42 coins!');
assert.equal(assertContext('A fragmentary event').complete,true);
assert.equal(Object.values(api.untranslatedContexts).filter(c=>c.fullText.startsWith('A fragmentary event')).length,1);

// 互動控制與圖示內容不可收集為事件文字。
const unsafe=new Elem();
text(unsafe,'［第 3 天／第 3 年］： A secret event grants ');
text(element(unsafe,'button'),'5');
text(unsafe,' coins!');
api.scanWithOriginalCapture(unsafe);
assert.equal(Object.values(api.untranslatedContexts).some(c=>c.fullText.includes('A secret event')),false);

// 既有匯入格式可直接使用 translations；完整上下文另存在 contexts。
document.body={appendChild(){}};
api.exportUntranslated();
const output=JSON.parse(exported);
assert.ok(output.translations);
assert.ok(Array.isArray(output.contexts));
assert.ok(output.contexts.some(c=>c.fullText.startsWith('An unknown encounter')));
assert.ok(!output.contexts.some(c=>c.fullText.startsWith('You strike a burried')));
assert.equal(storage.ur_zh_tw_untranslated['保留舊紀錄'],'');
commands['清除已收集的待翻譯文字']();
assert.equal(Object.keys(storage.ur_zh_tw_untranslated).length,0);
assert.equal(Object.keys(storage.ur_zh_tw_contexts).length,0);

console.log('v0.4.12：完整原文、片段、分批事件、單節點事件、已翻譯過濾、數值去重、匯出與清除測試通過。');
