// App.js
import "react-native-gesture-handler";
import "./global.css";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RecipeProvider, useRecipes } from "./src/context/RecipeContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { requestNotificationPermission } from "./src/services/notificationService";
import * as Notifications from "expo-notifications"
import "./src/services/notificationService";
import * as ExpoSplashScreen from "expo-splash-screen";
import SplashScreen from "./src/screens/SplashScreen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

import HomeScreen from "./src/screens/HomeScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import MealPlannerScreen from "./src/screens/MealPlannerScreen";
import ShoppingListScreen from "./src/screens/ShoppingListScreen";
import AddRecipeScreen from "./src/screens/AddRecipeScreen";
import FavouritesScreen from "./src/screens/FavouritesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Keep the native splash visible until our JS splash is ready
ExpoSplashScreen.preventAutoHideAsync();

function AnimatedTabIcon({ name, color, size, focused }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

function MealPlannerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MealPlannerMain" component={MealPlannerScreen} />
    </Stack.Navigator>
  );
}

function ShoppingListStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShoppingListMain" component={ShoppingListScreen} />
    </Stack.Navigator>
  );
}

function AddRecipeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddRecipeMain" component={AddRecipeScreen} />
    </Stack.Navigator>
  );
}

function FavouritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavouritesMain" component={FavouritesScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#f3f4f6",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="home" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Planner"
        component={MealPlannerStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="calendar" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddRecipeStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="add-circle" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingListStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="cart" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={FavouritesStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="heart" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen name="Settings" component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            <AnimatedTabIcon name="settings-outline" color={color} size={size} focused={focused} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const navigationRef = useRef(null);

  // Hide native splash as soon as component mounts
  const onLayoutRootView = useCallback(async () => {
    await ExpoSplashScreen.hideAsync();
  }, []);

  // Called by SplashScreen component when its animation ends
  const handleSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // ── Request notification permission on first launch ───────────────────
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // ── Handle notification tap — navigate to the right screen ───────────
  useEffect(() => {
    // App was opened BY tapping a notification (app was closed/background)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        navigationRef.current.navigate(screen);
      }
    });

    // App is open and user taps a notification (foreground)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen;
        if (screen && navigationRef.current) {
          navigationRef.current.navigate(screen);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider>
      <RecipeProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          {showCustomSplash ? (
            // Show our animated splash first
            <SplashScreen onFinish={handleSplashFinish} />
          ) : (
            // Then show the full app
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          )}
        </View>
      </RecipeProvider>
    </ThemeProvider>
  );
}