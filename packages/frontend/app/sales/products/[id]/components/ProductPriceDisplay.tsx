
import { Product, ProductVariant } from "@/types/product";
import { FC } from "react";

interface ProductPriceDisplayProps {
    product: Product;
    currentVariant: ProductVariant | null;
}

export const ProductPriceDisplay: FC<ProductPriceDisplayProps> = ({ product, currentVariant }) => {
    const getPriceDisplay = () => {
        // 1. Se una variante è selezionata, mostra il suo prezzo
        if (currentVariant) {
            return (
                <span className="text-3xl font-bold">
                    €{parseFloat(currentVariant.priceTaxExcluded)?.toFixed(2) || '0.00'}
                </span>
            );
        }
        
        // 3. Altrimenti, mostra il prezzo base del prodotto
        return (
            <span className="text-3xl font-bold">
                €{parseFloat(product.priceTaxExcluded).toFixed(2)}
            </span>
        );
    };

    return (
        <div>
            <div className="flex items-baseline gap-2">{getPriceDisplay()}</div>
            <p className="text-sm text-muted-foreground mt-1">IVA esclusa</p>
        </div>
    );
};