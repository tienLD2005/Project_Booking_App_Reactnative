import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Button from "../../components/Button";
import Input from "../../components/Input";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/errorHandler";

export default function EditProfileScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: new Date(),
    gender: "Male" as "Male" | "Female",
  });
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axiosInstance.get("auth/me");
      const data = res.data.data;
      if (data) {
        const dob = data.dateOfBirth ? new Date(data.dateOfBirth) : new Date();
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          dateOfBirth: dob,
          gender: data.gender === "Female" ? "Female" : "Male",
        });
        setOriginalPhoneNumber(data.phoneNumber || "");
      }
    } catch (e: any) {
      console.log("Load profile error:", e?.response?.data);
      const errorMessage = getErrorMessage(e);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChange = (key: string, value: string | Date) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
    if (key === "phoneNumber" && needsOtp) {
      setNeedsOtp(false);
      setOtp("");
    }
  };

  const formatDate = (date: Date) => {
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];
    return `Ngày ${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

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
    handleChange("phoneNumber", formatted);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const { fullName, email, phoneNumber } = form;
    const phoneNumberClean = phoneNumber.replace(/\D/g, "");

    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email))
      newErrors.email = "Email phải có định dạng @gmail.com";
    if (!phoneNumberClean) newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^0\d{9}$/.test(phoneNumberClean))
      newErrors.phoneNumber = "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onUpdate = async () => {
    if (!validateForm()) return;

    const { fullName, email, phoneNumber, dateOfBirth, gender } = form;
    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    const year = dateOfBirth.getFullYear();
    const month = String(dateOfBirth.getMonth() + 1).padStart(2, "0");
    const day = String(dateOfBirth.getDate()).padStart(2, "0");
    const dateOfBirthFormatted = `${year}-${month}-${day}`;

    // Kiểm tra nếu đổi số điện thoại
    const phoneChanged = phoneNumberClean !== originalPhoneNumber.replace(/\D/g, "");
    
    if (phoneChanged && !needsOtp && !otp) {
      // Lần đầu đổi số điện thoại, gửi OTP
      setLoading(true);
      try {
        const res = await axiosInstance.put("auth/profile", {
          fullName,
          email,
          phoneNumber: phoneNumberClean,
          dateOfBirth: dateOfBirthFormatted,
          gender,
        });
        
        if (res.data?.message?.includes("OTP")) {
          setNeedsOtp(true);
          Alert.alert("Thông báo", "OTP đã được gửi đến số điện thoại mới. Vui lòng nhập OTP để xác thực.");
        }
      } catch (e: any) {
        const errorMessage = getErrorMessage(e);
        if (errorMessage.includes("OTP")) {
          setNeedsOtp(true);
          Alert.alert("Thông báo", errorMessage);
        } else {
          Alert.alert("Lỗi", errorMessage);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put("auth/profile", {
        fullName,
        email,
        phoneNumber: phoneNumberClean,
        dateOfBirth: dateOfBirthFormatted,
        gender,
        otp: phoneChanged ? otp : undefined,
      });

      if (res.data?.success) {
        // Cập nhật AsyncStorage
        const profileData = {
          fullName: res.data.data.fullName,
          email: res.data.data.email,
          phone: res.data.data.phoneNumber,
        };
        await AsyncStorage.setItem("userProfile", JSON.stringify(profileData));
        
        Alert.alert("Thành công", "Cập nhật thông tin thành công", [
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

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3182CE" />
        </TouchableOpacity>

        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
          <Text style={styles.subtitle}>Cập nhật thông tin cá nhân của bạn</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.form}>
          <Input
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={form.fullName}
            onChangeText={(text: any) => handleChange("fullName", text)}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          <Input
            label="Email"
            placeholder="Nhập email"
            value={form.email}
            onChangeText={(text: any) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Input
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            value={form.phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
          />
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          {needsOtp && (
            <View style={styles.otpContainer}>
              <Input
                label="OTP"
                placeholder="Nhập OTP đã gửi đến số điện thoại mới"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
            </View>
          )}

          <Input
            label="Ngày sinh"
            placeholder="Chọn ngày sinh"
            onChangeText={() => {}}
            value={formatDate(form.dateOfBirth)}
            editable={false}
            onPress={() => setShowDatePicker(true)}
            rightIcon="calendar-outline"
            onRightIconPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={form.dateOfBirth}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                textColor={Platform.OS === "ios" ? "#1A202C" : undefined}
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) handleChange("dateOfBirth", selectedDate);
                }}
                maximumDate={new Date()}
              />
            </View>
          )}

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Giới tính</Text>
            <View style={styles.genderOptions}>
              {["Male", "Female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderOption, form.gender === g && styles.genderOptionSelected]}
                  onPress={() => handleChange("gender", g)}
                >
                  <View style={[styles.radioButton, form.gender === g && styles.radioButtonSelected]}>
                    {form.gender === g && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={[styles.genderText, form.gender === g && styles.genderTextSelected]}>
                    {g === "Male" ? "Nam" : "Nữ"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Cập nhật"
            onPress={onUpdate}
            variant="primary"
            isLoading={loading}
            disabled={loading}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: { marginBottom: 20, width: 40, height: 40, justifyContent: "center" },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", color: "#3182CE", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#718096" },
  form: { marginBottom: 24 },
  genderContainer: { marginBottom: 24 },
  genderLabel: { fontSize: 14, fontWeight: "600", color: "#1A202C", marginBottom: 12 },
  genderOptions: { flexDirection: "row", gap: 16 },
  genderOption: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  genderOptionSelected: { backgroundColor: "#EBF8FF", borderRadius: 8, paddingHorizontal: 8 },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioButtonSelected: { borderColor: "#3182CE" },
  radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3182CE" },
  genderText: { fontSize: 16, color: "#4A5568" },
  genderTextSelected: { color: "#3182CE", fontWeight: "500" },
  errorText: { color: "#E53E3E", fontSize: 13, marginTop: -8, marginBottom: 10 },
  otpContainer: { marginTop: 16 },
  pickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
  },
});

