import { View, Text, TouchableOpacity } from "react-native";
import { initializeDatabase } from "../services/sqliteService";

export default function TestDbScreen() {
  const crearBD = async () => {
    try {
      await initializeDatabase();
      console.log("BD creada correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        onPress={crearBD}
        style={{
          backgroundColor: "red",
          padding: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>
          Crear Base de Datos
        </Text>
      </TouchableOpacity>
    </View>
  );
}