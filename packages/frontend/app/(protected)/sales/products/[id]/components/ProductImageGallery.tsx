import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/types/product";
import { FC } from "react";

interface ProductImageGalleryProps {
    productName: string;
    images: ProductImage[];
    selectedImage: string;
    onImageSelect: (url: string) => void;
}

export const ProductImageGallery: FC<ProductImageGalleryProps> = ({
    productName,
    images,
    selectedImage,
    onImageSelect,
}) => (
    <Card>
        <CardContent className="p-6">
            <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {selectedImage ? (
                        <img
                            src={selectedImage}
                            alt={productName}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-muted-foreground">No image available</div>
                    )}
                </div>
                {images && images.length > 1 && (
                    <div className="grid grid-cols-6 gap-2">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => onImageSelect(img.imageUrl)} // Assicurati che il tipo ProductImage abbia 'imageUrl'
                                className={cn(
                                    'aspect-square rounded-md overflow-hidden border-2 transition-all',
                                    selectedImage === img.imageUrl
                                        ? 'border-primary'
                                        : 'border-transparent hover:border-muted-foreground/50'
                                )}
                            >
                                <img
                                    src={img.imageUrl}
                                    alt={`${productName} ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
);