import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../themes";

export default function Landing() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.outerContainer}>
        <LinearGradient
          colors={[
            theme.colors.tertiary,
            theme.colors.primary,
            theme.colors.secondary,
          ]}
          style={styles.container}
          locations={[0, 0.3, 1]}
        >
          <Image></Image>
          <Text style={styles.header}>Welcome to FindMyPet</Text>
          <Text style={styles.subheading}>
            Help us get missing pets back home!
          </Text>
        </LinearGradient>
        <View style={styles.card}>
          <View>
            <Text style={styles.cardText}>Spotted a lost pet?</Text>
            <TouchableOpacity style={styles.reportBtn}>
              <Text style={styles.text}>Report a Sighting</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginText}>Log In or Create an Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 2,
    backgroundColor: theme.colors.secondary,
  },
  container: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold",
    color: theme.colors.text.light, // white
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  subheading: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.light,
    textAlign: "center",
    padding: theme.spacing.sm,
  },
  cardText: {
    textAlign: "center",
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    margin: theme.spacing.md,
  },
  text: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.light,
    fontWeight: "bold",
  },
  loginText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  card: {
    flex: 0.8,
    backgroundColor: theme.colors.text.light,
    padding: theme.spacing.xl,
    borderRadius: 30,
    margin: theme.spacing.sm,
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  reportBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  loginBtn: {
    backgroundColor: theme.colors.secondary + "66",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
});
