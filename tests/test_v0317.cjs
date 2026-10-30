'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,scan,normalizeSplitFragment,normalizeSplitFragmentInAncestors,normalizeBattleDamageLog,normalizeBattleDamageLogInAncestors};\n})();');
assert.notEqual(instrumented, source);
class Elem {
  constructor(tag='div', opts={}) {this.nodeType=1;this.tagName=tag.toUpperCase();this.parentElement=null;this.childNodes=[];this.attrs={};this.className=opts.className||'';this.icon=!!opts.icon;}
  get textContent(){return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');}
  closest(selector){let n=this;while(n){if(n.className==='material-icons' && selector.includes('.material-icons'))return n;n=n.parentElement;}return null;}
  querySelector(selector){const tags=selector.split(',').map(x=>x.trim()).filter(x=>/^[a-z]+$/.test(x)).map(x=>x.toUpperCase());const visit=(root)=>{for(const node of root.childNodes){if(node.nodeType!==1)continue;if(tags.includes(node.tagName))return node;const found=visit(node);if(found)return found;}return null;};return visit(this);}
  getAttribute(key){return this.attrs[key]??null;}
  setAttribute(key,value){this.attrs[key]=value;}
}
function el(parent,tag='span',opts={}){const v=new Elem(tag,opts);v.parentElement=parent;parent.childNodes.push(v);return v;}
function txt(parent,raw){const v={nodeType:3,nodeValue:raw,parentElement:parent};parent.childNodes.push(v);return v;}
const saved={ur_zh_tw_custom:{},ur_zh_tw_untranslated:{'previous':'','舊紀錄':''}};
const context={
  Element:Elem,HTMLInputElement:class{},
  Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
  GM_getValue:(key,f)=>saved[key]??f,GM_setValue:(key,v)=>{saved[key]=v;},GM_registerMenuCommand:()=>{},
  getComputedStyle:e=>({fontFamily:e.icon?'Material Symbols Outlined':'Arial'}),
  window:{addEventListener:()=>{}},MutationObserver:class{},
  document:{body:null,addEventListener:()=>{},createTreeWalker(root,mask){const nodes=[];const visit=(e)=>{for(const v of e.childNodes){if(v.nodeType===3 && mask&4)nodes.push(v);else if(v.nodeType===1){if(mask&1)nodes.push(v);visit(v);}}};visit(root);let i=0;return {nextNode:()=>nodes[i++]||null};}}
};
vm.createContext(context);vm.runInContext(instrumented,context);const api=context.testAPI;
const data=JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'batch_v0316.json'),'utf8'));
for(const item of Object.keys(data)){const tr=api.lookup(item);assert.notEqual(tr,null,`Missing: ${item}`);assert.equal(typeof tr,'string');}
const dynamic={
  "'The Nightmare Hyenas' deal":'「夢魘鬣狗」造成',
  '(+41% Ritual Duration/Shrine)':'（每座神龕的儀式持續時間：+41%）',
  '(-13% Ritual Power/Blood Pool)':'（每座血池的儀式威力：-13%）',
  '(-$77.50 per day/Blood Pool)':'（每座血池每日金錢：-$77.50）',
  '(-3 Souls per day/Shrine)':'（每座神龕每日靈魂：-3）',
  '+ Unlock New Equipment':'＋解鎖新裝備',
  '+ Unlock New Rune':'＋解鎖新符文',
  '+ Unlock New Ritual':'＋解鎖新儀式',
  '+ Unlock New Structures':'＋解鎖新建築',
  '+37% Ritual Duration':'儀式持續時間：+37%',
  '+4 Max bribe level':'賄賂等級上限：+4',
  '+9 Shrine':'神龕：+9',
  '-2 Blood Pool':'血池：-2',
  '+900 Max Drugs Capacity':'毒品容量上限：+900',
  '+18% Chance to win when gambling':'賭博獲勝機率：+18%',
  '-10% Notoriety':'惡名：-10%',
  '-7 Souls per day':'每日靈魂：-7',
  '-4 Gang War attack base cooldown':'幫派戰爭攻擊的基礎冷卻時間：-4',
  '-35% Seed Prices':'種子價格：-35%',
  '21% Chance to yield x3 harvest':'收成獲得 3 倍產量的機率：21%',
  'Gain 55% Gamble success chance':'賭博成功機率增加 55%',
  'Gamble (77.5%)':'賭博（77.5%）',
  'Lose 30% less money when busted':'被逮捕時損失的金錢減少 30%',
  'Weeds, slowing down growth by 85%':'雜草，使生長速度減慢 85%',
  'x2.5 Counting Cards money':'算牌獲得的金錢 ×2.5',
  'x3 Drugs Sell Price':'毒品出售價格 ×3',
  'x4 Counting cards reward':'算牌獎勵 ×4',
  'x2.25 income from each gang member':'每名幫派成員的收入 ×2.25',
  '1K':'1K', '1.1K':'1.1K', '3.5M':'3.5M',
  'Casino':'賭場','Safehouse':'安全屋','to your gang':'加入你的幫派',
};
for(const [key,value] of Object.entries(dynamic)) assert.equal(api.translateString(key),value,key);
// 非圖示一般文字保持正常翻譯，圖示元素略過。
const icon=el(new Elem(),'span',{icon:true});const iconText=txt(icon,'settings');api.translateText(iconText);assert.equal(iconText.nodeValue,'settings');
const label=el(new Elem());const labelText=txt(label,'settings');api.translateText(labelText);assert.equal(labelText.nodeValue,'設定');
// 拆成多個文字節點的前綴：只替換已知片段。
const frag=new Elem();txt(frag,"'The ");const span=el(frag);txt(span,'Bloodlickers');txt(frag,"' deal");
assert.equal(api.normalizeSplitFragment(frag),true);assert.equal(frag.textContent,'「舔血者」造成');
// 整句戰鬥紀錄保留粗體傷害的元素，不直接扁平化整段。
const log=new Elem();txt(log,'［第 18 天／第 4 年］： ');txt(log,"'The ");const name=el(log);txt(name,'Nightmare Hyenas');txt(log,"' deal ");const bold=el(log,'strong');txt(bold,'60 Dmg');txt(log,' to your gang');
assert.equal(api.normalizeBattleDamageLog(log),true);assert.equal(log.textContent,'［第 18 天／第 4 年］： 「夢魘鬣狗」對你的幫派造成 60 點傷害');assert.equal(bold.textContent,'60 點傷害');assert.equal(api.normalizeBattleDamageLog(log),false);
// 含粗體的其他文字不得被一般片段合併函式破壞。
const strongFrag=new Elem();txt(strongFrag,'You ');const strong=el(strongFrag,'strong');txt(strong,'gamble');txt(strongFrag,' and win!');
assert.equal(api.normalizeSplitFragment(strongFrag),false);assert.equal(strong.textContent,'gamble');
assert.equal(saved.ur_zh_tw_untranslated.previous,'');

// v0.3.17 原始檔完整覆蓋，避免為不同數量重複增加詞條。
const maritime = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'batch_v0317.json'), 'utf8'));
const untranslatable = new Set(Object.keys(maritime).filter(key => /^\d+(?:[.,]\d+)?[KMBT]$/i.test(key)));
for (const original of Object.keys(maritime)) {
  const tr = api.lookup(original);
  assert.notEqual(tr, null, `未辨識：${original}`);
  assert.equal(typeof tr, 'string');
  if (untranslatable.has(original)) assert.equal(tr, original, `數值縮寫必須保留：${original}`);
  else assert.notEqual(tr, original, `應翻譯：${original}`);
}
assert.equal(Object.keys(maritime).length, 176);
assert.equal(untranslatable.size, 14);
const seaTests = {
  '+13 Crewmates (83%)':'船員：+13（83%）',
  '-2 Crewmate (25.5%)':'船員：-2（25.5%）',
  '13 / 28 Crewmates':'船員：13 / 28',
  '-8% Chance to recruit Shady Strangers when not a criminal':'非罪犯狀態時招募可疑陌生人的機率：-8%',
  '+75% HP':'生命值：+75%',
  '+15.5% Ship Speed':'船隻速度：+15.5%',
  '-42% Sailing Speed':'航行速度：-42%',
  '-35% Supplies Find Chance':'找到補給品的機率：-35%',
  '-65% during Foggy Weather':'起霧天氣時：-65%',
  '+25 Ship HP per day while docked at the Safe Haven':'停靠在避風港時，每日船隻生命值 +25',
  '+450 Doubloons':'杜布隆金幣：+450',
  '-10 Doubloons':'杜布隆金幣：-10',
  '12 Doubloons':'12 枚杜布隆金幣',
  '+400 Supplies':'補給品：+400',
  '-700 Supplies':'補給品：-700',
  '25 Supplies':'25 份補給品',
  '-5 Fake Identity (25% Chance not Used)':'假身分：-5（25% 機率不消耗）',
  '68% chance of escaping the Navy Ship':'逃離海軍艦艇的機率：68%',
  '19% Chance of finding 20 to 70 Supplies per Day while Sailing':'航行時每天有 19% 機率找到 20 至 70 份補給品',
  'Flee (80%)':'逃離（80%）',
  'Recruit Crewmate (95%)':'招募船員（95%）',
  'Gain +15% more when you gamble and win than when you lose':'賭博獲勝時比落敗時多獲得 +15%',
  'x1.7 Pirating Damage':'海盜活動傷害 ×1.7',
  'x2.5 Notoriety from Undermining the Police':'暗中破壞警方行動獲得的惡名 ×2.5',
  'x3 Pickpocket and Shoplifting Rewards':'扒竊與商店行竊獎勵 ×3',
  'x4 Amount you gamble':'賭注金額 ×4',
  'x2.5 Gang Passive Money Income':'幫派被動金錢收入 ×2.5',
  'Nautical Miles / Day':'海里／天',
  'Doubloons':'杜布隆金幣',
  'The winds carry your ship away into the horizon, leaving the Navy Ship in your wake':'風帶著你的船駛向地平線，把海軍艦艇甩在身後',
  'You find an unsuspecting Passanger Boat, alone in the middle of the sea':'你發現一艘毫無戒心的客船，獨自在海中央航行',
  "You undermine the cop's actions, earning you":"你暗中破壞警察的行動，並獲得",
};
for (const [original, expected] of Object.entries(seaTests)) {
  assert.equal(api.translateString(original), expected, original);
}
// 拆句時只合併已確認的完整片段，不得破壞含粗體獎勵數值的父節點。
const prefix = new Elem(); txt(prefix, 'You undermine the ');const middle = el(prefix);txt(middle, "cop's actions");txt(prefix, ', earning you');
assert.equal(api.normalizeSplitFragment(prefix), true);
assert.equal(prefix.textContent, '你暗中破壞警察的行動，並獲得');
const build = new Elem();txt(build,'Build '); const mid = el(build);txt(mid,'the');
assert.equal(api.normalizeSplitFragment(build),true);
assert.equal(build.textContent,'建造');
const log2 = new Elem();txt(log2,'You undermine the ');const labelPart = el(log2);txt(labelPart,"cop's actions, earning you ");const sum = el(log2,'strong');txt(sum,'+25 Not.');
assert.equal(api.normalizeSplitFragment(log2),false);
assert.equal(sum.textContent,'+25 Not.');
// 既有設定圖示與使用者歷史資料仍保持不變。
assert.equal(saved.ur_zh_tw_untranslated.previous,'');
console.log(`通過：${Object.keys(maritime).length} 筆輸入、${Object.keys(seaTests).length} 組新數值／文字測試、拆句與圖示回歸測試。`);
