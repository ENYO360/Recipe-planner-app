// App.js
import "react-native-gesture-handler";
import "./global.css";
import "./src/services/notificationService";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import * as ExpoSplashScreen from "expo-splash-screen";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from "react-native-reanimated";

import { RecipeProvider } from "./src/context/RecipeContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { requestNotificationPermission } from "./src/services/notificationService";
import SplashScreen from "./src/screens/SplashScreen";
import Icon from "./src/components/Icon";

import HomeScreen         from "./src/screens/HomeScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import MealPlannerScreen  from "./src/screens/MealPlannerScreen";
import ShoppingListScreen from "./src/screens/ShoppingListScreen";
import AddRecipeScreen    from "./src/screens/AddRecipeScreen";
import FavouritesScreen   from "./src/screens/FavouritesScreen";
import SettingsScreen     from "./src/screens/SettingsScreen";

// No font loading needed — SVG icons don't use font files
ExpoSplashScreen.preventAutoHideAsync();

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain"     component={HomeScreen}         />
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

// ── Animated tab icon using our local SVG Icon component ─────────────────────
function AnimatedTabIcon({ name, color, size, focused }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 6,  stiffness: 400 }),
        withSpring(1,   { damping: 10, stiffness: 200 })
      );
    }
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Icon name={name} size={size} color={color} />
    </Animated.View>
  );
}

function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   "#16a34a",
        tabBarInactiveTintColor: isDark ? "#6b7280" : "#9ca3af",
        tabBarStyle: {
          backgroundColor: isDark ? "#111827" : "#ffffff",
          borderTopColor:  isDark ? "#1f2937" : "#f3f4f6",
          paddingBottom: 8,
          paddingTop:    8,
          height:        65,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack}
        options={{ tabBarIcon: ({ color, size, focused }) =>
          <AnimatedTabIcon name="home" color={color} size={size} focused={focused} /> }}
      />
      <Tab.Screen name="Planner" component={MealPlannerStack}
        options={{ tabBarIcon: ({ color, size, focused }) =>
          <AnimatedTabIcon name="calendar" color={color} size={size} focused={focused} /> }}
      />
      <Tab.Screen name="Add" component={AddRecipeStack}
        options={{ tabBarIcon: ({ color, size, focused }) =>
          <AnimatedTabIcon name="add-circle" color={color} size={size} focused={focused} /> }}
      />
      <Tab.Screen name="Shopping" component={ShoppingListStack}
        options={{ tabBarIcon: ({ color, size, focused }) =>
          <AnimatedTabIcon name="cart" color={color} size={size} focused={focused} /> }}
      />
      <Tab.Screen name="Favourites" component={FavouritesStack}
        options={{ tabBarIcon: ({ color, size, focused }) =>
          <AnimatedTabIcon name="heart" color={color} size={size} focused={focused} /> }}
      />
      <Tab.Screen name="Settings" component={SettingsStack}
        options={{ tabBarIcon: ({ color, size, focused }) =>
          <AnimatedTabIcon name="settings-outline" color={color} size={size} focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appReady,         setAppReady]         = useState(false);
  const navigationRef = useRef(null);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    // No font loading needed with SVG icons
    // Just mark ready immediately
    setAppReady(true);
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        navigationRef.current.navigate(screen);
      }
    });

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        navigationRef.current.navigate(screen);
      }
    });

    return () => sub.remove();
  }, []);

  if (!appReady) return null;

  return (
    <ThemeProvider>
      <RecipeProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          {showCustomSplash ? (
            <SplashScreen onFinish={() => setShowCustomSplash(false)} />
          ) : (
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          )}
        </View>
      </RecipeProvider>
    </ThemeProvider>
  );
}