import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Button from "../components/Button";
import Input from "../components/Input";
import axiosInstance from "../utils/axiosInstance";
import { getErrorMessage } from "../utils/errorHandler";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "password">("phone");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length > 0 && cleaned[0] !== "0") {
      return "0" + cleaned.slice(0, 9);
    }
    const limited = cleaned.slice(0, 10);
    if (limited.length <= 3) return `(${limited}`;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const digits = value.slice(0, 4).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length - 1, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onSendOtp = async () => {
    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!phoneNumberClean || !/^0\d{9}$/.test(phoneNumberClean)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/forgot-password", {
        phoneNumber: phoneNumberClean,
      });

      if (res.data?.success) {
        setOtpSent(true);
        setStep("otp");
        Alert.alert("Thành công", "OTP đã được gửi đến số điện thoại của bạn");
      }
    } catch (e: any) {
      const errorMessage = getErrorMessage(e);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ 4 chữ số OTP");
      return;
    }

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/verify-otp", {
        otp: otpCode,
        phoneNumber: phoneNumberClean,
      });

      if (res.data?.success) {
        setStep("password");
      }
    } catch (e: any) {
      const errorMessage = getErrorMessage(e);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
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
    const otpCode = otp.join("");
    
    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/reset-password", {
        phoneNumber: phoneNumberClean,
        otp: otpCode,
        newPassword: password,
      });

      if (res.data?.success) {
        Alert.alert("Thành công", "Đặt lại mật khẩu thành công", [
          { text: "OK", onPress: () => router.replace("/login") },
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
          <Ionicons name="arrow-back" size={24} color="#3182CE" />
        </TouchableOpacity>

        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Text style={styles.title}>
            {step === "phone" ? "Quên mật khẩu" : step === "otp" ? "Xác thực OTP" : "Đặt lại mật khẩu"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "phone"
              ? "Nhập số điện thoại để nhận OTP"
              : step === "otp"
              ? "Nhập mã OTP đã gửi đến số điện thoại của bạn"
              : "Nhập mật khẩu mới"}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.form}>
          {step === "phone" && (
            <>
              <Input
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
              />
              <Button
                title="Gửi OTP"
                onPress={onSendOtp}
                variant="primary"
                isLoading={loading}
                disabled={!phoneNumber.replace(/\D/g, "")}
              />
            </>
          )}

          {step === "otp" && (
            <>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
              <Button
                title="Xác thực OTP"
                onPress={onVerifyOtp}
                variant="primary"
                isLoading={loading}
                disabled={otp.join("").length !== 4}
              />
            </>
          )}

          {step === "password" && (
            <>
              <Input
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
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
                title="Đặt lại mật khẩu"
                onPress={onResetPassword}
                variant="primary"
                isLoading={loading}
                disabled={!password || !confirmPassword || password !== confirmPassword}
              />
            </>
          )}
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
  title: { fontSize: 28, fontWeight: "bold", color: "#3182CE", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#718096" },
  form: { marginBottom: 24 },
  otpContainer: { flexDirection: "row", gap: 12, marginBottom: 24, justifyContent: "center" },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#FFFFFF",
  },
});

