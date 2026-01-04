import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import axiosInstance from "../utils/axiosInstance";
import { getErrorMessage } from "../utils/errorHandler";

export default function SetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu");
      return;
    }

    if (password.length < 6 || password.length > 100) {
      Alert.alert("Lỗi", "Mật khẩu phải từ 6 đến 100 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!phoneNumberClean || !/^0\d{9}$/.test(phoneNumberClean)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Complete registration with password - only send phoneNumber and password
      const res = await axiosInstance.post("auth/complete-registration", {
        phoneNumber: phoneNumberClean,
        password,
      });

      if (res.status === 200 || res.status === 201) {
        // Check if response has success field (APIResponse structure)
        if (res.data?.success || res.data?.data) {
          Alert.alert("Thành công", res.data?.message || "Đăng ký hoàn tất thành công! Hãy đăng nhập ngay.", [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]);
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Không thể hoàn tất đăng ký");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Không thể hoàn tất đăng ký");
      }
    } catch (e: any) {
      console.log("Set password error:", e?.response?.data);
      const errorMessage = getErrorMessage(e);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#3182CE" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LG</Text>
          </View>
          <Text style={styles.logoTitle}>live Green</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nhập mật khẩu mới</Text>
          <Text style={styles.subtitle}>Vui lòng nhập mật khẩu mới</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <Input
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon="lock-closed-outline"
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <Button
            title="Lưu"
            onPress={onSave}
            variant="primary"
            isLoading={loading}
            disabled={!password || !confirmPassword || password !== confirmPassword}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3182CE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3182CE",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3182CE",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
  },
  form: {
    marginBottom: 24,
  },
});

