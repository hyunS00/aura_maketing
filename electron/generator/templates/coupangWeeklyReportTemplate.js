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
    code,
    companyName,
    "coupang"
  ); // 2행부터 작성
  writeDayOfWeekSheet(workbook.sheet("요일"), data.byDay, "coupang");
  writeCampaignSheet(workbook.sheet("캠페인"), data.byWeek, 62, "coupang");
  writeNoSearchSheet(workbook.sheet("비검색영역"), data.byNoSearch, 6);
};

module.exports = writeCoupangWeeklyReportTemplate;
