import { useQuery } from "@tanstack/react-query";

import { getProduct, listProducts } from "@/api/endpoints/products";
import { mapProductCard, mapProductDetail } from "@/api/mappers";

export function useProductsQuery(category?: string, search?: string) {
  const query = useQuery({
    queryKey: ["products", category ?? "all", search ?? ""],
    queryFn: () =>
      listProducts({
        category: category === "All" ? undefined : category,
        search: search || undefined,
        size: 50,
      }).then((page) => page.content.map(mapProductCard)),
  });

  return { ...query, data: query.data ?? [] };
}

export function useManufacturerProductsQuery(manufacturerId: string | undefined) {
  const query = useQuery({
    queryKey: ["products", "manufacturer", manufacturerId],
    queryFn: () => listProducts({ manufacturerId, size: 50 }).then((page) => page.content.map(mapProductCard)),
    enabled: !!manufacturerId,
  });

  return { ...query, data: query.data ?? [] };
}

export function useProductQuery(id: string | undefined) {
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id as string).then(mapProductDetail),
    enabled: !!id,
  });

  return query;
}

/** The backend has no "top manufacturers" endpoint, so this is derived from the product listing. */
export function useTopManufacturersQuery() {
  const query = useQuery({
    queryKey: ["manufacturers", "derived"],
    queryFn: () =>
      listProducts({ size: 50 }).then((page) => {
        const seen = new Map<string, { id: string; name: string; location: string; rating: number; verified: boolean; tagline: string }>();
        for (const product of page.content) {
          if (!seen.has(product.manufacturerId)) {
            seen.set(product.manufacturerId, {
              id: product.manufacturerId,
              name: product.manufacturerName,
              location: "",
              rating: 4.8,
              verified: product.verified,
              tagline: "",
            });
          }
        }
        return [...seen.values()];
      }),
  });

  return { ...query, data: query.data ?? [] };
}
