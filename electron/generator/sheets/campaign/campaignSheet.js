const writeCampaignData = require("../../utils/campaignUtil.js");
const writeSummaryRow = require("./summaryRow.js");
const writeCampaignTop10Data = require("./top10Data.js");
const autoFitColumns = require("../../utils/autoFit.js");
/**
 * 캠페인 데이터를 워크시트에 작성하는 메인 함수
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {Array} data - 캠페인 데이터 배열
 * @param {number} offset - 데이터 작성 시작 행
 * @param {string} platform - 플랫폼 이름
 */
const writeCampaignSheet = (
  worksheet,
  data,
  offset = 62,
  platform,
  reportType
) => {
  console.log("캠페인 시트 작성 시작!");
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
    writeCampaignData(worksheet, record, rowIndex, reportType);
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
  writeSummaryRow(worksheet, 61, totals);

  // TOP10 데이터 작성
  writeCampaignTop10Data(worksheet, data, reportType);

  autoFitColumns(worksheet, "C:V");
  console.log("캠페인 시트 작성 완료!");
};

module.exports = writeCampaignSheet;
