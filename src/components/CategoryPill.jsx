// src/components/CategoryPill.jsx
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function CategoryPill({ label, isActive, onPress }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Bounce effect on selection
    scale.value = withSpring(0.88, { damping: 10, stiffness: 500 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    });
    onPress();
  };

  return (
    <Animated.View style={animStyle} className="mr-2">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        className={`px-4 py-2 rounded-full border ${
          isActive ? "bg-green-600 border-green-600" : "bg-white border-gray-200"
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
    </Animated.View>
  );
}