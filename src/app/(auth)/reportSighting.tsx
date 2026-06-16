import { theme } from "@/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputContentSizeChangeEvent,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import GeminiImageDescriber from "../components/GeminiImageDescriber";

export default function ReportSightingScreen() {
  // type of animal dropdown
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animalType, setValue] = useState<string | null>(null);
  const [items, setItems] = useState([
    { label: "Cat", value: "cat" },
    { label: "Dog", value: "dog" },
    { label: "Tortoise", value: "tortoise" },
    { label: "Other", value: "other" },
  ]);

  // get current location
  const [location, setLocation] = useState<Location.LocationObject | undefined>(
    undefined,
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
    console.log(location);
    console.log(errorMsg);
  }

  // open gallery or camera + select image
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<
    string | undefined
  >(undefined);

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

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      const uri = result.assets[0].uri;
      console.log("Original URI:", uri);
      const filename = uri.split("/").pop() || "sighting.jpg";
      const destUri = FileSystem.cacheDirectory + filename;
      console.log("Dest URI:", destUri);
      await FileSystem.copyAsync({ from: uri, to: destUri });
      console.log("Copy complete");
      setSelectedImage(destUri);
      setModal2Visible(false);
    }
    console.log(selectedImage);
  };

  // map pin modal setup
  const [modalVisible, setModalVisible] = useState(false);

  // picture upload modal setup
  const [modal2Visible, setModal2Visible] = useState(false);

  // save sighting description
  const [sightingDescription, setSightingDescription] = useState<string>();

  // set guest contact
  const [guestContact, setGuestContact] = useState<string | undefined>(
    undefined,
  );

  //set animal color
  const [animalColor, setAnimalColor] = useState<string | undefined>(undefined);

  // creating sighting description
  function combineDescriptors(
    animalType: string | null,
    sightingDescription: string | undefined,
    animalColor: string | undefined,
  ) {
    const fullSightingDescription =
      animalType + "; " + sightingDescription + "; " + animalColor;
    return fullSightingDescription;
  }

  const [region, setRegion] = useState<Region>({
    latitude: 51.5074, // default to central london while loading
    longitude: -0.1278,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    getLocation();
  }, []);

  // sending the filled out form
  /*POST req, /sightings, - creates a new sighting (pets_id and users_id are both nullable), 
  Request Body = {"pets_id":null, "users_id":null, "guest_contact":"random_contact", "sighting_description":"random_description", 
  "location_description":"random_location", "lat":0.0, "lng":0.0, "image_url":null}*/
  async function submitForm(
    animalType: string | null,
    sightingDescription: string | undefined,
    animalColor: string | undefined,
    guestContact: string | undefined,
    location: Location.LocationObject | undefined,
    imageUrl: string | undefined,
  ) {
    // check whether any of the above are blank, throw error
    // if (!sightingDescription || !location || !imageCloudinaryURL) {
    //   throw Alert.alert("Please fill in all required fields!");
    // }
    console.log("submitForm started");

    const token = await AsyncStorage.getItem("token");

    // decode userId from token if it exists
    let userId: number | null = null;
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        console.log(decoded);
        userId = decoded.users_id;
      } catch {
        userId = null;
      }
    }

    setSubmitting(true);
    try {
      const fullSightingDescription = combineDescriptors(
        animalType,
        sightingDescription,
        animalColor,
      );

      // only add auth header if token exists
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

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
      formData.append("lat", location ? String(location.coords.latitude) : "");
      formData.append("lng", location ? String(location.coords.longitude) : "");

      console.log("About to POST to backend");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/sightings/`,
        {
          method: "POST",
          headers,
          body: formData,
        },
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response body:", data);

      if (response.status === 201) {
        Alert.alert(
          "Success!",
          "Your sighting report has been submitted successfully. Thank you for helping to bring community pets back home!",
        );

        if (token) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/landing");
        }
      } else {
        Alert.alert(
          "Something went wrong...",
          "Your sighting report was not successful. Please try again later. " +
            (data?.error ?? ""),
        );
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

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setSelectedImageMimeType(result.assets[0].mimeType);
      setModal2Visible(false);
    }
    console.log(selectedImage);
  }

  // expandable text box
  const [height, setHeight] = useState(0);
  const onContentsSizeChange = (event: TextInputContentSizeChangeEvent) => {
    setHeight(Math.max(50, event.nativeEvent.contentSize.height));
  };

  // rendering the actual page
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: theme.colors.primary }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <SafeAreaView style={styles.container} edges={["top"]}>
          <View style={styles.topBar} testID="login&logo">
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toReport}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.buttonText}>Log in / Register</Text>
            </TouchableOpacity>
            <Image
              style={styles.logo}
              source={require("../../../assets/images/logo.png")}
              testID="logo"
            />
          </View>

          <Text style={styles.title}>Report a Sighting</Text>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.sightingForm}>
              <View style={styles.uploadImage}>
                <Text style={styles.subtitle}>
                  Please upload a photo of the sighting:
                </Text>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modal2Visible}
                  onRequestClose={() => {
                    setModal2Visible(!modal2Visible);
                  }}
                >
                  <View style={styles.modal2Container}>
                    <View style={styles.modal2Inner}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={openCamera}
                      >
                        <Text style={styles.buttonText}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={pickImage}
                      >
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
                    style={{ width: 150, height: 150 }}
                    testID="addPic"
                  />
                </TouchableOpacity>
                <Text style={styles.subtitle}>
                  Please ensure you can clearly see the animal in your photo.
                </Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.formLabels}>Where did you see them?</Text>
                <View style={styles.location}>
                  {/* once selected i.e. when location!null this needs to change to just display location */}
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
                    onRequestClose={() => {
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <View style={styles.modalContainer}>
                      <View style={styles.modalInner}>
                        <Text style={styles.mapMessage}>
                          Please select the location of the sighting on the map
                          (use two fingers to move)
                        </Text>

                        <MapView
                          style={styles.map}
                          provider={PROVIDER_GOOGLE}
                          region={region}
                          showsUserLocation={true} // show blue dot
                          showsMyLocationButton={true} // show recentre button
                          onUserLocationChange={() => {}}
                          onPress={(e) =>
                            setSelectedLocation(e.nativeEvent.coordinate)
                          }
                        >
                          {selectedLocation && (
                            <Marker
                              coordinate={selectedLocation}
                              draggable={true} // lets user drag pin after placing it
                              onDragEnd={(e) => {
                                // update location when pin is dragged
                                setSelectedLocation(e.nativeEvent.coordinate);
                              }}
                              pinColor={theme.colors.accent}
                            />
                          )}
                        </MapView>
                        {selectedLocation && (
                          <Text style={styles.locationConfirmed}>
                            📍 Location selected — drag the pin to adjust
                          </Text>
                        )}

                        <Pressable
                          style={styles.button}
                          onPress={() => {
                            if (selectedLocation) {
                              // save the map selection as the sighting location
                              setLocation({
                                coords: {
                                  latitude: selectedLocation.latitude,
                                  longitude: selectedLocation.longitude,
                                  altitude: null,
                                  accuracy: null,
                                  altitudeAccuracy: null,
                                  heading: null,
                                  speed: null,
                                },
                                timestamp: Date.now(),
                              } as Location.LocationObject);
                              console.log(
                                "coords:",
                                selectedLocation.latitude,
                                selectedLocation.longitude,
                              );
                            }
                            setModalVisible(false);
                          }}
                        >
                          <Text style={styles.buttonText}>
                            {selectedLocation
                              ? "Confirm location"
                              : "Close map"}
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
                  setValue={setValue}
                  setItems={setItems}
                  placeholder="Select an animal..."
                  listMode="SCROLLVIEW"
                  style={styles.input}
                  testID="dropdown"
                />
                <Text style={styles.formLabels}>Color / Pattern: </Text>
                <TextInput
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="Please input color"
                  placeholderTextColor={theme.colors.text.secondary}
                  onChangeText={setAnimalColor}
                  testID="colorInput"
                />

                <Text style={styles.formLabels}>Description: </Text>
                <TextInput
                  multiline={true}
                  placeholder="Time of sighting, behaviour etc."
                  placeholderTextColor={theme.colors.text.secondary}
                  autoCapitalize="none"
                  style={{
                    height: height,
                    backgroundColor: theme.colors.secondary_light,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    fontSize: theme.fontSize.md,
                    marginBottom: theme.spacing.md,
                    color: theme.colors.text.primary,
                  }}
                  onContentSizeChange={onContentsSizeChange}
                  onChangeText={setSightingDescription}
                  testID="descriptionInput"
                />

                <View style={styles.aiResponseContainer}>
                  {selectedImage ? (
                    <GeminiImageDescriber
                      imageUri={selectedImage}
                      imageMimeType={selectedImageMimeType}
                    />
                  ) : (
                    <Text style={styles.aiResponse}>
                      Please upload an image
                    </Text>
                  )}
                </View>

                <Text style={styles.formLabels}>
                  Your contact info (optional):{" "}
                </Text>
                <TextInput
                  placeholder="+44 1234567890"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoCapitalize="none"
                  style={styles.input}
                  onChangeText={setGuestContact}
                  testID="contactInput"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={() => {
                  console.log("submit button pressed");
                  submitForm(
                    animalType,
                    sightingDescription,
                    animalColor,
                    guestContact,
                    location,
                    selectedImage,
                  );
                }}
                testID="submitButton"
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
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
  backBtn: {
    height: 25,
    width: 80,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
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
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
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
    borderRadius: 10,
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
    borderRadius: 20,
  },
  mapMessage: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text.light,
    textAlign: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  map: {
    height: 500,
    width: 300,
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
  locationConfirmed: {
    color: theme.colors.text.light,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
  },
  locationButtonSelected: {
    backgroundColor: theme.colors.success,
  },
  aiResponseContainer: {
    width: "100%",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  aiResponse: {
    color: theme.colors.text.light,
    textAlign: "center",
    fontSize: theme.fontSize.md,
  },
});
