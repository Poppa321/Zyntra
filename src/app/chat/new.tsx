import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, SealCheck, Storefront, UsersThree } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useSessionQuery } from "@/hooks/useAuth";
import { useStartConversationMutation } from "@/hooks/useChat";
import { useIncomingOrdersQuery } from "@/hooks/useOrders";
import { useTopManufacturersQuery } from "@/hooks/useProducts";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

type Counterparty = {
  id: string;
  name: string;
  verified: boolean;
};

export default function NewMessage() {
  const [search, setSearch] = useState("");
  const { data: user } = useSessionQuery();
  const isManufacturer = user?.role === "MANUFACTURER";

  // Distributors pick from manufacturers on the marketplace; manufacturers
  // pick from distributors who have ordered from them.
  const { data: manufacturers } = useTopManufacturersQuery();
  const { data: incomingOrders } = useIncomingOrdersQuery();
  const startConversation = useStartConversationMutation();

  const counterparties = useMemo<Counterparty[]>(() => {
    if (isManufacturer) {
      const seen = new Map<string, Counterparty>();
      for (const order of incomingOrders) {
        if (order.counterpartyId && !seen.has(order.counterpartyId)) {
          seen.set(order.counterpartyId, { id: order.counterpartyId, name: order.customer || "Distributor", verified: false });
        }
      }
      return [...seen.values()];
    }
    return manufacturers.map((m) => ({ id: m.id, name: m.name, verified: m.verified }));
  }, [isManufacturer, incomingOrders, manufacturers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return counterparties;
    return counterparties.filter((c) => c.name.toLowerCase().includes(term));
  }, [counterparties, search]);

  function handleSelect(counterparty: Counterparty) {
    startConversation.mutate(counterparty.id, {
      onSuccess: (conversation) => router.replace(`/chat/${conversation.id}`),
      onError: (error) => showAlert("Couldn't open chat", getApiErrorMessage(error)),
    });
  }

  return (
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <IconButton
              icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />}
              onPress={() => router.back()}
            />
            <Text weight="extraBold" style={styles.title}>
              NEW MESSAGE
            </Text>
            <TextField
              label={isManufacturer ? "Find a distributor" : "Find a manufacturer"}
              placeholder="Search by business name"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelect(item)}
            disabled={startConversation.isPending}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.avatar}>
              <Storefront size={18} color={colors.white} weight="fill" />
            </View>
            <Text weight="bold" style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.verified && <SealCheck size={16} color={colors.gold} weight="fill" />}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <UsersThree size={40} color={colors.textFaint} weight="light" />
            <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
              {isManufacturer
                ? "No distributors yet — they'll appear here once they order from you."
                : search
                  ? "No manufacturers match that name."
                  : "No manufacturers found."}
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  header: {
    gap: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 21,
    color: colors.textPrimary,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 12,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.75,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
  },
});
