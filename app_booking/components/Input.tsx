import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  onPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  showPasswordToggle = false,
  onTogglePassword,
  isPasswordVisible = false,
  icon,
  keyboardType = "default",
  autoCapitalize = "none",
  editable = true,
  onPress,
  rightIcon,
  onRightIconPress,
  error,
}: InputProps) {
  const isFocused = value.length > 0;
  const borderColor = error ? "#EF4444" : isFocused ? "#3182CE" : "#E2E8F0";

  const inputContent = (
    <View
      style={[
        styles.container,
        { borderColor },
        !editable && styles.disabledContainer,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? "#3182CE" : "#9CA3AF"}
          style={styles.leftIcon}
        />
      )}
      {editable ? (
        <TextInput
          style={[styles.input, !label && styles.inputWithoutLabel]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
      ) : (
        <TouchableOpacity
          onPress={onPress}
          style={[styles.input, !label && styles.inputWithoutLabel]}
        >
          <Text style={[styles.inputText, !value && styles.placeholder]}>
            {value || placeholder}
          </Text>
        </TouchableOpacity>
      )}
      {showPasswordToggle && onTogglePassword && (
        <TouchableOpacity onPress={onTogglePassword} style={styles.toggle}>
          <Ionicons
            name={isPasswordVisible ? "eye" : "eye-off"}
            size={20}
            color={isFocused ? "#3182CE" : "#9CA3AF"}
          />
        </TouchableOpacity>
      )}
      {rightIcon && onRightIconPress && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.toggle}>
          <Ionicons
            name={rightIcon}
            size={20}
            color={isFocused ? "#3182CE" : "#9CA3AF"}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (label) {
    return (
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {inputContent}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View>
      {inputContent}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4A5568",
    marginBottom: 6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 48,
  },
  disabledContainer: {
    backgroundColor: "#F7FAFC",
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A202C",
    paddingVertical: 12,
  },
  inputWithoutLabel: {
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 16,
    color: "#1A202C",
  },
  placeholder: {
    color: "#9CA3AF",
  },
  toggle: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
});

