import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../themes";

export default function Landing() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.outerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.container}
          locations={[0, 0.7]}
        >
          <Image
            style={styles.image}
            source={require("../../../assets/images/logo.png")}
            testID="logo"
          ></Image>
          <Text style={styles.header}>Welcome to FindMyPet</Text>
          <Text style={styles.subheading}>
            Help us get missing pets back home!
          </Text>
        </LinearGradient>
        <View style={styles.card}>
          <View>
            <Text style={styles.cardText}>Spotted a lost pet?</Text>
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => router.push("/(auth)/reportSighting")}
              testID="reportBtn"
            >
              <Text style={styles.text}>Report here</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push("./login")}
              testID="loginBtn"
            >
              <Text style={styles.loginText}>Log in or Create an Account</Text>
            </TouchableOpacity>
          </View>
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
    color: theme.colors.text.light,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  image: {
    borderRadius: 30,
    height: 250,
    width: 250,
  },
  subheading: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.light,
    textAlign: "center",
    padding: theme.spacing.sm,
  },
  cardText: {
    textAlign: "center",
    fontSize: theme.fontSize.lg,
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
    flex: 1.1,
    backgroundColor: theme.colors.text.light,
    padding: theme.spacing.sm,
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
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  loginBtn: {
    backgroundColor: theme.colors.secondary + "66",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    margin: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
