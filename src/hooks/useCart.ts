import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addCartItem, getCart, removeCartItem, updateCartItem } from "@/api/endpoints/cart";
import { mapCartItem } from "@/api/mappers";
import { cartItems as sampleCartItems, type CartItem, type Product } from "@/data/sampleData";

const CART_QUERY_KEY = ["cart"];
const DELIVERY_FEE = 1200;

export function useCartQuery() {
  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => getCart().then((cart) => cart.items.map(mapCartItem)),
    initialData: sampleCartItems,
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
      return addCartItem(product.id, quantity).catch(() => null);
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
      return updateCartItem(productId, quantity).catch(() => null);
    },
  });
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      updateLocalCart(queryClient, (items) => items.filter((item) => item.product.id !== productId));
      return removeCartItem(productId).catch(() => null);
    },
  });
}
