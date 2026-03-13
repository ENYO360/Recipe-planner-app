// src/screens/MealPlannerScreen.jsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "../context/RecipeContext";
import RecipePickerModal from "../components/RecipePickerModal";
import {
  getCurrentWeekDates,
  formatDisplayDate,
  formatShortDate,
  formatWeekLabel,
  isToday,
} from "../utils/dateHelpers";

// Meal slot config
const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: "sunny-outline",        color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-200"  },
  { key: "lunch",     label: "Lunch",     icon: "partly-sunny-outline",  color: "text-sky-500",    bg: "bg-sky-50",    border: "border-sky-200"    },
  { key: "dinner",    label: "Dinner",    icon: "moon-outline",          color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
];

export default function MealPlannerScreen({ navigation }) {
  const { getMealsForDay, assignMeal, removeMeal, generateShoppingList } =
    useRecipes();

  const weekDates    = useMemo(() => getCurrentWeekDates(), []);
  const [selectedDay, setSelectedDay] = useState(
    weekDates.find((d) => isToday(d)) ?? weekDates[0]
  );

  // Modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeMealType, setActiveMealType] = useState(null);

  // The meals assigned to the currently selected day
  const dayMeals = getMealsForDay(selectedDay);

  // Count total planned meals across the whole week
  const totalPlanned = useMemo(() => {
    return weekDates.reduce((count, dateKey) => {
      const meals = getMealsForDay(dateKey);
      return count + Object.values(meals).filter(Boolean).length;
    }, 0);
  }, [weekDates, getMealsForDay]);

  const openPicker = (mealType) => {
    setActiveMealType(mealType);
    setPickerVisible(true);
  };

  const handleSelectRecipe = (recipe) => {
    assignMeal(selectedDay, activeMealType, recipe);
  };

  const handleGenerateShoppingList = () => {
    const list = generateShoppingList(weekDates);
    // Navigate to Shopping tab and pass the list as params
    navigation.navigate("Shopping", {
      screen: "ShoppingListMain",
      params: { shoppingList: list },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── HEADER ── */}
        <View className="px-5 pt-4 pb-2 flex-row items-start justify-between">
          <View>
            <Text className="text-gray-400 text-sm font-medium">
              {formatWeekLabel(weekDates)}
            </Text>
            <Text className="text-gray-900 text-2xl font-bold mt-0.5">
              Meal Planner
            </Text>
          </View>

          {/* Total planned badge */}
          {totalPlanned > 0 && (
            <View className="bg-green-100 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 mt-1">
              <Ionicons name="restaurant-outline" size={13} color="#16a34a" />
              <Text className="text-green-700 font-bold text-sm">
                {totalPlanned} meals
              </Text>
            </View>
          )}
        </View>

        {/* ── DAY SELECTOR (horizontal scroll) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}
        >
          {weekDates.map((dateKey) => {
            const { day, date } = formatShortDate(dateKey);
            const isSelected    = dateKey === selectedDay;
            const todayFlag     = isToday(dateKey);

            // Count meals planned for this day for the dot indicators
            const dayData  = getMealsForDay(dateKey);
            const mealCount = Object.values(dayData).filter(Boolean).length;

            return (
              <TouchableOpacity
                key={dateKey}
                onPress={() => setSelectedDay(dateKey)}
                activeOpacity={0.8}
                className={`items-center px-3 py-3 rounded-2xl min-w-[52px] ${
                  isSelected
                    ? "bg-green-600"
                    : todayFlag
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50"
                }`}
              >
                <Text
                  className={`text-xs font-semibold mb-1 ${
                    isSelected ? "text-green-200" : "text-gray-400"
                  }`}
                >
                  {day}
                </Text>
                <Text
                  className={`text-base font-bold ${
                    isSelected ? "text-white" : todayFlag ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  {date}
                </Text>

                {/* Meal count dots */}
                <View className="flex-row gap-0.5 mt-1.5">
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        i < mealCount
                          ? isSelected ? "bg-green-200" : "bg-green-500"
                          : isSelected ? "bg-green-700" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── SELECTED DAY LABEL ── */}
        <View className="px-5 mb-4">
          <Text className="text-gray-900 font-bold text-lg">
            {formatDisplayDate(selectedDay)}
          </Text>
          {isToday(selectedDay) && (
            <View className="flex-row items-center gap-1 mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <Text className="text-green-600 text-xs font-semibold">Today</Text>
            </View>
          )}
        </View>

        {/* ── MEAL SLOTS ── */}
        <View className="px-5 gap-3">
          {MEAL_TYPES.map((meal) => {
            const assigned = dayMeals[meal.key];

            return (
              <View key={meal.key}>
                {/* Meal type label */}
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name={meal.icon} size={15} color="#6b7280" />
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                    {meal.label}
                  </Text>
                </View>

                {assigned ? (
                  // ── Filled slot ──────────────────────────────────────
                  <View
                    className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                  >
                    <Image
                      source={{ uri: assigned.image }}
                      className="w-14 h-14 rounded-xl"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-gray-900 font-bold text-sm mb-0.5" numberOfLines={1}>
                        {assigned.title}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={11} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs">{assigned.duration}</Text>
                      </View>
                    </View>

                    {/* Replace button */}
                    <TouchableOpacity
                      onPress={() => openPicker(meal.key)}
                      activeOpacity={0.7}
                      className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                    >
                      <Ionicons name="swap-horizontal" size={14} color="#6b7280" />
                    </TouchableOpacity>

                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => removeMeal(selectedDay, meal.key)}
                      activeOpacity={0.7}
                      className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
                    >
                      <Ionicons name="close" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  // ── Empty slot ───────────────────────────────────────
                  <TouchableOpacity
                    onPress={() => openPicker(meal.key)}
                    activeOpacity={0.8}
                    className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed ${meal.border} ${meal.bg}`}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm font-medium">
                      Add {meal.label}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* ── GENERATE SHOPPING LIST ── */}
        <View className="px-5 mt-8">
          {/* Divider */}
          <View className="h-px bg-gray-100 mb-6" />

          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2 text-center">
            Based on your full week plan
          </Text>

          <TouchableOpacity
            onPress={handleGenerateShoppingList}
            activeOpacity={0.85}
            className="bg-green-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
            style={{
              shadowColor: "#16a34a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text className="text-white font-bold text-base">
              Generate Shopping List
            </Text>
            {totalPlanned > 0 && (
              <View className="bg-white/20 px-2 py-0.5 rounded-full ml-1">
                <Text className="text-white text-xs font-bold">
                  {totalPlanned} meals
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── RECIPE PICKER MODAL ── */}
      <RecipePickerModal
        visible={pickerVisible}
        mealType={activeMealType}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectRecipe}
      />
    </SafeAreaView>
  );
}