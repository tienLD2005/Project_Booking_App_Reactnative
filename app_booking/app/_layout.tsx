import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
export const unstable_settings = {
  anchor: '(tabs)',
};
const queryClient = new QueryClient()

function AppNavigator(): React.ReactElement | null {
  const { user, restoring } = useAuth();
  if (restoring) return null; // or show a splash

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="hotel-detail/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="room-detail/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="room-photos/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="filter" options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="enter-otp" options={{ headerShown: false }} />
          <Stack.Screen name="enter-new-password" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="hotel-detail/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="room-detail/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="room-photos/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="filter" options={{ headerShown: false }} />
        </>
      )}

      {/* screens available for both */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="booking/select-guest" options={{ headerShown: false }} />
      <Stack.Screen name="booking/confirm-pay" options={{ headerShown: false }} />
      <Stack.Screen name="booking/banking-payment" options={{ headerShown: false }} />
      <Stack.Screen name="booking/add-card" options={{ headerShown: false }} />
      <Stack.Screen name="booking/payment-done" options={{ headerShown: false }} />
      <Stack.Screen name="booking/write-review" options={{ headerShown: false }} />
      <Stack.Screen name="booking/booking-detail" options={{ headerShown: false }} />
      <Stack.Screen name="account/edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="account/change-password" options={{ headerShown: false }} />
      <Stack.Screen name="account/terms-conditions" options={{ headerShown: false }} />
      <Stack.Screen name="account/privacy-policy" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
