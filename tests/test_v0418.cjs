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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0418.json'),'utf8'));
const terms=Object.keys(batch.translations);
assert.equal(terms.length,53);
assert.equal(batch.contexts.length,74);
assert.equal(batch.contexts.filter(c=>c.complete).length,2);
for (const original of terms) assert.notEqual(lookup(original),null,'遺漏的來源文字：'+original);
const exact={
    '(+4/Employee)':'（每名員工 +4）',
    '+ Chance to create Original Artwork +10% (+2% Per Lvl)':'＋創作原創藝術品的機率 +10%（每級 +2%）',
    '+1 Stealth EXP from pickpocketing':'扒竊獲得的潛行經驗值：+1',
    '+15% Flee chance':'逃跑機率：+15%',
    '+4 Jewelry Store Heist Planning Speed':'珠寶店劫案策劃速度：+4',
    '+5% Chance to Pickpocket Jewels':'扒竊時偷得珠寶的機率：+5%',
    '1 Treasure Map':'1 張藏寶圖',
    '14/1K':'14/1K',
    'Train':'火車',
    'Train:':'火車：',
    'Railway Station':'火車站',
    'Ride the Train':'搭乘火車',
    'Rob Passengers (18 G.M, 6 S.M.G)':'搶劫乘客（18 名幫派成員、6 把衝鋒槍）',
    'Next Shipment in':'距離下一批貨物抵達還有',
    'Your Warehouse shipment of':'你的倉庫貨運，包含',
    'arrives!':'已送達！',
    'You ride the train and arrive at \'Museum\'':'你搭乘火車，抵達「博物館」',
    'You ride the train and arrive at \'Safehouse\'':'你搭乘火車，抵達「安全屋」',
    'You ride the train and arrive at \'Shady Stranger\'':'你搭乘火車，抵達「可疑的陌生人」',
    'You ride the train and arrive at \'Shop\'':'你搭乘火車，抵達「商店」',
    'x1.2 Train Robbery Money':'火車搶劫金錢 ×1.2',
    'x1.4 Supplies from Salvaging Wreckage':'打撈殘骸獲得的補給品 ×1.4',
    'x1.5 Rob Passengers Reward':'搶劫乘客獎勵 ×1.5',
    'x2 Pickpocket and Shoplift Reward':'扒竊及商店行竊獎勵 ×2'
};
for(const [original,want] of Object.entries(exact)){
    assert.equal(translateString(original),want,'固定及動態文字：'+original);
}
for(const [original,want] of Object.entries({
    "You ride the train and arrive at 'Bank'":'你搭乘火車，抵達「銀行」',
    '+12% Flee chance':'逃跑機率：+12%',
    '9 Treasure Maps':'9 張藏寶圖',
    '+9 Treasure Maps':'藏寶圖：+9',
    'Rob Passengers (20 G.M, 12 S.M.G)':'搶劫乘客（20 名幫派成員、12 把衝鋒槍）',
    'Next Shipment in 30 Days':'距離下一批貨物抵達還有 30 天',
    'Next Shipment in 1 Day':'距離下一批貨物抵達還有 1 天',
    '+22.5% Chance to Pickpocket Jewels':'扒竊時偷得珠寶的機率：+22.5%',
    'x3.5 Train Robbery Money':'火車搶劫金錢 ×3.5'
})){
    assert.equal(translateString(original),want,'數值與其他已譯目的地：'+original);
}
assert.equal(context.testAPI.isUntranslatedSource('14/1K'),false,'純進度不可視為未翻譯文字');
assert.equal(context.testAPI.isUntranslatedSource('400/1.2M'),false,'動態縮寫進度亦不可誤收集');
function makeLog(parts) {
    const log=new Elem();
    for(const part of parts){
        if(typeof part==='string')text(log,part);
        else text(element(log,part.tag),part.value);
    }
    return log;
}
function verifyLog(name,parts,want,checkStrong) {
    const log=makeLog(parts);
    assert.equal(normalizeCompositeEvent(log),true,'完整事件未能辨識：'+name);
    assert.equal(log.textContent,want,'跨節點輸出不符：'+name);
    if(checkStrong){
        const strong=log.querySelector('strong');
        assert.ok(strong);
        assert.equal(strong.textContent,checkStrong,'粗體數值需維持原樣：'+name);
    }
    assert.equal(normalizeCompositeEvent(log),false,'事件不得重複轉譯：'+name);
}
for(const [name,translated] of [
    ['Museum','博物館'],
    ['Safehouse','安全屋'],
    ['Shady Stranger','可疑的陌生人'],
    ['Shop','商店']
]){
    verifyLog(name,['[D17 Y25]: ',"You ride the train and arrive at '",{tag:'strong',value:name},"'"],
        '[D17 Y25]: 你搭乘火車，抵達「'+translated+'」');
}
verifyLog('火車乘客搶劫',[
    '[D13 Y26]: ',"Under your command, your gang strips the train's passengers of their wealth! ",'+',
    {tag:'strong',value:'$1.2K'}
],"[D13 Y26]: 在你的指揮下，你的幫派洗劫了火車乘客的財物！ +$1.2K",'$1.2K');
verifyLog('商船購買',[
    '[D65 Y26]: ','You trade with the vessel, buying ','+','10 Stolen Goods',' for ','-',
    {tag:'strong',value:'50 Doubloons'}
],'[D65 Y26]: 你與商船交易，購買 +10 件贓物，支付 -50 枚杜布隆金幣','50 枚杜布隆金幣');
verifyLog('藏寶圖',[
    '[D64 Y25]: ',"You've deciphered the route to a cache of hidden treasure! ",'+',
    {tag:'strong',value:'1 Treasure Map'}
],'[D64 Y25]: 你已解讀出通往一處隱藏寶藏的路線！ +1 張藏寶圖','1 張藏寶圖');
verifyLog('倉庫送達',[
    '[D79 Y24]: ','Your Warehouse shipment of ','+','0 Stolen Goods',' arrives!'
],'[D79 Y24]: 你的倉庫貨運，包含 +0 件贓物，已送達！');
verifyLog('出貨倒數',[
    'Next Shipment in ',{tag:'strong',value:'30'},' Days'
],'距離下一批貨物抵達還有 30 天','30');
const routeRecords=batch.contexts.filter(c=>c.fullText.startsWith('You ride the train and arrive'));
assert.equal(routeRecords.length,4,'應留存四個已觀察的火車目的地');
assert.ok(routeRecords.every(c=>c.complete===false),'不得改動來源的完整度標記');
const complete=batch.contexts.filter(c=>c.complete).map(c=>c.fullText);
assert.ok(complete.some(x=>x.startsWith('Your Warehouse shipment of')));
assert.ok(complete.some(x=>x.startsWith('You readjust the course')));
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','不應清空既有收集資料');
console.log('v0.4.18：53 筆來源、74 筆上下文、火車目的地共用詞庫、跨節點事件與動態數值測試通過。');
