# Unlawful Reign 繁體中文化

這是網頁遊戲 [Unlawful Reign](https://unlawfulreign.netlify.app/) 的非官方繁體中文使用者腳本，目前為測試版。它翻譯已收錄的介面及動態文字，並能收集尚未翻譯的文字供後續補充。

## 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. [點此安裝繁體中文化腳本](https://raw.githubusercontent.com/Prysline/unlawful-reign-zh-tw/main/unlawful_reign_zh_tw.user.js)。
3. 開啟 [Unlawful Reign](https://unlawfulreign.netlify.app/)。

安裝後將透過 GitHub 的公開腳本網址檢查版本更新。

## 更新方式

腳本包含 `@updateURL`、`@downloadURL` 與 `@version`。Tampermonkey 將按照其設定檢查遠端版本；當 GitHub 上的版本號較高時，即可取得更新。GitHub 有新的提交，不代表會立即自動安裝。

每次更新使用者腳本時，請將 `@version` 增加，例如從 `0.3.10` 改成 `0.3.11`，並提交此檔案至 `main` 分支。

此前從聊天附件安裝的腳本，需**首次手動安裝這份 GitHub 版本**，之後才能利用上述更新網址。

## 待翻譯文字與自訂詞庫

Tampermonkey 選單提供：

* **匯出待翻譯文字 JSON**：輸出尚未對應翻譯的文字。
* **匯入中文化詞庫 JSON**：匯入 `{"英文原文":"繁體中文譯文"}` 形式的詞庫。
* **清除已收集的待翻譯文字**：只有手動點選才會清除。

待翻譯紀錄及自訂詞庫保存在 Tampermonkey 儲存空間，更新程式碼不會刻意刪除這些資料。若瀏覽器或擴充功能資料被清除，仍可能遺失；重要紀錄可先匯出備份。

## 專案狀態

* 目前版本：`0.3.11`
* 版本狀態：測試版，尚未完成全面遊玩驗證。
* 適用網站：`https://unlawfulreign.netlify.app/`
* 原有 `@name` 與 `@namespace` 維持不變，盡量延續既有安裝識別與儲存鍵名。

本專案不是原遊戲官方製作或維護的翻譯。

## 圖示保護

翻譯時會跳過 Material Icons、Material Symbols、`md-icon`、`mat-icon` 和 SVG 的圖示內容，以免將 `settings` 等圖示名稱當成一般英文翻譯。一般選單中的設定文字仍會照常翻譯。

## 翻譯模組與測試

* 可變動的金額、百分比、幫派等級與人數、搶劫需求、獎勵倍率等使用正規表示式動態處理；道具固有名稱保留在固定詞庫。
* 購買裝備與升級通知可辨識拆分成多個文字節點的情況，避免重複收集殘句。
* 可用 Node.js 執行 `node tests/test_translation.cjs` 進行翻譯格式、圖示及紀錄保存的回歸測試。


### 2026-10-31 補充

已加入園藝、墓園、幫派戰爭、邪教訓練場與裝備文字。生長進度、濕潤度、生命值、每日惡名、獻祭靈魂、機率及獎勵倍率採用動態格式；包含已翻譯名稱且帶有英文的購買通知，不會再誤列為未翻譯文字。`gun` 暫視為可能的圖示識別字，未經遊戲實測確認，不對它進行文字替換。


### v0.3.11 補充

新增賭場、幫派戰爭、毒品與園藝相關詞彙。武器數量、毒品容量、惡名 K/M/B/T 縮寫、幫派戰爭傷害與獎勵、金錢持續天數等改以可重用規則翻譯。使用 `node tests/test_v0311.cjs` 可執行本批新文字與數值變化回歸測試。
