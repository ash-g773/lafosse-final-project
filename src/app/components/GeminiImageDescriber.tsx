import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

type Props = {
  imageUri?: string | null;
  imageMimeType?: string;
};

// image uri will be passed in
export default function GeminiImageDescriber({
  imageUri: propImageUri = null,
  imageMimeType: propMimeType = "image/jpeg",
}: Props) {
  const [imageUri, setImageUri] = useState<string | null>(propImageUri);
  const [imageMimeType, setImageMimeType] = useState<string>(propMimeType);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const describeImage = async () => {
    if (!imageUri) return;

    if (!GEMINI_API_KEY) {
      Alert.alert(
        "Missing API Key",
        "Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file",
      );
      return;
    }

    setLoading(true);
    setDescription(null);

    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });

      const body = {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: imageMimeType,
                  data: base64,
                },
              },
              {
                text: "Describe this image in 2 sentences, be concise and factual.",
              },
            ],
          },
        ],
      };

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No description returned";

      setDescription(text.trim());
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Someething went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={[styles.primaryButton, !imageUri && styles.disabledButton]}
        onPress={describeImage}
        disabled={!imageUri || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Describe Image</Text>
        )}
      </TouchableOpacity>
      {/* Result */}
      {description && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Gemini says:</Text>
          <Text style={styles.resultText}>{description}</Text>
        </View>
      )}{" "}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9f9f9",
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#a5b4fc",
  },
  resultCard: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 15,
    color: "#222",
    lineHeight: 22,
  },
});
