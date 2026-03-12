import {
  Prompt_400Regular,
  Prompt_700Bold,
  useFonts,
} from "@expo-google-fonts/prompt";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Prompt_400Regular,
    Prompt_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1893da",
        },
        headerTitleStyle: {
          fontFamily: "Prompt_700Bold",
          fontSize: 20,
          color: "#fff",
        },
        headerTintColor: "#fff", // สีของปุ่มกลับ
        headerBackButtonDisplayMode: "minimal", // ซ่อนข้อความบนปุ่มกลับ
        headerTitleAlign: "center", // จัดตำแหน่งหัวข้อให้อยู่ตรงกลาง
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="run" options={{ title: "Run Tracker" }} />
      <Stack.Screen name="add" options={{ title: "เพิ่มรายการวิ่ง" }} />
      <Stack.Screen name="[id]" options={{ title: "รายละเอียดรายการวิ่ง" }} />
    </Stack>
  );
}
