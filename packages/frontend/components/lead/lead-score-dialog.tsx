// components/leads/lead-score-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLeadScoreSchema } from "@mini-erp/shared/validators/lead";
import type { Lead } from "@/types/lead-types";
import { updateLeadScoreAction } from "@/actions/lead-actions";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LeadScoreDisplay } from "./lead-score-display";
import { UpdateLeadScoreFormInput } from "@mini-erp/shared/types";

// ============================================================================
// Component
// ============================================================================

interface LeadScoreDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog to manually update a lead score (0-100).
 * Shows a live preview of the color-coded score as the user types.
 */
export function LeadScoreDialog({ lead, open, onOpenChange }: LeadScoreDialogProps) {
  const router = useRouter();

  const form = useForm<UpdateLeadScoreFormInput>({
    resolver: zodResolver(updateLeadScoreSchema),
    defaultValues: {
      score: lead.score,
      notes: "",
    },
  });

  const watchedScore = form.watch("score");
  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: UpdateLeadScoreFormInput) => {
    const result = await updateLeadScoreAction(lead.id, data);
    if (result.success) {
      toast.success("Score aggiornato");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Errore durante l'aggiornamento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Aggiorna Lead Score</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Live score preview */}
            <div className="flex items-center justify-center rounded-lg border bg-muted/40 py-4">
              <LeadScoreDisplay score={watchedScore ?? 0} size="lg" showBar />
            </div>

            {/* Score input */}
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Valore da 0 a 100</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Motivazione della modifica..."
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
