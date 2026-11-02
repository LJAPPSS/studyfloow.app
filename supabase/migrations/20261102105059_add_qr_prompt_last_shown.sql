/*
# Track when the donation QR prompt was last shown

1. Modified Tables
- `profiles`
  - `qr_prompt_last_shown_at` (timestamptz, nullable): when the user last closed the QR prompt. Null means never shown.

2. Security
- No new policies or grants. The existing owner-scoped policies on `profiles` already cover reading and updating this column.

3. Important notes
- The column is only used to decide when the prompt appears again (every 4 days). There is no setting that turns it off.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qr_prompt_last_shown_at timestamptz;
