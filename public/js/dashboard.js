let allData = [];
let selectedPeriod = "ALL";
let chartInstances = [];


function renderKPIView(data) {
  if (data.length === 0) return;

  const latest = data[data.length - 1]; // Use most recent data point
  const euro = n => parseFloat(n).toLocaleString('en-CH');

  document.getElementById("kpi-current-assets").textContent = euro(latest.current_assets);
  document.getElementById("kpi-current-liabilities").textContent = euro(latest.current_liabilities);
  document.getElementById("kpi-current-ratio").textContent = latest.current_ratio.toFixed(2);

  document.getElementById("kpi-revenue").textContent = euro(latest.revenue);
  document.getElementById("kpi-net-income").textContent = euro(latest.net_income);
  document.getElementById("kpi-net-margin").textContent = (latest.net_profit_margin * 100).toFixed(1);

  document.getElementById("kpi-equity").textContent = euro(latest.shareholders_equity || latest.total_assets - latest.total_liabilities);
  document.getElementById("kpi-liabilities").textContent = euro(latest.total_liabilities);
  const debtEquity = latest.total_liabilities / (latest.shareholders_equity || (latest.total_assets - latest.total_liabilities));
  document.getElementById("kpi-debt-equity").textContent = debtEquity.toFixed(2);

  document.getElementById("kpi-total-assets").textContent = euro(latest.total_assets);
  document.getElementById("kpi-roa").textContent = (latest.roa * 100).toFixed(1);
  document.getElementById("kpi-roe").textContent = (latest.roe * 100).toFixed(1);

  // Fake financial health for demo (can be improved)
  const healthScore = Math.min(100, Math.round((latest.current_ratio + latest.roa * 100 + latest.roe * 100) / 3));
  document.getElementById("kpi-health").textContent = `${healthScore}%`;
}


// Fetch data from backend
async function fetchFinancialData() {
  try {
    const response = await fetch('/api/financial-analysis');
    if (!response.ok) throw new Error('Failed to fetch data');
    allData = await response.json();
    return allData;
  } catch (err) {
    console.error("❌ Fetch error:", err);
    return [];
  }
}

// Convert month name to number index
function getMonthIndex(monthName) {
  return {
    January: 0, February: 1, March: 2,
    April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8,
    October: 9, November: 10, December: 11
  }[monthName];
}

// Filter data based on period
function filterData(data, period) {
  const now = new Date();
  return data.filter(item => {
    const itemDate = new Date(item.period.year, getMonthIndex(item.period.month));
    if (period === "MTD") {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } else if (period === "YTD") {
      return itemDate.getFullYear() === now.getFullYear();
    } else if (period === "1Y") {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return itemDate >= oneYearAgo;
    }
    return true; // ALL
  });
}

// Render all 4 charts
async function renderCharts() {

    chartInstances.forEach(chart => chart.destroy());
    chartInstances = [];
    
    const data = filterData(allData, selectedPeriod);
    renderKPIView(data); // 🔹 Update KPI view on every change

    // Sort data chronologically
    data.sort((a, b) => new Date(a.period.year, getMonthIndex(a.period.month)) - new Date(b.period.year, getMonthIndex(b.period.month)));

    // old const labels = data.map(item => `${item.period.month} ${item.period.year}`);
    const labels = data.map(item => {
        const monthAbbr = item.period.month.slice(0, 3); // "Jan", "Feb", ...
        const yearShort = item.period.year.toString().slice(-2); // "23"
        return `${monthAbbr} ${yearShort}`; // "Jan 23"
      });

    const revenue = data.map(item => item.revenue);
    const netIncome = data.map(item => item.net_income);
    const netProfitMargin = data.map(item => item.net_profit_margin * 100);

    const currentAssets = data.map(item => item.current_assets);
    const currentLiabilities = data.map(item => item.current_liabilities);
    const currentRatio = data.map(item => item.current_ratio);

    const totalAssets = data.map(item => item.total_assets);
    const roa = data.map(item => item.roa * 100);

    const totalLiabilities = data.map(item => item.total_liabilities);
    const roe = data.map(item => item.roe * 100);

    

    const configs = [
        {
        canvasId: 'chart1',
        title: 'Revenue, Net Income, Net Profit Margin',
        datasets: [
            { label: 'Revenue', data: revenue, yAxisID: 'y' },
            { label: 'Net Income', data: netIncome, yAxisID: 'y' },
            { label: 'Net Profit Margin (%)', data: netProfitMargin, yAxisID: 'y1' }
        ]
        },
        {
        canvasId: 'chart2',
        title: 'Current Assets, Current Liabilities, Current Ratio',
        datasets: [
            { label: 'Current Assets', data: currentAssets, yAxisID: 'y' },
            { label: 'Current Liabilities', data: currentLiabilities, yAxisID: 'y' },
            { label: 'Current Ratio', data: currentRatio, yAxisID: 'y1' }
        ]
        },
        {
        canvasId: 'chart3',
        title: 'Total Assets, Net Income, ROA',
        datasets: [
            { label: 'Total Assets', data: totalAssets, yAxisID: 'y' },
            { label: 'Net Income', data: netIncome, yAxisID: 'y' },
            { label: 'ROA (%)', data: roa, yAxisID: 'y1' }
        ]
        },
        {
        canvasId: 'chart4',
        title: 'Total Liabilities, Net Income, ROE',
        datasets: [
            { label: 'Total Liabilities', data: totalLiabilities, yAxisID: 'y' },
            { label: 'Net Income', data: netIncome, yAxisID: 'y' },
            { label: 'ROE (%)', data: roe, yAxisID: 'y1' }
        ]
        }
    ];

    configs.forEach(config => {
        const ctx = document.getElementById(config.canvasId).getContext('2d');
        const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: config.datasets
        },
        options: {
            responsive: true,
            interaction: {
            mode: 'index',
            intersect: false
            },
            stacked: false,
            plugins: {
            title: {
                display: false,
                text: config.title
            },
            tooltip: {
                callbacks: {
                label: function (context) {
                    const value = context.parsed.y;
                    return context.dataset.label + ': ' + (context.dataset.label.includes('%') || context.dataset.label.includes('Ratio') ? value.toFixed(2) + '%' : value.toLocaleString('en-CH'));
                }
                }
            }
            },
            scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                drawOnChartArea: false
                }
            },
            x: {
                ticks: {
                  autoSkip: false, // Let us control manually
                  callback: function(value, index, ticks) {
                    return index % 3 === 0 ? this.getLabelForValue(value) : '';
                  }
                }
              }
              
            }
        }
        
        });
        chartInstances.push(newChart);
    });

}

// Add this for view switching
function setupViewToggle() {
  const chartBtn = document.getElementById("chartViewBtn");
  const kpiBtn = document.getElementById("kpiViewBtn");

  chartBtn.addEventListener("click", () => {
    chartBtn.classList.add("active");
    kpiBtn.classList.remove("active");
    document.getElementById("chart-view").style.display = "grid";
    document.getElementById("kpi-view").style.display = "none";
  });

  kpiBtn.addEventListener("click", () => {
    kpiBtn.classList.add("active");
    chartBtn.classList.remove("active");
    document.getElementById("chart-view").style.display = "none";
    document.getElementById("kpi-view").style.display = "block";
  });
}


// Setup the period filter buttons
function setupPeriodButtons() {
  const buttons = document.querySelectorAll('.period-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPeriod = btn.dataset.period;
      renderCharts();
    });
  });
}

// Init on page load
window.addEventListener('DOMContentLoaded', async () => {
  await fetchFinancialData();
  setupPeriodButtons();
  setupViewToggle();
  renderCharts();
});