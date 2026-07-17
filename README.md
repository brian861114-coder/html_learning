# 理工學習中心

互動式繁體中文理工教材，提供章節導覽、閱讀設定、學習進度、自我檢測、非線性學習路徑與互動模型。

線上閱讀：[brian861114-coder.github.io/html_learning](https://brian861114-coder.github.io/html_learning/)

## 學習主題

| 科目 | 章節 | 互動模型 | 練習 | 狀態 |
| --- | ---: | ---: | ---: | --- |
| 微積分 | 17 | 10 | 604 | 可完整閱讀 |
| 材料科學與工程 | 15 | 0 | 55 | 可完整閱讀 |
| 量子力學 | 12 | 0 | 81 | 可完整閱讀 |
| 半導體物理與元件 | 15 | 8 | 405 | 可完整閱讀 |
| 材料熱力學 | 15 | 0 | 52 | 可完整閱讀 |

## 主要功能

- 首頁「繼續學習」與各科閱讀進度
- 章節先備知識、摘要、常見錯誤、自我檢測及延伸路徑
- 深色／淺色主題、字級與閱讀寬度設定
- 標準、專注、完整及自訂內容顯示模式
- 內容來源、推導、例題、圖表、練習及模型的個別顯示控制
- 手機、平板與桌面響應式版面
- 本機瀏覽器儲存閱讀位置、掌握度與顯示偏好

所有學習紀錄都保存在使用者目前瀏覽器的 localStorage，不會上傳或跨裝置同步。

## 目錄結構

```text
html_learning/
├─ index.html                 全站首頁
├─ assets/                    首頁與學習進度資產
├─ shared/                    共用閱讀介面、導覽與模型資產
├─ subjects/
│  ├─ calculus/
│  ├─ material-science/
│  ├─ quantum-mechanics/
│  ├─ solid-state-physics/
│  └─ thermodynamics/
├─ calculus/                  舊網址相容轉址
├─ material-science/          舊網址相容轉址
├─ solid-state-physics/       舊網址相容轉址
├─ thermodynamics/            舊網址相容轉址
└─ .nojekyll                  關閉 GitHub Pages 的 Jekyll 處理
```

舊的 `/<subject>/...` HTML 網址會自動轉址到 `/subjects/<subject>/...`，以維持既有書籤與外部連結。

## 本機閱讀

```bash
git clone https://github.com/brian861114-coder/html_learning.git
cd html_learning
python -m http.server 8080
```

然後開啟 <http://localhost:8080/>。部分數學公式使用 CDN 載入 MathJax，第一次顯示時需要網路連線。

## 部署說明

此倉庫是 GitHub Pages 發布產物。正式內容由獨立的教材來源專案透過 allowlist 同步；部署流程不會包含原始 PDF、來源 metadata、測試、維護工具或建置產物。請勿直接修改自動同步的 `index.html`、`assets/`、`shared/`、`subjects/` 與舊網址轉址檔。

## 內容與授權

教材內容以原始教科書、來源索引與已驗證素材為依據，並加入繁體中文教學整理。原書及引用內容的權利歸其各自權利人所有；本倉庫僅供個人學習與教學整理使用。

最後更新：2026-07-17
