// app/activities/activities-client.tsx - Client Component for interactivity
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Users,
  Video,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Activity, ActivityDashboardStats } from "@/types/activitiy";

const activityTypeIcons: Record<string, any> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  task: FileText,
  note: FileText,
  visit: MapPin,
  demo: Video,
};

const activityTypeColors: Record<string, string> = {
  call: "bg-blue-500/10 text-blue-700",
  email: "bg-purple-500/10 text-purple-700",
  meeting: "bg-green-500/10 text-green-700",
  task: "bg-orange-500/10 text-orange-700",
  note: "bg-gray-500/10 text-gray-700",
  visit: "bg-cyan-500/10 text-cyan-700",
  demo: "bg-pink-500/10 text-pink-700",
};

const statusColors: Record<string, string> = {
  planned: "bg-yellow-500/10 text-yellow-700",
  in_progress: "bg-blue-500/10 text-blue-700",
  completed: "bg-green-500/10 text-green-700",
  cancelled: "bg-red-500/10 text-red-700",
};

const priorityColors: Record<string, string> = {
  low: "border-gray-300",
  medium: "border-blue-500",
  high: "border-orange-500",
  urgent: "border-red-500",
};

interface ActivitiesClientProps {
  initialActivities: Activity[];
  initialStats: ActivityDashboardStats | null;
  initialPagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  user: any;
  initialFilters: {
    page: number;
    typeFilter: string;
    statusFilter: string;
    priorityFilter: string;
    dateFilter: string;
    searchQuery: string;
  };
}

export default function ActivitiesClient({
  initialActivities,
  initialStats,
  initialPagination,
  user,
  initialFilters,
}: ActivitiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<"list" | "calendar">(
    (searchParams.get("view") as "list" | "calendar") || "list"
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Update URL with new filters
  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Use startTransition for smoother navigation
    startTransition(() => {
      router.push(`/activities?${params.toString()}`);
    });
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value, page: "1" });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() });
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as "list" | "calendar");
    updateFilters({ view: mode });
  };

  const getActivityIcon = (type: string) => {
    return activityTypeIcons[type] || FileText;
  };

  const isOverdue = (activity: Activity) => {
    return (
      activity.status === "planned" &&
      new Date(activity.scheduledDate) < new Date()
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
      }),
      time: date.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      full: date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attività</h1>
          <p className="text-muted-foreground">
            Gestisci tutte le tue attività e interazioni
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/activities/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Attività
        </Button>
      </div>

      {/* Stats Cards */}
      {initialStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oggi</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialStats.todayCount}</div>
              <p className="text-xs text-muted-foreground">attività</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Questa Settimana
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialStats.upcomingWeek}</div>
              <p className="text-xs text-muted-foreground">attività</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pianificate</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialStats.planned}</div>
              <p className="text-xs text-muted-foreground">da completare</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialStats.completed}</div>
              <p className="text-xs text-muted-foreground">questo mese</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Ritardo</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {initialStats.overdue}
              </div>
              <p className="text-xs text-muted-foreground">urgenti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialStats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">media</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={handleViewModeChange}>
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cerca attività..."
                    className="pl-8"
                    defaultValue={initialFilters.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={initialFilters.dateFilter}
                    onValueChange={(value) => handleFilterChange("date", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Data" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte</SelectItem>
                      <SelectItem value="today">Oggi</SelectItem>
                      <SelectItem value="tomorrow">Domani</SelectItem>
                      <SelectItem value="week">Questa settimana</SelectItem>
                      <SelectItem value="overdue">In ritardo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={initialFilters.typeFilter}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="call">Chiamata</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Riunione</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="visit">Visita</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={initialFilters.statusFilter}
                    onValueChange={(value) => handleFilterChange("status", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="planned">Pianificata</SelectItem>
                      <SelectItem value="in_progress">In corso</SelectItem>
                      <SelectItem value="completed">Completata</SelectItem>
                      <SelectItem value="cancelled">Annullata</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={initialFilters.priorityFilter}
                    onValueChange={(value) => handleFilterChange("priority", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Priorità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Bassa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="text-center py-8 text-muted-foreground">
                  Caricamento...
                </div>
              ) : initialActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Nessuna attività trovata
                  </p>
                  <p className="text-sm">
                    Prova a cambiare i filtri o crea una nuova attività
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {initialActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.activityType);
                    const datetime = formatDateTime(activity.scheduledDate);
                    const overdue = isOverdue(activity);

                    return (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-4 p-4 border-l-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                          priorityColors[activity.priority]
                        } ${overdue ? "bg-red-500/5" : ""}`}
                        onClick={() =>
                          router.push(`/dashboard/activities/${activity.id}`)
                        }
                      >
                        {/* Icon & Date */}
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              activityTypeColors[activity.activityType]
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-xs font-medium text-center">
                            {datetime.date}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {datetime.time}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="font-medium truncate">
                              {activity.subject}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Badge
                                variant="secondary"
                                className={statusColors[activity.status]}
                              >
                                {activity.status}
                              </Badge>
                              {activity.priority === "high" && (
                                <Badge
                                  variant="outline"
                                  className="border-orange-500 text-orange-700"
                                >
                                  Alta
                                </Badge>
                              )}
                            </div>
                          </div>

                          {activity.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {activity.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px]">
                                {activity.Company?.companyName}
                              </span>
                            </div>

                            {activity.Contact && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                •
                                <span className="truncate">
                                  {activity.Contact.firstName}{" "}
                                  {activity.Contact.lastName}
                                </span>
                              </div>
                            )}

                            {activity.location && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">
                                  {activity.location}
                                </span>
                              </div>
                            )}

                            {activity.durationMinutes && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {activity.durationMinutes}min
                              </div>
                            )}

                            {overdue && (
                              <div className="flex items-center gap-1.5 text-red-600 font-medium">
                                <AlertCircle className="h-3.5 w-3.5" />
                                In ritardo
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {initialPagination && initialPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Pagina {initialPagination.page} di {initialPagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(Math.max(1, initialPagination.page - 1))
                      }
                      disabled={initialPagination.page === 1 || isPending}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            initialPagination.totalPages,
                            initialPagination.page + 1
                          )
                        )
                      }
                      disabled={
                        initialPagination.page === initialPagination.totalPages ||
                        isPending
                      }
                    >
                      Successiva
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
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
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      updateFilters({
                        date: "custom",
                        customDate: date.toISOString().split("T")[0],
                      });
                    }
                  }}
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
                  {initialActivities.length} attività programmate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Caricamento...
                  </div>
                ) : initialActivities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna attività programmata per questa data</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push("/dashboard/activities/new")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Aggiungi Attività
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...initialActivities]
                      .sort(
                        (a, b) =>
                          new Date(a.scheduledDate).getTime() -
                          new Date(b.scheduledDate).getTime()
                      )
                      .map((activity) => {
                        const Icon = getActivityIcon(activity.activityType);
                        const datetime = formatDateTime(activity.scheduledDate);

                        return (
                          <div
                            key={activity.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() =>
                              router.push(`/dashboard/activities/${activity.id}`)
                            }
                          >
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                activityTypeColors[activity.activityType]
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {activity.subject}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {activity.Company?.companyName}
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {datetime.time}
                            </div>
                            <Badge
                              variant="secondary"
                              className={statusColors[activity.status]}
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
