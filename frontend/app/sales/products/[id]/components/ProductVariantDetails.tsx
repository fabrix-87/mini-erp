import { Badge } from "@/components/ui/badge";
import { ProductVariant } from "@/types/product";

import { Check, X } from "lucide-react";
import { FC } from "react";

interface ProductVariantDetailsProps {
    currentVariant: ProductVariant | null;
}

export const ProductVariantDetails: FC<ProductVariantDetailsProps> = ({ currentVariant }) => (
    <>
        {currentVariant ? (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">SKU Variante</span>
                    <span className="font-mono text-sm">{currentVariant.variantCode}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Disponibilità</span>
                    <Badge variant={currentVariant.quantity > 0 ? 'default' : 'destructive'}>
                        {currentVariant.quantity > 0 ? (
                            <><Check className="mr-1 h-3 w-3" /> {currentVariant.quantity} pz</>
                        ) : (
                            <><X className="mr-1 h-3 w-3" /> Esaurito</>
                        )}
                    </Badge>
                </div>
            </div>
        ) : (
            <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                    Seleziona tutti gli attributi per vedere la disponibilità
                </p>
            </div>
        )}
    </>
);