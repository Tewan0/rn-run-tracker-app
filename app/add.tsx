import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Add() {
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า");
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  // ฟังก์ชันสำหรับถ่ายรูปหรือเลือกภาพจากแกลเลอรี่
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("ขออนุญาตเข้าถึงกล้องเพื่อถ่ายรูป");
      return;
    }

    // เปิดกล้องเพื่อถ่ายรูป
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true, // ขอให้ได้ข้อมูลภาพในรูปแบบ Base64
    });

    //หลังจากถ่ายรูปเสร็จแล้ว เอาไปกำหนดให้ state
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null); // เก็บข้อมูล Base64 ของภาพ
    }
  };

  //ฟังก์ชันบันทึกข้อมูลจากที่ผู้ใช้ป้อน/เลือกไปไว้ที่ supabase
  const handleSaveToSupabase = async () => {
    // Validate location, distance, image
    if (!location || !distance || !image) {
      Alert.alert("คำเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    //อัปโหลดรูปไปยัง Supabase Storage
    //ตัวแปรสำหรับเก็บ URL ของรูปที่อัปโหลด
    let imageUrl = null; // ตัวแปรเก็บ URL ของรูป
    const fileName = `img_${Date.now()}.jpg`; // สร้างชื่อไฟล์แบบไม่ซ้ำ
    const { error: uploadError } = await supabase.storage
      .from("run_bk")
      .upload(fileName, decode(base64Image!), { contentType: "image/jpeg" });

    if (uploadError) throw uploadError; // ถ้าเกิดข้อผิดพลาดในการอัปโหลด ให้โยนข้อผิดพลาดออกมา

    //เอา url ของรูปที่ storage มากำหนดให้กับตัวแปรเพื่อเอาไปบันทึกในฐานข้อมูล
    imageUrl = await supabase.storage.from("run_bk").getPublicUrl(fileName).data
      .publicUrl;

    //บันทึกข้อมูลไปยัง Table ใน Supabase
    const { error: insertError } = await supabase.from("runs").insert([
      {
        location: location,
        distance: distance,
        time_of_day: timeOfDay,
        run_date: new Date().toISOString().split("T")[0], // เก็บเฉพาะวันที่ในรูปแบบ YYYY-MM-DD
        image_url: imageUrl, // บันทึก URL ของรูปที่อัปโหลด
      },
    ]);
    if (insertError) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
      return;
    }

    // บันทึกเรียบร้อยแสดงข้อความแจ้ง และเปิดกลับไปหน้า /run
    Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");
    router.back(); // กลับไปหน้าก่อนหน้า (ซึ่งน่าจะเป็นหน้า /run)
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1, padding: 30, marginTop: 10 }}>
        <Text style={styles.title}>สถานที่วิ่ง</Text>
        <TextInput
          placeholder="เช่น สวนลุมพินี"
          placeholderTextColor={"#9b9b9b"}
          style={styles.inputValue}
          value={location}
          onChangeText={setLocation}
        />
        <Text style={styles.title}>ระยะทาง (กิโลเมตร)</Text>
        <TextInput
          placeholder="เช่น 5.2"
          placeholderTextColor={"#9b9b9b"}
          style={styles.inputValue}
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />
        <Text style={styles.title}>ช่วงเวลา</Text>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <TouchableOpacity
            style={[
              styles.timeButton,
              { backgroundColor: timeOfDay === "เช้า" ? "#1893da" : "#d1d1d1" },
            ]}
            onPress={() => setTimeOfDay("เช้า")}
          >
            <Text style={{ color: "white", fontFamily: "Prompt_700Bold" }}>
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeButton,
              { backgroundColor: timeOfDay === "เย็น" ? "#1893da" : "#d1d1d1" },
            ]}
            onPress={() => setTimeOfDay("เย็น")}
          >
            <Text style={{ color: "white", fontFamily: "Prompt_700Bold" }}>
              เย็น
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>รูปภาพสถานที่</Text>
        <TouchableOpacity
          style={styles.takePhotoButton}
          onPress={handleTakePhoto}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 200, borderRadius: 8 }}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="camera-outline" size={30} color="#a4a4a4" />
              <Text
                style={{ color: "#a4a4a4", fontFamily: "Prompt_400Regular" }}
              >
                กดเพื่อถ่ายรูป
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveToSupabase}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontFamily: "Prompt_700Bold",
            }}
          >
            บันทึกข้อมูล
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#1893da",
    alignItems: "center",
    width: "100%",
    marginTop: 30,
  },
  takePhotoButton: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timeButton: {
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    width: 60,
    marginBottom: 20,
  },
  inputValue: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: "Prompt_700Bold",
    marginBottom: 10,
  },
});
