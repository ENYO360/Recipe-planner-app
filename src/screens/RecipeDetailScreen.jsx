// src/screens/RecipeDetailScreen.jsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "../context/RecipeContext";

const HEADER_IMAGE_HEIGHT = 300;

export default function RecipeDetailScreen({ navigation, route }) {
  // ── Receive the recipe passed from HomeScreen ─────────────────────────
  const { recipe: initialRecipe } = route.params;

  // Pull live recipe data from context so favourite state stays in sync
  const { recipes, toggleFavourite } = useRecipes();
  const recipe = recipes.find((r) => r.id === initialRecipe.id) ?? initialRecipe;

  // ── Local state ───────────────────────────────────────────────────────
  const [servings,       setServings]       = useState(recipe.servings);
  const [checkedSteps,   setCheckedSteps]   = useState([]);

  // ── Animated scroll value ─────────────────────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;

  // Interpolate scroll position → header button background opacity
  // As user scrolls down 80px, the back button bg fades from
  // semi-transparent white to fully white
  const headerBgOpacity = scrollY.interpolate({
    inputRange:  [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp", // don't go below 0 or above 1
  });

  // ── Serving scaler logic ──────────────────────────────────────────────
  // Multiply each ingredient amount by (current servings / original servings)
  const scaledAmount = (originalAmount) => {
    const scaled = (originalAmount * servings) / recipe.servings;
    // Show clean integers when possible, otherwise 1 decimal place
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
  };

  // ── Step checkbox toggle ──────────────────────────────────────────────
  const toggleStep = (index) => {
    setCheckedSteps((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)  // uncheck
        : [...prev, index]                 // check
    );
  };

  return (
    <View className="flex-1 bg-white">

      {/* ── ANIMATED SCROLL VIEW ── */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // must be false when animating layout props
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── HERO IMAGE ── */}
        <Image
          source={{ uri: recipe.image }}
          style={{ width: "100%", height: HEADER_IMAGE_HEIGHT }}
          resizeMode="cover"
        />

        {/* ── CONTENT CARD (sits on top of image) ── */}
        <View
          className="bg-white rounded-t-3xl -mt-6 pt-6 px-5"
          style={{ minHeight: 500 }}
        >

          {/* Title + Favourite */}
          <View className="flex-row items-start justify-between mb-3">
            <Text className="text-gray-900 text-2xl font-bold flex-1 mr-4"
              style={{ lineHeight: 32 }}>
              {recipe.title}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFavourite(recipe.id)}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mt-1"
            >
              <Ionicons
                name={recipe.isFavourite ? "heart" : "heart-outline"}
                size={20}
                color={recipe.isFavourite ? "#ef4444" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>

          {/* Meta pills */}
          <View className="flex-row flex-wrap gap-2 mb-5">
            {[
              { icon: "time-outline",       label: recipe.duration      },
              { icon: "people-outline",     label: `${recipe.servings} servings` },
              { icon: "bar-chart-outline",  label: recipe.difficulty    },
            ].map(({ icon, label }) => (
              <View key={label}
                className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                <Ionicons name={icon} size={13} color="#6b7280" />
                <Text className="text-gray-500 text-xs font-medium">{label}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 mb-5" />

          {/* About / Description */}
          <Text className="text-gray-900 font-bold text-lg mb-2">About</Text>
          <Text className="text-gray-500 text-sm leading-6 mb-6">
            {recipe.description}
          </Text>

          {/* ── INGREDIENTS ── */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 font-bold text-lg">Ingredients</Text>

            {/* Serving scaler */}
            <View className="flex-row items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5">
              <TouchableOpacity
                onPress={() => setServings((s) => Math.max(1, s - 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color="#374151" />
              </TouchableOpacity>

              <Text className="text-gray-800 font-bold text-sm w-4 text-center">
                {servings}
              </Text>

              <TouchableOpacity
                onPress={() => setServings((s) => Math.min(20, s + 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Ingredient list */}
          <View className="mb-6 gap-2">
            {recipe.ingredients.map((ing, index) => (
              <View
                key={ing.id}
                className={`flex-row items-center justify-between py-3 px-4 rounded-xl ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <View className="flex-row items-center gap-3">
                  {/* Coloured dot */}
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                  <Text className="text-gray-700 text-sm font-medium">
                    {ing.name}
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm">
                  {scaledAmount(ing.amount)} {ing.unit}
                </Text>
              </View>
            ))}
          </View>

          {/* ── STEPS ── */}
          <Text className="text-gray-900 font-bold text-lg mb-4">
            Instructions
          </Text>

          <View className="gap-3">
            {recipe.steps.map((step, index) => {
              const isChecked = checkedSteps.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleStep(index)}
                  activeOpacity={0.8}
                  className={`flex-row gap-4 p-4 rounded-2xl border ${
                    isChecked
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-100"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  {/* Step number / checkmark */}
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center flex-shrink-0 mt-0.5 ${
                      isChecked ? "bg-green-500" : "bg-gray-100"
                    }`}
                  >
                    {isChecked ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : (
                      <Text className="text-gray-500 text-xs font-bold">
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  {/* Step text */}
                  <Text
                    className={`flex-1 text-sm leading-6 ${
                      isChecked
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {step}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Progress indicator */}
          {recipe.steps.length > 0 && (
            <View className="mt-6 p-4 bg-gray-50 rounded-2xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 text-xs font-medium">
                  Progress
                </Text>
                <Text className="text-green-600 text-xs font-bold">
                  {checkedSteps.length}/{recipe.steps.length} steps
                </Text>
              </View>

              {/* Progress bar */}
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${(checkedSteps.length / recipe.steps.length) * 100}%`,
                  }}
                />
              </View>
            </View>
          )}

        </View>
      </Animated.ScrollView>

      {/* ── FLOATING BACK BUTTON (always on top) ── */}
      {/* This sits outside the ScrollView so it stays fixed on screen */}
      <SafeAreaView
        className="absolute top-0 left-0 right-0"
        pointerEvents="box-none" // lets touches pass through to ScrollView behind it
      >
        <Animated.View
          className="flex-row justify-between px-4 pt-2 pb-3"
          style={{ backgroundColor: `rgba(255,255,255,${headerBgOpacity.__getValue?.() ?? 0})` }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

    </View>
  );
}