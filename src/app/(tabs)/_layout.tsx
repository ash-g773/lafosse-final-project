import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function TabsLayout() {
  const router = useRouter();

  const token = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("token");
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };
  console.log(token);

  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/landing");
    } else {
      router.replace("/(tabs)/index");
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
