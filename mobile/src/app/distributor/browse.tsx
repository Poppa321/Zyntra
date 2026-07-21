import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MagnifyingGlass, Package, X } from "phosphor-react-native";

import { Chip } from "@/components/Chip";
import { ManufacturerCard, MANUFACTURER_CARD_WIDTH } from "@/components/ManufacturerCard";
import { ProductCard } from "@/components/ProductCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useProductsQuery, useTopManufacturersQuery } from "@/hooks/useProducts";
import { categories } from "@/types/domain";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";

export default function Browse() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: allProducts } = useProductsQuery(activeCategory);
  const { data: allManufacturers } = useTopManufacturersQuery();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const products = useMemo(() => {
    if (!isSearching) return allProducts;
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.manufacturer.toLowerCase().includes(normalizedQuery),
    );
  }, [allProducts, isSearching, normalizedQuery]);

  const manufacturers = useMemo(() => {
    if (!isSearching) return allManufacturers;
    return allManufacturers.filter(
      (manufacturer) =>
        manufacturer.name.toLowerCase().includes(normalizedQuery) ||
        manufacturer.location.toLowerCase().includes(normalizedQuery) ||
        manufacturer.tagline.toLowerCase().includes(normalizedQuery),
    );
  }, [allManufacturers, isSearching, normalizedQuery]);

  const showManufacturers = manufacturers.length > 0;

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text weight="extraBold" style={styles.title}>
                BROWSE
              </Text>
              <TextField
                placeholder="Search products or manufacturers"
                leftIcon={<MagnifyingGlass size={18} color={colors.textMuted} />}
                rightElement={
                  isSearching ? (
                    <Pressable onPress={() => setQuery("")} hitSlop={12}>
                      <X size={16} color={colors.textMuted} weight="bold" />
                    </Pressable>
                  ) : undefined
                }
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>

            <View style={styles.chipsRow}>
              <Chip label="All" active={activeCategory === "All"} onPress={() => setActiveCategory("All")} />
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <Chip key={c} label={c} active={activeCategory === c} onPress={() => setActiveCategory(c)} />
                ))}
            </View>

            {showManufacturers && (
              <>
                <View style={styles.sectionHeader}>
                  <Text weight="bold" style={styles.sectionTitle}>
                    {isSearching ? "Manufacturers" : "Top Manufacturers"}
                  </Text>
                </View>
                <FlatList
                  data={manufacturers}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={MANUFACTURER_CARD_WIDTH + 12}
                  decelerationRate="fast"
                  contentContainerStyle={styles.carouselContent}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                  renderItem={({ item }) => (
                    <ManufacturerCard
                      manufacturer={item}
                      onPress={() =>
                        router.push({
                          pathname: "/manufacturer-profile/[id]",
                          params: {
                            id: item.id,
                            name: item.name,
                            location: item.location,
                            tagline: item.tagline,
                            verified: String(item.verified),
                            rating: String(item.rating),
                          },
                        })
                      }
                    />
                  )}
                />
              </>
            )}

            <View style={styles.sectionHeader}>
              <Text weight="bold" style={styles.sectionTitle}>
                {isSearching ? "Products" : "All Products"}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Package size={40} color={colors.textFaint} weight="light" />
            <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
              {isSearching ? `No results for "${query}"` : "No products in this category yet."}
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 23,
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  carouselContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  row: {
    gap: 12,
    paddingHorizontal: 18,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  });
}
