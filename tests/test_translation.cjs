'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'unlawful_reign_zh_tw.user.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.testAPI = {lookup, translateString, translateText, translateGroupedPurchase, translateGroupedPurchaseInAncestors};\n})();');
assert.notEqual(instrumented, source, '找不到腳本入口');

class ElementMock {
    constructor(parent = null, iconFont = false) {
        this.nodeType = 1;
        this.parentElement = parent;
        this.childNodes = [];
        this.iconFont = iconFont;
        this.className = '';
    }
    get textContent() {
        return this.childNodes.map(node => node.nodeType === 3 ? node.nodeValue : node.textContent).join('');
    }
    closest(selector) {
        let item = this;
        while (item) {
            if (item.className === 'material-icons' && selector.includes('.material-icons')) return item;
            item = item.parentElement;
        }
        return null;
    }
    querySelector() { return null; }
}
function appendText(parent, text) {
    const node = {nodeType: 3, nodeValue: text, parentElement: parent};
    parent.childNodes.push(node);
    return node;
}
const store = {ur_zh_tw_custom: {'Custom Phrase': '自訂文字'}, ur_zh_tw_untranslated: {'Previously Seen': ''}};
const ctx = {
    Element: ElementMock,
    HTMLInputElement: class {},
    Node: {TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9},
    NodeFilter: {SHOW_TEXT: 4, SHOW_ELEMENT: 1},
    GM_getValue: (key, fallback) => store[key] ?? fallback,
    GM_setValue: (key, value) => {store[key] = value;},
    GM_registerMenuCommand: () => {},
    window: {addEventListener: () => {}},
    document: {
        body: null,
        addEventListener: () => {},
        createTreeWalker(root) {
            const nodes = [];
            function walk(parent) {
                for (const child of parent.childNodes) {
                    if (child.nodeType === 3) nodes.push(child);
                    else walk(child);
                }
            }
            walk(root);
            let index = 0;
            return {nextNode: () => nodes[index++] || null};
        }
    },
    getComputedStyle: element => ({fontFamily: element.iconFont ? 'Material Symbols Outlined' : 'Arial'}),
    MutationObserver: class {}
};
vm.createContext(ctx);
vm.runInContext(instrumented, ctx);
const api = ctx.testAPI;
const examples = {
    '+1 Bribe Level': '賄賂等級：+1',
    '+15% Money Synergy': '金錢協同增益：+15%',
    '-1 Gang Members needed and +5 Notoriety from Robbery': '搶劫所需幫派成員 -1，搶劫獲得的惡名 +5',
    'Additional +10% Money while sinner': '處於罪人狀態時，金錢額外 +10%',
    'Gang Lv. 12': '幫派等級 12',
    'Store Robbery (5)': '商店搶劫（5）',
    'Reduce Graffiti Crime penalty and max penalty by 1': '將塗鴉的犯罪懲罰及懲罰上限降低 1',
    'You need a minimum of 5 Gang Members': '你至少需要 5 名幫派成員',
    'You upgraded your Gang to Level 2': '你將幫派升級到了等級 2',
    'x1.2 Money From Robbery': '搶劫獲得的金錢 ×1.2',
    '+7% chance to get Stolen Goods when Shoplifting': '商店行竊時獲得贓物的機率增加 7%',
    '-3% chance to get Stolen Goods when Shoplifting': '商店行竊時獲得贓物的機率減少 3%',
    'Lose 30% of your money': '失去你 30% 的金錢',
    'Able to bribe cops if Criminal status is 3': '若罪犯狀態為 3，便能賄賂警察',
    'Lose 8% less total money when Busted': '被逮捕時，損失的總金錢減少 8%',
    'Rituals cost 35% of your Souls to cast (Min 18 Souls)': '施放儀式需消耗你 35% 的靈魂（最低 18 個靈魂）',
    'You may encounter The Devil if your sin is at least 7': '如果你的罪孽至少為 7，就可能遇見魔鬼',
    'Artistic Flair': '藝術天賦',
    'Knee Pads': '護膝',
    'Gang is full': '幫派人數已滿',
    'Magical Beans': '魔法豆',
    '2 For 1 Sale': '買一送一促銷',
    '5 Finger Discount': '五指折扣',
    'Shoplift (15%)': '商店行竊（15%）',
    '+2.40 Souls': '靈魂：+2.40',
    "Purchased Upgrade 'Sinner-gy'!": '已購買升級「罪人協同效應」！',
    "Purchased Equipment 'Knee Pads'!": '已購買裝備「護膝」！',
    'Custom Phrase': '自訂文字'
};
for (const [original, translated] of Object.entries(examples)) {
    assert.equal(api.translateString(original), translated, original);
}
const notice = new ElementMock();
appendText(notice, "Purchased Upgrade 'Sinner");
appendText(notice, '-');
appendText(notice, "gy'!");
assert.equal(api.translateGroupedPurchase(notice), true);
assert.equal(notice.textContent, '已購買升級「罪人協同效應」！');
assert.equal(api.translateGroupedPurchase(notice), false);
const group = new ElementMock();
const child = new ElementMock(group);
group.childNodes.push(child);
appendText(child, "Purchased Equipment 'Knee");
appendText(group, " Pads'!");
assert.equal(api.translateGroupedPurchaseInAncestors(child), true);
assert.equal(group.textContent, '已購買裝備「護膝」！');
const icon = new ElementMock(null, true);
const iconText = appendText(icon, 'settings');
api.translateText(iconText);
assert.equal(iconText.nodeValue, 'settings');
const label = new ElementMock();
const labelText = appendText(label, 'settings');
api.translateText(labelText);
assert.equal(labelText.nodeValue, '設定');
assert.equal(api.lookup("Purchased Upgrade 'Sinner"), "Purchased Upgrade 'Sinner");
assert.equal(api.lookup("gy'!"), "gy'!");
assert.equal(store.ur_zh_tw_untranslated['Previously Seen'], '');
const expansionCases = {
    '(+3.75 Souls per Gang Member (+9.25 Total) per Sacrifice/Cultist Training Ground)': '（每座邪教徒訓練場每次獻祭，每名幫派成員獲得 +3.75 靈魂（總計 +9.25））',
    '(-9 Not. per day/Cultist Training Ground)': '（每座邪教徒訓練場每天的惡名：-9）',
    '+13 Souls per Gang Member (+28 Total) per Sacrifice': '每次獻祭每名幫派成員獲得 +13 靈魂（總計 +28）',
    '+12 Altar': '祭壇：+12',
    '+9 Cultist Training Ground': '邪教徒訓練場：+9',
    '+25% Chance for bonus Drugs on harvest': '收成時獲得額外毒品的機率：+25%',
    '+9 Stolen Jewels from Raid Grave': '盜墓獲得的贓珠寶：+9',
    '+9 Stolen Jewel from Jewelry Store Heists': '珠寶店劫案獲得的贓珠寶：+9',
    '-5 Not. per day': '每天的惡名：-5',
    '99/150 HP': '生命值：99/150',
    '42 Days': '42 天',
    'A SWAT Team will try raid you if your criminality is at least 25': '如果你的犯罪程度至少為 25，特警隊將嘗試突襲你',
    'Dry, slowing down growth by 25%': '乾燥，使生長速度減慢 25%',
    'Growth: 17.5%': '生長進度：17.5%',
    'Wetness: 85%': '濕潤度：85%',
    'Sell Stolen Jewels for x2.5 more': '以 ×2.5 的價格出售偷來的珠寶',
    'Too high Criminal Status (Max 10)': '罪犯狀態過高（上限 10）',
    'Win and gain +80% global notoriety. Lose and lose all notoriety and gang members.': '獲勝並獲得 +80% 全域惡名。失敗則失去所有惡名與幫派成員。',
    'x3 Money gained from Store Robbery': '商店搶劫獲得的金錢 ×3',
    '(Sickle)': '（鐮刀）',
    '(Sow)': '（播種）',
    '(Water)': '（澆水）',
    'The Cemetery:': '墓園：',
    'Drug': '毒品',
    'Fertilizer': '肥料'
};
for (const [original, expected] of Object.entries(expansionCases)) {
    assert.equal(api.translateString(original), expected, original);
}
const chinesePurchase = '已購買升級「「Ebonics（非裔美國英語）」音樂光碟」！';
assert.equal(api.translateString(chinesePurchase), chinesePurchase);
assert.equal(store.ur_zh_tw_untranslated[chinesePurchase], undefined);
assert.equal(api.lookup('gun'), 'gun');
assert.equal(store.ur_zh_tw_untranslated['Previously Seen'], '');

console.log('全部通過：' + Object.keys(examples).length + ' 個翻譯案例、拆分通知、圖示及儲存回歸測試。');
