// src/components/SwipeableItem.jsx
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function SwipeableItem({ item, onToggle, onDelete }) {
  const swipeableRef = useRef(null);

  // The red panel that slides in from the right
  const renderRightActions = (progress, dragX) => {
    // Interpolate the drag position to scale the trash icon
    const scale = dragX.interpolate({
      inputRange:  [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        onPress={() => {
          swipeableRef.current?.close(); // snap row back before deleting
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
      rightThreshold={40}       // how far to swipe before snapping open
      overshootRight={false}    // don't bounce past the action panel
    >
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
        className={`flex-row items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-50`}
      >
        {/* Checkbox */}
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

        {/* Item name */}
        <Text
          className={`flex-1 text-sm font-medium ${
            item.checked ? "line-through text-gray-300" : "text-gray-800"
          }`}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {/* Amount + unit */}
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