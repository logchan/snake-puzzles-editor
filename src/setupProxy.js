const { createProxyMiddleware } = require("http-proxy-middleware");

const upstream = "http://127.0.0.1:5000/api";

module.exports = function (app) {
  app.use("/api", createProxyMiddleware({
    target: upstream,
    changeOrigin: false,
  }));
};
