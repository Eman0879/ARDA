// app/components/employeeticketlogs/timeRangeUtils.ts
import { TimeRange } from './TimeRangeFilter';

/**
 * Filter items by time range based on their createdAt date
 */
export function filterByTimeRange<T extends { createdAt: string | Date }>(
  items: T[],
  timeRange: TimeRange
): T[] {
  if (timeRange.type === 'all') {
    return items;
  }

  if (!timeRange.startDate || !timeRange.endDate) {
    return items;
  }

  return items.filter(item => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= timeRange.startDate! && itemDate <= timeRange.endDate!;
  });
}

/**
 * Filter tickets data including status breakdowns
 */
export function filterTicketsData(data: any, timeRange: TimeRange) {
  if (timeRange.type === 'all') {
    return data;
  }

  // Filter primary tickets
  const filteredPrimaryTickets = filterByTimeRange(
    data.primaryTickets.recentTickets || [],
    timeRange
  );

  // Filter secondary tickets
  const filteredSecondaryTickets = filterByTimeRange(
    data.secondaryTickets.recentTickets || [],
    timeRange
  );

  // Recalculate status breakdowns for primary
  const primaryStatusBreakdown = calculateStatusBreakdown(filteredPrimaryTickets);
  
  // Recalculate status breakdowns for secondary
  const secondaryStatusBreakdown = calculateStatusBreakdown(filteredSecondaryTickets);

  // Recalculate overall breakdown
  const overallStatusBreakdown = calculateStatusBreakdown([
    ...filteredPrimaryTickets,
    ...filteredSecondaryTickets
  ]);

  return {
    ...data,
    totalTickets: filteredPrimaryTickets.length + filteredSecondaryTickets.length,
    primaryTickets: {
      total: filteredPrimaryTickets.length,
      statusBreakdown: primaryStatusBreakdown,
      recentTickets: filteredPrimaryTickets.slice(0, 10),
    },
    secondaryTickets: {
      total: filteredSecondaryTickets.length,
      statusBreakdown: secondaryStatusBreakdown,
      recentTickets: filteredSecondaryTickets.slice(0, 10),
    },
    statusBreakdown: overallStatusBreakdown,
    recentTickets: [...filteredPrimaryTickets, ...filteredSecondaryTickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
  };
}

function calculateStatusBreakdown(tickets: any[]) {
  const breakdown: Record<string, number> = {};
  
  tickets.forEach(ticket => {
    if (!breakdown[ticket.status]) {
      breakdown[ticket.status] = 0;
    }
    breakdown[ticket.status]++;
  });

  const statusColors: Record<string, string> = {
    pending: '#FFA500',
    'in-progress': '#0000FF',
    blocked: '#FF0000',
    resolved: '#32CD32',
    closed: '#808080',
  };

  const total = tickets.length;

  return Object.entries(breakdown)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#808080',
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
} 