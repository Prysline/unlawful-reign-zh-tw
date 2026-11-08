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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0425.json'),'utf8'));
const terms=Object.keys(batch.translations);
assert.equal(terms.length,20,'來源待翻譯詞條數量');
assert.equal(batch.contexts.length,142,'原始上下文數量');
assert.ok(batch.contexts.every(item=>item.complete===false),'上下文原始完整度標籤不可修改');
const expected={
    'Clean cuts, quick harvests, and a suspiciously well-trimmed garden':'俐落的修剪、迅速的收成，以及修整得可疑地整齊的花園',
    'Crowded, slowing down growth by 20%':'過於擁擠，使生長速度降低 20%',
    'Deal 25 DMG (10% chance of x2 DMG)':'造成 25 點傷害（10% 機率造成 2 倍傷害）',
    'Flammable Supply':'易燃補給品',
    'High Roller Wash':'豪賭客洗錢',
    'Narcotics':'麻醉品',
    'Out of Harpoons':'魚叉已用盡',
    'Pay':'支付',
    'Plants +1 Narcotics':'種植 +1 份麻醉品',
    'Plants +2 Narcotics':'種植 +2 份麻醉品',
    'Plants +5 Narcotics':'種植 +5 份麻醉品',
    'Plants +6 Narcotics':'種植 +6 份麻醉品',
    'Plants +7 Narcotics':'種植 +7 份麻醉品',
    'Plants +8 Narcotics':'種植 +8 份麻醉品',
    'Plants +9 Narcotics':'種植 +9 份麻醉品',
    'Pruning Shears':'修枝剪',
    'Superstore Partnership':'大型賣場合作關係',
    'less when Busted (':'被逮捕時少支付（',
    'x1.1 Narcotics growth speed':'麻醉品生長速度 ×1.1',
    'x1.5 Casino Launder Money Amount':'賭場洗錢金額 ×1.5'
};
assert.equal(Object.keys(expected).length,20);
for(const source of terms) {
    assert.ok(Object.prototype.hasOwnProperty.call(expected,source),'來源沒有列入逐項測試：'+source);
    assert.notEqual(lookup(source),null,'缺少翻譯規則：'+source);
    assert.equal(translateString(source),expected[source],'固定或動態翻譯：'+source);
}
const variations={
    'Crowded, slowing down growth by 45%':'過於擁擠，使生長速度降低 45%',
    'Deal 50 DMG (25% chance of x3 DMG)':'造成 50 點傷害（25% 機率造成 3 倍傷害）',
    'Deal 1.5K DMG (12.5% chance of x2.5 DMG)':'造成 1.5K 點傷害（12.5% 機率造成 2.5 倍傷害）',
    'Plants +20 Narcotics':'種植 +20 份麻醉品',
    'Plants -2 Narcotics':'種植 -2 份麻醉品',
    'x1.25 Narcotics growth speed':'麻醉品生長速度 ×1.25',
    'x2 Casino Launder Money Amount':'賭場洗錢金額 ×2',
    'Pay 0% less when Busted (-2%/Employee)':'被逮捕時少支付 0%（每名員工 -2%）',
    'Pay 15% less when Busted (-3%/Employee)':'被逮捕時少支付 15%（每名員工 -3%）'
};
for(const [source,want] of Object.entries(variations)) {
    assert.equal(translateString(source),want,'可變數值與事件：'+source);
}
const payContext=batch.contexts.find(c=>c.fullText.startsWith('Pay  0%'));
assert.ok(payContext,'公司被捕費用的原始上下文需存在');
assert.equal(payContext.complete,false);
assert.deepEqual(payContext.fragments.map(x=>x.trim()),['Pay','0%','less when Busted (','-2%','/Employee)']);
const cannon=batch.contexts.find(c=>c.fullText.startsWith('Deal 25 DMG (10%'));
assert.ok(cannon);
assert.equal(cannon.complete,false);
function make(parts) {
    const root=new Elem();
    for(const item of parts) {
        if(typeof item==='string')text(root,item);
        else text(element(root,item.tag),item.value);
    }
    return root;
}
function checkEvent(name,parts,want,boldWant) {
    const root=make(parts);
    assert.equal(normalizeCompositeEvent(root),true,'跨節點辨識失敗：'+name);
    assert.equal(root.textContent,want,'跨節點譯文不符：'+name);
    if(boldWant) {
        const b=root.querySelector('strong');
        assert.ok(b,'保留粗體節點：'+name);
        assert.equal(b.textContent,boldWant,'粗體數值不應變動：'+name);
    }
    assert.equal(normalizeCompositeEvent(root),false,'不可重複改寫：'+name);
}
checkEvent('來源被捕費用節點',
    ['Pay ',' 0% ',' less when Busted (','-2%','/Employee) '],
    '被逮捕時少支付 0%（每名員工 -2%）');
checkEvent('粗體百分比',
    ['Pay ',{tag:'strong',value:'15%'},' less when Busted (','-3%','/Employee) '],
    '被逮捕時少支付 15%（每名員工 -3%）','15%');
const unsafe=make(['Pay ',' 0% ',' less when Busted (',{tag:'button',value:'-2%'},'/Employee) ']);
assert.equal(normalizeCompositeEvent(unsafe),false,'不得修改互動控制內容');
for(const name of ['Pruning Shears','Flammable Supply','High Roller Wash','Narcotics','Superstore Partnership','Out of Harpoons']) {
    assert.ok(batch.contexts.some(c=>c.fragments.some(f=>f.trim()===name)),'上下文缺少已收錄文字：'+name);
}
const crop=make(['Narcotics','(Water)',' Growth: 12% ',' Wetness: 100% ','Crowded, slowing down growth by 20%']);
assert.equal(crop.textContent.includes('Crowded'),true);
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','不可清除既有未翻譯紀錄');
console.log('v0.4.25：20 筆詞條、142 筆上下文、種植與海戰動態數值、公司費用跨節點及既有紀錄保留測試通過。');
