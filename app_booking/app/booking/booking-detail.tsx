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
import { Image as ExpoImage } from 'expo-image';
import { BOOKING_COLORS } from '@/constants/booking';
import { getBookingById, BookingResponse } from '@/apis/bookingApi';

export default function BookingDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const bookingId = parseInt(params.bookingId as string) || 0;

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải thông tin booking');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue: string | null | undefined | any) => {
    // Handle null, undefined, or empty values
    if (dateValue === null || dateValue === undefined || dateValue === '') {
      return 'Chưa có ngày';
    }
    
    try {
      // Handle if it's already a Date object
      if (dateValue instanceof Date) {
        if (isNaN(dateValue.getTime())) {
          return 'Ngày không hợp lệ';
        }
        return dateValue.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }
      
      // Handle array format [2025, 11, 10] - Jackson sometimes serializes LocalDate as array
      if (Array.isArray(dateValue)) {
        if (dateValue.length >= 3) {
          const year = parseInt(dateValue[0], 10);
          const month = parseInt(dateValue[1], 10) - 1; // JavaScript months are 0-indexed
          const day = parseInt(dateValue[2], 10);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });
          }
        }
        return 'Ngày không hợp lệ';
      }
      
      // Convert to string
      let dateStr: string;
      if (typeof dateValue === 'string') {
        dateStr = dateValue.trim();
      } else {
        dateStr = String(dateValue).trim();
      }
      
      // Handle string that looks like array: "[2025, 11, 10]"
      if (dateStr.startsWith('[') && dateStr.endsWith(']')) {
        try {
          const dateArray = JSON.parse(dateStr);
          if (Array.isArray(dateArray) && dateArray.length >= 3) {
            const year = parseInt(dateArray[0], 10);
            const month = parseInt(dateArray[1], 10) - 1;
            const day = parseInt(dateArray[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });
            }
          }
        } catch (e) {
          // Continue with normal parsing
        }
      }
      
      // Remove milliseconds and timezone if present
      if (dateStr.includes('.')) {
        dateStr = dateStr.split('.')[0];
      }
      if (dateStr.includes('+')) {
        dateStr = dateStr.split('+')[0];
      }
      if (dateStr.includes('Z') && !dateStr.includes('T')) {
        dateStr = dateStr.replace('Z', '');
      }
      
      let date: Date;
      
      if (dateStr.includes('T')) {
        // LocalDateTime format: "2025-11-10T02:47:45"
        date = new Date(dateStr);
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // LocalDate format: "2025-11-10" - parse as local date
        const parts = dateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      } else if (dateStr.match(/^\d{4}\/\d{2}\/\d{2}/)) {
        // Alternative format: "2025/11/10"
        const parts = dateStr.split('/');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      } else {
        // Try to parse as-is
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateValue, 'type:', typeof dateValue);
        return 'Ngày không hợp lệ';
      }
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', dateValue, 'type:', typeof dateValue, error);
      return 'Ngày không hợp lệ';
    }
  };

  if (loading || !booking) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
        <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt phòng</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Booking Image */}
        <ExpoImage
          source={{
            uri: booking.roomImageUrl || 'https://via.placeholder.com/400x200?text=No+Image',
          }}
          style={styles.bookingImage}
          contentFit="cover"
        />

        {/* Booking Info */}
        <View style={styles.content}>
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(booking.rating || 0) ? 'star' : 'star-outline'}
                size={16}
                color={BOOKING_COLORS.RATING}
              />
            ))}
            <Text style={styles.ratingText}>
              {booking.rating?.toFixed(1) || '0.0'} ({booking.reviewCount || 0} đánh giá)
            </Text>
          </View>

          <Text style={styles.hotelName}>{booking.hotelName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.location}>{booking.hotelLocation || booking.hotelCity}</Text>
          </View>

          {/* Booking Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Chi tiết đặt phòng</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày nhận phòng</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkIn)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày trả phòng</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkOut)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số khách</Text>
              <Text style={styles.detailValue}>
                {booking.adultsCount} người lớn, {booking.childrenCount} trẻ em, {booking.infantsCount} trẻ sơ sinh
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái</Text>
              <Text
                style={[
                  styles.detailValue,
                  booking.status === 'CONFIRMED' && styles.statusConfirmed,
                  booking.status === 'CANCELLED' && styles.statusCancelled,
                ]}>
                {booking.status === 'PENDING' ? 'Đang chờ' : booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã hủy'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tổng tiền</Text>
              <Text style={[styles.detailValue, styles.priceValue]}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(booking.totalPrice)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
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
    paddingBottom: 20,
  },
  bookingImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  detailsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  detailLabel: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  statusConfirmed: {
    color: '#10B981',
  },
  statusCancelled: {
    color: '#EF4444',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRIMARY,
  },
});

