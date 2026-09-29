// components/activity/form/activity-form-outcome.tsx
"use client";

import { FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { CreateActivityFormValues } from "@mini-erp/shared";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { getActivityOutcomeOptions } from "@/helpers/activity-helpers";

export function ActivityFormOutcome() {
  const t = useTranslations("activities");
  const { control } = useFormContext<CreateActivityFormValues>();
  const status = useWatch({
    control,
    name: "status",
  });

  const showOutcomeFields = status === "COMPLETED";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("tabs.outcome.title")}</CardTitle>
          <CardDescription>
            {showOutcomeFields
              ? t("tabs.outcome.showOutcomeFields.true")
              : t("tabs.outcome.showOutcomeFields.false")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showOutcomeFields ? (
            <>
              <div className="space-y-2">
                <FormField
                  control={control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.outcome")}</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onBlur();
                          field.onChange(value);
                        }}
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.outcomePlaceholder")} />
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
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.result")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? undefined}
                          placeholder={t("form.resultPlaceholder")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("tabs.outcome.statusOutcomeHint")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
