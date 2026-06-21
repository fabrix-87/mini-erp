import { Badge } from "@/components/ui/badge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/product";
import { FC } from "react";

interface ProductHeaderProps {
    product: Product;
}

export const ProductHeader: FC<ProductHeaderProps> = ({ product }) => (
    <CardHeader>
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <CardTitle className="text-2xl">{product.translations[0].name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <span className="font-mono">{product.reference}</span>
                    <Badge variant="outline">{product.supplierId}</Badge>
                </CardDescription>
            </div>
            <Badge variant={product.active ? 'default' : 'destructive'}>
                {product.active ? 'Attivo' : 'Disattivo'}
            </Badge>
        </div>
    </CardHeader>
);