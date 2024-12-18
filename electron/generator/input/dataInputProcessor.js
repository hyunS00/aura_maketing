const path = require("node:path");

// 포맷 핸들러 임포트
const handleCoupang = require("./formatHandlers/coupangHandler.js");
const handleJson = require("./formatHandlers/jsonHandler.js");
const handleCsv = require("./formatHandlers/csvHandler");
const { convertYYYYMMDDtoYYMMDD } = require("../utils/dateUtil.js");

// 유틸리티 임포트
const reportConfig = require("../config/reportConfig.js");

// 포맷 핸들러 매핑
const formatHandlers = {
  coupang: handleCoupang,
  json: handleJson,
  // csv: handleCsv,
};

/**
 * 입력 데이터를 처리하는 엔트리 함수
 * @param {string} platform - 플랫폼 이름 (예: 'coupang', 'naver')
 * @param {string} reportType - 보고서 유형 (예: 'weekly', 'monthly')
 * @param {string} format - 입력 데이터 포맷 (예: 'excel', 'json', 'csv')
 * @param {string} filePath - 입력 파일 경로
 * @returns {Promise<Array>} - 파싱된 데이터 배열
 */
const processInput = async (platform, reportType, format, filePath) => {
  const lowerPlatform = platform.toLowerCase();
  const lowerReportType = reportType.toLowerCase();
  const handler = formatHandlers[platform.toLowerCase()];

  if (!handler) {
    throw new Error(`지원되지 않는 데이터 포맷: ${format}`);
  }

  // 플랫폼 및 보고서 유형에 따른 설정 가져오기
  const platformConfig = reportConfig[lowerPlatform]?.[lowerReportType];
  if (!platformConfig) {
    throw new Error(
      `지원되지 않는 플랫폼 또는 보고서 유형: ${platform}-${reportType}`
    );
  }

  try {
    // 핸들러 호출하여 데이터 파싱
    const { worksheet, attributeMap } = await handler(filePath);
    const data = readWorksheetData(worksheet, attributeMap, lowerPlatform);
    console.log(`파일 ${path.basename(filePath)}의 데이터 처리 성공.`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * 워크시트 데이터를 읽어오는 함수
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {Map} attributeMap - 표준 속성과 실제 속성의 매핑 Map 객체
 * @param {string} platform - 플랫폼 이름 (예: 'coupang', 'naver')
 * @returns {Array} - 읽어온 데이터 배열
 */
const readWorksheetData = (worksheet, attributeMap, platform) => {
  const data = [];
  const usedRange = worksheet.usedRange();
  const lastRow = usedRange ? usedRange.endCell().rowNumber() : 0;

  for (let rowIndex = 2; rowIndex <= lastRow; rowIndex++) {
    const row = worksheet.row(rowIndex);
    const campaign = row.cell(attributeMap.get("campaign")).value();
    const day = row.cell(attributeMap.get("day")).value();
    const impressions = row.cell(attributeMap.get("impressions")).value() || 0;
    const clicks = row.cell(attributeMap.get("clicks")).value() || 0;
    const adCost = row.cell(attributeMap.get("cost")).value() || 0;
    const conversion = row.cell(attributeMap.get("conversions")).value() || 0;
    const conversionRevenue =
      row.cell(attributeMap.get("revenue")).value() || 0;

    // 추가적인 속성 처리
    const additionalAttributes = {};
    platformConfigAdditionalAttributes(
      platform,
      attributeMap,
      row,
      additionalAttributes
    );

    if (!campaign) continue;

    let type = "기타";
    if (campaign.includes("자동")) {
      type = "자동";
    } else if (campaign.includes("수동")) {
      type = "수동";
    }

    data.push({
      campaign,
      type,
      day: convertYYYYMMDDtoYYMMDD(String(day)),
      impressions: Number(impressions),
      clicks: Number(clicks),
      adCost: Number(adCost),
      conversion: Number(conversion),
      conversionRevenue: Number(conversionRevenue),
      ...additionalAttributes, // 추가 속성 병합
    });
  }

  console.log(`워크시트 데이터 읽기 완료. 총 레코드 수: ${data.length}`);
  return data;
};

/**
 * 플랫폼별 추가 속성을 처리하는 함수
 * @param {string} platform - 플랫폼 이름
 * @param {Map} attributeMap - 표준 속성과 실제 속성의 매핑 Map 객체
 * @param {object} row - 현재 행 객체
 * @param {object} additionalAttributes - 추가 속성을 저장할 객체
 */
const platformConfigAdditionalAttributes = (
  platform,
  attributeMap,
  row,
  additionalAttributes
) => {
  const platformAdditionalMap = reportConfig[platform]?.additionalAttributes;
  if (!platformAdditionalMap) return;

  platformAdditionalMap.forEach((actualAttribute, standardAttribute) => {
    const value = row.cell(attributeMap.get(standardAttribute)).value();
    if (value !== undefined) {
      additionalAttributes[standardAttribute] = value;
    }
  });
};

module.exports = processInput;
