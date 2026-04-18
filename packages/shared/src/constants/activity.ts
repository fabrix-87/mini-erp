import { z } from "zod";
import { activitySortFieldsSchema, activityStatusSchema, activityTypeSchema } from "../validators";

export type ActivityStatus = z.infer<typeof activityStatusSchema>;
export type ActivityType = z.infer<typeof activityTypeSchema>;
export type ActivirySortFields = z.input<typeof activitySortFieldsSchema>;