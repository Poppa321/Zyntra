import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bell, MagnifyingGlass, Package } from "phosphor-react-native";

import { Chip } from "@/components/Chip";
import { IconButton } from "@/components/IconButton";
import { ManufacturerCard, MANUFACTURER_CARD_WIDTH } from "@/components/ManufacturerCard";
import { ProductCard } from "@/components/ProductCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useNotificationsQuery } from "@/hooks/useNotifications";
import { useProductsQuery, useTopManufacturersQuery } from "@/hooks/useProducts";
import { categories } from "@/data/sampleData";
import { colors } from "@/theme/colors";

export default function Discover() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: filtered } = useProductsQuery(activeCategory);
  const { data: manufacturers } = useTopManufacturersQuery();
  const { data: notifications } = useNotificationsQuery();
  const hasUnread = notifications.some((item) => !item.read);

  return (
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.heroText}>
                  <Text weight="bold" style={styles.greeting}>
                    Good morning, Kwame
                  </Text>
                  <Text weight="regular" style={styles.subGreeting}>
                    Find products from verified manufacturers
                  </Text>
                </View>
                <View>
                  <IconButton
                    icon={<Bell size={20} color={colors.white} weight="fill" />}
                    background={colors.navy}
                    onPress={() => router.push("/notifications")}
                  />
                  {hasUnread && <View style={styles.bellDot} />}
                </View>
              </View>
              <Pressable onPress={() => router.push("/distributor/browse")}>
                <View pointerEvents="none">
                  <TextField
                    placeholder="Search products or manufacturers"
                    leftIcon={<MagnifyingGlass size={18} color={colors.textMuted} />}
                    style={styles.searchInput}
                    editable={false}
                  />
                </View>
              </Pressable>
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
              renderItem={({ item }) => <ManufacturerCard manufacturer={item} />}
            />

            <View style={styles.chipsRow}>
              <Chip label="All" active={activeCategory === "All"} onPress={() => setActiveCategory("All")} />
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <Chip key={c} label={c} active={activeCategory === c} onPress={() => setActiveCategory(c)} />
                ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text weight="bold" style={styles.sectionTitle}>
                Top Manufacturers
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => router.push("/distributor/browse")}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text weight="semiBold" color={colors.gold} style={styles.seeAll}>
                  See all
                </Text>
              </Pressable>
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
              No products in this category yet.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.cardBg,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 20,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroText: {
    flex: 1,
    gap: 6,
  },
  greeting: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  subGreeting: {
    fontSize: 13,
    color: colors.textMuted,
  },
  searchInput: {
    marginTop: 0,
  },
  bellDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: colors.navy,
  },
  carouselContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.6,
  },
  row: {
    gap: 12,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 32,
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
    fontSize: 14,
  },
});
