import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useStudyData } from '@/contexts/StudyDataContext';
import { toUserMessage } from '@/lib/errors';
import { markQrPromptShown } from '@/services/profile';

const QR_IMAGE_SRC = '/donation-qr.png';
const REPEAT_EVERY_MS = 4 * 24 * 60 * 60 * 1000;

function isPromptDue(lastShownAt: string | null): boolean {
  if (!lastShownAt) return true;
  return Date.now() - new Date(lastShownAt).getTime() >= REPEAT_EVERY_MS;
}

export function DonationQrPrompt() {
  const { userId, data, refresh } = useStudyData();
  const [open, setOpen] = useState(() => isPromptDue(data.profile?.qr_prompt_last_shown_at ?? null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = async () => {
    setSaving(true);
    setError(null);
    try {
      await markQrPromptShown(userId);
      await refresh();
      setOpen(false);
    } catch (err) {
      setError(toUserMessage(err, 'Er ging iets mis. Probeer het opnieuw.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Scan de QR-code"
      description="Bedankt dat je StudyFlow gebruikt. Deze melding komt elke 4 dagen terug."
      footer={
        <Button onClick={handleClose} loading={saving}>
          Sluiten
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <img src={QR_IMAGE_SRC} alt="QR-code om te scannen" className="w-full max-w-xs rounded-playful border-[3px] border-outline bg-white p-3" />
        {error && (
          <p role="alert" className="text-sm font-semibold text-error-600 dark:text-error-300">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
