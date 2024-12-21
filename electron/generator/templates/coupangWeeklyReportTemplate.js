const writeSummarySheet = require("../sheets/summary/summarySheet.js");
const writeDayOfWeekSheet = require("../sheets/dayOfWeek/dayOfWeekSheet.js");
const writeCampaignSheet = require("../sheets/campaign/campaignSheet.js");
const writeNoSearchSheet = require("../sheets/noSearch/noSearchSheet.js");

const writeCoupangWeeklyReportTemplate = (
  workbook,
  data,
  code,
  companyName
) => {
  writeSummarySheet(
    workbook.sheet("요약"),
    data.byType,
    data.startDate,
    data.endDate,
    code,
    companyName,
    "coupang",
    "weekly"
  ); // 2행부터 작성
  writeDayOfWeekSheet(workbook.sheet("요일"), data.byDay, "coupang", "weekly");
  writeCampaignSheet(
    workbook.sheet("캠페인"),
    data.byWeek,
    62,
    "coupang",
    "weekly"
  );
  writeNoSearchSheet(
    workbook.sheet("비검색영역"),
    data.byNoSearch,
    "weekly",
    6
  );
};

module.exports = writeCoupangWeeklyReportTemplate;
