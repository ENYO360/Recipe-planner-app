// src/screens/FavouritesScreen.jsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "../context/RecipeContext";
import FavouriteCard from "../components/FavouriteCard";

export default function FavouritesScreen({ navigation }) {
  const { favourites, toggleFavourite } = useRecipes();

  // ── Empty state when no recipes are favourited ────────────────────────
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-10 py-20">
      {/* Icon container */}
      <View className="w-24 h-24 rounded-full bg-red-50 items-center justify-center mb-5">
        <Ionicons name="heart-outline" size={44} color="#fca5a5" />
      </View>

      <Text className="text-gray-900 font-bold text-xl mb-2 text-center">
        No favourites yet
      </Text>

      <Text className="text-gray-400 text-sm text-center leading-6 mb-8">
        Tap the heart icon on any recipe to save it here for quick access.
      </Text>

      {/* CTA button — navigates to Home tab */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        activeOpacity={0.8}
        className="flex-row items-center gap-2 bg-green-600 px-6 py-3.5 rounded-full"
        style={{
          shadowColor: "#16a34a",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Ionicons name="compass-outline" size={18} color="white" />
        <Text className="text-white font-bold text-sm">Explore Recipes</Text>
      </TouchableOpacity>
    </View>
  );

  // ── List header ───────────────────────────────────────────────────────
  const ListHeader = () => (
    <View className="px-5 pt-4 pb-5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-gray-400 text-sm font-medium">Your saved</Text>
          <Text className="text-gray-900 text-2xl font-bold mt-0.5">
            Favourites
          </Text>
        </View>

        {/* Count badge — only shows when there are favourites */}
        {favourites.length > 0 && (
          <View className="bg-red-100 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
            <Ionicons name="heart" size={13} color="#ef4444" />
            <Text className="text-red-500 font-bold text-sm">
              {favourites.length}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id}
        numColumns={2}                    // ← 2-column grid
        columnWrapperStyle={{             // ← styles the row wrapper
          paddingHorizontal: 20,
          gap: 12,
        }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
          // When empty, fill the screen so the empty state centers properly
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <FavouriteCard
            recipe={item}
            onPress={() =>
              navigation.navigate("Home", {
                screen: "RecipeDetail",
                params: { recipe: item },
              })
            }
            onRemove={() => toggleFavourite(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}