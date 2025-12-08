import { Badge } from "@/components/ui/badge";
import { DocumentType } from "@/types/document";
import { ReactNode } from "react";

type StatusType =
  | "draft"
  | "pending"
  | "approved"
  | "sent"
  | "accepted"
  | "paid"
  | "closed"
  | "cancelled";

type VariantType = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  variant: VariantType;
  label: string;
}

interface DocTypeConfig {
  label: string;
  variant: VariantType;
}

interface StatusBadgeProps {
  status: StatusType;
}

interface DocTypeBadgeProps {
  type: DocumentType;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  draft: { variant: "outline", label: "Bozza" },
  pending: { variant: "secondary", label: "In Sospeso" },
  approved: { variant: "default", label: "Approvato" },
  sent: { variant: "default", label: "Inviato" },
  accepted: { variant: "default", label: "Accettato" },
  paid: { variant: "default", label: "Pagato" },
  closed: { variant: "secondary", label: "Chiuso" },
  cancelled: { variant: "destructive", label: "Annullato" },
};

const DOC_TYPE_CONFIG: Record<DocumentType, DocTypeConfig> = {
  quote: { label: "📋 Preventivo", variant: "outline" },
  order: { label: "📦 Ordine", variant: "secondary" },
  invoice: { label: "🧾 Fattura", variant: "default" },
  credit_note: { label: "🧾 Nota di credito", variant: "default" },
  delivery_note: { label: "🧾 DDT", variant: "default" },
  proforma: { label: "🧾 Proforma", variant: "default" },
};

export function StatusBadge({ status }: StatusBadgeProps): ReactNode {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function DocTypeBadge({ type }: DocTypeBadgeProps): ReactNode {
  const config = DOC_TYPE_CONFIG[type] || DOC_TYPE_CONFIG.quote;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
