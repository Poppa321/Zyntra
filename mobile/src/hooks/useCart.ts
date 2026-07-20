import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CartItem, Product } from "@/types/domain";

// The backend has no cart entity — orders are created directly from an items
// array — so the cart lives purely as local device state (react-query cache
// used as a lightweight store) and is translated into CreateOrderRequest.items
// at checkout (see useOrders.ts).
const CART_QUERY_KEY = ["cart"];
const DELIVERY_FEE = 1200;

export function useCartQuery() {
  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => Promise.resolve<CartItem[]>([]),
    initialData: [],
    staleTime: Infinity,
  });

  const items = query.data ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  return { ...query, items, subtotal, deliveryFee: DELIVERY_FEE, total };
}

function updateLocalCart(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (items: CartItem[]) => CartItem[],
) {
  queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, (current) => updater(current ?? []));
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ product, quantity }: { product: Product; quantity: number }) => {
      updateLocalCart(queryClient, (items) => {
        const existing = items.find((item) => item.product.id === product.id);
        if (existing) {
          return items.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [...items, { product, quantity }];
      });
    },
  });
}

export function useUpdateCartItemQuantityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      updateLocalCart(queryClient, (items) =>
        items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
      );
    },
  });
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      updateLocalCart(queryClient, (items) => items.filter((item) => item.product.id !== productId));
    },
  });
}

export function clearCart(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, []);
}
