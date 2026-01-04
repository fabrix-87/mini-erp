// app/components/activities/activity-calendar-view.tsx
"use client";

import { Plus, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types/activitiy";
import { ActivityCard } from "./activity-card";

interface ActivityCalendarViewProps {
  activities: Activity[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isLoading: boolean;
  onActivityClick: (id: number) => void;
  onCreateNew: () => void;
}

export function ActivityCalendarView({
  activities,
  selectedDate,
  onDateSelect,
  isLoading,
  onActivityClick,
  onCreateNew,
}: ActivityCalendarViewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[300px,1fr]">
      {/* Calendar Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Seleziona Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Activities for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attività del{" "}
            {selectedDate.toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </CardTitle>
          <CardDescription>
            {activities.length} attività programmate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna attività programmata per questa data</p>
              <Button variant="outline" className="mt-4" onClick={onCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Attività
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[...activities]
                .sort(
                  (a, b) =>
                    new Date(a.scheduledStart).getTime() -
                    new Date(b.scheduledStart).getTime()
                )
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick(activity.id)}
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
