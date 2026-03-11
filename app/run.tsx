import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { RunsType } from "@/types/runstype";

const runing = require("@/assets/images/runing.png");

export default function Run() {
  // สร้าง state สำหรับเก็บข้อมูลรายการวิ่งจาก Supabase
  const [runs, setRuns] = useState<RunsType[]>([]);

  // สร้างฟังก์ชันสำหรับดึงข้อมูลรายการวิ่งจาก Supabase
  const fetchRuns = async () => {
    const { data, error } = await supabase.from("runs").select("*");
    if (error) {
      Alert.alert("คำเตือน", "เกิดข้อผิดพลาดในการดึงข้อมูล");
      return;
    }
    // กำหนดข้อมูลที่ดึงมาให้กับ state
    setRuns(data as RunsType[]);
  };

  // เรียกใช้ฟังก์ชันดึงข้อมูล
  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, []),
  );

  // สร้างฟังก์ชันแสดงหน้าตาของแต่ละรายการที่ Flatlist
  const renderItem = ({ item }: { item: RunsType }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        <View style={styles.distanceBadge}>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.dateText}>
            {(() => {
              const date = new Date(item.run_date);
              const buddhistYear = "พ.ศ. " + (date.getFullYear() + 543);
              return (
                new Intl.DateTimeFormat("th-TH", {
                  month: "long",
                  day: "numeric",
                }).format(date) +
                " " +
                buddhistYear
              );
            })()}
          </Text>
        </View>
        <Text style={styles.distanceText}>{item.distance} km</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ส่วนแสดงรูป */}
      <Image source={runing} style={styles.image} />

      {/* ส่วนแสดงข้อมูลรายการ จาก Supabase */}
      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
      />

      {/* ส่วนแสดงปุ่มเพิ่ม */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  listPadding: {
    padding: 20,
    paddingBottom: 100, // เว้นที่ให้ FAB
  },
  locationText: {
    fontFamily: "Prompt_700Bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  dateText: {
    fontFamily: "Prompt_400Regular",
    fontSize: 12,
    color: "#888",
  },
  distanceText: {
    fontFamily: "Prompt_700Bold",
    fontSize: 13,
    color: "#007AFF",
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    // Shadow สำหรับ iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation สำหรับ Android
    elevation: 3,
  },
  image: {
    height: 120,
    width: 120,
    marginTop: 50,
    alignSelf: "center",
  },
  container: {
    flex: 1,
  },
  addButton: {
    position: "absolute",
    padding: 10,
    backgroundColor: "#1893da",
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    bottom: 50,
    right: 30,
    elevation: 3,
  },
});
