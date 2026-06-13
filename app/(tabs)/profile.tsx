import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

import { useState, useCallback } from "react";

import {
  obtenerSesion,
  cerrarSesion,
} from "../../services/sessionService";

import {
  obtenerUsuarioPorId,
} from "../../services/authService";

import { useRouter, useFocusEffect } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      cargarUsuario();
    }, [])
  );

  const cargarUsuario = async () => {
    try {
      const idUsuario = await obtenerSesion();
      if (!idUsuario) return;
      const data = await obtenerUsuarioPorId(idUsuario);
      setUsuario(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Hero banner ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroCircle3} />

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>
            {usuario?.nombre || "Usuario TasteGo"}
          </Text>

          <View style={styles.emailRow}>
            <Text style={styles.emailIcon}>✉️</Text>
            <Text style={styles.email}>
              {usuario?.email || "usuario@email.com"}
            </Text>
          </View>

          {usuario?.telefono ? (
            <View style={styles.emailRow}>
              <Text style={styles.emailIcon}>📱</Text>
              <Text style={styles.email}>{usuario.telefono}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Info flotante ── */}
        <View style={styles.infoSection}>
          {usuario?.fecha_nacimiento ? (
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoEmoji}>🎂</Text>
              </View>
              <View>
                <Text style={styles.infoLabel}>FECHA DE NACIMIENTO</Text>
                <Text style={styles.infoValue}>{usuario.fecha_nacimiento}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.infoCard}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoEmoji}>📍</Text>
            </View>
            <View>
              <Text style={styles.infoLabel}>UBICACIÓN</Text>
              <Text style={styles.infoValue}>Sincelejo, Sucre</Text>
            </View>
          </View>

          {usuario?.fecha_registro ? (
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoEmoji}>📅</Text>
              </View>
              <View>
                <Text style={styles.infoLabel}>MIEMBRO DESDE</Text>
                <Text style={styles.infoValue}>
                  {new Date(usuario.fecha_registro).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* ── Opciones ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MI CUENTA</Text>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push("/profile/notifications" as any)}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconBox, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.cardEmoji}>🔔</Text>
              </View>
              <Text style={styles.cardLabel}>Notificaciones</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push("/profile/settings" as any)}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconBox, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.cardEmoji}>⚙️</Text>
              </View>
              <Text style={styles.cardLabel}>Configuración</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Logout ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.85}
            onPress={async () => {
              await cerrarSesion();
              router.replace("/auth/login" as any);
            }}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>TasteGo v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EF5548",
  },

  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  heroBanner: {
    backgroundColor: "#EF5548",
    paddingTop: 30,
    paddingBottom: 36,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  heroCircle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -50,
    right: -40,
  },

  heroCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -30,
    left: -20,
  },

  heroCircle3: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: 20,
    left: 30,
  },

  avatarWrapper: {
    marginBottom: 14,
  },

  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 44,
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: -0.3,
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  emailIcon: {
    fontSize: 12,
  },

  email: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
  },

  infoSection: {
    marginTop: -18,
    marginHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 20,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF1EF",
    justifyContent: "center",
    alignItems: "center",
  },

  infoEmoji: {
    fontSize: 16,
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#AAA",
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#11181C",
  },

  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#AAA",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

  cardEmoji: {
    fontSize: 18,
  },

  cardLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#11181C",
  },

  cardArrow: {
    fontSize: 22,
    color: "#CCC",
    fontWeight: "300",
  },

  logoutButton: {
    backgroundColor: "#EF5548",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#EF5548",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  logoutText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  versionText: {
    textAlign: "center",
    color: "#CCC",
    fontSize: 11,
    marginBottom: 20,
  },

  option: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
  },
});