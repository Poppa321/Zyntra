import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAddress, deleteAddress, listAddresses, setDefaultAddress } from "@/api/endpoints/addresses";
import { mapAddress } from "@/api/mappers";
import { addresses as sampleAddresses, type Address, type AddressLabel } from "@/data/sampleData";
import type { AddressLabelDto, CreateAddressPayload } from "@/api/types";

const ADDRESSES_KEY = ["addresses"];

const LABEL_TO_DTO: Record<AddressLabel, AddressLabelDto> = {
  Warehouse: "WAREHOUSE",
  Office: "OFFICE",
  Storefront: "STOREFRONT",
  Other: "OTHER",
};

export function useAddressesQuery() {
  const query = useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => listAddresses().then((list) => list.map(mapAddress)),
    initialData: sampleAddresses,
    staleTime: Infinity,
  });

  return { ...query, data: query.data ?? [] };
}

function updateAddresses(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (addresses: Address[]) => Address[],
) {
  queryClient.setQueryData<Address[]>(ADDRESSES_KEY, (current) => updater(current ?? []));
}

export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Address, "id" | "isDefault">) => {
      const optimistic: Address = { ...input, id: `local-${Date.now()}`, isDefault: false };
      updateAddresses(queryClient, (list) => [...list, optimistic]);

      const payload: CreateAddressPayload = {
        label: LABEL_TO_DTO[input.label],
        line1: input.line1,
        city: input.city,
        region: input.region,
        phone: input.phone,
      };
      return createAddress(payload).catch(() => null);
    },
  });
}

export function useRemoveAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      updateAddresses(queryClient, (list) => list.filter((item) => item.id !== id));
      return deleteAddress(id).catch(() => null);
    },
  });
}

export function useSetDefaultAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      updateAddresses(queryClient, (list) =>
        list.map((item) => ({ ...item, isDefault: item.id === id })),
      );
      return setDefaultAddress(id).catch(() => null);
    },
  });
}
