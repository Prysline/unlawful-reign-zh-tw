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

const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0406.json'),'utf8'));
const expected={
  "Bond with a sea companion that helps you lead the oceans and eventually the world": "與一位海洋夥伴建立羈絆，牠將幫助你統領海洋，最終統領世界",
  "Knowledge you gain is retained by passing it down through the generations and decades": "你獲得的知識會透過代代相傳，在數十年間持續保留下來",
  "Permanently unlock Belt, Shoulders, and Earring equipment slots for future runs": "永久解鎖腰帶、肩部和耳環裝備欄位，供往後的遊玩輪次使用",
  "Raise an ancient sanctuary from the deep, sacrifice Doubloons to empower it, and receive the sea's blessing while sailing": "將一座古老的庇護所從深海升起，獻祭杜布隆金幣以增強它的力量，並在航行時獲得大海的祝福",
  "Restore the Black Market Bounty Board and turn completed contracts into lasting notoriety": "修復黑市懸賞公告欄，並將已完成的契約轉化為持久的惡名",
  "The moon waxes and wanes through eight phases, twisting the city's encounters with light and shadow": "月亮經歷八個月相的盈虧變化，以光與影改變城市中的遭遇",
  "Twelve zodiac years cycle across time, each twisting your cult in a different way": "十二星座隨著年份輪替，每一年都以不同方式改變你的邪教",
  "Unlock a primordial Monolith whose powers grow the more money you sacrifice to it": "解鎖一座原始巨石碑，你向它獻祭的金錢越多，它的力量就越強",
  "Unseal ancient Artifacts, permanently reveal The Museum upgrade, and preserve completed relics through rebirth": "解除古代古物的封印，永久顯示「博物館」升級項目，並在重生後保留已完成的遺物"
};
assert.equal(Object.keys(batch).length,9);
assert.equal(Object.keys(expected).length,9);
for(const key of Object.keys(batch)) {
    assert.equal(translateString(key),expected[key],'本批翻譯：'+key);
}
assert.equal(translateString('Zodiacs'),'十二星座','西洋十二星座符號與原有詞條應一致');
assert.equal(translateString('Moon Phases'),'月相');
assert.equal(translateString('Sea Sanctuary'),'海洋庇護所');
assert.equal(translateString('Doubloons'),'杜布隆金幣');
assert.equal(translateString('Artifacts'),'古物');
assert.equal(translateString('Bounty Boards'),'懸賞公告欄');
assert.equal(translateString('Monolith'),'巨石碑');
assert.equal(translateString('Custom Label:'),'使用者標籤：');
const icon={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
translateText(icon);
assert.equal(icon.nodeValue,'settings','圖示不可改寫');
const ordinary={nodeType:3,nodeValue:'settings',parentElement:new Elem()};
translateText(ordinary);
assert.equal(ordinary.nodeValue,'設定');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','應保留既有未翻譯紀錄');
console.log('v0.4.6：9 筆說明、既有名稱一致性、圖示及資料保存測試通過。');
