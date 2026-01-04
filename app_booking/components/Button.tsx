import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button, styles[size]];
    if (fullWidth) baseStyle.push(styles.fullWidth);

    if (variant === "primary") {
      baseStyle.push(
        isDisabled ? styles.primaryDisabled : styles.primary
      );
    } else if (variant === "outline") {
      baseStyle.push(
        isDisabled ? styles.outlineDisabled : styles.outline
      );
    } else if (variant === "ghost") {
      baseStyle.push(styles.ghost);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any[] = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    if (variant === "primary") {
      baseStyle.push(styles.primaryText);
    } else if (variant === "outline") {
      baseStyle.push(
        isDisabled ? styles.outlineTextDisabled : styles.outlineText
      );
    } else if (variant === "ghost") {
      baseStyle.push(
        isDisabled ? styles.ghostTextDisabled : styles.ghostText
      );
    }
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#3182CE"}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={20}
              color={
                variant === "primary"
                  ? "#FFFFFF"
                  : isDisabled
                    ? "#9CA3AF"
                    : "#3182CE"
              }
              style={styles.iconLeft}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={20}
              color={
                variant === "primary"
                  ? "#FFFFFF"
                  : isDisabled
                    ? "#9CA3AF"
                    : "#3182CE"
              }
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: {
    width: "100%",
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  primary: {
    backgroundColor: "#3182CE",
  },
  primaryDisabled: {
    backgroundColor: "#E2E8F0",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  outlineDisabled: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#4A5568",
  },
  outlineTextDisabled: {
    color: "#9CA3AF",
  },
  ghostText: {
    color: "#3182CE",
  },
  ghostTextDisabled: {
    color: "#9CA3AF",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

