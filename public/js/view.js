function getQuarter(month) {
  const map = {
    January: "Q1", February: "Q1", March: "Q1",
    April: "Q2", May: "Q2", June: "Q2",
    July: "Q3", August: "Q3", September: "Q3",
    October: "Q4", November: "Q4", December: "Q4"
  };
  return map[month] || "";
};

function formatNumber(value) {
  if (typeof value !== 'number') return '—';
  return value.toLocaleString('en-CH', { maximumFractionDigits: 0 });
}

function formatNumberTwoDecimals(value) {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return value.toLocaleString('en-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercentage(value) {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return (value * 100).toFixed(0) + '%';
}


function loadRecords() {
  console.log("🔁 loadRecords() triggered");
  fetch('http://localhost:3000/api/financial-analysis')
    .then(res => res.json())
    .then(data => {
      const tableBody = document.querySelector('#data-body');
      if (!tableBody) {
        console.error("⚠️ Could not find the table body element!");
        return;
      }
      tableBody.innerHTML = ""; // Clear table before re-rendering

      data.forEach(record => {
        console.log("🔍 Rendering record:", record);

        const period = record.period 
          ? `${record.period.month} ${record.period.year} (${record.period.quarter})` 
          : '—';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td><button class="delete-button" data-id="${record.id}">🗑️</button></td>
          <td>${record.id}</td>
          <td>${period}</td>
          <td>${record.company_size ?? '—'}</td>
          <td>${record.company_industry ?? '—'}</td>
          <td>${formatNumber(record.current_assets)}</td>
          <td>${formatNumber(record.total_assets)}</td>
          <td>${formatNumber(record.current_liabilities)}</td>
          <td>${formatNumber(record.total_liabilities)}</td>
          <td>${formatNumber(record.shareholders_equity)}</td>
          <td>${formatNumber(record.revenue)}</td>
          <td>${formatNumber(record.net_income)}</td>
          <td>${formatNumberTwoDecimals(record.current_ratio)}</td>
          <td>${formatPercentage(record.net_profit_margin)}</td>
          <td>${formatPercentage(record.roa)}</td>
          <td>${formatNumberTwoDecimals(record.debt_to_equity)}</td>
          <td>${formatPercentage(record.roe)}</td>
          <td>${formatNumber(record.financial_health)}</td>
          <td>${record.is_validated ? '✅' : '—'}</td>
        `;
        tableBody.appendChild(row);
      });

      bindDeleteButtons(); // Re-attach delete buttons to fresh rows
    })
    .catch(err => console.error('Error loading data:', err));
};

function bindDeleteButtons() {
  const buttons = document.querySelectorAll('.delete-button');
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const confirmed = confirm("Are you sure you want to delete this record?");
      if (!confirmed) return;

      try {
        const res = await fetch(`http://localhost:3000/api/financial-analysis/${id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(error);
        }

        console.log("✅ Record deleted");
        loadRecords(); // Refresh the table after deletion
      } catch (err) {
        console.error("❌ Delete failed:", err);
        alert("Error deleting record");
      }
    });
  });
};

async function importData(form) {
    console.log('clicked the button successfully')
    const newRecord = {
      company_size: form.company_size.value,
      company_industry: form.company_industry.value,
      period: {
        year: form.year.value,
        month: form.month.value,
        quarter: getQuarter(form.month.value)
      },
      current_assets: parseFloat(form.current_assets.value),
      total_assets: parseFloat(form.total_assets.value),
      current_liabilities: parseFloat(form.current_liabilities.value),
      total_liabilities: parseFloat(form.total_liabilities.value),
      shareholders_equity: parseFloat(form.shareholders_equity.value),
      revenue: parseFloat(form.revenue.value),
      net_income: parseFloat(form.net_income.value)
    };
  
    try {
      const res = await fetch('http://localhost:3000/api/financial-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecord)
      });
  
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
  
      console.log("✅ Record successfully added");
      document.getElementById('importModal').classList.add('hidden');
      form.reset();
      loadRecords(); // Refresh the table
  
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("Failed to import record.");
    }
};

function setupDeleteListeners() {
  // Nothing here for now; bindDeleteButtons() already works when called inside loadRecords
};

function setupImportModal() {
  // Open modal
  document.querySelectorAll('a, button').forEach(el => {
    if (el.textContent.trim() === 'Import') {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('importModal').classList.remove('hidden');
      });
    }
  });

  // Close modal
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('importModal').classList.add('hidden');
    });
  }
};

function setupFormSubmission() {
  const submitBtn = document.getElementById('submitButton');
  const form = document.getElementById('importForm');

  if (!submitBtn || !form) {
    console.warn("⚠️ submitButton or importForm not found in DOM!");
    return;
  }

  console.log("✅ Found submitButton and form");

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log("🚀 Submit button clicked");

    await importData(form);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('initial load ✅')
  loadRecords(); // ✅ initial load
  setupDeleteListeners();
  setupImportModal();
  setupFormSubmission();
});