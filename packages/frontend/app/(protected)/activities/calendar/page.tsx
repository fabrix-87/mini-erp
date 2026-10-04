// app/activities/calendar/page.tsx
import { getTranslations } from "next-intl/server";
import { ActivityCalendar } from "../components/activity-calendar";
import { PageHeader } from "@/components/page-header";
import { SearchParamsProps } from "@/types/page-types";

interface CalendarPageProps {
  date?: string;
  month?: string;
}

export default async function ActivityCalendarPage({
  searchParams,
}: SearchParamsProps<CalendarPageProps>) {
  const { date, month } = await searchParams;
  const t = await getTranslations("activities.calendar");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("description")} />
      <ActivityCalendar initialDate={date ?? null} initialMonth={month ?? null} />
    </>
  );
}

// Metadata
export async function generateMetadata() {
  const t = await getTranslations("activities.calendar");
  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
