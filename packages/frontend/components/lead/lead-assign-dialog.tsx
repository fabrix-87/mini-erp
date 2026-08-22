// components/leads/lead-assign-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Lead } from "@/types/lead-types";
import { assignLeadAction } from "@/actions/lead-actions";

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
import { Button } from "@/components/ui/button";
import { assignedUserIdSchema, AssignUserIdFormValues } from "@mini-erp/shared";
import { useUsers } from "@/hooks/use-user";

// ============================================================================
// Component
// ============================================================================

interface LeadAssignDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog to assign a lead to a team member.
 * Users list is fetched from the existing useUsers hook.
 */
export function LeadAssignDialog({ lead, open, onOpenChange }: LeadAssignDialogProps) {
  const router = useRouter();
  const { data: usersResponse, isLoading: isUsersLoading } = useUsers({
    page: 1,
    limit: 100,
    sortBy: "username",
    sortOrder: "asc",
  });
  const users = usersResponse?.data ?? [];

  const form = useForm<AssignUserIdFormValues>({
    resolver: zodResolver(assignedUserIdSchema),
    defaultValues: {
      assignedUserId: lead.assignedUser?.id ?? undefined,
    },
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: AssignUserIdFormValues) => {
    const result = await assignLeadAction(lead.id, Number(data.assignedUserId));
    if (result.success) {
      toast.success("Lead assegnata");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Errore durante l'assegnazione");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assegna lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assegna a</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString() ?? ""}
                    disabled={isUsersLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isUsersLoading ? "Caricamento..." : "Seleziona utente..."}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.details?.firstName} {u.details?.lastName}
                          {u.email && (
                            <span className="ml-1 text-xs text-muted-foreground">· {u.email}</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={isPending || isUsersLoading}>
                {isPending ? "Assegnazione..." : "Assegna"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
