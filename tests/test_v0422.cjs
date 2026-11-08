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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0422.json'),'utf8'));
const originals=Object.keys(batch.translations);
assert.equal(originals.length,30,'來源詞條數量');
assert.equal(batch.contexts.length,113,'來源上下文數量');
assert.ok(batch.contexts.every(c=>c.complete===false),'原始上下文沒有確認完整的事件');
for(const original of originals){
    assert.notEqual(lookup(original),null,'來源詞條沒有規則：'+original);
}
const expected={
    '(Tethered x2!)':'（牽制 ×2！）',
    '+15% Chance pickpocket stolen jewels':'扒竊取得偷來的珠寶的機率：+15%',
    '+2 Next Create Replica Progress':'下次製作藝術品仿作的進度：+2',
    '+5 Decipher map speed':'地圖解讀速度：+5',
    '+5% when you gamble and win than lose':'賭博時獲勝而非落敗：+5%',
    '1 Harpoons onto your ship for':'1 支魚叉到你的船上，花費',
    '1/2 Harpoons left':'剩餘魚叉：1/2',
    '2/2 Harpoons left':'剩餘魚叉：2/2',
    '4.1K 惡名':'4.1K 惡名',
    '4.5K 惡名':'4.5K 惡名',
    'Alloy Nails':'合金釘',
    'Bracelet Charms':'手鍊吊飾',
    'Campaign Complete':'戰役完成',
    'Chaos Canvas':'混亂畫布',
    'Deal 158 DMG (Tethered)':'造成 158 點傷害（牽制）',
    'Deal 80 DMG (Tethered)':'造成 80 點傷害（牽制）',
    'Fire Harpoon':'發射魚叉',
    'Gem Hungry':'渴求寶石',
    'Next attack deals x2 DMG':'下一次攻擊的傷害 ×2',
    'No rivals remaining':'沒有剩餘的對手',
    'Novice Cartographer':'新手製圖師',
    'Professor of Archaeology':'考古學教授',
    'Provoke your minions at the Cemetery':'在墓園挑釁你的僕從',
    'Restless Rest':'不安的安息',
    'Shady Employees':'可疑員工',
    'Silent Shoes':'無聲鞋',
    'Tethered':'已牽制',
    'Your crew has taken every district it can reach.':'你的船員已奪下所有能夠抵達的地區。',
    'Your harpoon bites into the Navy Ship and the line pulls taut, leaving it open to your next attack':'你的魚叉刺入海軍艦艇，繩索隨即繃緊，使它在你的下一次攻擊面前暴露破綻',
    'x2 Gang Passive Income':'幫派被動收入 ×2'
};
assert.equal(Object.keys(expected).length,30);
for(const [original,want] of Object.entries(expected)){
    assert.equal(translateString(original),want,'本批翻譯：'+original);
}
for(const word of ['4.1K 惡名','4.5K 惡名','150 惡名','+3.4M 惡名']){
    assert.equal(context.testAPI.isUntranslatedSource(word),false,'中文惡名不再誤收集：'+word);
}
const variants={
    '(Tethered x3!)':'（牽制 ×3！）',
    '+20.5% Chance pickpocket stolen jewels':'扒竊取得偷來的珠寶的機率：+20.5%',
    '+8 Next Create Replica Progress':'下次製作藝術品仿作的進度：+8',
    '-2 Decipher map speed':'地圖解讀速度：-2',
    '+8% when you gamble and win than lose':'賭博時獲勝而非落敗：+8%',
    '5 Harpoons onto your ship for':'5 支魚叉到你的船上，花費',
    '3/5 Harpoons left':'剩餘魚叉：3/5',
    'Deal 225 DMG (Tethered)':'造成 225 點傷害（牽制）',
    'Next attack deals x3 DMG':'下一次攻擊的傷害 ×3',
    'x5 Gang Passive Income':'幫派被動收入 ×5',
    'You load +1 Harpoons onto your ship for -50 Doubloons':'你裝載 +1 支魚叉到船上，花費 -50 枚杜布隆金幣',
    'You load +3 Harpoons onto your ship for -100 Doubloons':'你裝載 +3 支魚叉到船上，花費 -100 枚杜布隆金幣',
    'Your crew swings on board the Navy Ship, dealing +158 DMG (Tethered x2!)':'你的船員盪上海軍艦艇，造成 +158 點傷害（牽制 ×2！）',
    'Your crew swings on board the Navy Ship, dealing +80 DMG (Tethered x3!)':'你的船員盪上海軍艦艇，造成 +80 點傷害（牽制 ×3！）'
};
for(const [original,want] of Object.entries(variants)){
    assert.equal(translateString(original),want,'數值變體：'+original);
}
const load=batch.contexts.find(c=>c.fullText==='You load +1 Harpoons onto your ship for -50 Doubloons');
const attack=batch.contexts.find(c=>c.fullText==='Your crew swings on board the Navy Ship, dealing +158 DMG (Tethered x2!)');
const harpoon=batch.contexts.find(c=>c.fullText.startsWith('Your harpoon bites into the Navy Ship'));
assert.ok(load && attack && harpoon,'原始航海戰鬥上下文不可缺少');
assert.equal(load.datePrefix,'[D72 Y29]:');
assert.equal(attack.datePrefix,'[D72 Y29]:');
assert.equal(load.complete,false,'魚叉裝載原始片段並未確認完整');
assert.equal(attack.complete,false,'登艦攻擊原始片段並未確認完整');
assert.equal(load.fragments.length,6);
assert.equal(attack.fragments.length,5);
function make(parts){
    const root=new Elem();
    for(const part of parts){
        if(typeof part==='string')text(root,part);
        else text(element(root,part.tag),part.value);
    }
    return root;
}
function verify(name,parts,want,strongWant){
    const root=make(parts);
    assert.equal(normalizeCompositeEvent(root),true,'無法辨識跨節點事件：'+name);
    assert.equal(root.textContent,want,'跨節點譯文不符：'+name);
    if(strongWant){
        const strong=root.querySelector('strong');
        assert.ok(strong,'粗體節點不應消失');
        assert.equal(strong.textContent,strongWant,'粗體數值應保留');
    }
    assert.equal(normalizeCompositeEvent(root),false,'同一句不能重複翻譯');
}
verify('原始魚叉裝載',[
    '[D72 Y29]: ','You load ','+','1 Harpoons onto your ship for ','-','50 Doubloons'
],'[D72 Y29]: 你裝載 +1 支魚叉到船上，花費 -50 枚杜布隆金幣');
verify('數值有強調的魚叉裝載',[
    '[D72 Y29]: ','You load ','+',{tag:'strong',value:'1'},' Harpoons onto your ship for ','-', '50 Doubloons'
],'[D72 Y29]: 你裝載 +1 支魚叉到船上，花費 -50 枚杜布隆金幣','1');
verify('原始登艦牽制攻擊',[
    '[D72 Y29]: ','Your crew swings on board the Navy Ship, dealing ','+','158 DMG',' (Tethered x2!)'
],'[D72 Y29]: 你的船員盪上海軍艦艇，造成 +158 點傷害（牽制 ×2！）');
verify('分離的傷害數值節點',[
    '[D72 Y29]: ','Your crew swings on board the Navy Ship, dealing ','+',
    {tag:'strong',value:'158'},' DMG',' (Tethered x2!)'
],'[D72 Y29]: 你的船員盪上海軍艦艇，造成 +158 點傷害（牽制 ×2！）','158');
const unsafe=make([
    '[D72 Y29]: ','Your crew swings on board the Navy Ship, dealing ','+',
    {tag:'button',value:'158 DMG'},' (Tethered x2!)'
]);
assert.equal(normalizeCompositeEvent(unsafe),false,'互動控制不得被修改');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','既有未翻譯紀錄需保留');
console.log('v0.4.22：30 筆來源、113 筆上下文、海軍魚叉牽制、數值變化與跨節點事件回歸測試通過。');
