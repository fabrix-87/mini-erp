"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  updateProductSchema,
  type Product,
  type CreateProductFormValues,
  type UpdateProductFormValues,
} from "@mini-erp/shared";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormFooter } from "@/components/form/form-footer";

type ProductFormMode = "create" | "edit";

type ProductFormSubmitValues = CreateProductFormValues | UpdateProductFormValues;

interface ProductFormProps {
  mode: ProductFormMode;
  product?: Product;
  onSubmit: (values: ProductFormSubmitValues) => Promise<void> | void;
  isPending?: boolean;
}

const emptyVariant = {
  variantCode: "",
  sku: "",
  ean13: null,
  upc: null,
  isbn: null,
  mpn: null,
  minimalQuantity: 1,
  lowStockThreshold: 0,
  lowStockAlertEnabled: false,
  location: null,
  packStockType: "USE_PACK_STOCK_ONLY" as const,
  outOfStockType: "DENY_ORDERS" as const,
  availableDate: null,
  price: null,
  wholesalePrice: null,
  unitPriceRatio: "0",
  weight: null,
  width: null,
  height: null,
  depth: null,
  position: 0,
  isDefault: true,
  active: true,
  availableForOrder: true,
  metadata: null,
};

function toInputValue(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Form condiviso per creazione e modifica prodotto.
 *
 * Le validazioni provengono direttamente da createProductSchema e
 * updateProductSchema. Il componente non dipende da server action specifiche:
 * il chiamante passa la propria funzione onSubmit.
 */
export function ProductForm({
  mode,
  product,
  onSubmit,
  isPending: externalPending = false,
}: ProductFormProps) {
  const isEdit = mode === "edit";

  const defaultValues = {
    type: product?.type ?? "STANDARD",
    status: product?.status ?? "DRAFT",
    reference: product?.reference ?? "",
    active: product?.active ?? true,
    availableForOrder: product?.availableForOrder ?? true,
    showPrice: product?.showPrice ?? true,
    onlineOnly: product?.onlineOnly ?? false,
    onSale: product?.onSale ?? false,
    price: toInputValue(product?.price ?? 0),
    wholesalePrice: toInputValue(product?.wholesalePrice ?? 0),
    ecotax: toInputValue(product?.ecotax ?? 0),
    defaultTaxRuleId: product?.defaultTaxRuleId ?? null,
    visibility: product?.visibility ?? "BOTH",
    condition: product?.condition ?? "NEW",
    showCondition: product?.showCondition ?? false,
    manufacturerId: product?.manufacturerId ?? null,
    supplierId: product?.supplierId ?? null,
    additionalShippingCost: toInputValue(product?.additionalShippingCost ?? 0),
    deliveryTimeNoteType: product?.deliveryTimeNoteType ?? 0,
    redirectType: product?.redirectType ?? "NOT_FOUND",
    redirectTargetId: product?.redirectTargetId ?? null,
    coverThumbnailUrl: product?.coverThumbnailUrl ?? null,
    variants:
      product?.variants?.length
        ? product.variants.map((variant, index) => ({
            variantCode: variant.variantCode,
            sku: variant.sku,
            ean13: variant.ean13 ?? null,
            upc: variant.upc ?? null,
            isbn: variant.isbn ?? null,
            mpn: variant.mpn ?? null,
            minimalQuantity: variant.minimalQuantity,
            lowStockThreshold: variant.lowStockThreshold,
            lowStockAlertEnabled: variant.lowStockAlertEnabled,
            location: variant.location ?? null,
            packStockType: variant.packStockType,
            outOfStockType: variant.outOfStockType,
            availableDate: variant.availableDate
              ? new Date(variant.availableDate).toISOString().slice(0, 10)
              : null,
            price: toInputValue(variant.price),
            wholesalePrice: toInputValue(variant.wholesalePrice),
            unitPriceRatio: toInputValue(variant.unitPriceRatio ?? 0),
            weight: variant.weight ?? null,
            width: variant.width ?? null,
            height: variant.height ?? null,
            depth: variant.depth ?? null,
            position: variant.position ?? index,
            isDefault: variant.isDefault,
            active: variant.active,
            availableForOrder: variant.availableForOrder,
            metadata: variant.metadata ?? null,
          }))
        : [emptyVariant],
  };

  const createForm = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    mode: "onTouched",
    defaultValues: defaultValues as CreateProductFormValues,
  });

  const updateForm = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    mode: "onTouched",
    defaultValues: defaultValues as UpdateProductFormValues,
  });

  // Un unico provider per la UI, mantenendo i due resolver distinti.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (isEdit ? updateForm : createForm) as any;
  const activeForm = isEdit ? updateForm : createForm;
  const { fields, append, remove } = useFieldArray({
    control: activeForm.control,
    name: "variants",
  });
  const isPending = externalPending || form.formState.isSubmitting;

  useEffect(() => {
    if (!isEdit && fields.length === 0) {
      append(emptyVariant);
    }
  }, [append, fields.length, isEdit]);

  const handleSubmit = async (values: ProductFormSubmitValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dati generali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Riferimento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. PROD-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo prodotto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="PACK">Confezione</SelectItem>
                        <SelectItem value="VIRTUAL">Virtuale</SelectItem>
                        <SelectItem value="SERVICE">Servizio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Bozza</SelectItem>
                        <SelectItem value="ACTIVE">Attivo</SelectItem>
                        <SelectItem value="ARCHIVED">Archiviato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilità</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BOTH">Catalogo e ricerca</SelectItem>
                        <SelectItem value="CATALOG">Solo catalogo</SelectItem>
                        <SelectItem value="SEARCH">Solo ricerca</SelectItem>
                        <SelectItem value="NONE">Nascosto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <div className="grid gap-4 md:grid-cols-3">
              {([
                ["active", "Attivo"],
                ["availableForOrder", "Disponibile per l'ordine"],
                ["showPrice", "Mostra prezzo"],
                ["onlineOnly", "Solo online"],
                ["onSale", "In promozione"],
              ] as const).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prezzi e logistica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {([
                ["price", "Prezzo di vendita"],
                ["wholesalePrice", "Prezzo all'ingrosso"],
                ["ecotax", "Ecotassa"],
                ["additionalShippingCost", "Costo spedizione aggiuntivo"],
              ] as const).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label} (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.000001"
                          {...field}
                          value={toInputValue(field.value)}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condizione</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">Nuovo</SelectItem>
                        <SelectItem value="USED">Usato</SelectItem>
                        <SelectItem value="REFURBISHED">Ricondizionato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverThumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL immagine copertina</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Variante e SKU</CardTitle>
              <Button type="button" variant="outline" onClick={() => append({
                ...emptyVariant,
                position: fields.length,
                isDefault: false,
                variantCode: "",
                sku: "",
              })}>
                Aggiungi variante
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((variant, index) => (
              <div key={variant.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Variante {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => remove(index)}>
                      Rimuovi
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.variantCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice variante *</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.ean13`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EAN-13</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value || null)} maxLength={13} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prezzo variante (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.000001"
                            value={toInputValue(field.value)}
                            onChange={(event) => field.onChange(event.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {([
                    ["isDefault", "Variante predefinita"],
                    ["active", "Attiva"],
                    ["availableForOrder", "Ordinabile"],
                  ] as const).map(([name, label]) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={`variants.${index}.${name}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
            <p className="text-muted-foreground text-sm">
              È richiesta almeno una variante e una variante predefinita.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => form.reset(defaultValues)}>
            Ripristina
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Crea prodotto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
