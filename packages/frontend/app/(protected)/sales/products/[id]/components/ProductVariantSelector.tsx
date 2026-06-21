import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AttributeGroup } from "@/types/product";
import { Check } from "lucide-react";
import { FC } from "react";

interface ProductVariantSelectorProps {
    attributeGroups: AttributeGroup[];
    selectedAttributes: Record<string, string>;
    onAttributeChange: (groupCode: string, attrCode: string) => void;
}

export const ProductVariantSelector: FC<ProductVariantSelectorProps> = ({
    attributeGroups,
    selectedAttributes,
    onAttributeChange,
}) => (
    <>
        {attributeGroups && attributeGroups.length > 0 && (
            <div className="space-y-4">
                {attributeGroups.map((group) => (
                    <div key={group.code} className="space-y-2">
                        <label className="text-sm font-medium">{group.name}</label>
                        
                        {group.displayType === 'color' ? (
                            <div className="flex flex-wrap gap-2">
                                {group.values?.map((value) => (
                                    <button
                                        key={value.code}
                                        onClick={() => onAttributeChange(group.code, value.code)}
                                        className={cn(
                                            'relative h-10 w-10 rounded-full border-2 transition-all',
                                            selectedAttributes[group.code] === value.code
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-muted hover:border-muted-foreground/50'
                                        )}
                                        style={{ backgroundColor: `#${value.colorHex}` }}
                                        title={value.name}
                                    >
                                        {selectedAttributes[group.code] === value.code && (
                                            <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {group.values?.map((value) => (
                                    <Button
                                        key={value.code}
                                        variant={selectedAttributes[group.code] === value.code ? 'default' : 'outline'}
                                        onClick={() => onAttributeChange(group.code, value.code)}
                                        className="h-auto py-2"
                                    >
                                        {value.name}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
    </>
);