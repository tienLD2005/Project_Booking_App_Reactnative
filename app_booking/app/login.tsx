import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Button from "../components/Button";
import Input from "../components/Input";
import axiosInstance from "../utils/axiosInstance";
import { getErrorMessage } from "../utils/errorHandler";
import { useAuth } from "@/context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google OAuth configuration
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Cần thay bằng Google Client ID thật
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri(),
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    }
  );

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSignIn(response.authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken?: string) => {
    if (!accessToken) return;

    setGoogleLoading(true);
    try {
      // Gọi API backend để xử lý Google Sign-In
      const res = await axiosInstance.post("auth/google", {
        accessToken,
      });

      const data = res?.data;
      if (data?.token && data?.refreshToken) {
        await AsyncStorage.setItem("accessToken", data.token);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
        await AsyncStorage.setItem(
          "userProfile",
          JSON.stringify({
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar || "",
          })
        );

        Alert.alert("Thành công", "Đăng nhập bằng Google thành công!");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Lỗi", "Không nhận được token từ server");
      }
    } catch (e: any) {
      console.log("Google Sign-In error:", e?.response?.data);
      const errorMessage = getErrorMessage(e);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };
  const onLogin = async () => {
    // Validate email
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email)) {
      Alert.alert("Lỗi", "Email phải có định dạng @gmail.com");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/login", {
        email: email,
        password: password,
      });

      const data = res?.data;
      if (!data) throw new Error("No data");

      // Trường hợp 403: tài khoản chưa kích hoạt
      if (res.status === 403) {
        Alert.alert(
          "Tài khoản chưa kích hoạt",
          data.message || "Tài khoản chưa được kích hoạt. Vui lòng hoàn tất đăng ký."
        );
        return;
      }

      const accessToken = data.token;
      const refreshToken = data.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Không nhận được token từ server");
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      const profile = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
      };
      await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      await signIn(profile);

      Alert.alert("Thành công", "Đăng nhập thành công!");
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("Login error:", e?.response?.data);
      const errorMessage = getErrorMessage(e);
      Alert.alert("Đăng nhập thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.logoContainer}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LG</Text>
          </View>
          <Text style={styles.logoTitle}>live Green</Text>
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={styles.header}
        >
          <Text style={styles.title}>Đăng nhập ngay!</Text>
          <Text style={styles.subtitle}>Nhập thông tin của bạn bên dưới</Text>
        </Animated.View>

        {/* Social Login Buttons */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.socialContainer}
        >
          <View style={styles.socialButtonWrapper}>
            <Button
              title="Google"
              onPress={() => promptAsync()}
              variant="outline"
              icon="logo-google"
              iconPosition="left"
              fullWidth={true}
              isLoading={googleLoading}
              disabled={googleLoading || !request}
            />
          </View>
          <View style={styles.socialSpacer} />
          <View style={styles.socialButtonWrapper}>
            <Button
              title="Facebook"
              onPress={() => { }}
              variant="outline"
              icon="logo-facebook"
              iconPosition="left"
              fullWidth={true}
            />
          </View>
        </Animated.View>

        {/* Separator */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600).springify()}
          style={styles.separatorContainer}
        >
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Hoặc đăng nhập bằng</Text>
          <View style={styles.separatorLine} />
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          style={styles.form}
        >
          <Input
            label="Địa chỉ email"
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

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

          <Text
            style={styles.forgotPassword}
            onPress={() => router.push("/forgot-password")}
          >
            Quên mật khẩu?
          </Text>

          <Button
            title="Đăng nhập"
            onPress={onLogin}
            variant="primary"
            isLoading={loading}
            disabled={!isFormValid}
          />
        </Animated.View>

        {/* Register Link */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(600).springify()}
          style={styles.registerContainer}
        >
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/register")}
          >
            Đăng ký ngay
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5B6CFF",
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
    color: "#5B6CFF",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B6CFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
  },
  socialContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  socialButtonWrapper: {
    flex: 1,
  },
  socialSpacer: {
    width: 12,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#718096",
  },
  form: {
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#5B6CFF",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: "#718096",
  },
  registerLink: {
    fontSize: 14,
    color: "#5B6CFF",
    fontWeight: "600",
  },
});
