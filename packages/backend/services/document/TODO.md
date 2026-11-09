## Documents

- [ ] Consolidated deferred invoice: one INVOICE built from several delivery notes of the same customer
      (today /convert takes a single source). Needs a multi-source conversion and MERGES_INTO relations;
      invoice formalization already updates each delivery note and order line it references.
- [ ] Purchase chain (5c): SUPPLIER_ORDER -> SUPPLIER_DELIVERY_NOTE -> SUPPLIER_INVOICE -> SUPPLIER_CREDIT_NOTE
      (counterparty document number, received/registration dates, withholding, VAT register).
- [ ] Installments service: regenerate installments after a counterparty change and after price changes
      (formalization fails while installments do not match the net payable amount).
- [ ] Idempotency-Key for convert, clone and add line.
- [ ] Recalculate prices and tax when documentDate changes on a draft.
- [ ] Discount lines are not invoiced when the invoice is created from a delivery note.
- [ ] Orders that are never delivered (services, immediate invoice) do not close automatically.
- [ ] Stock movements on delivery notes and credit notes; accounting entries.
- [ ] Date consistency checks (invoice vs order/delivery note, credit note vs invoice).

- [ ] Payment ledger: one record per payment (amount, date, method, reference) with reversal;
      today `paidAmount` is cumulative on the installment and only the last date/reference is kept.
- [ ] Seed a system user and run `markOverdueInstallments` daily (with the idempotency-key cleanup).
- [ ] Credit notes do not reduce the open installments of the credited invoice.
- [ ] Late fees and reminders (`lateFeeAmount`, `remindersSent`).
- [ ] PaymentTermDetail: month-end offset ("end of month + N days").
- [ ] Derived documents: fall back to the counterparty default payment method when the source has none.

- [ ] Bulk email sending: needs the email service; `sendDocument` and bulk send are not implemented
      (the former answers 501, the latter has been removed).
- [ ] Bulk export (PDF, XML, CSV): needs a job queue and a way to poll job status; removed until then.
- [ ] Bulk operations are not atomic: documents already processed stay processed if the request
      is interrupted. If bulk formalization becomes slow, consider a job with per-document progress.
- [ ] Bulk operations log failures with `console.error`: switch to the project logger.
- [ ] Check whether VOIDED is a system-driven status: if it is not, `PATCH /:id/status` lets
      `document:update` void documents, bypassing `document:void`.

- [ ] Reports: mixed currencies are summed without conversion; add a currency filter
      (default EUR) or convert to a reporting currency.

- [ ] Reports: add indexes on (tenant_id, document_date) and consider materialized views
      for high-volume time-series reports.
- [ ] Reports: aging and overdue installments do not account for credit notes linked to
      the invoice (a credit note does not reduce the outstanding balance).
- [ ] Reports: `week` follows the ISO week (Monday–Sunday), not a tenant-configurable week.
