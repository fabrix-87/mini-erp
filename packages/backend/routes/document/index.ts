/**
 * @module document-routes
 * @description Mounts all document sub-routers.
 * Bulk and report routes are registered before parametric routes
 * to prevent Hono from matching static segments as :id values.
 */
import { createHonoApp } from "../../lib/hono-app";
import crudRoutes from "./document-crud-routes";
import statusRoutes from "./document-status-routes";
import linesRoutes from "./document-lines-routes";
import conversionRoutes from "./document-conversion-routes";
import installmentRoutes from "./document-installments-routes";
import fulfillmentRoutes from "./document-fulfillment-routes";
import reportsRoutes from "./document-reports-routes";
import bulkRoutes from "./document-bulk-routes";

const documentRoutes = createHonoApp();

// Static-path routers first — must precede /:id to avoid param conflicts
documentRoutes.route("/", bulkRoutes);
documentRoutes.route("/reports", reportsRoutes);

// Parametric routers
documentRoutes.route("/", crudRoutes);
documentRoutes.route("/", statusRoutes);
documentRoutes.route("/", linesRoutes);
documentRoutes.route("/", conversionRoutes);
documentRoutes.route("/", installmentRoutes);
documentRoutes.route("/", fulfillmentRoutes);

export default documentRoutes;
