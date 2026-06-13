
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

import { iniciarSesion } from "../../services/authService";
import { guardarSesion } from "../../services/sessionService";
import { initializeDatabase } from "../../services/sqliteService";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Campo requerido",
        "Por favor ingresa tu correo electrónico."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Correo inválido",
        "Ingresa un correo electrónico válido."
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert(
        "Campo requerido",
        "Por favor ingresa tu contraseña."
      );
      return;
    }

    try {
      setLoading(true);

      await initializeDatabase();

      const usuario = await iniciarSesion(
        email.trim(),
        password.trim()
      );

      if (!usuario) {
        Alert.alert(
          "Error",
          "Correo o contraseña incorrectos"
        );
        return;
      }

      await guardarSesion(
        (usuario as any).id_usuario
      );

      router.replace("/permissions/location" as any);

    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images_estilo/logo.png")}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>

          {/* Inputs */}
          <View style={styles.form}>
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Botón */}
          <TouchableOpacity
            style={[
              styles.mainButton,
              loading && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.mainButtonText}>
              {loading
                ? "Ingresando..."
                : "Iniciar sesión"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              O inicia sesión con
            </Text>
            <View style={styles.line} />
          </View>

          {/* Redes (decorativas) */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text
                style={[
                  styles.socialLetter,
                  { color: "#DB4437" },
                ]}
              >
                G
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn}>
              <Text
                style={[
                  styles.socialLetter,
                  { color: "#1877F2" },
                ]}
              >
                f
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialLetter}>
                🍎
              </Text>
            </TouchableOpacity>
          </View>

          {/* Registro */}
          <TouchableOpacity
            onPress={() =>
              router.push(
                "/auth/register" as any
              )
            }
            style={styles.registerWrap}
          >
            <Text style={styles.registerText}>
              ¿No tienes una cuenta?{" "}
              <Text style={styles.registerLink}>
                Regístrate
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  logoWrap: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoImg: {
    width: 220,
    height: 100,
  },

  form: {
    gap: 14,
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: "#11181C",
  },

  mainButton: {
    backgroundColor: "#EF5548",
    paddingVertical: 17,
    borderRadius: 50,
    alignItems: "center",

    shadowColor: "#EF5548",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,

    elevation: 8,
    marginBottom: 26,
  },

  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  dividerText: {
    marginHorizontal: 10,
    color: "#6B7280",
    fontSize: 13,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 30,
  },

  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  socialLetter: {
    fontSize: 22,
    fontWeight: "800",
  },

  registerWrap: {
    alignItems: "center",
  },

  registerText: {
    color: "#6B7280",
    fontSize: 14,
  },

  registerLink: {
    color: "#EF5548",
    fontWeight: "700",
  },
});

