/**
 * @module document-fulfillment-routes
 * @description Routes for document fulfillment tracking:
 * full details, status summary, per-line delivered quantity update,
 * and delivery note generation from an order.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import { validateDocumentId } from "../../validators/document-validator";
import {
  getDocumentFulfillment,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const fulfillmentRoutes = createHonoApp();

/**
 * Returns the fulfillment status and per-line breakdown of an order.
 * Delivered quantities derive from formalized delivery notes and are read-only.
 * @route GET /api/documents/:id/fulfillment
 * @access Private (document:read | document:manage)
  */
fulfillmentRoutes.get(
  "/:id/fulfillment",
  authorize(["document:read", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  getDocumentFulfillment,
);

export default fulfillmentRoutes;
