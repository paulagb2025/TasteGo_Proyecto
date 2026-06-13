import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  notificaciones: "cfg_notificaciones",
  notifPedidos: "cfg_notif_pedidos",
  notifPromos: "cfg_notif_promos",
};

export default function ProfileSettings() {
  const router = useRouter();

  const [notificaciones, setNotificaciones] = useState(true);
  const [notifPedidos, setNotifPedidos] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);
  const [ubicacionAuto, setUbicacionAuto] = useState(true);

  // ── Cargar valores guardados al entrar ──
  useEffect(() => {
    const cargar = async () => {
      try {
        const [n, p, pr] = await Promise.all([
          AsyncStorage.getItem(KEYS.notificaciones),
          AsyncStorage.getItem(KEYS.notifPedidos),
          AsyncStorage.getItem(KEYS.notifPromos),
        ]);
        if (n !== null) setNotificaciones(n === "true");
        if (p !== null) setNotifPedidos(p === "true");
        if (pr !== null) setNotifPromos(pr === "true");
      } catch (e) {
        console.log(e);
      }
    };
    cargar();
  }, []);

  // ── Guardar al cambiar ──
  const cambiarNotificaciones = async (val: boolean) => {
    setNotificaciones(val);
    await AsyncStorage.setItem(KEYS.notificaciones, String(val));
  };

  const cambiarNotifPedidos = async (val: boolean) => {
    setNotifPedidos(val);
    await AsyncStorage.setItem(KEYS.notifPedidos, String(val));
  };

  const cambiarNotifPromos = async (val: boolean) => {
    setNotifPromos(val);
    await AsyncStorage.setItem(KEYS.notifPromos, String(val));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Notificaciones ── */}
        <Text style={styles.sectionLabel}>NOTIFICACIONES</Text>

        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.rowEmoji}>🔔</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Notificaciones</Text>
                <Text style={styles.rowSub}>Activar todas las alertas</Text>
              </View>
            </View>
            <Switch
              value={notificaciones}
              onValueChange={cambiarNotificaciones}
              trackColor={{ false: "#DDD", true: "#EF5548" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.rowEmoji}>📦</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Estado de pedidos</Text>
                <Text style={styles.rowSub}>Alertas sobre tus órdenes</Text>
              </View>
            </View>
            <Switch
              value={notifPedidos}
              onValueChange={cambiarNotifPedidos}
              trackColor={{ false: "#DDD", true: "#EF5548" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.rowEmoji}>🎁</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Promociones</Text>
                <Text style={styles.rowSub}>Ofertas y descuentos especiales</Text>
              </View>
            </View>
            <Switch
              value={notifPromos}
              onValueChange={cambiarNotifPromos}
              trackColor={{ false: "#DDD", true: "#EF5548" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* ── Idioma y Región ── */}
        <Text style={styles.sectionLabel}>IDIOMA Y REGIÓN</Text>

        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.rowEmoji}>🌐</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Idioma</Text>
                <Text style={styles.rowSub}>Español (Colombia)</Text>
              </View>
            </View>
            <Text style={styles.rowValue}>ES 🇨🇴</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.rowEmoji}>💵</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Moneda</Text>
                <Text style={styles.rowSub}>Peso colombiano</Text>
              </View>
            </View>
            <Text style={styles.rowValue}>COP</Text>
          </View>
        </View>

        {/* ── Apariencia ── */}
        <Text style={styles.sectionLabel}>APARIENCIA</Text>

        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: "#FFF8F0" }]}>
                <Text style={styles.rowEmoji}>☀️</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Modo claro</Text>
                <Text style={styles.rowSub}>Predeterminado</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Acerca de ── */}
        <Text style={styles.sectionLabel}>ACERCA DE</Text>

        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: "#FFF1EF" }]}>
                <Text style={styles.rowEmoji}>📱</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Versión de la app</Text>
                <Text style={styles.rowSub}>TasteGo</Text>
              </View>
            </View>
            <Text style={styles.rowValue}>v1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EF5548" },

  header: {
    backgroundColor: "#EF5548",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 20,
    gap: 10,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: { fontSize: 26, color: "#FFF", lineHeight: 30, fontWeight: "300" },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: "#FFF" },

  container: { flex: 1, backgroundColor: "#F7F8FA" },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#AAA",
    letterSpacing: 1.2,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },

  group: {
    marginHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

  rowEmoji: { fontSize: 18 },

  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
  },

  rowSub: {
    fontSize: 11,
    color: "#AAA",
    marginTop: 2,
  },

  rowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF5548",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});