import { theme } from "@/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import GeminiImageDescriber from "../components/GeminiImageDescriber";

export default function ReportSightingScreen() {
  const [open, setOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [animalType, setAnimalType] = useState<string | null>(null);
  const [items, setItems] = useState([
    { label: "Cat", value: "cat" },
    { label: "Dog", value: "dog" },
    { label: "Tortoise", value: "tortoise" },
    { label: "Other", value: "other" },
  ]);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status != "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<
    string | undefined
  >(undefined);
  const [loadAi, setLoadAi] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required",
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModal2Visible(false);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [sightingDescription, setSightingDescription] = useState<string>();
  const [guestContact, setGuestContact] = useState<string | undefined>(
    undefined,
  );
  const [animalColor, setAnimalColor] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  function combineDescriptors(
    animalType: string | null,
    sightingDescription: string | undefined,
    animalColor: string | undefined,
  ) {
    return animalType + "; " + sightingDescription + "; " + animalColor;
  }

  async function submitForm(
    animalType: string | null,
    sightingDescription: string | undefined,
    animalColor: string | undefined,
    guestContact: string | undefined,
    location: Location.LocationObject | null,
    imageUrl: string | undefined,
  ) {
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      let userId: number | null = null;
      if (token) {
        try {
          const payload = token.split(".")[1];
          const decoded = JSON.parse(atob(payload));
          userId = decoded.users_id;
        } catch {
          userId = null;
        }
      }

      const fullSightingDescription = combineDescriptors(
        animalType,
        sightingDescription,
        animalColor,
      );

      const formData = new FormData();

      if (imageUrl) {
        const filename = imageUrl.split("/").pop() || "sighting.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", {
          uri: imageUrl,
          name: filename,
          type: mimeType,
        } as any);
      }

      formData.append("sighting_description", fullSightingDescription);
      formData.append("guest_contact", guestContact ?? "");
      formData.append("users_id", userId ? String(userId) : "");
      formData.append(
        "lat",
        selectedLocation
          ? String(selectedLocation.latitude)
          : location
            ? String(location.coords.latitude)
            : "",
      );
      formData.append(
        "lng",
        selectedLocation
          ? String(selectedLocation.longitude)
          : location
            ? String(location.coords.longitude)
            : "",
      );

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/sightings/`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert(
          "Success!",
          "Your sighting report has been submitted successfully.",
        );
        router.replace("/(tabs)" as any);
      } else {
        Alert.alert("Something went wrong...", data.error);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function openCamera() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required",
      );
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.back,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModal2Visible(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)" as any)}
        >
          <Text style={styles.buttonText}>Back</Text>
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
            <Modal
              animationType="slide"
              transparent={true}
              visible={modal2Visible}
              onRequestClose={() => setModal2Visible(!modal2Visible)}
            >
              <View style={styles.modal2Container}>
                <View style={styles.modal2Inner}>
                  <TouchableOpacity style={styles.button} onPress={openCamera}>
                    <Text style={styles.buttonText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModal2Visible(true)}
            >
              <Image
                source={
                  selectedImage
                    ? { uri: selectedImage }
                    : require("../../../assets/images/add-pic.png")
                }
                style={{ width: 200, height: 200 }}
              />
            </TouchableOpacity>
            <Text style={styles.subtitle}>
              Please ensure you can clearly see the animal in your photo.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formLabels}>Where did you see them?</Text>
            <View style={styles.location}>
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  location &&
                    !selectedLocation &&
                    styles.locationButtonSelected,
                ]}
                onPress={() => getCurrentLocation()}
              >
                <Text style={styles.buttonText}>
                  {location && !selectedLocation
                    ? "✓ Current location"
                    : "At my current location"}
                </Text>
              </TouchableOpacity>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalInner}>
                    <Text style={styles.mapMessage}>
                      Please select the location of the sighting on the map
                    </Text>
                    <View>
                      <Text> MAP GOES HERE </Text>
                    </View>
                    <Pressable
                      style={styles.button}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text style={styles.buttonText}>
                        Submit location and close map
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  selectedLocation && styles.locationButtonSelected,
                ]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>
                  {selectedLocation
                    ? "✓ Location pinned"
                    : "Somewhere else (open map)"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabels}>Type of Animal: </Text>
            <DropDownPicker
              open={open}
              value={animalType}
              items={items}
              setOpen={setOpen}
              setValue={setAnimalType}
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
              onChangeText={setAnimalColor}
            />
            <Text style={styles.formLabels}>Description: </Text>
            <TextInput
              placeholder="Time of sighting, important info, behaviour etc."
              autoCapitalize="none"
              style={styles.input}
              onChangeText={setSightingDescription}
            />

            <TouchableOpacity onPress={() => setLoadAi(true)}>
              <Text>
                {" "}
                {!loadAi ? (
                  "Click here for an AI summary of your sighting photo"
                ) : (
                  <GeminiImageDescriber
                    imageUri={selectedImage}
                    imageMimeType={selectedImageMimeType}
                  />
                )}{" "}
              </Text>
            </TouchableOpacity>
            <Text style={styles.formLabels}>
              Your contact info (optional):{" "}
            </Text>
            <TextInput
              placeholder="+44 1234567890"
              autoCapitalize="none"
              style={styles.input}
              onChangeText={setGuestContact}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={() =>
              submitForm(
                animalType,
                sightingDescription,
                animalColor,
                guestContact,
                location,
                selectedImage,
              )
            }
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Submitting..." : "Submit"}
            </Text>
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
    alignItems: "center",
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
    backgroundColor: theme.colors.secondary_light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.secondary,
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
  logo: {
    width: 50,
    height: 50,
  },
  backBtn: {
    height: 25,
    width: 80,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalInner: {
    width: "80%",
    height: "90%",
    margin: 20,
    backgroundColor: theme.colors.primary,
    padding: 25,
    alignItems: "center",
    elevation: 5,
    justifyContent: "space-between",
  },
  mapMessage: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text.light,
    textAlign: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  modal2Container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal2Inner: {
    width: "80%",
    height: "15%",
    margin: 20,
    backgroundColor: theme.colors.primary,
    padding: 25,
    alignItems: "center",
    elevation: 5,
    justifyContent: "space-around",
    flexDirection: "row",
  },
  locationButtonSelected: {
    backgroundColor: theme.colors.success,
  },
});
