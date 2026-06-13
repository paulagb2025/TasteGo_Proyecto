import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from "react-native";

import { obtenerPlatosPorRestaurante } from "../../services/platoService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { obtenerRestaurantePorId, agregarFavorito, agregarDetallePedido } from "../../services/restaurantService";
import { obtenerSesion } from "../../services/sessionService";

// ── Imágenes locales de restaurantes ──
const imagenesRestaurante: Record<number, any> = {
  1: require("../../assets/images_restaurantesyplatos/r1.png"),
  2: require("../../assets/images_restaurantesyplatos/r2.png"),
  3: require("../../assets/images_restaurantesyplatos/r3.png"),
  4: require("../../assets/images_restaurantesyplatos/r4.png"),
  5: require("../../assets/images_restaurantesyplatos/r5.png"),
};

// ── Imágenes locales de platos ──
const imagenesPlatoPorRestaurante: Record<number, any[]> = {
  1: [
    require("../../assets/images_restaurantesyplatos/r1_Plato1.png"),
    require("../../assets/images_restaurantesyplatos/r1_Plato2.png"),
  ],
  2: [
    require("../../assets/images_restaurantesyplatos/r2_Plato1.png"),
    require("../../assets/images_restaurantesyplatos/r2_Plato2.png"),
  ],
  3: [
    require("../../assets/images_restaurantesyplatos/r3_Plato1.png"),
    require("../../assets/images_restaurantesyplatos/r3_Plato2.png"),
  ],
  4: [
    require("../../assets/images_restaurantesyplatos/r4_Plato1.png"),
    require("../../assets/images_restaurantesyplatos/r4_Plato2.png"),
  ],
  5: [
    require("../../assets/images_restaurantesyplatos/r5_Plato1.png"),
    require("../../assets/images_restaurantesyplatos/r5_Plato2.png"),
  ],
};

// ── Alert personalizado ──
type AlertConfig = { visible: boolean; emoji: string; title: string; message: string; onConfirm?: () => void; confirmText?: string; cancelText?: string };
const defaultAlert: AlertConfig = { visible: false, emoji: "", title: "", message: "" };

export default function RestaurantDetails() {
  const { id, desde } = useLocalSearchParams();
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [platos, setPlatos] = useState<any[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [seleccionados, setSeleccionados] = useState<{ [id: number]: number }>({});
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(defaultAlert);

  const showAlert = (emoji: string, title: string, message: string, onConfirm?: () => void, confirmText = "Entendido", cancelText?: string) => {
    setAlertConfig({ visible: true, emoji, title, message, onConfirm, confirmText, cancelText });
  };

  const hideAlert = () => setAlertConfig(defaultAlert);

  useEffect(() => {
    cargarRestaurante();
  }, []);

  const cargarRestaurante = async () => {
    const data = await obtenerRestaurantePorId(Number(id));
    setRestaurant(data);
    const platosData = await obtenerPlatosPorRestaurante(Number(id));
    setPlatos(platosData as any[]);
  };

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const handleFavorito = async () => {
    try {
      const idUsuario = await obtenerSesion();
      if (!idUsuario) {
        showAlert("🔐", "Sesión requerida", "Debes iniciar sesión para guardar favoritos.");
        return;
      }
      await agregarFavorito(idUsuario, restaurant.id_restaurante);
      showAlert("❤️", "¡Favorito agregado!", `${restaurant.nombre} fue añadido a tu lista de favoritos.`);
    } catch (error) {
      showAlert("⚠️", "Ya está en favoritos", "Este restaurante ya hace parte de tu lista de favoritos.");
    }
  };

  const toggleSeleccion = (idPlato: number) => {
    setSeleccionados((prev) => {
      if (prev[idPlato] !== undefined) {
        const nuevo = { ...prev };
        delete nuevo[idPlato];
        return nuevo;
      }
      return { ...prev, [idPlato]: 1 };
    });
  };

  const aumentarCantidad = (idPlato: number) => {
    setSeleccionados((prev) => ({
      ...prev,
      [idPlato]: (prev[idPlato] || 1) + 1,
    }));
  };

  const disminuirCantidad = (idPlato: number) => {
    setSeleccionados((prev) => {
      const actual = prev[idPlato] || 1;
      if (actual <= 1) {
        const nuevo = { ...prev };
        delete nuevo[idPlato];
        return nuevo;
      }
      return { ...prev, [idPlato]: actual - 1 };
    });
  };

  const totalPedido = Object.keys(seleccionados).reduce((acc, idPlato) => {
    const plato = platos.find((p) => p.id_plato === Number(idPlato));
    if (plato) return acc + plato.precio * seleccionados[Number(idPlato)];
    return acc;
  }, 0);

  const handlePedido = async () => {
    if (!modoSeleccion) {
      setModoSeleccion(true);
      return;
    }

    const platosSeleccionados = Object.keys(seleccionados);

    if (platosSeleccionados.length === 0) {
      showAlert("🛒", "Sin platos", "Selecciona al menos un plato para continuar con tu pedido.");
      return;
    }

    try {
      const idUsuario = await obtenerSesion();
      if (!idUsuario) {
        showAlert("🔐", "Sesión requerida", "Debes iniciar sesión para realizar un pedido.");
        return;
      }

      const { getDatabase } = await import("../../services/sqliteService");
      const db = await getDatabase();
      const result = await db.runAsync(
        `INSERT INTO pedidos (id_usuario, id_restaurante, estado) VALUES (?, ?, ?)`,
        [idUsuario, restaurant.id_restaurante, "Pendiente"]
      );
      const idPedido = result.lastInsertRowId;

      for (const idPlato of platosSeleccionados) {
        const plato = platos.find((p) => p.id_plato === Number(idPlato));
        const cantidad = seleccionados[Number(idPlato)];
        if (plato) {
          await agregarDetallePedido(idPedido, plato.id_plato, cantidad, plato.precio);
        }
      }

      showAlert("✅", "¡Pedido realizado!", "Tu pedido fue registrado correctamente. Pronto estará listo.", () => {
        setModoSeleccion(false);
        setSeleccionados({});
      });
    } catch (error) {
      console.log(error);
    }
  };

  const imagenRestaurante = imagenesRestaurante[restaurant.id_restaurante];
  const imagenesPlatos = imagenesPlatoPorRestaurante[restaurant.id_restaurante] ?? [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Alert personalizado ── */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertEmoji}>{alertConfig.emoji}</Text>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View style={styles.alertButtons}>
              {alertConfig.cancelText && (
                <TouchableOpacity style={styles.alertBtnCancel} onPress={hideAlert}>
                  <Text style={styles.alertBtnCancelText}>{alertConfig.cancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.alertBtnConfirm}
                onPress={() => { hideAlert(); alertConfig.onConfirm?.(); }}
              >
                <Text style={styles.alertBtnConfirmText}>{alertConfig.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hero image */}
      <View style={styles.imageContainer}>
        {imagenRestaurante ? (
          <Image source={imagenRestaurante} style={styles.imagenHero} resizeMode="cover" />
        ) : (
          <View style={styles.imagenHeroPlaceholder} />
        )}
        <View style={styles.imageOverlay} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{restaurant.nombre}</Text>
            <Text style={styles.category}>{restaurant.tipo_comida}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.rating}>⭐ {restaurant.calificacion}</Text>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>📍 1.2 km</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>🕒 30 min</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>👥 5 reseñas</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Descripción</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{restaurant.descripcion}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>📍</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>DIRECCIÓN</Text>
            <Text style={styles.infoValue}>{restaurant.direccion}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>📞</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>TELÉFONO</Text>
            <Text style={styles.infoValue}>{restaurant.telefono}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>🕒</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>HORARIO</Text>
            <Text style={styles.infoValue}>{restaurant.horario}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Menú destacado</Text>

        {platos.map((plato, index) => {
          const estaSeleccionado = seleccionados[plato.id_plato] !== undefined;
          const cantidad = seleccionados[plato.id_plato] || 0;
          const imagenPlato = imagenesPlatos[index];

          return (
            <View key={plato.id_plato} style={styles.platoCard}>
              <View style={styles.platoImage}>
                {imagenPlato ? (
                  <Image source={imagenPlato} style={styles.platoImageReal} resizeMode="cover" />
                ) : (
                  <Text style={styles.platoImageText}>🍽️</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.platoNombre}>{plato.nombre}</Text>
                <Text style={styles.platoDescripcion}>{plato.descripcion}</Text>
                <Text style={styles.platoPrecio}>${plato.precio}</Text>

                {plato.modelo_3d_url ? (
                  <TouchableOpacity
                    style={styles.arButton}
                    onPress={() =>
                      router.push({
                        pathname: "/restaurant/ar-guide",
                        params: {
                          modelUrl: plato.modelo_3d_url,
                          nombrePlato: plato.nombre,
                          descripcion: plato.descripcion,
                          precio: plato.precio,
                        },
                      } as any)
                    }
                  >
                    <Text style={styles.arButtonText}>✦ Ver en 3D-RA</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {modoSeleccion && (
                <View style={styles.seleccionContainer}>
                  <TouchableOpacity
                    style={[styles.checkbox, estaSeleccionado && styles.checkboxActivo]}
                    onPress={() => toggleSeleccion(plato.id_plato)}
                  >
                    {estaSeleccionado && <Text style={styles.checkboxCheck}>✓</Text>}
                  </TouchableOpacity>

                  {estaSeleccionado && (
                    <View style={styles.contador}>
                      <TouchableOpacity onPress={() => disminuirCantidad(plato.id_plato)}>
                        <Text style={styles.botonCantidad}>➖</Text>
                      </TouchableOpacity>
                      <Text style={styles.cantidad}>{cantidad}</Text>
                      <TouchableOpacity onPress={() => aumentarCantidad(plato.id_plato)}>
                        <Text style={styles.botonCantidad}>➕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {modoSeleccion && Object.keys(seleccionados).length > 0 && (
          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalPlatos}>
                {Object.keys(seleccionados).length}{" "}
                {Object.keys(seleccionados).length === 1 ? "plato" : "platos"}
              </Text>
            </View>
            <View style={styles.totalRight}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValor}>
                ${totalPedido.toLocaleString("es-CO")}
              </Text>
            </View>
          </View>
        )}

        {desde !== "favoritos" && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorito}
            activeOpacity={0.85}
          >
            <Text style={styles.favoriteText}>❤️  Agregar a favoritos</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.locationButton}
          onPress={() =>
            router.push({
              pathname: "/map",
              params: {
                lat: restaurant.latitud,
                lng: restaurant.longitud,
                nombre: restaurant.nombre,
                direccion: restaurant.direccion,
              },
            } as any)
          }
          activeOpacity={0.85}
        >
          <Text style={styles.locationButtonText}>🗺️  Ver en el mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={handlePedido}
          activeOpacity={0.85}
        >
          <Text style={styles.mapButtonText}>
            {modoSeleccion ? "✅  Confirmar pedido" : "🛒  Realizar pedido"}
          </Text>
        </TouchableOpacity>

        {modoSeleccion && (
          <TouchableOpacity
            style={styles.cancelarButton}
            onPress={() => {
              setModoSeleccion(false);
              setSeleccionados({});
            }}
          >
            <Text style={styles.cancelarText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  imageContainer: {
    height: 260,
    backgroundColor: "#11181C",
    position: "relative",
    overflow: "hidden",
  },

  imagenHero: {
    width: "100%",
    height: 260,
  },

  imagenHeroPlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: "#11181C",
  },

  imageOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  imageText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    zIndex: 1,
  },

  content: {
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#11181C",
    letterSpacing: -0.5,
    lineHeight: 32,
  },

  category: {
    marginTop: 5,
    color: "#888888",
    fontSize: 13,
    fontWeight: "500",
  },

  ratingBox: {
    backgroundColor: "#FFF1EF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
    marginTop: 2,
  },

  rating: {
    color: "#F4623A",
    fontWeight: "700",
    fontSize: 13,
  },

  quickStats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  statPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  statText: {
    fontSize: 12,
    color: "#555555",
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#11181C",
  },

  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#F4623A",
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.05)",
    borderRightColor: "rgba(0,0,0,0.05)",
    borderBottomColor: "rgba(0,0,0,0.05)",
    shadowColor: "#F4623A",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  description: {
    color: "#555555",
    lineHeight: 22,
    fontSize: 13,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFF1EF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  infoIcon: { fontSize: 16 },

  infoLabel: {
    fontWeight: "700",
    fontSize: 10,
    color: "#F4623A",
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  infoValue: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "500",
  },

  platoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.05)",
  },

  platoImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#FFF1EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  platoImageReal: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },

  platoImageText: { fontSize: 24 },

  platoNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: "#11181C",
  },

  platoDescripcion: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  platoPrecio: {
    color: "#F4623A",
    fontWeight: "700",
    marginTop: 5,
  },

  arButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#F4623A",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },

  arButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  seleccionContainer: {
    alignItems: "center",
    gap: 6,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxActivo: {
    backgroundColor: "#F4623A",
    borderColor: "#F4623A",
  },

  checkboxCheck: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },

  contador: {
    flexDirection: "row",
    alignItems: "center",
  },

  botonCantidad: { fontSize: 16 },

  cantidad: {
    marginHorizontal: 8,
    fontSize: 15,
    fontWeight: "700",
  },

  totalBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F4623A",
    shadowColor: "#F4623A",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  totalPlatos: {
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },

  totalRight: { alignItems: "flex-end" },

  totalLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#F4623A",
    letterSpacing: 1,
    marginBottom: 2,
  },

  totalValor: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F4623A",
  },

  // ── Botones principales ──
  favoriteButton: {
    backgroundColor: "#F4623A",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    shadowColor: "#F4623A",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  favoriteText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  locationButton: {
    borderWidth: 2,
    borderColor: "#F4623A",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },

  locationButtonText: {
    color: "#F4623A",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  mapButton: {
    backgroundColor: "#D93020",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
    shadowColor: "#D93020",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  mapButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  cancelarButton: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },

  cancelarText: {
    color: "#AAAAAA",
    fontSize: 14,
  },

  // ── Alert personalizado ──
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  alertBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  alertEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#11181C",
    marginBottom: 8,
    textAlign: "center",
  },

  alertMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },

  alertButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  alertBtnCancel: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },

  alertBtnCancelText: {
    color: "#888888",
    fontWeight: "600",
    fontSize: 14,
  },

  alertBtnConfirm: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F4623A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F4623A",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  alertBtnConfirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});