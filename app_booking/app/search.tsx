import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HotelCard } from '@/components/booking/hotel-card';
import { BOOKING_COLORS, Hotel } from '@/constants/booking';
import { getAllRooms, searchRooms, RoomResponse } from '@/apis/roomApi';
import { getUserBookings } from '@/apis/bookingApi';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onApply?: () => void;
  onClearAll?: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  title,
  children,
  onApply,
  onClearAll,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>{children}</ScrollView>
        {(onApply || onClearAll) && (
          <View style={styles.modalFooter}>
            {onClearAll && (
              <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
                <Text style={styles.clearButtonText}>Xóa tất cả</Text>
              </TouchableOpacity>
            )}
            {onApply && (
              <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  </Modal>
);

export default function SearchRoomScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState<string>('');
  const [allRooms, setAllRooms] = useState<RoomResponse[]>([]);
  const [rooms, setRooms] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingMap, setBookingMap] = useState<Record<string, string | null>>({});

  // Filter states
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [hotelModalVisible, setHotelModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedHotels, setSelectedHotels] = useState<string[]>(
    params.hotelName ? [params.hotelName as string] : []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    loadAllRooms();
    // If hotelName is passed from params, set it as selected
    if (params.hotelName) {
      setSelectedHotels([params.hotelName as string]);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, selectedSort, selectedHotels, selectedPriceRange, allRooms]);

  const loadAllRooms = async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      setAllRooms(data);
      setRooms(mapRoomResponseToRoom(data));
    } catch (error) {
      console.error('Load rooms error:', error);
      setAllRooms([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load user bookings to determine booked rooms in this list
    let mounted = true;
    const loadBookings = async () => {
      try {
        const bookings = await getUserBookings();
        const map: Record<string, string | null> = {};
        bookings.forEach((b) => {
          map[b.roomId.toString()] = b.status;
        });
        if (mounted) setBookingMap(map);
      } catch (err) {
        // ignore (user not logged in)
      }
    };
    loadBookings();
    return () => { mounted = false; };
  }, []);

  // Hàm lọc theo từ khóa tìm kiếm
  const filterBySearchKeyword = (rooms: RoomResponse[]): RoomResponse[] => {
    if (searchText.trim().length === 0) {
      return rooms;
    }
    const keyword = searchText.trim().toLowerCase();
    return rooms.filter(
      (room) =>
        room.roomType?.toLowerCase().includes(keyword) ||
        room.hotelName?.toLowerCase().includes(keyword)
    );
  };

  // Hàm lọc theo tên khách sạn
  const filterByHotelName = (rooms: RoomResponse[]): RoomResponse[] => {
    if (selectedHotels.length === 0) {
      return rooms;
    }
    const hotelSet = new Set(selectedHotels.map((h) => h.trim().toLowerCase()));
    return rooms.filter(
      (room) => room.hotelName && hotelSet.has(room.hotelName.trim().toLowerCase())
    );
  };

  // Hàm lọc theo khoảng giá
  const filterByPriceRange = (rooms: RoomResponse[]): RoomResponse[] => {
    if (!selectedPriceRange || params.hotelName) {
      return rooms;
    }
    return rooms.filter((room) => {
      const price = room.price || 0;
      return price >= selectedPriceRange.min && price <= selectedPriceRange.max;
    });
  };

  // Hàm sắp xếp phòng
  const sortRooms = (rooms: RoomResponse[]): RoomResponse[] => {
    if (params.hotelName) {
      return rooms; // Không sắp xếp khi lọc theo hotel từ index
    }
    const sorted = [...rooms];
    switch (selectedSort) {
      case "price-low":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }
    return sorted;
  };

  // Hàm áp dụng tất cả bộ lọc
  const applyFilters = useCallback(() => {
    setLoading(true);
    let filtered = [...allRooms];
    
    // Áp dụng các bộ lọc theo thứ tự
    filtered = filterBySearchKeyword(filtered);
    filtered = filterByHotelName(filtered);
    filtered = filterByPriceRange(filtered);
    filtered = sortRooms(filtered);

    setRooms(mapRoomResponseToRoom(filtered));
    setLoading(false);
  }, [allRooms, searchText, selectedHotels, selectedPriceRange, selectedSort, params.hotelName]);

  const getHotelOptions = useCallback((): string[] => {
    const hotels = new Set<string>();
    allRooms.forEach((r) => r.hotelName && hotels.add(r.hotelName));
    return Array.from(hotels).sort();
  }, [allRooms]);

  const mapRoomResponseToRoom = (data: RoomResponse[]): Hotel[] => {
    return data.map((item) => ({
      id: item.roomId.toString(),
      name: item.roomType,
      location: item.hotelName || '',
      price: item.price || 0,
      rating: item.rating ?? 0,
      reviewCount: item.reviewCount ?? 0,
      imageUrl: (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "") ||
        "",
      isFavorite: false,
    }));
  };

  const toggleFavorite = (roomId: string): void => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, isFavorite: !room.isFavorite } : room
      )
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phòng..."
            placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        )}
        {searchText.length === 0 && <View style={styles.headerButton} />}
      </View>

      {/* Filter Bar - Only show if not filtering by hotel from index */}
      {!params.hotelName && (
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setSortModalVisible(true)}>
            <Ionicons name="swap-vertical-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
            <Text style={styles.filterButtonText}>Sắp xếp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={() => setHotelModalVisible(true)}>
            <Text style={styles.filterButtonText}>Khách sạn</Text>
            {selectedHotels.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedHotels.length}</Text>
              </View>
            )}
            <Ionicons name="chevron-down-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={() => setPriceModalVisible(true)}>
            <Text style={styles.filterButtonText}>Giá</Text>
            {selectedPriceRange && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>✓</Text>
              </View>
            )}
            <Ionicons name="chevron-down-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      )}

      {/* Show selected hotel info when filtering from index */}
      {params.hotelName && (
        <View style={styles.hotelFilterInfo}>
          <View style={styles.hotelFilterBadge}>
            <Ionicons name="business-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
            <Text style={styles.hotelFilterText}>Khách sạn: {params.hotelName}</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedHotels([]);
                router.replace('/search');
              }}
              style={styles.clearHotelFilter}>
              <Ionicons name="close-circle" size={18} color={BOOKING_COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >

        {/* Nearby Rooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchText.trim().length > 0 ? 'Kết quả tìm kiếm' : 'Phòng gần vị trí của bạn'}
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText.trim().length > 0 ? 'Không tìm thấy phòng phù hợp' : 'Chưa có phòng'}
              </Text>
            </View>
          ) : (
            <View style={styles.hotelsList}>
              {rooms.map((room) => {
                const status = bookingMap[room.id] ?? null;
                const isBooked = status === 'PENDING' || status === 'CONFIRMED';
                return (
                  <HotelCard
                    key={room.id}
                    hotel={room}
                    variant="vertical"
                    onPress={() => router.push(`/room-detail/${room.id}`)}
                    onFavoritePress={() => toggleFavorite(room.id)}
                    isBooked={isBooked}
                    bookingStatus={status}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <FilterModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        title="Sắp xếp theo">
        {[
          { id: "price-low", label: "Giá: thấp đến cao", icon: "arrow-up-outline" },
          { id: "price-high", label: "Giá: cao đến thấp", icon: "arrow-down-outline" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={styles.optionItem}
            onPress={() => {
              setSelectedSort(opt.id);
              setSortModalVisible(false);
            }}>
            <Ionicons
              name={opt.icon as any}
              size={20}
              color={selectedSort === opt.id ? BOOKING_COLORS.PRIMARY : BOOKING_COLORS.TEXT_SECONDARY}
            />
            <Text style={[styles.optionText, selectedSort === opt.id && styles.optionTextSelected]}>
              {opt.label}
            </Text>
            {selectedSort === opt.id && (
              <Ionicons name="checkmark" size={20} color={BOOKING_COLORS.PRIMARY} />
            )}
          </TouchableOpacity>
        ))}
      </FilterModal>

      {/* Hotel Modal */}
      <FilterModal
        visible={hotelModalVisible}
        onClose={() => setHotelModalVisible(false)}
        title="Lọc theo khách sạn"
        onApply={() => {
          setHotelModalVisible(false);
          applyFilters();
        }}
        onClearAll={() => {
          setSelectedHotels([]);
          applyFilters();
        }}>
        {getHotelOptions().map((name) => {
          const isSelected = selectedHotels.includes(name);
          return (
            <TouchableOpacity
              key={name}
              style={styles.checkboxItem}
              onPress={() =>
                setSelectedHotels((prev) =>
                  isSelected ? prev.filter((h) => h !== name) : [...prev, name]
                )
              }>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={BOOKING_COLORS.BACKGROUND} />
                )}
              </View>
              <Text style={[styles.checkboxText, isSelected && styles.checkboxTextSelected]}>
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </FilterModal>

      {/* Price Modal */}
      <FilterModal
        visible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        title="Khoảng giá"
        onApply={() => {
          setPriceModalVisible(false);
          applyFilters();
        }}
        onClearAll={() => {
          setSelectedPriceRange(null);
          applyFilters();
        }}>
        {[
          { label: "Dưới 500.000 VND", min: 0, max: 500000 },
          { label: "500.000 - 1.000.000 VND", min: 500000, max: 1000000 },
          { label: "1.000.000 - 2.000.000 VND", min: 1000000, max: 2000000 },
          { label: "Trên 2.000.000 VND", min: 2000000, max: 10000000 },
        ].map((range) => {
          const isSelected =
            selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max;
          return (
            <TouchableOpacity
              key={range.label}
              style={styles.radioItem}
              onPress={() => setSelectedPriceRange({ min: range.min, max: range.max })}>
              <View style={styles.radioButton}>
                {isSelected && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </FilterModal>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
  },
  scrollView: {
    flex: 1,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${BOOKING_COLORS.PRIMARY}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  hotelsList: {
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
    gap: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.PRIMARY,
  },
  filterBadge: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderColor: BOOKING_COLORS.PRIMARY,
  },
  checkboxText: {
    flex: 1,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  checkboxTextSelected: {
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  radioText: {
    flex: 1,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  radioTextSelected: {
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  hotelFilterInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  hotelFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BOOKING_COLORS.PRIMARY + '15',
    borderRadius: 8,
  },
  hotelFilterText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  clearHotelFilter: {
    padding: 4,
  },
});
