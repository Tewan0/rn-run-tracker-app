import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";

// 1. นำเข้าไลบรารีสำหรับเลือกรูปและแปลงไฟล์
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";

export default function RunDetail() {
  const { id } = useLocalSearchParams();

  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า");
  const [imageUrl, setImageUrl] = useState("");
  const [updating, setUpdating] = useState(false);

  // 2. เพิ่ม State สำหรับเก็บรูปภาพใหม่ที่เลือก
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newBase64Image, setNewBase64Image] = useState<string | null>(null);

  useEffect(() => {
    fetchRun();
  }, []);

  const fetchRun = async () => {
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;

    setLocation(data.location);
    setDistance(data.distance.toString());
    setTimeOfDay(data.time_of_day);
    setImageUrl(data.image_url);
  };

  // 3. ฟังก์ชันสำหรับถ่ายรูปใหม่ (คล้ายกับหน้า add.tsx)
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("ขออนุญาตเข้าถึงกล้องเพื่อถ่ายรูป");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri); // แสดงรูปล่าสุดที่หน้าจอ
      setNewBase64Image(result.assets[0].base64 || null); // เก็บ Base64 ไว้เตรียมอัปโหลด
    }
  };

  const handleUpdate = async () => {
    Alert.alert("ยืนยันการแก้ไข", "คุณต้องการบันทึกการแก้ไขนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ยืนยัน",
        style: "destructive",
        onPress: async () => {
          if (!location || !distance) {
            Alert.alert("คำเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
          }

          setUpdating(true); // เปิดสถานะกำลังโหลด
          try {
            let finalImageUrl = imageUrl; // กำหนดค่าเริ่มต้นเป็นรูปเดิม

            // 4. ถ้ามีการถ่ายรูปใหม่ ให้อัปโหลดรูปใหม่
            if (newBase64Image) {
              const fileName = `img_${Date.now()}.jpg`;
              const { error: uploadError } = await supabase.storage
                .from("run_bk")
                .upload(fileName, decode(newBase64Image), {
                  contentType: "image/jpeg",
                });

              if (uploadError) throw uploadError;

              // ได้ URL ของรูปใหม่
              finalImageUrl = supabase.storage
                .from("run_bk")
                .getPublicUrl(fileName).data.publicUrl;

              // 5. ลบรูปเก่าทิ้ง (เพื่อประหยัดพื้นที่ Storage)
              if (imageUrl) {
                const oldFileName = imageUrl.split("/").pop();
                if (oldFileName) {
                  await supabase.storage.from("run_bk").remove([oldFileName]);
                }
              }
            }

            // 6. อัปเดตข้อมูลลงฐานข้อมูล
            const { error: updateError } = await supabase
              .from("runs")
              .update([
                {
                  location: location,
                  distance: distance,
                  time_of_day: timeOfDay,
                  image_url: finalImageUrl, // ส่ง URL รูป (อาจจะเป็นรูปเดิม หรือ รูปใหม่)
                },
              ])
              .eq("id", id);

            if (updateError) throw updateError;

            Alert.alert("สำเร็จ", "บันทึกการแก้ไขเรียบร้อยแล้ว");
            router.back();
          } catch (error) {
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกการแก้ไขได้");
            console.error(error);
          } finally {
            setUpdating(false); // ปิดสถานะกำลังโหลด
          }
        },
      },
    ]);
  };

  const handleDelete = async () => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบรายการนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          const { error: deleteError } = await supabase
            .from("runs")
            .delete()
            .eq("id", id);
          if (deleteError) throw deleteError;

          const { error: storageError } = await supabase.storage
            .from("run_bk")
            .remove([imageUrl.split("/").pop()!]);
          if (storageError) throw storageError;

          Alert.alert("สำเร็จ", "ลบรายการวิ่งเรียบร้อยแล้ว");
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 7. เปลี่ยน View เป็น TouchableOpacity เพื่อให้กดถ่ายรูปได้ */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleTakePhoto}
        activeOpacity={0.8}
      >
        {/* เช็คว่ามีรูปใหม่ไหม ถ้ามีโชว์รูปใหม่ ถ้าไม่มีโชว์รูปเดิมจาก db */}
        {newImage || imageUrl ? (
          <Image
            source={{ uri: newImage || imageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.mainImage, styles.noImage]}>
            <Ionicons name="camera-outline" size={60} color="#DDD" />
            <Text style={styles.noImageText}>กดเพื่อถ่ายรูป</Text>
          </View>
        )}

        {/* ไอคอนกล้องซ้อนทับมุมขวาล่างเพื่อให้รู้ว่ากดเปลี่ยนรูปได้ */}
        <View style={styles.cameraIconBadge}>
          <Ionicons name="camera" size={20} color="#FFF" />
        </View>
      </TouchableOpacity>

      <View style={styles.formCard}>
        <Text style={styles.label}>สถานที่</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>ระยะทาง (กม.)</Text>
        <TextInput
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
        />

        <Text style={styles.label}>ช่วงเวลา</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, timeOfDay === "เช้า" && styles.chipActive]}
            onPress={() => setTimeOfDay("เช้า")}
          >
            <Text
              style={[
                styles.chipText,
                timeOfDay === "เช้า" && styles.chipTextActive,
              ]}
            >
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, timeOfDay === "เย็น" && styles.chipActive]}
            onPress={() => setTimeOfDay("เย็น")}
          >
            <Text
              style={[
                styles.chipText,
                timeOfDay === "เย็น" && styles.chipTextActive,
              ]}
            >
              เย็น
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, updating && styles.buttonDisabled]}
          disabled={updating}
          onPress={handleUpdate}
        >
          {updating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.updateButtonText}>บันทึกการแก้ไข</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>ลบรายการนี้</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingBottom: 40 },
  imageContainer: { width: "100%", height: 200, backgroundColor: "#EEE" },
  mainImage: { width: "100%", height: "100%" },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  noImageText: {
    fontFamily: "Prompt_400Regular",
    color: "#AAA",
    marginTop: 10,
  },
  // 8. เพิ่ม Style สำหรับไอคอนกล้อง
  cameraIconBadge: {
    position: "absolute",
    bottom: 45,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
  },
  formCard: {
    backgroundColor: "#FFF",
    height: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontFamily: "Prompt_700Bold",
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 10,
    fontFamily: "Prompt_400Regular",
    fontSize: 18,
    color: "#007AFF",
  },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  chipActive: { backgroundColor: "#007AFF" },
  chipText: { fontFamily: "Prompt_400Regular", color: "#666" },
  chipTextActive: { color: "#FFF" },
  updateButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  updateButtonText: {
    color: "#FFF",
    fontFamily: "Prompt_700Bold",
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontFamily: "Prompt_400Regular",
    marginLeft: 8,
  },
  buttonDisabled: { opacity: 0.7 },
});
