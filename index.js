const express = require('express');
const path = require('path');
const open = require('open').default;
const PORT = process.env.PORT || 3000;

const app = express();

// Enable JSON parsing
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));



// Register API routes
const financialAnalysisRoutes = require('./src/routes/financialAnalysisRoutes');
app.use('/api/financial-analysis', financialAnalysisRoutes);


app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`FinBotics running at ${url}`);
  open(url);  // Open in default browser
});