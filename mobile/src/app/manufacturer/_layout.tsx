import { Tabs } from "expo-router";
import { ChatCircleText, ClipboardText, House, Package, User } from "phosphor-react-native";

import { colors } from "@/theme/colors";
import { fonts } from "@/theme/typography";

export default function ManufacturerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textPlaceholder,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopColor: colors.border,
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
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ focused, color }) => (
            <Package size={22} color={color as string} weight={focused ? "fill" : "regular"} />
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
