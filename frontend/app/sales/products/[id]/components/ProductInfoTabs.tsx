import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Product, ProductVariant } from "@/types/product";
import { FC } from "react";

interface ProductInfoTabsProps {
    product: Product;
    currentVariant: ProductVariant | null;
    onVariantSelect: (variant: ProductVariant) => void;
}


export const ProductInfoTabs: FC<ProductInfoTabsProps> = ({ product, currentVariant, onVariantSelect }) => (
    <Card>
        <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Descrizione</TabsTrigger>
                    <TabsTrigger value="specs">Specifiche</TabsTrigger>
                    <TabsTrigger value="variants">Varianti ({product.variants?.length || 0})</TabsTrigger>
                </TabsList>
                
                {/* Tab Descrizione */}
                <TabsContent value="description" className="space-y-4 mt-4">
                    {/* ... logica descrizione ... */}
                    {product.translations && product.translations[0].shortDescription && (
                        <div>
                            <h3 className="font-semibold mb-2">Descrizione breve</h3>
                            <p className="text-muted-foreground">{product.translations[0].shortDescription}</p>
                        </div>
                    )}
                    {product.translations && product.translations[0].description && (
                        <div>
                            <h3 className="font-semibold mb-2">Descrizione completa</h3>
                            <div 
                                className="prose prose-sm max-w-none text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: product.translations[0].description }}
                            />
                        </div>
                    )}
                </TabsContent>
                
                {/* Tab Specifiche */}
                <TabsContent value="specs" className="mt-4">
                    {currentVariant ? (
                        <div className="grid grid-cols-2 gap-4">
                           {/* ... logica specifiche ... */}
                           <div className="space-y-2">
                               <p className="text-sm font-medium">Dimensioni (L x W x H)</p>
                               <p className="text-sm text-muted-foreground">
                                   {currentVariant.width} x {currentVariant.height} x {currentVariant.depth} cm
                               </p>
                           </div>
                           <div className="space-y-2">
                               <p className="text-sm font-medium">Peso</p>
                               <p className="text-sm text-muted-foreground">
                                   {currentVariant.weight} kg
                               </p>
                           </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            Seleziona una variante per vedere le specifiche
                        </p>
                    )}
                </TabsContent>
                
                {/* Tab Lista Varianti */}
                <TabsContent value="variants" className="mt-4">
                    <div className="space-y-2">
                        {product.variants?.map((variant) => (
                            <div
                                key={variant.id}
                                className={cn(
                                    'flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer',
                                    currentVariant?.id === variant.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                )}
                                onClick={() => onVariantSelect(variant)}
                            >
                               {/* ... logica lista varianti ... */}
                                <div className="flex items-center gap-4">
                                    {variant.coverImageUrl && (
                                        <img
                                            src={variant.coverImageUrl}
                                            alt={variant.variantCode}
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium font-mono text-sm">{variant.variantCode}</p>
                                        <div className="flex gap-2 mt-1">
                                            {variant.attributes.map((attr) => (
                                                <Badge key={attr.code} variant="outline" className="text-xs">
                                                    {attr.translations[0]?.name || attr.code}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">€{variant.priceTaxExcluded}</p>
                                    <Badge variant={variant.quantity > 0 ? 'default' : 'destructive'} className="mt-1">
                                        {variant.quantity} pz
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
);