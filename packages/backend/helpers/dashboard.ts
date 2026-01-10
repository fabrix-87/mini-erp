// ============================================================================
// DASHBOARD HELPERS
// ============================================================================

/**
 * Calcola date range da periodo predefinito
 */
export const getDateRangeFromPeriod = (period?: string): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  switch (period) {
    case 'today':
      break;
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
      break;
    case 'last7days':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'last30days':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() - 1);
      endDate.setDate(0);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      break;
    case 'lastYear':
      startDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
      endDate.setFullYear(endDate.getFullYear() - 1);
      endDate.setMonth(11, 31);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate, endDate };
};

/**
 * Calcola periodo precedente per confronti
 */
export const getPreviousPeriod = (startDate: Date, endDate: Date): { startDate: Date; endDate: Date } => {
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - periodDays);
  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  
  return { startDate: prevStartDate, endDate: prevEndDate };
};

/**
 * Calcola crescita percentuale
 */
export const calculateGrowth = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? '100.00' : '0.00';
  return (((current - previous) / previous) * 100).toFixed(2);
};

/**
 * Raggruppa dati per periodo
 */
export const groupByPeriod = (
  data: Array<{ date: Date; amount: number; type?: string }>,
  groupBy: 'day' | 'week' | 'month' | 'year'
): Record<string, any> => {
  const grouped: Record<string, any> = {};

  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        totalAmount: 0,
        count: 0,
        byType: {},
      };
    }

    grouped[key].totalAmount += item.amount;
    grouped[key].count += 1;

    if (item.type) {
      grouped[key].byType[item.type] = (grouped[key].byType[item.type] || 0) + 1;
    }
  });

  return grouped;
};

/**
 * Formatta decimale Prisma a number
 */
export const toNumber = (value: any): number => {
  return parseFloat(value?.toString() || '0');
};

/**
 * Mappa stage a probabilità default
 */
export const STAGE_PROBABILITY_MAP: Record<string, number> = {
  LEAD_QUALIFICATION: 10,
  PROSPECTING: 20,
  NEEDS_ANALYSIS: 40,
  PROPOSAL_SENT: 60,
  NEGOTIATION: 80,
  COMMITMENT: 90,
};

/**
 * Calcola giorni tra due date
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
};