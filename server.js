const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Lindberg Pinheiro Server</h1><p>The server is running.</p>');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
