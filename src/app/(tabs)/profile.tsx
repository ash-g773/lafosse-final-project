import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../themes";

interface UserProfile {
  profiles_id: number;
  users_id: number;
  full_name: string | null;
  phone: string | null;
  postcode: string | null;
  lat: string | null;
  lng: string | null;
  alert_radius: number;
  created_at: string;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [userId, setUserId] = useState<number | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [alertRadius, setAlertRadius] = useState("");

  const hasChanges =
    fullName !== (profile?.full_name || "") ||
    phone !== (profile?.phone || "") ||
    postcode !== (profile?.postcode || "");

  function decodeUserId(token: string): number | null {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      // check with your backend team which field name they use
      return decoded.users_id || decoded.userId || decoded.id || decoded.sub;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    async function start() {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const id = decodeUserId(token);
        setUserId(id);
        if (id) {
          await fetchProfileWithId(id, token);
        }
      }
    }
    start();
  }, []);
  async function fetchProfileWithId(id: number, token: string) {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const json = await response.json();
      console.log("Profile data:", json);

      const data = json.data;

      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setPostcode(data.postcode || "");
      setAlertRadius(data.alert_radius?.toString() || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !userId) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: fullName,
            phone: phone,
            postcode: postcode,
            alert_radius: parseInt(alertRadius),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setSuccess(true);

      // clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Something went wrong, please try again");
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        testID="back-btn"
        onPress={() => router.back()}
      >
        <Text>Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Your Profile</Text>
      {success && (
        <Text style={styles.successMsg}>Profile updated successfully!</Text>
      )}
      {error && <Text style={styles.errorMsg}>{error}</Text>}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        value={fullName}
        style={styles.input}
        onChangeText={setFullName}
        placeholder="Your Name"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Your Number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Postcode</Text>
      <TextInput
        value={postcode}
        style={styles.input}
        onChangeText={setPostcode}
        placeholder="Your Postcode"
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Alert Radius</Text>
      <TextInput
        value={alertRadius}
        style={styles.input}
        onChangeText={setAlertRadius}
        placeholder="Choose your alert radius"
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        testID="save-btn"
        disabled={saving || !hasChanges}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    gap: 8,
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 10,
  },
  heading: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
    padding: 10,
    alignSelf: "center",
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    padding: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
  successMsg: {
    color: theme.colors.success,
    fontSize: theme.fontSize.md,
    textAlign: "center",
    padding: theme.spacing.sm,
  },
  errorMsg: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    textAlign: "center",
    padding: theme.spacing.sm,
  },
});
