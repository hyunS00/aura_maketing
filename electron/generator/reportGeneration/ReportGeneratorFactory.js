const CoupangReportGenerator = require("./coupangReportGenerator.js");
// const NaverReportGenerator = require ("./naverReportGenerator");
// const BaseReportGenerator = require ("./BaseReportGenerator");
/**
 * 보고서 생성기 팩토리 클래스
 */
class ReportGeneratorFactory {
  /**
   * 플랫폼과 보고서 유형에 맞는 보고서 생성기 인스턴스 반환
   * @param {string} platform - 플랫폼 이름
   * @param {string} reportType - 보고서 유형
   * @returns {BaseReportGenerator}
   */
  static createReportGenerator(platform, reportType) {
    switch (platform.toLowerCase()) {
      case "coupang":
        return new CoupangReportGenerator(reportType);
      // case "naver":
      // return new NaverReportGenerator(reportType);
      default:
        throw new Error(`지원되지 않는 플랫폼: ${platform}`);
    }
  }
}

module.exports = ReportGeneratorFactory;
