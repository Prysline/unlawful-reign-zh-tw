'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const file = path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js');
const source = fs.readFileSync(file, 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI = {lookup, translateString, translateText, translateGroupedPurchase, normalizeSwatRaidLog, normalizeSwatRaidLogInAncestors, normalizeSacrificeLog, normalizeSacrificeLogInAncestors, scan};\n})();');
assert.notEqual(instrumented, source);
class ElementMock {
    constructor(tag='span', opts={}) {
        this.nodeType=1;
        this.tagName=tag.toUpperCase();
        this.parentElement=null;
        this.childNodes=[];
        this.attrs={};
        this.icon=!!opts.icon;
        this.className=opts.className||'';
    }
    get textContent(){return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');}
    getAttribute(n){return this.attrs[n]??null;}
    setAttribute(n,v){this.attrs[n]=String(v);}
    closest(selector){
        let cur=this;
        while(cur){
          if(cur.className==='material-icons'&&selector.includes('.material-icons'))return cur;
          cur=cur.parentElement;
        }
        return null;
    }
    querySelector(){return null;}
}
function add(parent,node){node.parentElement=parent;parent.childNodes.push(node);return node;}
function text(parent,value){const n={nodeType:3,nodeValue:value,parentElement:parent};parent.childNodes.push(n);return n;}
const storage = {ur_zh_tw_untranslated:{'既有紀錄':''},ur_zh_tw_custom:{}};
const context={
    Element:ElementMock,HTMLInputElement:class{},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
    NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    GM_getValue:(key,fallback)=>storage[key]??fallback,
    GM_setValue:(key,value)=>{storage[key]=value;},
    GM_registerMenuCommand:()=>{},
    getComputedStyle:e=>({fontFamily:e.icon?'Material Symbols Outlined':'Arial'}),
    window:{addEventListener:()=>{}},
    document:{
        body:null,addEventListener:()=>{},
        createTreeWalker(root,mask){
            const nodes=[];
            function visit(el){
                for(const n of el.childNodes||[]){
                    if(n.nodeType===3&&mask&4)nodes.push(n);
                    else if(n.nodeType===1){if(mask&1)nodes.push(n); visit(n);}
                }
            }
            visit(root);
            let i=0;
            return {nextNode:()=>nodes[i++]||null};
        }
    },
    MutationObserver:class {}
};
vm.createContext(context);
vm.runInContext(instrumented,context,{filename:file});
const api=context.testAPI;

const batch = [
  "+1 Undead Minion",
  "+1 Undead Minion (1%)",
  "+1 Undead Minion (100%)",
  "+1 Undead Minion (26%)",
  "+1 Undead Minion (72%)",
  "+1 Undead Minion (82%)",
  "+1 Undead Minion (84%)",
  "+1 max drugs dealt to Shady Strangers",
  "+10% Chance Fake Identity is not used up",
  "+10% Shoplift Stolen Goods chance",
  "+2 Max Undead Minions",
  "1 Member into your Gang",
  "1 Undead Minion",
  "20% Global Notoriety",
  "A Pirate's Life for Me",
  "Addicted Clientele",
  "Blood Diamonds",
  "Buy a small boat and set asail",
  "Choose to give an Undead Minion instead of souls to the Devil",
  "Convincing Fake",
  "Devilish Bargain",
  "Easy Upsell",
  "Gang Coupons",
  "Grave Robber",
  "Hidey Hole",
  "Jewelry Store Robberies give x2 Notoriety",
  "LOSE ALL MONEY",
  "LOSE ALL NOTORIETY",
  "Large Jewelry Box",
  "New Gang Members are 15% cheaper to recruit",
  "Next Recruitment in",
  "No more running",
  "Notoriety Multiplier",
  "Raided",
  "Recruited",
  "Rivals Defeated",
  "SWAT Team",
  "SWAT Team:",
  "Safehouse:",
  "Safehouses are thrice as common",
  "Shady Debates",
  "Swiper, Yes Swiping",
  "The Bloodlickers",
  "The Crown Cannons",
  "The Jade Blades",
  "The SWAT Team raids your safehouse and supplies,",
  "Try Awaken Dead (1%)",
  "Try Awaken Dead (100%)",
  "Try Awaken Dead (11%)",
  "Try Awaken Dead (17%)",
  "Try Awaken Dead (20%)",
  "Try Awaken Dead (23%)",
  "Try Awaken Dead (24%)",
  "Try Awaken Dead (25%)",
  "Try Awaken Dead (26%)",
  "Try Awaken Dead (29%)",
  "Try Awaken Dead (34%)",
  "Try Awaken Dead (36%)",
  "Try Awaken Dead (37%)",
  "Try Awaken Dead (41%)",
  "Try Awaken Dead (42%)",
  "Try Awaken Dead (5%)",
  "Try Awaken Dead (52%)",
  "Try Awaken Dead (55%)",
  "Try Awaken Dead (57%)",
  "Try Awaken Dead (63%)",
  "Try Awaken Dead (65%)",
  "Try Awaken Dead (68%)",
  "Try Awaken Dead (72%)",
  "Try Awaken Dead (75%)",
  "Try Awaken Dead (82%)",
  "Try Awaken Dead (84%)",
  "Try Awaken Dead (94%)",
  "Undead Force",
  "Undead Minion",
  "Undead Minions",
  "Upper Class Streets",
  "Whistle Lure",
  "You defeated 'The Crown Cannons', earning you",
  "You defeated 'The Iron Ravens', earning you",
  "You defeated 'The Jade Blades', earning you",
  "You hand the police your fake ID card and safely leave before he realizes.",
  "You hit 'The Crown Cannons' with Dirty Ambush, dealing",
  "You hit 'The Iron Ravens' with Squad Shootout, dealing",
  "You hit 'The Jade Blades' with Drive By, dealing",
  "You sacrifice",
  "Your Gang manages to attract another Shady Associate...",
  "Your petty sacrifice of",
  "and the dead are pleased...",
  "per Undead Minion",
  "simply angers the dead... nothing happens",
  "x1.5 Notoriety gained from talking with Shady Strangers",
  "x1.5 money earned from Pickpocket and Shoplifting",
  "x1.80 Notoriety (14 days)",
  "x1.80 Notoriety (15 days)",
  "x2 Stolen Goods Sell Price",
  "x2.5 Raid Grave Money Reward",
  "與「The Bloodlickers」開戰。勝利可獲得 +20% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。",
  "與「The Crown Cannons」開戰。勝利可獲得 +20% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。",
  "與「The Jade Blades」開戰。勝利可獲得 +20% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。"
];
for(const original of batch){
  const result=api.lookup(original);
  assert.notEqual(result,null,`缺少翻譯: ${original}`);
  assert.notEqual(result,original,`翻譯後未改變: ${original}`);
}
const expected = {
  'Undead Minion': '亡靈僕從',
  'Undead Minions': '亡靈僕從',
  '1 Undead Minion': '1 名亡靈僕從',
  '29 Undead Minions': '29 名亡靈僕從',
  '+1 Undead Minion': '亡靈僕從：+1',
  '+5 Undead Minions': '亡靈僕從：+5',
  '+1 Undead Minion (82%)': '亡靈僕從：+1（82%）',
  '+2 Undead Minions (7%)': '亡靈僕從：+2（7%）',
  'Try Awaken Dead (13%)': '嘗試喚醒死者（13%）',
  '+12 max drugs dealt to Shady Strangers': '向可疑陌生人販售毒品的上限：+12',
  '+17% Chance Fake Identity is not used up': '假身分不被消耗的機率：+17%',
  'Jewelry Store Robberies give x2.5 Notoriety': '珠寶店搶劫獲得的惡名 ×2.5',
  'x1.25 money earned from Pickpocket and Shoplifting': '扒竊及商店行竊獲得的金錢 ×1.25',
  'x2.75 Notoriety (24 days)': '惡名 ×2.75（24 天）',
  'x2.75 Stolen Goods Sell Price': '贓物出售價格 ×2.75',
  'Safehouse:': '安全屋：',
  'The Bloodlickers': '舔血者',
  'per Undead Minion': '每名亡靈僕從',
  '與「The Bloodlickers」開戰。勝利可獲得 +45% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。': '與「舔血者」開戰。勝利可獲得 +45% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。'
};
for (const [original,translated] of Object.entries(expected)){
  assert.equal(api.translateString(original),translated,original);
}
const inventory = new ElementMock('div');
const item = text(inventory,'Undead Minion');
api.scan(inventory);
assert.equal(item.nodeValue,'亡靈僕從','左上角物品名稱必須翻譯');
item.nodeValue='Undead Minions';
api.translateText(item);
assert.equal(item.nodeValue,'亡靈僕從','動態更新複數名稱必須翻譯');
item.nodeValue='1 Undead Minion';
api.translateText(item);
assert.equal(item.nodeValue,'1 名亡靈僕從','物品數量與名稱必須翻譯');
const icon=new ElementMock('span',{icon:true});
const iconText=text(icon,'settings');
api.translateText(iconText);
assert.equal(iconText.nodeValue,'settings','不得破壞圖示字型');
assert.equal(storage.ur_zh_tw_untranslated['既有紀錄'],'','不得清除舊紀錄');

function makeSuccess(soulString='100 Souls', prefix='', reward='1 Undead Minion') {
    const log=new ElementMock('div');
    const start=text(log,prefix+'You sacrifice ');
    const soul=add(log,new ElementMock('strong'));
    const soulText=text(soul,soulString);
    const tail=text(log,' and the dead are pleased... ');
    const plus=add(log,new ElementMock('strong'));
    const plusText=text(plus,'+');
    const rewardNode=text(log,reward);
    return {log,start,soul,soulText,tail,plus,plusText,rewardNode};
}
function makeFailure(soulString='100 Souls',prefix='') {
    const log=new ElementMock('div');
    const start=text(log,prefix+'Your petty sacrifice of ');
    const soul=add(log,new ElementMock('strong'));
    const soulText=text(soul,soulString);
    const tail=text(log,' simply angers the dead... nothing happens');
    return {log,start,soul,soulText,tail};
}
const rawSuccess=makeSuccess();
assert.equal(api.normalizeSacrificeLog(rawSuccess.log),true,'成功事件須能識別原始文字');
assert.equal(rawSuccess.start.nodeValue,'你獻祭了 ');
assert.equal(rawSuccess.soulText.nodeValue,'100 個靈魂');
assert.equal(rawSuccess.tail.nodeValue,'，死者們感到滿意…… ');
assert.equal(rawSuccess.plusText.nodeValue,'+');
assert.equal(rawSuccess.rewardNode.nodeValue,'1 名亡靈僕從');
assert.equal(rawSuccess.log.childNodes[1],rawSuccess.soul,'粗體靈魂元素不可重建');
assert.equal(rawSuccess.log.childNodes[3],rawSuccess.plus,'粗體 + 元素不可重建');
assert.equal(api.normalizeSacrificeLog(rawSuccess.log),false,'再掃描不得重複修改');
const partlyTranslated=makeSuccess('靈魂：100', '［第 57 天／第 11 年］：');
api.scan(partlyTranslated.log);
assert.match(partlyTranslated.log.textContent,/你獻祭了\s*100 個靈魂，死者們感到滿意……/);
assert.match(partlyTranslated.log.textContent,/\+1 名亡靈僕從$/);
assert.equal(partlyTranslated.soulText.nodeValue,'100 個靈魂');
const fail=makeFailure('靈魂：40','[D57 Y11]: ');
api.scan(fail.log);
assert.match(fail.log.textContent,/你那微不足道的獻祭，獻上了\s*40 個靈魂，卻只是激怒了死者……什麼也沒發生$/);
assert.equal(fail.soulText.nodeValue,'40 個靈魂');
assert.equal(fail.log.childNodes[1],fail.soul);
assert.equal(api.normalizeSacrificeLog(fail.log),false,'失敗事件再次掃描需無變化');
const partial=makeSuccess('靈魂：300');
api.scan(partial.soulText);
assert.equal(partial.start.nodeValue,'你獻祭了 ','由單一文字節點觸發也應修正整句');
const nonLog=new ElementMock('div');
const standaloneSoul=text(nonLog,'100 Souls');
api.scan(nonLog);
assert.equal(standaloneSoul.nodeValue,'靈魂：100','一般靈魂資源顯示不可被改成事件敘述');
const unrelated=new ElementMock('div');
const normalText=text(unrelated,'You sacrifice the stranger and harvest');
assert.equal(api.normalizeSacrificeLog(unrelated),false,'不得誤判一般獻祭事件');
api.scan(unrelated);
assert.equal(normalText.nodeValue,'你獻祭了陌生人，並收穫了');
assert.equal(storage.ur_zh_tw_untranslated['既有紀錄'],'');
console.log('v0.3.15：成功及失敗紀錄、部分已翻譯內容、粗體保留、獨立文字節點與儲存回歸測試通過。');

console.log(`通過：${batch.length} 筆原始文字、${Object.keys(expected).length} 組精確翻譯與數值測試，以及物品區、圖示、舊紀錄回歸測試。`);
