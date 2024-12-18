/**
 * 데이터를 특정 키들을 기준으로 그룹화하는 함수
 * @param {Array} data - 원본 데이터 배열
 * @param {string | Array<string>} keys - 그룹화 기준 키 또는 키의 배열 (예: "campaign", ["campaign", "day"])
 * @returns {object} - 그룹화된 데이터 객체
 */
const groupBy = (data, keys) => {
  return data.reduce((groups, item) => {
    // 키가 배열인지 단일 문자열인지 확인
    const groupKey = Array.isArray(keys)
      ? keys.map((key) => item[key] || "Unknown").join("_")
      : item[keys] || "Unknown";

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

module.exports = groupBy;
