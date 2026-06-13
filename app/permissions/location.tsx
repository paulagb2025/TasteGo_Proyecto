import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  solicitarPermisosUbicacion,
} from "../../services/locationService";

export default function LocationPermission() {
  const router = useRouter();

  const handlePermission = async () => {
    const granted =
      await solicitarPermisosUbicacion();

    if (granted) {
      router.replace("/(tabs)" as any);
    } else {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos tu ubicación para mostrar restaurantes cercanos."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Permiso de ubicación
      </Text>

      <Text style={styles.description}>
        TasteGo necesita acceder a tu ubicación para recomendar restaurantes cercanos.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePermission}
      >
        <Text style={styles.buttonText}>
          Permitir ubicación
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#EF5548",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});