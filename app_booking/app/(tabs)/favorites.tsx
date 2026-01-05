import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BOOKING_COLORS } from '@/constants/booking';
import { getFavorites, removeFavorite, FavoriteResponse } from '@/apis/favoriteApi';
import { useRouter } from 'expo-router';

export default function FavoritesScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    data: favorites,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleRemoveFavorite = (favoriteId: number) => {
    removeFavoriteMutation.mutate(favoriteId);
  };

  const handleViewRoom = (roomId: number) => {
    router.push({
      pathname: '/room-detail/[id]',
      params: { id: roomId.toString() },
    });
  };

  const renderFavoriteCard = (favorite: FavoriteResponse) => {
    return (
      <TouchableOpacity
        key={favorite.favoriteId}
        style={styles.favoriteCard}
        onPress={() => handleViewRoom(favorite.roomId)}
        activeOpacity={0.7}>
        <ExpoImage
          source={{
            uri: favorite.roomImageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
          }}
          style={styles.roomImage}
          contentFit="cover"
        />
        <View style={styles.favoriteContent}>
          <View style={styles.favoriteHeader}>
            <View style={styles.favoriteInfo}>
              <Text style={styles.hotelName}>{favorite.hotelName}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={BOOKING_COLORS.TEXT_SECONDARY} />
                <Text style={styles.location}>{favorite.hotelLocation || favorite.hotelCity}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFavorite(favorite.favoriteId)}
              disabled={removeFavoriteMutation.isPending}>
              <Ionicons name="heart" size={24} color={BOOKING_COLORS.HEART} />
            </TouchableOpacity>
          </View>
          <Text style={styles.roomType}>{favorite.roomType}</Text>
          <View style={styles.favoriteFooter}>
            <View style={styles.ratingRow}>
              {favorite.rating && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < Math.floor(favorite.rating || 0) ? 'star' : 'star-outline'}
                      size={14}
                      color={BOOKING_COLORS.RATING}
                    />
                  ))}
                  <Text style={styles.ratingText}>
                    {favorite.rating.toFixed(1)} ({favorite.reviewCount || 0})
                  </Text>
                </>
              )}
            </View>
            <Text style={styles.price}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(favorite.roomPrice)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
      </View>

      {/* Favorites List */}
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : !favorites || favorites.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="heart-outline" size={64} color={BOOKING_COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>Chưa có phòng yêu thích nào</Text>
          <Text style={styles.emptySubtext}>Thêm phòng vào yêu thích để xem lại sau</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
          {favorites.map(renderFavoriteCard)}
        </ScrollView>
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  favoriteCard: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: 200,
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  favoriteInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
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
  removeButton: {
    padding: 4,
  },
  roomType: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRIMARY,
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
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

