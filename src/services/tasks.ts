import { supabase } from '@/lib/supabase';
import type { Task } from '@/types/study';

export type TaskInput = {
  title: string;
  subject_id: string | null;
  due_date: string | null;
};

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, subject_id, title, due_date, completed, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Task[];
}

export async function createTask(input: TaskInput): Promise<void> {
  const { error } = await supabase.from('tasks').insert(input);
  if (error) throw error;
}

export async function updateTask(id: string, changes: Partial<TaskInput & { completed: boolean }>): Promise<void> {
  const { error } = await supabase.from('tasks').update(changes).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}
