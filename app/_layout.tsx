import { backManager } from "@/components/back_manager/backManager";
import { config } from "@/tamagui.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TamaguiProvider, Theme } from "tamagui";

// Create the full Tamagui config instance
// const tamaguiConfig = createTamagui(config);

export default function RootLayout() {
  const router = useRouter();
  const storeData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log(e);
    }
  };

  const getData = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      console.log(e);
    }
  };

  // Estableciendo la ID del usuario

  useEffect(() => {
    (async () => {
      if (!(await getData("user-id")) || true) {
        await storeData("user-id", Crypto.randomUUID().split("-")[4]);
      }
    })();
  }, []);

  useEffect(() => {
    backManager.setNavigationChecker(() => router.canGoBack());
    console.log(router.canGoBack());
  }, [router]);

  return (
    <TamaguiProvider config={config}>
      <Theme name="dark_green">
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </SafeAreaView>
        <StatusBar style="auto" />
      </Theme>
    </TamaguiProvider>
  );
}
