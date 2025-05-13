// financialAnalysis.js

/**
 * @typedef {Object} Period
 * @property {number} year
 * @property {string} month     // e.g. "March"
 * @property {string} quarter   // e.g. "Q1"
 */

/**
 * @typedef {Object} FinancialAnalysis
 * @property {number} id
 * @property {Period} period
 * @property {number} current_assets
 * @property {number} current_liabilities
 * @property {number} revenue
 * @property {number} net_income
 * @property {number} total_assets
 * @property {number} total_liabilities
 * @property {number} shareholders_equity
 * @property {boolean} is_validated
 * @property {string} company_size
 * @property {string} company_industry
 * @property {number} current_ratio
 * @property {number} net_profit_margin
 * @property {number} roa
 * @property {number} debt_to_equity
 * @property {number} roe
 * @property {number} financial_health
 */


const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'data', 'financialAnalysis.json');

/**
 * Load all financial analysis records from JSON file.
 * @returns {FinancialAnalysis[]}
 */
function loadFinancialAnalysisData() {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Error loading financial analysis data:', err);
    return [];
  }
}

/**
 * Save records array to JSON file.
 * @param {FinancialAnalysis[]} data
 */
function saveFinancialAnalysisData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving financial analysis data:', err);
  }
}

module.exports = {
  loadFinancialAnalysisData,
  saveFinancialAnalysisData
};
  