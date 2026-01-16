import { Tabs, usePathname } from "expo-router";
import { Layers, Gamepad2, Sparkles, Lightbulb, Lock } from "lucide-react-native";
import React, { createContext, useContext, useRef, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAppStore } from "@/store/appStore";

type ScrollRefs = {
  library: React.RefObject<ScrollView | null> | null;
  play: React.RefObject<ScrollView | null> | null;
  plus: React.RefObject<ScrollView | null> | null;
  inspo: React.RefObject<ScrollView | null> | null;
  profile: React.RefObject<ScrollView | null> | null;
};

const ScrollContext = createContext<{
  scrollRefs: ScrollRefs;
  registerScroll: (tab: keyof ScrollRefs, ref: React.RefObject<ScrollView | null>) => void;
}>({ 
  scrollRefs: { library: null, play: null, plus: null, inspo: null, profile: null },
  registerScroll: () => {},
});

export const useTabScroll = () => useContext(ScrollContext);

export default function TabLayout() {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const scrollRefsRef = useRef<ScrollRefs>({
    library: null,
    play: null,
    plus: null,
    inspo: null,
    profile: null,
  });

  const registerScroll = useCallback((tab: keyof ScrollRefs, ref: React.RefObject<ScrollView | null>) => {
    scrollRefsRef.current[tab] = ref;
  }, []);

  const handleTabPress = (routeName: string, currentPath: string) => {
    const tabMap: Record<string, keyof ScrollRefs> = {
      '/library': 'library',
      '/play': 'play',
      '/plus': 'plus',
      '/inspo': 'inspo',
      '/profile': 'profile',
    };

    const currentTab = tabMap[currentPath];
    const targetRoute = `/${routeName}`;
    
    if (currentPath === targetRoute && currentTab) {
      const scrollRef = scrollRefsRef.current[currentTab];
      if (scrollRef && scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }
  };
  
  return (
    <ScrollContext.Provider value={{ scrollRefs: scrollRefsRef.current, registerScroll }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 64 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
          },
          tabBarItemStyle: {
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            paddingVertical: 4,
          },
        }}
      >
        <Tabs.Screen
          name="library"
          options={{
            title: "Sparks",
            tabBarIcon: ({ color }) => (
              <View style={styles.tabItem}>
                <Layers size={22} color={color} />
                <Text allowFontScaling={false} numberOfLines={1} style={[styles.tabLabel, { color }]}>Sparks</Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              handleTabPress('library', pathname);
            },
          }}
        />
        <Tabs.Screen
          name="play"
          options={{
            title: "Play",
            tabBarIcon: ({ color }) => (
              <View style={styles.tabItem}>
                <Gamepad2 size={22} color={color} />
                <Text allowFontScaling={false} numberOfLines={1} style={[styles.tabLabel, { color }]}>Play</Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              handleTabPress('play', pathname);
            },
          }}
        />
        <Tabs.Screen
          name="plus"
          options={{
            title: "Plus",
            tabBarIcon: ({ color }) => (
              <View style={styles.tabItem}>
                <Sparkles size={22} color={color} />
                <Text allowFontScaling={false} numberOfLines={1} style={[styles.tabLabel, { color }]}>Plus</Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              handleTabPress('plus', pathname);
            },
          }}
        />
        <Tabs.Screen
          name="inspo"
          options={{
            title: "Inspo",
            tabBarIcon: ({ color }) => (
              <View style={styles.tabItem}>
                <Lightbulb size={22} color={color} />
                <Text allowFontScaling={false} numberOfLines={1} style={[styles.tabLabel, { color }]}>Inspo</Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              handleTabPress('inspo', pathname);
            },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Vault",
            tabBarIcon: ({ color }) => (
              <View style={styles.tabItem}>
                <Lock size={22} color={color} />
                <Text allowFontScaling={false} numberOfLines={1} style={[styles.tabLabel, { color }]}>Vault</Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              handleTabPress('profile', pathname);
            },
          }}
        />
      </Tabs>
    </ScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 4,
  },
});
