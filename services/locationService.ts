import * as Location from "expo-location";

export async function solicitarPermisosUbicacion() {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  return status === "granted";
}

export async function obtenerUbicacionActual() {
  const location =
    await Location.getCurrentPositionAsync({});

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}