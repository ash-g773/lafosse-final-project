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

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: "https://www.cats.org.uk/media/i5spwtgt/cat-in-box.jpg",
        }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign up for FindMyPet:</Text>
        <View style={styles.form}>
          <Text style={styles.formLabels}>Username: </Text>
          <TextInput
            placeholder="Please enter a username"
            style={styles.input}
          />
          <Text style={styles.formLabels}>Password: </Text>
          <TextInput
            placeholder="Please enter a password"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.register}>
          <Text style={styles.linkButtonText}>Already have an account?</Text>

          <TouchableOpacity style={styles.linkButton}>
            <Text
              style={styles.linkButtonTextBold}
              onPress={() => router.push("/(auth)/login")}
            >
              {" "}
              Login Here
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity style={styles.toReport}>
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
  subtitle: {
    fontSize: 18,
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
