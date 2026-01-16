import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Image, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAppStore } from "@/store/appStore";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="sparks/modal" 
        options={{
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => null,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: 'rgba(20,20,24,0.6)',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
      <Stack.Screen 
        name="spark/[id]" 
        options={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginLeft: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>,
          headerTitleAlign: 'center',
          headerTitle: () => <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/uahcbjuz3204xc7ekucrd' }}
            style={{ width: 160, height: 51 }}
            resizeMode="contain"
          />,
        }} 
      />
      <Stack.Screen 
        name="inspo" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="profile/menu" options={{ title: "Menu" }} />
      <Stack.Screen name="profile/settings" options={{ title: "Settings" }} />
      <Stack.Screen name="profile/preferences" options={{ title: "Preferences" }} />
      <Stack.Screen name="profile/intentions" options={{ title: "My Intentions" }} />
      <Stack.Screen name="profile/checkin" options={{ title: "Check-in" }} />
      <Stack.Screen name="profile/checkin-config" options={{ title: "Check-in Settings" }} />
      <Stack.Screen name="profile/horoscope" options={{ title: "Horoscope" }} />
      <Stack.Screen name="profile/journal" options={{ title: "Let's Write" }} />
      <Stack.Screen name="profile/my-journal" options={{ title: "My Journal" }} />
      <Stack.Screen name="profile/journal-entry" options={{ title: "Journal Entry" }} />
      <Stack.Screen name="profile/bio" options={{ title: "Edit Bio" }} />
      <Stack.Screen name="profile/tone" options={{ title: "Communication Tone" }} />
      <Stack.Screen name="profile/focus-areas-edit" options={{ title: "Focus Areas" }} />
      <Stack.Screen name="profile/milestones" options={{ title: "Milestones" }} />
      <Stack.Screen name="profile/shared-memories" options={{ title: "Shared Memories" }} />
      <Stack.Screen name="profile/shared-memories-entry" options={{ title: "Memory" }} />
      <Stack.Screen name="sparks/explore" options={{ title: "Explore Sparks" }} />
      <Stack.Screen name="sparks/saved/index" options={{ title: "Saved" }} />
      <Stack.Screen name="sparks/saved/sparks" options={{ title: "Saved Sparks" }} />
      <Stack.Screen name="journeys/explore" options={{ title: "Explore Journeys" }} />
      <Stack.Screen name="inspo/saved" options={{ title: "Saved Inspo" }} />
      <Stack.Screen name="inspo/shared-inspo" options={{ title: "Shared Inspo" }} />
      <Stack.Screen name="inspo/section/[id]" options={{ title: "Explorer" }} />
      <Stack.Screen name="inspo/submit-story" options={{ title: "Submit Story" }} />
      <Stack.Screen name="inspo/all-categories" options={{ title: "All Categories" }} />
      <Stack.Screen 
        name="connect/index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="connect/coaches" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="connect/room/[id]" 
        options={{ 
          title: '+ Connect',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen name="favorites/index" options={{ title: "Favorites" }} />
      <Stack.Screen name="favorites/sparks" options={{ title: "Favorite Sparks" }} />
      <Stack.Screen name="favorites/inspo" options={{ title: "Favorite Inspo" }} />
      <Stack.Screen 
        name="connect/messages" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="connect/new-message" 
        options={{ 
          title: 'New Message',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="connect/guidance-messages" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="connect/unified-messages" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
