import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

export default function ProfileNotifications() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.emptyBox}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔔</Text>
          </View>
          <Text style={styles.emptyTitle}>Todo al día</Text>
          <Text style={styles.emptyText}>
            No tienes notificaciones por revisar.{"\n"}
            Cuando haya novedades sobre tus pedidos o restaurantes favoritos, aparecerán aquí.
          </Text>
        </View>
      </View>
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

  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyBox: { alignItems: "center" },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF1EF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  iconEmoji: { fontSize: 44 },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#11181C",
    marginBottom: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    lineHeight: 22,
    fontSize: 14,
  },
});