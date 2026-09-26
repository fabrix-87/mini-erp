"use client";

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
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

interface WarehouseSheetProps {
  warehouse?: Warehouse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: CreateWarehouseFormValues | UpdateWarehouseFormValues,
    warehouseId?: String,
  ) => Promise<void>;
}

export function WarehouseFormSheet({
  warehouse,
  open,
  onOpenChange,
  onSubmit,
}: WarehouseSheetProps) {
  const t = useTranslations("warehouse");
  const mode = warehouse ? "edit" : "create";
  const schema = mode === "edit" ? updateWarehouseSchema : createWarehouseSchema;

  // I valori correnti derivati dalle prop
  const formValues = useMemo(
    (): CreateWarehouseFormValues => ({
      name: warehouse?.name ?? "",
      location: warehouse?.location ?? "",
      type: warehouse?.type ?? WAREHOUSE_TYPES.PHYSICAL,
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
      if (mode === "edit" && warehouse?.id) await onSubmit(data, warehouse.id);
      else await onSubmit(data);
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
          <SheetTitle>{mode === "create" ? t("newActivity") : t("newActivity")}</SheetTitle>
          <SheetDescription>
            {mode === "create" ? t("newWarehouseDescription") : t("editWarehouseDescription")}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            {/* Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("tableFields.name")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t("form.titlePlaceholder")} {...field} />
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
                    <FormLabel>
                      {t("tableFields.location")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input value={field.value || ""} />
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
                      {t("tableFields.type")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
            </div>

            {/* Subject */}
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tableFields.isDefault")}</FormLabel>
                  <FormControl>
                    <Toggle
                      aria-label="Toggle default warehouse"
                      variant="outline"
                      // Mappa field.value su pressed (assicura che sia booleano)
                      pressed={!!field.value}
                      // Mappa onPressedChange su field.onChange
                      onPressedChange={(pressed) => {
                        field.onChange(pressed);
                      }}
                    >
                      <Star className={field.value ? "fill-primary text-primary" : ""} />
                    </Toggle>
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
