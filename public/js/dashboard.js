let allData = [];
let selectedPeriod = "ALL";
let chartInstances = [];


// Fetch data from backend
async function fetchFinancialData() {
  try {
    const response = await fetch('http://localhost:3000/api/financial-analysis');
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
  renderCharts();
});
