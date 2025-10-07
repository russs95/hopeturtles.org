const http = require('http');
const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(path.join(__dirname, 'index.html'));

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(index);
});

// Listen on port 80 for http://<ip>/
server.listen(3000, '127.0.0.1', () => {
  console.log('Landing page listening on http://127.0.0.1:3000');
});
