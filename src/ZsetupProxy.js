const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        proxy({
            target: 'http://127.0.0.1:3000',
            changeOrigin: true,
            pathRewrite: {
                '^/api': ''
            },
            filter: function (path, req) {
                return!path.match(/^\/static\/|^\/favicon.ico/) && path.startsWith('/api');
            },
        })
    );
};