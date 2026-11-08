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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0423.json'),'utf8'));
const originals=Object.keys(batch.translations);
assert.equal(originals.length,13,'本批詞條數量');
assert.equal(batch.contexts.length,118,'本批上下文數量');
assert.ok(batch.contexts.every(c=>c.complete===false),'來源並無已確認完整事件');
const expected={
    '+1 Brutality EXP from Store and Jewelry Store Robberies':'商店與珠寶店搶劫獲得的蠻力經驗值：+1',
    '+1 Stolen Jewel when raiding grave':'盜墓時獲得的偷來的珠寶：+1',
    '+3 Souls when Paying Respect at Cemetary':'在墓園致意時獲得的靈魂：+3',
    '+4 Max Gang Members':'幫派成員上限：+4',
    'ATM Theft':'自動櫃員機竊盜',
    'Bunk Hammocks':'雙層吊床',
    'Dead Ores':'死者礦石',
    'Graveside Vigil':'墓旁守夜',
    'Pie Charts':'圓餅圖',
    'Unmarked Van':'無標誌廂型車',
    'Violent Streak':'連續暴行',
    'x1.5 Store Robbery Reward':'商店搶劫獎勵 ×1.5',
    'x2 Store Robbery Reward':'商店搶劫獎勵 ×2'
};
assert.equal(Object.keys(expected).length,originals.length);
for(const original of originals) {
    assert.ok(Object.prototype.hasOwnProperty.call(expected,original),'來源詞條缺少測試：'+original);
    assert.notEqual(lookup(original),null,'來源詞條未被處理：'+original);
    assert.equal(translateString(original),expected[original],'翻譯詞條：'+original);
}
const variations={
    '+5 Brutality EXP from Store and Jewelry Store Robberies':'商店與珠寶店搶劫獲得的蠻力經驗值：+5',
    '+1.5K Brutality EXP from Store and Jewelry Store Robberies':'商店與珠寶店搶劫獲得的蠻力經驗值：+1.5K',
    '+12 Stolen Jewels when raiding graves':'盜墓時獲得的偷來的珠寶：+12',
    '+6 Souls when Paying Respect at Cemetery':'在墓園致意時獲得的靈魂：+6',
    '+1 Soul when Paying Respect at Cemetary':'在墓園致意時獲得的靈魂：+1',
    '+30 Max Gang Members':'幫派成員上限：+30',
    'x2.5 Store Robbery Reward':'商店搶劫獎勵 ×2.5',
    'x1 Store Robbery Reward':'商店搶劫獎勵 ×1'
};
for(const [original,want] of Object.entries(variations)){
    assert.equal(translateString(original),want,'可變數值或拼寫：'+original);
}
const contexts={
    'ATM Theft':'x2 Store Robbery Reward',
    'Bunk Hammocks':'+4 Max Crewmates',
    'Dead Ores':'+1 Stolen Jewel when raiding grave',
    'Graveside Vigil':'+3 Souls when Paying Respect at Cemetary',
    'Unmarked Van':'x1.5 Store Robbery Reward',
    'Violent Streak':'+1 Brutality EXP from Store and Jewelry Store Robberies'
};
for(const [name,bonus] of Object.entries(contexts)){
    const ctx=batch.contexts.find(c=>c.fragments.map(x=>x.trim()).includes(name));
    assert.ok(ctx,'原始上下文缺少升級名稱：'+name);
    assert.ok(ctx.fragments.some(x=>x.trim()===bonus),'升級說明需要與名稱相符：'+name);
    assert.equal(ctx.complete,false,'不可擅自判定介面上下文為完整句：'+name);
}
const label=new Elem();
const node=text(label,'x2 Store Robbery Reward');
translateText(node);
assert.equal(node.nodeValue,'商店搶劫獎勵 ×2','獨立文字節點應可直接翻譯');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','不可清除原有待翻譯記錄');
console.log('v0.4.23：13 筆詞條、118 筆上下文、動態數值、墓園拼字變體及獨立節點回歸測試通過。');
