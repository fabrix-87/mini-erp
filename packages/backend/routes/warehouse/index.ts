import { createHonoApp } from '@/lib/hono-app';
import warehouseStatsRoutes from './warehouse-stats-routes';
import warehouseCrudRoutes from './warehouse-crud-routes';

const warehouseRoutes = createHonoApp();

// Register stats sub-routes under /stats
warehouseRoutes.route('/stats', warehouseStatsRoutes);
warehouseRoutes.route('/', warehouseCrudRoutes);

export default warehouseRoutes;