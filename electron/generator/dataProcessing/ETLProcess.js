const {
  LocalDate,
  ZonedDateTime,
  ZoneId,
  ChronoUnit,
  DateTimeFormatter,
  DayOfWeek,
} = require("@js-joda/core");
require("@js-joda/timezone");
const {
  aggregateBy,
  aggregateDataByCampaignAndWeek,
  aggregateDataByTypeAndWeek,
  aggregateDataByNoSearch,
  aggregateDataByTypeAndMonth,
  aggregateDataByCampaignAndMonth,
} = require("./dataAggregator.js");
/**
 * previousOrSame 함수 구현
 * @param {LocalDate} date - 기준 날짜
 * @param {DayOfWeek} dayOfWeek - 목표 요일
 * @returns {LocalDate} - 목표 요일 또는 이전 날짜
 */
function previousOrSame(date, dayOfWeek) {
  while (date.dayOfWeek() !== dayOfWeek) {
    date = date.minusDays(1);
  }
  return date;
}

/**
 * nextOrSame 함수 구현
 * @param {LocalDate} date - 기준 날짜
 * @param {DayOfWeek} dayOfWeek - 목표 요일
 * @returns {LocalDate} - 목표 요일 또는 이후 날짜
 */
function nextOrSame(date, dayOfWeek) {
  while (date.dayOfWeek() !== dayOfWeek) {
    date = date.plusDays(1);
  }
  return date;
}

/**
 * ETL 프로세스를 처리하는 클래스
 */
class ETLProcess {
  /**
   * ETLProcess 클래스 생성자
   * @param {string} reportType - 보고서 유형 ('weekly' 또는 'monthly')
   * @param {string} platform - 플랫폼 ('coupang' 또는 'naver')
   */
  constructor(reportType, platform) {
    this.reportType = reportType.toLowerCase();
    this.platform = platform.toLowerCase();
  }

  /**
   * ETL 프로세스 실행
   * @param {Array} rawData - 원본 데이터 배열
   * @returns {Object} - 처리된 데이터 객체
   */
  async run(rawData) {
    try {
      console.log("ETL 프로세스 시작");

      // 1. 데이터 검증
      this.validateData(rawData);

      // 2. 데이터 변환 및 집계
      const processedData = this.transformData(rawData);

      console.log("ETL 프로세스 완료");
      return processedData;
    } catch (error) {
      console.error("ETL 프로세스 중 오류 발생:", error);
      throw error;
    }
  }

  /**
   * 입력 데이터 검증
   * @param {Array} data - 검증할 데이터 배열
   */
  validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("유효하지 않은 입력 데이터");
    }

    const requiredFields = [
      "campaign",
      "day",
      "impressions",
      "clicks",
      "adCost",
      "conversion",
      "conversionRevenue",
    ];

    const missingFields = requiredFields.filter(
      (field) => !data[0].hasOwnProperty(field)
    );

    if (missingFields.length > 0) {
      throw new Error(
        `필수 필드가 누락되었습니다: ${missingFields.join(", ")}`
      );
    }
  }

  /**
   * 데이터 변환 및 집계 처리
   * @param {Array} data - 변환할 데이터 배열
   * @returns {Object} - 변환된 데이터 객체
   */
  transformData(data) {
    const parsedData = data.map((entry) => ({
      ...entry,
      actualDate: this.parseDate(entry.day),
    }));

    let aggregatedData;
    if (this.reportType === "weekly") {
      const assignedWeekData = this.assignWeekNumbers(parsedData);
      const groupByedTypeData = aggregateDataByTypeAndWeek(assignedWeekData);
      const groupByedCampaignData =
        aggregateDataByCampaignAndWeek(assignedWeekData);
      const groupByedNoSearchData = groupByedCampaignData.filter(
        (item) => item.noSearchArea !== "검색 영역"
      );
      aggregatedData = {
        byType: groupByedTypeData,
        byDay: aggregateBy(data, ["day", "type"]),
        byWeek: groupByedCampaignData,
        byNoSearch: groupByedNoSearchData,
        startDate: this.getStartDate(parsedData),
        endDate: this.getEndDate(parsedData),
      };
    } else if (this.reportType === "monthly") {
      // 1. 최근 월 식별
      const latestDate = parsedData.reduce((max, entry) => {
        return entry.actualDate.isAfter(max) ? entry.actualDate : max;
      }, parsedData[0].actualDate);

      const latestYear = latestDate.year();
      const latestMonth = latestDate.monthValue(); // 1 기반

      // 2. 최근 월 데이터 필터링
      const latestMonthData = parsedData.filter(
        (entry) =>
          entry.actualDate.year() === latestYear &&
          entry.actualDate.monthValue() === latestMonth
      );

      // 3. 주차 번호 할당
      const assignedWeekData = this.assignWeekNumbers(
        latestMonthData,
        "monthly"
      );

      const assignedMonthData = this.assignMonthNumbers(parsedData);

      // 4. 데이터 집계
      const groupByedTypeData = aggregateDataByTypeAndMonth(assignedMonthData);

      const groupByedCampaignData =
        aggregateDataByCampaignAndMonth(assignedMonthData);
      const groupByedNoSearchData = groupByedCampaignData.filter(
        (item) => item.noSearchArea !== "검색 영역"
      );

      aggregatedData = {
        byType: groupByedTypeData,
        byWeek: aggregateBy(assignedWeekData, ["week", "type"]),
        byMonth: groupByedCampaignData,
        byNoSearch: groupByedNoSearchData,
        startDate: this.getStartDate(parsedData),
        endDate: this.getEndDate(parsedData),
      };
    } else {
      throw new Error(`Unsupported reportType: ${this.reportType}`);
    }

    console.log("시작일:", aggregatedData.startDate);
    console.log("종료일:", aggregatedData.endDate);

    return aggregatedData;
  }

  /**
   * 날짜 문자열을 한국 시계 기준 ZonedDateTime 객체로 변환
   * @param {string} dayStr - 날짜 문자열 (예: '24.11.04')
   * @returns {ZonedDateTime} - 변환된 ZonedDateTime 객체
   */
  parseDate(dayStr) {
    try {
      const formatter = DateTimeFormatter.ofPattern("yy.MM.dd");
      let localDate = LocalDate.parse(dayStr, formatter);
      let zonedDateTime = localDate.atStartOfDay(ZoneId.of("Asia/Seoul"));
      return zonedDateTime;
    } catch (error) {
      console.error(`Error parsing date: ${error.message}`);
      return null;
    }
  }

  /**
   * ZonedDateTime 또는 LocalDate 객체를 "YY.MM.DD" 형식의 문자열로 변환
   * @param {ZonedDateTime | LocalDate} date - 변환할 날짜 객체
   * @returns {string} - 포맷팅된 날짜 문자열 (예: "24.11.10")
   */
  formatDate(date) {
    if (!(date instanceof ZonedDateTime) && !(date instanceof LocalDate)) {
      throw new Error("유효하지 않은 날짜 객체");
    }

    const formatter = DateTimeFormatter.ofPattern("yy.MM.dd");
    return date.format(formatter);
  }

  /**
   * 'day' 정보를 추출하는 유틸리티 함수 추가
   * @param {ZonedDateTime | LocalDate} date - 변환할 날짜 객체
   * @returns {string} - 'dd' 형식의 문자열 (예: "10")
   */
  formatDay(date) {
    if (!(date instanceof ZonedDateTime) && !(date instanceof LocalDate)) {
      throw new Error("유효하지 않은 날짜 객체");
    }

    const formatter = DateTimeFormatter.ofPattern("d일");
    return date.format(formatter);
  }

  /**
   * 데이터의 시작일을 "YY.mm.dd" 형식의 문자열로 반환
   * @param {Array} data - 데이터 배열
   * @returns {string} - 시작일 문자열 (예: "24.11.10")
   */
  getStartDate(data) {
    if (data.length === 0) return null;
    const startDate = data.reduce((min, entry) => {
      return entry.actualDate.isBefore(min) ? entry.actualDate : min;
    }, data[0].actualDate);
    return this.formatDate(startDate.toLocalDate());
  }

  /**
   * 데이터의 종료일을 "YY.mm.dd" 형식의 문자열로 반환
   * @param {Array} data - 데이터 배열
   * @returns {string} - 종료일 문자열 (예: "24.11.10")
   */
  getEndDate(data) {
    if (data.length === 0) return null;
    const endDate = data.reduce((max, entry) => {
      return entry.actualDate.isAfter(max) ? entry.actualDate : max;
    }, data[0].actualDate);
    return this.formatDate(endDate.toLocalDate());
  }

  /**
   * assignWeekNumbers 함수는 주어진 데이터에 주차 번호과 주차의 시작일 및 종료일을 할당합니다.
   * reportType이 "monthly"인 경우, 주의 시작을 월요일으로 하고 첫 주차는 시작일에 따라 유동적으로 할당됩니다.
   * 그 외의 경우 기존 로직을 따릅니다.
   * @param {Array} data - 주차 번호를 할당할 데이터 배열
   * @param {string} [type] - 보고서 유형 ("monthly" 또는 "weekly" 등)
   * @returns {Array} 주차 번호과 주차의 시작일 및 종료일이 할당된 데이터 배열
   */
  assignWeekNumbers(data, type = "weekly") {
    if (data.length === 0) return data;
    const sortedData = data.sort((a, b) =>
      a.actualDate.compareTo(b.actualDate)
    );
    if (type === "monthly") {
      const firstDate = sortedData[0].actualDate.toLocalDate();

      const year = firstDate.year();
      const month = firstDate.monthValue();

      // 월의 첫 날과 마지막 날을 Asia/Seoul 시간대로 설정
      const firstOfMonth = LocalDate.of(year, month, 1);
      const firstOfMonthZoned = firstOfMonth.atStartOfDay(
        ZoneId.of("Asia/Seoul")
      );
      const lastOfMonth = firstOfMonthZoned
        .toLocalDate()
        .withDayOfMonth(firstOfMonthZoned.toLocalDate().lengthOfMonth());
      const lastOfMonthZoned = lastOfMonth.atStartOfDay(
        ZoneId.of("Asia/Seoul")
      );

      let weekNumber = 1;
      const weekRanges = [];
      // 첫 주의 시작일을 월요일으로 설정, 필요시 월의 첫 날로 조정
      let currentWeekStart = previousOrSame(firstOfMonth, DayOfWeek.MONDAY);
      if (currentWeekStart.isBefore(firstOfMonth)) {
        currentWeekStart = firstOfMonth;
      }
      currentWeekStart = currentWeekStart.atStartOfDay(ZoneId.of("Asia/Seoul"));

      while (!currentWeekStart.toLocalDate().isAfter(lastOfMonth)) {
        let currentWeekEnd = nextOrSame(
          currentWeekStart.toLocalDate(),
          DayOfWeek.SUNDAY
        ).atStartOfDay(ZoneId.of("Asia/Seoul"));
        if (currentWeekEnd.toLocalDate().isAfter(lastOfMonth)) {
          currentWeekEnd = lastOfMonthZoned;
        }
        weekRanges.push({
          weekNumber: weekNumber,
          weekStart: currentWeekStart.toLocalDate(),
          weekEnd: currentWeekEnd.toLocalDate(),
          numberOfDays:
            ChronoUnit.DAYS.between(
              currentWeekStart.toLocalDate(),
              currentWeekEnd.toLocalDate()
            ) + 1,
        });
        weekNumber += 1;
        currentWeekStart = currentWeekEnd.plusDays(1);
      }

      // 주차 할당 최적화: weekRanges를 순회하며 매칭
      let rangeIndex = 0;
      return sortedData.map((entry) => {
        const entryDate = entry.actualDate.toLocalDate();
        while (
          rangeIndex < weekRanges.length &&
          entryDate.isAfter(weekRanges[rangeIndex].weekEnd)
        ) {
          rangeIndex++;
        }
        if (rangeIndex >= weekRanges.length) {
          console.warn(`주차 정보를 찾을 수 없음: ${entryDate}`);
          return {
            ...entry,
            week: "주차 정보 없음",
            weekStart: null,
            weekEnd: null,
          };
        }
        const weekInfo = weekRanges[rangeIndex];
        return {
          ...entry,
          week: `${weekInfo.weekNumber}주차`,
          month: `${month}월`,
          weekStart: this.formatDay(weekInfo.weekStart),
          weekEnd: this.formatDay(weekInfo.weekEnd),
          numberOfDays: weekInfo.numberOfDays,
        };
      });
    } else {
      const startDate = sortedData[0].actualDate.toLocalDate();
      const weekly = ["1주차", "2주차", "3주차", "4주차", "5주차"];
      return sortedData.map((entry) => {
        const diffInDays = ChronoUnit.DAYS.between(
          startDate,
          entry.actualDate.toLocalDate()
        );
        const weekNumber = Math.min(
          Math.floor(diffInDays / 7) + 1,
          weekly.length
        );
        return { ...entry, week: weekly[weekNumber - 1] };
      });
    }
  }

  /**
   * assignMonthNumbers 함수는 주어진 데이터에 월 번호를 할당합니다.
   * 이전 월과 현재 월을 기준으로 각 항목에 대해 '이전월', '현재월', '기타'로 월을 지정합니다.
   * @param {Array} data - 월 번호를 할당할 데이터 배열
   * @returns {Array} 월 번호가 할당된 데이터 배열
   */
  assignMonthNumbers(data) {
    if (data.length === 0) return data;

    // 날짜를 오름차순으로 정렬
    const sortedData = data.sort((a, b) =>
      a.actualDate.compareTo(b.actualDate)
    );

    // 첫 번째 데이터의 월을 기준으로 이전 월과 현재 월 설정
    const firstDate = sortedData[0].actualDate.toLocalDate();
    const referenceMonth = firstDate.monthValue();
    console.log("referenceMonth", referenceMonth);

    return sortedData.map((entry) => {
      const entryMonth = entry.actualDate.toLocalDate().monthValue();
      return { ...entry, month: `${entryMonth}월` };
    });
  }

  /**
   * 전체 요약 데이터 계산
   * @param {Array} data - 계산할 데이터 배열
   * @returns {Object} - 요약 데이터 객체
   */
  calculateSummary(data) {
    const summary = data.reduce(
      (acc, item) => {
        acc.totalImpressions += item.impressions || 0;
        acc.clicks += item.clicks || 0;
        acc.adCost += item.adCost || 0;
        acc.conversion += item.conversion || 0;
        acc.conversionRevenue += item.conversionRevenue || 0;
        return acc;
      },
      {
        totalImpressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      }
    );

    summary.ctr =
      summary.totalImpressions > 0
        ? (summary.clicks / summary.totalImpressions) * 100
        : 0;
    summary.conversionRate =
      summary.clicks > 0 ? (summary.conversion / summary.clicks) * 100 : 0;
    summary.roas =
      summary.adCost > 0
        ? (summary.conversionRevenue / summary.adCost) * 100
        : 0;

    return summary;
  }
}

module.exports = ETLProcess;
