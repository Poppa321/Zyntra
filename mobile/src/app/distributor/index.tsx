import { useMemo, useState } from "react";
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
import { useSessionQuery } from "@/hooks/useAuth";
import { useNotificationsQuery } from "@/hooks/useNotifications";
import { useProductsQuery, useTopManufacturersQuery } from "@/hooks/useProducts";
import { categories } from "@/types/domain";

import { radius } from "@/theme/spacing";
import { type ThemeColors, useTheme } from "@/theme/ThemeContext";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Discover() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: filtered } = useProductsQuery(activeCategory);
  const { data: allProducts } = useProductsQuery("All");
  const { data: manufacturers } = useTopManufacturersQuery();
  const { data: notifications } = useNotificationsQuery();
  const { data: session } = useSessionQuery();
  const hasUnread = notifications.some((item) => !item.read);
  const featuredProducts = allProducts.filter((product) => product.featured);
  const firstName = session?.fullName?.split(" ")[0];
  const greeting = `${greetingForHour(new Date().getHours())}${firstName ? `, ${firstName}` : ""}`;

  return (
    <ScreenContainer edges={["top"]} topPadding={0}>
      <StatusBar style={isDark ? "light" : "dark"} />
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
                    {greeting}
                  </Text>
                  <Text weight="regular" color={colors.textMuted} style={styles.subGreeting}>
                    Find products from verified manufacturers
                  </Text>
                </View>
                <View>
                  <IconButton
                    icon={<Bell size={20} color={colors.pureWhite} weight="fill" />}
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

            {manufacturers.length > 0 && (
              <>
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
                <FlatList
                  data={manufacturers}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={MANUFACTURER_CARD_WIDTH + 10}
                  decelerationRate="fast"
                  contentContainerStyle={styles.carouselContent}
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
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

            {featuredProducts.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text weight="bold" style={styles.sectionTitle}>
                    Featured
                  </Text>
                </View>
                <FlatList
                  data={featuredProducts}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselContent}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                  renderItem={({ item }) => (
                    <View style={styles.featuredCard}>
                      <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
                    </View>
                  )}
                />
              </>
            )}

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
                {activeCategory === "All" ? "All Products" : activeCategory}
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
              No products in this category yet.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    hero: {
      backgroundColor: colors.cardBg,
      borderBottomLeftRadius: radius.md,
      borderBottomRightRadius: radius.md,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 18,
      gap: 16,
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
      fontSize: 18,
      color: colors.textPrimary,
    },
    subGreeting: {
      fontSize: 12,
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
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    featuredCard: {
      width: 150,
    },
    chipsRow: {
      flexDirection: "row",
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
    seeAll: {
      fontSize: 12,
    },
    pressed: {
      opacity: 0.6,
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
