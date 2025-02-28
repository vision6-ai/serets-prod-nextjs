-- Update auth settings to handle email verification properly
ALTER TABLE auth.identities
ALTER COLUMN email_verified SET DEFAULT true;

-- Disable email verification requirement
UPDATE auth.config
SET email_confirm_required = false
WHERE id = 1;

-- Update site URL in auth settings
UPDATE auth.config
SET site_url = 'https://serets.co.il'
WHERE id = 1;

-- Add additional auth settings
UPDATE auth.config
SET {
  mailer_autoconfirm = true,
  smtp_admin_email = 'no-reply@serets.co.il',
  smtp_max_frequency = 60,
  smtp_sender_name = 'SERETS.CO.IL'
}
WHERE id = 1;