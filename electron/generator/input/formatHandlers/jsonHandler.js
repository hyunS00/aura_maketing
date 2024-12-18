const fs = require("node:fs/promises");

/**
 * JSON 데이터를 로드하고 파싱
 * @param {string} filePath - JSON 파일 경로
 * @returns {Array} - 파싱된 데이터 배열
 */
const handleJson = async (filePath) => {
  const rawData = await fs.readFile(filePath, "utf-8");
  const jsonData = JSON.parse(rawData);

  return jsonData.map((item) => ({
    campaign: item.campaign,
    impressions: item.impressions,
    clicks: item.clicks,
    cost: item.cost,
    conversions: item.conversions,
    revenue: item.revenue,
  }));
};

module.exports = handleJson;
