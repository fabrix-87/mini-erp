// Tipo di linea del documento
export type DocumentLineType =
  | "product"
  | "service"
  | "text"
  | "subtotal"
  | "discount"
  | "shipping";

  
// Utile quando il controller fa la 'include: Product'
export interface ProductSummary {
  id: number;
  reference?: string;
  coverThumbnailUrl?: string;
  // Aggiungi altri campi se necessario
}

export interface DocumentLine {
  id: number;
  documentId: number;
  lineNumber: number;

  // Tipo e Riferimenti
  lineType: DocumentLineType;
  productId?: number | null; // Nullable perché la riga può essere libera (non legata a prodotto) o di tipo 'text'
  product?: ProductSummary; // Popolato solo se il backend fa la join

  // Dati Descrittivi
  code?: string;
  name: string;
  description?: string;

  // Quantità e Unità
  quantity: number;
  unit: string; // Default 'pz'

  // Prezzi e Costi
  unitPrice: number;
  unitCost?: number; // Spesso nascosto ai clienti/agenti, ma presente nel model

  // Sconti Riga
  discountPercent: number;
  discountAmount: number;

  // Totali Calcolati (Backend)
  lineTotal: number; // Imponibile riga (Netto)

  // Tassazione
  taxPercent: number;
  taxAmount: number;
  taxCode?: string; // Es. 'N4', '22'

  // Totale Lordo
  lineTotalWithTax: number;

  // Extra
  notes?: string;
  customFields?: Record<string, any>; // JSON

  // Metadata
  createdAt?: string; // Le date JSON sono stringhe ISO
  updatedAt?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  code: string; // 'bank_transfer', 'paypal', 'cash', 'other'
  description?: string;
  defaultBankName?: string;
  defaultBankIban?: string;
  defaultBankSwift?: string;
  paymentTermsDefault?: string;
  paymentTermDaysDefault?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: number;

  // --- Numerazione e Identificazione ---
  documentType: DocumentType;
  documentNumber: string;
  documentYear: number;
  progressiveNumber: number;

  // --- Relazioni Core ---
  companyId: number;
  contactId?: number | null;
  assignedUserId?: number | null;

  // --- Date ---
  documentDate: string;
  dueDate?: string | null;
  deliveryDate?: string | null;
  validUntil?: string | null;

  // --- Stato ---
  status: DocumentStatus;

  // --- Relazioni tra Documenti ---
  relatedQuoteId?: number | null;
  relatedOrderId?: number | null;
  relatedInvoiceId?: number | null;
  relatedOpportunityId?: number | null;

  // ===============================================
  // SNAPSHOT DATI CLIENTE (Fatturazione/Legale)
  // ===============================================
  customerName: string; // allowNull: false
  customerVatNumber?: string | null;
  customerTaxCode?: string | null;
  customerAddress?: string | null;
  customerCity?: string | null;
  customerPostalCode?: string | null;
  customerProvince?: string | null;
  customerCountry?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerPec?: string | null;
  customerSdiCode?: string | null;

  // ===============================================
  // SNAPSHOT INDIRIZZO SPEDIZIONE
  // ===============================================
  shippingName?: string | null;
  shippingAddress?: string | null; // Corrisponde all'addressLine1
  shippingCity?: string | null;
  shippingPostalCode?: string | null;
  shippingProvince?: string | null;
  shippingCountry?: string | null;

  // --- Importi e Totali Calcolati ---
  currency: string;
  subtotal: number;
  discountPercent?: number | null;
  discountAmount?: number | null;
  taxableAmount: number;
  taxAmount: number;
  shippingCost?: number | null;
  shippingTaxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance?: number; // Campo logico: totalAmount - paidAmount (spesso non salvato nel DB)

  // --- Pagamenti e Banca ---
  paymentMethod?: string | null; // ENUM nel DB
  paymentMethodId?: number | null; // Se fosse stata usata l'ID
  paymentTerms?: string | null;
  paymentTermDays?: number | null;
  bankName?: string | null;
  bankIban?: string | null;
  bankSwift?: string | null;

  // --- Metadata e Log ---
  notes?: string | null;
  internalNotes?: string | null;
  termsAndConditions?: string | null;
  createdByUserId?: number | null;

  // --- Fatturazione Elettronica ---
  xmlUrl?: string | null;
  transmissionId?: string | null;
  transmissionStatus?: "not_sent" | "sent" | "accepted" | "rejected" | null;
  transmissionDate?: string | null;
  pdfUrl?: string | null;
  attachments?: Record<string, any>[] | null; // JSON

  // --- Contenuto ---
  lines: DocumentLine[];
  customFields?: Record<string, any> | null;

  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | "quote"
  | "proforma"
  | "order"
  | "delivery_note"
  | "invoice"
  | "credit_note";

export type DocumentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "sent"
  | "accepted"
  | "rejected"
  | "processing"
  | "shipped"
  | "delivered"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled"
  | "closed";

export interface DocumentTypePageProps {
  params: Promise<{
    type: string;
  }>;
}

export const DOCUMENT_TITLES: Record<
  string,
  { singular: string; plural: string }
> = {
  quote: { singular: "Preventivo", plural: "Preventivi" },
  proforma: { singular: "Proforma", plural: "Proforma" },
  order: { singular: "Ordine", plural: "Ordini" },
  delivery_note: { singular: "DDT", plural: "Documenti di Trasporto" },
  invoice: { singular: "Fattura", plural: "Fatture" },
  credit_note: { singular: "Nota di Credito", plural: "Note di Credito" },
};

export const VALID_TYPES = [
  "quote",
  "proforma",
  "order",
  "delivery_note",
  "invoice",
  "credit_note",
];

export interface DocumentListFilters {
  page: number;
  limit: number;
  documentType: string;
  status?: string;
  companyId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "DESC" | "ASC";
}

export interface DocumentLineDTO {
  // Id è opzionale: esiste se stiamo modificando, assente se stiamo creando
  id?: number;

  // Dati inviati per il calcolo
  lineType:
    | "product"
    | "service"
    | "text"
    | "subtotal"
    | "discount"
    | "shipping";
  productId?: number | null;

  code?: string | null;
  name: string;
  description?: string | null;

  quantity: number;
  unit: string;
  unitPrice: number;
  unitCost?: number | null;

  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxCode?: string | null;

  notes?: string | null;
  customFields?: Record<string, any> | null;

  // Opzionale: Se il frontend invia i totali per una pre-visualizzazione
  lineTotal?: number;
}

// Interfaccia per l'indirizzo di spedizione nel BODY della richiesta (oggetto nidificato)
export interface ShippingAddressDTO {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  province?: string | null;
  country?: string | null;
}

// Campi che il server genera o riempie automaticamente
type ServerGeneratedDocumentFields =
  // ID, Numerazione e Timestamp
  | "id"
  | "documentNumber"
  | "documentYear"
  | "progressiveNumber"
  | "createdAt"
  | "updatedAt"
  // Totali
  | "subtotal"
  | "taxableAmount"
  | "taxAmount"
  | "shippingTaxAmount"
  | "totalAmount"
  | "paidAmount"
  // Snapshot Cliente (popolati da companyId)
  | "customerName"
  | "customerVatNumber"
  | "customerTaxCode"
  | "customerAddress"
  | "customerCity"
  | "customerPostalCode"
  | "customerProvince"
  | "customerCountry"
  | "customerEmail"
  | "customerPhone"
  | "customerPec"
  | "customerSdiCode"
  // Snapshot Spedizione (popolati da ShippingAddressDTO, ma salvati piatti)
  | "shippingName"
  | "shippingAddress"
  | "shippingCity"
  | "shippingPostalCode"
  | "shippingProvince"
  | "shippingCountry"
  // Riferimento al contenuto (omesso per essere sostituito dal DTO)
  | "lines";

export interface CreateDocumentDTO
  extends Omit<Document, ServerGeneratedDocumentFields> {
    // id nel caso di update
    id: number;
  // Campi obbligatori nel DTO
  documentType: DocumentType;
  companyId: number;

  // Le righe sono DTO in input
  lines: DocumentLineDTO[];

  // L'indirizzo di spedizione viene passato come oggetto nel DTO
  shippingAddress?: ShippingAddressDTO | null;

  // Tutti gli altri campi sono opzionali in creazione (documentDate, status, etc.)
}
