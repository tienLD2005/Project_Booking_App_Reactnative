import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import axiosInstance from "../utils/axiosInstance";
import { getErrorMessage } from "../utils/errorHandler";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 4).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus last input
      const nextIndex = Math.min(index + digits.length - 1, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const onVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mã OTP (4 chữ số)");
      return;
    }

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!phoneNumberClean) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/verify-otp", {
        phoneNumber: phoneNumberClean,
        otp: otpCode,
      });

      if (res.status === 200 || res.status === 201) {
        // Check if response has success field (APIResponse structure)
        if (res.data?.success || res.data?.data) {
          // Navigate to set password screen
          router.push({
            pathname: "/set-password",
            params: {
              phoneNumber: phoneNumberClean,
            },
          });
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Mã OTP không đúng");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Mã OTP không đúng");
      }
    } catch (e: any) {
      console.log("Verify OTP error:", e?.response?.data);
      const errorMessage = getErrorMessage(e);
      Alert.alert("Xác thực thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (timer > 0) return;

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!phoneNumberClean) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setResendLoading(true);
    try {
      const res = await axiosInstance.post("auth/resend-otp", {
        phoneNumber: phoneNumberClean,
      });

      if (res.status === 200 || res.status === 201) {
        if (res.data?.success || res.data?.data) {
          setTimer(60);
          setOtp(["", "", "", ""]);
          inputRefs.current[0]?.focus();
          Alert.alert("Thành công", res.data?.message || "Mã OTP mới đã được gửi");
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Không thể gửi lại mã OTP");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Không thể gửi lại mã OTP");
      }
    } catch (e: any) {
      const errorMessage = getErrorMessage(e);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setResendLoading(false);
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
          <Text style={styles.title}>Nhập mã OTP</Text>
          <Text style={styles.subtitle}>
            Mã OTP đã được gửi. Vui lòng kiểm tra email hoặc tin nhắn
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Không nhận được mã? </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Gửi lại sau {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}s</Text>
          ) : (
            <TouchableOpacity onPress={onResend} disabled={resendLoading}>
              <Text style={styles.resendLink}>
                {resendLoading ? "Đang gửi..." : "Gửi lại"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <Button
          title="Xác thực"
          onPress={onVerify}
          variant="primary"
          isLoading={loading}
          disabled={otp.join("").length !== 4}
        />
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A202C",
  },
  otpInputFilled: {
    borderColor: "#3182CE",
    backgroundColor: "#EBF8FF",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#718096",
  },
  resendLink: {
    fontSize: 14,
    color: "#3182CE",
    fontWeight: "600",
  },
  timerText: {
    fontSize: 14,
    color: "#718096",
  },
});

