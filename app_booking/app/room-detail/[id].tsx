import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { BOOKING_COLORS } from '@/constants/booking';
import { getRoomById, RoomResponse } from '@/apis/roomApi';
import { getReviewsByRoomId, ReviewResponse } from '@/apis/reviewApi';
import { checkIsFavorite, addFavorite, removeFavoriteByRoomId } from '@/apis/favoriteApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';

const generalAmenities = [
  { name: 'TIVI LED 48 inch', icon: 'tv-outline' as const },
  { name: 'Dép đi trong phòng', icon: 'footsteps-outline' as const },
  { name: 'Bộ kim chỉ', icon: 'construct-outline' as const },
  { name: 'Xi đánh giày', icon: 'brush-outline' as const },
  { name: 'Két sắt', icon: 'lock-closed-outline' as const },
  { name: 'Đèn pin', icon: 'flashlight-outline' as const },
  { name: 'Bàn ủi và bàn để ủi quần áo', icon: 'shirt-outline' as const },
  { name: 'Cân', icon: 'scale-outline' as const },
  { name: 'Điện thoại', icon: 'call-outline' as const },
  { name: 'Bàn làm việc văn phòng', icon: 'desktop-outline' as const },
  { name: 'Túi mua hàng', icon: 'bag-outline' as const },
  { name: 'Quầy bar nhỏ', icon: 'wine-outline' as const },
  { name: 'Cái xỏ giày', icon: 'footsteps-outline' as const },
  { name: 'Bình trà', icon: 'cafe-outline' as const },
];

const bathroomAmenities = [
  { name: 'Bàn chải đánh răng và kem đánh răng dùng một lần', icon: 'brush-outline' as const },
  { name: 'Dao cạo râu', icon: 'cut-outline' as const },
  { name: 'Muối tắm', icon: 'water-outline' as const },
  { name: 'Áo choàng tắm', icon: 'shirt-outline' as const },
  { name: 'Máy sấy tóc', icon: 'flash-outline' as const },
  { name: 'Sữa tắm', icon: 'water-outline' as const },
];

export default function RoomDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();
  const roomId = parseInt(id || '0', 10);

  const { data: isFavorite = false } = useQuery({
    queryKey: ['favorite', roomId],
    queryFn: () => checkIsFavorite(roomId),
    enabled: !isNaN(roomId) && roomId > 0,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', roomId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavoriteByRoomId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', roomId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  useEffect(() => {
    loadRoomDetail();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // refresh room detail and reviews when screen is focused (e.g., after writing a review)
      loadRoomDetail();
    }, [id])
  );

  const loadRoomDetail = async () => {
    try {
      setLoading(true);
      const roomId = parseInt(id || '0', 10);
      if (isNaN(roomId)) {
        Alert.alert('Lỗi', 'ID phòng không hợp lệ');
        router.back();
        return;
      }
      const data = await getRoomById(roomId);
      setRoom(data);

      // Load reviews for this room
      try {
        const reviewsData = await getReviewsByRoomId(roomId);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Load reviews error:', error);
      }
    } catch (error) {
      console.error('Load room detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatReviewDate = (value?: any) => {
    if (!value) return '';

    if (Array.isArray(value)) {
      const [y, m, d] = value;
      return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
    }

    if (typeof value === 'string') {
      const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, y, m, d] = match;
        return `${d}-${m}-${y}`;
      }
    }

    const num =
      typeof value === 'string' && /^[0-9]+$/.test(value)
        ? parseInt(value, 10)
        : value;

    if (typeof num === 'number') {
      const date = new Date(num.toString().length === 10 ? num * 1000 : num);
      if (!isNaN(date.getTime())) {
        return `${String(date.getDate()).padStart(2, '0')}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${date.getFullYear()}`;
      }
    }

    return '';
  };


  if (loading || !room) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
        <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerButton, styles.headerButtonTransparent]}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (isFavorite) {
              removeFavoriteMutation.mutate(roomId);
            } else {
              addFavoriteMutation.mutate(roomId);
            }
          }}
          style={[styles.headerButton, styles.headerButtonTransparent]}
          disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? BOOKING_COLORS.HEART : BOOKING_COLORS.BACKGROUND}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Main Image */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (room.imageUrls && room.imageUrls.length > 0) {
              router.push(`/room-photos/${id}`);
            }
          }}>
          <View style={[styles.imageContainer, { width }]}>
            <ExpoImage
              source={{
                uri:
                  room.imageUrls && room.imageUrls.length > 0
                    ? room.imageUrls[0]
                    : "https://via.placeholder.com/400x200?text=No+Image",
              }}
              style={styles.mainImage}
              contentFit="cover"
              transition={200}
            />
            {room.imageUrls && room.imageUrls.length > 0 && (
              <View style={styles.imageOverlay}>
                <View style={styles.imageOverlayContent}>
                  <Ionicons name="images-outline" size={20} color={BOOKING_COLORS.BACKGROUND} />
                  <Text style={styles.imageCountText}>{room.imageUrls.length} ảnh</Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>


        {/* Room Info */}
        <View style={styles.content}>
          <Text style={styles.roomName}>{room.roomType}</Text>

          {/* Rating */}
          {room.rating && room.rating > 0 && (
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(room.rating || 0) ? 'star' : 'star-outline'}
                  size={16}
                  color={BOOKING_COLORS.RATING}
                />
              ))}
              <Text style={styles.ratingText}>
                {room.rating.toFixed(1)} ({room.reviewCount || 0} đánh giá)
              </Text>
            </View>
          )}

          <View style={styles.locationRow}>
            <Ionicons name="business-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.location}>
              {room.hotelName || 'Thuộc khách sạn không xác định'}
            </Text>
          </View>

          {/* Description */}
          {room.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.overviewText}>{room.description}</Text>
            </View>
          )}

          {/* Photos */}
          {room.imageUrls && room.imageUrls.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hình ảnh</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/room-photos/${id}`)}
                  style={styles.viewAllButton}>
                  <Text style={styles.viewAllButtonText}>Xem tất cả</Text>
                  <Ionicons name="chevron-forward" size={16} color={BOOKING_COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={room.imageUrls.slice(0, 5)}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push(`/room-photos/${id}`)}
                    style={styles.photoThumbnail}>
                    <ExpoImage
                      source={{ uri: item }}
                      style={styles.photoImage}
                      contentFit="cover"
                    />
                    {index === 4 && room.imageUrls && room.imageUrls.length > 5 && (
                      <View style={styles.moreImagesOverlay}>
                        <Text style={styles.moreImagesText}>+{room.imageUrls.length - 5}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
              />
            </View>
          )}

          {/* Room Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết phòng</Text>
            <Text style={styles.featureText}>Sức chứa: {room.capacity} người</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích</Text>

            {/* General Amenities */}
            <View style={styles.amenitiesGroup}>
              <Text style={styles.amenitiesGroupTitle}>Tiện nghi chung</Text>
              <View style={styles.amenitiesGrid}>
                {generalAmenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name={amenity.icon} size={20} color={BOOKING_COLORS.PRIMARY} />
                    <Text style={styles.amenityText}>{amenity.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bathroom Amenities */}
            <View style={styles.amenitiesGroup}>
              <Text style={styles.amenitiesGroupTitle}>Tiện nghi phòng tắm</Text>
              <View style={styles.amenitiesGrid}>
                {bathroomAmenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name={amenity.icon} size={20} color={BOOKING_COLORS.PRIMARY} />
                    <Text style={styles.amenityText}>{amenity.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>
                Đánh giá {reviews.length > 0 && `(${reviews.length})`}
              </Text>
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => {
                  router.push({
                    pathname: '/booking/write-review',
                    params: {
                      roomId: id || '',
                      hotelName: room.hotelName || '',
                    },
                  });
                }}>
                <Ionicons name="create-outline" size={20} color={BOOKING_COLORS.PRIMARY} />
                <Text style={styles.writeReviewButtonText}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>
            {reviews.length > 0 ? (
              <>
                {reviews.slice(0, 5).map((review) => (
                  <View key={review.reviewId} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUserInfo}>
                        <Text style={styles.reviewUserName}>{review.userName}</Text>
                        <View style={styles.reviewRating}>
                          {[...Array(5)].map((_, i) => (
                            <Ionicons
                              key={i}
                              name={i < review.rating ? 'star' : 'star-outline'}
                              size={12}
                              color={BOOKING_COLORS.RATING}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>
                        {formatReviewDate(review.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                ))}
                {reviews.length > 5 && (
                  <TouchableOpacity
                    style={styles.viewAllReviews}
                    onPress={() => {
                      // Navigate to reviews screen if needed
                    }}>
                    <Text style={styles.viewAllReviewsText}>
                      Xem tất cả {reviews.length} đánh giá
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="chatbubble-outline" size={48} color={BOOKING_COLORS.TEXT_SECONDARY} />
                <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
                <Text style={styles.noReviewsSubtext}>Hãy là người đầu tiên đánh giá phòng này</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.priceContainer}>
          {room.price && room.price > 0 ? (
            <>
              <Text style={styles.priceLabel}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
              </Text>
              <Text style={styles.priceSubLabel}>/đêm</Text>
            </>
          ) : (
            <Text style={styles.priceLabel}>Liên hệ để biết giá</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.selectDateButton}
          onPress={() => {
            router.push({
              pathname: '/booking/select-guest',
              params: {
                roomId: id,
                roomName: room.roomType,
                roomPrice: room.price?.toString() || '0',
              },
            });
          }}>
          <Text style={styles.selectDateText}>Đặt phòng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BOOKING_COLORS.BACKGROUND },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, zIndex: 10,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerButtonTransparent: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 20 },
  scrollView: { flex: 1 },
  imageContainer: { height: 300, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageCountText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontSize: 14,
    fontWeight: '600',
  },
  content: { padding: 16 },
  roomName: { fontSize: 24, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24 },
  location: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, marginBottom: 12 },
  overviewText: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY, lineHeight: 24 },
  photosList: { gap: 12 },
  photoThumbnail: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoImage: { width: '100%', height: '100%' },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  featureText: { fontSize: 16, color: BOOKING_COLORS.TEXT_PRIMARY, lineHeight: 24, marginBottom: 8 },
  amenitiesGroup: {
    marginBottom: 24,
  },
  amenitiesGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    gap: 8,
  },
  amenityText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    flex: 1,
    flexWrap: 'wrap',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.PRIMARY + '15',
    borderWidth: 1,
    borderColor: BOOKING_COLORS.PRIMARY + '30',
  },
  writeReviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  reviewComment: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  viewAllReviews: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllReviewsText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  noReviewsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginTop: 12,
    marginBottom: 4,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopWidth: 1, borderTopColor: BOOKING_COLORS.BORDER,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceLabel: { fontSize: 20, fontWeight: '700', color: BOOKING_COLORS.PRICE },
  priceSubLabel: { fontSize: 14, fontWeight: '500', color: BOOKING_COLORS.TEXT_SECONDARY },
  selectDateButton: { backgroundColor: BOOKING_COLORS.PRIMARY, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  selectDateText: { fontSize: 16, fontWeight: '600', color: BOOKING_COLORS.BACKGROUND },
});
