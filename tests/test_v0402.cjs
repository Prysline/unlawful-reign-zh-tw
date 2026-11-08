'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','unlawful_reign_zh_tw.user.js'),'utf8');
const instrumented=source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,normalizeCompositeEvent,normalizeSplitFragment};\n})();');
assert.notEqual(instrumented,source);

class Elem {
    constructor(tag='div',icon=false){this.nodeType=1;this.tagName=tag.toUpperCase();this.icon=icon;this.parentElement=null;this.childNodes=[];this.className='';}
    get textContent(){return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');}
    closest(){return null;}
    querySelector(selector){
        const names=selector.split(',').map(x=>x.trim().toUpperCase()).filter(x=>/^[A-Z]+$/.test(x));
        const find=root=>{for(const n of root.childNodes){if(n.nodeType!==1)continue;if(names.includes(n.tagName))return n;const found=find(n);if(found)return found;}return null;};
        return find(this);
    }
}
const text=(p,v)=>{const n={nodeType:3,nodeValue:v,parentElement:p};p.childNodes.push(n);return n;};
const element=(p,tag)=>{const n=new Elem(tag);n.parentElement=p;p.childNodes.push(n);return n;};
const storage={ur_zh_tw_custom:{'Custom Text':'自訂譯文'},ur_zh_tw_untranslated:{'歷史待翻譯紀錄':''}};
const sandbox={
    Element:Elem,HTMLInputElement:class{},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
    NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    MutationObserver:class{},
    document:{body:null,addEventListener(){},createTreeWalker(root,mask){
        const found=[];const visit=e=>{for(const n of e.childNodes){if(n.nodeType===3&&(mask&4))found.push(n);if(n.nodeType===1){if(mask&1)found.push(n);visit(n);}}};
        visit(root);let i=0;return{nextNode:()=>found[i++]||null};
    }},
    window:{addEventListener(){}},
    GM_getValue:(key,fallback)=>storage[key]??fallback,
    GM_setValue:(key,value)=>{storage[key]=value;},
    GM_registerMenuCommand(){},
    getComputedStyle:e=>({fontFamily:e.icon?'Material Symbols Outlined':'Arial'})
};
vm.createContext(sandbox);
vm.runInContext(instrumented,sandbox);
const {lookup,translateString,translateText,normalizeCompositeEvent,normalizeSplitFragment}=sandbox.testAPI;

const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0402.json'),'utf8'));
const expected={
    '+1 Art EXP from Studying Paintings':'研究畫作獲得的藝術經驗值：+1',
    '+1 Fake Identity from Forging Documents':'偽造文件獲得的假身分：+1',
    '+1 Replica Artwork':'藝術品仿作：+1',
    '+4 Ship HP per day while docked at the haven':'停靠在避風港時，每日船隻生命值 +4',
    '-1 Attack Cooldowns':'攻擊冷卻時間：-1',
    '-1 Replica Artwork':'藝術品仿作：-1',
    '-₵5K':'-₵5K',
    '/ Day)':'／天）',
    '1 Replica Artwork':'1 件藝術品仿作',
    'Art Classes':'藝術課程',
    'Business License':'營業執照',
    'Bustling Harbor':'繁忙的港口',
    'Can smuggle max':'每次最多可走私',
    'Clean Money':'乾淨的錢',
    'Drugs at a time':'份毒品',
    'Forge Documents':'偽造文件',
    'Fortified Ram':'加固撞角',
    'Gang Pamphlets':'幫派宣傳冊',
    'Launder Money':'洗錢',
    'Lightning Reload':'閃電裝填',
    'Money Shower':'金錢雨',
    'Official Stamps':'官方印章',
    'Pearl Necklaces':'珍珠項鍊',
    'Pill Box':'藥盒',
    'Purchase a business license and start your own Corporation':'購買營業執照並創立自己的公司',
    'Ram':'撞角',
    'Reloading (6 Days Left)':'重新裝填中（剩餘 6 天）',
    'Replica Artwork':'藝術品仿作',
    'Rum Signing Bonus':'朗姆酒簽約獎金',
    'See where your ship is heading and be able to change course':'查看船隻航行方向，並能夠改變航線',
    'Smuggle Drugs':'走私毒品',
    'Smuggling':'走私',
    'Spyglass':'望遠鏡',
    'Tower of Chips':'籌碼塔',
    'You finish replicating a masterpiece...':'你完成了一件傑作的仿製……',
    'You gamble':'你賭上',
    'You smuggle your':'你走私了你的',
    'You take your time to forge emaculate fake documents...':'你花時間偽造毫無瑕疵的假文件……',
    'at the port and set off again, earning you':'在港口，隨後再次啟航，獲得',
    'but manage to win back':'但設法贏回',
    'x1.5 Ram Damage':'撞角傷害 ×1.5',
    'x2 Amount money laundered':'洗錢金額 ×2',
    'x2 Amount you can Gamble':'賭注金額 ×2'
};
assert.equal(Object.keys(batch).length,43);
assert.equal(Object.keys(expected).length,43);
for(const original of Object.keys(batch)){
    assert.equal(translateString(original),expected[original],'待翻譯文字：'+original);
}
assert.equal(lookup('-₵5K'),'-₵5K','純金額不應被當作新詞彙');
const variations={
    '+17 Art EXP from Studying Paintings':'研究畫作獲得的藝術經驗值：+17',
    '-3 Fake Identity from Forging Documents':'偽造文件獲得的假身分：-3',
    '+24 Replica Artworks':'藝術品仿作：+24',
    '17 Replica Artworks':'17 件藝術品仿作',
    '-8 Attack Cooldowns':'攻擊冷卻時間：-8',
    '+10 Ship HP per day while docked at the Safe Haven':'停靠在避風港時，每日船隻生命值 +10',
    'Reloading (1 Day Left)':'重新裝填中（剩餘 1 天）',
    'Regrouping (4 Days Left)':'重新集結中（剩餘 4 天）',
    'x3.5 Ram Damage':'撞角傷害 ×3.5',
    'x4 Amount money laundered':'洗錢金額 ×4',
    'x5 Amount you can Gamble':'賭注金額 ×5',
    'x5 Amount you gamble':'賭注金額 ×5',
    'Can smuggle max 7 Drugs at a time':'每次最多可走私 7 份毒品',
    'You gamble 100 but manage to win back 230':'你賭上 100，但設法贏回 230',
    'You smuggle your 7 Drugs at the port and set off again, earning you $400':'你在港口走私了 7 份毒品，然後再次啟航，獲得 $400',
    'You smuggle your 12 Stolen Goods at the port and set off again, earning you 200 Doubloons':'你在港口走私了 12 件贓物，然後再次啟航，獲得 200 枚杜布隆金幣',
    'Art Gallery:':'美術館：',
    'Finance Lv. 2':'財務專精等級 2',
    '+ Unlocks New Rune':'＋解鎖新符文',
    'Health Packs':'醫療包',
    'Custom Text':'自訂譯文'
};
for(const [original,result] of Object.entries(variations)){
    assert.equal(translateString(original),result,'動態或舊版規則：'+original);
}
function eventTest(originalBefore,number,originalAfter,expectedText,label){
    const root=new Elem();
    text(root,'［第 4 天／第 2 年］： '+originalBefore);
    const strong=element(root,'strong');text(strong,number);
    text(root,originalAfter);
    assert.equal(normalizeCompositeEvent(root),true,label);
    assert.equal(root.textContent,'［第 4 天／第 2 年］： '+expectedText,label);
    assert.equal(strong.textContent,number,'粗體值不可被移動：'+label);
    assert.equal(normalizeCompositeEvent(root),false,'不可重複翻譯：'+label);
}
eventTest('Can smuggle max ','7',' Drugs at a time','每次最多可走私 7 份毒品','走私數量');
eventTest('You smuggle your ','7',' Drugs at the port and set off again, earning you $400','你在港口走私了 7 份毒品，然後再次啟航，獲得 $400','港口走私');
const gamble=new Elem();text(gamble,'You gamble ');
const bet=element(gamble,'strong');text(bet,'100');text(gamble,' but manage to win back ');
const back=element(gamble,'strong');text(back,'230');
assert.equal(normalizeCompositeEvent(gamble),true);
assert.equal(gamble.textContent,'你賭上 100，但設法贏回 230');
assert.equal(bet.textContent,'100');assert.equal(back.textContent,'230');
const blocked=new Elem();text(blocked,'Can smuggle max ');
const button=element(blocked,'button');text(button,'7');
text(blocked,' Drugs at a time');
assert.equal(normalizeCompositeEvent(blocked),false,'互動控制不能變更');

const twoNodes=new Elem();text(twoNodes,'You finish replicating a ');
const span=element(twoNodes,'span');text(span,'masterpiece...');
assert.equal(normalizeSplitFragment(twoNodes),true,'藝術品仿製完成的拆句');
assert.equal(twoNodes.textContent,'你完成了一件傑作的仿製……');
const icon={nodeType:3,nodeValue:'settings',parentElement:new Elem('span',true)};
translateText(icon);assert.equal(icon.nodeValue,'settings');
const label={nodeType:3,nodeValue:'settings',parentElement:new Elem()};
translateText(label);assert.equal(label.nodeValue,'設定');
assert.equal(storage.ur_zh_tw_untranslated['歷史待翻譯紀錄'],'');
console.log('v0.4.2：43 筆文字、'+Object.keys(variations).length+' 組數值變化及舊版回歸、完整句／拆句／粗體、金額和圖示保護通過。');
