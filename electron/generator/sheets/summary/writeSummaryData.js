const reportConfig = require("../../config/reportConfig.js");

/**
 * 워크시트에 데이터를 작성하는 헬퍼 함수
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {string} column - 데이터가 들어갈 열
 * @param {number} row - 데이터가 들어갈 행
 * @param {number} value - 작성할 값
 */
const writeCell = (worksheet, column, row, value) => {
  worksheet.cell(`${column}${row}`).value(value);
};

/**
 * 모든 요약 데이터를 워크시트에 작성
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {Array} data - 요약 데이터 배열
 * @param {string} type - 데이터 타입 ("자동" 또는 "수동")
 * @param {string} platform - 플랫폼 이름 ("coupang" 또는 "naver")
 */
const writeSummaryData = (worksheet, data, type, platform, reportType) => {
  try {
    const {
      [platform]: {
        [reportType]: {
          mappings: {
            summarySheet: {
              summaryDataColumns,
              summaryDataKeys,
              currentWeekRowIndex,
              previousWeekRowIndex,
            },
          },
        },
      },
    } = reportConfig;

    const weekly = [
      { index: currentWeekRowIndex[type], data: data?.[1] }, // 현재 주
      { index: previousWeekRowIndex[type], data: data?.[0] }, // 전주
    ];

    weekly.forEach(({ index, data: weekData }) => {
      if (weekData) {
        summaryDataColumns.forEach((column, colIndex) => {
          const key = summaryDataKeys[colIndex];
          const value = weekData[key] !== undefined ? weekData[key] : 0;
          writeCell(worksheet, column, index, value);
        });
      }
    });
    weekly.forEach(({ index, data: weekData }) => {
      if (weekData) {
        worksheet
          .cell(`B${index}`)
          .value(
            `${weekData.startDate}-${weekData.endDate} ${type}캠페인 합계`
          );
      }
    });
  } catch (error) {
    console.error("요약 데이터 작성 중 오류 발생:", error);
  }
};

module.exports = writeSummaryData;
