// components/leads/lead-status-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLeadStatusSchema } from "@mini-erp/shared/validators/lead";
import type { UpdateLeadStatusInput } from "@/types/lead";
import type { Lead } from "@/types/lead";
import { updateLeadStatusAction } from "@/actions/lead";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// ============================================================================
// Constants
// ============================================================================

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nuovo" },
  { value: "CONTACTED", label: "Contattato" },
  { value: "QUALIFIED", label: "Qualificato" },
  { value: "UNQUALIFIED", label: "Non qualificato" },
  { value: "NURTURING", label: "Nurturing" },
  { value: "CONVERTED", label: "Convertito" },
  { value: "LOST", label: "Perso" },
  { value: "DUPLICATE", label: "Duplicato" },
  { value: "ARCHIVED", label: "Archiviato" },
] as const;

// ============================================================================
// Component
// ============================================================================

interface LeadStatusDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog to update a lead status.
 * When status is LOST, requires a lostReason (enforced by the validator).
 */
export function LeadStatusDialog({ lead, open, onOpenChange }: LeadStatusDialogProps) {
  const router = useRouter();

  const form = useForm<UpdateLeadStatusInput>({
    resolver: zodResolver(updateLeadStatusSchema),
    defaultValues: {
      status: lead.status,
      lostReason: "",
      notes: "",
    },
  });

  const watchedStatus = form.watch("status");
  const isLost = watchedStatus === "LOST";
  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: UpdateLeadStatusInput) => {
    const result = await updateLeadStatusAction(lead.id, data);
    if (result.success) {
      toast.success("Status aggiornato");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Errore durante l'aggiornamento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambia status lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuovo status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
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

            {/* Lost reason — required when LOST */}
            {isLost && (
              <FormField
                control={form.control}
                name="lostReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Motivo perdita <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Specifica il motivo per cui il lead è stato perso..."
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note aggiuntive sul cambio di status..."
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
                {isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
