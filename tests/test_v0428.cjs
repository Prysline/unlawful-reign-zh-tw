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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0428.json'),'utf8'));
const originals=Object.keys(batch.translations);
assert.equal(originals.length,27,'原始詞條數');
assert.equal(batch.contexts.length,174,'原始上下文數');
const complete=batch.contexts.filter(c=>c.complete);
assert.equal(complete.length,1,'原始檔僅一則完整事件');
assert.equal(complete[0].fullText,'Your cartel sells 1 Drugs, earning you +$812.15!','完整交易事件');
assert.equal(complete[0].datePrefix,'[D79 Y38]:','完整交易事件日期');
const expected={
    '+ Gang War damage boosted by +20% (+4% Per Lvl)':'＋幫派戰爭傷害提高 +20%（每級 +4%）',
    '+0.5% Global Money Reward for every 1000 Notoriety (Max +100%)':'每 1000 點惡名的全域金錢獎勵：+0.5%（最高 +100%）',
    '+1 Artistry EXP from Graffiti':'塗鴉獲得的藝術經驗值：+1',
    '+1 Brutality EXP from Casino Robbery':'賭場搶劫獲得的蠻力經驗值：+1',
    '+1 Finance EXP from Gambling':'賭博獲得的財務經驗值：+1',
    '+1 Stealth EXP from Shoplifting':'商店行竊獲得的潛行經驗值：+1',
    '+100% Notoriety Rewards':'惡名獎勵：+100%',
    ', earning you':'，讓你賺得',
    '1 Cartel Member':'1 名販毒集團成員',
    '30 Gang Members but gaining':'30 名幫派成員，但獲得',
    'Betting Savant':'投注奇才',
    'Clean your dirty money - literally!':'清洗你的髒錢，字面意義上的清洗！',
    'Converts 1% of your Dirty Money':'轉換你 1% 的髒錢',
    'Dirty Sales':'骯髒銷售',
    'Drugs Inventory full!':'毒品庫存已滿！',
    'Experienced Villain':'老練惡棍',
    'Graffiti Scholar':'塗鴉學者',
    'Muscle Memory':'肌肉記憶',
    'Spectral Walker':'幽靈行者',
    'Wash Clothes':'洗衣服',
    'Wash Money':'洗錢',
    'You put your Gang through grueling challenges, losing':'你讓幫派接受嚴苛的挑戰，失去',
    'You toss':'你將',
    'You wash a load of clothes for a customer and get paid':'你替顧客洗了一批衣服，並獲得報酬',
    'Your cartel sells':'你的販毒集團出售',
    'into the washer and pull out':'丟進洗衣機，然後取出',
    '每級古物獲得的惡名：+3.7K':'每級古物獲得的惡名：+3.7K'
};
assert.equal(Object.keys(expected).length,27);
for(const source of originals){
    assert.ok(Object.prototype.hasOwnProperty.call(expected,source),'測試缺少來源：'+source);
    assert.notEqual(lookup(source),null,'規則缺少來源：'+source);
    assert.equal(translateString(source),expected[source],'逐項翻譯：'+source);
    assert.equal(/原文異常|無法確認/.test(translateString(source)),false,'玩家不應看到譯者註記：'+source);
}
const variants={
    '+ Gang War damage boosted by +35% (+7% Per Lvl)':'＋幫派戰爭傷害提高 +35%（每級 +7%）',
    '+1.25% Global Money Reward for every 1500 Notoriety (Max +75%)':'每 1500 點惡名的全域金錢獎勵：+1.25%（最高 +75%）',
    '+3 Artistry EXP from Graffiti':'塗鴉獲得的藝術經驗值：+3',
    '+2 Brutality EXP from Casino Robbery':'賭場搶劫獲得的蠻力經驗值：+2',
    '+5 Finance EXP from Gambling':'賭博獲得的財務經驗值：+5',
    '+4 Stealth EXP from Shoplifting':'商店行竊獲得的潛行經驗值：+4',
    '+50% Notoriety Rewards':'惡名獎勵：+50%',
    '12 Cartel Members':'12 名販毒集團成員',
    '45 Gang Members but gaining':'45 名幫派成員，但獲得',
    'Converts 5% of your Dirty Money':'轉換你 5% 的髒錢',
    'You put your Gang through grueling challenges, losing -45 Gang Members but gaining +2 Cartel Members':'你讓幫派接受嚴苛的挑戰，失去 -45 名幫派成員，但獲得 +2 名販毒集團成員',
    'You toss -$1.5K into the washer and pull out +₵1.5K':'你將 -$1.5K 丟進洗衣機，然後取出 +₵1.5K',
    'You wash a load of clothes for a customer and get paid +₵500':'你替顧客洗了一批衣服，並獲得報酬 +₵500',
    'Your cartel sells 5 Drugs, earning you +$3.25K!':'你的販毒集團出售 5 份毒品，讓你賺得 +$3.25K！'
};
for(const [source,want] of Object.entries(variants)){
    assert.equal(translateString(source),want,'不同數值：'+source);
}
for(const source of ['每級古物獲得的惡名：+3.7K','每級古物獲得的惡名：+5M']){
    assert.equal(context.testAPI.isUntranslatedSource(source),false,'已中文化的惡名數值不應重複收集：'+source);
}
const dated={
    'You put your Gang through grueling challenges, losing -30 Gang Members but gaining +1 Cartel Member':'[D78 Y38]:',
    'You toss -$729.06 into the washer and pull out +₵729.06':'[D52 Y39]:',
    'You wash a load of clothes for a customer and get paid +₵250':'[D64 Y39]:',
    'Your cartel sells 1 Drugs, earning you +$812.15!':'[D79 Y38]:'
};
for(const [source,date] of Object.entries(dated)){
    const entry=batch.contexts.find(c=>c.fullText===source);
    assert.ok(entry,'遺漏來源事件：'+source);
    assert.equal(entry.datePrefix,date,'日期與來源不符：'+source);
    assert.equal(entry.complete,source.startsWith('Your cartel sells'),'保留原始完整標記：'+source);
}
function make(parts){
    const root=new Elem();
    for(const item of parts){
        if(typeof item==='string')text(root,item);
        else text(element(root,item.tag),item.value);
    }
    return root;
}
function verify(name,parts,want,strongWant){
    const root=make(parts);
    assert.equal(normalizeCompositeEvent(root),true,'跨節點事件未辨識：'+name);
    assert.equal(root.textContent,want,'跨節點翻譯錯誤：'+name);
    if(strongWant){
        const strong=root.querySelector('strong');
        assert.ok(strong,'原有粗體需保留：'+name);
        assert.equal(strong.textContent,strongWant,'粗體數值不可改動：'+name);
    }
    assert.equal(normalizeCompositeEvent(root),false,'不可二次翻譯：'+name);
}
verify('幫派成員轉換',
    ['[D78 Y38]: ','You put your Gang through grueling challenges, losing ','-','30 Gang Members but gaining ','+','1 Cartel Member'],
    '[D78 Y38]: 你讓幫派接受嚴苛的挑戰，失去 -30 名幫派成員，但獲得 +1 名販毒集團成員');
verify('幫派成員轉換粗體',
    ['[D78 Y38]: ','You put your Gang through grueling challenges, losing ','-',{tag:'strong',value:'30'},' Gang Members but gaining ','+','1 Cartel Member'],
    '[D78 Y38]: 你讓幫派接受嚴苛的挑戰，失去 -30 名幫派成員，但獲得 +1 名販毒集團成員','30');
verify('洗衣機洗錢',
    ['[D52 Y39]: ','You toss ','-','$729.06',' into the washer and pull out ','+','₵729.06'],
    '[D52 Y39]: 你將 -$729.06 丟進洗衣機，然後取出 +₵729.06');
verify('洗衣機洗錢粗體',
    ['[D52 Y39]: ','You toss ','-',{tag:'strong',value:'$729.06'},' into the washer and pull out ','+','₵729.06'],
    '[D52 Y39]: 你將 -$729.06 丟進洗衣機，然後取出 +₵729.06','$729.06');
verify('洗衣服務收入',
    ['[D64 Y39]: ','You wash a load of clothes for a customer and get paid ','+','₵250'],
    '[D64 Y39]: 你替顧客洗了一批衣服，並獲得報酬 +₵250');
verify('洗衣服務收入粗體',
    ['[D64 Y39]: ','You wash a load of clothes for a customer and get paid ','+',{tag:'strong',value:'₵250'}],
    '[D64 Y39]: 你替顧客洗了一批衣服，並獲得報酬 +₵250','₵250');
verify('販毒集團交易完整事件',
    ['[D79 Y38]: ','Your cartel sells ','1 Drugs',', earning you ','+','$812.15','!'],
    '[D79 Y38]: 你的販毒集團出售 1 份毒品，讓你賺得 +$812.15！');
verify('販毒集團交易粗體',
    ['[D79 Y38]: ','Your cartel sells ','1 Drugs',', earning you ','+',{tag:'strong',value:'$812.15'},'!'],
    '[D79 Y38]: 你的販毒集團出售 1 份毒品，讓你賺得 +$812.15！','$812.15');
const unsafe=make(['[D79 Y38]: ','Your cartel sells ','1 Drugs',', earning you ','+',{tag:'button',value:'$812.15'},'!']);
assert.equal(normalizeCompositeEvent(unsafe),false,'互動控制不可更改');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','既有待翻譯紀錄需保留');
console.log('v0.4.28：27 筆詞條、174 筆上下文、1 筆完整事件、洗衣店與販毒集團四種跨節點事件測試通過。');
