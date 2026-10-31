'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI = { lookup, translateString, translateText, normalizeVesselTradeConnector, normalizeSplitFragment };\n})();');
assert.notEqual(instrumented, source, '找不到使用者腳本的結尾');

class ElementMock {
    constructor(tag = 'div', icon = false) {
        this.nodeType = 1;
        this.tagName = tag.toUpperCase();
        this.icon = icon;
        this.childNodes = [];
        this.parentElement = null;
        this.className = '';
    }
    get textContent() {
        return this.childNodes.map(node => node.nodeType === 3 ? node.nodeValue : node.textContent).join('');
    }
    closest(selector) {
        let node = this;
        while (node) {
            if (node.className === 'material-icons' && selector.includes('.material-icons')) return node;
            node = node.parentElement;
        }
        return null;
    }
    querySelector(selector) {
        const names = selector.split(',').map(s => s.trim().toUpperCase()).filter(s => /^[A-Z]+$/.test(s));
        const find = element => {
            for (const node of element.childNodes) {
                if (node.nodeType !== 1) continue;
                if (names.includes(node.tagName)) return node;
                const child = find(node);
                if (child) return child;
            }
            return null;
        };
        return find(this);
    }
}
function el(parent, tag = 'span') {
    const child = new ElementMock(tag);
    child.parentElement = parent;
    parent.childNodes.push(child);
    return child;
}
function txt(parent, value) {
    const node = {nodeType: 3, nodeValue: value, parentElement: parent};
    parent.childNodes.push(node);
    return node;
}

const storage = {
    ur_zh_tw_custom: {'User Custom': '使用者自訂'},
    ur_zh_tw_untranslated: {'以前留下的文字': ''}
};
const sandbox = {
    Element: ElementMock,
    HTMLInputElement: class {},
    Node: {TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9},
    NodeFilter: {SHOW_TEXT: 4, SHOW_ELEMENT: 1},
    document: {
        body: null,
        addEventListener() {},
        createTreeWalker(root, mask) {
            const nodes = [];
            function visit(node) {
                for (const child of node.childNodes) {
                    if (child.nodeType === 3 && (mask & 4)) nodes.push(child);
                    if (child.nodeType === 1) {
                        if (mask & 1) nodes.push(child);
                        visit(child);
                    }
                }
            }
            visit(root);
            let i = 0;
            return {nextNode: () => nodes[i++] || null};
        }
    },
    window: {addEventListener() {}},
    MutationObserver: class {},
    GM_getValue: (key, fallback) => storage[key] ?? fallback,
    GM_setValue: (key, value) => {storage[key] = value;},
    GM_registerMenuCommand() {},
    getComputedStyle: node => ({fontFamily: node.icon ? 'Material Symbols Outlined' : 'Arial'})
};
vm.createContext(sandbox);
vm.runInContext(instrumented, sandbox);
const api = sandbox.testAPI;
const batch = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'batch_v0319.json'), 'utf8'));
assert.equal(Object.keys(batch).length, 45);
for (const phrase of Object.keys(batch)) {
    if (phrase === 'for') {
        assert.equal(api.lookup(phrase), phrase, '孤立的 for 不應被全域誤譯');
        continue;
    }
    const translated = api.translateString(phrase);
    assert.notEqual(translated, phrase, '漏譯：' + phrase);
    assert.equal(typeof translated, 'string');
}
const expected = {
    '+1 Crewmates': '船員：+1',
    '1 Crewmates': '1 名船員',
    '-7.5 Crewmates': '船員：-7.5',
    '+20% Recruit chance': '招募機率：+20%',
    '+42% Recruit chance': '招募機率：+42%',
    '+4 Jewelry Heist Plan Speed': '珠寶店劫案策劃速度：+4',
    '+9 Jewelry Store Heist Plan Speed': '珠寶店劫案策劃速度：+9',
    '+4 Stolen Jewels from Jewelry Store Heist': '珠寶店劫案獲得的贓珠寶：+4',
    '+10 Stolen Jewels from Jewelry Store Heists': '珠寶店劫案獲得的贓珠寶：+10',
    '+5% Chance of finding treasure': '發現寶藏的機率：+5%',
    'Buy x5 Stolen Jewels': '購買 ×5 偷來的珠寶',
    'Sell x10 Stolen Goods': '出售 ×10 贓物',
    'Sell x8 Pistols': '出售 ×8 手槍',
    'Buy x17 Stolen Goods': '購買 ×17 贓物',
    'Reduce Jewelry Store Robbery crime and max crime Penalty by 1': '將珠寶店搶劫的犯罪懲罰及懲罰上限降低 1',
    'Reduce Store Robbery crime and max crime Penalty by 2': '將商店搶劫的犯罪懲罰及懲罰上限降低 2',
    'x1.4 Ship Speed': '船隻速度 ×1.4',
    'x1.5 Doubloons from Navy Ship': '從海軍艦艇獲得的杜布隆金幣 ×1.5',
    'x1.5 Plunder Reward': '掠奪獎勵 ×1.5',
    'x2 Flee chance during Foggy Weather': '霧天的逃跑機率 ×2',
    'x2 Terrorize Reward': '恐嚇獎勵 ×2',
    'x3.25 Terrorize Reward': '恐嚇獎勵 ×3.25',
    'Trading Vessel': '商船',
    '25 Karat Gold': '25K 黃金',
    'Ghost Ship': '幽靈船',
    'You trade with the vessel, selling': '你與商船交易，出售',
    'User Custom': '使用者自訂',
    'Undead Minion': '亡靈僕從',
    'Armed Robbery (8 G.M, 3 Pistols)': '持械搶劫（8 名幫派成員、3 把手槍）'
};
for (const [original, translated] of Object.entries(expected)) {
    assert.equal(api.translateString(original), translated, original);
}

const trade = new ElementMock();
txt(trade, 'You trade with the vessel, selling ');
const item = el(trade, 'strong');
txt(item, '5 Stolen Goods');
const connector = txt(trade, ' for ');
const reward = el(trade, 'strong');
txt(reward, '+30 Doubloons');
assert.equal(api.normalizeVesselTradeConnector(trade), true, '應只在商船交易中翻譯 for');
assert.equal(connector.nodeValue, ' 換取 ');
assert.equal(item.textContent, '5 Stolen Goods', '商品粗體不得消失');
assert.equal(reward.textContent, '+30 Doubloons', '金幣粗體不得消失');
assert.equal(api.normalizeVesselTradeConnector(trade), false, '不應重複修改已翻譯的連接詞');

const chineseTrade = new ElementMock();
txt(chineseTrade, '你與商船交易，出售');
const group = el(chineseTrade, 'strong');
txt(group, '8 Pistols');
const connectorZh = txt(chineseTrade, ' for ');
const paid = el(chineseTrade, 'strong');
txt(paid, '90 Doubloons');
assert.equal(api.normalizeVesselTradeConnector(chineseTrade), true);
assert.equal(connectorZh.nodeValue, ' 換取 ');

const unrelated = new ElementMock();
txt(unrelated, 'This is for ');
const unrelatedConnector = txt(unrelated, 'for');
txt(unrelated, 'other players');
assert.equal(api.normalizeVesselTradeConnector(unrelated), false, '其他情境不可誤翻 for');
assert.equal(unrelatedConnector.nodeValue, 'for');

const unsafe = new ElementMock();
txt(unsafe, 'You trade with the vessel, selling ');
const unsafeConnector = txt(unsafe, ' for ');
const button = el(unsafe, 'button');
txt(button, 'Buy');
assert.equal(api.normalizeVesselTradeConnector(unsafe), false, '包含互動元件時應保持原狀');
assert.equal(unsafeConnector.nodeValue, ' for ');

const icon = new ElementMock('span', true);
const iconText = txt(icon, 'settings');
api.translateText(iconText);
assert.equal(iconText.nodeValue, 'settings');
const normal = new ElementMock();
const label = txt(normal, 'settings');
api.translateText(label);
assert.equal(label.nodeValue, '設定');
assert.equal(storage.ur_zh_tw_untranslated['以前留下的文字'], '');

console.log('v0.3.19：45 筆輸入、' + Object.keys(expected).length + ' 組翻譯案例，以及交易拆句、粗體、圖示與保存回歸測試通過。');
