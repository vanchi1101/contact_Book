// index.js
const express = require('express');
const app = express();
const port = 3000;

// route cơ bản
app.get('/', (req, res) => {
  res.send('Hello Node.js!');
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
