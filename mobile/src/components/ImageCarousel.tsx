import { useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { Image } from "expo-image";

import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { ProductThumb } from "@/components/ProductThumb";

type ImageCarouselProps = {
  imageUrl?: string;
  count?: number;
  height?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ImageCarousel({ imageUrl, count = 3, height = 310 }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // A real product photo is a single hero slide — the multi-slide carousel
  // is the fallback presentation until products can carry a photo gallery.
  if (imageUrl) {
    return (
      <View style={[styles.container, { height }]}>
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      </View>
    );
  }

  const slides = Array.from({ length: count }, (_, i) => i);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={() => (
          <View style={[styles.slide, { width: SCREEN_WIDTH, height }]}>
            <ProductThumb size={96} iconSize={40} />
          </View>
        )}
      />
      {count > 1 && (
        <View style={styles.dots}>
          {slides.map((index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.offWhite,
    },
    slide: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.offWhite,
    },
    dots: {
      position: "absolute",
      bottom: 16,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(15,39,67,0.25)",
    },
    dotActive: {
      width: 16,
      backgroundColor: colors.gold,
    },
  });
}
