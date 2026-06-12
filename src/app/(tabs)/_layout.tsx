import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function TabsLayout() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkToken() {
      try {
        const stored = await AsyncStorage.getItem("token");
        setToken(stored);
      } catch (e) {
        console.error("Error reading token:", e);
      } finally {
        setLoading(false);
      }
    }
    checkToken();
  }, []);

  useEffect(() => {
    if (loading) return; // wait until check is done
    if (!token) {
      console.log("no token, redirecting to landing");
      router.replace("/(auth)/landing" as any);
    }
  }, [loading, token]);

  if (loading) return null; // render nothing while checking

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
