const reportConfig = {
  coupang: {
    weekly: {
      file: {
        length: 1,
      },
      sheet: ["요약", "요일", "캠페인", "비검색영역"],
      templatePath: "./templates/coupangWeeklyTemplate.xlsx",
      mappings: {
        daySheet: {
          dayDataColumns: ["Q", "R", "U", "V", "X"],
          typeRowIndex: { 자동: 5, 수동: 16 },
        },
        summarySheet: {
          summaryDataColumns: ["D", "E", "H", "J", "M"],
          summaryDataKeys: [
            "impressions",
            "clicks",
            "adCost",
            "conversion",
            "conversionRevenue",
          ],
          //전주 데이터 행 인덱스
          previousWeekRowIndex: { 자동: 21, 수동: 27 },
          //현재 주 데이터 행 인덱스
          currentWeekRowIndex: { 자동: 22, 수동: 28 },
          // typeRowIndex: { 자동: 22, 수동: 28 },
        },
        nonSearchAreaSheet: {
          previousWeekDataColumns: ["G", "I", "O", "Q", "U"],
          currentWeekDataColumns: ["D", "E", "H", "J", "M"],
        },
      },
      attribute: {
        campaign: "캠페인명",
        day: "날짜",
        impressions: "노출수",
        clicks: "클릭수",
        cost: "광고비",
        conversions: "총 판매수량(1일)",
        revenue: "총 전환매출액(1일)",
        noSearchArea: "광고 노출 지면",
      },
      type: ["자동", "수동"],
    },
    monthly: {
      templatePath: "../../templates/coupangMonthlyTemplate.xlsx",
      sheet: ["요약", "주차", "캠페인", "비검색영역"],
      mappings: {
        daySheet: {
          dayDataColumns: ["Q", "R", "U", "V", "X", "O", "P"],
          typeRowIndex: { 자동: 5, 수동: 15 },
        },
        summarySheet: {
          summaryDataColumns: ["D", "E", "H", "J", "M"],
          summaryDataKeys: [
            "impressions",
            "clicks",
            "adCost",
            "conversion",
            "conversionRevenue",
          ],
          //전주 데이터 행 인덱스
          previousWeekRowIndex: { 자동: 21, 수동: 27 },
          //현재 주 데이터 행 인덱스
          currentWeekRowIndex: { 자동: 22, 수동: 28 },
          // typeRowIndex: { 자동: 22, 수동: 28 },
        },
        nonSearchAreaSheet: {
          previousWeekDataColumns: ["G", "I", "O", "Q", "U"],
          currentWeekDataColumns: ["D", "E", "H", "J", "M"],
        },
      },
      attribute: {
        campaign: "캠페인명",
        day: "날짜",
        impressions: "노출수",
        clicks: "클릭수",
        cost: "광고비",
        conversions: "총 판매수량(1일)",
        revenue: "총 전환매출액(1일)",
        noSearchArea: "광고 노출 지면",
      },
      type: ["자동", "수동"],
    },
  },
  naver: {
    weekly: {
      templatePath: "../../templates/naverWeeklyTemplate.xlsx",
      mappings: {},
    },
    monthly: {
      templatePath: "../../templates/naverMonthlyTemplate.xlsx",
      mappings: {},
    },
  },
};

module.exports = reportConfig;
