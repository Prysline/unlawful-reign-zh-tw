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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0420.json'),'utf8'));
const source=Object.keys(batch.translations);
assert.equal(source.length,41,'本批詞條數量');
assert.equal(batch.contexts.length,93,'本批上下文數量');
assert.ok(batch.contexts.every(x=>x.complete===false),'保留未確認完整的標籤');
for(const original of source)assert.notEqual(lookup(original),null,'未處理的來源詞條：'+original);
const examples={
    '+2 Harpoons':'魚叉：+2',
    '+2 Max Harpoons':'魚叉上限：+2',
    '25% chance of -25 Ship HP':'25% 機率使船隻生命值減少 25 點',
    "Be able to grow Narcotics. Doesn't like to grow next to other plants":'能夠種植麻醉品。不喜歡在其他植物旁生長',
    'Criminal Intuition':'犯罪直覺',
    'Drunkard Traders':'酒鬼商人',
    'Failing heists retains 15% of the progress':'劫案失敗時保留 15% 的進度',
    'Flower Garden':'花園',
    'Gain EXP from more sources':'從更多來源獲得經驗值',
    'Gain x2 Doubloons when selling to Trading Vessels':'向商船出售物品時獲得 2 倍杜布隆金幣',
    'Harpoon Rack':'魚叉架',
    'Harpoons':'魚叉',
    'Herbicide':'除草劑',
    'Internalized Vision':'內化視野',
    'Jagged timbers tear into your hull as you pull away, dealing':'當你駛離時，尖銳的木材撕裂你的船殼，造成',
    'Leave the wreck to the sea':'把殘骸留給大海',
    'Persistent':'持之以恆',
    'Sail Past':'駛過',
    'Salvage Wreckage':'打撈殘骸',
    'Shadowy Whispers':'暗影低語',
    'Shipwreck':'沉船',
    'Stops Weeds (The bad kind) from growing in your greenhouse':'防止雜草（有害的那種）在你的溫室中生長',
    'Street Tribute':'街頭貢金',
    'Studying Art will boost next replicating art progress by +2':'研習藝術會使下一次藝術品仿製的進度增加 +2',
    'The Patient Torments':'耐心折磨者',
    'The Street Knights':'街頭騎士團',
    'Your crew picks through the wreckage and hauls aboard':'你的船員翻找殘骸，將',
    'Your lookout spots the splintered remains of a shipwreck drifting in the waves':'你的瞭望員發現一艘沉船的破碎殘骸正隨波漂流',
    'x1.25 Notoriety from shady talk when not a criminal':'非罪犯狀態下，可疑交談獲得的惡名 ×1.25',
    '你以「衝鋒槍屠戮」擊中「The Street Knights」，造成':'你以「衝鋒槍屠戮」擊中「街頭騎士團」，造成',
    '你擊敗了「The Street Knights」，並獲得':'你擊敗了「街頭騎士團」，並獲得'
};
for(const [original,want] of Object.entries(examples))assert.equal(translateString(original),want,'新增翻譯：'+original);
const variations={
    '+7 Harpoons':'魚叉：+7',
    '+10 Max Harpoons':'魚叉上限：+10',
    '40% chance of -50 Ship HP':'40% 機率使船隻生命值減少 50 點',
    '10% chance of 12 Ship HP':'10% 機率使船隻生命值增加 12 點',
    'Failing heists retains 35% of the progress':'劫案失敗時保留 35% 的進度',
    'Gain x3 Doubloons when selling to Trading Vessels':'向商船出售物品時獲得 3 倍杜布隆金幣',
    'Studying Art will boost next replicating art progress by +11':'研習藝術會使下一次藝術品仿製的進度增加 +11',
    'x2 Notoriety from shady talk when not a criminal':'非罪犯狀態下，可疑交談獲得的惡名 ×2',
    '你擊敗了「The Patient Torments」，並獲得':'你擊敗了「耐心折磨者」，並獲得',
    '你以「衝鋒槍屠戮」擊中「The Patient Torments」，造成':'你以「衝鋒槍屠戮」擊中「耐心折磨者」，造成'
};
for(const [original,want] of Object.entries(variations))assert.equal(translateString(original),want,'可變數值與名稱：'+original);
function build(parts){
    const root=new Elem();
    for(const part of parts){
        if(typeof part==='string')text(root,part);
        else text(element(root,part.tag),part.value);
    }
    return root;
}
function verify(name,parts,want,strongValue){
    const root=build(parts);
    assert.equal(normalizeCompositeEvent(root),true,'應辨識完整跨節點事件：'+name);
    assert.equal(root.textContent,want,'跨節點譯文不符：'+name);
    if(strongValue){
        const strong=root.querySelector('strong');
        assert.ok(strong,'強調節點不得消失：'+name);
        assert.equal(strong.textContent,strongValue,'強調節點內容不同：'+name);
    }
    assert.equal(normalizeCompositeEvent(root),false,'不可重複翻譯：'+name);
}
verify('木材傷害',[
    '[D14 Y28]: ','Jagged timbers tear into your hull as you pull away, dealing ',
    {tag:'strong',value:'25'},' DMG'
],'[D14 Y28]: 當你駛離時，尖銳的木材撕裂你的船殼，造成 25 點傷害','25');
verify('沉船物資',[
    '[D14 Y28]: ','Your crew picks through the wreckage and hauls aboard ','+',
    {tag:'strong',value:'100'},' Supplies'
],'[D14 Y28]: 你的船員翻找殘骸，將 +100 份補給品搬上船','100');
verify('原檔的木材傷害節點',[
    '[D14 Y28]: ','Jagged timbers tear into your hull as you pull away, dealing ','25 DMG'
],'[D14 Y28]: 當你駛離時，尖銳的木材撕裂你的船殼，造成 25 點傷害');
verify('原檔的物資節點',[
    '[D14 Y28]: ','Your crew picks through the wreckage and hauls aboard ','+','100 Supplies'
],'[D14 Y28]: 你的船員翻找殘骸，將 +100 份補給品搬上船');
const unsafe=build([
    '[D14 Y28]: ','Your crew picks through the wreckage and hauls aboard ','+',
    {tag:'button',value:'100 Supplies'}
]);
assert.equal(normalizeCompositeEvent(unsafe),false,'不得改動互動控制文字');
for(const phrase of [
    'Jagged timbers tear into your hull as you pull away, dealing 25 DMG',
    'Your crew picks through the wreckage and hauls aboard +100 Supplies'
]){
    assert.ok(batch.contexts.some(c=>c.fullText===phrase),'原始上下文需存在：'+phrase);
}
assert.ok(batch.contexts.some(c=>c.fullText==='(7) The Street Knights'));
assert.ok(batch.contexts.some(c=>c.fullText==='(8) The Patient Torments'));
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','不清除先前收集資料');
console.log('v0.4.20：41 筆詞條、93 筆上下文、動態數值、幫派名稱及沉船跨節點事件通過。');
