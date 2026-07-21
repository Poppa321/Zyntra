import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getManufacturerDashboard } from "@/api/endpoints/dashboard";
import { createProduct, getProduct, listProducts, updateStock, uploadProductPhoto } from "@/api/endpoints/products";
import { mapDashboard, mapInventoryItem } from "@/api/mappers";
import { useSessionQuery } from "@/hooks/useAuth";
import type { ProductCreateRequest } from "@/api/types";

export function useInventoryQuery() {
  const { data: user } = useSessionQuery();

  const query = useQuery({
    queryKey: ["inventory", user?.id],
    queryFn: async () => {
      const page = await listProducts({ manufacturerId: user!.id, size: 100 });
      const details = await Promise.all(page.content.map((p) => getProduct(p.id)));
      return details.map(mapInventoryItem);
    },
    enabled: !!user?.id,
  });

  return { ...query, data: query.data ?? [] };
}

export function useDashboardQuery() {
  const { data: user } = useSessionQuery();

  const query = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => getManufacturerDashboard().then((dto) => mapDashboard(dto, user?.businessName ?? user?.fullName ?? "")),
    enabled: !!user?.id,
  });

  return {
    ...query,
    data:
      query.data ?? {
        businessName: user?.businessName ?? user?.fullName ?? "",
        revenue: "₵0",
        ordersFulfilled: 0,
        productCount: 0,
        lowStockCount: 0,
        inquiryCount: 0,
        lowStockProductNames: [] as string[],
        recentOrders: [] as { id: string; total: string; tag: "NEW" | "SHIPPED" }[],
      },
  };
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductCreateRequest) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUploadProductPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, photo }: { id: string; photo: { uri: string; name: string; type: string } }) =>
      uploadProductPhoto(id, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useUpdateStockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stockQty }: { id: string; stockQty: number }) => updateStock(id, { stockQty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
