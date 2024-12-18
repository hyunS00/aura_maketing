const XlsxPopulate = require("xlsx-populate");
const reportConfig = require("../../config/reportConfig.js");

/**
 * 엑셀 데이터를 로드하고 파싱
 * @param {string} filePath - 엑셀 파일 경로
 * @returns {Object,Map} - 워크시트, 속성 매핑 객체
 */
const handleCoupang = async (filePath) => {
  const workbook = await XlsxPopulate.fromFileAsync(filePath);
  const worksheet = workbook.sheet(0); // 첫 번째 시트 사용
  const headerRow = worksheet.row(1); // 첫 번째 행에서 열 이름 읽기
  const attributeMap = new Map();

  let col = 1;
  while (true) {
    const cell = headerRow.cell(col);
    const cellValue = cell.value();
    if (!cellValue) break;
    if (
      Object.values(reportConfig.coupang.weekly.attribute).includes(cellValue)
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
  return { worksheet, attributeMap };
};

module.exports = handleCoupang;
