const XlsxPopulate = require("xlsx-populate");
const path = require("path");
const processTemplate = require("../templates/templateProcessor.js");

/**
 * 보고서 생성을 담당하는 클래스
 */
class ReportGenerator {
  /**
   * ReportGenerator 클래스 생성자
   * @param {string} platform - 플랫폼 ('coupang' 또는 'naver')
   * @param {string} reportType - 보고서 유형 ('weekly' 또는 'monthly')
   */
  constructor(platform, reportType) {
    this.platform = platform.toLowerCase();
    this.reportType = reportType.toLowerCase();
    this.templatePath = path.join(
      __dirname,
      `../templates/${this.platform}${this.reportType}Template.xlsx`
    );
  }

  /**
   * 보고서 생성
   * @param {Object} data - ETL 처리된 데이터
   * @returns {Promise<Workbook>} - 생성된 워크북
   */
  async generate(data) {
    try {
      console.log("보고서 생성 시작");
      console.log("템플릿 경로:", this.templatePath);
      // 템플릿 로드
      const workbook = await XlsxPopulate.fromFileAsync(this.templatePath);

      // 플랫폼과 리포트 타입에 맞는 템플릿 처리
      const templateType = `${this.platform}${this.reportType}`;
      await processTemplate(templateType, workbook, data);

      console.log("보고서 생성 완료");
      return workbook;
    } catch (error) {
      console.error("보고서 생성 중 오류 발생:", error);
      throw error;
    }
  }
}

module.exports = ReportGenerator;
