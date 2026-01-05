import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Button from "../../components/Button";
import Input from "../../components/Input";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/errorHandler";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 100) {
      Alert.alert("Lỗi", "Mật khẩu mới phải từ 6 đến 100 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put("auth/change-password", {
        oldPassword,
        newPassword,
      });

      if (res.data?.success) {
        Alert.alert("Thành công", "Đổi mật khẩu thành công", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      const errorMessage = getErrorMessage(e);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#5B6CFF" />
        </TouchableOpacity>

        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Text style={styles.title}>Đổi mật khẩu</Text>
          <Text style={styles.subtitle}>Nhập mật khẩu cũ và mật khẩu mới</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.form}>
          <Input
            label="Mật khẩu cũ"
            placeholder="Nhập mật khẩu cũ"
            value={oldPassword}
            onChangeText={setOldPassword}
            icon="lock-closed-outline"
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={showOldPassword}
            onTogglePassword={() => setShowOldPassword(!showOldPassword)}
          />

          <Input
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            icon="lock-closed-outline"
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={showNewPassword}
            onTogglePassword={() => setShowNewPassword(!showNewPassword)}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon="lock-closed-outline"
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <Button
            title="Đổi mật khẩu"
            onPress={onChangePassword}
            variant="primary"
            isLoading={loading}
            disabled={!oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  backButton: { marginBottom: 20, width: 40, height: 40, justifyContent: "center" },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", color: "#5B6CFF", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#718096" },
  form: { marginBottom: 24 },
});

