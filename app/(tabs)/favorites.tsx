import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";

import { useRouter, useFocusEffect } from "expo-router";
import { obtenerSesion } from "../../services/sessionService";
import { obtenerFavoritos, eliminarFavorito } from "../../services/restaurantService";

const imagenesRestaurante: Record<number, any> = {
  1: require("../../assets/images_restaurantesyplatos/r1.png"),
  2: require("../../assets/images_restaurantesyplatos/r2.png"),
  3: require("../../assets/images_restaurantesyplatos/r3.png"),
  4: require("../../assets/images_restaurantesyplatos/r4.png"),
  5: require("../../assets/images_restaurantesyplatos/r5.png"),
};

const ORANGE       = '#F97316';
const ORANGE_LIGHT = '#FFF7ED';
const ORANGE_MID   = '#FFEDD5';
const ORANGE_DARK  = '#C2540A';
const TEXT_DARK    = '#1C1917';
const TEXT_MID     = '#78716C';
const TEXT_LIGHT   = '#A8A29E';
const WHITE        = '#FFFFFF';
const BG           = '#F8F7F4';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => { cargarFavoritos(); }, [])
  );

  const cargarFavoritos = async () => {
    try {
      const idUsuario = await obtenerSesion();
      if (!idUsuario) return;
      const data = await obtenerFavoritos(idUsuario);
      setFavoritos(data as any[]);
    } catch (error) { console.log(error); }
  };

  const confirmarEliminar = (idRestaurante: number) => {
    setPendingId(idRestaurante);
    setConfirmModal(true);
  };

  const quitarFavorito = async (idRestaurante: number) => {
    try {
      const idUsuario = await obtenerSesion();
      if (!idUsuario) return;
      await eliminarFavorito(idUsuario, idRestaurante);
      setFavoritos((prev) => prev.filter((item) => item.id_restaurante !== idRestaurante));
    } catch (error) { console.log(error); }
  };

  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/restaurant/details",
          params: { id: item.id_restaurante, desde: "favoritos" },
        } as any)
      }
    >
      {/* Número de posición */}
      <View style={styles.indexBadge}>
        <Text style={styles.indexBadgeText}>{index + 1}</Text>
      </View>

      <View style={styles.imagePlaceholder}>
        {imagenesRestaurante[item.id_restaurante] ? (
          <Image
            source={imagenesRestaurante[item.id_restaurante]}
            style={styles.imagenReal}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.imageText}>FOTO</Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.nombre}
        </Text>
        <View style={styles.tagRow}>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{item.tipo_comida}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {item.calificacion}</Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            📍 {item.direccion}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => confirmarEliminar(item.id_restaurante)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.heartIcon}>❤️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id_restaurante.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Mis Favoritos</Text>
              </View>
              {favoritos.length > 0 && (
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{favoritos.length}</Text>
                </View>
              )}
            </View>

            {/* Banner */}
            <View style={styles.banner}>
              <View style={styles.bannerDecorCircle1} />
              <View style={styles.bannerDecorCircle2} />
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerEyebrow}>SOLO PARA TI</Text>
                <Text style={styles.bannerTitle}>Tus mejores{'\n'}experiencias 🍽️</Text>
                <Text style={styles.bannerText}>
                  Guarda y encuentra tus restaurantes favoritos al instante.
                </Text>
              </View>
            </View>

            {favoritos.length > 0 && (
              <Text style={styles.sectionLabel}>
                GUARDADOS — {favoritos.length}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyEmoji}>❤️</Text>
            </View>
            <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
            <Text style={styles.emptyText}>
              Explora restaurantes y guarda los que más te gusten para encontrarlos aquí fácilmente.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/' as any)}
            >
              <Text style={styles.emptyBtnText}>Explorar restaurantes</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal de confirmación */}
      <Modal transparent visible={confirmModal} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmModal(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.modalIconWrap}>
              <Text style={styles.modalIcon}>💔</Text>
            </View>
            <Text style={styles.modalTitle}>¿Quitar favorito?</Text>
            <Text style={styles.modalMsg}>
              Este restaurante se eliminará de tu lista. Puedes volver a agregarlo cuando quieras.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalBtnCancel}
                onPress={() => setConfirmModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.modalBtnConfirm}
                onPress={() => {
                  if (pendingId !== null) quitarFavorito(pendingId);
                  setConfirmModal(false);
                }}
              >
                <Text style={styles.modalBtnConfirmText}>Quitar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 40,
    marginBottom: 20,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: ORANGE,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.8,
  },
  countPill: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: ORANGE,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  countPillText: {
    color: WHITE,
    fontWeight: '800',
    fontSize: 16,
  },

  // Banner
  banner: {
    backgroundColor: ORANGE,
    borderRadius: 28,
    padding: 22,
    marginBottom: 24,
    overflow: 'hidden',
    minHeight: 130,
    justifyContent: 'center',
  },
  bannerDecorCircle1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bannerDecorCircle2: {
    position: 'absolute',
    bottom: -40,
    right: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  bannerLeft: {
    maxWidth: '75%',
  },
  bannerEyebrow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  bannerTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  bannerText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12.5,
    lineHeight: 18,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_LIGHT,
    letterSpacing: 1.4,
    marginBottom: 14,
    textTransform: 'uppercase',
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#C2540A',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    position: 'relative',
  },
  indexBadge: {
    position: 'absolute',
    top: -8,
    left: 14,
    backgroundColor: ORANGE,
    borderRadius: 10,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: ORANGE,
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  indexBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  imagePlaceholder: {
    width: 95,
    height: 95,
    borderRadius: 18,
    backgroundColor: TEXT_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagenReal: {
    width: 95,
    height: 95,
  },
  imageText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 9,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    paddingRight: 30,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 6,
  },
  typeTag: {
    backgroundColor: ORANGE_MID,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTagText: {
    color: ORANGE_DARK,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: TEXT_MID,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    backgroundColor: ORANGE_MID,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  ratingText: {
    color: ORANGE_DARK,
    fontWeight: '700',
    fontSize: 12,
  },
  addressText: {
    color: TEXT_LIGHT,
    fontSize: 11,
    flex: 1,
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: ORANGE_LIGHT,
    borderRadius: 14,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ORANGE_MID,
  },
  heartIcon: { fontSize: 14 },

  // Empty state
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ORANGE_MID,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: ORANGE,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: TEXT_MID,
    marginTop: 10,
    lineHeight: 22,
    fontSize: 14,
  },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: ORANGE,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 15,
    shadowColor: ORANGE,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  emptyBtnText: {
    color: WHITE,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '84%',
    backgroundColor: WHITE,
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.20,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  modalIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: ORANGE_MID,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIcon: { fontSize: 30 },
  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  modalMsg: {
    fontSize: 14,
    color: TEXT_MID,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 26,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_MID,
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOpacity: 0.40,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: WHITE,
  },
});