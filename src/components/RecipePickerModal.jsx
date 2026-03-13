// src/components/RecipePickerModal.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "../context/RecipeContext";

export default function RecipePickerModal({ visible, onClose, onSelect, mealType }) {
  const { recipes } = useRecipes();
  const [search, setSearch] = useState("");

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const MEAL_ICONS = {
    breakfast: "sunny-outline",
    lunch:     "partly-sunny-outline",
    dinner:    "moon-outline",
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"       // slides up from bottom — native feel
      presentationStyle="pageSheet" // iOS: shows as a bottom sheet card
      onRequestClose={onClose}    // Android back button closes the modal
    >
      <SafeAreaView className="flex-1 bg-white">

        {/* ── Modal header ── */}
        <View className="px-5 pt-4 pb-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={MEAL_ICONS[mealType] ?? "restaurant-outline"}
                size={18}
                color="#16a34a"
              />
              <Text className="text-gray-900 font-bold text-lg capitalize">
                Pick a {mealType}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2 mt-3">
            <Ionicons name="search-outline" size={15} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search recipes..."
              placeholderTextColor="#9ca3af"
              className="flex-1 text-gray-800 text-sm"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={15} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Recipe list ── */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="search-outline" size={36} color="#d1d5db" />
              <Text className="text-gray-400 mt-3 font-medium">No recipes found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                onClose();
                setSearch("");
              }}
              activeOpacity={0.85}
              className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {/* Thumbnail */}
              <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-xl"
                resizeMode="cover"
              />

              {/* Info */}
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm mb-1" numberOfLines={1}>
                  {item.title}
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={11} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs">{item.duration}</Text>
                  </View>
                  <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                    <Text className="text-gray-500 text-[10px] font-semibold capitalize">
                      {item.category}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="add-circle" size={22} color="#16a34a" />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}