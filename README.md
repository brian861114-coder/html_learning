# 📚 材料學習資源中心

> 互動式 HTML 學習筆記 — 半導體物理、材料熱力學、微積分、材料科學  
> 適合手機／平板／電腦隨時閱讀

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-線上閱讀-007AFF?style=flat&logo=github)](https://brian861114-coder.github.io/html_learning/)

---

## 📖 內容涵蓋

### 🔵 半導體物理與元件
**課本**：*Semiconductor Physics and Devices* — Donald A. Neamen, 4th Edition

| Part | 章節範圍 | 內容 |
|------|----------|------|
| I — 半導體材料性質 | Ch 1–6 | 晶體結構、量子力學、能帶理論、平衡態半導體、載子傳輸、非平衡載子 |
| II — 半導體元件基礎 | Ch 7–12 | pn 接面、二極體、金半接面、BJT、MOSFET、進階 MOSFET |
| III — 進階與特殊元件 | Ch 13–15 | BJT 進階、JFET/MESFET/HEMT、光學元件、微波與功率元件 |

> 含 12 份公式摘要、16 組習題與例題、完整整合版

### 🟠 材料熱力學
**課本**：*Introduction to the Thermodynamics of Materials* — David R. Gaskell, 6th Edition

| Part | 章節範圍 | 內容 |
|------|----------|------|
| I — 熱力學基本原理 | Ch 1–6 | 術語定義、第一/第二定律、統計熵、基本方程式、熱容與第三定律 |
| II — 相平衡與溶液 | Ch 7–10 | 單成分相平衡、氣體行為、溶液行為、吉布斯自由能與二元相圖 |
| III — 化學反應與應用 | Ch 11–15 | 氣相反應、Ellingham 圖、凝態反應平衡、電化學、相變態 |

> 含 15 份公式摘要

### 🟢 微積分
**課本**：*Calculus: Early Transcendentals* — James Stewart

| Part | 章節範圍 | 內容 |
|------|----------|------|
| I — 微分與積分基礎 | Ch 1–6 | 函數與圖形、極限、導數、導數應用、積分、積分應用 |
| II — 進階技巧與級數 | Ch 7–11 | 積分技巧、微分方程入門、序列與級數、冪級數、參數方程式與極座標 |
| III — 多變量與向量微積分 | Ch 12–17 | 空間向量、向量值函數、偏導數、多重積分、向量微積分、二階微分方程 |

> 含 17 組習題、10 個互動 SVG 模型

### 🟣 材料科學與工程
**課本**：*Materials Science and Engineering* — William D. Callister, Jr.

| Part | 章節範圍 | 內容 |
|------|----------|------|
| I — 基礎與力學性質 | Ch 1–8 | 導論、原子結構與鍵結、晶體結構、缺陷、擴散、力學性質、差排、破損 |
| II — 相圖與材料家族 | Ch 9–15 | 相圖、相變化、金屬合金、陶瓷結構與應用、高分子結構與應用 |

> 含 376 張原文書對照圖

---

## ✨ 功能特色

- 🌓 **深淺色主題切換** — 自動記憶偏好（localStorage）
- 🔍 **全域搜尋** — 搜尋所有章節、公式摘要、習題
- 📱 **響應式設計** — 手機／平板／電腦皆可舒適閱讀
- 🧭 **卡片式導覽** — 依 Part 分類、章節一目了然
- 🖼️ **原文書對照** — 關鍵圖表截圖嵌入內文
- 📐 **MathJax 數學渲染** — 公式清晰呈現
- 🎮 **互動模型** — 微積分含 10 個互動式 SVG 數學模型

---

## 🚀 使用方式

### 線上閱讀（推薦）
開啟 👉 **[brian861114-coder.github.io/html_learning](https://brian861114-coder.github.io/html_learning/)**

### 本機執行
```bash
git clone https://github.com/brian861114-coder/html_learning.git
cd html_learning
# 直接用瀏覽器開啟 index.html，或：
python -m http.server 8080
# 然後開啟 http://localhost:8080
```

---

## 📁 目錄結構

```
html_learning/
├── index.html                  # 主入口導航頁（4 科目）
├── reading-preferences.js      # 主題偏好管理
├── images/                     # 原文書頁面截圖
│   ├── solid-state-physics/    #   半導體物理 (133 張)
│   └── thermodynamics/         #   材料熱力學 (175 張)
├── solid-state-physics/
│   ├── pages/                  # HTML 引用的裁切圖片
│   └── html/
│       ├── chapters/           # 16 章 HTML 學習頁面
│       ├── formula_reviews/    # 12 份公式摘要
│       ├── problems_examples/  # 16 組習題與例題
│       ├── combined/           # 完整整合版 & 結構地圖
│       └── assets/             # 心智圖與互動模型
├── thermodynamics/
│   └── html/
│       ├── chapters/           # 15 章 HTML 學習頁面
│       └── formula_reviews/    # 15 份公式摘要
├── calculus/
│   ├── pages/                  # 223 張裁切圖片
│   └── html/
│       ├── chapters/           # 17 章 HTML 學習頁面
│       ├── problems_examples/  # 17 組習題
│       └── assets/             # 10 個互動 SVG 模型 + CSS/JS
└── material-science/
    ├── pages/                  # 153 張裁切圖片
    └── html/
        ├── chapters/           # 15 章 HTML 學習頁面
        └── assets/             # CSS/JS
```

---

## 🛠 技術棧

- 純 HTML/CSS/JavaScript，無框架依賴
- Apple HIG 設計風格（淺色／深色主題）
- MathJax 3 數學公式渲染
- 互動式 SVG 模型（原生 JS + CSS）
- 靜態檔案，可直接部署 GitHub Pages

---

## 📊 統計

| 科目 | 章節 | 公式摘要 | 習題 | 圖片 |
|------|------|----------|------|------|
| 半導體物理 | 16 | 12 | 16 | ~130 |
| 材料熱力學 | 15 | 15 | — | ~175 |
| 微積分 | 17 | — | 17 | 223 |
| 材料科學 | 15 | — | — | 153 |
| **合計** | **63** | **27** | **33** | **~700** |

---

## 📝 License

個人學習用途。教材內容版權歸原作者所有，本 repo 僅包含自行整理的學習筆記與摘要。

---

*最後更新：2026/07/05*
