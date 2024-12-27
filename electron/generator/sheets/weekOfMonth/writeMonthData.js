const reportConfig = require("../../config/reportConfig.js");

const writeMonthData = (worksheet, data, offset, platform, reportType) => {
  const columns =
    reportConfig[platform][reportType].mappings.daySheet.dayDataColumns;

  for (let i = 0; i < 6; i++) {
    if (!data[i]) continue;
    worksheet.cell(`${columns[0]}${offset + i}`).value(data[i]?.impressions);
    worksheet.cell(`${columns[1]}${offset + i}`).value(data[i]?.clicks);
    worksheet.cell(`${columns[2]}${offset + i}`).value(data[i]?.adCost);
    worksheet.cell(`${columns[3]}${offset + i}`).value(data[i]?.conversion);
    worksheet
      .cell(`${columns[4]}${offset + i}`)
      .value(data[i]?.conversionRevenue);
    worksheet
      .cell(`${columns[5]}${offset + i}`)
      .value(
        `${data[i]?.week} (${data[i]?.month} ${data[i]?.weekStart} ~ ${data[i]?.weekEnd})`
      );
    worksheet.cell(`${columns[6]}${offset + i}`).value(data[i]?.numberOfDays);
  }
};

module.exports = writeMonthData;
