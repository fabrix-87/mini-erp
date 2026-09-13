"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateActivityFormValues,
  CreateActivityInput,
  createActivitySchema,
} from "@mini-erp/shared";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { useTranslations } from "next-intl";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getActivityPriorityOptions, getActivityTypeOptions } from "@/helpers/activity-helpers";
import { Button } from "../ui/button";
import { Save } from "lucide-react";

interface ActivitySheetProps {
  leadId?: string;
  opportunityId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateActivityFormValues) => Promise<void>;
}

// Utility per formattare la data per l'input datetime-local (YYYY-MM-DDTHH:mm)
const formatToDatetimeLocal = (date: Date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

const DEFAULT_VALUES: Partial<CreateActivityInput> = {
  type: "CALL",
  subject: "",
  description: "",
  priority: "MEDIUM",
  status: "SCHEDULED",
  scheduledStart: formatToDatetimeLocal(addMinutes(new Date(), 15)),
  scheduledEnd: "",
  reminderSent: false,
  duration: 30,
};

export function ActivitySheet({
  leadId,
  opportunityId,
  open,
  onOpenChange,
  onSubmit,
}: ActivitySheetProps) {
  const { user } = useAuth();
  const t = useTranslations("activities");

  const form = useForm<CreateActivityFormValues>({
    resolver: zodResolver(createActivitySchema),
    mode: "onTouched",
    defaultValues: {
      ...DEFAULT_VALUES,
      leadId: leadId ?? null,
      opportunityId: opportunityId ?? null,
      assignedUserId: user?.userId ?? "",
    },
  });

  // Resetta il form con i valori aggiornati quando il Sheet si apre
  useEffect(() => {
    if (open) {
      form.reset({
        ...DEFAULT_VALUES,
        scheduledStart: formatToDatetimeLocal(),
        leadId: leadId ?? null,
        opportunityId: opportunityId ?? null,
        assignedUserId: user?.userId ?? "",
      });
    }
  }, [open, leadId, opportunityId, user?.userId, form]);

  const isPending = form.formState.isSubmitting;

  const handleFormSubmit = async (data: CreateActivityFormValues) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-5">
        <SheetHeader>
          <SheetTitle>{t("newActivity")}</SheetTitle>
          <SheetDescription>{t("createNew")}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            {/* Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.type")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getActivityTypeOptions(t).map((o) => (
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

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.priority")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getActivityPriorityOptions(t).map((o) => (
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

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.subject")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.subjectPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.description")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.descriptionPlaceholder")}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start + End */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.scheduledStart")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} step={300}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.scheduledEnd")}</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value || ""}
                        onChange={field.onChange}
                        step={300}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.duration")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? 30}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                {t("form.cancel")}
              </Button>

              <Button type="submit" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isPending ? t("form.saving") : t("form.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
