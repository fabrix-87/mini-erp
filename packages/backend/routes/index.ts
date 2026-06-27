import { authenticateToken } from "@/middleware/auth-middleware";
import { AppBindings, createHonoApp } from "../lib/hono-app";
import addressRoutes from "./address-routes";
import authRoutes from "./auth-routes";
import companyContactRoutes from "./company-contact-routes";
import companyRoutes from "./company-routes";
import contactRoutes from "./contact-routes";
import countryRoutes from "./country-routes";
import currencyRoutes from "./currency-routes";
import customerRoutes from "./customer-routes";
import dashboardRoutes from "./dashboard-routes";
import documentRoutes from "./document";
import languageRoutes from "./languages-routes";
import leadRoutes from "./lead-routes";
import opportunityRoutes from "./opportunity-routes";
import paymentRoutes from "./payment-routes";
import pricelistRoutes from "./pricelist-routes";
import productRoutes from "./product-routes";
import roleRoutes from "./role-routes";
import supplierRoutes from "./supplier-routes";
import taxRoutes from "./tax-routes";
import tenantRoutes from "./tenant-routes";
import membershipRolesRoutes from "./user-membership-roles-routes";
import userRoutes from "./user-routes";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

export const publicRoutes = createHonoApp();
export const protectedRoutes = createHonoApp();
export const systemRoutes = createHonoApp();

publicRoutes.route("/auth", authRoutes);
publicRoutes.route("/tenant", tenantRoutes);

protectedRoutes.use("*", authenticateToken);

/** TODO: add system routes
systemRoutes.use("*", authenticateToken);
systemRoutes.route("/system/tenants", () => return 'ciao');
systemRoutes.route("/system/roles", systemRoleRoutes);   // ruoli globali
systemRoutes.route("/system/users", systemUserRoutes);   // assegnazione utenti
 */

/**
 * Registers all API route groups.
 */
protectedRoutes.route("/users", userRoutes);
protectedRoutes.route("/roles", roleRoutes);
protectedRoutes.route("/leads", leadRoutes);
protectedRoutes.route("/customers", customerRoutes);
protectedRoutes.route("/companies", companyRoutes);
protectedRoutes.route("/dashboard", dashboardRoutes);
protectedRoutes.route("/countries", countryRoutes);
protectedRoutes.route("/languages", languageRoutes);
protectedRoutes.route("/currencies", currencyRoutes);
protectedRoutes.route("/addresses", addressRoutes);
protectedRoutes.route("/contacts", contactRoutes);
protectedRoutes.route("/payments", paymentRoutes);
protectedRoutes.route("/pricelists", pricelistRoutes);
protectedRoutes.route("/tax", taxRoutes);
protectedRoutes.route("/opportunity", opportunityRoutes);
protectedRoutes.route("/products", productRoutes);
protectedRoutes.route("/documents", documentRoutes);
protectedRoutes.route("/suppliers", supplierRoutes);
protectedRoutes.route("/company-contacts", companyContactRoutes);
protectedRoutes.route("/memberships", membershipRolesRoutes);

