import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FC } from "react";

export const ProductSkeleton: FC = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-36" /> {/* Back Button */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sezione Immagini */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="grid grid-cols-6 gap-2">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-md" />
                        ))}
                    </div>
                </CardContent>
            </Card>
            {/* Sezione Info */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-12 w-1/3 mb-2" />
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                        <Separator />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        {/* Sezione Tabs */}
        <Card>
            <CardContent className="p-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
    </div>
);