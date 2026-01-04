export const ONBOARDING_COLORS = {
  PRIMARY: '#6C7CE7',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#6B7280',
  BACKGROUND: '#FFFFFF',
  PAGINATION_ACTIVE: '#6C7CE7',
  PAGINATION_INACTIVE: '#E5E7EB',
} as const;

export interface OnboardingData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export const ONBOARDING_DATA: OnboardingData[] = [
  {
    id: 1,
    title: 'Cách dễ dàng đặt khách sạn với chúng tôi',
    description: 'Khám phá hàng nghìn khách sạn tuyệt vời với giá cả hợp lý. Đặt phòng nhanh chóng và thuận tiện chỉ với vài thao tác đơn giản.',
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  },
  {
    id: 2,
    title: 'Khám phá và tìm địa điểm nghỉ dưỡng hoàn hảo',
    description: 'Tìm kiếm khách sạn phù hợp với nhu cầu của bạn. Từ những khu nghỉ dưỡng sang trọng đến những khách sạn tiện nghi, tất cả đều có ở đây.',
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
  },
  {
    id: 3,
    title: 'Ưu đãi tốt nhất dành riêng cho bạn',
    description: 'Nhận những ưu đãi độc quyền và giá cả tốt nhất. Đặt phòng ngay để không bỏ lỡ cơ hội tiết kiệm.',
    imageUrl: 'https://images.unsplash.com/photo-1559314809-2b3d0e48c3d7?w=800',
  },
] as const;

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@onboarding_completed',
} as const;
