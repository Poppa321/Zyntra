import { Tabs } from "expo-router";
import { ChatCircleText, ClipboardText, Compass, House, User } from "phosphor-react-native";

import { fonts } from "@/theme/typography";
import { useTheme } from "@/theme/ThemeContext";

export default function DistributorTabsLayout() {
  const { colors, isDark } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Navy reads as structural ink on the light surface; on a dark surface
        // it disappears, so the active tab switches to gold — the system's
        // one accent color — to stay legible and on-brand in dark mode.
        tabBarActiveTintColor: isDark ? colors.gold : colors.navy,
        tabBarInactiveTintColor: colors.textPlaceholder,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1.5,
          elevation: 0,
          height: 84,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <House size={22} color={color as string} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ focused, color }) => (
            <Compass size={22} color={color as string} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused, color }) => (
            <ClipboardText size={22} color={color as string} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, color }) => (
            <ChatCircleText size={22} color={color as string} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <User size={22} color={color as string} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
    </Tabs>
  );
}
