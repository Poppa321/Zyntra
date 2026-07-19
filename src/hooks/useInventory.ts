import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createProduct, getDashboardStats, listInventory } from "@/api/endpoints/inventory";
import { mapInventoryItem, mapDashboard } from "@/api/mappers";
import { inventory as sampleInventory, recentOrders as sampleRecentOrders } from "@/data/sampleData";
import type { CreateProductPayload } from "@/api/types";

const FALLBACK_DASHBOARD = {
  businessName: "Ashanti AgroWorks",
  revenue: "₵412,000",
  ordersFulfilled: 86,
  productCount: 24,
  lowStockCount: 3,
  inquiryCount: 4,
  lowStockProductNames: ["Cocoa Butter", "Shea Oil", "Palm Kernel"],
  recentOrders: sampleRecentOrders,
};

export function useInventoryQuery() {
  const query = useQuery({
    queryKey: ["inventory"],
    queryFn: () => listInventory().then((list) => list.map(mapInventoryItem)),
  });

  return { ...query, data: query.data ?? sampleInventory };
}

export function useDashboardQuery() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardStats().then(mapDashboard),
  });

  return { ...query, data: query.data ?? FALLBACK_DASHBOARD };
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
