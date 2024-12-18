const writeNoSearchData = require("./writeNoSearchData.js");
const writeSummaryRow = require("./writeSummaryRow.js");
const autoFitColumns = require("../../utils/autoFit.js");

const writeNoSearchSheet = (worksheet, data, offset = 6) => {
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
    writeNoSearchData(worksheet, record, rowIndex);
    record.weeks.forEach((weekData, index) => {
      totals[index].impressions += weekData?.impressions || 0;
      totals[index].clicks += weekData?.clicks || 0;
      totals[index].adCost += weekData?.adCost || 0;
      totals[index].conversion += weekData?.conversion || 0;
      totals[index].conversionRevenue += weekData?.conversionRevenue || 0;
    });
    rowIndex++;
  });
  // 합계 데이터 작성
  writeSummaryRow(worksheet, 5, totals);
  autoFitColumns(worksheet, [
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
  ]);
  console.log("캠페인 시트 작성 완료!");
};

module.exports = writeNoSearchSheet;
