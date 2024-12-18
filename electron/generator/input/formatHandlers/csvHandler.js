const fs = require("node:fs/promises");
// const csvParser = require("csv-parser");

// /**
//  * CSV 데이터를 로드하고 파싱
//  * @param {string} filePath - CSV 파일 경로
//  * @returns {Promise<Array>} - 파싱된 데이터 배열
//  */
// const handleCsv = async (filePath) => {
//   const results = [];
//   return new Promise((resolve, reject) => {
//     fs.createReadStream(filePath)
//       .pipe(csvParser())
//       .on("data", (data) => {
//         results.push({
//           campaign: data.campaign,
//           impressions: Number(data.impressions),
//           clicks: Number(data.clicks),
//           cost: Number(data.cost),
//           conversions: Number(data.conversions),
//           revenue: Number(data.revenue),
//         });
//       })
//       .on("end", () => resolve(results))
//       .on("error", (error) => reject(error));
//   });
// };

// module.exports = handleCsv;
