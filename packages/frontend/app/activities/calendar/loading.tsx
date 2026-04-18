import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
      <Skeleton className="h-100" />
      <Skeleton className="h-150" />
    </div>
  );
}