const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理 /api 开头的请求
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // 保留 /api 前缀
      },
    })
  );

  // 代理所有其他请求到后端
  app.use(
    '/',
    createProxyMiddleware({
      target: 'http://127.0.0.1:3000',
      changeOrigin: true,
      filter: function (path, req) {
        // 排除对静态资源的代理
        return !path.match(/^\/static\/|^\/favicon.ico/);
      },
    })
  );
};