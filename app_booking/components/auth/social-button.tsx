import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AUTH_COLORS } from '@/constants/auth';

interface SocialButtonProps {
  provider: 'google' | 'facebook';
  onPress: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onPress }) => {
  const isGoogle = provider === 'google';
  const iconName = isGoogle ? 'logo-google' : 'logo-facebook';
  const label = isGoogle ? 'Google' : 'Facebook';
  const letter = isGoogle ? 'G' : 'f';

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={iconName}
            size={20}
            color={isGoogle ? '#4285F4' : '#1877F2'}
          />
        </View>
        <Text style={styles.text}>{letter} {label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: AUTH_COLORS.SOCIAL_BUTTON_BG,
    borderRadius: 12,
    paddingVertical: Platform.select({
      ios: 14,
      android: 12,
    }),
    minHeight: 52,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: AUTH_COLORS.TEXT_PRIMARY,
  },
});
