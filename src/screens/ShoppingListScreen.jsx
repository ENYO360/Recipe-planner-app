// src/screens/ShoppingListScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useShoppingList } from "../hooks/useShoppingList";

export default function ShoppingListScreen({ navigation, route }) {
  // Receive shopping list generated from Meal Planner (may be undefined)
  const incomingList = route.params?.shoppingList ?? null;

  const {
    items,
    loading,
    checkedCount,
    totalCount,
    progressPercent,
    toggleItem,
    removeItem,
    addItem,
    clearChecked,
    clearAll,
  } = useShoppingList(incomingList);

  const [newItemText, setNewItemText] = useState("");
  const [showInput,   setShowInput]   = useState(false);

  // ── Confirm before clearing all ──────────────────────────────────────
  const handleClearAll = () => {
    Alert.alert(
      "Clear List",
      "Are you sure you want to remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: clearAll },
      ]
    );
  };

  const handleClearChecked = () => {
    if (checkedCount === 0) return;
    Alert.alert(
      "Remove Checked",
      `Remove ${checkedCount} checked item${checkedCount !== 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: clearChecked },
      ]
    );
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    addItem(newItemText);
    setNewItemText("");
    setShowInput(false);
  };

  // ── Separate checked and unchecked items ─────────────────────────────
  // Unchecked items appear at top, checked at bottom
  const unchecked = items.filter((i) => !i.checked);
  const checked   = items.filter((i) => i.checked);
  const sortedItems = [...unchecked, ...checked];

  // ── List header ───────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      {/* Page header */}
      <View className="px-5 pt-4 pb-2 flex-row items-start justify-between">
        <View>
          <Text className="text-gray-400 text-sm font-medium">This week</Text>
          <Text className="text-gray-900 text-2xl font-bold mt-0.5">
            Shopping List
          </Text>
        </View>

        {/* Actions menu */}
        {totalCount > 0 && (
          <View className="flex-row gap-2 mt-1">
            {checkedCount > 0 && (
              <TouchableOpacity
                onPress={handleClearChecked}
                activeOpacity={0.7}
                className="bg-gray-100 px-3 py-1.5 rounded-full"
              >
                <Text className="text-gray-500 text-xs font-semibold">
                  Remove checked
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleClearAll}
              activeOpacity={0.7}
              className="bg-red-50 px-3 py-1.5 rounded-full"
            >
              <Text className="text-red-500 text-xs font-semibold">
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress section */}
      {totalCount > 0 && (
        <View className="px-5 py-4">
          {/* Stats row */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-500 text-sm">
              <Text className="text-gray-900 font-bold">{checkedCount}</Text>
              {" of "}
              <Text className="text-gray-900 font-bold">{totalCount}</Text>
              {" items checked"}
            </Text>
            <Text className="text-green-600 font-bold text-sm">
              {progressPercent}%
            </Text>
          </View>

          {/* Progress bar */}
          <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>

          {/* Completion message */}
          {progressPercent === 100 && (
            <View className="flex-row items-center gap-2 mt-3 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl">
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text className="text-green-700 text-sm font-semibold">
                All done! You're ready to cook. 🎉
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Add item input */}
      {showInput ? (
        <View className="mx-5 mb-4 flex-row items-center gap-2">
          <TextInput
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder="e.g. Olive oil"
            placeholderTextColor="#9ca3af"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
            className="flex-1 border border-green-300 rounded-xl bg-green-50 px-4 py-3 text-gray-800 text-sm"
          />
          <TouchableOpacity
            onPress={handleAddItem}
            activeOpacity={0.8}
            className="bg-green-600 w-10 h-10 rounded-xl items-center justify-center"
          >
            <Ionicons name="checkmark" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setShowInput(false); setNewItemText(""); }}
            activeOpacity={0.8}
            className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center"
          >
            <Ionicons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowInput(true)}
          activeOpacity={0.7}
          className="mx-5 mb-4 flex-row items-center gap-2 border border-dashed border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
        >
          <Ionicons name="add-circle-outline" size={18} color="#9ca3af" />
          <Text className="text-gray-400 text-sm font-medium">
            Add item manually
          </Text>
        </TouchableOpacity>
      )}

      {/* Section label for unchecked items */}
      {unchecked.length > 0 && (
        <View className="px-5 mb-2">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-400">
            To get ({unchecked.length})
          </Text>
        </View>
      )}
    </View>
  );

  // ── Separator between unchecked and checked sections ─────────────────
  const renderSeparator = (index) => {
    const isLastUnchecked = index === unchecked.length - 1 && checked.length > 0;
    if (!isLastUnchecked) return null;
    return (
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Checked ({checked.length})
        </Text>
      </View>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-10 py-20">
      <View className="w-24 h-24 rounded-full bg-green-50 items-center justify-center mb-5">
        <Ionicons name="cart-outline" size={44} color="#86efac" />
      </View>
      <Text className="text-gray-900 font-bold text-xl mb-2 text-center">
        Your list is empty
      </Text>
      <Text className="text-gray-400 text-sm text-center leading-6 mb-8">
        Add items manually or generate a list from your Meal Planner.
      </Text>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Planner", { screen: "MealPlannerMain" })
        }
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
        <Ionicons name="calendar-outline" size={18} color="white" />
        <Text className="text-white font-bold text-sm">
          Go to Meal Planner
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Loading your list...</Text>
      </SafeAreaView>
    );
  }

  return (
    // GestureHandlerRootView must wrap any screen using Swipeable
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <FlatList
            data={sortedItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View>
                {/* Section separator between unchecked and checked */}
                {renderSeparator(index - 1)}

                <SwipeableItem
                  item={item}
                  onToggle={toggleItem}
                  onDelete={removeItem}
                />
              </View>
            )}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={EmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            // Important — keeps FlatList from stealing gestures from Swipeable
            keyboardShouldPersistTaps="handled"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ── SwipeableItem defined here to keep imports clean ─────────────────────────
import { Swipeable } from "react-native-gesture-handler";
import { Animated } from "react-native";

function SwipeableItem({ item, onToggle, onDelete }) {
  const swipeableRef = React.useRef(null);

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange:  [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(item.id);
        }}
        activeOpacity={0.8}
        className="bg-red-500 items-center justify-center rounded-r-2xl"
        style={{ width: 72 }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={22} color="white" />
        </Animated.View>
        <Text className="text-white text-[10px] font-bold mt-1">Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
        className="flex-row items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-50"
      >
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center flex-shrink-0 ${
            item.checked
              ? "bg-green-500 border-green-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {item.checked && (
            <Ionicons name="checkmark" size={13} color="white" />
          )}
        </View>

        <Text
          className={`flex-1 text-sm font-medium ${
            item.checked ? "line-through text-gray-300" : "text-gray-800"
          }`}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {(item.amount > 0 || item.unit) && (
          <Text
            className={`text-xs font-semibold ${
              item.checked ? "text-gray-300" : "text-gray-400"
            }`}
          >
            {item.amount > 0 ? item.amount : ""} {item.unit}
          </Text>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}