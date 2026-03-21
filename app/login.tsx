import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

const runing = require("@/assets/images/runing.png");

export default function Login() {
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันดึง Token จาก URL แล้ว set session
  const handleDeepLink = async (url: string) => {
    console.log("📩 Received URL:", url);

    // รองรับทั้ง fragment (#) และ query string (?)
    const paramsString = url.includes("#")
      ? url.split("#")[1]
      : url.includes("?")
        ? url.split("?")[1]
        : "";

    const urlParams = new URLSearchParams(paramsString);

    // กรณี PKCE flow: ได้ code กลับมา
    const code = urlParams.get("code");
    if (code) {
      console.log("🔑 Got auth code, exchanging for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("❌ Exchange code error:", error);
        Alert.alert("ข้อผิดพลาด", error.message);
      } else {
        console.log("✅ Login successful (PKCE)!", data.user?.email);
      }
      setLoading(false);
      return;
    }

    // กรณี Implicit flow: ได้ access_token กลับมา
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && refreshToken) {
      console.log("🔑 Got tokens, setting session...");
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error("❌ Set session error:", error);
        Alert.alert("ข้อผิดพลาด", error.message);
      } else {
        console.log("✅ Login successful (Implicit)!");
      }
    } else {
      console.warn("⚠️ No tokens or code in URL");
    }
    setLoading(false);
  };

  // Listener จับ deep link ที่กลับมาจากเบราว์เซอร์
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("🔗 Deep link event:", event.url);
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const redirectUri = Linking.createURL("/");
      console.log("=============================================");
      console.log("🔑 Redirect URI:", redirectUri);
      console.log("=============================================");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setLoading(false);
        throw error;
      }

      if (!data?.url) {
        setLoading(false);
        Alert.alert("ข้อผิดพลาด", "ไม่ได้รับ URL จาก Supabase");
        return;
      }

      console.log("🌐 Opening auth URL...");

      // ใช้ Linking.openURL เปิด System Browser แทน Custom Chrome Tab
      // เพราะ System Browser รองรับ deep link (exp://) ได้ดีกว่า
      await Linking.openURL(data.url);

      // หมายเหตุ: หลังจาก Login สำเร็จในเบราว์เซอร์
      // เบราว์เซอร์จะ redirect มาที่ exp://... -> Expo Go จะเปิดขึ้นมาอัตโนมัติ
      // แล้ว useEffect ข้างบนจะจับ URL และ set session ให้
    } catch (error) {
      setLoading(false);
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
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
          ) : (
            <Ionicons
              name="logo-google"
              size={24}
              color="#fff"
              style={{ marginRight: 10 }}
            />
          )}
          <Text style={styles.buttonText}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}
          </Text>
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
  googleButtonDisabled: {
    opacity: 0.7,
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
