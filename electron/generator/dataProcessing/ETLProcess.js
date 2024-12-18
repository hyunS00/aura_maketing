const { compareAsc, addDays, isBefore, isSameDay, parse } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

const {
  aggregateBy,
  aggregateDataByCampaignAndWeek,
  aggregateDataByTypeAndWeek,
  aggregateDataByNoSearch,
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
    const assignedWeekData = this.assignWeekNumbers(parsedData);
    const groupByedTypeData = aggregateDataByTypeAndWeek(assignedWeekData);
    const groupByedCampaignData =
      aggregateDataByCampaignAndWeek(assignedWeekData);
    const groupByedNoSearchData = groupByedCampaignData.filter(
      (item) => item.noSearchArea !== "검색 영역"
    );
    const aggregatedData = {
      byType: groupByedTypeData,
      byDay: aggregateBy(data, ["day", "type"]),
      byWeek: groupByedCampaignData,
      byNoSearch: groupByedNoSearchData,
    };

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
      const dateString = `${fullYear}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;

      const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
      if (isNaN(parsedDate)) {
        throw new Error(`Invalid date string: ${dayStr}`);
      }
      const zonedDate = toZonedTime(parsedDate, "Asia/Seoul");

      return zonedDate;
    } catch (error) {
      console.error(`Error parsing date: ${error.message}`);
      return null; // 또는 적절한 기본값 반환
    }
  }

  assignWeekNumbers(data) {
    if (data.length === 0) return data;

    // 날짜를 오름차순으로 정렬
    const sortedData = data.sort((a, b) =>
      compareAsc(a.actualDate, b.actualDate)
    );

    // 첫 번째 날짜 기준으로 1주차와 2주차 할당
    const startDate = sortedData[0].actualDate;
    const week1End = addDays(startDate, 6); // 1주차: 0-6일
    const week2End = addDays(startDate, 13); // 2주차: 7-13일
    return sortedData.map((entry) => {
      if (
        isBefore(entry.actualDate, week1End) ||
        isSameDay(entry.actualDate, week1End)
      ) {
        // 0-7일: 1주차
        return { ...entry, week: "1주차" };
      } else if (
        isBefore(entry.actualDate, week2End) ||
        isSameDay(entry.actualDate, week2End)
      ) {
        // 7-14일: 2주차
        return { ...entry, week: "2주차" };
      } else {
        // 14일 이후: 기타
        return { ...entry, week: "기타" };
      }
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
