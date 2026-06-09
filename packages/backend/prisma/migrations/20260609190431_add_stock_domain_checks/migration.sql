-- ============================================================================
-- STOCK DOMAIN CHECK CONSTRAINTS
-- PostgreSQL custom constraints for warehouse, stock, batch, and reservation rules.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- stock_movements
-- ----------------------------------------------------------------------------

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movements_quantity_positive_chk"
CHECK ("quantity" > 0);

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movements_cost_pair_chk"
CHECK (
  ("unit_cost" IS NULL AND "total_cost" IS NULL)
  OR
  ("unit_cost" IS NOT NULL AND "total_cost" IS NOT NULL)
);

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movements_batch_expiry_pair_chk"
CHECK (
  "expiry_date" IS NULL
  OR
  "batch_number" IS NOT NULL
);

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movements_serial_non_empty_chk"
CHECK (
  "serial_number" IS NULL
  OR
  btrim("serial_number") <> ''
);

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movements_batch_non_empty_chk"
CHECK (
  "batch_number" IS NULL
  OR
  btrim("batch_number") <> ''
);

-- ----------------------------------------------------------------------------
-- virtual_stocks
-- ----------------------------------------------------------------------------

ALTER TABLE "virtual_stocks"
ADD CONSTRAINT "virtual_stocks_quantity_non_negative_chk"
CHECK ("quantity" >= 0);

ALTER TABLE "virtual_stocks"
ADD CONSTRAINT "virtual_stocks_lead_time_non_negative_chk"
CHECK ("lead_time_days" >= 0);

ALTER TABLE "virtual_stocks"
ADD CONSTRAINT "virtual_stocks_supplier_price_non_negative_chk"
CHECK (
  "supplier_price" IS NULL
  OR
  "supplier_price" >= 0
);

ALTER TABLE "virtual_stocks"
ADD CONSTRAINT "virtual_stocks_supplier_price_currency_pair_chk"
CHECK (
  ("supplier_price" IS NULL AND "supplier_currency_code" IS NULL)
  OR
  ("supplier_price" IS NOT NULL AND "supplier_currency_code" IS NOT NULL)
);

ALTER TABLE "virtual_stocks"
ADD CONSTRAINT "virtual_stocks_source_non_empty_chk"
CHECK (
  "source" IS NULL
  OR
  btrim("source") <> ''
);

-- ----------------------------------------------------------------------------
-- stock_batches
-- ----------------------------------------------------------------------------

ALTER TABLE "stock_batches"
ADD CONSTRAINT "stock_batches_quantity_non_negative_chk"
CHECK ("quantity" >= 0);

ALTER TABLE "stock_batches"
ADD CONSTRAINT "stock_batches_reserved_non_negative_chk"
CHECK ("reserved" >= 0);

ALTER TABLE "stock_batches"
ADD CONSTRAINT "stock_batches_reserved_lte_quantity_chk"
CHECK ("reserved" <= "quantity");

ALTER TABLE "stock_batches"
ADD CONSTRAINT "stock_batches_batch_number_non_empty_chk"
CHECK (btrim("batch_number") <> '');

ALTER TABLE "stock_batches"
ADD CONSTRAINT "stock_batches_date_order_chk"
CHECK (
  "manufactured_date" IS NULL
  OR
  "expiry_date" IS NULL
  OR
  "manufactured_date" <= "expiry_date"
);

-- ----------------------------------------------------------------------------
-- stock_reservations
-- ----------------------------------------------------------------------------

ALTER TABLE "stock_reservations"
ADD CONSTRAINT "stock_reservations_quantity_positive_chk"
CHECK ("quantity" > 0);

ALTER TABLE "stock_reservations"
ADD CONSTRAINT "stock_reservations_batch_non_empty_chk"
CHECK (
  "batch_number" IS NULL
  OR
  btrim("batch_number") <> ''
);

ALTER TABLE "stock_reservations"
ADD CONSTRAINT "stock_reservations_expiry_after_reserved_chk"
CHECK (
  "expires_at" IS NULL
  OR
  "expires_at" >= "reserved_at"
);

ALTER TABLE "stock_reservations"
ADD CONSTRAINT "stock_reservations_fulfilled_after_reserved_chk"
CHECK (
  "fulfilled_at" IS NULL
  OR
  "fulfilled_at" >= "reserved_at"
);

ALTER TABLE "stock_reservations"
ADD CONSTRAINT "stock_reservations_cancelled_after_reserved_chk"
CHECK (
  "cancelled_at" IS NULL
  OR
  "cancelled_at" >= "reserved_at"
);

ALTER TABLE "stock_reservations"
ADD CONSTRAINT "stock_reservations_fulfilled_cancelled_mutual_exclusion_chk"
CHECK (
  NOT ("fulfilled_at" IS NOT NULL AND "cancelled_at" IS NOT NULL)
);