// src/components/FavouriteCard.jsx
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Get the device screen width so we can calculate card size
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 2 columns, 20px padding each side, 12px gap between cards
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

export default function FavouriteCard({ recipe, onPress, onRemove }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{ width: CARD_WIDTH }}
      className="bg-white rounded-2xl overflow-hidden mb-3"
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: recipe.image }}
          style={{ width: CARD_WIDTH, height: CARD_WIDTH }}
          resizeMode="cover"
        />

        {/* Remove from favourites button */}
        <TouchableOpacity
          onPress={onRemove}
          activeOpacity={0.8}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Ionicons name="heart" size={14} color="#ef4444" />
        </TouchableOpacity>

        {/* Category badge */}
        <View className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded-full">
          <Text className="text-white text-[10px] font-semibold capitalize">
            {recipe.category}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="p-3">
        <Text
          className="text-gray-900 font-bold text-sm mb-1"
          numberOfLines={1}
        >
          {recipe.title}
        </Text>

        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={11} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">{recipe.duration}</Text>

          <View className="w-1 h-1 rounded-full bg-gray-300 mx-1" />

          <Ionicons name="bar-chart-outline" size={11} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">{recipe.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}