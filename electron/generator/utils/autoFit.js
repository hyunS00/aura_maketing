/**
 * 열 너비를 자동 조정하는 함수
 * @param {object} sheet - xlsx-populate 시트 객체
 * @param {string|Array<string|number>} columns - 열 범위("A:C") 또는 열 배열(["A", "C", "E"])
 */
function autoFitColumns(sheet, columns) {
  /**
   * 입력값 처리: 열 번호 배열로 변환
   * @param {string|Array<string|number>} input - 열 범위 또는 배열
   * @returns {Array<number>} 열 번호 배열
   */
  function parseColumns(input) {
    if (typeof input === "string") {
      // 열 범위 처리
      const [start, end] = input
        .split(":")
        .map((col) => sheet.column(col).columnNumber());
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else if (Array.isArray(input)) {
      // 열 배열 처리
      return input.map((col) =>
        typeof col === "string" ? sheet.column(col).columnNumber() : col
      );
    } else {
      throw new Error("columns must be a string range or an array.");
    }
  }

  /**
   * 열 너비 계산 함수
   * @param {any} value - 셀 값
   * @param {number} fontSize - 폰트 크기
   * @returns {number} 계산된 열 너비
   */
  function calculateColumnWidth(value, fontSize = 11) {
    if (!value) return 10; // 기본 너비
    const text = value.toString();
    const scaleFactor = fontSize / 11; // 기본 폰트 크기 대비 스케일
    const charWidth = 1.5 * scaleFactor; // 문자당 너비
    return Math.max(text.length * charWidth + 2, 10); // 최소 너비 10
  }

  // 열 번호 배열 생성
  const columnNumbers = parseColumns(columns);

  // 사용된 범위 가져오기
  const usedRange = sheet.usedRange();
  const startRow = usedRange.startCell().rowNumber();
  const endRow = usedRange.endCell().rowNumber();

  // 지정된 열에 대해 작업 수행
  columnNumbers.forEach((col) => {
    const columnValues = [];
    for (let row = startRow; row <= endRow; row++) {
      const cell = sheet.cell(row, col);
      columnValues.push({
        value: cell.value(),
        fontSize: cell.style("fontSize") || 11,
      });
    }

    // 각 셀의 너비 계산
    const columnWidths = columnValues.map(({ value, fontSize }) =>
      calculateColumnWidth(value, fontSize)
    );

    // 열에서 가장 큰 너비를 설정
    const maxWidth = Math.max(...columnWidths);
    sheet.column(col).width(maxWidth);
  });
}
module.exports = autoFitColumns;
