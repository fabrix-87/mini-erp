// components/activity/form/activity-form-scheduling.tsx
"use client";

import { Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { CreateActivityFormValues } from "@mini-erp/shared";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getActivityStatusOptions } from "@/helpers/activity-helpers";

export function ActivityFormScheduling() {
  const t = useTranslations("activities");
  const { control } = useFormContext<CreateActivityFormValues>();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("tabs.schedule.title")}</CardTitle>
          <CardDescription>{t("tabs.schedule.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormField
              control={control}
              name="scheduledStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.scheduledStart")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="datetime-local" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="scheduledEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.scheduledEnd")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? undefined} type="datetime-local" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.duration")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onBlur();
                      field.onChange(Number(value));
                    }}
                    value={field.value?.toString() ?? "30"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">{t("duration.15")}</SelectItem>
                      <SelectItem value="30">{t("duration.30")}</SelectItem>
                      <SelectItem value="45">{t("duration.45")}</SelectItem>
                      <SelectItem value="60">{t("duration.60")}</SelectItem>
                      <SelectItem value="90">{t("duration.90")}</SelectItem>
                      <SelectItem value="120">{t("duration.120")}</SelectItem>
                      <SelectItem value="180">{t("duration.180")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.status")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onBlur();
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getActivityStatusOptions(t).map((o) => (
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Bell className="inline h-4 w-4 mr-2" />
            {t("reminder.title")}
          </CardTitle>
          <CardDescription>{t("reminder.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormField
              control={control}
              name="reminderMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reminder.label")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onBlur();
                      field.onChange(value === "0" ? undefined : Number(value));
                    }}
                    value={field.value?.toString() ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reminder.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{t("reminder.options.0")}</SelectItem>
                      <SelectItem value="15">{t("reminder.options.15")}</SelectItem>
                      <SelectItem value="30">{t("reminder.options.30")}</SelectItem>
                      <SelectItem value="60">{t("reminder.options.60")}</SelectItem>
                      <SelectItem value="120">{t("reminder.options.120")}</SelectItem>
                      <SelectItem value="1440">{t("reminder.options.1440")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
