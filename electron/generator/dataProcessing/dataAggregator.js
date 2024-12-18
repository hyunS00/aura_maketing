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
  const defaultWeeks = ["1주차", "2주차", "기타"];

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
        weeks: {},
      };
    }

    // 주차별로 그룹화
    if (!summaryByCampaign[campaign].weeks[week]) {
      summaryByCampaign[campaign].weeks[week] = {
        week,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByCampaign[campaign].weeks[week].impressions += impressions || 0;
    summaryByCampaign[campaign].weeks[week].clicks += clicks || 0;
    summaryByCampaign[campaign].weeks[week].adCost += adCost || 0;
    summaryByCampaign[campaign].weeks[week].conversion += conversion || 0;
    summaryByCampaign[campaign].weeks[week].conversionRevenue +=
      conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];

  for (const campaign in summaryByCampaign) {
    const campaignData = summaryByCampaign[campaign];
    const weeksArray = [];

    // 기본 주차 목록을 순회하며 누락된 주차는 0으로 초기화
    defaultWeeks.forEach((defaultWeek) => {
      if (campaignData.weeks[defaultWeek]) {
        const summary = campaignData.weeks[defaultWeek];

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

        weeksArray.push(summary);
      } else {
        // 주차 데이터가 없는 경우, 메트릭을 0으로 설정
        weeksArray.push({
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
    weeksArray.sort((a, b) => {
      const weekNumberA = parseInt(a.week.replace(/\D/g, ""), 10);
      const weekNumberB = parseInt(b.week.replace(/\D/g, ""), 10);
      return weekNumberA - weekNumberB;
    });

    campaignData.weeks = weeksArray;
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
  const defaultWeeks = ["1주차", "2주차", "기타"];

  data.forEach((entry) => {
    const {
      type,
      week,
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
        weeks: {},
      };
    }

    // 주차별로 그룹화
    if (!summaryByType[type].weeks[week]) {
      summaryByType[type].weeks[week] = {
        week,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByType[type].weeks[week].impressions += impressions || 0;
    summaryByType[type].weeks[week].clicks += clicks || 0;
    summaryByType[type].weeks[week].adCost += adCost || 0;
    summaryByType[type].weeks[week].conversion += conversion || 0;
    summaryByType[type].weeks[week].conversionRevenue += conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];
  for (const type in summaryByType) {
    const typeData = summaryByType[type];
    const weeksArray = [];

    // 기본 주차 목록을 순회하며 누락된 주차는 0으로 초기화
    defaultWeeks.forEach((defaultWeek) => {
      if (typeData.weeks[defaultWeek]) {
        const summary = typeData.weeks[defaultWeek];

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

        weeksArray.push(summary);
      } else {
        // 주차 데이터가 없는 경우, 메트릭을 0으로 설정
        weeksArray.push({
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
    weeksArray.sort((a, b) => {
      const weekOrder = { "1주차": 1, "2주차": 2, 기타: 3 };
      return weekOrder[a.week] - weekOrder[b.week];
    });

    typeData.weeks = weeksArray;
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
  const defaultWeeks = ["1주차", "2주차", "기타"];

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
        weeks: {},
      };
    }

    // 주차별로 그룹화
    if (!summaryByNoSearch[type].weeks[week]) {
      summaryByNoSearch[type].weeks[week] = {
        week,
        impressions: 0,
        clicks: 0,
        adCost: 0,
        conversion: 0,
        conversionRevenue: 0,
      };
    }

    // 집계 데이터 업데이트
    summaryByNoSearch[type].weeks[week].impressions += impressions || 0;
    summaryByNoSearch[type].weeks[week].clicks += clicks || 0;
    summaryByNoSearch[type].weeks[week].adCost += adCost || 0;
    summaryByNoSearch[type].weeks[week].conversion += conversion || 0;
    summaryByNoSearch[type].weeks[week].conversionRevenue +=
      conversionRevenue || 0;
  });

  // 추가 메트릭 계산 및 배열로 변환
  const aggregatedArray = [];
  for (const type in summaryByNoSearch) {
    const typeData = summaryByNoSearch[type];
    const weeksArray = [];

    // 기본 주차 목록을 순회하며 누락된 주차는 0으로 초기화
    defaultWeeks.forEach((defaultWeek) => {
      if (typeData.weeks[defaultWeek]) {
        const summary = typeData.weeks[defaultWeek];

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

        weeksArray.push(summary);
      } else {
        // 주차 데이터가 없는 경우, 메트릭을 0으로 설정
        weeksArray.push({
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
    weeksArray.sort((a, b) => {
      const weekOrder = { "1주차": 1, "2주차": 2, 기타: 3 };
      return weekOrder[a.week] - weekOrder[b.week];
    });

    typeData.weeks = weeksArray;
    aggregatedArray.push(typeData);
  }
  return aggregatedArray;
};

module.exports = {
  aggregateBy,
  aggregateDataByCampaignAndWeek,
  aggregateDataByTypeAndWeek,
  aggregateDataByNoSearch,
};
