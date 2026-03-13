import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// แจ้ง WebBrowser ให้เคลียร์ session เก่าที่ค้างอยู่ (ถ้ามี) เพื่อป้องกันปัญหาในการเข้าสู่ระบบด้วย OAuth
WebBrowser.maybeCompleteAuthSession();

const runing = require("@/assets/images/runing.png");

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      // สร้าง URL สำหรับเด้งกลับมาที่แอป
      const redirectUrl = Linking.createURL("/run", {
        scheme: "rnruntrackerapp",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      // ถ้าได้ URL จาก Supabase ให้เปิดหน้าต่างเบราว์เซอร์
      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      }
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="fitness" size={80} color="#1893da" />
        <Text style={styles.title}>Run Tracker App</Text>
        <Text style={styles.subtitle}>บันทึกทุกก้าวเดินของคุณ</Text>
      </View>

      <Image source={runing} style={styles.image} />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <Ionicons
            name="logo-google"
            size={24}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.buttonText}>เข้าสู่ระบบด้วย Google</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          การเข้าสู่ระบบแสดงว่าคุณยอมรับเงื่อนไขการใช้งาน
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    justifyContent: "space-between",
    paddingVertical: 100,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: "Prompt_700Bold",
    color: "#1893da",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Prompt_400Regular",
    color: "#555",
  },
  footer: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#4285F4", // สีมาตรฐาน Google
    width: "100%",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Prompt_700Bold",
    fontSize: 16,
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    fontFamily: "Prompt_400Regular",
    color: "#888",
    textAlign: "center",
  },
  image: {
    width: 250,
    height: 250,
    alignSelf: "center",
  },
});
