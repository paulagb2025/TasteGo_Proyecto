import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";

export default function MapScreen() {
  const { lat, lng, nombre, direccion } = useLocalSearchParams();

  const latitude = lat ? Number(lat) : 9.3047;
  const longitude = lng ? Number(lng) : -75.3978;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={nombre ? String(nombre) : "Restaurante"}
          description={direccion ? String(direccion) : ""}
        />
      </MapView>
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