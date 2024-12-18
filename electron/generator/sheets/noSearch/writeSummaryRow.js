/**
 * 합계 데이터를 작성하는 함수
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {number} summaryRow - 합계를 작성할 행 번호
 * @param {Array} totals - 합계 데이터 배열
 */
const writeSummaryRow = (worksheet, summaryRow, totals) => {
  worksheet.cell(`D${summaryRow}`).value("합계");
  worksheet.cell(`F${summaryRow}`).value(totals[1].impressions); // 노출수
  worksheet.cell(`G${summaryRow}`).value(totals[0].impressions); // 전주 노출수
  worksheet.cell(`H${summaryRow}`).value(totals[1].clicks); // 클릭수
  worksheet.cell(`I${summaryRow}`).value(totals[0].clicks); // 전주 클릭수
  worksheet.cell(`N${summaryRow}`).value(totals[1].adCost); // 광고비
  worksheet.cell(`O${summaryRow}`).value(totals[0].adCost); // 전주 광고비
  worksheet.cell(`P${summaryRow}`).value(totals[1].conversion); // 총 판매수량(1일)
  worksheet.cell(`Q${summaryRow}`).value(totals[0].conversion); // 전주 총 판매수량(1일)
  worksheet.cell(`T${summaryRow}`).value(totals[1].conversionRevenue); // 총 전환매출액(1일)
  worksheet.cell(`U${summaryRow}`).value(totals[0].conversionRevenue); // 전주 총 전환매출액(1일)
  worksheet.cell(`J${summaryRow}`).style("numberFormat", "0.0%");
  worksheet.cell(`K${summaryRow}`).style("numberFormat", "0.0%");
  console.log("합계 작성 완료!");
};

module.exports = writeSummaryRow;
