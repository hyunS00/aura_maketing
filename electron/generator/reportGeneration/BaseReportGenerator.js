const XlsxPopulate = require("xlsx-populate");
const path = require("node:path");
const processTemplate = require("../templates/templateProcessor.js");

/**
 * 추상 보고서 생성기 클래스
 */
class BaseReportGenerator {
  /**
   * 생성자
   * @param {string} platform - 플랫폼 이름
   * @param {string} reportType - 보고서 유형
   */
  constructor(platform, reportType) {
    if (this.constructor === BaseReportGenerator) {
      throw new Error("추상 클래스는 직접 인스턴스화할 수 없습니다.");
    }
    this.platform = platform.toLowerCase();
    this.reportType = reportType.toLowerCase();
    this.templatePath = path.join(
      __dirname,
      `../../templates/${this.platform}${this.reportType}Template.xlsx`
    );
  }

  /**
   * 보고서 생성 메서드 (추상 메서드)
   * @param {Object} data - ETL 처리된 데이터
   * @param {string} code - 광고주 코드
   * @param {string} companyName - 광고주 상호명
   * @returns {Promise<Workbook>}
   */
  async generate(data, code, companyName) {
    throw new Error("generate 메서드는 하위 클래스에서 구현해야 합니다.");
  }
}

module.exports = BaseReportGenerator;
