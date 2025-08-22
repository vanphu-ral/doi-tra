function setupProxy({ tls }) {
  const conf = [
    {
      context: ['/api', '/services', '/management', '/v3/api-docs', '/h2-console', '/oauth2', '/login', '/auth', '/health'],
      target: `http${tls ? 's' : ''}://localhost:8086`,
      secure: false,
      changeOrigin: tls,
    },
    {
      context: ['/graphql'],
      target: 'http://192.168.68.61:8081',
      secure: false,
      changeOrigin: true,
    },
  ];
  return conf;
}

module.exports = setupProxy;
