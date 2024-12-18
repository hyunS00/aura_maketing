const getTop10Data = require("../../utils/dataUtil.js");
const writeCampaignData = require("../../utils/campaignUtil.js");
/**
 * 모든 TOP10 데이터를 워크시트에 작성
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {Array} data - 캠페인 데이터 배열
 */
const writeCampaignTop10Data = (worksheet, data) => {
  const TOP10_OFFSETS = {
    impressions: 5,
    clicks: 19,
    adCost: 33,
    roas: 47,
  };
  Object.entries(TOP10_OFFSETS).forEach(([key, startRow]) => {
    const topData = getTop10Data(data, key);
    topData.forEach((record, index) => {
      writeCampaignData(worksheet, record, startRow + index);
    });
  });

  console.log("모든 TOP10 데이터 작성 완료!");
};

module.exports = writeCampaignTop10Data;
