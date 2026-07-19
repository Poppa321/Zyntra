import { StyleSheet, View } from "react-native";

import type { OrderStatus } from "@/data/sampleData";

const STATUS_COLOR: Record<OrderStatus, string> = {
  "In Transit": "#eaaa34",
  Processing: "#4073cc",
  Delivered: "#26994d",
};

export function StatusDot({ status }: { status: OrderStatus }) {
  return <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
