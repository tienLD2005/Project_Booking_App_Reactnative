import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Hotel } from '@/constants/booking';
import { BOOKING_COLORS } from '@/constants/booking';

interface HotelCardProps {
  hotel: Hotel;
  variant?: 'horizontal' | 'vertical';
  onPress?: () => void;
  onFavoritePress?: () => void;
  isBooked?: boolean; // true if there is an active booking (PENDING/CONFIRMED)
  bookingStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | null;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  variant = 'vertical',
  onPress,
  onFavoritePress,
  isBooked = false,
  bookingStatus = null,
}) => {
  const isHorizontal = variant === 'horizontal';

  return (
    <TouchableOpacity
      style={[styles.card, isHorizontal && styles.cardHorizontal, isBooked && styles.cardDisabled]}
      onPress={isBooked ? undefined : onPress}
      activeOpacity={isBooked ? 1 : 0.8}
      disabled={!!isBooked}
    >
      <View style={[styles.imageContainer, isHorizontal && styles.imageContainerHorizontal]}>
        <ExpoImage
          source={{ uri: hotel.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onFavoritePress?.();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name={hotel.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={hotel.isFavorite ? BOOKING_COLORS.HEART : '#FFFFFF'}
          />
        </TouchableOpacity>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={BOOKING_COLORS.RATING} />
          <Text style={styles.ratingText}>{hotel.rating ? hotel.rating.toFixed(1) : '0.0'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.hotelName} numberOfLines={1}>
          {hotel.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={BOOKING_COLORS.TEXT_SECONDARY} />
          <Text style={styles.location} numberOfLines={1}>
            {hotel.location}
          </Text>
        </View>
        <View style={styles.footer}>
          {hotel.reviewCount > 0 && (
            <Text style={styles.reviews}>({hotel.reviewCount} Đánh giá)</Text>
          )}
          {hotel.price > 0 ? (
            <Text style={styles.price}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(hotel.price)}/đêm
            </Text>
          ) : (
            <Text style={styles.pricePlaceholder}>Liên hệ</Text>
          )}
        </View>
        {isBooked && (
          <View style={styles.bookedBadge} pointerEvents="none">
            <Text style={styles.bookedText}>Phòng đã được đặt</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHorizontal: {
    width: 300,
    marginRight: 20,
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  imageContainerHorizontal: {
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  content: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    flex: 1,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  reviews: {
    fontSize: 13,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    fontWeight: '400',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRICE,
    letterSpacing: -0.3,
  },
  pricePlaceholder: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  bookedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F56565',
  },
  bookedText: {
    color: '#F56565',
    fontWeight: '700',
    fontSize: 12,
  },
});
