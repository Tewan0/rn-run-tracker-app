import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
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

// บังคับเคลียร์ Session เก่าที่ค้างในเบราว์เซอร์
WebBrowser.maybeCompleteAuthSession();

const runing = require("@/assets/images/runing.png");

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      // สร้าง URI สําหรับเข้าสู่ระบบด้วย Google
      const redirectUri = makeRedirectUri();

      console.log("Redirect URI:", redirectUri); // ตรวจสอบ URI ที่สร้างขึ้น

      // เริ่มกระบวนการเข้าสู่ระบบด้วย Google ผ่าน Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri, // ใช้ URI ที่สร้างขึ้น
          skipBrowserRedirect: true, // ป้องกันการรีไดเรกต์อัตโนมัติในเบราว์เซอร์
        },
      });

      if (error) throw error; // ตรวจสอบข้อผิดพลาดในการเข้าสู่ระบบ
      if (data?.url) {
        // เปิด URL ที่ได้รับจาก Supabase ในเบราว์เซอร์
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
        );
        // ตรวจสอบผลลัพธ์จากการเปิดเบราว์เซอร์
        if (result.type === "success") {
          // การเข้าสู่ระบบสำเร็จ
          console.log("Login successful!");

          // ตรวจสอบ URL ที่ได้รับจาก Supabase หลังจากการเข้าสู่ระบบ
          const urlParams = new URLSearchParams(result.url.split("#")[1]);
          const accessToken = urlParams.get("access_token");
          const refreshToken = urlParams.get("refresh_token");

          // บันทึก token ใน Supabase client
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            console.log("Tokens set in Supabase client");
          } else {
            console.warn("No tokens found in URL");
          }
        }
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      console.error("Google Login Error:", error);
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
  header: { alignItems: "center" },
  title: {
    fontSize: 32,
    fontFamily: "Prompt_700Bold",
    color: "#1893da",
    marginTop: 20,
  },
  subtitle: { fontSize: 18, fontFamily: "Prompt_400Regular", color: "#555" },
  footer: { paddingHorizontal: 30, alignItems: "center" },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#4285F4",
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
  buttonText: { color: "#fff", fontFamily: "Prompt_700Bold", fontSize: 16 },
  note: {
    marginTop: 20,
    fontSize: 12,
    fontFamily: "Prompt_400Regular",
    color: "#888",
    textAlign: "center",
  },
  image: { width: 250, height: 250, alignSelf: "center" },
});
