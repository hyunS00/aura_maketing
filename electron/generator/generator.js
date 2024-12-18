const processInput = require("./input/dataInputProcessor.js");
const ETLProcess = require("./dataProcessing/ETLProcess.js");
const ReportGeneratorFactory = require("./reportGeneration/ReportGeneratorFactory.js");

const mapReportType = {
  weekly: "주간",
  monthly: "월간",
};

const mapPlatform = {
  coupang: "쿠팡",
};

class Generator {
  /**
   * 보고서 변환 함수
   * @param {string} filePath - 업로드된 파일의 ArrayBuffer
   * @param {string} code - 광고 코드
   * @param {string} companyName - 광고주 명
   * @param {string} platform - 플랫폼 이름
   * @param {string} reportType - 보고서 유형 (weekly, monthly)
   */
  async generateReport(filePath, code, companyName, platform, reportType) {
    try {
      const inputFormat = "excel"; // 입력 데이터 포맷
      const templatePath = `templates/${platform}${reportType}Template.xlsx`;
      const outputFileName = `${companyName} ${mapReportType[reportType]} ${mapPlatform[platform]} 광고성과 보고서.xlsx`;

      // 1. 입력 데이터 처리
      const rawData = await processInput(
        platform,
        reportType,
        inputFormat,
        filePath
      );

      // 2. 데이터 처리 (ETL)
      const etlProcess = new ETLProcess(reportType, platform);
      const aggregatedData = await etlProcess.run(rawData);

      // 3. 리포트 생성
      const reportGenerator = ReportGeneratorFactory.createReportGenerator(
        platform,
        reportType
      );
      const filledWorkbook = await reportGenerator.generate(
        aggregatedData,
        code,
        companyName
      );

      return filledWorkbook;
    } catch (error) {
      console.error("에러 발생:", error);
      throw error;
    }
  }

  async downloadReport(workbook, outputFilePath) {
    try {
      await workbook.toFileAsync(outputFilePath);
      return "success";
    } catch (error) {
      console.error("파일 저장중 에러", error);
      throw error;
    }
  }
}

module.exports = Generator;
