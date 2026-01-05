import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const PRIMARY = "#5B6CFF";
const TEXT_DARK = "#1A202C";
const TEXT_GRAY = "#718096";
const BORDER = "#EDF2F7";

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const logout = async () => {
    Alert.alert("Xác nhận đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>

        <View style={styles.profileRow}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
            }}
            style={styles.avatar}
          />

          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.userName}>
              {user?.fullName || "Khách"}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || "Chưa đăng nhập"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/account/edit-profile")}
          >
            <Ionicons name="pencil" size={18} color={PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== MENU ===== */}
      <View style={styles.menu}>
        {renderItem(
          "Edit Profile",
          "create-outline",
          () => router.push("/account/edit-profile")
        )}
        {renderItem(
          "Change Password",
          "lock-closed-outline",
          () => router.push("/account/change-password")
        )}
        {renderItem("Payment Method", "card-outline")}
        {renderItem("My Bookings", "clipboard-outline")}
        {renderItem(
          "Privacy Policy",
          "shield-checkmark-outline",
          () => router.push("/account/privacy-policy")
        )}
        {renderItem(
          "Terms & Conditions",
          "document-text-outline",
          () => router.push("/account/terms-conditions")
        )}
      </View>

      {/* ===== LOGOUT ===== */}
      <View style={{ padding: 20 }}>
        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.push("/login")}
          >
            <Ionicons name="log-in-outline" size={20} color="white" />
            <Text style={styles.logoutText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ===== MENU ITEM ===== */
function renderItem(
  label: string,
  icon: any,
  onPress?: () => void
) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={TEXT_DARK} />
      <Text style={styles.menuText}>{label}</Text>
      <FontAwesome5 name="chevron-right" size={14} color="#CBD5E0" />
    </TouchableOpacity>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  header: {
    backgroundColor: PRIMARY,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  userEmail: {
    fontSize: 14,
    color: "#E0E7FF",
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  menu: {
    marginTop: 24,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: TEXT_DARK,
  },

  logoutButton: {
    flexDirection: "row",
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
