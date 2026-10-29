// Vercel Serverless 入口：把所有请求交给 Express app 统一处理
// （前端静态托管 + API + SPA 兜底都在 app.js 内完成）
const app = require('../app');

module.exports = app;
