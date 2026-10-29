-- ==========================================
-- 智能任务管理系统 - Supabase 数据库 Schema
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ==========================================

-- 1. 创建 tasks 表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- 3. 启用行级安全 (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 4. 给 anon 角色放开 SELECT / INSERT / UPDATE / DELETE 权限
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks
  FOR DELETE TO anon
  USING (true);

-- ==========================================
-- 说明：以上 RLS 策略允许 anon 角色全部操作，适用于开发初期和公开场景。
-- 如需用户级数据隔离，可将策略改为基于 auth.uid() 的写法，例如：
--
--   ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);
--   CREATE POLICY "user_tasks" ON tasks FOR ALL TO authenticated
--     USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- ==========================================
