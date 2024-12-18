const writeCoupangWeeklyReportTemplate = require("./coupangWeeklyReportTemplate.js");
// const writeMonthlyReportTemplate =require  ( "./monthlyReportTemplate");

// 템플릿 핸들러 매핑
const templateHandlers = {
  coupangweekly: writeCoupangWeeklyReportTemplate,
  //   monthly: writeMonthlyReportTemplate,
};

/**
 * 템플릿 데이터를 처리
 * @param {string} templateType - 템플릿 유형 ("weekly" 또는 "monthly")
 * @param {object} workbook - XlsxPopulate 워크북 객체
 * @param {object} data - 작성할 데이터
 * @param {string} code - 광고주 코드
 * @param {string} companyName - 광고주 상호명
 */
const processTemplate = async (
  templateType,
  workbook,
  data,
  code,
  companyName
) => {
  const handler = templateHandlers[templateType];
  if (!handler) {
    throw new Error(`지원되지 않는 템플릿 유형: ${templateType}`);
  }

  try {
    // 해당 템플릿 핸들러 호출
    handler(workbook, data, code, companyName);
    console.log(`템플릿 처리 완료: ${templateType}`);
  } catch (error) {
    console.error(`템플릿 처리 중 에러 발생: ${error.message}`);
    throw error;
  }
};

module.exports = processTemplate;
