'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const file = path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js');
const source = fs.readFileSync(file, 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI = {lookup, translateString, translateText, translateGroupedPurchase, normalizeSwatRaidLog, normalizeSwatRaidLogInAncestors, scan};\n})();');
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
const cases={
    '+1 Undead Minion (26%)':'亡靈僕從：+1（26%）',
    '+1 Undead Minion (72%)':'亡靈僕從：+1（72%）',
    '+10% Shoplift Stolen Goods chance':'商店行竊獲得贓物的機率：+10%',
    '+2 Max Undead Minions':'亡靈僕從上限：+2',
    '1 Member into your Gang':'1 名成員加入你的幫派',
    '20% Global Notoriety':'全域惡名：20%',
    'Choose to give an Undead Minion instead of souls to the Devil':'可以選擇交給魔鬼一名亡靈僕從，而不是靈魂',
    'Devilish Bargain':'魔鬼交易',
    'Gang Coupons':'幫派優惠券',
    'Grave Robber':'盜墓者',
    'LOSE ALL MONEY':'失去所有金錢',
    'LOSE ALL NOTORIETY':'失去所有惡名',
    'Large Jewelry Box':'大型珠寶盒',
    'New Gang Members are 15% cheaper to recruit':'招募新幫派成員的費用降低 15%',
    'Next Recruitment in':'距離下次招募還有',
    'No more running':'不必再逃跑了',
    'Notoriety Multiplier':'惡名倍率',
    'Raided':'已遭突襲',
    'Recruited':'已招募',
    'Rivals Defeated':'擊敗的對手',
    'SWAT Team':'特警隊',
    'SWAT Team:':'特警隊：',
    'Shady Debates':'可疑辯論',
    'Swiper, Yes Swiping':'偷竊者，沒錯，就是偷竊',
    'The Crown Cannons':'王冠火砲',
    'The Jade Blades':'翡翠之刃',
    'Try Awaken Dead (26%)':'嘗試喚醒死者（26%）',
    'Try Awaken Dead (36%)':'嘗試喚醒死者（36%）',
    'Try Awaken Dead (41%)':'嘗試喚醒死者（41%）',
    'Try Awaken Dead (55%)':'嘗試喚醒死者（55%）',
    'Try Awaken Dead (65%)':'嘗試喚醒死者（65%）',
    'Try Awaken Dead (72%)':'嘗試喚醒死者（72%）',
    'Undead Force':'亡靈軍團',
    'Whistle Lure':'口哨誘餌',
    "You defeated 'The Iron Ravens', earning you":'你擊敗了「鐵鴉」，並獲得',
    "You defeated 'The Jade Blades', earning you":'你擊敗了「翡翠之刃」，並獲得',
    "You hit 'The Iron Ravens' with Squad Shootout, dealing":'你以「小隊槍戰」擊中「鐵鴉」，造成',
    "You hit 'The Jade Blades' with Drive By, dealing":'你以「駕車掃射」擊中「翡翠之刃」，造成',
    'Your Gang manages to attract another Shady Associate...':'你的幫派成功吸引了另一名可疑同夥……',
    'x1.5 Notoriety gained from talking with Shady Strangers':'與可疑陌生人交談獲得的惡名 ×1.5',
    'x2.5 Raid Grave Money Reward':'盜墓金錢獎勵 ×2.5',
    '與「The Jade Blades」開戰。勝利可獲得 +20% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。':'與「翡翠之刃」開戰。勝利可獲得 +20% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。',
};
assert.equal(Object.keys(cases).length,42);
for(const [raw,expected] of Object.entries(cases)){
    assert.equal(api.translateString(raw),expected,raw);
}
const variables={
    '+25 Undead Minion (95%)':'亡靈僕從：+25（95%）',
    '-5 Undead Minion (2.5%)':'亡靈僕從：-5（2.5%）',
    '+47% Shoplift Stolen Goods chance':'商店行竊獲得贓物的機率：+47%',
    '-1 Max Undead Minions':'亡靈僕從上限：-1',
    '31 Member into your Gang':'31 名成員加入你的幫派',
    '75.5% Global Notoriety':'全域惡名：75.5%',
    'New Gang Members are 70% cheaper to recruit':'招募新幫派成員的費用降低 70%',
    'Try Awaken Dead (100%)':'嘗試喚醒死者（100%）',
    "You defeated 'The Crown Cannons', earning you":'你擊敗了「王冠火砲」，並獲得',
    "You hit 'The Crown Cannons' with Dirty Ambush, dealing":'你以「卑劣伏擊」擊中「王冠火砲」，造成',
    'x2 Notoriety gained from talking with Shady Strangers':'與可疑陌生人交談獲得的惡名 ×2',
    'x9 Raid Grave Money Reward':'盜墓金錢獎勵 ×9',
    '與「The Crown Cannons」開戰。勝利可獲得 +45% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。':'與「王冠火砲」開戰。勝利可獲得 +45% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。'
};
for(const [raw,expected] of Object.entries(variables))assert.equal(api.translateString(raw),expected,raw);
assert.equal(api.translateString('The SWAT Team raids your safehouse and supplies,'),'特警隊突襲了你的安全屋與物資，');
// 多個文字節點，既有「-」在惡名文字節點之外的情況。
function raidLog(rawNotoriety, detachedMinus=false){
    const entry=new ElementMock('div');
    const date=add(entry,new ElementMock('span'));text(date,'[D57 Y11]:');
    text(entry,' The SWAT Team raids your safehouse and supplies, ');
    const money=add(entry,new ElementMock('strong'));text(money,'-$65.03');
    text(entry,' and ');
    const not=add(entry,new ElementMock('strong'));
    if(detachedMinus)text(not,'-');
    const value=add(not,new ElementMock('span'));text(value,rawNotoriety);
    return {entry,money,not,value};
}
for(const [value,split] of [['179.60 Not.',true],['-179.60 Not.',false],['-惡名：179.60',false],['惡名：179.60',true]]){
    const log=raidLog(value,split);
    api.scan(log.entry);
    assert.ok(log.entry.textContent.includes('特警隊突襲了你的安全屋與物資，'));
    assert.ok(log.entry.textContent.includes('［第 57 天／第 11 年］：'));
    assert.ok(log.entry.textContent.includes('惡名：-179.60'));
    assert.ok(log.entry.textContent.includes('-$65.03'));
    assert.ok(!log.entry.textContent.includes('-惡名：'));
    assert.equal(log.value.childNodes[0].nodeValue,'惡名：-179.60');
    assert.equal(log.money.childNodes[0].nodeValue,'-$65.03');
    api.scan(log.entry);
    assert.equal(log.value.childNodes[0].nodeValue,'惡名：-179.60','不應重複翻譯');
}
// 非特警隊訊息不可改寫數值。
const other=new ElementMock('div'); text(other,'Other event, ');const otherN=add(other,new ElementMock('strong'));text(otherN,'-');text(otherN,'179.60 Not.');
assert.equal(api.normalizeSwatRaidLog(other),false);
const icon=new ElementMock('span',{icon:true});const iconText=text(icon,'settings');api.translateText(iconText);assert.equal(iconText.nodeValue,'settings');
assert.equal(storage.ur_zh_tw_untranslated['既有紀錄'],'');
assert.equal(storage.ur_zh_tw_untranslated[cases['與「The Jade Blades」開戰。勝利可獲得 +20% 全域惡名。如果你的幫派戰敗，你將失去所有惡名與幫派成員。']],undefined);
console.log('通過：42 筆新文字、13 組數值變化、4 種特警隊紀錄分段、圖示與保存回歸測試。');
