var fs = require('fs')
var httpProxy = require('http-proxy');
var https = require('https');


var server = httpProxy.createServer({
    target: {
      host: 'localhost',
      port: 3000
    },
    ssl: {
      key: fs.readFileSync('.certs/localhost-key.pem', 'utf8'),
      cert: fs.readFileSync('.certs/localhost.pem', 'utf8')
    },
    ws : true
  })

server.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head);
});

server.listen(3001);

console.log("Created https proxy on https://localhost:3001 from http://localhost:3000");