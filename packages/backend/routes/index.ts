import { createHonoApp } from "../lib/hono-app";
import addressRoutes from "./address-routes";
import authRoutes from "./auth-routes";
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
apiRoutes.route("/countries", countryRoutes);
apiRoutes.route("/languages", languageRoutes);
apiRoutes.route("/currencies", currencyRoutes);
apiRoutes.route("/addresses", addressRoutes);
apiRoutes.route("/contacts", contactRoutes);
apiRoutes.route("/payments", paymentRoutes);
apiRoutes.route("/pricelists", pricelistRoutes);
apiRoutes.route("/tax", taxRoutes);
apiRoutes.route("/opportunity", opportunityRoutes);
apiRoutes.route("/products", productRoutes);
apiRoutes.route("/documents", documentRoutes);
apiRoutes.route("/suppliers", supplierRoutes);

export default apiRoutes;
