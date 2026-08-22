// components/leads/lead-qualify-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { qualifyLeadSchema } from "@mini-erp/shared/validators/lead";
import type { Lead } from "@/types/lead-types";
import { qualifyLeadAction } from "@/actions/lead-actions";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QualifyLeadFormInput } from "@mini-erp/shared";

// ============================================================================
// Constants
// ============================================================================

const TIMEFRAME_OPTIONS = [
  { value: "IMMEDIATE", label: "Immediato" },
  { value: "1_3_MONTHS", label: "1-3 mesi" },
  { value: "3_6_MONTHS", label: "3-6 mesi" },
  { value: "6_12_MONTHS", label: "6-12 mesi" },
  { value: "12_PLUS_MONTHS", label: "Oltre 12 mesi" },
] as const;

const AUTHORITY_OPTIONS = [
  { value: "DECISION_MAKER", label: "Decision Maker" },
  { value: "INFLUENCER", label: "Influencer" },
  { value: "GATEKEEPER", label: "Gatekeeper" },
  { value: "USER", label: "User" },
] as const;

// ============================================================================
// Component
// ============================================================================

interface LeadQualifyDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for BANT qualification.
 * When bantQualified=true, all 4 BANT fields become required
 * (enforced by qualifyLeadSchema).
 */
export function LeadQualifyDialog({ lead, open, onOpenChange }: LeadQualifyDialogProps) {
  const router = useRouter();

  const form = useForm<QualifyLeadFormInput>({
    resolver: zodResolver(qualifyLeadSchema),
    defaultValues: {
      bantQualified: lead.bantQualified ?? false,
      budget: undefined,
      decisionAuthority: undefined,
      primaryNeed: lead.primaryNeed ?? "",
      purchaseTimeframe: undefined,
      bantNotes: lead.bantNotes ?? "",
    },
  });

  const isQualified = form.watch("bantQualified");
  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: QualifyLeadFormInput) => {
    const result = await qualifyLeadAction(lead.id, data);
    if (result.success) {
      toast.success(data.bantQualified ? "Lead qualificata BANT ✓" : "Qualificazione aggiornata");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Errore durante la qualificazione");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Qualificazione BANT</DialogTitle>
          <DialogDescription>Budget · Authority · Need · Timeframe</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Qualified toggle */}
            <FormField
              control={form.control}
              name="bantQualified"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Qualificato BANT</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Attivando questa opzione tutti i campi BANT diventano obbligatori
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            {/* Budget */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Budget (€){isQualified && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Es. 50000"
                      {...field}
                      value={Number(field.value) ?? 0}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Decision Authority */}
            <FormField
              control={form.control}
              name="decisionAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Autorità decisionale
                    {isQualified && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona ruolo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AUTHORITY_OPTIONS.map((o) => (
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

            {/* Primary Need */}
            <FormField
              control={form.control}
              name="primaryNeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Necessità principale
                    {isQualified && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi la necessità o il problema principale del lead..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purchase Timeframe */}
            <FormField
              control={form.control}
              name="purchaseTimeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Timeframe acquisto
                    {isQualified && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona timeframe..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEFRAME_OPTIONS.map((o) => (
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

            {/* BANT Notes */}
            <FormField
              control={form.control}
              name="bantNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note BANT</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Osservazioni aggiuntive sulla qualificazione..."
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
                {isPending ? "Salvataggio..." : "Salva qualificazione"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
