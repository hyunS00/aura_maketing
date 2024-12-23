// js-joda 모듈 불러오기
const {
  LocalDate,
  DateTimeFormatter,
  DayOfWeek,
  ZoneId,
} = require("@js-joda/core");
require("@js-joda/timezone");

/**
 * YYYYMMDD 형식의 문자열을 LocalDate 객체로 변환하는 함수 using js-joda
 * @param {string} dateString - 변환할 날짜 문자열 (예: "20241123")
 * @returns {LocalDate} - 변환된 LocalDate 객체
 */
const createDateFromYYYYMMDD = (dateString) => {
  // 'yyyyMMdd' 형식으로 파싱
  const formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
  return LocalDate.parse(dateString, formatter);
};

/**
 * YYYYMMDD 형식의 문자열을 YY.MM.DD 형식으로 변환하는 함수
 * @param {string} dateString - 변환할 날짜 문자열 (예: "20241101")
 * @returns {string} - 변환된 날짜 문자열 (예: "24.11.01")
 */
const convertYYYYMMDDtoYYMMDD = (dateString) => {
  // 'yyyyMMdd' 형식으로 파싱
  const parsedDate = createDateFromYYYYMMDD(dateString);

  // 'yy.MM.dd' 형식으로 포맷
  const formatter = DateTimeFormatter.ofPattern("yy.MM.dd");
  return parsedDate.format(formatter);
};

/**
 * 특정 날짜가 해당 월의 몇 주차에 속하는지 반환하는 함수
 * @param {LocalDate | string} inputDate - 계산할 날짜 (LocalDate 객체 또는 YYYYMMDD 형식의 문자열)
 * @param {number} weekStartsOn - 주 시작 요일 (1=월요일, ..., 7=일요일), 기본값은 1 (월요일)
 * @returns {number} - 해당 월의 주차
 */
const getWeekOfMonth = (inputDate, weekStartsOn = 1) => {
  // 입력된 날짜를 LocalDate 객체로 변환 (문자열일 경우)
  const date =
    typeof inputDate === "string"
      ? createDateFromYYYYMMDD(inputDate)
      : inputDate;

  // 해당 월의 첫 날 가져오기
  const firstDayOfMonth = date.withDayOfMonth(1);

  // 첫 번째 날의 요일 가져오기 (1=월요일, 7=일요일)
  let firstWeekday = firstDayOfMonth.dayOfWeek().value();

  // 주 시작 요일에 맞게 첫 요일 조정
  firstWeekday = (firstWeekday - weekStartsOn + 7) % 7;

  // 현재 날짜의 일(day) 가져오기
  const dayOfMonth = date.dayOfMonth();

  // 주차 계산: (일자 + 첫 번째 날의 요일 보정) / 7을 올림
  return Math.ceil((dayOfMonth + firstWeekday) / 7);
};

module.exports = {
  createDateFromYYYYMMDD,
  getWeekOfMonth,
  convertYYYYMMDDtoYYMMDD,
};
