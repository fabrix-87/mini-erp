import { createHonoApp } from "../lib/hono-app";
import authRoutes from "./auth-routes";
import companyRoutes from "./company-routes";
import customerRoutes from "./customer-routes";
import dashboardRoutes from "./dashboard-routes";
import leadRoutes from "./lead-routes";
import roleRoutes from "./role-routes";
import userRoutes from "./user-routes";

const apiRoutes = createHonoApp();

/**
 * Registers all API route groups.
 */
apiRoutes.route("/auth", authRoutes);
apiRoutes.route("/users", userRoutes);
apiRoutes.route("/roles", roleRoutes);
apiRoutes.route("/leads", leadRoutes);
apiRoutes.route("/customers", customerRoutes);
apiRoutes.route("/companies", companyRoutes);
apiRoutes.route("/dashboard", dashboardRoutes);

export default apiRoutes;
/*
import { Router } from "express";

import activitiesRouter from "./activity";
import addressesRouter from "./address";
import contactsRouter from "./contact";
import customersRouter from "./customer";
import dashboardsRouter from "./dashboard";
import documentsRouter from "./document";
import opportunitiesRouter from "./opportunity";
import paymentsRouter from "./payment";
import pricelistsRouter from "./pricelist";
import productsRouter from "./product";
import rolesRouter from "./role";
import suppliersRouter from "./supplier";
import taxesRouter from "./tax";
import usersRouter from "./user";
import companiesRouter from "./company";
import countryRouter from "./country";
import currencyRouter from "./currency";
import leadRouter from "./lead";
import languagesRouter from "./languages";

const apiRouter = Router();

apiRouter.use("/activities", activitiesRouter);
apiRouter.use("/addresses", addressesRouter);
apiRouter.use("/companies", companiesRouter);
apiRouter.use("/contacts", contactsRouter);
apiRouter.use("/customers", customersRouter);

apiRouter.use("/documents", documentsRouter);
apiRouter.use("/opportunities", opportunitiesRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/pricelists", pricelistsRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/suppliers", suppliersRouter);
apiRouter.use("/taxes", taxesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/countries", countryRouter);
apiRouter.use("/currencies", currencyRouter);
apiRouter.use("/leads", leadRouter);
apiRouter.use("/languages", languagesRouter);

export default apiRouter;
*/