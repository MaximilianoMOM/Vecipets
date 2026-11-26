const http = require('node:http');

function createRelay({ apiPort = 4001, wompiPort = 4002 } = {}) {
  return http.createServer((incoming, outgoing) => {
    const path = incoming.url.split('?', 1)[0];
    let port;

    if (incoming.method === 'GET' && path === '/api/v1/auth/google/callback') {
      port = apiPort;
      console.info('Google OAuth callback recibido');
    } else if (incoming.method === 'POST' && path === '/api/v1/pagos/wompi/webhook') {
      port = wompiPort;
    } else {
      outgoing.writeHead(404).end();
      return;
    }

    const forward = http.request({
      hostname: '127.0.0.1',
      port,
      method: incoming.method,
      path: incoming.url,
      headers: incoming.headers,
    }, (response) => {
      outgoing.writeHead(response.statusCode, response.headers);
      response.pipe(outgoing);
    });

    forward.on('error', () => {
      if (!outgoing.headersSent) outgoing.writeHead(502).end();
      else outgoing.destroy();
    });
    outgoing.on('close', () => forward.destroy());
    incoming.pipe(forward);
  });
}

if (require.main === module) {
  for (const host of ['127.0.0.1', '::1']) {
    createRelay().listen({ host, port: 4000, ipv6Only: true });
  }
}

module.exports = { createRelay };
