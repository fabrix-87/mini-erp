import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoadingSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="rounded-lg border bg-card">
        <Skeleton className="h-100 w-full" />
      </div>
    </>
  );
}