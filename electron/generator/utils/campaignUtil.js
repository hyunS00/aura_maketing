/**
 * 캠페인 데이터를 워크시트에 작성하는 함수
 * @param {object} worksheet - XlsxPopulate 워크시트 객체
 * @param {object} record - 캠페인 데이터
 * @param {number} rowIndex - 데이터 작성 행
 */
const writeCampaignData = (worksheet, record, rowIndex, reportType) => {
  worksheet.cell(`C${rowIndex}`).value(record.campaign); // 캠페인명
  worksheet.cell(`D${rowIndex}`).value(record.type); // 캠페인 타입
  worksheet.cell(`E${rowIndex}`).value(record[reportType][1]?.impressions || 0); // 노출수
  worksheet.cell(`F${rowIndex}`).value(record[reportType][0]?.impressions || 0); // 전주 노출수
  worksheet.cell(`G${rowIndex}`).value(record[reportType][1]?.clicks || 0); // 클릭수
  worksheet.cell(`H${rowIndex}`).value(record[reportType][0]?.clicks || 0); // 전주 클릭수
  worksheet.cell(`M${rowIndex}`).value(record[reportType][1]?.adCost || 0); // 광고비
  worksheet.cell(`N${rowIndex}`).value(record[reportType][0]?.adCost || 0); // 전주 광고비
  worksheet.cell(`O${rowIndex}`).value(record[reportType][1]?.conversion || 0); // 총 판매수량(1일)
  worksheet.cell(`P${rowIndex}`).value(record[reportType][0]?.conversion || 0); // 전주 총 판매수량(1일)
  worksheet
    .cell(`S${rowIndex}`)
    .value(record[reportType][1]?.conversionRevenue || 0); // 총 전환매출액(1일)
  worksheet
    .cell(`T${rowIndex}`)
    .value(record[reportType][0]?.conversionRevenue || 0); // 전주 총 전환매출액(1일)
  worksheet.cell(`I${rowIndex}`).style("numberFormat", "0.0%");
  worksheet.cell(`J${rowIndex}`).style("numberFormat", "0.0%");
};

module.exports = writeCampaignData;
