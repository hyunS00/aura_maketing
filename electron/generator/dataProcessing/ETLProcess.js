const {
  compareAsc,
  addDays,
  isBefore,
  isSameDay,
  parse,
  startOfWeek,
  endOfWeek,
  differenceInCalendarDays,
  min,
  startOfDay,
  addHours,
} = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

const {
  aggregateBy,
  aggregateDataByCampaignAndWeek,
  aggregateDataByTypeAndWeek,
  aggregateDataByNoSearch,
  aggregateDataByTypeAndMonth,
  aggregateDataByCampaignAndMonth,
} = require("./dataAggregator.js");
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
      //   this.validateData(rawData);

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
        return entry.actualDate > max ? entry.actualDate : max;
      }, parsedData[0].actualDate);

      const latestYear = latestDate.getFullYear();
      const latestMonth = latestDate.getMonth(); // 0 기반

      // 2. 최근 월 데이터 필터링
      const latestMonthData = parsedData.filter(
        (entry) =>
          entry.actualDate.getFullYear() === latestYear &&
          entry.actualDate.getMonth() === latestMonth
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
    console.log("type", aggregatedData.byType);

    console.log("시작일:", aggregatedData.startDate);
    console.log("종료일:", aggregatedData.endDate);

    return aggregatedData;
  }

  /**
   * 날짜 문자열을 한국 시계 기준 Date 객체로 변환
   * @param {string} dayStr - 날짜 문자열 (예: '24.11.04')
   * @returns {Date} - 변환된 Date 객체
   */
  parseDate(dayStr) {
    try {
      const [year, month, day] = dayStr
        .split(".")
        .map((num) => parseInt(num, 10));
      const fullYear = year < 100 ? 2000 + year : year;
      // UTC 기준으로 날짜를 생성
      const utcDate = new Date(Date.UTC(fullYear, month - 1, day));
      if (isNaN(utcDate)) {
        throw new Error(`Invalid date string: ${dayStr}`);
      }
      // UTC 날짜를 Asia/Seoul 시간대로 변환
      const zonedDate = toZonedTime(utcDate, "Asia/Seoul");
      return zonedDate;
    } catch (error) {
      console.error(`Error parsing date: ${error.message}`);
      return null; // 또는 적절한 기본값 반환
    }
  }

  /**
   * Date 객체를 "YY.MM.DD" 형식의 문자열로 변환
   * @param {Date} date - 변환할 Date 객체
   * @returns {string} - 포맷팅된 날짜 문자열 (예: "24.11.10")
   */
  formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error("유효하지 않은 Date 객체");
    }

    const year = (date.getFullYear() % 100).toLocaleString().padStart(2, "0");
    const month = (date.getMonth() + 1).toLocaleString().padStart(2, "0"); // 월은 0 기반이므로 +1
    const day = date.getDate().toLocaleString().padStart(2, "0");

    return `${year}.${month}.${day}`;
  }

  /**
   * 데이터의 시작일을 "YY.mm.dd" 형식의 문자열로 반환
   * @param {Array} data - 데이터 배열
   * @returns {string} - 시작일 문자열 (예: "24.11.10")
   */
  getStartDate(data) {
    if (data.length === 0) return null;
    const startDate = data.reduce((min, entry) => {
      return entry.actualDate < min ? entry.actualDate : min;
    }, data[0].actualDate);
    return this.formatDate(startDate); // 형식화된 문자열 반환
  }

  /**
   * 데이터의 종료일을 "YY.mm.dd" 형식의 문자열로 반환
   * @param {Array} data - 데이터 배열
   * @returns {string} - 종료일 문자열 (예: "24.11.10")
   */
  getEndDate(data) {
    if (data.length === 0) return null;
    const endDate = data.reduce((max, entry) => {
      return entry.actualDate > max ? entry.actualDate : max;
    }, data[0].actualDate);
    return this.formatDate(endDate); // 형식화된 문자열 반환
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
      compareAsc(a.actualDate, b.actualDate)
    );
    if (type === "monthly") {
      const firstDate = sortedData[0].actualDate;
      const krDate = addHours(firstDate, 9);

      const year = krDate.getFullYear();
      const month = krDate.getMonth();
      console.log("y:", year, "m:", month);

      // 월의 첫 날과 마지막 날을 Asia/Seoul 시간대로 설정
      const firstOfMonth = new Date(year, month, 1);
      const lastOfMonth = new Date(year, month + 1, 0);
      let weekNumber = 1;
      const weekRanges = [];
      // 첫 주의 시작일을 월요일로 설정, 필요시 월의 첫 날로 조정
      let currentWeekStart = startOfWeek(firstOfMonth, { weekStartsOn: 1 });
      while (currentWeekStart <= lastOfMonth) {
        let currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
        currentWeekEnd = min([currentWeekEnd, lastOfMonth]);
        currentWeekEnd = startOfDay(currentWeekEnd); // 시간 정규화
        // 이미 Asia/Seoul 시간대로 설정된 상태이므로 추가 변환 제거
        weekRanges.push({
          weekNumber: weekNumber,
          weekStart: currentWeekStart,
          weekEnd: currentWeekEnd,
        });
        weekNumber += 1;
        currentWeekStart = addDays(currentWeekEnd, 1);
      }
      // 주차 할당 최적화: weekRanges를 순회하며 매칭
      let rangeIndex = 0;
      return sortedData.map((entry) => {
        const entryDate = entry.actualDate;
        while (
          rangeIndex < weekRanges.length &&
          entryDate > weekRanges[rangeIndex].weekEnd
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
          weekStart: this.formatDate(weekInfo.weekStart),
          weekEnd: this.formatDate(weekInfo.weekEnd),
        };
      });
    } else {
      // 기존의 주간 보고서용 주차 할당 로직
      const startDate = sortedData[0].actualDate;
      const weekly = ["1주차", "2주차", "3주차", "4주차", "5주차"];
      return sortedData.map((entry) => {
        const diffInDays = differenceInCalendarDays(
          entry.actualDate,
          startDate
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
      compareAsc(a.actualDate, b.actualDate)
    );

    // 첫 번째 데이터의 월을 기준으로 이전 월과 현재 월 설정
    const firstDate = sortedData[0].actualDate;

    return sortedData.map((entry) => {
      const entryDate = entry.actualDate;
      const entryMonth = entryDate.getMonth() + 1;

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
        acc.impressions += item.impressions || 0;
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
      summary.impressions > 0
        ? (summary.clicks / summary.impressions) * 100
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
