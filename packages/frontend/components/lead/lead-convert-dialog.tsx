// components/leads/lead-convert-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { convertLeadSchema } from "@mini-erp/shared/validators/lead";
import type { Lead } from "@/types/lead-types";
import { convertLeadAction } from "@/actions/lead-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConvertLeadFormInput } from "@mini-erp/shared";

// ============================================================================
// Constants
// ============================================================================

const ENTITY_TYPE_OPTIONS = [
  { value: "SRL", label: "S.r.l." },
  { value: "SPA", label: "S.p.A." },
  { value: "SNC", label: "S.n.c." },
  { value: "SAS", label: "S.a.s." },
  { value: "SSRL", label: "S.r.l.s." },
  { value: "COOP", label: "Cooperativa" },
  { value: "PERSONA_FISICA", label: "Persona fisica" },
  { value: "OTHER", label: "Altro" },
] as const;

const CUSTOMER_TYPE_OPTIONS = [
  { value: "CUSTOMER", label: "Cliente" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "DISTRIBUTOR", label: "Distributore" },
  { value: "RESELLER", label: "Rivenditore" },
  { value: "PARTNER", label: "Partner" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Bassa" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Critica" },
] as const;

const SEGMENT_OPTIONS = [
  { value: "STANDARD", label: "Standard" },
  { value: "PREMIUM", label: "Premium" },
  { value: "VIP", label: "VIP" },
  { value: "STRATEGIC", label: "Strategico" },
] as const;

// ============================================================================
// Component
// ============================================================================

interface LeadConvertDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog to convert a lead into a Customer.
 * Italian companies require vatNumber or taxCode (enforced by convertLeadSchema).
 */
export function LeadConvertDialog({ lead, open, onOpenChange }: LeadConvertDialogProps) {
  const router = useRouter();

  const form = useForm<ConvertLeadFormInput>({
    resolver: zodResolver(convertLeadSchema),
    defaultValues: {
      companyName: lead.companyName,
      vatNumber: lead.vatNumber ?? "",
      taxCode: lead.taxCode ?? "",
      entityType: undefined,
      countryCode: lead.countryCode ?? "IT",
      customerType: "CUSTOMER",
      priority: "LOW",
      segment: "STANDARD",
      notes: "",
    },
  });

  const watchedCountry = form.watch("countryCode");
  const isItalian = watchedCountry === "IT";
  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: ConvertLeadFormInput) => {
    const result = await convertLeadAction(lead.id, data);
    if (result.success) {
      toast.success(`Lead convertita in cliente "${data.companyName}"`);
      onOpenChange(false);
      router.push(`/customers/${(result.data as any)?.id}`);
    } else {
      toast.error(result.error ?? "Errore durante la conversione");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Converti in Cliente
          </DialogTitle>
          <DialogDescription>
            Questa operazione è irreversibile. Il lead verrà marcato come <strong>CONVERTED</strong>{" "}
            e verrà creato un nuovo cliente.
          </DialogDescription>
        </DialogHeader>

        {!lead.bantQualified && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Il lead non è stato qualificato BANT. Puoi procedere comunque.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Company */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ragione sociale <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              {/* VAT */}
              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      P.IVA{isItalian && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="IT12345678901" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Code */}
              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codice fiscale</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Entity type */}
              <FormField
                control={form.control}
                name="entityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Forma giuridica <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENTITY_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Customer type */}
              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMER_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorità</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Segment */}
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segmento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SEGMENT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note di conversione..."
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Conversione..." : "Converti in Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
