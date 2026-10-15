-- Drop the conflicting check constraint on bank_accounts
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS chk_bank_account_owner;