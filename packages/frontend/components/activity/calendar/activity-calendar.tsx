// components/activity/calendar/activity-calendar.tsx
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useActivities } from "@/hooks/use-activity";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { formatDateForUrl } from "@/helpers/date-helper";

const activityTypeLabels: Record<string, string> = {
  CALL: "Chiamata",
  EMAIL: "Email",
  MEETING: "Riunione",
  TASK: "Task",
  NOTE: "Nota",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  VIDEO_CALL: "Videochiamata",
  SITE_VISIT: "Visita",
  OTHER: "Altro",
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  COMPLETED: "bg-green-500/10 text-green-700 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  RESCHEDULED: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  NO_SHOW: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

const priorityColors: Record<string, string> = {
  LOW: "border-l-gray-400",
  MEDIUM: "border-l-blue-500",
  HIGH: "border-l-orange-500",
  URGENT: "border-l-red-500",
};

export function ActivityCalendar() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch attività del mese corrente
  const { data: activitiesData, isLoading } = useActivities({
    startDate: startOfMonth(currentMonth).toISOString(),
    endDate: endOfMonth(currentMonth).toISOString(),
    page: 1,
    limit: 100,
    sortBy: "scheduledStart",
    sortOrder: "asc",
  });

  const activities = activitiesData?.data || [];

  // Filtra attività per il giorno selezionato
  const selectedDayActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.scheduledStart);
    return (
      activityDate.getDate() === selectedDate.getDate() &&
      activityDate.getMonth() === selectedDate.getMonth() &&
      activityDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Giorni con attività (per evidenziarli nel calendario)
  const daysWithActivities = activities.reduce((acc, activity) => {
    const date = format(new Date(activity.scheduledStart), "yyyy-MM-dd");
    acc.add(date);
    return acc;
  }, new Set<string>());

  const handleMonthChange = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleActivityClick = (activityId: number) => {
    router.push(`/activities/${activityId}`);
  };

  const handleNewActivity = () => {
    const dateStr = formatDateForUrl(selectedDate);
    router.push(`/activities/new?date=${dateStr}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
      {/* Calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => handleMonthChange(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {format(currentMonth, "MMMM yyyy", { locale: it })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={() => handleMonthChange(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={it}
            className="rounded-md border"
            modifiers={{
              hasActivities: (date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return daysWithActivities.has(dateStr);
              },
            }}
            modifiersClassNames={{
              hasActivities: "bg-primary/10 font-bold",
            }}
          />

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-primary/10 border-2 border-primary/30"></div>
              <span className="text-muted-foreground">Giorni con attività</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Attività del Giorno */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDayActivities.length === 0
                  ? "Nessuna attività programmata"
                  : `${selectedDayActivities.length} attività`}
              </p>
            </div>
            <Button onClick={handleNewActivity}>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Attività
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : selectedDayActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nessuna attività per questo giorno.</p>
              <Button variant="link" onClick={handleNewActivity} className="mt-2">
                Crea la prima attività
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayActivities
                .sort(
                  (a, b) =>
                    new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime(),
                )
                .map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.id)}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      priorityColors[activity.priority]
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Orario e Tipo */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">
                            {format(new Date(activity.scheduledStart), "HH:mm")}
                          </span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {activityTypeLabels[activity.type]}
                          </Badge>
                          {activity.duration && (
                            <>
                              <span>•</span>
                              <span>{activity.duration} min</span>
                            </>
                          )}
                        </div>

                        {/* Soggetto */}
                        <h4 className="font-semibold">
                          {activity.customer
                            ? activity.customer.company.companyName
                            : activity.lead?.companyName}{" "}
                          • {activity.subject}
                        </h4>

                        {/* Cliente */}
                        {activity.customer && (
                          <p className="text-sm text-muted-foreground">
                            {activity.customer.company.companyName}
                          </p>
                        )}

                        {/* Contatto */}
                        {activity.contact && (
                          <p className="text-sm text-muted-foreground">
                            👤 {activity.contact.firstName} {activity.contact.lastName}
                          </p>
                        )}
                        {activity.lead && (
                          <p className="text-sm text-muted-foreground">
                            👤 {activity.lead.contactFirstName} {activity.lead.contactLastName}
                          </p>
                        )}

                        {/* Location (se presente) */}
                        {activity.location && (
                          <p className="text-sm text-muted-foreground">📍 {activity.location}</p>
                        )}
                      </div>

                      {/* Status e Priorità */}
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={statusColors[activity.status]}>{activity.status}</Badge>
                        <Badge
                          variant={
                            activity.priority === "URGENT" || activity.priority === "HIGH"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {activity.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
