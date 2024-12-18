/**
 * 데이터를 특정 키를 기준으로 정렬하는 함수
 * @param {Array} data - 정렬할 데이터 배열
 * @param {string} key - 정렬 기준 키 (예: "impressions", "clicks")
 * @param {boolean} [descending=true] - 내림차순 여부
 * @returns {Array} - 정렬된 데이터 배열
 */
const sortBy = (data, key, descending = true) => {
  if (!Array.isArray(data)) {
    throw new TypeError("sortBy 함수에 전달된 data가 배열이 아닙니다.");
  }

  return [...data].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // 값이 undefined이거나 null인 경우 처리
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return descending ? 1 : -1;
    if (bValue == null) return descending ? -1 : 1;

    // 숫자 정렬
    const numericCompare = descending ? bValue - aValue : aValue - bValue;
    if (!isNaN(numericCompare)) {
      return numericCompare;
    }

    // 문자열 정렬
    if (typeof aValue === "string" && typeof bValue === "string") {
      return descending
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    }

    // 기타 타입 정렬 (필요 시 추가)
    return 0;
  });
};

module.exports = sortBy;
