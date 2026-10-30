# Unlawful Reign 繁體中文化

這是網頁遊戲 [Unlawful Reign](https://unlawfulreign.netlify.app/) 的非官方繁體中文使用者腳本，目前為測試版。它翻譯已收錄的介面及動態文字，並能收集尚未翻譯的文字供後續補充。

## 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. [點此安裝繁體中文化腳本](https://raw.githubusercontent.com/Prysline/unlawful-reign-zh-tw/main/unlawful_reign_zh_tw.user.js)。
3. 開啟 [Unlawful Reign](https://unlawfulreign.netlify.app/)。

安裝後將透過 GitHub 的公開腳本網址檢查版本更新。

## 更新方式

腳本包含 `@updateURL`、`@downloadURL` 與 `@version`。Tampermonkey 將按照其設定檢查遠端版本；當 GitHub 上的版本號較高時，即可取得更新。GitHub 有新的提交，不代表會立即自動安裝。

每次更新使用者腳本時，請將 `@version` 增加，例如從 `0.3.8` 改成 `0.3.9`，並提交此檔案至 `main` 分支。

此前從聊天附件安裝的腳本，需**首次手動安裝這份 GitHub 版本**，之後才能利用上述更新網址。

## 待翻譯文字與自訂詞庫

Tampermonkey 選單提供：

* **匯出待翻譯文字 JSON**：輸出尚未對應翻譯的文字。
* **匯入中文化詞庫 JSON**：匯入 `{"英文原文":"繁體中文譯文"}` 形式的詞庫。
* **清除已收集的待翻譯文字**：只有手動點選才會清除。

待翻譯紀錄及自訂詞庫保存在 Tampermonkey 儲存空間，更新程式碼不會刻意刪除這些資料。若瀏覽器或擴充功能資料被清除，仍可能遺失；重要紀錄可先匯出備份。

## 專案狀態

* 目前版本：`0.3.8`
* 版本狀態：測試版，尚未完成全面遊玩驗證。
* 適用網站：`https://unlawfulreign.netlify.app/`
* 原有 `@name` 與 `@namespace` 維持不變，盡量延續既有安裝識別與儲存鍵名。

本專案不是原遊戲官方製作或維護的翻譯。

## 圖示保護

翻譯時會跳過 Material Icons、Material Symbols、`md-icon`、`mat-icon` 和 SVG 的圖示內容，以免將 `settings` 等圖示名稱當成一般英文翻譯。一般選單中的設定文字仍會照常翻譯。
