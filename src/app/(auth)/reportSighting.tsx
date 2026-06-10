import { theme } from "@/global";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportSightingScreen() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Cat", value: "cat" },
    { label: "Dog", value: "dog" },
    { label: "Tortoise", value: "tortoise" },
    { label: "Other", value: "other" },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.toReport}>
          <Text style={styles.buttonText}>Login / Register</Text>
        </TouchableOpacity>

        <Image
          style={styles.logo}
          source={require("../../../assets/images/logo.png")}
          testID="logo"
        />
      </View>

      <Text style={styles.title}>Report a Sighting</Text>
      <ScrollView>
        <View style={styles.sightingForm}>
          <View style={styles.uploadImage}>
            <Text style={styles.subtitle}>
              Please upload a photo of the sighting:
            </Text>
            <TouchableOpacity style={styles.button}>
              <Image source={require("../../../assets/images/add-pic.png")} />
            </TouchableOpacity>
            <Text style={styles.subtitle}>
              Please ensure you can clearly see the animal in your photo.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formLabels}>Where did you see them?</Text>
            <View style={styles.location}>
              <TouchableOpacity style={styles.locationButton}>
                <Text style={styles.buttonText}>At my current location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.locationButton}>
                <Text style={styles.buttonText}>Somewhere else (open map)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabels}>Type of Animal: </Text>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Select an animal..."
              listMode="SCROLLVIEW"
              style={styles.input}
            />
            <Text style={styles.formLabels}>Color / Pattern: </Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="Please input color"
            />

            <Text style={styles.formLabels}>Description: </Text>
            <TextInput
              placeholder="Time of sighting, important info, behaviour etc."
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.formLabels}>
              Your contact info (optional):{" "}
            </Text>
            <TextInput
              placeholder="+44 1234567890"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  sightingForm: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
  },
  uploadImage: {},
  topBar: {
    marginTop: theme.spacing.lg,
    width: "100%",
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  title: {
    marginTop: 60,
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
    color: theme.colors.text.light,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
    color: theme.colors.text.light,
  },
  form: {
    alignItems: "stretch",
    width: "100%",
  },
  location: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch",
  },
  locationButton: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
  },
  formLabels: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text.light,
  },
  input: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.accent,
    borderWidth: 1,
  },
  button: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.text.light,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  register: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  linkButton: {
    marginTop: theme.spacing.lg,
  },
  linkButtonText: {
    marginTop: theme.spacing.lg,
    color: theme.colors.text.light,
    alignItems: "center",
  },
  linkButtonTextBold: {
    fontWeight: "600",
    color: theme.colors.text.light,
  },
  logo: {
    width: 50,
    height: 50,
  },
  toReport: {
    height: 25,
    width: 200,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
});
