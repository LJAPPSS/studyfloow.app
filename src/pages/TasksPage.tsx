import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Check, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStudyData } from '@/contexts/StudyDataContext';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { SUBJECT_COLORS } from '@/lib/constants';
import { toUserMessage } from '@/lib/errors';
import { formatShortDate, todayIso } from '@/lib/format';
import { deleteTask, listTasks, updateTask } from '@/services/tasks';
import type { Task } from '@/types/study';

function compareTasks(a: Task, b: Task): number {
  if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
  if (a.due_date) return -1;
  if (b.due_date) return 1;
  return b.created_at.localeCompare(a.created_at);
}

export function TasksPage() {
  const { data } = useStudyData();
  const { show } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const subjectById = useMemo(() => new Map(data.subjects.map((subject) => [subject.id, subject])), [data.subjects]);

  const loadTasks = useCallback(async () => {
    setLoadError(null);
    try {
      setTasks(await listTasks());
    } catch (err) {
      setLoadError(toUserMessage(err, 'De taken konden niet worden geladen.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const open = useMemo(() => tasks.filter((task) => !task.completed).sort(compareTasks), [tasks]);
  const done = useMemo(() => tasks.filter((task) => task.completed).sort(compareTasks), [tasks]);
  const today = todayIso();

  const handleToggle = async (task: Task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      await loadTasks();
    } catch (err) {
      show(toUserMessage(err, 'De taak kon niet worden bijgewerkt.'));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteTask(deleting.id);
      setDeleting(null);
      show('Taak verwijderd.');
      await loadTasks();
    } catch (err) {
      show(toUserMessage(err, 'De taak kon niet worden verwijderd.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };

  const renderTask = (task: Task) => {
    const subject = task.subject_id ? subjectById.get(task.subject_id) : undefined;
    const overdue = !task.completed && task.due_date !== null && task.due_date < today;
    return (
      <li key={task.id} className="card flex items-center gap-4 p-4">
        <button
          type="button"
          onClick={() => handleToggle(task)}
          aria-label={task.completed ? `Markeer "${task.title}" als open` : `Markeer "${task.title}" als klaar`}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-[3px] border-outline transition-transform duration-[180ms] active:scale-90',
            task.completed ? 'bg-success-500 text-white' : 'bg-panel hover:bg-selection',
          )}
        >
          {task.completed && <Check className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-semibold', task.completed ? 'text-neutral-500 line-through dark:text-neutral-400' : 'text-neutral-900 dark:text-neutral-50')}>
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            {subject && (
              <span className="inline-flex items-center gap-1.5">
                <span className={cn('h-2.5 w-2.5 rounded-full', SUBJECT_COLORS[subject.color].dot)} />
                {subject.name}
              </span>
            )}
            {task.due_date && (
              <span className={cn('inline-flex items-center gap-1', overdue && 'font-semibold text-error-600 dark:text-error-300')}>
                <CalendarClock className="h-3.5 w-3.5" />
                {overdue ? 'Te laat, ' : 'Deadline '}
                {formatShortDate(task.due_date)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(task)}
            aria-label={`Bewerk "${task.title}"`}
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-selection hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(task)}
            aria-label={`Verwijder "${task.title}"`}
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-error-50 hover:text-error-600 dark:text-neutral-300 dark:hover:bg-error-500/10 dark:hover:text-error-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Huiswerk en taken</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Alles wat je nog moet doen, met deadline en vak.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nieuwe taak
        </Button>
      </div>

      {loadError && (
        <p role="alert" className="text-sm font-semibold text-error-600 dark:text-error-300">
          {loadError}
        </p>
      )}

      {!loading && !loadError && tasks.length === 0 && (
        <EmptyState icon={ListTodo} title="Nog geen taken" description="Voeg je huiswerk toe en zet er een deadline bij." />
      )}

      {open.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">Open ({open.length})</h2>
          <ul className="space-y-3">{open.map(renderTask)}</ul>
        </section>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">Afgerond ({done.length})</h2>
          <ul className="space-y-3">{done.map(renderTask)}</ul>
        </section>
      )}

      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        task={editing}
        subjects={data.subjects}
        onSaved={loadTasks}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Taak verwijderen?"
        description={`"${deleting?.title ?? ''}" wordt definitief verwijderd.`}
        confirmLabel="Verwijderen"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
