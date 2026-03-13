// src/screens/HomeScreen.jsx
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "../context/RecipeContext";
import { CATEGORIES } from "../data/sampleRecipes";
import RecipeCard   from "../components/RecipeCard";
import CategoryPill from "../components/CategoryPill";

export default function HomeScreen({ navigation }) {
  const { recipes, toggleFavourite } = useRecipes();

  const [searchQuery,      setSearchQuery]      = useState("");
  const [activeCategory,   setActiveCategory]   = useState("all");

  // ── Derived list — recalculates only when search or category changes ──
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory =
        activeCategory === "all" || recipe.category === activeCategory;

      const matchesSearch = recipe.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [recipes, searchQuery, activeCategory]);

  const renderListHeader = useCallback(() => (
    <View>
      {/* Category pills — horizontal scroll */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <CategoryPill
            label={item.label}
            isActive={activeCategory === item.id}
            onPress={() => setActiveCategory(item.id)}
          />
        )}
      />

      {/* Results count */}
      <View className="px-5 mb-3 flex-row items-center justify-between">
        <Text className="text-gray-900 font-bold text-lg">
          {activeCategory === "all"
            ? "All Recipes"
            : CATEGORIES.find(c => c.id === activeCategory)?.label}
        </Text>
        <Text className="text-gray-400 text-sm">
          {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  ), [activeCategory, filteredRecipes.length]);

  const renderEmptyState = useCallback(() => (
    <View className="items-center justify-center py-20">
      <Ionicons name="search-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-400 font-semibold text-base mt-4">
        No recipes found
      </Text>
      <Text className="text-gray-300 text-sm mt-1">
        Try a different search or category
      </Text>
    </View>
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Greeting */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-gray-400 text-sm font-medium">👋 Hello, Chef!</Text>
        <Text className="text-gray-900 text-2xl font-bold mt-0.5">
          What are you cooking today?
        </Text>
      </View>

      {/* Search bar — lives OUTSIDE FlatList so it never unmounts on re-render */}
      <View className="mx-5 mt-4 mb-5 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 gap-2">
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Search recipes..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-gray-800 text-sm"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-5">
            <RecipeCard
              recipe={item}
              onPress={() =>
                navigation.navigate("RecipeDetail", { recipe: item })
              }
              onFavouritePress={() => toggleFavourite(item.id)}
            />
          </View>
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}