import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

// hardcoded sightings
const FAKE_SIGHTINGS = [
  {
    id: "1",
    coordinate: { latitude: 51.508, longitude: -0.129 },
    title: "Luna",
    description: "Black cat spotted near park",
    type: "lost",
  },
  {
    id: "2",
    coordinate: { latitude: 51.5065, longitude: -0.1265 },
    title: "Sighting reported",
    description: "Possible match for Buddy",
    type: "sighting",
  },
  {
    id: "3",
    coordinate: { latitude: 51.509, longitude: -0.131 },
    title: "Buddy",
    description: "Golden retriever, missing 1 day",
    type: "lost",
  },
];

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 51.5074, // default to London while loading
    longitude: -0.1278,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    async function getLocation() {
      // ask user for permission first
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

  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      region={region}
      showsUserLocation={true} // show blue dot
      showsMyLocationButton={true} // show recentre button
    >
      {FAKE_SIGHTINGS.map((sighting) => (
        <Marker
          key={sighting.id}
          coordinate={sighting.coordinate}
          title={sighting.title}
          description={sighting.description}
          pinColor={sighting.type === "lost" ? "red" : "green"}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
