import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { BOOKING_COLORS } from '@/constants/booking';
import { createBooking, confirmBooking, BookingRequest } from '@/apis/bookingApi';
import { getErrorMessage } from '@/utils/errorHandler';

export default function BankingPaymentScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  
  const totalPrice = parseFloat(params.totalPrice as string) || 0;
  
  // Generate QR code data - in real app, this would come from payment gateway API
  const qrData = JSON.stringify({
    amount: totalPrice,
    orderId: `BOOKING_${Date.now()}`,
    merchantId: 'BOOKING_HOTEL',
    description: 'Thanh toan dat phong',
  });

  // Simulate payment processing
  useEffect(() => {
    if (paymentStatus === 'pending') {
      // In real app, this would poll the payment gateway API
      // For demo, we'll simulate a successful payment after 5 seconds
      const timer = setTimeout(() => {
        // Simulate payment success
        handlePaymentSuccess();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handlePaymentSuccess = async () => {
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
        console.log('Booking created:', booking);
        
        // Confirm booking after payment (banking payment = confirmed)
        if (booking && booking.bookingId) {
          console.log('Confirming booking with ID:', booking.bookingId);
          try {
            await confirmBooking(booking.bookingId);
            console.log('Xác nhận đặt phòng thành công');
          } catch (confirmError: any) {
            console.error('Error confirming booking:', confirmError);
            // Don't fail the whole payment if confirm fails, but log it
            const errorMessage = getErrorMessage(confirmError);
            Alert.alert('Cảnh báo', `Đặt phòng đã được tạo nhưng có lỗi khi xác nhận: ${errorMessage}. Vui lòng liên hệ hỗ trợ.`);
          }
        }
      }

      setPaymentStatus('success');
      setIsProcessing(false);
      
      // Navigate to payment done screen
      setTimeout(() => {
        router.push({
          pathname: '/booking/payment-done',
          params: {
            ...params,
            paymentMethod: 'banking',
          },
        });
      }, 1500);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      const errorMessage = getErrorMessage(error);
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Hủy thanh toán',
      'Bạn có chắc chắn muốn hủy thanh toán?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán Banking</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Instruction Banner */}
        <View style={styles.instructionBanner}>
          <Ionicons name="information-circle-outline" size={20} color={BOOKING_COLORS.PRIMARY} />
          <Text style={styles.instructionText}>
            Quý khách vui lòng không tắt trình duyệt cho đến khi nhận được kết quả giao dịch trên website. Xin cảm ơn!
          </Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Ứng dụng mobile quét mã</Text>
          
          {/* VNPAYQR Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBrackets}>
              <Text style={styles.logoText}>VNPAYQR</Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            {paymentStatus === 'pending' ? (
              <QRCode
                value={qrData}
                size={250}
                color={BOOKING_COLORS.TEXT_PRIMARY}
                backgroundColor={BOOKING_COLORS.BACKGROUND}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                {paymentStatus === 'success' ? (
                  <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                ) : (
                  <Ionicons name="close-circle" size={80} color="#EF4444" />
                )}
              </View>
            )}
          </View>

          <Text style={styles.scanText}>Quét mã để thanh toán</Text>
          <Text style={styles.paymentTypeText}>Thanh toán trực tuyến</Text>

          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
            <Text style={styles.amountValue}>{formatCurrency(totalPrice)}</Text>
          </View>

          {/* Help Link */}
          <TouchableOpacity style={styles.helpLink}>
            <Text style={styles.helpLinkText}>Hướng dẫn thanh toán?</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Hoặc</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>HỦY</Text>
          </TouchableOpacity>
        </View>

        {/* Supported Banks Section */}
        <View style={styles.banksSection}>
          <Text style={styles.banksTitle}>Sử dụng Ứng dụng hỗ trợ VNPAYQR</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.banksScroll}>
            <View style={styles.banksGrid}>
              {[
                'Vietcombank', 'AGRIBANK', 'BIDV', 'VietinBank', 'VI VNPAY',
                'VCBPAY', 'SCB', 'ABBANK', 'TVB', 'VIETBANK',
                'EXIMBANK', 'OCEAN BANK', 'NAM A BANK', 'BAOVIET Bank', 'HDBank',
                'SAIGONBANK', 'KIENLONG BANK', 'BIDCO', 'VIET A BANK', 'MSB',
                'SHB', 'VIB', 'TPBank', 'MB'
              ].map((bank, index) => (
                <View key={index} style={styles.bankItem}>
                  <View style={styles.bankIcon}>
                    <Ionicons name="logo-ionic" size={24} color={BOOKING_COLORS.PRIMARY} />
                  </View>
                  <Text style={styles.bankName}>{bank}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
            <Text style={styles.processingText}>Đang xử lý thanh toán...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
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
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E6F4FE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    lineHeight: 18,
  },
  qrSection: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBrackets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRIMARY,
    letterSpacing: 2,
  },
  qrContainer: {
    width: 250,
    height: 250,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
  },
  qrPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
    marginBottom: 4,
  },
  paymentTypeText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 24,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  helpLink: {
    marginBottom: 24,
  },
  helpLinkText: {
    fontSize: 14,
    color: BOOKING_COLORS.PRIMARY,
    textDecorationLine: 'underline',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: BOOKING_COLORS.BORDER,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  banksSection: {
    marginTop: 8,
  },
  banksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  banksScroll: {
    marginHorizontal: -16,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  bankItem: {
    width: 80,
    alignItems: 'center',
    marginBottom: 16,
  },
  bankIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
  },
  bankName: {
    fontSize: 10,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 14,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  processingText: {
    marginTop: 12,
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
});
