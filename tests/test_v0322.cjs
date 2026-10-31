'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,normalizeSplitFragment};\n})();');
assert.notEqual(instrumented, source, '未找到使用者腳本的結尾');

class ElementMock {
    constructor(tag='div', icon=false) {
        this.tagName=tag.toUpperCase();this.nodeType=1;this.icon=icon;
        this.childNodes=[];this.parentElement=null;this.className='';
    }
    get textContent(){return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');}
    closest(){return null;}
    querySelector(selector){
        const tagNames=selector.split(',').map(s=>s.trim().toUpperCase()).filter(s=>/^[A-Z]+$/.test(s));
        const find=root=>{
            for(const n of root.childNodes){
                if(n.nodeType!==1)continue;
                if(tagNames.includes(n.tagName))return n;
                const hit=find(n);if(hit)return hit;
            }
            return null;
        };
        return find(this);
    }
}
function addText(parent,value){
    const n={nodeType:3,nodeValue:value,parentElement:parent};
    parent.childNodes.push(n);return n;
}
function addElement(parent,tag='span'){
    const n=new ElementMock(tag);n.parentElement=parent;parent.childNodes.push(n);return n;
}
const storage={
    ur_zh_tw_custom:{'Custom Term':'自訂翻譯'},
    ur_zh_tw_untranslated:{'舊紀錄':''}
};
const sandbox={
    Element:ElementMock,HTMLInputElement:class {},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
    NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    MutationObserver:class {},
    document:{body:null,addEventListener(){},
        createTreeWalker(root,mask){
            const nodes=[];
            const visit=e=>{
                for(const child of e.childNodes){
                    if(child.nodeType===3&&(mask&4))nodes.push(child);
                    if(child.nodeType===1){if(mask&1)nodes.push(child);visit(child);}
                }
            };
            visit(root);let i=0;return {nextNode:()=>nodes[i++]||null};
        }
    },
    window:{addEventListener(){}},
    GM_getValue:(key,fallback)=>storage[key]??fallback,
    GM_setValue:(key,value)=>{storage[key]=value;},
    GM_registerMenuCommand(){},
    getComputedStyle:e=>({fontFamily:e.icon?'Material Symbols Outlined':'Arial'})
};
vm.createContext(sandbox);
vm.runInContext(instrumented,sandbox);
const {lookup,translateString,translateText,normalizeSplitFragment}=sandbox.testAPI;
const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0322.json'),'utf8'));
assert.equal(Object.keys(batch).length,71);
for(const input of Object.keys(batch)){
    const output=translateString(input);
    assert.notEqual(output,input,'未翻譯：'+input);
    assert.equal(typeof output,'string');
}

const cases={
    '+ ??? (Unlocked at Lvl. 3)':'＋???（等級 3 解鎖）',
    '+ Pickpocket boosted by +5% (+5% Per Lvl)':'＋扒竊加成 +5%（每級 +5%）',
    '+1 EXP':'經驗值：+1',
    '+3 EXP':'經驗值：+3',
    '+17.50 Ship HP':'船隻生命值：+17.50',
    '+5 Cannonballs':'砲彈：+5',
    '-1 Cannonballs':'砲彈：-1',
    '+5 Max Cannonballs':'砲彈上限：+5',
    '+5 Progress Replicating Artwork':'藝術品仿製進度：+5',
    '+5% Success chance gambling':'賭博獲勝機率：+5%',
    '-1.2K Doubloons':'杜布隆金幣：-1.2K',
    '/ 5 Cannonballs':'／5 發砲彈',
    '17.50 HP to your ship':'船隻的 17.50 點生命值',
    '4/5 Cannonballs left':'剩餘砲彈：4/5',
    '5 Progress':'進度：5',
    'Buy 1':'購買 1',
    'Buy Max':'購買最大數量',
    'Cannons have a 10% chance of x2 Damage':'大砲有 10% 機率造成 2 倍傷害',
    'Deal 25 DMG':'造成 25 點傷害',
    'Replicate Artwork (10/100)':'仿製藝術品（10/100）',
    'Takes 4 days to regroup':'重新集結需要 4 天',
    'Takes 6 days to reload':'重新裝填需要 6 天',
    'x1.2 Stealth EXP':'潛行經驗值 ×1.2',
    'x1.5 Doubloons from Treasure':'從寶藏獲得的杜布隆金幣 ×1.5',
    'x2 Store Robbery Money reward':'商店搶劫金錢獎勵 ×2',
    '+9 EXP':'經驗值：+9',
    '+41 Ship HP':'船隻生命值：+41',
    '-9 Cannonballs':'砲彈：-9',
    '+12 Max Cannonballs':'砲彈上限：+12',
    '/ 18 Cannonballs':'／18 發砲彈',
    '3/18 Cannonballs left':'剩餘砲彈：3/18',
    'Buy 23':'購買 23',
    'Deal 119 DMG':'造成 119 點傷害',
    'Replicate Artwork (73/125)':'仿製藝術品（73/125）',
    'Takes 17 days to reload':'重新裝填需要 17 天',
    '-4.7M Doubloons':'杜布隆金幣：-4.7M',
    '+15% Chance of success when gambling':'賭博獲勝機率：+15%',
    '+ Unlocks New Rune':'＋解鎖新符文',
    'Armed Robbery (8 G.M, 3 Pistols)':'持械搶劫（8 名幫派成員、3 把手槍）',
    'Undead Minion':'亡靈僕從',
    'Custom Term':'自訂翻譯'
};
for(const [input,expected] of Object.entries(cases)){
    assert.equal(translateString(input),expected,input);
}

// 原句可能在 re 與 board 中間被切成文字節點，需完整辨識而非逐個數值硬寫。
const composite=new ElementMock();
addText(composite,'Your crew regroups and reloads, ready to re');
const continuation=addElement(composite);
addText(continuation,'board the enemy ship!');
assert.equal(normalizeSplitFragment(composite),true);
assert.equal(composite.textContent,'你的船員重新集結並裝填彈藥，準備再次登上敵船！');
// 已翻譯句子不應被再次修改。
assert.equal(normalizeSplitFragment(composite),false);
const protectedParent=new ElementMock();
addText(protectedParent,'Your crew regroups and reloads, ready to re');
const strong=addElement(protectedParent,'strong');
addText(strong,'board the enemy ship!');
assert.equal(normalizeSplitFragment(protectedParent),false,'含粗體的事件不得合併文字節點');
assert.equal(strong.textContent,'board the enemy ship!');
const isolated=new ElementMock();
addText(isolated,'You spend');
addText(isolated,' 25 Doubloons to repair');
assert.equal(normalizeSplitFragment(isolated),false,'未知數值組合不可擅自重組');

const iconNode={nodeType:3,nodeValue:'settings',parentElement:new ElementMock('span',true)};
translateText(iconNode);
assert.equal(iconNode.nodeValue,'settings');
const labelNode={nodeType:3,nodeValue:'settings',parentElement:new ElementMock()};
translateText(labelNode);
assert.equal(labelNode.nodeValue,'設定');
assert.equal(lookup('for'),'for','商船交易的 for 仍應僅限上下文處理');
assert.equal(storage.ur_zh_tw_untranslated['舊紀錄'],'');
console.log('v0.3.22：71 筆原文、'+Object.keys(cases).length+' 組規則案例、拆句與歷史功能回歸測試通過。');
