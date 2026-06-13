import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

import { obtenerRestaurantes } from "../../services/restaurantService";

const imagenesRestaurante: Record<number, any> = {
  1: require("../../assets/images_restaurantesyplatos/r1.png"),
  2: require("../../assets/images_restaurantesyplatos/r2.png"),
  3: require("../../assets/images_restaurantesyplatos/r3.png"),
  4: require("../../assets/images_restaurantesyplatos/r4.png"),
  5: require("../../assets/images_restaurantesyplatos/r5.png"),
};

const CATEGORIES = [
  { emoji: "🥩", label: "Parrilla" },
  { emoji: "🍽️", label: "Gourmet" },
  { emoji: "☕", label: "Café" },
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🍔", label: "Comida rápida" },
];

const bannerWidth = Dimensions.get("window").width - 40;

export default function HomeScreen() {
  const router = useRouter();

  const [restaurantes, setRestaurantes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % 3;
        bannerRef.current?.scrollTo({ x: next * bannerWidth, animated: true });
        return next;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await obtenerRestaurantes();
      setRestaurantes(data as any[]);
    } catch (error) {
      console.log(error);
    }
  };

  const restaurantesFiltrados = restaurantes.filter((r) => {
    const coincideBusqueda = r.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoriaSeleccionada === ""
        ? true
        : r.tipo_comida
            ?.toLowerCase()
            .includes(categoriaSeleccionada.toLowerCase());

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            Sincelejo, Sucre
          </Text>
        </View>

        <Text style={styles.title}>
          ¿Qué deseas{'\n'}comer hoy?
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            placeholder="Buscar restaurantes..."
            placeholderTextColor="#BBBBBB"
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={styles.catChip}
            activeOpacity={0.8}
            onPress={() =>
              setCategoriaSeleccionada(
                categoriaSeleccionada === cat.label
                  ? ""
                  : cat.label
              )
            }
          >
            <View
              style={[
                styles.catIconBox,
                categoriaSeleccionada === cat.label &&
                  styles.catIconBoxActive,
              ]}
            >
              <Text style={styles.catEmoji}>
                {cat.emoji}
              </Text>
            </View>

            <Text
              style={[
                styles.catLabel,
                categoriaSeleccionada === cat.label &&
                  styles.catLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── BANNER CARRUSEL ── */}
      <View style={styles.bannerWrapper}>
        <ScrollView
          ref={bannerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
            setBannerIndex(idx);
          }}
          style={{ borderRadius: 22 }}
        >
          {/* Slide 1 */}
          <View style={[styles.banner, { backgroundColor: "#F4623A" }]}>
            <View style={styles.bannerDecoCircle1} />
            <View style={styles.bannerDecoCircle2} />
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>TASTEGO PREMIUM</Text>
            </View>
            <Text style={styles.bannerTitle}>
              Descubre los mejores{'\n'}sabores de Sincelejo
            </Text>
            <View style={styles.codeButton}>
              <Text style={styles.codeButtonText}>Restaurantes verificados</Text>
            </View>
          </View>

          {/* Slide 2 */}
          <View style={[styles.banner, { backgroundColor: "#E8472A" }]}>
            <View style={styles.bannerDecoCircle1} />
            <View style={styles.bannerDecoCircle2} />
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>OFERTAS ESPECIALES</Text>
            </View>
            <Text style={styles.bannerTitle}>
              Ofertas en nuestros{'\n'}restaurantes aliados
            </Text>
            <Text style={styles.bannerSub}>
              Aprovecha tus descuentos{'\n'}y ahorra en cada pedido 🎉
            </Text>
            <View style={styles.codeButton}>
              <Text style={styles.codeButtonText}>Ver ofertas</Text>
            </View>
          </View>

          {/* Slide 3 */}
          <View style={[styles.banner, { backgroundColor: "#D93020" }]}>
            <View style={styles.bannerDecoCircle1} />
            <View style={styles.bannerDecoCircle2} />
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>PIDE DESDE LA APP</Text>
            </View>
            <Text style={styles.bannerTitle}>
              Puedes hacer tus{'\n'}pedidos desde aquí
            </Text>
            <Text style={styles.bannerSub}>
              Ordena ya tu comida{'\n'}favorita con un toque 🍔
            </Text>
            <View style={styles.codeButton}>
              <Text style={styles.codeButtonText}>Ordenar ahora</Text>
            </View>
          </View>
        </ScrollView>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, bannerIndex === i && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Restaurantes disponibles
        </Text>

        {restaurantesFiltrados.map((item) => (
          <TouchableOpacity
            key={item.id_restaurante}
            style={styles.restaurantListCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/restaurant/details",
                params: {
                  id: item.id_restaurante,
                },
              } as any)
            }
          >
            <View style={styles.listImage}>
              {imagenesRestaurante[item.id_restaurante] ? (
                <Image
                  source={imagenesRestaurante[item.id_restaurante]}
                  style={styles.listImageReal}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.imagePlaceholderText}>FOTO</Text>
              )}
            </View>

            <View style={styles.listInfo}>
              <Text
                style={styles.listName}
                numberOfLines={1}
              >
                {item.nombre}
              </Text>

              <Text
                style={styles.listType}
                numberOfLines={1}
              >
                {item.tipo_comida}
              </Text>

              <Text
                style={styles.listAddress}
                numberOfLines={1}
              >
                📍 {item.direccion}
              </Text>

              <View style={styles.listRating}>
                <Text style={styles.listRatingText}>
                  ⭐ {item.calificacion}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  locationIcon: {
    marginRight: 5,
  },

  locationText: {
    color: "#888",
  },

  greeting: {
    color: "#888",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#11181C",
    marginTop: 5,
  },

  searchRow: {
    marginHorizontal: 20,
    marginTop: 20,
  },

  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
  },

  categoriesRow: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },

  catChip: {
    alignItems: "center",
  },

  catIconBox: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
  },

  catIconBoxActive: {
    backgroundColor: "#FFF1EF",
    borderWidth: 2,
    borderColor: "#EF5548",
  },

  catEmoji: {
    fontSize: 22,
  },

  catLabel: {
    marginTop: 5,
    color: "#888",
    fontSize: 11,
  },

  catLabelActive: {
    color: "#EF5548",
    fontWeight: "700",
  },

  // ── BANNER ──
  bannerWrapper: {
    marginHorizontal: 20,
  },

  banner: {
    width: bannerWidth,
    borderRadius: 22,
    padding: 20,
    overflow: "hidden",
  },

  bannerDecoCircle1: {
    position: "absolute",
    top: -20,
    right: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  bannerDecoCircle2: {
    position: "absolute",
    bottom: -25,
    right: 50,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  bannerTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  bannerTagText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 11,
  },

  bannerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
  },

  bannerSub: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },

  codeButton: {
    marginTop: 12,
    backgroundColor: "#11181C",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  codeButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },

  dotActive: {
    width: 20,
    backgroundColor: "#F4623A",
  },
  // ── FIN BANNER ──

  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  restaurantListCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
  },

  listImage: {
    width: 95,
    height: 95,
    borderRadius: 15,
    backgroundColor: "#11181C",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  listImageReal: {
    width: 95,
    height: 95,
  },

  imagePlaceholderText: {
    color: "#FFF",
    fontWeight: "700",
  },

  listInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },

  listName: {
    fontSize: 16,
    fontWeight: "700",
  },

  listType: {
    color: "#EF5548",
    fontWeight: "600",
  },

  listAddress: {
    color: "#666",
    fontSize: 12,
  },

  listRating: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1EF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  listRatingText: {
    color: "#EF5548",
    fontWeight: "700",
  },

  mapButton: {
    backgroundColor: "#EF5548",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 30,
  },

  mapButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});