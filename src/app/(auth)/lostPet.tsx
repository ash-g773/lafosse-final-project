import { theme } from "@/themes";
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
    // check whether any of the above are blank, throw error
    // if (!sightingDescription || !location || !imageCloudinaryURL) {
    //   throw Alert.alert("Please fill in all required fields!");
    // }
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // user_id: userID, --- need to figure out how this is carried through
        name: petName ? petName : null,
        species: animalType ? animalType : null,
        breed: animalBreed ? animalBreed : null,
        color: animalColor ? animalColor : null,
        description: description,
        // last_seen_location: --- ?
        lat: location ? location.coords.latitude : null,
        lng: location ? location.coords.longitude : null,
        image_url: "placeholder_img_url",
      }),
    };
    console.log(options);

    try {
      // const response = await fetch("http://127.0.0.1:3000/sightings/", options);
      const response = { status: 200 };
      // const data = await response.json();
      if (response.status == 200) {
        //clear form
        Alert.alert(
          "Report created",
          "Your lost pet report has been submitted successfully. We hope you are reunited soon!",
        );
        router.replace("/(auth)/landing");
      } else {
        Alert.alert(
          "Something went wrong...",
          "Your lost pet report was not successfully created. Please try again later.",
          // data.error,
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  // rendering the actual page
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
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
              />
            </TouchableOpacity>
            <Text style={styles.subtitle}>
              Please ensure you can clearly see the animal in your photo.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formLabels}>Your pet's name (optional)</Text>
            <TextInput
              placeholder=""
              autoCapitalize="none"
              style={styles.input}
              onChangeText={setPetName}
            />
            <Text style={styles.formLabels}>Where did you last see them?</Text>
            <View style={styles.location}>
              {/* once selected i.e. when location!null this needs to change to just display location */}
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => getCurrentLocation()}
              >
                <Text style={styles.buttonText}>At my current location</Text>
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
                      Please select the location of the sighting on the map (use
                      two fingers to move)
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
                style={styles.locationButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>Somewhere else (open map)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabels}>What type of animal are they?</Text>
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
            />
            <Text style={styles.formLabels}>
              What breed are they? (optional)
            </Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="Please input breed"
              onChangeText={setAnimalBreed}
            />
            <Text style={styles.formLabels}>
              What color / pattern are they?
            </Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="Please input color"
              onChangeText={setAnimalColor}
            />

            <Text style={styles.formLabels}>More information: </Text>
            <TextInput
              placeholder="Any helpful info incase someone spots your pet"
              autoCapitalize="none"
              style={styles.moreInfo}
              onChangeText={setDescription}
              multiline={true}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
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
          >
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
});
