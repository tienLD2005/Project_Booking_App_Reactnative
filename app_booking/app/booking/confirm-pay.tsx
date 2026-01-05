import { BOOKING_COLORS } from '@/constants/booking';
import { getRoomById, RoomResponse } from '@/apis/roomApi';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ConfirmPayScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'banking' | 'card'>('card');

  const defaultCheckIn = params.checkIn ? new Date(params.checkIn as string) : new Date();
  const defaultCheckOut = params.checkOut ? new Date(params.checkOut as string) : new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [adults, setAdults] = useState<number>(parseInt(params.adults as string) || 2);
  const [children, setChildren] = useState<number>(parseInt(params.children as string) || 0);
  const [infants, setInfants] = useState<number>(parseInt(params.infants as string) || 0);
  const [nameRoom, setNameRoom] = useState<string>(params.roomName as string || '');
  const [hotelName, setHotelName] = useState<string>(params.hotelName as string || '');
  const [checkIn, setCheckIn] = useState<Date>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<Date>(defaultCheckOut);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  // Get room price from params
  const roomPrice = parseFloat(params.roomPrice as string) || 0;

  // Calculate number of nights from checkIn and checkOut
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate total price: room price * number of guests * number of nights
  const totalGuests = adults + children; // infants don't count
  const subtotal = roomPrice * totalGuests * nights;
  const discount = 0; // No discount for now
  const taxes = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal - discount + taxes;

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePayNow = () => {
    const bookingParams = {
      ...params,
      nameRoom: params.roomName || '',
      hotelName: params.hotelName || '',
      roomId: params.roomId || '',
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      totalPrice: total.toFixed(2),
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString(),
    };

    if (paymentMethod === 'cash') {
      // Thanh toán tiền mặt - chuyển thẳng đến payment done
      router.push({
        pathname: '/booking/payment-done',
        params: {
          ...bookingParams,
          paymentMethod: 'cash',
        },
      });
    } else if (paymentMethod === 'banking') {
      // Thanh toán banking - chuyển đến trang QR code
      router.push({
        pathname: '/booking/banking-payment',
        params: {
          ...bookingParams,
          paymentMethod: 'banking',
        },
      });
    } else if (paymentMethod === 'card') {
      router.push({
        pathname: '/booking/add-card',
        params: {
          ...bookingParams,
          paymentMethod: 'card',
        },
      });
    }
  };


  const [room, setRoom] = useState<RoomResponse | null>(null);

  useEffect(() => {
    if (params.roomId) {
      getRoomById(parseInt(params.roomId as string)).then(data => {
        setRoom(data);
        if (data.hotelName) setHotelName(data.hotelName);
      }).catch(err => console.error(err));
    }
  }, [params.roomId]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận & Thanh toán</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>

        {/* Property Details Card */}
        <View style={styles.propertyCard}>
          <ExpoImage
            source={{ uri: room?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200' }}
            style={styles.propertyImage}
            contentFit="cover"
          />
          <View style={styles.propertyInfo}>
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(room?.rating || 0) ? "star" : "star-outline"}
                  size={14}
                  color={BOOKING_COLORS.RATING}
                />
              ))}
              <Text style={styles.ratingText}>
                {room?.rating?.toFixed(1) || '0.0'} ({room?.reviewCount || 0} Đánh giá)
              </Text>
            </View>
            <Text style={styles.propertyName}>{nameRoom}</Text>
            <Text style={styles.propertyLocation}>{hotelName}</Text>
            <Text style={styles.propertySummary}>
              {adults} người lớn | {children} trẻ em | {infants} trẻ sơ sinh
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết đặt phòng</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Ngày nhận phòng</Text>
              <Text style={styles.detailValue}>
                {formatDisplayDate(checkIn)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowCheckInPicker(true)}>
              <Ionicons name="pencil" size={20} color={BOOKING_COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Ngày trả phòng</Text>
              <Text style={styles.detailValue}>
                {formatDisplayDate(checkOut)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowCheckOutPicker(true)}>
              <Ionicons name="pencil" size={20} color={BOOKING_COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
          {showCheckInPicker && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Chọn ngày nhận phòng</Text>
              <DateTimePicker
                value={checkIn}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                textColor={Platform.OS === 'ios' ? BOOKING_COLORS.TEXT_PRIMARY : undefined}
                onChange={(event, selectedDate) => {
                  setShowCheckInPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setCheckIn(selectedDate);
                    if (checkOut <= selectedDate) {
                      const newCheckOut = new Date(selectedDate);
                      newCheckOut.setDate(newCheckOut.getDate() + 1);
                      setCheckOut(newCheckOut);
                    }
                  }
                }}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowCheckInPicker(false)}>
                  <Text style={styles.pickerButtonText}>Xong</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {showCheckOutPicker && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Chọn ngày trả phòng</Text>
              <DateTimePicker
                value={checkOut}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)}
                textColor={Platform.OS === 'ios' ? BOOKING_COLORS.TEXT_PRIMARY : undefined}
                onChange={(event, selectedDate) => {
                  setShowCheckOutPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setCheckOut(selectedDate);
                  }
                }}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowCheckOutPicker(false)}>
                  <Text style={styles.pickerButtonText}>Xong</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Số khách</Text>
              <Text style={styles.detailValue}>
                {adults} người lớn{children > 0 ? ` | ${children} trẻ em` : ''}{infants > 0 ? ` | ${infants} trẻ sơ sinh` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {
              router.push({
                pathname: '/booking/select-guest',
                params: {
                  ...params,
                  checkIn: formatDate(checkIn),
                  checkOut: formatDate(checkOut),
                  adults: adults.toString(),
                  children: children.toString(),
                  infants: infants.toString(),
                },
              });
            }}>
              <Ionicons name="pencil" size={20} color={BOOKING_COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          {/* Cash Payment */}
          <TouchableOpacity
            style={[styles.paymentMethodOption, paymentMethod === 'cash' && styles.paymentMethodOptionSelected]}
            onPress={() => setPaymentMethod('cash')}>
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodLeft}>
                <View style={[styles.paymentMethodIcon, paymentMethod === 'cash' && styles.paymentMethodIconSelected]}>
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={paymentMethod === 'cash' ? BOOKING_COLORS.BACKGROUND : BOOKING_COLORS.TEXT_PRIMARY}
                  />
                </View>
                <View style={styles.paymentMethodText}>
                  <Text style={[styles.paymentMethodLabel, paymentMethod === 'cash' && styles.paymentMethodLabelSelected]}>
                    Thanh toán bằng tiền mặt
                  </Text>
                  <Text style={styles.paymentMethodSubtitle}>Thanh toán khi nhận phòng</Text>
                </View>
              </View>
              <View style={[styles.radioButton, paymentMethod === 'cash' && styles.radioButtonSelected]}>
                {paymentMethod === 'cash' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Banking Payment */}
          <TouchableOpacity
            style={[styles.paymentMethodOption, paymentMethod === 'banking' && styles.paymentMethodOptionSelected]}
            onPress={() => setPaymentMethod('banking')}>
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodLeft}>
                <View style={[styles.paymentMethodIcon, paymentMethod === 'banking' && styles.paymentMethodIconSelected]}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={24}
                    color={paymentMethod === 'banking' ? BOOKING_COLORS.BACKGROUND : BOOKING_COLORS.TEXT_PRIMARY}
                  />
                </View>
                <View style={styles.paymentMethodText}>
                  <Text style={[styles.paymentMethodLabel, paymentMethod === 'banking' && styles.paymentMethodLabelSelected]}>
                    Thanh toán online (Banking)
                  </Text>
                  <Text style={styles.paymentMethodSubtitle}>Quét mã QR để thanh toán</Text>
                </View>
              </View>
              <View style={[styles.radioButton, paymentMethod === 'banking' && styles.radioButtonSelected]}>
                {paymentMethod === 'banking' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Card Payment */}
          <TouchableOpacity
            style={[styles.paymentMethodOption, paymentMethod === 'card' && styles.paymentMethodOptionSelected]}
            onPress={() => setPaymentMethod('card')}>
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodLeft}>
                <View style={[styles.paymentMethodIcon, paymentMethod === 'card' && styles.paymentMethodIconSelected]}>
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={paymentMethod === 'card' ? BOOKING_COLORS.BACKGROUND : BOOKING_COLORS.TEXT_PRIMARY}
                  />
                </View>
                <View style={styles.paymentMethodText}>
                  <Text style={[styles.paymentMethodLabel, paymentMethod === 'card' && styles.paymentMethodLabelSelected]}>
                    Thanh toán qua thẻ
                  </Text>
                  <Text style={styles.paymentMethodSubtitle}>Visa, Mastercard, JCB</Text>
                </View>
              </View>
              <View style={[styles.radioButton, paymentMethod === 'card' && styles.radioButtonSelected]}>
                {paymentMethod === 'card' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết giá</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(roomPrice)} x {totalGuests} khách x {nights} đêm</Text>
            <Text style={styles.priceValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={[styles.priceValue, styles.discountValue]}>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(discount)}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Thuế và phí</Text>
            <Text style={styles.priceValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(taxes)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <Text style={styles.payButtonText}>Thanh toán ngay</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  propertySummary: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  paymentMethodOption: {
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  paymentMethodOptionSelected: {
    borderColor: BOOKING_COLORS.PRIMARY,
    backgroundColor: BOOKING_COLORS.PRIMARY + '10',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodIconSelected: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  paymentMethodLabelSelected: {
    color: BOOKING_COLORS.PRIMARY,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: BOOKING_COLORS.PRIMARY,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  discountValue: {
    color: '#10B981',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRIMARY,
  },
  pickerContainer: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  pickerButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  payButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});

