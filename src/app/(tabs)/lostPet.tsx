import { theme } from "@/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LostPetScreen() {
  // type of animal dropdown
  const [open, setOpen] = useState(false);
  const [animalType, setValue] = useState<string | null>(null);
  const [items, setItems] = useState([
    { label: "Cat", value: "cat" },
    { label: "Dog", value: "dog" },
    { label: "Tortoise", value: "tortoise" },
    { label: "Other (please add to description)", value: "other" },
  ]);

  // get current location
  const [location, setLocation] = useState<Location.LocationObject | undefined>(
    undefined,
  );
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

  const [readableLocation, setReadableLocation] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status != "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    const geocode = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    if (geocode.length > 0) {
      const g = geocode[0];
      const readable = [g.name, g.street, g.district, g.city]
        .filter(Boolean)
        .join(", ");
      setReadableLocation(readable);
    }
  }

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

  // open gallery or camera + select image
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );

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

    // potentially update to expo document picker to be able to choose multiple
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModal2Visible(false);
    }
    console.log(selectedImage);
  };

  // map pin modal setup
  const [modalVisible, setModalVisible] = useState(false);

  // picture upload modal setup
  const [modal2Visible, setModal2Visible] = useState(false);

  // save sighting description
  const [description, setDescription] = useState<string>();

  // save animal type
  const [animalBreed, setAnimalBreed] = useState<string>();

  // set guest contact
  const [petName, setPetName] = useState<string | undefined>(undefined);

  //set animal color
  const [animalColor, setAnimalColor] = useState<string | undefined>(undefined);

  //loading state
  const [submitting, setSubmitting] = useState(false);

  // sending the filled out form
  /*POST req, /pets, - creates a new lost pet post, 
  Request Body = {"users_id":1, "name":"random_name", "species":"random_species", "breed":"random_breed", 
  "colour":"random_colour", "description":"random_description", "last_seen_location":"random_location", 
  "lat":0.0, "lng":0.0, "image_url":null}*/
  async function submitForm(
    petName: string | undefined,
    animalType: string | null,
    animalBreed: string | undefined,
    description: string | undefined,
    animalColor: string | undefined,
    location: Location.LocationObject | undefined,
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

      const formData = new FormData();

      if (imageUrl) {
        const filename = imageUrl.split("/").pop() || "pet.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", {
          uri: imageUrl,
          name: filename,
          type: mimeType,
        } as any);
      }

      formData.append("users_id", userId ? String(userId) : "");
      formData.append("name", petName ?? "");
      formData.append("species", animalType ?? "");
      formData.append("breed", animalBreed ?? "");
      formData.append("colour", animalColor ?? "");
      formData.append("description", description ?? "");
      formData.append("last_seen_location", readableLocation || "Unknown location");
      formData.append(
        "lat",
        selectedLocation
          ? String(selectedLocation.latitude)
          : String(location?.coords.latitude ?? ""),
      );
      formData.append(
        "lng",
        selectedLocation
          ? String(selectedLocation.longitude)
          : String(location?.coords.longitude ?? ""),
      );

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pets`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Report created",
          "Your lost pet report has been submitted successfully. We hope you are reunited soon!",
        );
        router.replace("/(tabs)" as any);
      } else {
        Alert.alert(
          "Something went wrong...",
          "Your lost pet report was not successfully created. Please try again later.",
        );
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
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
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toReport}
              onPress={() => router.replace("/(tabs)/profile")}
            >
              <Text style={styles.buttonText}>Go to profile</Text>
            </TouchableOpacity>

            <Image
              style={styles.logo}
              source={require("../../../assets/images/logo.png")}
            />
          </View>

          <Text style={styles.title}>Report a Lost Pet</Text>
          <ScrollView>
            <View style={styles.sightingForm}>
              <View style={styles.uploadImage}>
                <Text style={styles.subtitle}>
                  Please upload a photo of your pet:
                </Text>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
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
                <Text style={styles.formLabels}>
                  Your pet's name (optional)
                </Text>
                <TextInput
                  placeholder=""
                  autoCapitalize="none"
                  style={styles.input}
                  onChangeText={setPetName}
                />
                <Text style={styles.formLabels}>
                  Where did you last see them?
                </Text>
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
                      {location && !selectedLocation && readableLocation
                        ? `✓ ${readableLocation}`
                        : "At my current location"}
                    </Text>
                  </TouchableOpacity>

                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                      Alert.alert("modal closed");
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
                          // provider={PROVIDER_GOOGLE}
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
                          onPress={async () => {
                            if (selectedLocation) {
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

                              const geocode = await Location.reverseGeocodeAsync({
                                latitude: selectedLocation.latitude,
                                longitude: selectedLocation.longitude,
                              });
                              if (geocode.length > 0) {
                                const g = geocode[0];
                                const readable = [g.name, g.street, g.district, g.city]
                                  .filter(Boolean)
                                  .join(", ");
                                setReadableLocation(readable);
                              }
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
                      {selectedLocation && readableLocation
                        ? `✓ ${readableLocation}`
                        : selectedLocation
                          ? "✓ Location pinned"
                          : "Somewhere else (open map)"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.formLabels}>
                  What type of animal are they?
                </Text>
                <DropDownPicker
                  open={open}
                  value={animalType}
                  items={items}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
                  placeholder="Select..."
                  listMode="SCROLLVIEW"
                  style={styles.input}
                  testID="dropdown"
                />
                <Text style={styles.formLabels}>
                  What breed are they? (optional)
                </Text>
                <TextInput
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="Please input breed"
                  placeholderTextColor={theme.colors.text.secondary}
                  onChangeText={setAnimalBreed}
                />
                <Text style={styles.formLabels}>
                  What color / pattern are they?
                </Text>
                <TextInput
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="Please input color"
                  placeholderTextColor={theme.colors.text.secondary}
                  onChangeText={setAnimalColor}
                  testID="colorInput"
                />

                <Text style={styles.formLabels}>More information: </Text>
                <TextInput
                  placeholder="Your contact info (optional) and any additional info"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoCapitalize="none"
                  style={{
                    backgroundColor: theme.colors.secondary_light,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    fontSize: theme.fontSize.md,
                    marginBottom: theme.spacing.md,
                    color: theme.colors.text.secondary,
                    height: height,
                  }}
                  onChangeText={setDescription}
                  onContentSizeChange={onContentsSizeChange}
                  multiline={true}
                  testID="descriptionInput"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={() =>
                  submitForm(
                    petName,
                    animalType,
                    animalBreed,
                    description,
                    animalColor,
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
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  toReport: {
    height: 25,
    width: 200,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  backBtn: {
    height: 25,
    width: 80,
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
  moreInfo: {
    backgroundColor: theme.colors.secondary_light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.secondary,
    height: 100,
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
  map: {
    height: 500,
    width: 300,
  },
});
