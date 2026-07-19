import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

export function TrackingMap() {
  return (
    <View style={styles.container}>
      <View style={[styles.gridLine, styles.gridLineV, { left: "35%" }]} />
      <View style={[styles.gridLine, styles.gridLineV, { left: "65%" }]} />
      <View style={[styles.gridLine, styles.gridLineH, { top: "40%" }]} />
      <View style={[styles.gridLine, styles.gridLineH, { top: "70%" }]} />

      <View style={styles.routeSegmentH} />
      <View style={styles.routeSegmentV} />
      <View style={styles.routeSegmentH2} />

      <View style={[styles.marker, styles.markerStart]} />
      <View style={[styles.marker, styles.markerEnd]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    borderRadius: radius.sm,
    backgroundColor: colors.cardBg,
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: colors.border,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  gridLineH: {
    left: 0,
    right: 0,
    height: 1,
  },
  routeSegmentH: {
    position: "absolute",
    left: 60,
    bottom: 68,
    width: 110,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  routeSegmentV: {
    position: "absolute",
    left: 162,
    top: 40,
    width: 8,
    height: 140,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  routeSegmentH2: {
    position: "absolute",
    left: 162,
    top: 40,
    width: 118,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  marker: {
    position: "absolute",
    borderWidth: 3,
    borderColor: colors.white,
  },
  markerStart: {
    left: 52,
    bottom: 52,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.navy,
  },
  markerEnd: {
    left: 270,
    top: 30,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
  },
});
