// packages/frontend/components/company/tabs/fiscal-data-tab.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { CompanyFormValues } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getVIESData } from "@/services/client/vies-client";
import { toast } from "sonner";
import { toInputValue } from "@/helpers/form-helper";

/**
 * Fiscal data tab for the company form.
 * Uses shadcn/ui form primitives and next-intl translations.
 */
export function FiscalDataTab(): React.JSX.Element {
  const form = useFormContext<CompanyFormValues>();
  const t = useTranslations("crm.companies.form.fiscal-data");

  const entityType = form.watch("entityType");
  const isForeign = entityType === "FOREIGN";
  const isNatural = entityType === "NATURAL";
  const vatId = form.watch("vatId") as string | undefined;

  /**
   * Validates the EU VAT ID through the VIES service.
   */
  const handleViesCheck = async (): Promise<void> => {
    if (!vatId) return;

    const res = await getVIESData(vatId);
    if (res && res?.data.valid) {
      toast.success(t('vies-check.success'), {
        description: (
          <>
            {res.data.name}
            <br />
            {res.data.address}
          </>
        ),
      });
    } else {
      toast.error(t('vies-check.error'));
    }
  };

  return (
    <Form {...form}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="vatNumber">{t("fields.vatNumber.label")}</FormLabel>
                  <FormControl>
                    <Input
                      id="vatNumber"
                      placeholder={t("fields.vatNumber.placeholder")}
                      disabled={isForeign}
                      {...field}
                      value={toInputValue(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="taxCode">{t("fields.taxCode.label")}</FormLabel>
                  <FormControl>
                    <Input
                      id="taxCode"
                      placeholder={t("fields.taxCode.placeholder")}
                      disabled={isForeign}
                      {...field}
                      value={toInputValue(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sdiCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="sdiCode">{t("fields.sdiCode.label")}</FormLabel>
                  <FormControl>
                    <Input
                      id="sdiCode"
                      placeholder={t("fields.sdiCode.placeholder")}
                      maxLength={7}
                      disabled={isForeign || isNatural}
                      {...field}
                      value={toInputValue(field.value)}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t("fields.sdiCode.hint")}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="pec">{t("fields.pec.label")}</FormLabel>
                  <FormControl>
                    <Input
                      id="pec"
                      type="email"
                      placeholder={t("fields.pec.placeholder")}
                      {...field}
                      value={toInputValue(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eoriNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="eoriNumber">{t("fields.eoriNumber.label")}</FormLabel>
                  <FormControl>
                    <Input
                      id="eoriNumber"
                      placeholder={t("fields.eoriNumber.placeholder")}
                      {...field}
                      value={toInputValue(field.value)}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t("fields.eoriNumber.hint")}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="vatId">{t("fields.vatId.label")}</FormLabel>

                  <div className="flex items-start gap-2">
                    <FormControl>
                      <Input
                        id="vatId"
                        placeholder={t("fields.vatId.placeholder")}
                        disabled={!isForeign}
                        {...field}
                        value={toInputValue(field.value)}
                      />
                    </FormControl>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      disabled={!isForeign || !vatId}
                      onClick={handleViesCheck}
                      aria-label={t("fields.vatId.checkButton")}
                    >
                      <ShieldCheck className="size-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">{t("fields.vatId.hint")}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}
