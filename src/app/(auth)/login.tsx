import { theme } from "@/global";
import { router } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../../assets/images/logo.png")}
        testID="logo"
      />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <View style={styles.form}>
          <Text style={styles.formLabels}>Username: </Text>
          <TextInput
            placeholder="Please enter your username"
            style={styles.input}
            testID="username"
          />
          <Text style={styles.formLabels}>Password: </Text>
          <TextInput
            placeholder="Please enter your password"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            testID="password"
          />
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.register}>
          <Text style={styles.linkButtonText}>Don't have an account?</Text>

          <TouchableOpacity style={styles.linkButton}>
            <Text
              style={styles.linkButtonTextBold}
              onPress={() => router.push("/(auth)/register")}
            >
              {" "}
              Register Here
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity
            style={styles.toReport}
            onPress={() => router.replace("/(auth)/reportSighting")}
          >
            <Text style={styles.buttonText}>Report a sighting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#f7f9f8",
  },
  form: {
    alignItems: "stretch",
    width: "100%",
  },
  formLabels: {
    color: "#f7f9f8",
  },
  input: {
    width: 250,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#f7f9f8",
    fontSize: 16,
    fontWeight: "600",
  },
  register: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  linkButton: {
    marginTop: 24,
  },
  linkButtonText: {
    marginTop: 24,
    color: "#f7f9f8",
    alignItems: "center",
  },
  linkButtonTextBold: {
    fontWeight: "600",
    color: "#f7f9f8",
  },
  image: {
    marginTop: 50,
    width: 100,
    height: 100,
  },
  toReport: {
    marginTop: 150,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
});
