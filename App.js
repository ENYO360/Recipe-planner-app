// App.js
import "react-native-gesture-handler";
import "./global.css";
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator }     from "@react-navigation/stack";
import { Ionicons }                 from "@expo/vector-icons";
import { RecipeProvider, useRecipes } from "./src/context/RecipeContext";

import HomeScreen         from "./src/screens/HomeScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import MealPlannerScreen  from "./src/screens/MealPlannerScreen";
import ShoppingListScreen from "./src/screens/ShoppingListScreen";
import AddRecipeScreen    from "./src/screens/AddRecipeScreen";
import FavouritesScreen   from "./src/screens/FavouritesScreen";

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

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:            false,
        tabBarActiveTintColor:   "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor:  "#f3f4f6",
          paddingBottom:   8,
          paddingTop:      8,
          height:          65,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack}
        options={{ tabBarIcon: ({ color, size }) =>
          <Ionicons name="home" color={color} size={size} /> }} />
      <Tab.Screen name="Planner" component={MealPlannerStack}
        options={{ tabBarIcon: ({ color, size }) =>
          <Ionicons name="calendar" color={color} size={size} /> }} />
      <Tab.Screen name="Add" component={AddRecipeStack}
        options={{ tabBarIcon: ({ color, size }) =>
          <Ionicons name="add-circle" color={color} size={size} /> }} />
      <Tab.Screen name="Shopping" component={ShoppingListStack}
        options={{ tabBarIcon: ({ color, size }) =>
          <Ionicons name="cart" color={color} size={size} /> }} />
      <Tab.Screen name="Favourites" component={FavouritesStack}
        options={{ tabBarIcon: ({ color, size }) =>
          <Ionicons name="heart" color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <RecipeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </RecipeProvider>
  );
}