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
