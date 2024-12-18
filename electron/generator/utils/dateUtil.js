// date-fns 함수 불러오기
const { parse, getDate, getDay, startOfMonth, format } = require("date-fns");

/**
 * YYYYMMDD 형식의 문자열을 Date 객체로 변환하는 함수 using date-fns
 * @param {string} dateString - 변환할 날짜 문자열 (예: "20241123")
 * @returns {Date} - 변환된 Date 객체
 */
const createDateFromYYYYMMDD = (dateString) => {
  // 'yyyyMMdd' 형식으로 파싱
  return parse(dateString, "yyyyMMdd", new Date());
};

/**
 * YYYYMMDD 형식의 문자열을 MM.DD 형식으로 변환하는 함수
 * @param {string} dateString - 변환할 날짜 문자열 (예: "20241101")
 * @returns {string} - 변환된 날짜 문자열 (예: "11.01")
 */
const convertYYYYMMDDtoYYMMDD = (dateString) => {
  // 'yyyyMMdd' 형식으로 파싱

  const parsedDate = parse(dateString, "yyyyMMdd", new Date());

  // 'MM.dd' 형식으로 포맷
  return format(parsedDate, "yy.MM.dd");
};

/**
 * 특정 날짜가 해당 월의 몇 주차에 속하는지 반환하는 함수
 * @param {Date | string} inputDate - 계산할 날짜 (Date 객체 또는 YYYYMMDD 형식의 문자열)
 * @param {number} weekStartsOn - 주 시작 요일 (0=일요일, 1=월요일, ..., 6=토요일), 기본값은 1 (월요일)
 * @returns {number} - 해당 월의 주차
 */
const getWeekOfMonth = (inputDate, weekStartsOn = 1) => {
  // 입력된 날짜를 Date 객체로 변환 (문자열일 경우)
  const date =
    typeof inputDate === "string"
      ? parseYYYYMMDDWithDateFns(inputDate)
      : inputDate;

  // 현재 날짜의 일(day) 가져오기
  const dayOfMonth = getDate(date);

  // 해당 월의 첫 번째 날 가져오기
  const firstDayOfMonth = startOfMonth(date);

  // 첫 번째 날의 요일 가져오기 (0=일요일, 6=토요일)
  let firstWeekday = getDay(firstDayOfMonth);

  // 주 시작 요일에 맞게 첫 요일 조정
  firstWeekday = (firstWeekday - weekStartsOn + 7) % 7;

  // 주차 계산: (일자 + 첫 번째 날의 요일 보정) / 7을 올림
  return Math.ceil((dayOfMonth + firstWeekday) / 7);
};

module.exports = {
  createDateFromYYYYMMDD,
  getWeekOfMonth,
  convertYYYYMMDDtoYYMMDD,
};
