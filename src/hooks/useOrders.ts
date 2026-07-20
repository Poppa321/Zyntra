import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as ordersApi from "@/api/endpoints/orders";
import { mapDistributorOrder, mapIncomingOrder } from "@/api/mappers";
import type { CreateOrderRequest, OrderGroup } from "@/api/types";
import type { CartItem } from "@/types/domain";
import { clearCart } from "@/hooks/useCart";
import { queryClient as globalQueryClient } from "@/lib/queryClient";

const GROUP_TO_TAB: Record<OrderGroup, OrderGroup> = { active: "active", completed: "completed", cancelled: "cancelled" };

export function useDistributorOrdersQuery(group: OrderGroup) {
  const query = useQuery({
    queryKey: ["orders", "distributor", group],
    queryFn: () => ordersApi.listOrders(GROUP_TO_TAB[group]).then((page) => page.content.map(mapDistributorOrder)),
  });

  return { ...query, data: query.data ?? [] };
}

export function useIncomingOrdersQuery(group: OrderGroup = "active") {
  const query = useQuery({
    queryKey: ["orders", "incoming", group],
    queryFn: () => ordersApi.listOrders(group).then((page) => page.content.map(mapIncomingOrder)),
  });

  return { ...query, data: query.data ?? [] };
}

export function useOrderQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrder(orderId as string),
    enabled: !!orderId,
  });
}

function invalidateOrders(queryClient: ReturnType<typeof useQueryClient>, orderId?: string) {
  queryClient.invalidateQueries({ queryKey: ["orders"] });
  if (orderId) queryClient.invalidateQueries({ queryKey: ["order", orderId] });
}

/** Groups cart items by manufacturer and places one order per manufacturer (the backend requires all items in an order to share one manufacturer). */
export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, deliveryAddress }: { items: CartItem[]; deliveryAddress?: string }) => {
      const byManufacturer = new Map<string, CartItem[]>();
      for (const item of items) {
        const list = byManufacturer.get(item.product.manufacturerId) ?? [];
        list.push(item);
        byManufacturer.set(item.product.manufacturerId, list);
      }

      const results = [];
      for (const [manufacturerId, group] of byManufacturer) {
        const payload: CreateOrderRequest = {
          manufacturerId,
          deliveryAddress,
          items: group.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        };
        results.push(await ordersApi.createOrder(payload));
      }
      return results;
    },
    onSuccess: () => {
      clearCart(globalQueryClient);
      invalidateOrders(queryClient);
    },
  });
}

export function useAcceptOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.acceptOrder(orderId),
    onSuccess: (_data, orderId) => invalidateOrders(queryClient, orderId),
  });
}

export function useDeclineOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => ordersApi.declineOrder(orderId, reason),
    onSuccess: (_data, { orderId }) => invalidateOrders(queryClient, orderId),
  });
}

export function useShipOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.shipOrder(orderId),
    onSuccess: (_data, orderId) => invalidateOrders(queryClient, orderId),
  });
}

export function useOutForDeliveryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.outForDeliveryOrder(orderId),
    onSuccess: (_data, orderId) => invalidateOrders(queryClient, orderId),
  });
}

export function useDeliverOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.deliverOrder(orderId),
    onSuccess: (_data, orderId) => invalidateOrders(queryClient, orderId),
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: (_data, orderId) => invalidateOrders(queryClient, orderId),
  });
}
