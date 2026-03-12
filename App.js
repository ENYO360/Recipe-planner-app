// App.js
import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { RecipeProvider } from "./src/context/RecipeContext";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import MealPlannerScreen from "./src/screens/MealPlannerScreen";
import ShoppingListScreen from "./src/screens/ShoppingListScreen";
import AddRecipeScreen from "./src/screens/AddRecipeScreen";
import FavouritesScreen from "./src/screens/FavouritesScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Each tab gets its own Stack so navigation inside one tab doesn't reset the other
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

// Tab bar icon helper
function TabIcon({name, color, size}) {
  return <Ionicons name={name} size={size} color={color} />
}

export default function App() {
  return (
    <RecipeProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor:   "#16a34a", // green-600
            tabBarInactiveTintColor: "#9ca3af", // gray-400
            tabBarStyle: {
              backgroundColor: "#ffffff",
              borderTopColor:  "#f3f4f6",
              paddingBottom:   8,
              paddingTop:      8,
              height:          65,
            },
            tabBarLabelStyle: {
              fontSize:   11,
              fontWeight: "600",
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{
              tabBarIcon: ({ color, size }) =>
                <TabIcon name="home" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Planner"
            component={MealPlannerStack}
            options={{
              tabBarIcon: ({ color, size }) =>
                <TabIcon name="calendar" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Add"
            component={AddRecipeStack}
            options={{
              tabBarIcon: ({ color, size }) =>
                <TabIcon name="add-circle" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Shopping"
            component={ShoppingListStack}
            options={{
              tabBarIcon: ({ color, size }) =>
                <TabIcon name="cart" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Favourites"
            component={FavouritesStack}
            options={{
              tabBarIcon: ({ color, size }) =>
                <TabIcon name="heart" color={color} size={size} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </RecipeProvider>
  );
}