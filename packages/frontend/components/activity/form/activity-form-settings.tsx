// components/activity/form/activity-form-settings.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { CreateActivityFormValues } from "@mini-erp/shared";
import { FormControl, FormField, FormItem } from "@/components/ui/form";

export function ActivityFormSettings() {
  const t = useTranslations("activities");
  const { control } = useFormContext<CreateActivityFormValues>();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tabs.settings.title")}</CardTitle>
        <CardDescription>{t("tabs.settings.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? undefined}
                  placeholder={t("form.internalNotesPlaceholder")}
                  rows={10}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
