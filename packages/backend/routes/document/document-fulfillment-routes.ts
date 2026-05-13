/**
 * @module document-fulfillment-routes
 * @description Routes for document fulfillment tracking:
 * full details, status summary, per-line delivered quantity update,
 * and delivery note generation from an order.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authenticateToken, authorize } from "../../middleware/auth-middleware";
import { validateDocumentId, validateDocumentLineId } from "../../validators/document-validator";
import {
  getDocumentFulfillment,
  getFulfillmentStatus,
  updateLineDelivered,
  createDeliveryNote,
} from "../../controllers/document";

const fulfillmentRoutes = createHonoApp();

/**
 * @route GET /api/documents/:id/fulfillment
 * @desc  Get full fulfillment details for a document (lines with delivered/invoiced qty)
 * @access Private (document:read)
 */
fulfillmentRoutes.get(
  "/:id/fulfillment",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentFulfillment,
);

/**
 * @route GET /api/documents/:id/fulfillment/status
 * @desc  Get a summary fulfillment status (PENDING | PARTIAL | COMPLETE)
 * @access Private (document:read)
 */
fulfillmentRoutes.get(
  "/:id/fulfillment/status",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getFulfillmentStatus,
);

/**
 * @route PATCH /api/documents/:id/lines/:lineId/delivered
 * @desc  Update the delivered quantity for a single document line
 * @access Private (document:update)
 */
fulfillmentRoutes.patch(
  "/:id/lines/:lineId/delivered",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentLineId,
  updateLineDelivered,
);

/**
 * @route POST /api/documents/:id/create-delivery-note
 * @desc  Generate a delivery note (DDT) from a confirmed order
 * @access Private (document:create)
 */
fulfillmentRoutes.post(
  "/:id/create-delivery-note",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  validateDocumentId,
  createDeliveryNote,
);

export default fulfillmentRoutes;
