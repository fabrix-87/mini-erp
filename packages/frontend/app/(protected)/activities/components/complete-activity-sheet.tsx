"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CompleteActivityFormValues,
  completeActivitySchema,
  CreateActivityFormValues,
  CreateActivityInput,
  createActivitySchema,
} from "@mini-erp/shared";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getActivityOutcomeOptions,
  getActivityPriorityOptions,
  getActivityTypeOptions,
} from "@/helpers/activity-helpers";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface CompleteActivitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompleteActivityFormValues) => Promise<void>;
}

// Utility per formattare la data per l'input datetime-local (YYYY-MM-DDTHH:mm)
const formatToDatetimeLocal = (date: Date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

const DEFAULT_VALUES = {
  outcome: "SUCCESSFUL",
  result: "",
  internalNotes: "",
  followUp: {
    type: "CALL",
    subject: "",
    scheduledStart: formatToDatetimeLocal(addMinutes(new Date(), 15)),
    priority: "LOW",
    description: "",
    duration: 30,
  },
} satisfies CompleteActivityFormValues;

export function CompleteActivitySheet({
  open,
  onOpenChange,
  onSubmit,
}: CompleteActivitySheetProps) {
  const { user } = useAuth();
  const t = useTranslations("activities");

  const form = useForm<CompleteActivityFormValues>({
    resolver: zodResolver(completeActivitySchema),
    mode: "onTouched",
    defaultValues: {
      ...DEFAULT_VALUES,
      followUp: undefined,
    },
  });
  const requireFollowUp = form.watch("outcome") === "FOLLOW_UP_NEEDED";

  // Resetta il form con i valori aggiornati quando il Sheet si apre
  useEffect(() => {
    if (open) {
      form.reset({
        ...DEFAULT_VALUES,
      });
    }
  }, [open, user?.userId, form]);

  useEffect(() => {
    if (!requireFollowUp) {
      form.setValue("followUp", undefined);
    }
  }, [requireFollowUp]);

  const isPending = form.formState.isSubmitting;

  const handleFormSubmit = async (data: CompleteActivityFormValues) => {
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
          <SheetTitle>{t("completeActivity.title")}</SheetTitle>
          <SheetDescription>{t("completeActivity.description")}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            {/* outcome */}
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.outcome")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getActivityOutcomeOptions(t).map((o) => (
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
            {/* result */}
            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.result")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.resultPlaceholder")}
                      {...field}
                      value={field.value ?? DEFAULT_VALUES.result}
                      minLength={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* internalNotes */}
            <FormField
              control={form.control}
              name="internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.internalNotes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.internalNotesPlaceholder")}
                      {...field}
                      value={field.value ?? DEFAULT_VALUES.internalNotes}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {requireFollowUp && (
              <>
                {/* Type + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="followUp.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.type")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? DEFAULT_VALUES.followUp?.type}
                        >
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
                    name="followUp.priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.priority")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? DEFAULT_VALUES.followUp?.priority}
                        >
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
                  name="followUp.subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("form.subject")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.subjectPlaceholder")}
                          {...(field ?? DEFAULT_VALUES.followUp?.subject)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="followUp.description"
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
                <FormField
                  control={form.control}
                  name="followUp.scheduledStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("form.scheduledStart")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} step={300} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="followUp.duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.duration")}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={
                          field.value?.toString() ?? DEFAULT_VALUES.followUp?.duration?.toString()
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectContent>
                            <SelectItem value="5">{t("duration.5")}</SelectItem>
                            <SelectItem value="15">{t("duration.15")}</SelectItem>
                            <SelectItem value="30">{t("duration.30")}</SelectItem>
                            <SelectItem value="45">{t("duration.45")}</SelectItem>
                            <SelectItem value="60">{t("duration.60")}</SelectItem>
                            <SelectItem value="90">{t("duration.90")}</SelectItem>
                            <SelectItem value="120">{t("duration.120")}</SelectItem>
                            <SelectItem value="180">{t("duration.180")}</SelectItem>
                          </SelectContent>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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
