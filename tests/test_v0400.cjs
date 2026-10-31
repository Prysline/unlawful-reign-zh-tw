'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','unlawful_reign_zh_tw.user.js'),'utf8');
const instrumented=source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,normalizeCompositeEvent};\n})();');
assert.notEqual(instrumented,source,'找不到使用者腳本結尾');

class Elem {
 constructor(tag='div',icon=false){this.nodeType=1;this.tagName=tag.toUpperCase();this.icon=icon;this.parentElement=null;this.childNodes=[];this.className='';}
 get textContent(){return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');}
 closest(){return null;}
 querySelector(selector){
   const tags=selector.split(',').map(s=>s.trim().toUpperCase()).filter(s=>/^[A-Z]+$/.test(s));
   const visit=root=>{for(const n of root.childNodes){if(n.nodeType!==1)continue;if(tags.includes(n.tagName))return n;const hit=visit(n);if(hit)return hit;}return null;};
   return visit(this);
 }
}
function txt(parent,value){const node={nodeType:3,nodeValue:value,parentElement:parent};parent.childNodes.push(node);return node;}
function el(parent,tag='span'){const node=new Elem(tag);node.parentElement=parent;parent.childNodes.push(node);return node;}
const saved={ur_zh_tw_custom:{'Custom Label':'自訂標籤'},ur_zh_tw_untranslated:{'前版未翻譯記錄':''}};
const context={
  Element:Elem,HTMLInputElement:class{},
  Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
  NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
  MutationObserver:class{},
  document:{body:null,addEventListener(){},createTreeWalker(root,mask){
    const all=[];const visit=node=>{for(const child of node.childNodes){if(child.nodeType===3&&(mask&4))all.push(child);if(child.nodeType===1){if(mask&1)all.push(child);visit(child);}}};
    visit(root);let index=0;return{nextNode:()=>all[index++]||null};
  }},
  window:{addEventListener(){}},
  GM_getValue:(k,fallback)=>saved[k]??fallback,
  GM_setValue:(k,v)=>{saved[k]=v;},
  GM_registerMenuCommand(){},
  getComputedStyle:e=>({fontFamily:e.icon?'Material Symbols Outlined':'Arial'})
};
vm.createContext(context);
vm.runInContext(instrumented,context);
const {lookup,translateString,translateText,normalizeCompositeEvent}=context.testAPI;
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0400.json'),'utf8'));
assert.equal(Object.keys(original).length,40);

const expected={
  '+ Store Robberies boosted by +5% (+5% Per Lvl)':'＋商店搶劫加成 +5%（每級 +5%）',
  '+1 Art Gallery Heist Plan Speed':'美術館劫案策劃速度：+1',
  '+1 Navy Ship Attack Cooldown':'海軍艦艇攻擊冷卻時間：+1',
  '+1 Original Artwork (0%)':'原作藝術品：+1（0%）',
  '+1 Original Artwork (10%)':'原作藝術品：+1（10%）',
  '+1 Original Artwork (6%)':'原作藝術品：+1（6%）',
  '+10% when not a criminal':'非罪犯狀態時：+10%',
  '+2 Art Gallery Heist Speed':'美術館劫案速度：+2',
  '+50 HP':'生命值：+50',
  '+50% Chance of success if you have a Replica Artwork to swap with the original':'若有藝術品仿作可與原作交換，成功機率：+50%',
  '3/4 selected':'已選擇 3/4',
  '4/4 selected':'已選擇 4/4',
  'Art Collector':'藝術品收藏家',
  'Art Gallery:':'美術館：',
  'Back to Gang War':'返回幫派戰爭',
  'Beauty is in the eye of the buyer':'美感取決於買家',
  'Bone Shovel':'骨製鏟子',
  'Brutality':'蠻力',
  'Buy Treasure Map':'購買藏寶圖',
  'Choose the actions your crew can use once the fight starts.':'選擇戰鬥開始後船員可以使用的行動。',
  'Health Pack':'醫療包',
  'Hostile Delay':'敵方延遲',
  'Loadout':'裝備配置',
  'Local Protest':'當地抗議',
  'Paint Palette':'調色盤',
  'Raider’s Rampage':'掠奪者的狂暴',
  'Reduce Deal Drugs crime and max crime penalty by 1':'將販售毒品的犯罪懲罰及懲罰上限降低 1',
  'Regrouping (4 Days Left)':'重新集結中（剩餘 4 天）',
  'Royal Price':'皇家價格',
  'Select Combat Actions':'選擇戰鬥行動',
  'So much beauty to steal':'有這麼多美麗的東西可以偷',
  'Study Art':'研究藝術',
  'You and your crew plunder the feeble passenger boat, earning you':'你與船員掠奪了那艘不堪一擊的客船，獲得',
  'You continue planning intricate heist strategies... (10/50)':'你持續規劃精密的劫案策略……（10/50）',
  'You continue planning intricate heist strategies... (2/50)':'你持續規劃精密的劫案策略……（2/50）',
  'You continue planning intricate heist strategies... (4/50)':'你持續規劃精密的劫案策略……（4/50）',
  'You continue planning intricate heist strategies... (6/50)':'你持續規劃精密的劫案策略……（6/50）',
  'You continue planning intricate heist strategies... (8/50)':'你持續規劃精密的劫案策略……（8/50）',
  'You take your time studying every brush stroke and detail':'你仔細研究每一道筆觸與細節',
  'x3 Money from raiding graves':'盜墓獲得的金錢 ×3'
};
assert.equal(Object.keys(expected).length,40);
for(const key of Object.keys(original)){
  assert.equal(translateString(key),expected[key],'翻譯漏缺或字義不同：'+key);
}
const variants={
 '+ Store Robberies boosted by +12.5% (+2% Per Lvl)':'＋商店搶劫加成 +12.5%（每級 +2%）',
 '+8 Art Gallery Heist Plan Speed':'美術館劫案策劃速度：+8',
 '-3 Art Gallery Heist Speed':'美術館劫案速度：-3',
 '-5 Navy Ship Attack Cooldown':'海軍艦艇攻擊冷卻時間：-5',
 '+3 Original Artwork (67.5%)':'原作藝術品：+3（67.5%）',
 '+20% when not a criminal':'非罪犯狀態時：+20%',
 '-35 HP':'生命值：-35',
 '+25% Chance of success if you have a Replica Artwork to swap with the original':'若有藝術品仿作可與原作交換，成功機率：+25%',
 '0/4 selected':'已選擇 0/4',
 'Regrouping (1 Day Left)':'重新集結中（剩餘 1 天）',
 'Reduce Deal Drugs crime and max crime penalty by 5':'將販售毒品的犯罪懲罰及懲罰上限降低 5',
 'You continue planning intricate heist strategies... (25/150)':'你持續規劃精密的劫案策略……（25/150）',
 'x2.5 Money from raiding graves':'盜墓獲得的金錢 ×2.5',
 'Art Gallery':'美術館',
 'Art Gallery:':'美術館：',
 'Health Packs':'醫療包',
 'Health Pack:':'醫療包：',
 'Brutality Lv. 2':'蠻力專精等級 2',
 'Finance Lv. 2':'財務專精等級 2',
 '+7 Jewelry Heist Plan Speed':'珠寶店劫案策劃速度：+7',
 '+ Gambling boosted by +12% (+4% Per Lvl)':'＋賭博加成 +12%（每級 +4%）',
 'Casino:':'賭場：',
 '+ Unlocks New Rune':'＋解鎖新符文',
 'Custom Label:':'自訂標籤：',
 'You load 3 Cannonballs onto your ship for 40 Doubloons':'你裝載 3 發砲彈到你的船上，花費 40 枚杜布隆金幣',
 'Undead Minion':'亡靈僕從'
};
for(const [key,result] of Object.entries(variants)){
  assert.equal(translateString(key),result,'數值或既有功能回歸：'+key);
}

// 美術館劫案進度，完整句、普通拆句、含粗體與日期的拆句應得到同一譯文。
const rich=new Elem();
txt(rich,'［第 3 天／第 1 年］： You continue planning intricate heist strategies... (');
const bold=el(rich,'strong');txt(bold,'10/50');txt(rich,')');
assert.equal(normalizeCompositeEvent(rich),true);
assert.equal(rich.textContent,'［第 3 天／第 1 年］： 你持續規劃精密的劫案策略……（10/50）');
assert.equal(bold.textContent,'10/50','不得破壞粗體的進度數值');
assert.equal(normalizeCompositeEvent(rich),false,'不可重複處理已翻譯文字');
const split=new Elem();txt(split,'You continue planning intricate heist ');
const span=el(split,'span');txt(span,'strategies... (2/50)');
assert.equal(normalizeCompositeEvent(split),true);
assert.equal(split.textContent,expected['You continue planning intricate heist strategies... (2/50)']);
const blocked=new Elem();txt(blocked,'You continue planning intricate heist strategies... (');
const button=el(blocked,'button');txt(button,'10/50');txt(blocked,')');
assert.equal(normalizeCompositeEvent(blocked),false,'互動元素不得被改寫');

const iconText={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
translateText(iconText);
assert.equal(iconText.nodeValue,'settings','圖示字型必須維持原樣');
const labelText={nodeType:3,nodeValue:'settings',parentElement:new Elem()};
translateText(labelText);
assert.equal(labelText.nodeValue,'設定');
assert.equal(lookup('Art Gallery:'),'美術館：');
assert.equal(saved.ur_zh_tw_untranslated['前版未翻譯記錄'],'');
console.log('v0.4.0：40 筆原文、'+Object.keys(variants).length+' 組新格式與舊功能，以及完整句、粗體拆句、圖示、自訂詞庫與紀錄測試通過。');
