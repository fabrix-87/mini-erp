import { ApiResponse } from "@/types/api";
import api from "../client";
import {
  OverviewData,
  DataRangeProps,
  DocumentDashboardStats,
} from "@/types/dashboard";

export const getDashboardOverview = async (
  dateRange: DataRangeProps
): Promise<ApiResponse<OverviewData>> => {
  const response = await api.get("/dashboard/overview", {
    params: {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
  });
  return response.data;
};

export const getDashboardDocumentsStats = async (): Promise<
  ApiResponse<DocumentDashboardStats>
> => {
  const response = await api.get("/dashboard/documents");
  return response.data;
};
