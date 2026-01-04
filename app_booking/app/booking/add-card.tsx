import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BOOKING_COLORS } from '@/constants/booking';
import { createBooking, confirmBooking, BookingRequest } from '@/apis/bookingApi';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AddCardScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolderName, setCardHolderName] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 6);
    }
    return cleaned;
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    if (formatted.length <= 7) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      setCvv(cleaned);
    }
  };

  const validateCard = (): boolean => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Lỗi', 'Vui lòng nhập số thẻ hợp lệ (16 số)');
      return false;
    }
    if (!cardHolderName || cardHolderName.trim().length < 3) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ thẻ');
      return false;
    }
    if (!expiryDate || expiryDate.length < 7) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Lỗi', 'Vui lòng nhập CVV');
      return false;
    }
    return true;
  };

  const handleAddCard = async () => {
    if (!validateCard()) {
      return;
    }

    setIsProcessing(true);
    try {
      // Create booking
      if (params.roomId && params.checkIn && params.checkOut) {
        const bookingData: BookingRequest = {
          roomId: parseInt(params.roomId as string),
          checkIn: params.checkIn as string,
          checkOut: params.checkOut as string,
          adultsCount: parseInt(params.adults as string) || 2,
          childrenCount: parseInt(params.children as string) || 0,
          infantsCount: parseInt(params.infants as string) || 0,
        };
        const booking = await createBooking(bookingData);
        
        // Confirm booking after payment (card payment = confirmed)
        if (booking.bookingId) {
          await confirmBooking(booking.bookingId);
        }
      }

      // Navigate to payment done
      router.push({
        pathname: '/booking/payment-done',
        params: {
          ...params,
          paymentMethod: 'card',
        },
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      const errorMessage = getErrorMessage(error);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' }}
        style={styles.backgroundImage}
        blurRadius={20}>
        <View style={styles.blurOverlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.BACKGROUND} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thanh toán thẻ</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.title}>Thông tin thẻ thanh toán</Text>

            {/* Card Type Icons */}
            <View style={styles.cardTypes}>
              <View style={styles.cardTypeIcon}>
                <Ionicons name="card" size={32} color="#1A1F71" />
                <Text style={styles.cardTypeText}>Visa</Text>
              </View>
              <View style={styles.cardTypeIcon}>
                <Ionicons name="card" size={32} color="#EB001B" />
                <Text style={styles.cardTypeText}>Mastercard</Text>
              </View>
              <View style={styles.cardTypeIcon}>
                <Ionicons name="card" size={32} color="#F7931E" />
                <Text style={styles.cardTypeText}>JCB</Text>
              </View>
            </View>

            {/* Card Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số thẻ</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            {/* Card Holder Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
              <TextInput
                style={styles.input}
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder="NGUYEN VAN A"
                placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                autoCapitalize="characters"
              />
            </View>

            {/* Expiry Date and CVV */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Ngày hết hạn</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  placeholder="MM/YYYY"
                  placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                  keyboardType="numeric"
                  maxLength={7}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="***"
                  placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.addButton, isProcessing && styles.addButtonDisabled]} 
              onPress={handleAddCard}
              disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator color={BOOKING_COLORS.BACKGROUND} />
              ) : (
                <Text style={styles.addButtonText}>Thanh toán</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  contentCard: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 24,
  },
  cardTypes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
  },
  cardTypeIcon: {
    alignItems: 'center',
    gap: 8,
  },
  cardTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});

