import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { toUserMessage } from '@/lib/errors';
import { createTask, updateTask } from '@/services/tasks';
import type { Subject, Task } from '@/types/study';

const MAX_TITLE_LENGTH = 120;

type TaskDialogProps = {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  subjects: Subject[];
  onSaved: () => void;
};

export function TaskDialog({ open, onClose, task, subjects, onSaved }: TaskDialogProps) {
  const { show } = useToast();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setSubjectId(task?.subject_id ?? '');
    setDueDate(task?.due_date ?? '');
    setError(null);
  }, [open, task]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Vul een omschrijving in.');
      return;
    }
    const input = { title: trimmed, subject_id: subjectId || null, due_date: dueDate || null };

    setSaving(true);
    setError(null);
    try {
      if (task) {
        await updateTask(task.id, input);
        show('Taak bijgewerkt.');
      } else {
        await createTask(input);
        show('Taak toegevoegd.');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(toUserMessage(err, 'De taak kon niet worden opgeslagen.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Taak bewerken' : 'Nieuwe taak'}
      description="Wat moet je doen, bij welk vak hoort het, en wanneer is het klaar?"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button type="submit" form="task-form" loading={saving}>
            Opslaan
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
        <Field label="Omschrijving" htmlFor="task-title" className="sm:col-span-2">
          <input
            id="task-title"
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Bijv. Hoofdstuk 3 maken"
            className={inputClass}
          />
        </Field>
        <Field label="Vak" htmlFor="task-subject" hint="Optioneel">
          <select id="task-subject" value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className={inputClass}>
            <option value="">Geen vak</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deadline" htmlFor="task-due" hint="Optioneel">
          <input id="task-due" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={inputClass} />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-error-600 sm:col-span-2 dark:text-error-300">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
