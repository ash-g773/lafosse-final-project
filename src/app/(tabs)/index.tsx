import * as Location from "expo-location";
import * as NavigationBar from "expo-navigation-bar";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { theme } from "../../themes";

interface Pet {
  pets_id: number;
  users_id: number;
  name: string;
  species: string;
  breed: string | null;
  colour: string | null;
  description: string | null;
  last_seen_location: string | null;
  lat: string; //look at backend fix so these can be number
  lng: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

interface Sighting {
  sightings_id: number;
  pets_id: number | null;
  users_id: number | null;
  guest_contact: string | null;
  sighting_description: string;
  location_description: string;
  lat: string;
  lng: string;
  image_url: string | null;
  created_at: string;
}

// const BACKEND_URL = "localhost:3000";

// hardcoded sightings
// const FAKE_PETS: Pet[] = [
//   {
//     pets_id: 1,
//     users_id: 1,
//     name: "Luna",
//     species: "Cat",
//     breed: null,
//     colour: null,
//     description: "Black cat, very friendly",
//     last_seen_location: "Thorpedale Road",
//     lat: 51.566691,
//     lng: -0.119936,
//     image_url:
//       "https://images.unsplash.com/photo-1604916287784-c324202b3205?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     status: "lost",
//     created_at: "2024-01-01",
//   },
//   {
//     pets_id: 2,
//     users_id: 2,
//     name: "Buddy",
//     species: "Dog",
//     breed: "Golden Retriever",
//     colour: "Golden",
//     description: "Golden retriever, very friendly but disobedient",
//     last_seen_location: "Chelsea Bridge Road",
//     lat: 51.509,
//     lng: -0.131,
//     image_url:
//       "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     status: "lost",
//     created_at: "2024-01-01",
//   },
// ];

// const FAKE_SIGHTINGS: Sighting[] = [
//   {
//     sightings_id: 1,
//     pets_id: 1,
//     users_id: null,
//     guest_contact: "finder@email.com",
//     sighting_description: "Possible match for Luna spotted near park",
//     location_description: "Near basketball courts",
//     lat: 51.5657966,
//     lng: -0.1174506,
//     image_url:
//       "https://media.istockphoto.com/id/522302922/photo/black-cat-in-garden.webp?s=1024x1024&w=is&k=20&c=XlqexvWUEVai1V4HqqhOa3SvttfEAQBXwaxEp1wpZwo=",
//     created_at: "2024-01-01",
//   },
// ];

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 51.5074, // default to central london while loading
    longitude: -0.1278,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"pet" | "sighting">("pet");

  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [lostPets, setLostPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMapData() {
    try {
      const [lostPetsRes, sightingsRes] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL_ASH}/pets`),
        fetch(`${process.env.EXPO_PUBLIC_API_URL_ASH}/sightings`),
      ]);
      console.log("finish getting pets and sightings");

      const lostPetsData = await lostPetsRes.json();
      const sightingsData = await sightingsRes.json();
      setLostPets(lostPetsData);
      setSightings(sightingsData);
    } catch (error) {
      console.log(`${process.env.EXPO_PUBLIC_API_URL_ASH}`);
      console.error("Failed to fetch map data:", error);
    } finally {
      setLoading(false);
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
    fetchMapData(); // call it here
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Loading map data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" hidden={true} />
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        region={region}
        testID="map-view"
        showsUserLocation={true} // show blue dot
        showsMyLocationButton={true} // show recentre button
      >
        {lostPets.map((Pet) => (
          <Marker
            key={`pet-${Pet.pets_id}`}
            testID={`pet-marker-${Pet.pets_id}`}
            coordinate={{
              latitude: parseFloat(Pet.lat),
              longitude: parseFloat(Pet.lng),
            }}
            title={Pet.name}
            description={Pet.description || ""}
            pinColor={theme.colors.accent}
            onPress={() => {
              setSelectedPet(Pet);
              setModalVisible(true);
              setModalType("pet");
            }}
          />
        ))}

        {sightings.map((sighting) => (
          <Marker
            key={`sighting-${sighting.sightings_id}`}
            testID={`sighting-marker-${sighting.sightings_id}`}
            coordinate={{
              latitude: parseFloat(sighting.lat), // add parseFloat
              longitude: parseFloat(sighting.lng),
            }}
            title="Sighting reported"
            description={sighting.sighting_description}
            pinColor={theme.colors.success}
            onPress={() => {
              setSelectedSighting(sighting);
              setModalVisible(true);
              setModalType("sighting");
            }}
          />
        ))}
      </MapView>
      <View style={styles.topButtons}>
        <TouchableOpacity
          style={styles.iconBtn}
          testID="profile-btn"
          onPress={() => router.push("./profile")}
        >
          <Text>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} testID="logout-btn">
          <Text>Log Out</Text>
        </TouchableOpacity>
      </View>
      {menuOpen && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => {
              setMenuOpen(false);
              router.push("./reportLost");
            }}
          >
            <Text style={styles.menuText}>🐾 Report Lost Pet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => {
              setMenuOpen(false);
              router.push("./reportSighting");
            }}
          >
            <Text style={styles.menuText}>📍 Report Sighting</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.plusBtn}
        testID="plus-btn"
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <Text style={styles.plusText}>{menuOpen ? "✕" : "+"}</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />

            {modalType === "pet" && selectedPet && (
              <>
                <Text style={styles.modalName}>{selectedPet.name}</Text>
                {selectedPet.image_url && (
                  <Image
                    style={styles.image}
                    source={{ uri: selectedPet.image_url }}
                  />
                )}
                <Text style={styles.modalDescription}>
                  {selectedPet.species}
                  {selectedPet.breed ? ` · ${selectedPet.breed}` : ""}
                </Text>
                {selectedPet.colour && (
                  <Text style={styles.modalDescription}>
                    Colour: {selectedPet.colour}
                  </Text>
                )}
                <Text style={styles.modalDescription}>
                  {selectedPet.description}
                </Text>
                <Text style={styles.modalDescription}>
                  Last seen: {selectedPet.last_seen_location}
                </Text>
                <Text style={styles.modalType}>🔴 Missing</Text>
              </>
            )}

            {modalType === "sighting" && selectedSighting && (
              <>
                <Text style={styles.modalName}>Sighting Reported</Text>
                {selectedSighting.image_url && (
                  <Image
                    style={styles.image}
                    source={{ uri: selectedSighting.image_url }}
                  />
                )}
                <Text style={styles.modalDescription}>
                  {selectedSighting.sighting_description}
                </Text>
                {selectedSighting.location_description && (
                  <Text style={styles.modalDescription}>
                    Location: {selectedSighting.location_description}
                  </Text>
                )}
                <Text style={styles.modalType}>🟢 Sighting</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topButtons: {
    position: "absolute",
    top: 50,
    left: 16,
    gap: 8,
  },
  iconBtn: {
    backgroundColor: theme.colors.secondary + "CC",
    borderRadius: 999,
    width: 55,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  plusBtn: {
    position: "absolute",
    bottom: 40,
    right: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  plusText: {
    color: "white",
    fontSize: 32,
    lineHeight: 36,
  },
  menuContainer: {
    position: "absolute",
    bottom: 110,
    right: 16,
    gap: 8,
  },
  menuBtn: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end", // pushes card to bottom
    backgroundColor: "rgba(0,0,0,0.3)", // semi transparent backdrop
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: 40,
    gap: theme.spacing.md,
    minHeight: "35%", // takes up bottom third of screen
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.secondary,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: theme.spacing.sm,
  },
  modalName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  modalDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  modalType: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  modalCloseBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  modalCloseBtnText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
  image: {
    height: 200,
    width: "80%",
    alignSelf: "center",
    borderRadius: theme.borderRadius.md,
    resizeMode: "cover",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
});
