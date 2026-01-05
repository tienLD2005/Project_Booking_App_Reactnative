import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BOOKING_COLORS } from '@/constants/booking';
import { getUpcomingBookings, getPastBookings, cancelBooking, BookingResponse } from '@/apis/bookingApi';
import { useRouter } from 'expo-router';

type TabType = 'upcoming' | 'past';

export default function BookingsScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [loading, setLoading] = useState<boolean>(true);

  const { data: upcomingBookings, isLoading: loadingUpcoming, refetch: refetchUpcoming } = useQuery({
    queryKey: ['upcomingBookings'],
    queryFn: getUpcomingBookings,
    enabled: activeTab === 'upcoming',
  });

  const { data: pastBookings, isLoading: loadingPast, refetch: refetchPast } = useQuery({
    queryKey: ['pastBookings'],
    queryFn: getPastBookings,
    enabled: activeTab === 'past',
  });


  useEffect(() => {
    if (activeTab == "upcoming") {
      refetchUpcoming();
    }
    else {
      refetchPast();
    }
  }, []);

  // Debug: Log booking data to check date format
  useEffect(() => {
    if (activeTab === 'upcoming' && upcomingBookings && upcomingBookings.length > 0) {
      console.log('Sample upcoming booking:', JSON.stringify(upcomingBookings[0], null, 2));
      console.log('checkIn:', upcomingBookings[0].checkIn, 'type:', typeof upcomingBookings[0].checkIn);
      console.log('checkOut:', upcomingBookings[0].checkOut, 'type:', typeof upcomingBookings[0].checkOut);
      console.log('createdAt:', upcomingBookings[0].createdAt, 'type:', typeof upcomingBookings[0].createdAt);
    }
    if (activeTab === 'past' && pastBookings && pastBookings.length > 0) {
      console.log('Sample past booking:', JSON.stringify(pastBookings[0], null, 2));
    }
  }, [upcomingBookings, pastBookings, activeTab]);
  const cancelBookingMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      refetchUpcoming();
      Alert.alert('Thành công', 'Đã hủy đặt phòng thành công');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.message || 'Không thể hủy đặt phòng');
    },
  });


  const handleViewDetails = (booking: BookingResponse) => {
    router.push({
      pathname: '/booking/booking-detail',
      params: { bookingId: booking.bookingId.toString() },
    });
  };

  const handleWriteReview = (booking: BookingResponse) => {
    router.push({
      pathname: '/booking/write-review',
      params: {
        roomId: booking.roomId.toString(),
        hotelName: booking.hotelName || '',
      },
    });
  };

  const handleBookAgain = (booking: BookingResponse) => {
    router.push({
      pathname: '/room-detail/[id]',
      params: { id: booking.roomId.toString() },
    });
  };

  const handleCancelBooking = (booking: BookingResponse) => {
    Alert.alert(
      'Xác nhận hủy đặt phòng',
      'Bạn có chắc chắn muốn hủy đặt phòng này không? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Hủy đặt phòng',
          style: 'destructive',
          onPress: () => {
            cancelBookingMutation.mutate(booking.bookingId);
          },
        },
      ]
    );
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

  const formatCreatedDate = (dateString: string | null | undefined) => {
    return formatDate(dateString);
  };

  const renderBookingCard = (booking: BookingResponse) => {
    const isUpcoming = activeTab === 'upcoming';

    return (
      <View key={booking.bookingId} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingDate}>
            Ngày đặt: {formatCreatedDate(booking.createdAt)}
          </Text>
          <Text style={styles.bookingCheckInOut}>
            Nhận: {formatDate(booking.checkIn)} - Trả: {formatDate(booking.checkOut)}
          </Text>
        </View>

        <View style={styles.bookingContent}>
          <ExpoImage
            source={{
              uri: booking.roomImageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
            }}
            style={styles.roomImage}
            contentFit="cover"
          />
          <View style={styles.bookingInfo}>
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(booking.rating || 0) ? 'star' : 'star-outline'}
                  size={14}
                  color={BOOKING_COLORS.RATING}
                />
              ))}
              <Text style={styles.ratingText}>
                {booking.rating?.toFixed(1) || '0.0'} ({booking.reviewCount || 0} Đánh giá)
              </Text>
            </View>
            <Text style={styles.hotelName}>{booking.hotelName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
              <Text style={styles.location}>{booking.hotelLocation || booking.hotelCity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bookingActions}>
          {isUpcoming ? (
            <>
              {booking.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelBooking(booking)}>
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.viewButton, booking.status === 'PENDING' ? {} : { flex: 1 }]}
                onPress={() => handleViewDetails(booking)}>
                <Text style={styles.viewButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {booking.status === 'CONFIRMED' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleWriteReview(booking)}>
                  <Text style={styles.cancelButtonText}>Viết đánh giá</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.viewButton, booking.status === 'CONFIRMED' ? {} : { flex: 1 }]}
                onPress={() => handleBookAgain(booking)}>
                <Text style={styles.viewButtonText}>Đặt lại</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderBookings = () => {
    const isLoading = activeTab === 'upcoming' ? loadingUpcoming : loadingPast;
    const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;



    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    if (!bookings || bookings.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="calendar-outline" size={64} color={BOOKING_COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' ? 'Chưa có đặt phòng sắp tới' : 'Chưa có đặt phòng đã qua'}
          </Text>
        </View>
      );
    }

    return <View style={styles.bookingsList}>{bookings.map(renderBookingCard)}</View>;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đặt phòng</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Sắp tới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}>
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Đã qua</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {renderBookings()}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
  },
  activeTab: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  activeTabText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingDate: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  bookingCheckInOut: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  bookingContent: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  roomImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
