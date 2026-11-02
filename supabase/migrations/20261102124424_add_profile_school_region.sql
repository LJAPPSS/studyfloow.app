/*
# Add school holiday region to profiles

1. Modified Tables
- `profiles`: new nullable column `school_region` (text). Allowed values: 'noord', 'midden', 'zuid'.

2. Notes
- Existing profiles keep NULL until the user picks a region in their profile settings.
- The region decides which Dutch school holidays the study assistant takes into account.
- No change to row level security or grants: the column is covered by the existing profile policies.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_region text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_school_region_check' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_school_region_check CHECK (school_region IN ('noord', 'midden', 'zuid'));
  END IF;
END $$;
