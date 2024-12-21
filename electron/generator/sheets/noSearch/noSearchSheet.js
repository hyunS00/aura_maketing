const writeNoSearchData = require("./writeNoSearchData.js");
const writeSummaryRow = require("./writeSummaryRow.js");
const autoFitColumns = require("../../utils/autoFit.js");

const writeNoSearchSheet = (worksheet, data, reportType, offset = 6) => {
  let rowIndex = offset;

  // 합계 초기화
  const totals = Array.from({ length: 3 }, () => ({
    impressions: 0,
    clicks: 0,
    adCost: 0,
    conversion: 0,
    conversionRevenue: 0,
  }));
  // 캠페인 데이터 작성
  data.forEach((record) => {
    writeNoSearchData(worksheet, record, rowIndex, reportType);
    record[reportType].forEach((data, index) => {
      totals[index].impressions += data?.impressions || 0;
      totals[index].clicks += data?.clicks || 0;
      totals[index].adCost += data?.adCost || 0;
      totals[index].conversion += data?.conversion || 0;
      totals[index].conversionRevenue += data?.conversionRevenue || 0;
    });
    rowIndex++;
  });
  // 합계 데이터 작성
  writeSummaryRow(worksheet, 5, totals);
  autoFitColumns(worksheet, "C:V");
  console.log("캠페인 시트 작성 완료!");
};

module.exports = writeNoSearchSheet;
