// src/components/CategoryPill.jsx
import { TouchableOpacity, Text } from "react-native";

export default function CategoryPill({ label, isActive, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`mr-2 px-4 py-2 rounded-full border ${
        isActive
          ? "bg-green-600 border-green-600"
          : "bg-white border-gray-200"
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          isActive ? "text-white" : "text-gray-500"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}