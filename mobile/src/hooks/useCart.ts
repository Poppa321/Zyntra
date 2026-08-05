import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CartItem, Product } from "@/types/domain";

// The backend has no cart entity — orders are created directly from an items
// array — so the cart lives purely as local device state (react-query cache
// used as a lightweight store) and is translated into CreateOrderRequest.items
// at checkout (see useOrders.ts).
const CART_QUERY_KEY = ["cart"];

// Mirrors the base + per-unit portion of the server's delivery-fee formula
// (see OrderService.computeDeliveryFee) so the cart preview scales with
// order size instead of showing a flat rate. The cross-city surcharge isn't
// mirrored here since the manufacturer's city isn't loaded into cart items —
// the final fee (surcharge included, if it applies) is confirmed at checkout.
const DELIVERY_BASE_FEE = 400;
const DELIVERY_FEE_PER_UNIT = 2.5;

export function useCartQuery() {
  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => Promise.resolve<CartItem[]>([]),
    initialData: [],
    staleTime: Infinity,
  });

  const items = query.data ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = items.length > 0 ? DELIVERY_BASE_FEE + DELIVERY_FEE_PER_UNIT * totalQuantity : 0;
  const total = subtotal + deliveryFee;

  return { ...query, items, subtotal, deliveryFee, total };
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
