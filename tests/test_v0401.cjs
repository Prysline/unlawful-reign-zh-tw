'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI={lookup,translateString,translateText,normalizeCompositeEvent,normalizeSplitFragment};\n})();');
assert.notEqual(instrumented, source, '找不到使用者腳本結尾');

class ElementMock {
    constructor(tag='div', icon=false) {
        this.nodeType=1; this.tagName=tag.toUpperCase(); this.icon=icon;
        this.childNodes=[]; this.parentElement=null; this.className='';
    }
    get textContent() {
        return this.childNodes.map(n=>n.nodeType===3?n.nodeValue:n.textContent).join('');
    }
    closest() {return null;}
    querySelector(selector) {
        const names=selector.split(',').map(x=>x.trim().toUpperCase()).filter(x=>/^[A-Z]+$/.test(x));
        const visit=element=>{
            for(const node of element.childNodes) {
                if(node.nodeType!==1) continue;
                if(names.includes(node.tagName)) return node;
                const found=visit(node);
                if(found) return found;
            }
            return null;
        };
        return visit(this);
    }
}
function text(parent,value) {
    const node={nodeType:3,nodeValue:value,parentElement:parent};
    parent.childNodes.push(node);
    return node;
}
function element(parent,tag='span') {
    const node=new ElementMock(tag);
    node.parentElement=parent;
    parent.childNodes.push(node);
    return node;
}
const store={
    ur_zh_tw_custom:{'Custom Term':'自訂名稱'},
    ur_zh_tw_untranslated:{'前版待翻譯紀錄':''}
};
const sandbox={
    Element:ElementMock,HTMLInputElement:class {},
    Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},
    NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    MutationObserver:class {},
    document:{body:null,addEventListener(){},
        createTreeWalker(root,mask) {
            const found=[];
            const visit=parent=>{
                for(const node of parent.childNodes) {
                    if(node.nodeType===3 && (mask & 4)) found.push(node);
                    if(node.nodeType===1) {
                        if(mask & 1) found.push(node);
                        visit(node);
                    }
                }
            };
            visit(root);
            let i=0;
            return {nextNode:()=>found[i++]||null};
        }
    },
    window:{addEventListener(){}},
    GM_getValue:(key,fallback)=>store[key]??fallback,
    GM_setValue:(key,value)=>{store[key]=value;},
    GM_registerMenuCommand(){},
    getComputedStyle:node=>({fontFamily:node.icon?'Material Symbols Outlined':'Arial'})
};
vm.createContext(sandbox);
vm.runInContext(instrumented,sandbox);
const {lookup,translateString,translateText,normalizeCompositeEvent,normalizeSplitFragment}=sandbox.testAPI;

const batch=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','batch_v0401.json'),'utf8'));
const expected={
    '+ ??? (Unlocked at 1 Followers)':'＋???（達到 1 名追隨者時解鎖）',
    '+ ??? (Unlocked at 10 Followers)':'＋???（達到 10 名追隨者時解鎖）',
    '+ Replicate Artwork Speed +3 (+1 Per Lvl)':'＋藝術品仿製速度 +3（每級 +1）',
    '+1 Cult Follower':'邪教追隨者：+1',
    '+1 Followers':'追隨者：+1',
    '+1% Souls from Sacrifices':'獻祭獲得的靈魂：+1%',
    'Follower Buffs':'追隨者增益效果',
    'Followers':'追隨者',
    'Gang Members provide passive notoriety':'幫派成員被動提供惡名',
    'Gang Signs':'幫派標誌',
    "Guru's Gaze":'導師的凝視',
    'Heathen Seduction':'異教徒誘惑',
    'Indoctrinate Shady Strangers into your Cult':'向可疑的陌生人灌輸教義，使他們加入你的邪教',
    'Jeweled Key':'鑲寶石的鑰匙',
    'Jewelry Chest':'珠寶箱',
    'Next Milestone at':'下一個里程碑在',
    'Respectably Notorious':'頗有惡名',
    'The power of':'……的力量',
    'You stage a vial display of what you and your crew are capable of...':'你上演了一場「vial（小瓶）」展示，展現你與船員的能耐……（原文異常）',
    'seduces a new Follower to join your cult!':'誘惑一名新追隨者加入你的邪教！'
};
assert.equal(Object.keys(batch).length,20);
assert.equal(Object.keys(expected).length,20);
for(const key of Object.keys(batch)) {
    assert.equal(translateString(key),expected[key],key);
}
const variants={
    '+ ??? (Unlocked at 50 Follower)':'＋???（達到 50 名追隨者時解鎖）',
    '+ Replicate Artwork Speed -1.5 (+2.5 Per Lvl)':'＋藝術品仿製速度 -1.5（每級 +2.5）',
    '-10 Cult Followers':'邪教追隨者：-10',
    '+25 Followers':'追隨者：+25',
    '+4.5% Souls from Sacrifices':'獻祭獲得的靈魂：+4.5%',
    "The power of Guru's Gaze seduces a new Follower to join your cult!":'「導師的凝視」的力量吸引了一名新追隨者加入你的邪教！',
    'The power of Gang Signs seduces a new Follower to join your cult!':'「幫派標誌」的力量吸引了一名新追隨者加入你的邪教！',
    'Follower':'追隨者',
    'Cult Follower':'邪教追隨者',
    '+ Unlocks Followers':'＋解鎖追隨者',
    '+ Unlocks New Rune':'＋解鎖新符文',
    'Finance Lv. 2':'財務專精等級 2',
    'Art Gallery:':'美術館：',
    'You load 3 Cannonballs onto your ship for 40 Doubloons':'你裝載 3 發砲彈到你的船上，花費 40 枚杜布隆金幣',
    'Custom Term':'自訂名稱'
};
for(const [original,translation] of Object.entries(variants)) {
    assert.equal(translateString(original),translation,original);
}
// 保留時間、粗體能力名稱，完整句與拆分文字節點應生成相同中文。
const root=new ElementMock();
text(root,'［第 10 天／第 1 年］： The power of ');
const strong=element(root,'strong');text(strong,"Guru's Gaze");
text(root,' seduces a new Follower to join your cult!');
assert.equal(normalizeCompositeEvent(root),true);
assert.equal(root.textContent,'［第 10 天／第 1 年］： 「導師的凝視」的力量吸引了一名新追隨者加入你的邪教！');
assert.equal(strong.textContent,'導師的凝視');
assert.equal(normalizeCompositeEvent(root),false,'已翻譯事件不可重複修改');

const partial=new ElementMock();text(partial,'The power ');
const fragment=element(partial);text(fragment,"of Guru's Gaze seduces a new Follower to join your cult!");
assert.equal(normalizeCompositeEvent(partial),true);
assert.equal(partial.textContent,'「導師的凝視」的力量吸引了一名新追隨者加入你的邪教！');

const unsafe=new ElementMock();text(unsafe,'The power of ');
const button=element(unsafe,'button');text(button,"Guru's Gaze");
text(unsafe,' seduces a new Follower to join your cult!');
assert.equal(normalizeCompositeEvent(unsafe),false,'不得跨互動控制修改');

const anomaly=new ElementMock();
text(anomaly,'You stage a vial display of what you and your crew ');
const suffix=element(anomaly);text(suffix,'are capable of...');
assert.equal(normalizeSplitFragment(anomaly),true);
assert.equal(anomaly.textContent,expected['You stage a vial display of what you and your crew are capable of...']);

const icon={nodeType:3,nodeValue:'settings',parentElement:new ElementMock('span',true)};
translateText(icon);
assert.equal(icon.nodeValue,'settings');
const normal={nodeType:3,nodeValue:'settings',parentElement:new ElementMock()};
translateText(normal);
assert.equal(normal.nodeValue,'設定');
assert.equal(store.ur_zh_tw_untranslated['前版待翻譯紀錄'],'');
assert.equal(lookup('Followers'),'追隨者');
console.log('v0.4.1：20 筆文字、'+Object.keys(variants).length+' 組動態與舊版規則、完整句與粗體拆句、異常原文、圖示和儲存回歸測試通過。');
