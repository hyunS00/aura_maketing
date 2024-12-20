const writeSummarySheet = require("../sheets/summary/summarySheet.js");
const writeWeekOfMonthSheet = require("../sheets/weekOfMonth/weekOfMonthSheet.js");
const writeCampaignSheet = require("../sheets/campaign/campaignSheet.js");
const writeNoSearchSheet = require("../sheets/noSearch/noSearchSheet.js");

const writeCoupangMonthlyReportTemplate = (
  workbook,
  data,
  code,
  companyName
) => {
  writeSummarySheet(
    workbook.sheet("요약"),
    data.byType,
    code,
    companyName,
    "coupang",
    "monthly"
  ); // 2행부터 작성
  writeWeekOfMonthSheet(
    workbook.sheet("주차"),
    data.byWeek,
    "coupang",
    "monthly"
  );
  writeCampaignSheet(
    workbook.sheet("캠페인"),
    data.byMonth,
    62,
    "coupang",
    "monthly"
  );
  writeNoSearchSheet(
    workbook.sheet("비검색영역"),
    data.byNoSearch,
    "monthly",
    6
  );
};

module.exports = writeCoupangMonthlyReportTemplate;
