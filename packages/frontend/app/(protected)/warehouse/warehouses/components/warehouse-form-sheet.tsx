"use client";

import { SupplierCombobox } from "@/components/combobox/supplier-combobox";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateWarehouseFormValues,
  createWarehouseSchema,
  UpdateWarehouseFormValues,
  updateWarehouseSchema,
  Warehouse,
  WAREHOUSE_TYPES,
} from "@mini-erp/shared";
import { Save, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface WarehouseSheetProps {
  warehouse?: Warehouse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createSubmit?: (data: CreateWarehouseFormValues) => Promise<void>;
  updateSubmit?: (data: UpdateWarehouseFormValues, warehouseId: string) => Promise<void>;
}

export function WarehouseFormSheet({
  warehouse,
  open,
  onOpenChange,
  createSubmit,
  updateSubmit,
}: WarehouseSheetProps) {
  const [showSupplier, setShowSupplier] = useState(false);
  const t = useTranslations("warehouse");
  const mode = warehouse ? "edit" : "create";
  const schema = mode === "edit" ? updateWarehouseSchema : createWarehouseSchema;

  if (!createSubmit && !updateSubmit) return <>Handle not found</>;

  // I valori correnti derivati dalle prop
  const formValues = useMemo(
    (): CreateWarehouseFormValues => ({
      code: warehouse?.code ?? "",
      name: warehouse?.name ?? "",
      location: warehouse?.location ?? "",
      type: warehouse?.type ?? WAREHOUSE_TYPES.PHYSICAL,
      supplierId: warehouse?.supplierId ?? undefined,
      isDefault: warehouse?.isDefault ?? false,
    }),
    [warehouse],
  );

  // Singola istanza di useForm
  const form = useForm<CreateWarehouseFormValues | UpdateWarehouseFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    values: formValues, // Si sincronizza automaticamente quando `warehouse` cambia
  });

  // Resetta il form con i valori aggiornati quando il Sheet si apre
  useEffect(() => {
    if (open) {
      form.reset(formValues);
    }
  }, [open, formValues, form]);

  const isPending = form.formState.isSubmitting;

  const handleFormSubmit = async (data: CreateWarehouseFormValues | UpdateWarehouseFormValues) => {
    try {
      if (mode === "edit" && warehouse?.id && updateSubmit) {
        await updateSubmit(data as UpdateWarehouseFormValues, warehouse.id);
      } else if (createSubmit) await createSubmit(data as CreateWarehouseFormValues);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  }

  const sheetContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div ref={sheetContainerRef} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 border-b px-6 py-5 pr-12 text-left">
            <SheetTitle className="text-lg font-semibold tracking-tight">
              {mode === "create" ? t("newWarehouse") : t("editWarehouse")}
            </SheetTitle>
            <SheetDescription className="text-sm leading-relaxed">
              {mode === "create" ? t("newWarehouseDescription") : t("editWarehouseDescription")}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("tableFields.code")}{" "}
                          <span className="text-destructive" aria-hidden="true">
                            *
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            title={t("form.codePlaceholder")}
                            placeholder={t("form.codePlaceholder")}
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("tableFields.name")}{" "}
                          <span className="text-destructive" aria-hidden="true">
                            *
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("form.namePlaceholder")}
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("tableFields.location")} </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("form.locationPlaceholder")}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("tableFields.type")}{" "}
                          <span className="text-destructive" aria-hidden="true">
                            *
                          </span>
                        </FormLabel>
                        <Select
                          onValueChange={(value: string) => {
                            if (value === "VIRTUAL") setShowSupplier(true);
                            else {
                              setShowSupplier(false);
                              form.resetField("supplierId", undefined);
                            }
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(WAREHOUSE_TYPES).map((type) => (
                              <SelectItem key={type} value={type}>
                                {t(`types.${type}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showSupplier ? (
                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("tableFields.supplier")}</FormLabel>
                          <FormControl>
                            <SupplierCombobox
                              value={field.value ?? ""}
                              disabled={!showSupplier}
                              container={sheetContainerRef}
                              onValueChange={(value) => {
                                field.onChange(value || null);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <FormLabel className="flex items-center gap-2 font-medium">
                            <Star
                              className={
                                field.value
                                  ? "size-4 fill-primary text-primary"
                                  : "size-4 text-muted-foreground"
                              }
                              aria-hidden="true"
                            />
                            {t("tableFields.isDefault")}
                          </FormLabel>

                          <FormControl>
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                              aria-label={t("tableFields.isDefault")}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                >
                  {t("form.cancel")}
                </Button>

                <Button type="submit" disabled={isPending} aria-busy={isPending}>
                  <Save className="size-4" aria-hidden="true" />
                  {isPending ? t("form.saving") : t("form.submit")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
