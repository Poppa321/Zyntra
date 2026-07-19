import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptOrder,
  declineOrder,
  getOrderTracking,
  listDistributorOrders,
  listIncomingOrders,
  markOrderShipped,
  placeOrder,
  type OrderTab,
} from "@/api/endpoints/orders";
import { mapDistributorOrder, mapIncomingOrder } from "@/api/mappers";
import { formatCurrency } from "@/lib/format";
import {
  distributorOrders as sampleDistributorOrders,
  incomingOrders as sampleIncomingOrders,
  type CartItem,
  type IncomingOrder,
  type Order,
} from "@/data/sampleData";

const INCOMING_ORDERS_KEY = ["incoming-orders"];
const CART_QUERY_KEY = ["cart"];
const ACTIVE_ORDERS_KEY = ["distributor-orders", "active"];

export function useDistributorOrdersQuery(tab: OrderTab) {
  const query = useQuery({
    queryKey: ["distributor-orders", tab],
    queryFn: () => listDistributorOrders(tab).then((list) => list.map(mapDistributorOrder)),
  });

  return { ...query, data: query.data ?? sampleDistributorOrders };
}

export function useIncomingOrdersQuery() {
  const query = useQuery({
    queryKey: INCOMING_ORDERS_KEY,
    queryFn: () => listIncomingOrders().then((list) => list.map(mapIncomingOrder)),
    initialData: sampleIncomingOrders,
    staleTime: Infinity,
  });

  return { ...query, data: query.data ?? [] };
}

export function useOrderTrackingQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: () => getOrderTracking(orderId as string),
    enabled: !!orderId,
  });
}

function updateIncomingOrders(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (orders: IncomingOrder[]) => IncomingOrder[],
) {
  queryClient.setQueryData<IncomingOrder[]>(INCOMING_ORDERS_KEY, (current) => updater(current ?? []));
}

export function useAcceptOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      updateIncomingOrders(queryClient, (orders) =>
        orders.map((order) => (order.id === orderId ? { ...order, status: "shipped" } : order)),
      );
      return acceptOrder(orderId).catch(() => null);
    },
  });
}

export function useDeclineOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      updateIncomingOrders(queryClient, (orders) => orders.filter((order) => order.id !== orderId));
      return declineOrder(orderId).catch(() => null);
    },
  });
}

function summarizeCart(items: CartItem[]): string {
  if (items.length === 0) return "";
  const manufacturers = new Set(items.map((item) => item.product.manufacturer));
  const itemLabel = `${items.length} item${items.length > 1 ? "s" : ""}`;
  return manufacturers.size === 1 ? `${itemLabel} · ${[...manufacturers][0]}` : itemLabel;
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, total }: { items: CartItem[]; total: number }) => {
      const orderId = await placeOrder("current")
        .then((order) => order.orderNumber)
        .catch(() => `ZYN-${Date.now().toString().slice(-5)}`);

      queryClient.setQueryData<Order[]>(ACTIVE_ORDERS_KEY, (current) => [
        {
          id: `#${orderId}`,
          itemsSummary: summarizeCart(items),
          total: formatCurrency(total),
          status: "Processing",
        },
        ...(current ?? sampleDistributorOrders),
      ]);
      queryClient.setQueryData(CART_QUERY_KEY, []);
      return orderId;
    },
  });
}

export function useMarkShippedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      updateIncomingOrders(queryClient, (orders) => orders.filter((order) => order.id !== orderId));
      return markOrderShipped(orderId).catch(() => null);
    },
  });
}
