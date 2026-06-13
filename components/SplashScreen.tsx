import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { COLORS } from "../constants/theme2";

const { width, height } = Dimensions.get("window");
const FINAL_SIZE = Math.sqrt(width * width + height * height) * 2.5;

export default function SplashScreen() {
  const circleScale = useRef(new Animated.Value(0.15)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(circleScale, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: true,
    }).start(() => {
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            router.replace("/auth/login");
          });
        }, 800);
      });
    });
  }, []);

  return (
    <Animated.View
      style={[styles.container, { opacity: screenOpacity }]}
    >
      <View style={styles.redBg} />

      <Animated.View
        style={[
          styles.whiteCircle,
          {
            width: FINAL_SIZE,
            height: FINAL_SIZE,
            borderRadius: FINAL_SIZE / 2,
            transform: [{ scale: circleScale }],
          },
        ]}
      >
        <Animated.Image
          source={require("../assets/images_estilo/logo_icon.png")}
          style={[
            styles.iconImg,
            {
              opacity: iconOpacity,
              transform: [
                {
                  scale: circleScale.interpolate({
                    inputRange: [0.15, 1],
                    outputRange: [6, 1],
                  }),
                },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[styles.logoWrap, { opacity: logoOpacity }]}
      >
        <Image
          source={require("../assets/images_estilo/logo.png")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  redBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
  },

  whiteCircle: {
    position: "absolute",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  iconImg: {
    width: 90,
    height: 90,
  },

  logoWrap: {
    position: "absolute",
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  logoImg: {
    width: 240,
    height: 110,
  },
});