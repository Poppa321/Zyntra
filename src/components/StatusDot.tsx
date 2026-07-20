import { StyleSheet, View } from "react-native";

import type { OrderStatus } from "@/types/domain";

const STATUS_COLOR: Record<OrderStatus, string> = {
  Pending: "#4073cc",
  Accepted: "#4073cc",
  "In Transit": "#eaaa34",
  "Out for Delivery": "#eaaa34",
  Delivered: "#26994d",
  Declined: "#d94033",
  Cancelled: "#d94033",
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
