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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0419.json'),'utf8'));
const originals=Object.keys(batch.translations);
assert.equal(originals.length,10,'來源詞條數量');
assert.equal(batch.contexts.length,74,'原始上下文數量');
assert.equal(batch.contexts.filter(x=>x.complete).length,0,'原檔未確認任何完整事件');
for(const original of originals){
    assert.notEqual(lookup(original),null,'尚未處理的原文：'+original);
}
const expected={
    '1/32 pieces found':'已找到 1/32 塊碎片',
    'Arcane Tome':'奧術典籍',
    "Charmcaster's Bauble":'魅惑術士的飾物',
    'Eclipse Mask':'日蝕面具',
    'Ethereal Chalice':'虛靈聖杯',
    "Monarch's Ring":'君主之戒',
    'Opulent Amulet':'華麗護符',
    'Tempest Medallion':'暴風勳章',
    "You heist the museum's artifact collection, stealing a piece of 'Monarch's Ring'":'你洗劫博物館的古物收藏，偷走了一塊「君主之戒」的碎片',
    "You're prepared to heist the museum's artifact collection":'你已做好洗劫博物館古物收藏的準備'
};
for(const [original,want] of Object.entries(expected)){
    assert.equal(translateString(original),want,'來源文字：'+original);
}
const variants={
    '0/32 pieces found':'已找到 0/32 塊碎片',
    '32/32 pieces found':'已找到 32/32 塊碎片',
    '1/8 piece found':'已找到 1/8 塊碎片',
    "You heist the museum's artifact collection, stealing a piece of 'Charmcaster's Bauble'":'你洗劫博物館的古物收藏，偷走了一塊「魅惑術士的飾物」的碎片',
    "You heist the museum's artifact collection, stealing a piece of 'Ethereal Chalice'":'你洗劫博物館的古物收藏，偷走了一塊「虛靈聖杯」的碎片'
};
for(const [original,want] of Object.entries(variants)){
    assert.equal(translateString(original),want,'不同古物及動態進度：'+original);
}
function build(parts){
    const result=new Elem();
    for(const part of parts){
        if(typeof part==='string')text(result,part);
        else text(element(result,part.tag),part.value);
    }
    return result;
}
const date='[D51 Y27]: ';
function checkEvent(name,parts,expected,strongWant){
    const root=build(parts);
    assert.equal(normalizeCompositeEvent(root),true,'未能比對跨節點句：'+name);
    assert.equal(root.textContent,date+expected,'跨節點結果有誤：'+name);
    if(strongWant){
        const bold=root.querySelector('strong');
        assert.ok(bold,'粗體節點仍應存在');
        assert.equal(bold.textContent,strongWant,'古物名稱應在原有粗體節點：'+name);
    }
    assert.equal(normalizeCompositeEvent(root),false,'不能二次改寫已翻譯事件：'+name);
}
checkEvent('兩個原始文字節點',
    [date,"You heist the museum's artifact collection, stealing a piece of 'Monarch's Ring'"],
    '你洗劫博物館的古物收藏，偷走了一塊「君主之戒」的碎片');
checkEvent('撇號位於粗體古物名稱',
    [date,"You heist the museum's artifact collection, stealing a piece of '",{tag:'strong',value:"Monarch's Ring"},"'"],
    '你洗劫博物館的古物收藏，偷走了一塊「君主之戒」的碎片','君主之戒');
checkEvent('古物名稱本身被拆成兩個節點',
    [date,"You heist the museum's artifact collection, stealing a piece of '",{tag:'strong',value:"Charmcaster's"}," Bauble'"],
    '你洗劫博物館的古物收藏，偷走了一塊「魅惑術士的飾物」的碎片','魅惑術士的飾物');
const unsafe=build([date,"You heist the museum's artifact collection, stealing a piece of '",{tag:'button',value:"Monarch's Ring"},"'"]);
assert.equal(normalizeCompositeEvent(unsafe),false,'不可更改可互動的文字節點');
const collected=batch.contexts.find(x=>x.fullText.startsWith("You heist the museum's artifact collection"));
assert.ok(collected,'原始劫案上下文必須存在');
assert.equal(collected.complete,false,'不可把未確認句子標記為完整');
assert.equal(collected.datePrefix,'[D51 Y27]:');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','既有待翻譯清單不得清除');
console.log('v0.4.19：10 筆來源、74 筆上下文、七種古物名稱、進度變化、撇號與跨節點事件測試通過。');
