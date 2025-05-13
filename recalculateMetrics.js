const { loadFinancialAnalysisData, saveFinancialAnalysisData } = require('./src/models/financialAnalysis');

function recalculateMetrics(record) {
  const {
    current_assets, current_liabilities,
    net_income, revenue, total_assets,
    total_liabilities, shareholders_equity
  } = record;

  return {
    ...record,
    current_ratio: current_assets && current_liabilities
      ? current_assets / current_liabilities
      : undefined,

    net_profit_margin: net_income && revenue
      ? net_income / revenue
      : undefined,

    roa: net_income && total_assets
      ? net_income / total_assets
      : undefined,

    debt_to_equity: total_liabilities && shareholders_equity
      ? total_liabilities / shareholders_equity
      : undefined,

    roe: net_income && shareholders_equity
      ? net_income / shareholders_equity
      : undefined
  };
}

function main() {
  const records = loadFinancialAnalysisData();
  const updated = records.map(recalculateMetrics);
  saveFinancialAnalysisData(updated);
  console.log("✅ All records recalculated and saved.");
}

main();
