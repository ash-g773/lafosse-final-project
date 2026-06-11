import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      />
    </View>
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
