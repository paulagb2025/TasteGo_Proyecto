import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "usuario_logueado";

export async function guardarSesion(
  idUsuario: number
) {
  await AsyncStorage.setItem(
    KEY,
    idUsuario.toString()
  );
}

export async function obtenerSesion() {
  const value = await AsyncStorage.getItem(KEY);

  if (!value) {
    return null;
  }

  return Number(value);
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(KEY);
}