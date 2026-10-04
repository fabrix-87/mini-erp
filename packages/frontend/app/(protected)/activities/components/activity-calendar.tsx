// components/activity/calendar/activity-calendar.tsx
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useActivities } from "@/hooks/use-activity";
import { format, startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";
import { formatDateForUrl } from "@/helpers/date-helper";
import { useNavigation } from "@/hooks/use-navigation";
import { useFormatter, useTranslations } from "next-intl";
import { ActivityCard } from "@/components/activity/activity-card";
import { useCurrentDateFnsLocale } from "@/utils/locale";
import { useUpdateURL } from "@/hooks/use-update-url";
import { getRoute } from "@/lib/navigation-routes";

interface ActivityCalendarProps {
  /**
   * Initial date from the URL (yyyy-MM-dd).
   * If not provided, falls back to today.
   */
  initialDate?: string | null;

  /**
   * Initial month from the URL (yyyy-MM).
   * If not provided, falls back to the month of initialDate or today.
   */
  initialMonth?: string | null;
}
/**
 * Parses a date from the URL or returns today's date.
 *
 * @param value - ISO date string in yyyy-MM-dd format
 * @returns Valid parsed date or today's date
 */
function getInitialDate(value: string | null | undefined): Date {
  if (!value) {
    return new Date();
  }

  const parsedDate = parseISO(value);

  return isValid(parsedDate) ? parsedDate : new Date();
}

/**
 * Parses the calendar month from the URL.
 *
 * @param value - Month string in yyyy-MM format
 * @param fallbackDate - Date used when the URL month is missing or invalid
 * @returns First day of the selected month
 */
function getInitialMonth(value: string | null | undefined, fallbackDate: Date): Date {
  if (!value) {
    return startOfMonth(fallbackDate);
  }

  const parsedMonth = parseISO(`${value}-01`);

  return isValid(parsedMonth) ? startOfMonth(parsedMonth) : startOfMonth(fallbackDate);
}

export function ActivityCalendar({ initialDate, initialMonth }: ActivityCalendarProps) {
  const updateURL = useUpdateURL(getRoute("activities_calendar"));

  const initialSelectedDate = getInitialDate(initialDate);
  const initialCurrentMonth = getInitialMonth(initialMonth, initialSelectedDate);

  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialCurrentMonth);

  const t = useTranslations("activities.calendar");
  const formatter = useFormatter();
  const { dateFnsLocale: locale } = useCurrentDateFnsLocale();

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
  const { navigateToDetail, navigateToNew } = useNavigation();

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

  function handleMonthChange(month: Date): void {
    const normalizedMonth = startOfMonth(month);
    const nextSelectedDate = new Date(normalizedMonth);

    setCurrentMonth(normalizedMonth);
    setSelectedDate(nextSelectedDate);

    updateURL(
      {
        date: format(nextSelectedDate, "yyyy-MM-dd"),
        month: format(normalizedMonth, "yyyy-MM"),
      },
    );
  }

  function handleDateSelect(date: Date | undefined): void {
    if (!date) {
      return;
    }

    const normalizedMonth = startOfMonth(date);

    setSelectedDate(date);
    setCurrentMonth(normalizedMonth);

    updateURL(
      {
        date: format(date, "yyyy-MM-dd"),
        month: format(normalizedMonth, "yyyy-MM"),
      },
      {
        replace: true,
        scroll: false,
      },
    );
  }

  const handleNewActivity = () => {
    const dateStr = formatDateForUrl(selectedDate);
    navigateToNew("activities", { date: dateStr });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr] space-x-6">
      {/* Calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                handleMonthChange(newMonth);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg capitalize">
              {formatter.dateTime(currentMonth, {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                handleMonthChange(newMonth);
              }}
            >
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
            locale={locale}
            captionLayout="dropdown-years"
            showWeekNumber={true}
            className="rounded-md border"
            hideNavigation
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
              <span className="text-muted-foreground">{t("hasActivities")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Attività del Giorno */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="capitalize">
                {formatter.dateTime(selectedDate, { dateStyle: "full" })}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDayActivities.length === 0
                  ? t("noActivities")
                  : `${selectedDayActivities.length} attività`}
              </p>
            </div>
            <Button onClick={handleNewActivity}>
              <Plus className="mr-2 h-4 w-4" />
              {t("newActivity")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t("loading")}</div>
          ) : selectedDayActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("noActivities")}</p>
              <Button variant="link" onClick={handleNewActivity} className="mt-2">
                {t("createFirst")}
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
                  <ActivityCard
                    key={activity.id}
                    className="bg-card"
                    activity={activity}
                    onClick={() => navigateToDetail("activities", activity.id)}
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
