const writeSummaryData = require("./writeSummaryData.js");
const reportConfig = require("../../config/reportConfig.js");

/**
 * 요약 시트에 데이터를 작성하는 함수
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {Array} data - 요약 데이터 배열
 * @param {string} platform - 플랫폼 이름
 */
const writeSummarySheet = (worksheet, data, code, companyName, platform) => {
  const {
    [platform]: {
      weekly: { type },
    },
  } = reportConfig;
  console.log(code, companyName);
  worksheet.cell("C7").value(code);
  worksheet.cell("C8").value(companyName);
  type.forEach((typeValue) => {
    writeSummaryData(worksheet, data[typeValue][0].weeks, typeValue, platform);
  });
};

module.exports = writeSummarySheet;
