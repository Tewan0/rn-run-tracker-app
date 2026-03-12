import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const runing = require("@/assets/images/runing.png");

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={runing} style={styles.image} />
      <Text style={styles.title}>Run Tracker App</Text>
      <Text style={styles.subtitle}>วิ่งเพื่อสุขภาพ</Text>
      <ActivityIndicator
        size="large"
        color="#1893da"
        style={{ marginTop: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Prompt_700Bold",
    marginBottom: 10,
    color: "#1893da",
  },
  subtitle: {
    fontFamily: "Prompt_400Regular",
    fontSize: 20,
    color: "#333",
  },
});
