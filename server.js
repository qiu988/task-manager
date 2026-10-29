// 本地启动入口：node server.js
const app = require('./app');

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`智能任务管理系统已启动: http://localhost:${PORT}`);
  console.log(`API 地址: http://localhost:${PORT}/api/tasks`);
});
