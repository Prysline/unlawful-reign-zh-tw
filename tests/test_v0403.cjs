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

const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0403.json'),'utf8'));
const expected={
    '(+1 R.P/Employee)':'（+1 研究點數／員工）',
    '+0.5% Money Rewards for every 100 Notoriety (Max 100%)':'每 100 點惡名，金錢獎勵加成 +0.5%（最高 100%）',
    '+1 Followers (20%)':'追隨者：+1（20%）',
    '+1 Original Artwork':'原作藝術品：+1',
    '+1 R.P':'研究點數：+1',
    '+2 R.P':'研究點數：+2',
    '+5% Chance to indoctrinate shady stranger':'向可疑陌生人灌輸教義的機率：+5%',
    '-25% Yearly Tax Rate':'年度稅率：-25%',
    '/Employee)':'／員工）',
    '1 Original Artwork':'1 件原作藝術品',
    'A ridiculous upgrade until you realize efficiency can start with a single step':'這項升級看似荒謬，直到你意識到提升效率可以從單一步驟開始',
    'Allows you to prestige by making a deal with the devil':'讓你能透過與魔鬼交易進行威望重置',
    'Assigned Employees':'已指派員工',
    'Calling Card':'名片',
    'Corporate Warehouse':'公司倉庫',
    'Corporation':'公司',
    'Cult Brew':'邪教秘釀',
    'Cybernetic Toe':'機械義趾',
    'Devil Pacts':'魔鬼契約',
    'Employees:':'員工：',
    'Experienced Criminal':'經驗豐富的罪犯',
    'Formal Shoes':'正式皮鞋',
    'Gain Notoriety from all successful heists':'所有成功的劫案都能獲得惡名',
    'Inaugurate a':'成立一個',
    'Inaugurate an':'成立一個',
    'Initial Hire':'初次雇用',
    'Investment Department':'投資部門',
    'Legal Department':'法務部門',
    "Mo' Money, Mo' Problems":'錢越多，麻煩越多',
    'Next Unlock:':'下一項解鎖：',
    'Original Artwork':'原作藝術品',
    'Producing:':'生產中：',
    'Psych 101':'心理學入門',
    'Public Relations Department':'公關部門',
    'Research Department':'研究部門',
    'Research Points:':'研究點數：',
    'Researched Upgrades':'已研究的升級',
    'Sales Department':'銷售部門',
    'Take the train to your next destination':'搭乘火車前往下一個目的地',
    'Train Ticket':'火車票',
    'Try Indoctrinate (20%)':'嘗試灌輸教義（20%）',
    'Unassigned)':'未指派）',
    'Unholier Oblation':'更邪惡的祭品',
    'Unholy Oblation increases Max Souls by +25':'邪惡祭品使靈魂上限增加 +25',
    'Yearly Tax Rate:':'年度稅率：',
    'You successfully manage to steal an Original piece with none the wiser!':'你成功偷走一件原作，卻沒有人察覺！',
    'Your Corporation pays its yearly taxes...':'你的公司繳納了年度稅款……',
    'x1.1 Research Speed':'研究速度 ×1.1',
    'x1.5 Build Fake Identity speed when talking with Strangers':'與陌生人交談時建立假身分的速度 ×1.5'
};
assert.equal(Object.keys(batch).length,49);
assert.equal(Object.keys(expected).length,49);
for(const key of Object.keys(batch)) {
    assert.equal(translateString(key),expected[key],'這批文字：'+key);
}
const variants={
    '(+25 R.P/Employee)':'（+25 研究點數／員工）',
    '(-2.5 R.P/Employee)':'（-2.5 研究點數／員工）',
    '+1.5% Money Rewards for every 200 Notoriety (Max 80%)':'每 200 點惡名，金錢獎勵加成 +1.5%（最高 80%）',
    '-2 Followers (35.5%)':'追隨者：-2（35.5%）',
    '+12 Original Artworks':'原作藝術品：+12',
    '5 Original Artwork':'5 件原作藝術品',
    '+4 Original Artwork (60%)':'原作藝術品：+4（60%）',
    '-11 R.P':'研究點數：-11',
    '+8% Chance to indoctrinate shady strangers':'向可疑陌生人灌輸教義的機率：+8%',
    '+5% Yearly Tax Rate':'年度稅率：+5%',
    'Try Indoctrinate (65.5%)':'嘗試灌輸教義（65.5%）',
    'Unholy Oblation increases Max Souls by +130':'邪惡祭品使靈魂上限增加 +130',
    'x3.2 Research Speed':'研究速度 ×3.2',
    'x2.5 Build Fake Identity speed when talking with Strangers':'與陌生人交談時建立假身分的速度 ×2.5',
    'Inaugurate an Investment Department':'成立一個投資部門',
    'Inaugurate a Sales Department':'成立一個銷售部門',
    'Employees':'員工',
    'Next Unlock':'下一項解鎖',
    'Research Points':'研究點數',
    'Research Points:':'研究點數：',
    'Yearly Tax Rate':'年度稅率',
    'Prestige':'威望重置',
    'Offer Unholy Oblation':'獻上邪惡祭品',
    'Art Gallery:':'美術館：',
    '+ Unlocks Followers':'＋解鎖追隨者',
    'Custom Label:':'使用者標籤：'
};
for(const [original,result] of Object.entries(variants)) {
    assert.equal(translateString(original),result,'變數或舊版規則：'+original);
}
// 不更換數值所在的粗體節點，並使完整句與拆句共用同一事件規則。
const withBold=new Elem();
text(withBold,'(');
const bold=element(withBold,'strong');text(bold,'+1');
text(withBold,' R.P/Employee)');
assert.equal(normalizeCompositeEvent(withBold),true);
assert.equal(withBold.textContent,'（+1 研究點數／員工）');
assert.equal(bold.textContent,'+1');
assert.equal(normalizeCompositeEvent(withBold),false,'不能二次轉換');
const split=new Elem();
text(split,'(');
const span=element(split,'span');text(span,'+5 R.P');
text(split,'/Employee)');
assert.equal(normalizeCompositeEvent(split),true);
assert.equal(split.textContent,'（+5 研究點數／員工）');
const buttonParent=new Elem();
text(buttonParent,'(');
const button=element(buttonParent,'button');text(button,'+1');
text(buttonParent,' R.P/Employee)');
assert.equal(normalizeCompositeEvent(buttonParent),false,'不得修改互動元件');
const icon={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
translateText(icon);assert.equal(icon.nodeValue,'settings','不得翻譯圖示字型');
const ordinary={nodeType:3,nodeValue:'settings',parentElement:new Elem()};
translateText(ordinary);assert.equal(ordinary.nodeValue,'設定');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','歷史紀錄未保留');
assert.equal(lookup('Original Artwork'),'原作藝術品');
console.log('v0.4.3：49 筆原文、'+Object.keys(variants).length+' 組數值／舊版案例、粗體與拆句事件、圖示與儲存測試通過。');
