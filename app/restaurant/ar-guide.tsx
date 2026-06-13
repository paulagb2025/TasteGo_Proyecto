import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";

export default function ArGuide() {
  const router = useRouter();
  const { modelUrl, nombrePlato, descripcion, precio } = useLocalSearchParams();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0); // para forzar reload en reintentar

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            background: #111;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
            font-family: -apple-system, sans-serif;
          }

          model-viewer {
            width: 100vw;
            height: 100vh;
            background-color: #1a1a1a;
            --progress-bar-color: #EF5548;
          }

          #ar-button {
            position: absolute;
            bottom: 36px;
            left: 50%;
            transform: translateX(-50%);
            background: #FF6B35;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 14px 32px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(255,107,53,0.5);
            z-index: 10;
            white-space: nowrap;
          }

          #ar-button:active { opacity: 0.8; }

          .info-badge {
            position: absolute;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.65);
            color: white;
            border-radius: 16px;
            padding: 10px 20px;
            text-align: center;
            z-index: 10;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            width: 85vw;
            max-width: 340px;
          }

          .plato-nombre {
            font-size: 16px;
            font-weight: 700;
            color: #fff;
          }

          .plato-desc {
            font-size: 12px;
            color: rgba(255,255,255,0.65);
            margin-top: 3px;
          }

          .plato-precio {
            font-size: 14px;
            font-weight: 700;
            color: #EF5548;
            margin-top: 4px;
          }

          .hint {
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255,255,255,0.45);
            font-size: 11px;
            text-align: center;
            z-index: 10;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="info-badge">
          <div class="plato-nombre">${nombrePlato ?? "Plato"}</div>
          <div class="plato-desc">${descripcion ?? ""}</div>
          <div class="plato-precio">$${Number(precio ?? 0).toLocaleString("es-CO")}</div>
        </div>

        <model-viewer
          src="${modelUrl}"
          alt="${nombrePlato ?? "Plato"}"
          auto-rotate
          camera-controls
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-button-id="ar-button"
          shadow-intensity="1"
          exposure="1"
          loading="eager"
          reveal="auto"
        >
          <button slot="ar-button" id="ar-button">
            📷 Ver en Realidad Aumentada
          </button>
        </model-viewer>

        <div class="hint">Arrastra para rotar · Pellizca para zoom</div>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#EF5548" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vista 3D · RA</Text>
      </View>

      <View style={styles.container}>
        {/* Spinner de carga superpuesto */}
        {cargando && !error && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#EF5548" />
            <Text style={styles.loadingText}>Cargando modelo 3D...</Text>
            <Text style={styles.loadingSubtext}>Puede tardar unos segundos</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorTitle}>No se pudo cargar el modelo</Text>
            <Text style={styles.errorText}>
              Verifica tu conexión a internet e intenta de nuevo.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setError(false);
                setCargando(true);
                setKey((k) => k + 1); // fuerza remount del WebView
              }}
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            key={key}
            style={styles.webview}
            source={{ html }}
            originWhitelist={["*"]}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onLoadEnd={() => setCargando(false)}
            onError={() => {
              setError(true);
              setCargando(false);
            }}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            mixedContentMode="always"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EF5548",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  header: {
    backgroundColor: "#EF5548",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
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

  backIcon: {
    fontSize: 26,
    color: "#FFF",
    lineHeight: 30,
    fontWeight: "300",
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  webview: {
    flex: 1,
    backgroundColor: "#111",
  },

  loadingBox: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    zIndex: 10,
  },

  loadingText: {
    color: "#FFF",
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
  },

  loadingSubtext: {
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
    fontSize: 12,
  },

  errorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#111",
  },

  errorEmoji: { fontSize: 50 },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 16,
    textAlign: "center",
  },

  errorText: {
    color: "#AAA",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  retryBtn: {
    marginTop: 20,
    backgroundColor: "#EF5548",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },

  retryText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});