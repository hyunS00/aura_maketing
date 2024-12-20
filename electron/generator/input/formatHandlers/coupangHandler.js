const XlsxPopulate = require("xlsx-populate");
const reportConfig = require("../../config/reportConfig.js");

/**
 * 엑셀 데이터를 로드하고 파싱
 * @param {Object<string>} filePaths - 엑셀 파일 경로
 * @returns {Object,Object} - 워크시트, 속성 매핑 객체
 */
const handleCoupang = async (filePaths) => {
  const worksheets = { prev: null, current: null };
  const attributeMaps = { prev: new Map(), current: new Map() };
  try {
    for (const key of Object.keys(filePaths)) {
      const filePath = filePaths[key];
      if (filePath) {
        const attributeMap = attributeMaps[key];

        const workbook = await XlsxPopulate.fromFileAsync(filePath);
        const worksheet = workbook.sheet(0); // 첫 번째 시트 사용
        worksheets[key] = worksheet;
        const headerRow = worksheet.row(1); // 첫 번째 행에서 열 이름 읽기

        let col = 1;
        while (true) {
          const cell = headerRow.cell(col);
          const cellValue = cell.value();
          if (!cellValue) break;
          if (
            Object.values(reportConfig.coupang.weekly.attribute).includes(
              cellValue
            )
          ) {
            // 셀 값을 키로 변환하여 매핑
            const attributeKey = Object.entries(
              reportConfig.coupang.weekly.attribute
            ).find(([key, value]) => value === cellValue)?.[0];
            if (attributeKey) {
              attributeMap.set(attributeKey, col);
            }
          }
          col++;
        }
        if (attributeMap.size === 0) {
          throw new Error("헤더에서 필요한 열을 찾을 수 없습니다.");
        }
      }
    }

    return { worksheets, attributeMaps };
  } catch (error) {
    console.error("엑셀 처리 중 에러 발생:", error);
    throw error;
  }
};

module.exports = handleCoupang;
