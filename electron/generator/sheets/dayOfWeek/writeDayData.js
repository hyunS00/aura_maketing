const reportConfig = require("../../config/reportConfig.js");

const writeDayData = (worksheet, data, offset, platform, reportType) => {
  const columns =
    reportConfig[platform][reportType].mappings.daySheet.dayDataColumns;
  console.log(data);

  for (let i = 0; i < 7; i++) {
    worksheet.cell(`${columns[0]}${offset + i}`).value(data[i]?.impressions);
    worksheet.cell(`${columns[1]}${offset + i}`).value(data[i]?.clicks);
    worksheet.cell(`${columns[2]}${offset + i}`).value(data[i]?.adCost);
    worksheet.cell(`${columns[3]}${offset + i}`).value(data[i]?.conversion);
    worksheet
      .cell(`${columns[4]}${offset + i}`)
      .value(data[i].conversionRevenue);
  }
};

module.exports = writeDayData;
