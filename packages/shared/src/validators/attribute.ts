import { z } from "zod";

export const AttributeDisplayTypeSchema = z.enum([
  "SELECT",
  "RADIO",
  "COLOR",
  "IMAGE",
]);
