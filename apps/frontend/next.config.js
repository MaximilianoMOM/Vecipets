const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
  const development = phase === PHASE_DEVELOPMENT_SERVER;
  const sameOrigin = process.env.NEXT_PUBLIC_API_USE_PROXY === 'true';

  return {
    ...(development && { distDir: '.next-dev' }),
    async rewrites() {
      if (!development && !sameOrigin) return [];

      const backend = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      if (!sameOrigin) {
        if (!['localhost', '127.0.0.1'].includes(backend.hostname)) return [];
        backend.hostname = '127.0.0.1';
      }

      const path = backend.pathname.replace(/\/+$/, '');
      const prefix = path.endsWith('/api/v1') ? path : `${path}/api/v1`;
      return [{
        source: sameOrigin ? '/api/v1/:path*' : '/api/vecipets/:path*',
        destination: `${backend.origin}${prefix}/:path*`,
      }];
    },
  };
};
