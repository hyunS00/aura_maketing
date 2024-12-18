const reportConfig = require("../../config/reportConfig.js");
const writeWeekData = require("./writeDayData.js");
const groupBy = require("../../utils/groupBy.js");
const autoFitColumns = require("../../utils/autoFit.js");
/**
 * 요일별 데이터를 워크시트에 작성하는 메인 함수
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {Array} data - 요일별 데이터 배열
 * @param {number} offset - 데이터 작성 시작 행
 */
const writeDayOfWeekSheet = (worksheet, data, platform) => {
  const typeData = groupBy(data, "type");
  const {
    [platform]: {
      weekly: {
        type,
        mappings: {
          daySheet: { typeRowIndex },
        },
      },
    },
  } = reportConfig;
  type.forEach((typeValue) => {
    writeWeekData(
      worksheet,
      typeData[typeValue],
      typeRowIndex[typeValue],
      platform
    );
  });
  autoFitColumns(worksheet, ["Q", "U"]);
};

module.exports = writeDayOfWeekSheet;
