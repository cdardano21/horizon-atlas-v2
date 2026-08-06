
const { createServer } = require('http');
const { once } = require('events');
const { URL } = require('url');
const port = 3000;
const server = createServer((req,res)=>{
  const url=new URL(req.url, 'http://127.0.0.1:'+port);
  console.log('REQUEST', url.href);
  res.writeHead(200, {'content-type':'text/plain'});
  res.end('ok');
});
server.listen(port,'127.0.0.1',()=>console.log('listening'));
