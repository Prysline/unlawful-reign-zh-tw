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
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0421.json'),'utf8'));
const originals=Object.keys(batch.translations);
assert.equal(originals.length,17,'來源詞條數量');
assert.equal(batch.contexts.length,96,'來源上下文數量');
assert.equal(batch.contexts.filter(x=>x.complete).length,1,'僅一筆確認為完整事件');
for (const original of originals) {
    assert.notEqual(lookup(original),null,'來源詞條沒有翻譯：'+original);
}
const exact={
    '/ 2 Harpoons':'/ 2 魚叉',
    'Buy x1 Replica Artwork':'購買 ×1 件藝術品仿作',
    'Corporate Funded Gang':'公司資助的幫派',
    'Deface Artwork':'污損藝術品',
    'Deface Artwork at the Art Gallery to send a message':'在美術館污損藝術品以傳達訊息',
    'Larger Oars':'更大的船槳',
    'Loses +25% Ritual Duration':'儀式持續時間減少 +25%',
    'Plants +1 Drugs':'種植 +1 份毒品',
    'Plants +2 Drugs':'種植 +2 份毒品',
    'Plants +3 Drugs':'種植 +3 份毒品',
    'Plants +4 Drugs':'種植 +4 份毒品',
    'Plants +5 Drugs':'種植 +5 份毒品',
    'Plants +6 Drugs':'種植 +6 份毒品',
    'Saves 1 Souls per day':'每天節省 1 個靈魂',
    'Sow Max':'播種至上限',
    'Unable to plant more seeds':'無法再播下更多種子',
    'You leave your calling card at the scene of the crime...':'你在犯罪現場留下自己的名片……'
};
assert.equal(Object.keys(exact).length,17);
for(const [source,want] of Object.entries(exact)) {
    assert.equal(translateString(source),want,'來源翻譯：'+source);
}
const variation={
    '/ 20 Harpoons':'/ 20 魚叉',
    'Buy x3 Replica Artworks':'購買 ×3 件藝術品仿作',
    'Loses +10.5% Ritual Duration':'儀式持續時間減少 +10.5%',
    'Plants +20 Drugs':'種植 +20 份毒品',
    'Plants -2 Drugs':'種植 -2 份毒品',
    'Saves 5 Souls per day':'每天節省 5 個靈魂',
    'Saves 1 Soul per day':'每天節省 1 個靈魂',
    'You leave your calling card at the scene of the crime... +4.1K Not.':'你在犯罪現場留下自己的名片…… +4.1K 惡名',
    'You leave your calling card at the scene of the crime... +950 Not.':'你在犯罪現場留下自己的名片…… +950 惡名'
};
for(const [source,want] of Object.entries(variation)) {
    assert.equal(translateString(source),want,'可變數值：'+source);
}
// 來源明確記錄正號、數值及惡名縮寫位於不同文字節點。
const event=batch.contexts.find(c=>c.fullText.startsWith('You leave your calling card'));
assert.ok(event,'找不到本批完整事件');
assert.equal(event.complete,true,'原始標記必須保持完整');
assert.equal(event.datePrefix,'[D59 Y28]:');
assert.equal(event.fragments.length,4);
assert.equal(event.fragments[2],'+');
function make(parts){
    const root=new Elem();
    for(const item of parts){
        if(typeof item==='string')text(root,item);
        else text(element(root,item.tag),item.value);
    }
    return root;
}
function verify(name,parts,want,boldWant){
    const root=make(parts);
    assert.equal(normalizeCompositeEvent(root),true,'未能跨節點翻譯：'+name);
    assert.equal(root.textContent,want,'跨節點句型輸出不符：'+name);
    if(boldWant){
        const bold=root.querySelector('strong');
        assert.ok(bold,'粗體節點不應消失：'+name);
        assert.equal(bold.textContent,boldWant,'應保留原本的粗體內容：'+name);
    }
    assert.equal(normalizeCompositeEvent(root),false,'不得重複翻譯：'+name);
}
verify('原始節點拆分',
    ['[D59 Y28]: ','You leave your calling card at the scene of the crime... ','+','4.1K Not.'],
    '[D59 Y28]: 你在犯罪現場留下自己的名片…… +4.1K 惡名');
verify('強調數值',
    ['[D59 Y28]: ','You leave your calling card at the scene of the crime... ','+',{tag:'strong',value:'4.1K'},' Not.'],
    '[D59 Y28]: 你在犯罪現場留下自己的名片…… +4.1K 惡名','4.1K');
verify('不同可變數值',
    ['［第 59 天／第 28 年］： ','You leave your calling card at the scene of the crime... ','+', {tag:'strong',value:'950'},' Not.'],
    '［第 59 天／第 28 年］： 你在犯罪現場留下自己的名片…… +950 惡名','950');
const unsafe=make(['[D59 Y28]: ','You leave your calling card at the scene of the crime... ','+',{tag:'button',value:'4.1K Not.'}]);
assert.equal(normalizeCompositeEvent(unsafe),false,'不得修改互動控制');
const sourceContext=batch.contexts.find(c=>c.fullText.includes('Saves 1 Souls per day'));
assert.ok(sourceContext);
assert.equal(sourceContext.complete,false,'不得將介面聚合片段視為完整事件');
assert.equal(storage.ur_zh_tw_untranslated['舊版紀錄'],'','舊版待翻譯記錄不應被清除');
console.log('v0.4.21：17 筆詞條、96 筆上下文、可變種植與儀式、完整惡名事件及跨節點回歸測試通過。');
