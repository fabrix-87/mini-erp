import z from "zod";

export const CountrySchema = z.object({
  code: z.string().length(2, "Country code deve essere 2 caratteri"),
  name: z.string(),
  isEu: z.boolean(),
});
