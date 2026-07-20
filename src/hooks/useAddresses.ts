import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as addressesApi from "@/api/endpoints/addresses";
import { addressLabelToDto, mapAddress } from "@/api/mappers";
import type { Address, AddressLabel } from "@/types/domain";

const ADDRESSES_KEY = ["addresses"];

export function useAddressesQuery() {
  const query = useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => addressesApi.listAddresses().then((list) => list.map(mapAddress)),
  });

  return { ...query, data: query.data ?? [] };
}

export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Address, "id" | "isDefault">) =>
      addressesApi
        .createAddress({
          label: addressLabelToDto(input.label),
          line1: input.line1,
          city: input.city,
          region: input.region,
          phone: input.phone,
        })
        .then(mapAddress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useRemoveAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useSetDefaultAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefaultAddress(id).then(mapAddress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export type { AddressLabel };
