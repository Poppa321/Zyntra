import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPaymentMethod,
  deletePaymentMethod,
  listPaymentMethods,
  setDefaultPaymentMethod,
} from "@/api/endpoints/paymentMethods";
import { mapPaymentMethod } from "@/api/mappers";
import { paymentMethods as samplePaymentMethods, type PaymentMethod } from "@/data/sampleData";
import type { CreatePaymentMethodPayload } from "@/api/types";

const PAYMENT_METHODS_KEY = ["payment-methods"];

export function usePaymentMethodsQuery() {
  const query = useQuery({
    queryKey: PAYMENT_METHODS_KEY,
    queryFn: () => listPaymentMethods().then((list) => list.map(mapPaymentMethod)),
    initialData: samplePaymentMethods,
    staleTime: Infinity,
  });

  return { ...query, data: query.data ?? [] };
}

function updatePaymentMethods(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (methods: PaymentMethod[]) => PaymentMethod[],
) {
  queryClient.setQueryData<PaymentMethod[]>(PAYMENT_METHODS_KEY, (current) => updater(current ?? []));
}

export function useAddPaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<PaymentMethod, "id" | "isDefault">) => {
      const optimistic: PaymentMethod = { ...input, id: `local-${Date.now()}`, isDefault: false };
      updatePaymentMethods(queryClient, (list) => [...list, optimistic]);

      const payload: CreatePaymentMethodPayload = {
        type: input.type === "mobile_money" ? "MOBILE_MONEY" : "CARD",
        provider: input.label,
        detail: input.detail,
        holderName: input.holderName,
      };
      return createPaymentMethod(payload).catch(() => null);
    },
  });
}

export function useRemovePaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      updatePaymentMethods(queryClient, (list) => list.filter((item) => item.id !== id));
      return deletePaymentMethod(id).catch(() => null);
    },
  });
}

export function useSetDefaultPaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      updatePaymentMethods(queryClient, (list) =>
        list.map((item) => ({ ...item, isDefault: item.id === id })),
      );
      return setDefaultPaymentMethod(id).catch(() => null);
    },
  });
}
