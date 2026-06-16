import { theme } from "@/themes";
import * as Clipboard from "expo-clipboard";
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
    if (!imageUri) {
      Alert.alert("Please upload an image first");
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
        Alert.alert(err.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No description returned";

      setDescription(text.trim());
    } catch (err) {
      Alert.alert("Error", err.message ?? "Something went wrong");
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
          <Text style={styles.primaryButtonText}>
            Generate AI description of uploaded photo
          </Text>
        )}
      </TouchableOpacity>
      {/* Result */}
      {description && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Gemini says:</Text>
          <Text style={styles.resultText}>{description}</Text>
          <TouchableOpacity
            style={styles.primaryButton2}
            onPress={async () => Clipboard.setStringAsync(description)}
          >
            <Text style={styles.primaryButtonText}>Copy to clipboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    width: "100%",
    alignItems: "center",
  },
  primaryButton2: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: theme.colors.secondary_light,
    fontWeight: "600",
    fontSize: theme.fontSize.md,
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: theme.colors.tertiary,
  },
  resultCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.secondary_light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: "100%",
  },
  resultLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.tertiary,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
  },
  resultText: {
    fontSize: theme.fontSize.md,
    color: "black",
    lineHeight: 22,
  },
});
