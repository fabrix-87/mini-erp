import { validateQuery } from "@/middleware/validation-middleware";
import { languageQuerySchema } from "@mini-erp/shared";

export const validateLanguageQuery = validateQuery(languageQuerySchema, "Language query");
