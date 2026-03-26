import React from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import Icon from "./Icon";
import AnimatedHeart from "./AnimatedHeart";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function RecipeCard({
  recipe,
  onPress,
  onFavouritePress,
  onDelete,
  index = 0,           // position in list — used for stagger delay
}) {
  // ── Press scale animation ─────────────────────────────────────────────
  const scale = useSharedValue(1);

  // ── Entrance animation ────────────────────────────────────────────────
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  // Run entrance animation once on mount with stagger based on index
  React.useEffect(() => {
    const delay = Math.min(index * 80, 400); // max 400ms stagger
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, {
      damping: 18,
      stiffness: 120,
    }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const handleLongPress = () => {
    // Shake animation before showing alert
    scale.value = withSequence(
      withTiming(1.02, { duration: 60 }),
      withTiming(0.98, { duration: 60 }),
      withTiming(1.02, { duration: 60 }),
      withSpring(1)
    );
    setTimeout(() => {
      Alert.alert(
        "Delete Recipe",
        `Are you sure you want to delete "${recipe.title}"? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(recipe.id) },
        ]
      );
    }, 200);
  };

  return (
    <Animated.View style={cardStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={1}        // disable default opacity — we handle it
        className="bg-white rounded-2xl mb-4 overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="relative">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-44"
            resizeMode="cover"
          />
          <AnimatedHeart
            isFavourite={recipe.isFavourite}
            onPress={onFavouritePress}
            containerClass="absolute top-3 right-3 w-9 h-9 rounded-full bg-white"
          />
          <View className="absolute bottom-3 left-3 bg-black/50 px-2.5 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">
              {recipe.difficulty}
            </Text>
          </View>
          <View className="absolute bottom-3 right-3 bg-black/40 px-2 py-1 rounded-full flex-row items-center gap-1">
            <Icon name="trash-outline" size={10} color="white" />
            <Text className="text-white text-[10px]">Hold to delete</Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>
            {recipe.description}
          </Text>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Icon name="time-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-xs font-medium">
                {recipe.duration}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="people-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-xs font-medium">
                {recipe.servings} servings
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// withDelay must be imported separately
import { withDelay } from "react-native-reanimated";