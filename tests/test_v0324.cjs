'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','unlawful_reign_zh_tw.user.js'),'utf8');
const instrumented=source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,normalizeCompositeEvent,normalizeSplitFragment};\n})();');
assert.notEqual(instrumented,source);
class Elem{
  constructor(tag='div',icon=false){this.nodeType=1;this.tagName=tag.toUpperCase();this.icon=icon;this.parentElement=null;this.childNodes=[];this.className='';}
  get textContent(){return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');}
  closest(){return null;}
  querySelector(selector){const names=selector.split(',').map(x=>x.trim().toUpperCase()).filter(x=>/^[A-Z]+$/.test(x));
    const scan=root=>{for(const item of root.childNodes){if(item.nodeType!==1)continue;if(names.includes(item.tagName))return item;const nested=scan(item);if(nested)return nested;}return null;};
    return scan(this);}
}
function text(parent,value){const result={nodeType:3,nodeValue:value,parentElement:parent};parent.childNodes.push(result);return result;}
function element(parent,tag){const result=new Elem(tag);result.parentElement=parent;parent.childNodes.push(result);return result;}
const saved={ur_zh_tw_custom:{'Custom Key':'使用者自訂'},ur_zh_tw_untranslated:{'歷史紀錄':''}};
const context={
  Element:Elem,HTMLInputElement:class{},
  Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
  NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
  MutationObserver:class{},
  document:{body:null,addEventListener(){},createTreeWalker(root,mask){
    const items=[];const walk=el=>{for(const node of el.childNodes){if(node.nodeType===3&&(mask&4))items.push(node);
    if(node.nodeType===1){if(mask&1)items.push(node);walk(node);}}};walk(root);
    let index=0;return{nextNode:()=>items[index++]||null};}},
  window:{addEventListener(){}},
  GM_getValue:(k,def)=>saved[k]??def,
  GM_setValue:(k,v)=>{saved[k]=v;},
  GM_registerMenuCommand(){},
  getComputedStyle:e=>({fontFamily:e.icon?'Material Symbols Outlined':'Arial'})
};
vm.createContext(context);
vm.runInContext(instrumented,context);
const api=context.testAPI;
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0324.json'),'utf8'));
assert.equal(Object.keys(batch).length,38);
const alreadyZh=/^杜布隆金幣：-\d+(?:\.\d+)?[KMBT]$/i;
let translated=0,preserved=0;
for(const value of Object.keys(batch)){
  const result=api.lookup(value);
  assert.notEqual(result,null,'未收錄：'+value);
  if(alreadyZh.test(value)){assert.equal(result,value);preserved++;}
  else{assert.notEqual(result,value,'未翻譯：'+value);translated++;}
}
assert.equal(translated,35);
assert.equal(preserved,3);
const cases={
  '+ Gambling boosted by +25% (+7.5% Per Lvl)':'＋賭博加成 +25%（每級 +7.5%）',
  '+ Graffiti boosted by +9% (+2% Per Lvl)':'＋塗鴉加成 +9%（每級 +2%）',
  '+ Shoplift boosted by +12% (+4% Per Lvl)':'＋商店行竊加成 +12%（每級 +4%）',
  '-5% Combo to Money while staying a criminal':'維持罪犯狀態時的金錢連續加成：-5%',
  '7 Cannonballs onto your ship for':'7 發砲彈到你的船上，花費',
  '13 Submachine Guns for':'13 把衝鋒槍以換取',
  'Deactivates 7 Shrines':'停用 7 座神龕',
  'Activate 2 Altars':'Activate 2 Altars',
  'Activate 2 Altar':'啟用 2 座祭壇',
  'Loses +6 Souls per Sacrifice':'每次獻祭失去 +6 個靈魂',
  'Saves $42.50 per day':'每天節省 $42.50',
  'Unlock new Gang War attack using Submachine Guns':'解鎖使用衝鋒槍的新幫派戰爭攻擊招式',
  'x3.5 Graffiti Notoriety Reward':'塗鴉惡名獎勵 ×3.5',
  'You load 7 Cannonballs onto your ship for 150 Doubloons':'你裝載 7 發砲彈到你的船上，花費 150 枚杜布隆金幣',
  'You offer 13 Submachine Guns for 1000 Doubloons':'你提供 13 把衝鋒槍以換取 1000 枚杜布隆金幣',
  'You offer 27 Souls and in return an Undead Minion is promised to work for you':'你提供 27 個靈魂，而作為回報，承諾會有一名亡靈僕從為你效力',
  'The Navy Ship rams against your ship, dealing 44 DMG':'海軍艦艇撞上你的船，造成 44 點傷害',
  'You spend 75 Doubloons to hire a new crewmate on board':'你花費 75 枚杜布隆金幣，雇用一名新船員登船',
  'Armed Robbery (8 G.M, 3 Pistols)':'持械搶劫（8 名幫派成員、3 把手槍）',
  '+ Unlocks New Rune':'＋解鎖新符文',
  'Undead Minion':'亡靈僕從',
  'Custom Key':'使用者自訂'
};
for(const [original,expected] of Object.entries(cases)){
  assert.equal(api.translateString(original),expected,original);
}
function checkComposite(options){
  const root=new Elem();
  if(options.date)text(root,'［第 4 天／第 2 年］： ');
  text(root,options.before);
  const bold=element(root,'strong');text(bold,options.firstNumber);
  text(root,options.middle);
  let other=null;
  if(options.secondNumber!==undefined){other=element(root,'b');text(other,options.secondNumber);text(root,options.after);}
  else text(root,options.after);
  assert.equal(api.normalizeCompositeEvent(root),true,options.label);
  assert.equal(root.textContent,(options.date?'［第 4 天／第 2 年］： ':'')+options.expected,options.label);
  assert.equal(bold.textContent,options.firstNumber,'粗體數值改動：'+options.label);
  if(other)assert.equal(other.textContent,options.secondNumber,'第二個粗體數值改動：'+options.label);
  assert.equal(api.normalizeCompositeEvent(root),false,'不得重複翻譯：'+options.label);
}
checkComposite({label:'裝載砲彈',date:true,before:'You load ',firstNumber:'3',middle:' Cannonballs onto your ship for ',secondNumber:'40',after:' Doubloons',expected:'你裝載 3 發砲彈到你的船上，花費 40 枚杜布隆金幣'});
checkComposite({label:'提供手槍',before:'You offer ',firstNumber:'8',middle:' Pistols for ',secondNumber:'200',after:' Doubloons',expected:'你提供 8 把手槍以換取 200 枚杜布隆金幣'});
checkComposite({label:'獻祭靈魂',before:'You offer ',firstNumber:'20',middle:' Souls and in return an Undead Minion is promised to work for you',after:'',expected:'你提供 20 個靈魂，而作為回報，承諾會有一名亡靈僕從為你效力'});
checkComposite({label:'艦船撞擊',before:'The Navy Ship rams against your ship, dealing ',firstNumber:'17',middle:' DMG',after:'',expected:'海軍艦艇撞上你的船，造成 17 點傷害'});
checkComposite({label:'雇用船員',before:'You spend ',firstNumber:'75',middle:' Doubloons to hire a new crewmate on board',after:'',expected:'你花費 75 枚杜布隆金幣，雇用一名新船員登船'});
const untrusted=new Elem();text(untrusted,'You load 3 Cannonballs onto your ship for ');element(untrusted,'button');text(untrusted,'40 Doubloons');
assert.equal(api.normalizeCompositeEvent(untrusted),false,'包含互動控制時不得變更');
const split=new Elem();text(split,'3 Cannonballs ');const part=element(split,'span');text(part,'onto your ship for');
assert.equal(api.normalizeSplitFragment(split),true);
assert.equal(split.textContent,'3 發砲彈到你的船上，花費');
const icon={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
api.translateText(icon);
assert.equal(icon.nodeValue,'settings');
assert.equal(saved.ur_zh_tw_untranslated['歷史紀錄'],'');
assert.equal(api.lookup('杜布隆金幣：-2.8K'),'杜布隆金幣：-2.8K');
console.log('v0.3.24：38 筆輸入、'+Object.keys(cases).length+' 組不同數值及舊版規則、5 種粗體事件、拆句與圖示保護測試通過。');
