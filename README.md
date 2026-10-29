# 智能任务管理系统

基于 **Node.js + Express + Supabase** 的全栈任务管理应用，前后端一体，clone 后配置环境变量即可运行。

## 功能特性

- ✅ 任务添加：输入框 + 优先级下拉（高 / 中 / 低）
- ✅ 任务列表：展示标题、优先级、完成状态
- ✅ 完成状态切换（已完成标题自动加删除线）
- ✅ 任务删除
- ✅ 按优先级筛选（全部 / 高 / 中 / 低）
- ✅ 按创建时间倒序排列（最新在前）
- ✅ 数据持久化到 Supabase PostgreSQL，刷新不丢失
- ✅ 中文界面，简洁美观

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | 原生 HTML / CSS / JavaScript（零构建，轻量易读） |
| 后端 | Node.js + Express |
| 数据库 | Supabase PostgreSQL（通过 `@supabase/supabase-js` 直连） |

## 快速开始

### 前置要求

- Node.js >= 18
- npm
- 一个 Supabase 项目（免费即可）

### 1. 安装依赖

```bash
npm install
```

### 2. 创建数据库表

打开 Supabase Dashboard → **SQL Editor**，执行 `supabase/schema.sql`（包含建表、索引、启用 RLS 并放开 anon 读写权限）。

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 Supabase 项目信息：

```
SUPABASE_URL=https://你的项目引用.supabase.co/
SUPABASE_ANON_KEY=你的anon公钥
```

> 从哪里获取：Supabase Dashboard → Project Settings → API。

### 4. 启动服务

```bash
npm start
```

- 前端页面：http://localhost:3000
- API 地址：http://localhost:3000/api/tasks

开发模式（改代码自动重启）：

```bash
npm run dev
```

## 项目结构

```
.
├── server.js              # Express 后端 + Supabase 数据层 + 静态托管
├── package.json
├── .env.example           # 环境变量模板
├── public/                # 前端页面（零构建）
│   ├── index.html         # 页面结构
│   ├── style.css          # 样式
│   └── app.js             # 前端逻辑（调用后端 API）
└── supabase/
    └── schema.sql         # 建表 + 索引 + RLS 策略
```

## API 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/tasks?priority=high` | 获取任务列表（按创建时间倒序，可按优先级筛选） |
| POST | `/api/tasks` | 创建任务 `{ title, priority }` |
| PATCH | `/api/tasks/:id/toggle` | 切换完成状态 |
| DELETE | `/api/tasks/:id` | 删除任务 |

## 数据库表结构

表名：`tasks`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键，自动生成 |
| title | VARCHAR(255) | 任务标题，非空 |
| priority | VARCHAR(20) | 优先级：high / medium / low |
| completed | BOOLEAN | 是否完成，默认 false |
| created_at | TIMESTAMPTZ | 创建时间，自动填充 |

完整建表 SQL 见 `supabase/schema.sql`。

## License

MIT
