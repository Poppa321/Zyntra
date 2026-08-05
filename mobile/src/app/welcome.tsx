import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowUpRight, MapTrifold, Storefront, ShieldCheck } from "phosphor-react-native";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Each slide is a full screen of its own — its own icon, photo, and tint —
// rather than a single static hero with a text pager underneath, so
// onboarding actually reads as a sequence of screens with a matching image
// per idea (factory floor, the delivery leg, the handoff that closes a
// trade) instead of one photo recolored three times.
const SLIDES = [
  {
    icon: Storefront,
    title: "BEYOND",
    highlight: "FACTORY",
    subtitle: "GATES",
    desc: "Wholesale trade between manufacturers and distributors — direct, tracked, trusted.",
    image: require("@/../assets/images/auth/warehouse-team.jpg"),
    tint: ["rgba(12,30,49,0.78)", "rgba(15,39,67,0.55)", "rgba(8,15,26,0.9)"] as const,
  },
  {
    icon: MapTrifold,
    title: "REAL-TIME",
    highlight: "LOGISTICS",
    subtitle: "TRACKING",
    desc: "Track your shipments from factory gate to shelves with integrated live maps.",
    image: require("@/../assets/images/auth/distributor-hero.jpg"),
    tint: ["rgba(209,122,61,0.55)", "rgba(15,39,67,0.6)", "rgba(8,15,26,0.9)"] as const,
  },
  {
    icon: ShieldCheck,
    title: "SECURE",
    highlight: "WHOLESALE",
    subtitle: "PAYMENTS",
    desc: "Grow your business using escrow-backed payments that keep every transaction safe.",
    image: require("@/../assets/images/auth/delivery-handoff.jpg"),
    tint: ["rgba(234,170,52,0.5)", "rgba(15,39,67,0.6)", "rgba(8,15,26,0.9)"] as const,
  },
];

const isLastIndex = (i: number) => i === SLIDES.length - 1;

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }

  function goToNext() {
    if (isLastIndex(activeIndex)) {
      router.push("/role-select");
      return;
    }
    flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  }

  function skipToEnd() {
    flatListRef.current?.scrollToIndex({ index: SLIDES.length - 1, animated: true });
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.highlight}
        getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        renderItem={({ item }) => {
          const SlideIcon = item.icon;
          return (
            <View style={styles.slide}>
              <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" />
              <LinearGradient colors={item.tint} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

              <View style={[styles.slideContent, { paddingTop: insets.top + 16 }]}>
                <View style={styles.iconWell}>
                  <SlideIcon size={30} color={colors.gold} weight="fill" />
                </View>

                <View style={styles.headingBlock}>
                  <Text weight="extraBold" style={styles.heading}>
                    {item.title}
                  </Text>
                  <Text weight="extraBold" style={[styles.heading, { color: colors.gold }]}>
                    {item.highlight}
                  </Text>
                  <Text weight="extraBold" style={styles.heading}>
                    {item.subtitle}
                  </Text>
                  <Text weight="regular" style={styles.subtitle}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={[styles.topBar, { top: insets.top + 16 }]}>
        <Logo variant="light" type="mark" size="sm" />
        {!isLastIndex(activeIndex) && (
          <Pressable onPress={skipToEnd} hitSlop={10} style={styles.skipButton}>
            <Text weight="semiBold" style={styles.skipLabel}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        <Button
          label={isLastIndex(activeIndex) ? "Get Started" : "Next"}
          variant="accent"
          onPress={goToNext}
          icon={
            <View style={styles.ctaIcon}>
              <ArrowUpRight size={18} color={colors.gold} weight="bold" />
            </View>
          }
          style={styles.cta}
        />

        {isLastIndex(activeIndex) && (
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={({ pressed }) => [styles.signInCta, pressed && styles.signInCtaPressed]}
          >
            <Text weight="semiBold" style={styles.signInCtaLabel}>
              Continue to Sign In
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "flex-end",
    paddingBottom: 220,
  },
  iconWell: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(234,170,52,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headingBlock: {
    gap: 2,
  },
  heading: {
    fontSize: 36,
    lineHeight: 42,
    color: colors.white,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 320,
  },
  topBar: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  skipLabel: {
    fontSize: 14,
    color: colors.white,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.gold,
  },
  cta: {
    marginTop: 0,
  },
  signInCta: {
    marginTop: 12,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  signInCtaPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  signInCtaLabel: {
    fontSize: 16,
    color: colors.navy,
  },
  ctaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
