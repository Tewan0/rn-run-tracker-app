import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
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
        <TouchableOpacity style={styles.saveButton}>
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
