import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDetailSkeleton() {
  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <Skeleton className="h-100 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-100 w-full" />
        </Card>
      </div>
    </>
  );
}