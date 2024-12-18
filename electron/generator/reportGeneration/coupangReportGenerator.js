const XlsxPopulate = require("xlsx-populate");
const BaseReportGenerator = require("./BaseReportGenerator.js");
const processTemplate = require("../templates/templateProcessor.js");
/**
 * 쿠팡 보고서 생성기 클래스
 */
class CoupangReportGenerator extends BaseReportGenerator {
  constructor(reportType) {
    super("coupang", reportType);
  }

  /**
   * 쿠팡 보고서 생성 구현
   * @param {Object} data - ETL 처리된 데이터
   * @returns {Promise<Workbook>}
   */
  async generate(data, code, companyName) {
    try {
      console.log("쿠팡 보고서 생성 시작");

      // 템플릿 로드
      const workbook = await XlsxPopulate.fromFileAsync(this.templatePath);

      // 템플릿 처리
      const templateType = `${this.platform}${this.reportType}`;
      await processTemplate(templateType, workbook, data, code, companyName);

      console.log("쿠팡 보고서 생성 완료");
      return workbook;
    } catch (error) {
      console.error("쿠팡 보고서 생성 중 오류 발생:", error);
      throw error;
    }
  }
}

module.exports = CoupangReportGenerator;
