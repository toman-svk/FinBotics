const {
    loadFinancialAnalysisData,
    saveFinancialAnalysisData
  } = require('../models/financialAnalysis');


/**
 * GET /api/financial-analysis
 * Returns all financial analysis records
 */
exports.getAll = (req, res) => {
    const records = loadFinancialAnalysisData();
    res.json(records);
  };

/**
 * POST /api/financial-analysis
 * Adds a new record to memory and saves it to JSON file
 */
exports.create = (req, res) => {
    const records = loadFinancialAnalysisData();
    const newRecord = req.body;
  
    // Auto-generate the ID
    if (!newRecord.id) {
      newRecord.id = records.length > 0 ? records[records.length - 1].id + 1 : 1;
    }

    // Calculated fields
    const {
        current_assets, current_liabilities,
        net_income, revenue, total_assets,
        total_liabilities, shareholders_equity
      } = newRecord;

    newRecord.current_ratio = current_assets && current_liabilities
      ? current_assets / current_liabilities
      : undefined;

    newRecord.net_profit_margin = net_income && revenue
      ? net_income / revenue
      : undefined;

    newRecord.roa = net_income && total_assets
      ? net_income / total_assets
      : undefined;

    newRecord.debt_to_equity = total_liabilities && shareholders_equity
      ? total_liabilities / shareholders_equity
      : undefined;

    newRecord.roe = net_income && shareholders_equity
      ? net_income / shareholders_equity
      : undefined;
  
    records.push(newRecord);
    saveFinancialAnalysisData(records);
    res.status(201).json(newRecord);
  };

/**
 * DELETE /api/financial-analysis
 * Removes a record by ID
 */
exports.deleteRecord = (req, res) => {
    const idToDelete = parseInt(req.params.id);
    let data = loadFinancialAnalysisData();
    const newData = data.filter(record => record.id !== idToDelete);
  
    if (newData.length === data.length) {
      return res.status(404).json({ error: 'Record not found' });
    }
  
    saveFinancialAnalysisData(newData);
    res.status(200).json({ message: 'Record deleted' });
  };