const { sortBy, groupBy } = require("lodash");
/**
 * 데이터를 특정 키를 기준으로 그룹화하고 집계
 * @param {Array} data - 원본 데이터 배열
 * @param {string|Array<string>} keys - 그룹화 기준 키 또는 키 배열 (예: "campaign" 또는 ["campaign", "day"])
 * @param {boolean} [descending=true] - 내림차순 여부
 * @returns {Array} - 그룹화 및 집계된 데이터 배열
 */
const aggregateBy = (data, keys, descending = true) => {
  // keys를 항상 배열로 처리
  const groupKeys = Array.isArray(keys) ? keys : [keys];

  const groupedData = data.reduce((groups, item) => {
    // 복수의 키를 조합하여 그룹키 생성
    const groupKey = groupKeys.map((key) => item[key] || "Unknown").join("_");
    if (!groups[groupKey]) {
      groups[groupKey] = {
        // 각 그룹화 키에 대한 값을 개별적으로 저장
        ...groupKeys.reduce(
          (acc, key) => ({
            ...acc,
            [key]: item[key] || "Unknown",
          }),
          {}
        ),
        day: item.day || "Unknown",
        weekStart: item.weekStart || "Unknown",
        weekEnd: item.weekEnd || "Unknown",
        month: item.month || "Unkwon",
        numberOfDays: item.numberOfDays || "Unknown",
        type: item.type || "Unknown",
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
        roas: 0,
      };
    }

    groups[groupKey].impressions += item.impressions || 0;
    groups[groupKey].clicks += item.clicks || 0;
    groups[groupKey].adCost += item.adCost || 0;
    groups[groupKey].conversion += item.conversion || 0;
    groups[groupKey].conversionRevenue += item.conversionRevenue || 0;

    return groups;
  }, {});

  let aggregatedData = Object.values(groupedData).map((group) => {
    group.roas = group.adCost > 0 ? group.conversionRevenue / group.adCost : 0;
    return group;
  });

  //정렬
  aggregatedData = sortBy(aggregatedData, keys, descending);
  return aggregatedData;
};

/**
 * 캠페인과 주차를 기준으로 데이터를 집계하여 배열 형식으로 반환하는 함수
 * 동일한 캠페인 이름을 가진 항목은 주차별 데이터가 포함된 배열로 저장
 * @param {Array} data - 원본 데이터 배열
 * @returns {Array} - 캠페인별 주차 집계 데이터 배열
 */
const aggregateDataByCampaignAndWeek = (data) => {
  const summaryByCampaign = {};

  // 기본 주차 목록 정의
  const defaultWeekly = ["1주차", "2주차", "기타"];

  data.forEach((entry) => {
    const {
      campaign,
      type,
      week,
      impressions,
      clicks,
      adCost,
      conversion,
      conversionRevenue,
      noSearchArea,
    } = entry;

    // 캠페인별로 그룹화
    if (!summaryByCampaign[campaign]) {
      summaryByCampaign[campaign] = {
        campaign,
        type: type || "Unknown",
        weekly: {},
      };
    }

    // 주차별로 그룹화
    if (!summaryByCampaign[campaign].weekly[week]) {
      summaryByCampaign[campaign].weekly[week] = {
        week,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByCampaign[campaign].weekly[week].impressions += impressions || 0;
    summaryByCampaign[campaign].weekly[week].clicks += clicks || 0;
    summaryByCampaign[campaign].weekly[week].adCost += adCost || 0;
    summaryByCampaign[campaign].weekly[week].conversion += conversion || 0;
    summaryByCampaign[campaign].weekly[week].conversionRevenue +=
      conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];

  for (const campaign in summaryByCampaign) {
    const campaignData = summaryByCampaign[campaign];
    const weeklyArray = [];

    // 기본 주차 목록을 순회하며 누락된 주차는 0으로 초기화
    defaultWeekly.forEach((defaultWeek) => {
      if (campaignData.weekly[defaultWeek]) {
        const summary = campaignData.weekly[defaultWeek];

        // 메트릭 계산
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

        weeklyArray.push(summary);
      } else {
        // 주차 데이터가 없는 경우, 메트릭을 0으로 설정
        weeklyArray.push({
          week: defaultWeek,
          impressions: 0,
          clicks: 0,
          adCost: 0,
          conversion: 0,
          conversionRevenue: 0,
          ctr: 0,
          conversionRate: 0,
          roas: 0,
          noSearchArea: "",
        });
      }
    });

    // 주차별 데이터 정렬 (예: 1주차, 2주차 순)
    weeklyArray.sort((a, b) => {
      const weekNumberA = parseInt(a.week.replace(/\D/g, ""), 10);
      const weekNumberB = parseInt(b.week.replace(/\D/g, ""), 10);
      return weekNumberA - weekNumberB;
    });

    campaignData.weekly = weeklyArray;
    aggregatedArray.push(campaignData);
  }

  // 캠페인 이름 순으로 정렬 내림차순
  const sortedArray = sortBy(aggregatedArray, "campaign").reverse();

  return sortedArray;
};

/**
 * 타입과 주차를 기준으로 데이터를 집계하여 배열 형식으로 반환하는 함수
 * 동일한 타입을 가진 항목은 주차별 데이터가 포함된 배열로 저장
 * @param {Array} data - 원본 데이터 배열
 * @returns {Array} - 타입별 주차 집계 데이터 배열
 */
const aggregateDataByTypeAndWeek = (data) => {
  const summaryByType = {};

  // 기본 주차 목록 정의
  const defaultWeekly = ["1주차", "2주차", "기타"];

  data.forEach((entry) => {
    const {
      type,
      week,
      startDate,
      endDate,
      impressions,
      clicks,
      adCost,
      conversion,
      conversionRevenue,
    } = entry;

    // 타입별로 그룹화
    if (!summaryByType[type]) {
      summaryByType[type] = {
        type,
        weekly: {},
      };
    }

    // 주차별로 그룹화
    if (!summaryByType[type].weekly[week]) {
      summaryByType[type].weekly[week] = {
        week,
        startDate,
        endDate,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByType[type].weekly[week].impressions += impressions || 0;
    summaryByType[type].weekly[week].clicks += clicks || 0;
    summaryByType[type].weekly[week].adCost += adCost || 0;
    summaryByType[type].weekly[week].conversion += conversion || 0;
    summaryByType[type].weekly[week].conversionRevenue +=
      conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];
  for (const type in summaryByType) {
    const typeData = summaryByType[type];
    const weeklyArray = [];

    // 기본 주차 목록을 순회하며 누락된 주차는 0으로 초기화
    defaultWeekly.forEach((defaultWeek) => {
      if (typeData.weekly[defaultWeek]) {
        const summary = typeData.weekly[defaultWeek];

        // 메트릭 계산
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

        weeklyArray.push(summary);
      } else {
        // 주차 데이터가 없는 경우, 메트릭을 0으로 설정
        weeklyArray.push({
          week: defaultWeek,
          impressions: 0,
          clicks: 0,
          adCost: 0,
          conversion: 0,
          conversionRevenue: 0,
          ctr: 0,
          conversionRate: 0,
          roas: 0,
        });
      }
    });

    // 주차별 데이터 정렬 (예: 1주차, 2주차, 기타 순)
    weeklyArray.sort((a, b) => {
      const weekOrder = { "1주차": 1, "2주차": 2, 기타: 3 };
      return weekOrder[a.week] - weekOrder[b.week];
    });

    typeData.weekly = weeklyArray;
    aggregatedArray.push(typeData);
  }
  const aggregatedObject = groupBy(aggregatedArray, "type");
  return aggregatedObject;
};

/**
 * 광고 노출 지면 데이터를 집계하여 배열 형식으로 반환하는 함수
 * @param {Array} data - 원본 데이터 배열
 * @returns {Array} - 광고 노출 지면 집계 데이터 배열
 */
const aggregateDataByNoSearch = (data) => {
  const summaryByNoSearch = {};
  // 기본 주차 목록 정의
  const defaultWeekly = ["1주차", "2주차", "기타"];

  data.forEach((entry) => {
    const {
      type,
      week,
      impressions,
      clicks,
      adCost,
      conversion,
      conversionRevenue,
      noSearchArea,
    } = entry;
    if (noSearchArea === "검색 영역") return;
    // 타입별로 그룹화
    if (!summaryByNoSearch[type]) {
      summaryByNoSearch[type] = {
        type,
        weekly: {},
      };
    }

    // 주차별로 그룹화
    if (!summaryByNoSearch[type].weekly[week]) {
      summaryByNoSearch[type].weekly[week] = {
        week,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByNoSearch[type].weekly[week].impressions += impressions || 0;
    summaryByNoSearch[type].weekly[week].clicks += clicks || 0;
    summaryByNoSearch[type].weekly[week].adCost += adCost || 0;
    summaryByNoSearch[type].weekly[week].conversion += conversion || 0;
    summaryByNoSearch[type].weekly[week].conversionRevenue +=
      conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];
  for (const type in summaryByNoSearch) {
    const typeData = summaryByNoSearch[type];
    const weeklyArray = [];

    // 기본 주차 목록을 순회하며 누락된 주차는 0으로 초기화
    defaultWeekly.forEach((defaultWeek) => {
      if (typeData.weekly[defaultWeek]) {
        const summary = typeData.weekly[defaultWeek];

        // 메트릭 계산
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

        weeklyArray.push(summary);
      } else {
        // 주차 데이터가 없는 경우, 메트릭을 0으로 설정
        weeklyArray.push({
          week: defaultWeek,
          impressions: 0,
          clicks: 0,
          adCost: 0,
          conversion: 0,
          conversionRevenue: 0,
          ctr: 0,
          conversionRate: 0,
          roas: 0,
        });
      }
    });

    // 주차별 데이터 정렬 (예: 1주차, 2주차, 기타 순)
    weeklyArray.sort((a, b) => {
      const weekOrder = { "1주차": 1, "2주차": 2, 기타: 3 };
      return weekOrder[a.week] - weekOrder[b.week];
    });

    typeData.weekly = weeklyArray;
    aggregatedArray.push(typeData);
  }
  return aggregatedArray;
};

/**
 * 타입과 월을 기준으로 데이터를 집계하여 객체 형식으로 반환하는 함수
 * 익월과 전월을 기준으로 데이터를 묶어 저장
 * @param {Array} data - 원본 데이터 배열
 * @returns {Object} - 타입별 월 집계 데이터 객체
 */
const aggregateDataByTypeAndMonth = (data) => {
  const summaryByType = {};

  // 데이터 내의 모든 날짜 추출
  const dates = data.flatMap((entry) => [
    new Date(entry.startDate),
    new Date(entry.endDate),
  ]);
  const latestDate = new Date(Math.max.apply(null, dates));
  const currentMonth = latestDate.getMonth() + 1; // 월은 0부터 시작하므로 +1
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const relevantMonthly = [`${previousMonth}월`, `${currentMonth}월`];

  data.forEach((entry) => {
    const {
      type,
      month,
      startDate,
      endDate,
      impressions,
      clicks,
      adCost,
      conversion,
      conversionRevenue,
    } = entry;

    // relevantMonthly에 해당하지 않는 월은 제외
    if (!relevantMonthly.includes(month)) return;

    // 타입별로 그룹화
    if (!summaryByType[type]) {
      summaryByType[type] = {
        type,
        monthly: {},
      };
    }

    // 월별로 그룹화
    if (!summaryByType[type].monthly[month]) {
      summaryByType[type].monthly[month] = {
        month,
        startDate,
        endDate,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByType[type].monthly[month].impressions += impressions || 0;
    summaryByType[type].monthly[month].clicks += clicks || 0;
    summaryByType[type].monthly[month].adCost += adCost || 0;
    summaryByType[type].monthly[month].conversion += conversion || 0;
    summaryByType[type].monthly[month].conversionRevenue +=
      conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];
  for (const type in summaryByType) {
    const typeData = summaryByType[type];
    const monthlyArray = [];

    relevantMonthly.forEach((relevantMonth) => {
      if (typeData.monthly[relevantMonth]) {
        const summary = typeData.monthly[relevantMonth];

        // 메트릭 계산
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

        monthlyArray.push(summary);
      } else {
        // 월 데이터가 없는 경우, 메트릭을 0으로 설정
        monthlyArray.push({
          month: relevantMonth,
          impressions: 0,
          clicks: 0,
          adCost: 0,
          conversion: 0,
          conversionRevenue: 0,
          ctr: 0,
          conversionRate: 0,
          roas: 0,
        });
      }
    });

    // 월별 데이터 정렬 (전월, 익월 순)
    monthlyArray.sort((a, b) => {
      const monthOrder = {
        [`${previousMonth}월`]: 1,
        [`${nextMonth}월`]: 2,
      };
      return monthOrder[a.month] - monthOrder[b.month];
    });

    typeData.monthly = monthlyArray;
    aggregatedArray.push(typeData);
  }

  const aggregatedObject = groupBy(aggregatedArray, "type");
  return aggregatedObject;
};

/**
 * 캠페인과 월을 기준으로 데이터를 집계하여 객체 형식으로 반환하는 함수
 * 이전 월과 현재 월을 기준으로 데이터를 묶어 저장
 * @param {Array} data - 원본 데이터 배열
 * @returns {Object} - 캠페인별 월 집계 데이터 객체
 */
const aggregateDataByCampaignAndMonth = (data) => {
  const summaryByCampaign = {};

  // 데이터 내의 모든 날짜 추출
  const dates = data.flatMap((entry) => [
    new Date(entry.startDate),
    new Date(entry.endDate),
  ]);
  const latestDate = new Date(Math.max.apply(null, dates));
  const currentMonth = latestDate.getMonth() + 1; // 월은 0부터 시작하므로 +1
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const relevantMonthly = [`${previousMonth}월`, `${currentMonth}월`];

  data.forEach((entry) => {
    const {
      campaign,
      type,
      month,
      impressions,
      clicks,
      adCost,
      conversion,
      conversionRevenue,
    } = entry;

    // relevantMonthly에 해당하지 않는 월은 제외
    if (!relevantMonthly.includes(month)) return;

    // 캠페인별로 그룹화
    if (!summaryByCampaign[campaign]) {
      summaryByCampaign[campaign] = {
        campaign,
        type: type || "Unknown",
        monthly: {},
      };
    }

    // 월별로 그룹화
    if (!summaryByCampaign[campaign].monthly[month]) {
      summaryByCampaign[campaign].monthly[month] = {
        month,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByCampaign[campaign].monthly[month].impressions += impressions || 0;
    summaryByCampaign[campaign].monthly[month].clicks += clicks || 0;
    summaryByCampaign[campaign].monthly[month].adCost += adCost || 0;
    summaryByCampaign[campaign].monthly[month].conversion += conversion || 0;
    summaryByCampaign[campaign].monthly[month].conversionRevenue +=
      conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];

  for (const campaign in summaryByCampaign) {
    const campaignData = summaryByCampaign[campaign];
    const monthlyArray = [];

    relevantMonthly.forEach((relevantMonth) => {
      if (campaignData.monthly[relevantMonth]) {
        const summary = campaignData.monthly[relevantMonth];

        // 메트릭 계산
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

        monthlyArray.push(summary);
      } else {
        // 월 데이터가 없는 경우, 메트릭을 0으로 설정
        monthlyArray.push({
          month: relevantMonth,
          impressions: 0,
          clicks: 0,
          adCost: 0,
          conversion: 0,
          conversionRevenue: 0,
          ctr: 0,
          conversionRate: 0,
          roas: 0,
        });
      }
    });

    // 월별 데이터 정렬 (이전 월, 현재 월 순)
    monthlyArray.sort((a, b) => {
      const monthOrder = {
        [`${previousMonth}월`]: 1,
        [`${currentMonth}월`]: 2,
      };
      return monthOrder[a.month] - monthOrder[b.month];
    });

    campaignData.monthly = monthlyArray;
    aggregatedArray.push(campaignData);
  }

  // 캠페인 이름 순으로 정렬 내림차순
  const sortedArray = sortBy(aggregatedArray, "campaign").reverse();

  return sortedArray;
};

module.exports = {
  aggregateBy,
  aggregateDataByCampaignAndWeek,
  aggregateDataByTypeAndWeek,
  aggregateDataByNoSearch,
  aggregateDataByTypeAndMonth,
  aggregateDataByCampaignAndMonth,
};
