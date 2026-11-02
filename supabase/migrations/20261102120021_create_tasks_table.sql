/*
# Create homework and tasks table

1. New Tables
- `tasks`
  - `id` (uuid, primary key)
  - `user_id` (uuid, defaults to the signed-in user, required)
  - `subject_id` (uuid, optional link to one of the user's subjects; cleared if the subject is deleted)
  - `title` (text, required)
  - `due_date` (date, optional deadline)
  - `completed` (boolean, default false)
  - `created_at` (timestamptz)

2. Security
- Row level security is enabled.
- Only the signed-in user can read, add, change, or delete their own tasks.
- Access is granted to the `authenticated` role only.

3. Important notes
- Existing data in other tables is not changed.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_user_due_idx ON tasks (user_id, due_date);
CREATE INDEX IF NOT EXISTS tasks_subject_id_idx ON tasks (subject_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
