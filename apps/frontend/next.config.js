const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig} */
const developmentConfig = {
  distDir: '.next-dev',
  async rewrites() {
    const backend = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
    if (!['localhost', '127.0.0.1'].includes(backend.hostname)) return [];

    backend.hostname = '127.0.0.1';
    const path = backend.pathname.replace(/\/+$/, '');
    const prefix = path.endsWith('/api/v1') ? path : `${path}/api/v1`;
    return [{
      source: '/api/vecipets/:path*',
      destination: `${backend.origin}${prefix}/:path*`,
    }];
  },
};

module.exports = (phase) =>
  phase === PHASE_DEVELOPMENT_SERVER ? developmentConfig : {};
