const _ = require("lodash");

/**
 * 데이터에서 특정 키 기준으로 TOP10 항목을 가져오는 함수
 * @param {Array} data - 데이터 배열
 * @param {string} key - 정렬 기준 키
 * @returns {Array} - TOP10 데이터 배열
 */
const getTop10Data = (data, key, reportType) => {
  return _(data)
    .filter(
      (item) =>
        _.has(item[reportType][1], key) && _.isNumber(item[reportType][1][key])
    )
    .orderBy([`${reportType}[1].` + key], ["desc"])
    .take(10)
    .value();
};
module.exports = getTop10Data;
