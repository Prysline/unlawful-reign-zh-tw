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

const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0405.json'),'utf8'));
const expected={
  "+ Casino Robberies boosted by +6% (+2% Per Lvl)": "＋賭場搶劫加成 +6%（每級 +2%）",
  "+1 Employee": "員工：+1",
  "Artifacts": "古物",
  "Bounty Boards": "懸賞公告欄",
  "Change your mind": "改變主意",
  "Deal with the Devil": "與魔鬼交易",
  "First Client": "第一位客戶",
  "Ignoble Garb": "卑賤的裝束",
  "Invalid save format.": "存檔格式無效。",
  "Monolith": "巨石碑",
  "Moon Phases": "月相",
  "Pets": "寵物",
  "Prestiges the player.": "使玩家進行威望重置。",
  "Raise a loyal companion, train it over time, and discover rare exotic pet sales in the Black Market": "培養一名忠誠的夥伴，隨著時間訓練牠，並在黑市發現稀有異國寵物的販售機會",
  "Retain EXP": "保留經驗值",
  "SACRIFICE PROGRESS FOR POWER": "犧牲進度以換取力量",
  "Save imported successfully.": "存檔匯入成功。",
  "Sea Pets": "海洋寵物",
  "Sea Sanctuary": "海洋庇護所",
  "Select 3 more pacts": "再選擇 3 項契約",
  "Spend": "花費",
  "The next requirement has been met.": "下一項條件已達成。",
  "Toggle menu": "切換選單",
  "Your cultish talks scare rather than persuade the Shady Stranger": "你帶有邪教色彩的言談沒能說服那名可疑陌生人，反而嚇壞了對方",
  "Your researches have finished researching 'Initial Hire'!": "你的研究已完成「初次雇用」項目的研究！",
  "Zodiacs": "十二星座",
  "more pacts and be reborn.": "項額外契約並重生。"
};
assert.equal(Object.keys(batch).length,27);
assert.equal(Object.keys(expected).length,27);
for(const key of Object.keys(batch)) assert.equal(translateString(key),expected[key],'批次翻譯：'+key);
const variants={
  "+ Casino Robberies boosted by +13.5% (+3% Per Lvl)": "＋賭場搶劫加成 +13.5%（每級 +3%）",
  "-5 Employees": "員工：-5",
  "Select 12 more pacts": "再選擇 12 項契約",
  "Select 3 more pacts and be reborn.": "再選擇 3 項契約並重生。",
  "Your researches have finished researching 'Research Department'!": "你的研究已完成「研究部門」項目的研究！",
  "Employees": "員工",
  "Prestige": "威望重置",
  "Custom Label:": "使用者標籤："
};
for(const [key,value] of Object.entries(variants)) assert.equal(translateString(key),value,'變動內容／舊功能：'+key);
// 契約數值在粗體節點時不更換原節點。
const pactRoot=new Elem();
text(pactRoot,'Select ');
const pactBold=element(pactRoot,'strong');text(pactBold,'3');
text(pactRoot,' more pacts and be reborn.');
assert.equal(normalizeCompositeEvent(pactRoot),true);
assert.equal(pactRoot.textContent,'再選擇 3 項契約並重生。');
assert.equal(pactBold.textContent,'3');
assert.equal(normalizeCompositeEvent(pactRoot),false);

// 研究名稱若被單獨標記，也要保持 DOM 結構與正確譯名。
const researchRoot=new Elem();
text(researchRoot,"Your researches have finished researching '");
const researchBold=element(researchRoot,'strong');text(researchBold,'Initial Hire');
text(researchRoot,"'!");
assert.equal(normalizeCompositeEvent(researchRoot),true);
assert.equal(researchRoot.textContent,'你的研究已完成「初次雇用」項目的研究！');
assert.equal(researchBold.textContent,'初次雇用');
assert.equal(normalizeCompositeEvent(researchRoot),false);

// 互動控制、圖示字型及玩家保存紀錄不得受到影響。
const blocked=new Elem();
text(blocked,'Select ');
const button=element(blocked,'button');text(button,'3');
text(blocked,' more pacts and be reborn.');
assert.equal(normalizeCompositeEvent(blocked),false);
const icon={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
translateText(icon);
assert.equal(icon.nodeValue,'settings');
const ordinary={nodeType:3,nodeValue:'settings',parentElement:new Elem()};
translateText(ordinary);
assert.equal(ordinary.nodeValue,'設定');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'');
assert.equal(translateString('Custom Label:'),'使用者標籤：');
console.log('v0.4.5：27 筆原文、8 組變動、契約與研究粗體拆句、互動控制、圖示及儲存測試通過。');
