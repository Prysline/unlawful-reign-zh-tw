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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0416.json'),'utf8'));
assert.equal(Object.keys(batch.translations).length,41);
assert.equal(batch.contexts.length,42);
assert.ok(batch.contexts.every(item => item.complete === false),'原始資料中沒有已確認的完整句');
for (const key of Object.keys(batch.translations)) {
    assert.notEqual(lookup(key),null,'來源詞條未被涵蓋：'+key);
}
const expected={
    '(Approach closer)':'（靠近一點）',
    '+1 Finance EXP from Studying Operations':'研究營運獲得的財務經驗值：+1',
    '+1 Random Artifact Piece':'隨機古物碎片：+1',
    '+130 Not. Per Artifact Level':'每級古物獲得的惡名：+130',
    '+20 Max Stolen Goods':'贓物持有上限：+20',
    '+5 Museum Plan Heist Speed':'博物館劫案策劃速度：+5',
    '+5% Chance Fake Identity not used up':'假身分不被消耗的機率：+5%',
    'All on Red':'全押紅色',
    'All the stolen splendor':'所有偷來的華美之物',
    'Art of the Deal':'交易的藝術',
    'Basic Lab':'基礎實驗室',
    'Business Diploma':'商業文憑',
    'Business School':'商學院',
    'Change Course':'改變航向',
    'Curate Exhibit':'策劃展覽',
    'Decipher Map (0/100)':'解讀地圖（0/100）',
    'Early Workforce':'早期勞動力',
    'Fake Posture':'偽裝姿態',
    'Guarantees meeting The Devil':'保證能見到魔鬼',
    'Hockey Mask':'曲棍球面具',
    'Infernal Summons':'地獄召喚',
    'Longer Scope':'更遠的觀測距離',
    'Mental Math':'心算',
    'Museum':'博物館',
    'Museum:':'博物館：',
    'Part-Time Archaeologist':'兼職考古學家',
    'Providing:':'提供：',
    'Say My Name':'說出我的名字',
    'Spyglass can see 50 Nautical Miles further':'望遠鏡的觀測距離增加 50 海里',
    'Storage Shed':'儲物棚',
    'Tax Relief':'稅務減免',
    "You've planned out as much as you can for this heist":'你已經為這次劫案完成了所有能做的策劃',
    'x1.5 Sales Department Clean Money':'銷售部門的合法金錢 ×1.5',
    'x2 All Notoriety Rewards':'所有惡名獎勵 ×2',
    'x2 Casino Robbery Reward':'賭場搶劫獎勵 ×2',
    'x2 Sales Department Clean Money':'銷售部門的合法金錢 ×2',
    '你的研究已完成「Basic Lab」項目的研究！':'你的研究已完成「基礎實驗室」項目的研究！',
    '你的研究已完成「Business Diploma」項目的研究！':'你的研究已完成「商業文憑」項目的研究！',
    '你的研究已完成「Early Workforce」項目的研究！':'你的研究已完成「早期勞動力」項目的研究！',
    '生命值：1K/1K':'生命值：1K/1K',
    '補給品：-1K':'補給品：-1K'
};
assert.equal(Object.keys(expected).length,41);
for(const [source,translated] of Object.entries(expected)) {
    assert.equal(translateString(source),translated,'翻譯不一致：'+source);
}
const variants={
    '+7 Finance EXP from Studying Operations':'研究營運獲得的財務經驗值：+7',
    '+15 Random Artifact Pieces':'隨機古物碎片：+15',
    '+250 Not. Per Artifact Level':'每級古物獲得的惡名：+250',
    '+1K Max Stolen Goods':'贓物持有上限：+1K',
    '-3 Museum Plan Heist Speed':'博物館劫案策劃速度：-3',
    '+12.5% Chance Fake Identity not used up':'假身分不被消耗的機率：+12.5%',
    'Decipher Map (72/100)':'解讀地圖（72/100）',
    'Spyglass can see 120 Nautical Miles further':'望遠鏡的觀測距離增加 120 海里',
    'x3.5 Sales Department Clean Money':'銷售部門的合法金錢 ×3.5',
    'x4 All Notoriety Rewards':'所有惡名獎勵 ×4',
    'x5 Casino Robbery Reward':'賭場搶劫獎勵 ×5',
    '你的研究已完成「Tax Relief」項目的研究！':'你的研究已完成「稅務減免」項目的研究！',
    'Museum:':'博物館：'
};
for(const [source,translated] of Object.entries(variants)) {
    assert.equal(translateString(source),translated,'動態資料變化：'+source);
}
for (const source of ['生命值：1K/1K','補給品：-1K','35/2.1K 經驗值']) {
    assert.equal(context.testAPI.isUntranslatedSource(source),false,'已譯數值不可再收集：'+source);
}
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','原有待翻譯儲存紀錄保留');
const event=batch.contexts.find(item=>item.datePrefix==='[D00 Y21]:');
assert.ok(event,'保留實際收集到的事件上下文');
assert.equal(event.complete,false,'未確認完整不可擅自改成完整句');
assert.equal(event.fullText,"You've planned out as much as you can for this heist");
console.log('v0.4.16：41 筆原文、42 筆上下文、13 組變化、混合研究通知及已譯數值排除測試通過。');
