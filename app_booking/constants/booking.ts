export const BOOKING_COLORS = {
  PRIMARY: '#5B6CFF',
  BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#6B7280',
  BORDER: '#E5E7EB',
  CARD_BACKGROUND: '#F9FAFB',
  RATING: '#FFB800',
  PRICE: '#5B6CFF',
  HEART: '#EF4444',
} as const;

export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isFavorite?: boolean;
  isBooked?: boolean;
  bookingStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | null;
}

export interface City {
  id: string;
  name: string;
  imageUrl: string;
}


