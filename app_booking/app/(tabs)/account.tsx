import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function AccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const load = async () => {
        const json = await AsyncStorage.getItem("userProfile");
        if (isActive) setProfile(json ? JSON.parse(json) : null);
      };
      load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const logout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await signOut();
            setProfile(null);
            router.replace("/login");
          },
        },

      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg",
          }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{profile?.fullName || "Khách"}</Text>
        <Text style={styles.userEmail}>{profile?.email || "Chưa đăng nhập"}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/account/edit-profile")}
        >
          <Ionicons name="person-circle-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/account/change-password")}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Đổi mật khẩu</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Thông báo</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/account/terms-conditions")}
        >
          <Ionicons name="document-text-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Điều khoản & Điều kiện</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/account/privacy-policy")}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Chính sách bảo mật</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>
      </View>

      {profile ? (
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
          <Text
            style={[styles.menuText, { color: "#E53E3E", fontWeight: "bold" }]}
          >
            Đăng xuất
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={() => router.push("/login")}>
          <Ionicons name="log-in-outline" size={24} color="#3182CE" />
          <Text
            style={[styles.menuText, { color: "#3182CE", fontWeight: "bold" }]}
          >
            Đăng nhập
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#2D3748",
  },
  userEmail: {
    fontSize: 16,
    color: "#718096",
    marginTop: 5,
  },
  menu: {
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: "#2D3748",
  },
  logoutButton: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
});
