CREATE SEQUENCE IF NOT EXISTS lead_code_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- COALESCE a 0 sostituito con 1 come fallback minimo accettato da PostgreSQL
SELECT setval(
  'lead_code_seq',
  GREATEST(
    COALESCE((
      SELECT MAX(CAST(SPLIT_PART(code, '-', 2) AS INTEGER))
      FROM "Lead"
      WHERE code ~ '^LEAD-[0-9]+$'
    ), 0),
    1
  )
);