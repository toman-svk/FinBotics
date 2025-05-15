let allData = [];
let selectedPeriod = "ALL";
let chartInstances = [];


function renderKPIView(data) {
  if (data.length === 0) return;

  const euro = n => parseFloat(n).toLocaleString('en-CH');
  const sum = (arr, fn) => arr.reduce((acc, cur) => acc + fn(cur), 0);
  const avg = (arr, fn) => arr.length ? sum(arr, fn) / arr.length : 0;

  // Averages across period
  const avgRevenue = avg(data, d => d.revenue);
  const avgNetIncome = avg(data, d => d.net_income);
  const avgNetMargin = avg(data, d => d.net_profit_margin) * 100;

  const avgCurrentAssets = avg(data, d => d.current_assets);
  const avgCurrentLiabilities = avg(data, d => d.current_liabilities);
  const avgCurrentRatio = avg(data, d => d.current_ratio);

  const avgTotalAssets = avg(data, d => d.total_assets);
  const avgROA = avg(data, d => d.roa) * 100;
  const avgROE = avg(data, d => d.roe) * 100;

  const avgEquity = avg(data, d => d.shareholders_equity || (d.total_assets - d.total_liabilities));
  const avgLiabilities = avg(data, d => d.total_liabilities);
  const avgDebtToEquity = avgEquity !== 0 ? avgLiabilities / avgEquity : 0;

  // DOM Updates
  document.getElementById("kpi-revenue").textContent = euro(avgRevenue);
  document.getElementById("kpi-net-income").textContent = euro(avgNetIncome);
  document.getElementById("kpi-net-margin").textContent = avgNetMargin.toFixed(1);

  document.getElementById("kpi-current-assets").textContent = euro(avgCurrentAssets);
  document.getElementById("kpi-current-liabilities").textContent = euro(avgCurrentLiabilities);
  document.getElementById("kpi-current-ratio").textContent = avgCurrentRatio.toFixed(2);

  document.getElementById("kpi-total-assets").textContent = euro(avgTotalAssets);
  document.getElementById("kpi-roa").textContent = avgROA.toFixed(1);
  document.getElementById("kpi-roe").textContent = avgROE.toFixed(1);

  document.getElementById("kpi-shareholders-equity").textContent = euro(avgEquity);
  document.getElementById("kpi-total-liabilities").textContent = euro(avgLiabilities);
  document.getElementById("kpi-debt-to-equity").textContent = avgDebtToEquity.toFixed(2);


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
async function renderCharts(data) {

    chartInstances.forEach(chart => chart.destroy());
    chartInstances = [];
    
    // Sort data chronologically
    data.sort((a, b) => new Date(a.period.year, getMonthIndex(a.period.month)) - new Date(b.period.year, getMonthIndex(b.period.month)));

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

function setupViewToggle() {
  const chartViewBtn = document.getElementById("chartViewBtn");
  const kpiViewBtn = document.getElementById("kpiViewBtn");
  const dashboard = document.querySelector(".dashboard-grid");

  chartViewBtn.addEventListener("click", () => {
    dashboard.classList.add("show-graph");
    dashboard.classList.remove("show-kpi");
    chartViewBtn.classList.add("active");
    kpiViewBtn.classList.remove("active");
  });

  kpiViewBtn.addEventListener("click", () => {
    dashboard.classList.add("show-kpi");
    dashboard.classList.remove("show-graph");
    kpiViewBtn.classList.add("active");
    chartViewBtn.classList.remove("active");
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
      renderAllData();
    });
  });
}


function renderAllData() {
  const data = filterData(allData, selectedPeriod);
  renderCharts(data);
  renderKPIView(data);

  

}

// Init on page load
window.addEventListener('DOMContentLoaded', async () => {
  await fetchFinancialData();
  setupPeriodButtons();
  setupViewToggle();
  document.querySelector('.dashboard-grid').classList.add('show-graph');
  document.getElementById("kpi-health").textContent = "95%";
  renderAllData();
});