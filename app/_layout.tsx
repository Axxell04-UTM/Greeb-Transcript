import { config } from "@/tamagui.config";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { TamaguiProvider, Theme } from "tamagui";

// Create the full Tamagui config instance
// const tamaguiConfig = createTamagui(config);

export default function RootLayout() {
  return (
    <TamaguiProvider config={config} >
      <Theme name="dark_green">
        <SafeAreaView style={{flex: 1}}>
          <Stack>
            <Stack.Screen name="index" options={{
              headerShown: false
            }} />
            <Stack.Screen name="settings" options={{
              headerShown: false
            }} />
          </Stack>
        </SafeAreaView>
        <StatusBar style="auto" />
      </Theme>
    </TamaguiProvider>
  );
}
