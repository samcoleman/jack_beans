var fs = require('fs')
var httpProxy = require('http-proxy');
var https = require('https');


httpProxy.createServer({
    target: {
      host: 'localhost',
      port: 3000
    },
    ssl: {
      key: fs.readFileSync('.certs/localhost-key.pem', 'utf8'),
      cert: fs.readFileSync('.certs/localhost.pem', 'utf8')
    }
  }).listen(3001);

console.log("Created https proxy on https://localhost:3001 from http://localhost:3000");