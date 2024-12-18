
```
ReportGenerator-electron
├─ .DS_Store
├─ .git
│  ├─ HEAD
│  ├─ config
│  ├─ description
│  ├─ hooks
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout.sample
│  │  └─ update.sample
│  ├─ info
│  │  └─ exclude
│  ├─ objects
│  │  ├─ info
│  │  └─ pack
│  └─ refs
│     ├─ heads
│     └─ tags
├─ .gitignore
├─ electron
│  ├─ generator
│  │  ├─ config
│  │  │  └─ reportConfig.js
│  │  ├─ dataProcessing
│  │  │  ├─ ETLProcess.js
│  │  │  └─ dataAggregator.js
│  │  ├─ generator.js
│  │  ├─ input
│  │  │  ├─ dataInputProcessor.js
│  │  │  └─ formatHandlers
│  │  │     ├─ coupangHandler.js
│  │  │     ├─ csvHandler.js
│  │  │     └─ jsonHandler.js
│  │  ├─ reportGeneration
│  │  │  ├─ BaseReportGenerator.js
│  │  │  ├─ ReportGenerator.js
│  │  │  ├─ ReportGeneratorFactory.js
│  │  │  ├─ coupangReportGenerator.js
│  │  │  └─ naverReportGenerator.js
│  │  ├─ sheets
│  │  │  ├─ .DS_Store
│  │  │  ├─ brandSearch
│  │  │  │  └─ brandSearchSheet.js
│  │  │  ├─ campaign
│  │  │  │  ├─ campaignSheet.js
│  │  │  │  ├─ summaryRow.js
│  │  │  │  └─ top10Data.js
│  │  │  ├─ dayOfWeek
│  │  │  │  ├─ dayOfWeekSheet.js
│  │  │  │  └─ writeDayData.js
│  │  │  ├─ group
│  │  │  │  └─ groupSheet.js
│  │  │  ├─ noSearch
│  │  │  │  ├─ noSearchSheet.js
│  │  │  │  ├─ writeNoSearchData.js
│  │  │  │  └─ writeSummaryRow.js
│  │  │  └─ summary
│  │  │     ├─ summarySheet.js
│  │  │     └─ writeSummaryData.js
│  │  ├─ templates
│  │  │  ├─ coupangWeeklyReportTemplate.js
│  │  │  └─ templateProcessor.js
│  │  └─ utils
│  │     ├─ autoFit.js
│  │     ├─ campaignUtil.js
│  │     ├─ dataUtil.js
│  │     ├─ dateUtil.js
│  │     ├─ groupBy.js
│  │     └─ sortBy.js
│  ├─ main.mjs
│  └─ preload.mjs
├─ front
│  ├─ .gitignore
│  ├─ README.md
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.cjs
│  ├─ src
│  │  ├─ .DS_Store
│  │  ├─ App.jsx
│  │  ├─ components
│  │  │  ├─ .DS_Store
│  │  │  ├─ common
│  │  │  │  ├─ Button.jsx
│  │  │  │  ├─ InputFile.jsx
│  │  │  │  ├─ InputRadio.jsx
│  │  │  │  ├─ InputSelect.jsx
│  │  │  │  └─ InputText.jsx
│  │  │  └─ specific
│  │  │     ├─ MonthlyFile.jsx
│  │  │     └─ WeeklyFile.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ option.config.js
│  │  └─ page
│  │     └─ Home.jsx
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ package-lock.json
└─ package.json

```