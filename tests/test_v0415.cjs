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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0415.json'),'utf8'));
assert.equal(Object.keys(batch.translations).length,48);
assert.equal(batch.contexts.length,18);
for(const key of Object.keys(batch.translations)) {
    assert.notEqual(lookup(key),null,'待翻譯文字尚未被覆蓋：'+key);
}
const expected={
    '( -10 Doubloons per day/Blackwater Market)':'（每座黑水市場每天的杜布隆金幣變動：-10）',
    '( -10 Doubloons per day/Coinmaster\'s Den)':'（每座錢幣大師的巢穴每天的杜布隆金幣變動：-10）',
    '(+20% Doubloons/Blackwater Market)':'（每座黑水市場的杜布隆金幣收益：+20%）',
    '(+20% Money/Coinmaster\'s Den)':'（每座錢幣大師的巢穴的金錢收益：+20%）',
    '+0% Doubloons':'杜布隆金幣加成：+0%',
    '+0% Money':'金錢加成：+0%',
    '+1 Blackwater Market':'黑水市場：+1',
    '+1 Coinmaster\'s Den':'錢幣大師的巢穴：+1',
    '-0 Doubloons per day':'每天的杜布隆金幣變動：-0',
    '-1K Supplies':'補給品：-1K',
    '1K/1K HP':'生命值：1K/1K',
    'Blackwater Market':'黑水市場',
    'Coinmaster\'s Den':'錢幣大師的巢穴',
    'Costs Doubloons Daily':'每日消耗杜布隆金幣',
    'Expand':'擴建',
    'Increases Doubloons Gain':'增加杜布隆金幣收益',
    'Increases Money Gain':'增加金錢收益',
    'Owned Pets':'已擁有的寵物',
    'Python升至等級 2！':'蟒蛇升至等級 2！',
    'Python升至等級 3！':'蟒蛇升至等級 3！',
    'Readjusting (4 Days Left)':'重新適應中（剩餘 4 天）',
    'The Crimson Ravagers':'緋紅掠奪者',
    "You purchase the exotic pet 'Python' for":'你購買了異國寵物「蟒蛇」，花費'
};
for(const [original,translation] of Object.entries(expected)) {
    assert.equal(translateString(original),translation,'新增文字：'+original);
}
const variations={
    '+15% Doubloons':'杜布隆金幣加成：+15%',
    '-2.5% Money':'金錢加成：-2.5%',
    '+10 Blackwater Market':'黑水市場：+10',
    '-12 Coinmaster\'s Den':'錢幣大師的巢穴：-12',
    '(-33% Money/Coinmaster\'s Den)':'（每座錢幣大師的巢穴的金錢收益：-33%）',
    '( -20 Doubloons per day/Blackwater Market)':'（每座黑水市場每天的杜布隆金幣變動：-20）',
    '-100 Doubloons per day':'每天的杜布隆金幣變動：-100',
    '-2.5K Supplies':'補給品：-2.5K',
    '2K/3.5K HP':'生命值：2K/3.5K',
    'Readjusting (1 Day Left)':'重新適應中（剩餘 1 天）',
    'Readjusting (20 Days Left)':'重新適應中（剩餘 20 天）',
    'Python升至等級 16！':'蟒蛇升至等級 16！',
    "You purchase the exotic pet 'Komodo Dragon' for":'你購買了異國寵物「科莫多巨蜥」，花費'
};
for(const [original,translation] of Object.entries(variations)) {
    assert.equal(translateString(original),translation,'數值或動態名稱：'+original);
}
// 中文已翻譯的經驗值含 K 等縮寫時，不得重新收集。
for(const entry of Object.keys(batch.translations).filter(key=>key.endsWith('經驗值'))) {
    assert.equal(translateString(entry),entry);
}
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','原有收集記錄不受影響');

// 真實來源 contexts 顯示日期、事件片段、負號及粗體價值分離，應由一組事件規則處理。
const petContext=batch.contexts.find(c=>c.fullText.startsWith("You purchase the exotic pet"));
assert.ok(petContext && petContext.datePrefix==='[D19 Y18]:');
assert.equal(petContext.complete,false,'原檔標示為未確認完整，不可擅自提升');
const log=new Elem();
text(log,'[D19 Y18]: ');
text(log,"You purchase the exotic pet 'Python' for ");
text(log,'-');
const cost=element(log,'strong');text(cost,'$1K');
assert.equal(normalizeCompositeEvent(log),true,'應翻譯完整跨文字節點事件');
assert.equal(log.textContent,'[D19 Y18]: 你購買了異國寵物「蟒蛇」，花費 -$1K');
assert.equal(cost.textContent,'$1K','保留原本的價格粗體文字');
assert.equal(normalizeCompositeEvent(log),false,'第二次掃描不得重複修改');
console.log('v0.4.15：48 個詞條、18 筆上下文、動態數值、已中文化數值保護與購買事件跨節點測試通過。');
