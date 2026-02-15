import {z} from "zod";
import { sdiTransmissionFormatSchema } from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================


export type SdiTransmissionFormat = z.infer<typeof sdiTransmissionFormatSchema>;