"use client";

import { getProductById } from "@/lib/client/modules/product";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductSkeleton } from "./components/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Euro, Package, Warehouse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImageGallery } from "./components/ProductImageGallery";
import { ProductHeader } from "./components/ProductHeader";
import { ProductPriceDisplay } from "./components/ProductPriceDisplay";
import { ProductVariantSelector } from "./components/ProductVariantSelector";
import { Separator } from "@/components/ui/separator";
import { ProductVariantDetails } from "./components/ProductVariantDetails";
import { ProductInfoTabs } from "./components/ProductInfoTabs";
import { Product, ProductVariant } from "@mini-erp/shared";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [selectedImage, setSelectedImage] = useState<string>("");

  // **MIGLIORAMENTO: Logica di fetch e stato iniziale in useEffect**
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(productId, { locale: "it-IT" });
        setProduct(productData);

        // Seleziona variante default
        const defaultVariant =
          productData.variants?.find((v: ProductVariant) => v.isDefault) ||
          productData.variants?.[0];
        if (defaultVariant) {
          // Imposta attributi default
          const defaultAttrs: Record<string, string> = {};

          // FIX: attr.group.code invece di attr.groupCode
          defaultVariant.attributes.forEach(
            (attr: { group: { code: string | number }; code: string }) => {
              if (attr.group) {
                // Aggiungi un controllo di sicurezza
                defaultAttrs[attr.group.code] = attr.code;
              }
            }
          );
          setSelectedAttributes(defaultAttrs);

          setSelectedImage(
            defaultVariant.coverImageUrl ||
              productData.images?.[0]?.imageUrl ||
              ""
          );
        } else {
          // Imposta immagine di fallback se non ci sono varianti
          setSelectedImage(productData.images?.[0]?.imageUrl || "");
        }

        setError("");
      } catch (err: any) {
        setError("Failed to load product: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // **MIGLIORAMENTO: `currentVariant` derivato con `useMemo`**
  const currentVariant = useMemo(() => {
    if (!product || Object.keys(selectedAttributes).length === 0) {
      return null;
    }

    return (
      product.variants.find((variant) =>
        Object.entries(selectedAttributes).every(([group, code]) =>
          // FIX: Controlla a.group.code invece di a.groupCode
          variant.attributes.some(
            (a) => a.group?.code === group && a.code === code
          )
        )
      ) || null
    );
  }, [product, selectedAttributes]);

  // **MIGLIORAMENTO: `useCallback` per le funzioni**
  const handleAttributeChange = useCallback(
    (groupCode: string, attrCode: string) => {
      const newAttrs = { ...selectedAttributes, [groupCode]: attrCode };
      setSelectedAttributes(newAttrs);

      // Trova la variante e aggiorna l'immagine
      const matchingVariant = product?.variants.find((variant) =>
        Object.entries(newAttrs).every(([group, code]) =>
          variant.attributes.some(
            (a) => a.group.code === group && a.code === code
          )
        )
      );

      if (matchingVariant?.coverImageUrl) {
        setSelectedImage(matchingVariant.coverImageUrl);
      } else if (product?.images?.[0]?.imageUrl) {
        setSelectedImage(product.images[0].imageUrl);
      }
    },
    [product, selectedAttributes]
  );

  const handleImageSelect = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    const attrs: Record<string, string> = {};
    variant.attributes.forEach((a) => {
      attrs[a.group.code] = a.code;
    });
    setSelectedAttributes(attrs);
    if (variant.coverImageUrl) {
      setSelectedImage(variant.coverImageUrl);
    }
  }, []);

  // --- Stati di Render ---

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna indietro
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error || "Product not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Render Principale ---
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna ai prodotti
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonna Immagini */}
        <ProductImageGallery
          productName={product.translations?.[0]?.name || "Product"}
          images={product.images || []}
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
        />

        {/* Colonna Info e Azioni */}
        <div className="space-y-6">
          <Card>
            <ProductHeader product={product} />
            <CardContent className="space-y-6">
              <ProductPriceDisplay
                product={product}
                currentVariant={currentVariant}
              />

              <ProductVariantSelector
                attributeGroups={product.attributeGroups || []}
                selectedAttributes={selectedAttributes}
                onAttributeChange={handleAttributeChange}
              />

              <Separator />

              <ProductVariantDetails currentVariant={currentVariant} />
            </CardContent>
          </Card>

          {/* Info aggiuntive */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="text-sm font-medium">
                    {currentVariant?.weight
                      ? `${currentVariant.weight} kg`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Warehouse className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Varianti</p>
                  <p className="text-sm font-medium">
                    {product.variants?.length || 0}
                  </p>
                </div>
                <div>
                  <Euro className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Prezzo Base</p>
                  <p className="text-sm font-medium">
                    €{parseFloat(product.priceTaxExcluded).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sezione Tabs */}
      <ProductInfoTabs
        product={product}
        currentVariant={currentVariant}
        onVariantSelect={handleVariantSelect}
      />
    </div>
  );
}
