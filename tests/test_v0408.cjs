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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0408.json'),'utf8'));
const expected={
  "$0 / $1M": "$0 / $1M",
  "+12% Global Money and Notoriety": "全域金錢與惡名：+12%",
  "+15% Global Money and Notoriety": "全域金錢與惡名：+15%",
  "+3% Global Money and Notoriety": "全域金錢與惡名：+3%",
  "+6% Global Money and Notoriety": "全域金錢與惡名：+6%",
  "+9% Global Money and Notoriety": "全域金錢與惡名：+9%",
  "0 pacts earned": "已獲得 0 項契約",
  "0/10 EXP": "0/10 經驗值",
  "1/20 EXP": "1/20 經驗值",
  "1/45 EXP": "1/45 經驗值",
  "11/20 EXP": "11/20 經驗值",
  "116/215 EXP": "116/215 經驗值",
  "131/215 EXP": "131/215 經驗值",
  "132/215 EXP": "132/215 經驗值",
  "139/215 EXP": "139/215 經驗值",
  "15/100 EXP": "15/100 經驗值",
  "153/215 EXP": "153/215 經驗值",
  "154/215 EXP": "154/215 經驗值",
  "16/45 EXP": "16/45 經驗值",
  "17/45 EXP": "17/45 經驗值",
  "174/215 EXP": "174/215 經驗值",
  "20/100 EXP": "20/100 經驗值",
  "24/45 EXP": "24/45 經驗值",
  "26/45 EXP": "26/45 經驗值",
  "29/100 EXP": "29/100 經驗值",
  "32/215 EXP": "32/215 經驗值",
  "35/45 EXP": "35/45 經驗值",
  "38/215 EXP": "38/215 經驗值",
  "38/45 EXP": "38/45 經驗值",
  "40/100 EXP": "40/100 經驗值",
  "47/100 EXP": "47/100 經驗值",
  "5/45 EXP": "5/45 經驗值",
  "55/100 EXP": "55/100 經驗值",
  "6/10 EXP": "6/10 經驗值",
  "6/45 EXP": "6/45 經驗值",
  "7/20 EXP": "7/20 經驗值",
  "7/215 EXP": "7/215 經驗值",
  "74/100 EXP": "74/100 經驗值",
  "79/215 EXP": "79/215 經驗值",
  "84/100 EXP": "84/100 經驗值",
  "90/100 EXP": "90/100 經驗值",
  "98/215 EXP": "98/215 經驗值",
  "Be Reborn": "重生",
  "Current companion": "目前的夥伴",
  "Dog": "狗",
  "Dog reached level 2!": "狗升至等級 2！",
  "Dog reached level 3!": "狗升至等級 3！",
  "Dog reached level 4!": "狗升至等級 4！",
  "Dog reached level 5!": "狗升至等級 5！",
  "Pact Bonus: +30% Money & Notoriety": "契約加成：金錢與惡名 +30%",
  "Personalized Collar": "客製化項圈",
  "Pet": "寵物",
  "Select 1 more pact": "再選擇 1 項契約",
  "The Museum": "博物館",
  "Visit the Museum to view ancient Artifacts": "前往博物館查看古代文物",
  "Your heist goes awry and you get caught!": "你的劫案出了差錯，你被逮住了！",
  "more pact and be reborn.": "項額外契約並重生。",
  "x2 pet EXP gain speed": "寵物經驗值獲得速度 ×2"
};
assert.equal(Object.keys(batch).length,58);
assert.equal(Object.keys(expected).length,58);
for(const key of Object.keys(batch)) {
    assert.equal(translateString(key),expected[key],'本批待翻譯文字：'+key);
}
const variants={
    '10/250 EXP':'10/250 經驗值',
    '1,200/2,500 EXP':'1,200/2,500 經驗值',
    '+20% Global Money and Notoriety':'全域金錢與惡名：+20%',
    '1 pact earned':'已獲得 1 項契約',
    '12 pacts earned':'已獲得 12 項契約',
    'Dog reached level 12!':'狗升至等級 12！',
    'Pact Bonus: +45% Money & Notoriety':'契約加成：金錢與惡名 +45%',
    'Select 4 more pacts':'再選擇 4 項契約',
    'Select 1 more pact and be reborn.':'再選擇 1 項契約並重生。',
    'Spend 1 more pact and be reborn.':'花費 1 項額外契約並重生。',
    'Spend 3 more pacts and be reborn.':'花費 3 項額外契約並重生。',
    'x3.5 pet EXP gain speed':'寵物經驗值獲得速度 ×3.5'
};
for(const [key,value] of Object.entries(variants))assert.equal(translateString(key),value,'變動值：'+key);
for(const [prefix,n,suffix,desired] of [
    ['Spend ','1',' more pact and be reborn.','花費 1 項額外契約並重生。'],
    ['Spend ','3',' more pacts and be reborn.','花費 3 項額外契約並重生。'],
    ['Select ','1',' more pact and be reborn.','再選擇 1 項契約並重生。'],
    ['Select ','3',' more pacts and be reborn.','再選擇 3 項契約並重生。']
]) {
    const root=new Elem();
    text(root,prefix);
    const bold=element(root,'strong');text(bold,n);
    text(root,suffix);
    assert.equal(normalizeCompositeEvent(root),true,'粗體分隔辨識：'+prefix+n+suffix);
    assert.equal(root.textContent,desired);
    assert.equal(bold.textContent,n,'應保留原始數字粗體');
    assert.equal(normalizeCompositeEvent(root),false,'不可重複處理');
}
const fragment=new Elem();
text(fragment,'more ');
const fragmentTail=element(fragment,'span');text(fragmentTail,'pact and be reborn.');
assert.equal(normalizeSplitFragment(fragment),true,'單數契約片段應支援跨節點');
assert.equal(fragment.textContent,'項額外契約並重生。');
const unsafe=new Elem();
text(unsafe,'Spend ');
const button=element(unsafe,'button');text(button,'1');
text(unsafe,' more pact and be reborn.');
assert.equal(normalizeCompositeEvent(unsafe),false,'不應處理互動按鈕');
const icon={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
translateText(icon);assert.equal(icon.nodeValue,'settings','圖示應維持原始字元');
const normal={nodeType:3,nodeValue:'settings',parentElement:new Elem()};
translateText(normal);assert.equal(normal.nodeValue,'設定');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'');
assert.equal(Object.prototype.hasOwnProperty.call(storage.ur_zh_tw_untranslated,'$0 / $1M'),false,'純數字金額進度不應收集成未翻譯詞');
assert.equal(translateString('Zodiacs'),'十二星座','沿用先前已修正的星座名稱');
assert.equal(translateString('Custom Label:'),'使用者標籤：');
console.log('v0.4.8：58 筆原文、12 組變動值、契約單複數拆句、粗體、圖示及儲存測試通過。');
