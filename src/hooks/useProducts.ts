import { useQuery } from "@tanstack/react-query";

import { listProducts, getProduct, listTopManufacturers } from "@/api/endpoints/products";
import { mapProduct } from "@/api/mappers";
import { manufacturers as sampleManufacturers, products as sampleProducts } from "@/data/sampleData";

export function useProductsQuery(category?: string) {
  const query = useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: () =>
      listProducts({ category: category === "All" ? undefined : category }).then((list) =>
        list.map(mapProduct),
      ),
  });

  const fallback =
    !category || category === "All"
      ? sampleProducts
      : sampleProducts.filter((p) => p.category === category);

  return { ...query, data: query.data ?? fallback };
}

export function useProductQuery(id: string | undefined) {
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id as string).then(mapProduct),
    enabled: !!id,
  });

  const fallback = sampleProducts.find((p) => p.id === id) ?? sampleProducts[0];

  return { ...query, data: query.data ?? fallback };
}

export function useTopManufacturersQuery() {
  const query = useQuery({
    queryKey: ["manufacturers", "top"],
    queryFn: () =>
      listTopManufacturers().then((list) =>
        list.map((dto) => ({
          id: dto.id,
          name: dto.name,
          location: dto.location,
          rating: dto.rating,
          verified: dto.verified,
          tagline: "",
        })),
      ),
  });

  return { ...query, data: query.data ?? sampleManufacturers };
}
