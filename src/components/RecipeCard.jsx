// src/components/RecipeCard.jsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RecipeCard({ recipe, onPress, onFavouritePress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3, // Android shadow
      }}
    >
      {/* ── Recipe Image ── */}
      <View className="relative">
        <Image
          source={{ uri: recipe.image }}
          className="w-full h-44"
          resizeMode="cover"
        />

        {/* Favourite button overlaid on image */}
        <TouchableOpacity
          onPress={onFavouritePress}
          activeOpacity={0.8}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons
            name={recipe.isFavourite ? "heart" : "heart-outline"}
            size={18}
            color={recipe.isFavourite ? "#ef4444" : "#9ca3af"}
          />
        </TouchableOpacity>

        {/* Difficulty badge */}
        <View className="absolute bottom-3 left-3 bg-black/50 px-2.5 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">
            {recipe.difficulty}
          </Text>
        </View>
      </View>

      {/* ── Card Body ── */}
      <View className="p-4">
        <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={1}>
          {recipe.title}
        </Text>

        <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>
          {recipe.description}
        </Text>

        {/* Meta row — time and servings */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-xs font-medium">
              {recipe.duration}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-xs font-medium">
              {recipe.servings} servings
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}