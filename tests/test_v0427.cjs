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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0427.json'),'utf8'));
const source=Object.keys(batch.translations);
assert.equal(source.length,62,'來源詞條數量');
assert.equal(batch.contexts.length,164,'來源上下文數量');
assert.ok(batch.contexts.every(c=>c.complete===false),'保留來源完整度標記');
for(const key of source) {
    assert.notEqual(lookup(key),null,'未翻譯的來源文字：'+key);
    assert.notEqual(translateString(key),key,'原文仍未翻譯：'+key);
    assert.equal(/原文異常|無法確認/.test(translateString(key)),false,'不在遊戲譯文中加入維護註記：'+key);
}
const examples={
    '+1 Cartel Member':'販毒集團成員：+1',
    '+1 Drugs (15% for x2)':'毒品：+1（15% 機率 ×2）',
    '+1 Max Drugs dealt to Shady Stranger':'向可疑陌生人販售毒品的上限：+1',
    '+1 Narcotics':'麻醉品：+1',
    '+3 Narcotics':'麻醉品：+3',
    '+4 Drugs (15% for x2)':'毒品：+4（15% 機率 ×2）',
    '+5 Drugs (15% for x2)':'毒品：+5（15% 機率 ×2）',
    '+6 Drugs (15% for x2)':'毒品：+6（15% 機率 ×2）',
    '+7 Drugs (15% for x2)':'毒品：+7（15% 機率 ×2）',
    '-1 Narcotics':'麻醉品：-1',
    '-3 Narcotics':'麻醉品：-3',
    '-4 Narcotics':'麻醉品：-4',
    '-5 Narcotics':'麻醉品：-5',
    '1 Narcotics':'1 份麻醉品',
    '3 Narcotics':'3 份麻醉品',
    '4 Narcotics':'4 份麻醉品',
    '5 Narcotics':'5 份麻醉品',
    'Able to turn your Gang Members into Cartel members and start your drug empire':'能夠將你的幫派成員轉為販毒集團成員，並建立你的毒品帝國',
    'Bountiful Scythe':'豐收鐮刀',
    'Cartel':'販毒集團',
    'Cartel Members: 0':'販毒集團成員：0',
    'Clean cuts, quick harvests, and a suspiciously well-trimmed garden':'俐落的修剪、迅速的收成，以及修整得可疑地整齊的花園',
    'Crowded, slowing down growth by 20%':'過於擁擠，使生長速度降低 20%',
    'Deal 25 DMG (10% chance of x2 DMG)':'造成 25 點傷害（10% 機率造成 2 倍傷害）',
    'Dealing 0 Drugs in 30 Days':'在 30 天內販售 0 份毒品',
    'Dim Lighting':'昏暗照明',
    'Flammable Supply':'易燃補給品',
    'Harvest Max':'收成至上限',
    'Harvested your garden flowers...':'你收成了花園裡的花朵……',
    'High Roller Wash':'豪賭客洗錢',
    'Hire Cartel Member':'招募販毒集團成員',
    'Hydrated Foliage':'水潤葉片',
    'Laundromat':'自助洗衣店',
    'Narcos':'毒梟',
    'Narcotics':'麻醉品',
    'Narcotics Inventory full!':'麻醉品庫存已滿！',
    'Nitrogen-Rich':'富含氮素',
    'Nothing to Harvest...':'沒有東西可收成……',
    'Out of Harpoons':'魚叉已用盡',
    'Pay':'支付',
    'Plants +1 Narcotics':'種植 +1 份麻醉品',
    'Plants +2 Narcotics':'種植 +2 份麻醉品',
    'Plants +3 Narcotics':'種植 +3 份麻醉品',
    'Plants +4 Narcotics':'種植 +4 份麻醉品',
    'Plants +5 Narcotics':'種植 +5 份麻醉品',
    'Plants +6 Narcotics':'種植 +6 份麻醉品',
    'Plants +7 Narcotics':'種植 +7 份麻醉品',
    'Plants +8 Narcotics':'種植 +8 份麻醉品',
    'Plants +9 Narcotics':'種植 +9 份麻醉品',
    'Provoke Minions':'挑釁僕從',
    'Pruning Shears':'修枝剪',
    'Start your own Mafia family':'建立你自己的黑手黨家族',
    'Superstore Partnership':'大型賣場合作關係',
    'The Godfather':'教父',
    'Treats':'零食',
    'You purchase a rare Treasure Map from the Trading Vessel,':'你從商船購買了一張稀有藏寶圖，',
    'Your gardenerer waters your greenhouse every 20 days':'你的園丁每 20 天為溫室澆水',
    'Your minions are provoked into a frenzy, harvesting souls...':'你的僕從受到挑釁而陷入狂亂，收割靈魂……',
    'less when Busted (':'被逮捕時少支付（',
    'x1.1 Narcotics growth speed':'麻醉品生長速度 ×1.1',
    'x1.2 Narcotics growth speed':'麻醉品生長速度 ×1.2',
    'x1.5 Casino Launder Money Amount':'賭場洗錢金額 ×1.5'
};
assert.equal(Object.keys(examples).length,source.length,'逐項涵蓋全部原始詞條');
for(const key of source) {
    assert.ok(Object.prototype.hasOwnProperty.call(examples,key),'測試表缺少來源文字：'+key);
    assert.equal(translateString(key),examples[key],'來源譯文不符：'+key);
}
const variants={
    '+3 Cartel Members':'販毒集團成員：+3',
    'Cartel Members: 25':'販毒集團成員：25',
    '+9 Max Drugs dealt to Shady Strangers':'向可疑陌生人販售毒品的上限：+9',
    '+12 Drugs (25% for x3)':'毒品：+12（25% 機率 ×3）',
    '-8 Narcotics':'麻醉品：-8',
    '+12 Narcotics':'麻醉品：+12',
    '12 Narcotics':'12 份麻醉品',
    'Dealing 25 Drugs in 12 Days':'在 12 天內販售 25 份毒品',
    'Your gardenerer waters your greenhouse every 10 days':'你的園丁每 10 天為溫室澆水',
    'Harvested your garden flowers... +3 Narcotics':'你收成了花園裡的花朵…… +3 份麻醉品',
    'You purchase a rare Treasure Map from the Trading Vessel, -1.5K Doubloons':'你從商船購買了一張稀有藏寶圖， -1.5K 枚杜布隆金幣',
    'Your minions are provoked into a frenzy, harvesting souls... +30 Souls':'你的僕從受到挑釁而陷入狂亂，收割靈魂…… +30 個靈魂',
    'You sold 6 Narcotics and earned +$24.8K':'你賣出了 6 份麻醉品，賺得 +$24.8K'
};
for(const [key,value] of Object.entries(variants)) {
    assert.equal(translateString(key),value,'可變數值不符：'+key);
}
const sourceEvents=[
    ['Harvested your garden flowers... +1 Narcotics','[D88 Y36]:'],
    ['You purchase a rare Treasure Map from the Trading Vessel, -100 Doubloons','[D22 Y36]:'],
    ['You sold 4 Narcotics and earned +$17.2K','[D88 Y36]:'],
    ['Your minions are provoked into a frenzy, harvesting souls... +16 Souls','[D75 Y36]:']
];
for(const [full,date] of sourceEvents) {
    const contextInfo=batch.contexts.find(c=>c.fullText===full);
    assert.ok(contextInfo,'事件原始上下文缺失：'+full);
    assert.equal(contextInfo.datePrefix,date,'事件日期需原樣保存：'+full);
    assert.equal(contextInfo.complete,false,'不擅自更改事件完整度：'+full);
}
function make(parts) {
    const root=new Elem();
    for(const item of parts) {
        if(typeof item==='string')text(root,item);
        else text(element(root,item.tag),item.value);
    }
    return root;
}
function testEvent(name,parts,want,boldWant) {
    const root=make(parts);
    assert.equal(normalizeCompositeEvent(root),true,'事件跨節點辨識失敗：'+name);
    assert.equal(root.textContent,want,'跨節點譯文不符：'+name);
    if(boldWant){
        const strong=root.querySelector('strong');
        assert.ok(strong,'強調節點應保留：'+name);
        assert.equal(strong.textContent,boldWant,'強調節點數值不應被改動：'+name);
    }
    assert.equal(normalizeCompositeEvent(root),false,'不可重複翻譯：'+name);
}
testEvent('收成通知',
    ['[D88 Y36]: ','Harvested your garden flowers... ','+','1 Narcotics'],
    '[D88 Y36]: 你收成了花園裡的花朵…… +1 份麻醉品');
testEvent('收成通知帶粗體數值',
    ['[D88 Y36]: ','Harvested your garden flowers... ','+',{tag:'strong',value:'1'},' Narcotics'],
    '[D88 Y36]: 你收成了花園裡的花朵…… +1 份麻醉品','1');
testEvent('商船購圖',
    ['[D22 Y36]: ','You purchase a rare Treasure Map from the Trading Vessel, ','-','100 Doubloons'],
    '[D22 Y36]: 你從商船購買了一張稀有藏寶圖， -100 枚杜布隆金幣');
testEvent('商船購圖帶粗體價格',
    ['[D22 Y36]: ','You purchase a rare Treasure Map from the Trading Vessel, ','-', {tag:'strong',value:'100'},' Doubloons'],
    '[D22 Y36]: 你從商船購買了一張稀有藏寶圖， -100 枚杜布隆金幣','100');
testEvent('出售麻醉品',
    ['[D88 Y36]: ','You sold ','4 Narcotics',' and earned ','+','$17.2K'],
    '[D88 Y36]: 你賣出了 4 份麻醉品，賺得 +$17.2K');
testEvent('出售麻醉品帶粗體數量',
    ['[D88 Y36]: ','You sold ',{tag:'strong',value:'4'},' Narcotics and earned ','+','$17.2K'],
    '[D88 Y36]: 你賣出了 4 份麻醉品，賺得 +$17.2K','4');
testEvent('挑釁僕從收割靈魂',
    ['[D75 Y36]: ','Your minions are provoked into a frenzy, harvesting souls... ','+','16 Souls'],
    '[D75 Y36]: 你的僕從受到挑釁而陷入狂亂，收割靈魂…… +16 個靈魂');
testEvent('挑釁僕從帶粗體數值',
    ['[D75 Y36]: ','Your minions are provoked into a frenzy, harvesting souls... ','+',{tag:'strong',value:'16'},' Souls'],
    '[D75 Y36]: 你的僕從受到挑釁而陷入狂亂，收割靈魂…… +16 個靈魂','16');
const unsafe=make(['[D75 Y36]: ','Your minions are provoked into a frenzy, harvesting souls... ','+',{tag:'button',value:'16 Souls'}]);
assert.equal(normalizeCompositeEvent(unsafe),false,'互動控制不可被改動');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','更新不得清除既有翻譯紀錄');
console.log('v0.4.27：62 筆詞條、164 筆上下文、數值變體、四種跨節點事件及 DOM 保護測試通過。');
