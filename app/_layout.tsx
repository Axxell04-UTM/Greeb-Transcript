import { backManager } from "@/components/back_manager/backManager";
import { config } from "@/tamagui.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TamaguiProvider, Theme } from "tamagui";

// Fonts
import {
  DMSans_100Thin,
  DMSans_200ExtraLight_Italic,
  DMSans_300Light,
  DMSans_300Light_Italic,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { RacingSansOne_400Regular } from "@expo-google-fonts/racing-sans-one";
import { useFonts } from "expo-font";

// Create the full Tamagui config instance
// const tamaguiConfig = createTamagui(config);

// Mantener el splash nativo visible hasta que las fuentes resuelvan (o fallen).
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Cargando Fuentes
  const [fontsLoaded, fontError] = useFonts({
    RacingSansOne_400Regular,

    DMSans_100Thin,
    DMSans_200ExtraLight_Italic,
    DMSans_300Light,
    DMSans_300Light_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

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

  // Ocultar el splash apenas tengamos un resultado definitivo de las fuentes.
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) {
      console.warn("Font loading failed, falling back to system fonts", fontError);
    }
  }, [fontError]);

  // Bloquear el render solo mientras el resultado de las fuentes sea desconocido.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name="dark_black">
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
