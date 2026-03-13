import { supabase } from "@/services/supabase";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const runing = require("@/assets/images/runing.png");

export default function Index() {
  useEffect(() => {
    const checkSession = async () => {
      // ดึงข้อมูล Session จาก Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // หน่วงเวลาให้โชว์หน้า Splash Screen 3 วินาที
      setTimeout(() => {
        if (session) {
          // ถ้ามีข้อมูลผู้ใช้แปลว่าเคย Login แล้ว ไปหน้า run ได้เลย
          router.replace("/run");
        } else {
          // ถ้าไม่มีข้อมูล ให้ไปหน้า login
          router.replace("/login");
        }
      }, 3000);
    };

    checkSession();
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
