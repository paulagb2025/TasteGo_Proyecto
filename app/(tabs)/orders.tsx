import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Modal,
  ScrollView,
  Image,
} from "react-native";

import {useFocusEffect} from "expo-router"
import { obtenerPedidos } from "../../services/restaurantService";
import { obtenerSesion } from "../../services/sessionService";
import { getDatabase } from "../../services/sqliteService";

const imagenesRestaurante: Record<number, any> = {
  1: require("../../assets/images_restaurantesyplatos/r1.png"),
  2: require("../../assets/images_restaurantesyplatos/r2.png"),
  3: require("../../assets/images_restaurantesyplatos/r3.png"),
  4: require("../../assets/images_restaurantesyplatos/r4.png"),
  5: require("../../assets/images_restaurantesyplatos/r5.png"),
};

// ── Alert personalizado ──
type AlertConfig = { visible: boolean; emoji: string; title: string; message: string; onConfirm?: () => void; confirmText?: string; cancelText?: string };
const defaultAlert: AlertConfig = { visible: false, emoji: "", title: "", message: "" };

export default function OrdersScreen() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pedidoDetalle, setPedidoDetalle] = useState<any | null>(null);
  const [pedidoNumero, setPedidoNumero] = useState<number>(1);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(defaultAlert);
  const modalTranslateY = useRef(new Animated.Value(0)).current;

  const showAlert = (emoji: string, title: string, message: string, onConfirm?: () => void, confirmText = "Entendido", cancelText?: string) => {
    setAlertConfig({ visible: true, emoji, title, message, onConfirm, confirmText, cancelText });
  };

  const hideAlert = () => setAlertConfig(defaultAlert);

  const abrirModal = () => {
    modalTranslateY.setValue(600);
    setModalVisible(true);
    Animated.spring(modalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const cerrarModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: 800,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setTimeout(() => modalTranslateY.setValue(0), 50);
    });
  };

  const handlePanModal = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) modalTranslateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60 || g.vy > 0.5) {
          cerrarModal();
        } else {
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [])
  );

  const cargarPedidos = async () => {
    const idUsuario = await obtenerSesion();

    if (!idUsuario) {
      return;
    }

    const data = await obtenerPedidos(idUsuario) as any[];

    const total = data.length;
    const conNumero = data.map((p, i) => ({ ...p, numero: total - i }));
    setPedidos(conNumero);
  };

  const verDetalle = async (item: any) => {
    setPedidoDetalle(item);
    setPedidoNumero(item.numero);
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync(
        `SELECT dp.cantidad, dp.precio_unitario, p.nombre
         FROM detalle_pedido dp
         INNER JOIN platos p ON p.id_plato = dp.id_plato
         WHERE dp.id_pedido = ?`,
        [item.id_pedido]
      );
      setDetalles(rows as any[]);
    } catch (e) {
      setDetalles([]);
    }
    abrirModal();
  };

  const eliminarPedido = (idPedido: number) => {
    showAlert(
      "🗑️",
      "Eliminar pedido",
      "¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.",
      async () => {
        try {
          const db = await getDatabase();
          await db.runAsync(
            `DELETE FROM pedidos WHERE id_pedido = ?`,
            [idPedido]
          );
          setPedidos((prev) => {
            const filtrado = prev.filter((p) => p.id_pedido !== idPedido);
            const total = filtrado.length;
            return filtrado.map((p, i) => ({ ...p, numero: total - i }));
          });
        } catch (e) {
          console.log(e);
        }
      },
      "Eliminar",
      "Cancelar"
    );
  };

  const SwipeableCard = ({ item }: { item: any }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
        onPanResponderMove: (_, g) => {
          translateX.setValue(g.dx);
        },
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > 80) {
            Animated.timing(translateX, {
              toValue: g.dx > 0 ? 80 : -80,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              eliminarPedido(item.id_pedido);
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    return (
      <View style={styles.swipeWrapper}>
        {/* Delete background — derecha */}
        <View style={[styles.deleteBackground, { right: 0 }]}>
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteLabel}>Eliminar</Text>
        </View>
        {/* Delete background — izquierda */}
        <View style={[styles.deleteBackground, { left: 0, right: undefined }]}>
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteLabel}>Eliminar</Text>
        </View>

        <Animated.View
          style={{ transform: [{ translateX }] }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => verDetalle(item)}
          >
            <View style={styles.card}>
              <View style={styles.cardAccent} />

              <View style={styles.cardInner}>
                {/* Top row */}
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    {imagenesRestaurante[item.id_restaurante] ? (
                      <Image
                        source={imagenesRestaurante[item.id_restaurante]}
                        style={styles.iconImagen}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.icon}>🍽️</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.nombre}</Text>
                    <Text style={styles.type}>{item.tipo_comida}</Text>
                  </View>

                  <Text style={styles.rating}>⭐ {item.calificacion}</Text>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Bottom row */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <Text style={styles.footerLabel}>PEDIDO</Text>
                    <Text style={styles.footerValue}>#{item.numero}</Text>
                  </View>

                  <View style={styles.footerMiddle}>
                    <Text style={styles.footerLabel}>FECHA</Text>
                    <Text style={styles.footerValue}>
                      {item.fecha_pedido
                        ? new Date(item.fecha_pedido).toLocaleDateString(
                            "es-CO",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </Text>
                  </View>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.estado}</Text>
                  </View>
                </View>

                <Text style={styles.tapHint}>Toca para ver detalles →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderItem = ({ item }: any) => <SwipeableCard item={item} />;

  // Total del modal
  const totalModal = detalles.reduce(
    (acc, d) => acc + d.precio_unitario * d.cantidad,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.banner}>
          <View style={styles.bannerDecoCircle1} />
          <View style={styles.bannerDecoCircle2} />

          <Text style={styles.bannerTitle}>📦 Mis pedidos</Text>
          <Text style={styles.bannerText}>
            Consulta el estado de tus órdenes{"\n"}y revisa tu historial de compras.
          </Text>

          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>
              {pedidos.length} {pedidos.length === 1 ? "orden" : "órdenes"}
            </Text>
          </View>
        </View>

        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id_pedido.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛵</Text>
              <Text style={styles.emptyTitle}>No tienes pedidos</Text>
              <Text style={styles.emptyText}>
                Realiza tu primer pedido desde{"\n"}alguno de los restaurantes.
              </Text>
            </View>
          }
        />
      </View>

      {/* Modal de detalle */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBox, { transform: [{ translateY: modalTranslateY }] }]}>
            {/* Zona de arrastre — área amplia para cerrar deslizando */}
            <View style={styles.modalDragArea} {...handlePanModal.panHandlers}>
              <View style={styles.modalHandle} />
            </View>

            <Text style={styles.modalTitle}>
              Detalle del pedido #{pedidoNumero}
            </Text>
            <View style={styles.modalRestauranteRow}>
              {pedidoDetalle && imagenesRestaurante[pedidoDetalle.id_restaurante] ? (
                <Image
                  source={imagenesRestaurante[pedidoDetalle.id_restaurante]}
                  style={styles.modalRestauranteImg}
                  resizeMode="cover"
                />
              ) : (
                <Text>🍽️ </Text>
              )}
              <Text style={styles.modalRestaurante}>
                {pedidoDetalle?.nombre}
              </Text>
            </View>

            <View style={styles.modalDivider} />

            {/* Platos */}
            <ScrollView
              style={{ maxHeight: 280 }}
              showsVerticalScrollIndicator={false}
            >
              {detalles.length === 0 ? (
                <Text style={styles.modalEmpty}>
                  Sin detalles registrados.
                </Text>
              ) : (
                detalles.map((d, i) => (
                  <View key={i} style={styles.detalleRow}>
                    <View style={styles.detalleQtyBox}>
                      <Text style={styles.detalleQty}>x{d.cantidad}</Text>
                    </View>
                    <Text style={styles.detalleNombre}>{d.nombre}</Text>
                    <Text style={styles.detallePrecio}>
                      ${(d.precio_unitario * d.cantidad).toLocaleString("es-CO")}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Total */}
            {detalles.length > 0 && (
              <View style={styles.modalTotalBox}>
                <Text style={styles.modalTotalLabel}>TOTAL DEL PEDIDO</Text>
                <Text style={styles.modalTotalValue}>
                  ${totalModal.toLocaleString("es-CO")}
                </Text>
              </View>
            )}

            {/* Estado */}
            <View style={styles.modalEstadoRow}>
              <Text style={styles.modalEstadoLabel}>Estado</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pedidoDetalle?.estado}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={cerrarModal}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalDelete}
              onPress={() => {
                setModalVisible(false);
                setTimeout(
                  () => eliminarPedido(pedidoDetalle?.id_pedido),
                  300
                );
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalDeleteText}>🗑️ Eliminar pedido</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

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
    padding: 17,
    paddingTop: 55,
  },

  banner: {
    backgroundColor: "#EF5548",
    borderRadius: 22,
    padding: 20,
    paddingTop: 22,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },

  bannerDecoCircle1: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -30,
    right: -30,
  },

  bannerDecoCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: 60,
    right: 50,
  },

  bannerTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },

  bannerTagText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  bannerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },

  bannerText: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    lineHeight: 20,
  },

  bannerBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  bannerBadgeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },

  /* ── Swipe wrapper ── */
  swipeWrapper: {
    marginBottom: 14,
    borderRadius: 18,
    overflow: "hidden",
  },

  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },

  deleteIcon: {
    fontSize: 22,
  },

  deleteLabel: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  /* ── Card ── */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#EF5548",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardAccent: {
    width: 5,
    backgroundColor: "#EF5548",
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  cardInner: {
    flex: 1,
    padding: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: "#FFF1EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  iconImagen: {
    width: 55,
    height: 55,
  },

  icon: {
    fontSize: 24,
  },

  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#11181C",
  },

  type: {
    color: "#777",
    marginTop: 2,
    fontSize: 12,
  },

  rating: {
    color: "#EF5548",
    fontWeight: "700",
    alignSelf: "flex-start",
  },

  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 12,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  footerLeft: {
    marginRight: 4,
  },

  footerMiddle: {
    flex: 1,
  },

  footerLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#AAA",
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  footerValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1EF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  badgeText: {
    color: "#EF5548",
    fontWeight: "700",
    fontSize: 12,
  },

  tapHint: {
    fontSize: 10,
    color: "#CCC",
    marginTop: 10,
    textAlign: "right",
  },

  /* ── Empty ── */
  empty: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 60,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
    color: "#11181C",
  },

  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    lineHeight: 22,
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },

  modalDragArea: {
    width: "100%",
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "center",
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#11181C",
  },

  modalRestauranteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
    gap: 8,
  },

  modalRestauranteImg: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },

  modalRestaurante: {
    fontSize: 14,
    color: "#777",
  },

  modalDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginVertical: 14,
  },

  modalEmpty: {
    textAlign: "center",
    color: "#AAA",
    paddingVertical: 20,
  },

  detalleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },

  detalleQtyBox: {
    backgroundColor: "#FFF1EF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  detalleQty: {
    color: "#EF5548",
    fontWeight: "700",
    fontSize: 13,
  },

  detalleNombre: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  detallePrecio: {
    fontSize: 14,
    fontWeight: "700",
    color: "#11181C",
  },

  modalTotalBox: {
    backgroundColor: "#FFF1EF",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#EF5548",
    letterSpacing: 0.8,
  },

  modalTotalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#EF5548",
  },

  modalEstadoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },

  modalEstadoLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  modalClose: {
    backgroundColor: "#EF5548",
    borderRadius: 16,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  modalCloseText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  modalDelete: {
    alignItems: "center",
    marginTop: 12,
  },

  modalDeleteText: {
    color: "#FF3B30",
    fontWeight: "700",
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
    backgroundColor: "#EF5548",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF5548",
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