import { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import { initializeDatabase } from "../../services/sqliteService";
import { registrarUsuario } from "../../services/authService";
import { cargarRestaurantesIniciales } from "../../services/sqliteService";
import { obtenerUsuarioPorEmail } from "../../services/authService";

export default function Register() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    // ── Validaciones ──
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa tu nombre completo.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa tu correo electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Correo inválido", "Ingresa un correo electrónico válido.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa una contraseña.");
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Contraseña muy corta", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!telefono.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa tu número de teléfono.");
      return;
    }

    if (!fechaNacimiento.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa tu fecha de nacimiento.");
      return;
    }

    try {
      await initializeDatabase();
      await cargarRestaurantesIniciales();

      // Verificar si el correo ya existe
      const usuarioExistente = await obtenerUsuarioPorEmail(email.trim());
      if (usuarioExistente) {
        Alert.alert("Correo en uso", "Ya existe una cuenta con ese correo electrónico.");
        return;
      }

      await registrarUsuario(
        nombre.trim(),
        email.trim(),
        password.trim(),
        telefono.trim(),
        fechaNacimiento.trim()
      );

      Alert.alert(
        "Registro exitoso",
        "Cuenta creada correctamente. Ahora inicia sesión con tus datos.",
        [{ text: "Ir al login", onPress: () => router.replace("/auth/login" as any) }]
      );
    } catch (error: any) {
      console.log("ERROR SQLITE:", error);
      Alert.alert("Error", String(error));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Crear cuenta</Text>

      <Text style={styles.subtitle}>
        Completa tus datos para registrarte
      </Text>

      <TextInput
        placeholder="Nombre completo"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Teléfono"
        style={styles.input}
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />

      <TextInput
        placeholder="Fecha de nacimiento"
        style={styles.input}
        value={fechaNacimiento}
        onChangeText={setFechaNacimiento}
      />

      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
      >
        <Text style={styles.registerButtonText}>
          Registrarme
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text style={styles.loginText}>
          Ya tengo una cuenta
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#11181C",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 30,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  registerButton: {
    height: 55,
    backgroundColor: "#EF5548",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#EF5548",
    fontSize: 15,
  },
});