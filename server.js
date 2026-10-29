require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Supabase 客户端 ----------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[配置错误] 缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY，请复制 .env.example 为 .env 并填入真实值。'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRIORITIES = ['high', 'medium', 'low'];

// 数据库行 -> 前端任务对象
function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

// 统一错误处理：把 Supabase 常见错误转成清晰的中文提示
function handleError(res, error, context) {
  const code = error && error.code;
  const msg = (error && error.message) || '';

  if (code === '42P01' || msg.includes('does not exist')) {
    return res
      .status(400)
      .json({ error: { message: '任务表不存在，请先在 Supabase SQL Editor 中执行 supabase/schema.sql' } });
  }
  if (code === '42501' || msg.includes('permission denied') || msg.includes('new row violates')) {
    return res
      .status(400)
      .json({ error: { message: '数据库权限不足，请检查 Supabase RLS 策略配置（schema.sql）' } });
  }
  if (code === 'PGRST301' || msg.includes('invalid JWT') || msg.includes('API key')) {
    return res
      .status(400)
      .json({ error: { message: 'Supabase API Key 无效，请检查 SUPABASE_ANON_KEY 配置' } });
  }
  if (msg.includes('Failed to fetch') || msg.includes('ENOTFOUND')) {
    return res
      .status(400)
      .json({ error: { message: '无法连接到 Supabase，请检查 SUPABASE_URL 配置' } });
  }

  console.error(`[${context}]`, error);
  return res.status(500).json({ error: { message: `${context}失败，请稍后重试` } });
}

// ---------- API 路由 ----------

// 获取任务列表（按创建时间倒序，可按优先级筛选）
app.get('/api/tasks', async (req, res) => {
  const { priority } = req.query;
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (priority && PRIORITIES.includes(priority)) {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;
    if (error) return handleError(res, error, '查询任务');
    res.json({ items: (data || []).map(mapTask) });
  } catch (error) {
    handleError(res, error, '查询任务');
  }
});

// 创建任务
app.post('/api/tasks', async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const priority = req.body.priority || 'medium';

  if (!title) {
    return res.status(400).json({ error: { message: '任务标题不能为空' } });
  }
  if (title.length > 255) {
    return res.status(400).json({ error: { message: '任务标题不能超过 255 个字符' } });
  }
  if (!PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: { message: '优先级无效' } });
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, priority })
      .select()
      .single();
    if (error) return handleError(res, error, '创建任务');
    res.status(201).json(mapTask(data));
  } catch (error) {
    handleError(res, error, '创建任务');
  }
});

// 切换完成状态
app.patch('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || (fetchError.message || '').includes('0 rows')) {
        return res.status(404).json({ error: { message: '任务不存在' } });
      }
      return handleError(res, fetchError, '查询任务');
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !existing.completed })
      .eq('id', id)
      .select()
      .single();

    if (error) return handleError(res, error, '更新任务状态');
    res.json(mapTask(data));
  } catch (error) {
    handleError(res, error, '更新任务状态');
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error, count } = await supabase
      .from('tasks')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) return handleError(res, error, '删除任务');
    if (count === 0) {
      return res.status(404).json({ error: { message: '任务不存在' } });
    }
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, '删除任务');
  }
});

// 前端单页应用托管（非 API 路径都返回 index.html）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- 启动 ----------
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`智能任务管理系统已启动: http://localhost:${PORT}`);
  console.log(`API 地址: http://localhost:${PORT}/api/tasks`);
});
