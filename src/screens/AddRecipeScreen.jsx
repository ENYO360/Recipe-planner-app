// src/screens/AddRecipeScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRecipes } from "../context/RecipeContext";

// ── Reusable labelled input ───────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 text-xs font-bold uppercase tracking-widest mb-1.5">
        {label}
      </Text>
      {children}
    </View>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────
const INPUT_CLASS =
  "border border-gray-200 rounded-xl bg-gray-50 px-4 py-3 text-gray-800 text-sm";

// ── Category and difficulty options ──────────────────────────────────────────
const CATEGORIES  = ["breakfast", "lunch", "dinner", "snacks", "dessert"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function AddRecipeScreen({ navigation }) {
  const { addRecipe } = useRecipes();

  // ── Form state ────────────────────────────────────────────────────────
  const [image,       setImage]       = useState(null);
  const [title,       setTitle]       = useState("");
  const [category,    setCategory]    = useState("dinner");
  const [difficulty,  setDifficulty]  = useState("Easy");
  const [duration,    setDuration]    = useState("");
  const [servings,    setServings]    = useState("2");
  const [description, setDescription] = useState("");

  const [ingredients, setIngredients] = useState([
    { id: "1", name: "", amount: "", unit: "" },
  ]);

  const [steps, setSteps] = useState([""]);

  // ── Image picker ──────────────────────────────────────────────────────
  const pickImage = async () => {
    // Show action sheet — camera or gallery
    Alert.alert(
      "Add Photo",
      "Choose a source",
      [
        {
          text: "Camera",
          onPress: async () => {
            // Request camera permission first
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission needed", "Camera access is required.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],    // crop ratio
              quality: 0.8,      // 80% quality to reduce file size
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission needed", "Photo library access is required.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // ── Ingredient helpers ────────────────────────────────────────────────
  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", amount: "", unit: "" },
    ]);
  };

  const updateIngredient = (id, field, value) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const removeIngredient = (id) => {
    // Don't allow removing the last ingredient row
    if (ingredients.length === 1) return;
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  // ── Step helpers ──────────────────────────────────────────────────────
  const addStep = () => {
    setSteps((prev) => [...prev, ""]);
  };

  const updateStep = (index, value) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const removeStep = (index) => {
    if (steps.length === 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validation & save ─────────────────────────────────────────────────
  const handleSave = () => {
    // Basic validation
    if (!title.trim()) {
      Alert.alert("Missing info", "Please enter a recipe name.");
      return;
    }
    if (!duration.trim()) {
      Alert.alert("Missing info", "Please enter a duration (e.g. 30 mins).");
      return;
    }
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert("Missing info", "Please add at least one ingredient.");
      return;
    }
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      Alert.alert("Missing info", "Please add at least one step.");
      return;
    }

    // Build recipe object matching our data shape
    const newRecipe = {
      title:       title.trim(),
      category,
      difficulty,
      duration:    duration.trim(),
      servings:    parseInt(servings) || 2,
      description: description.trim(),
      image:       image ?? "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400",
      ingredients: validIngredients.map((ing, i) => ({
        id:     `i${i + 1}`,
        name:   ing.name.trim(),
        amount: parseFloat(ing.amount) || 1,
        unit:   ing.unit.trim(),
      })),
      steps: validSteps,
    };

    addRecipe(newRecipe);

    Alert.alert("Recipe saved! 🎉", `${newRecipe.title} has been added.`, [
      {
        text: "View Recipe",
        onPress: () => {
          // Reset form
          resetForm();
          // Navigate to Home tab
          navigation.navigate("Home");
        },
      },
      {
        text: "Add Another",
        onPress: resetForm,
      },
    ]);
  };

  const resetForm = () => {
    setImage(null);
    setTitle("");
    setCategory("dinner");
    setDifficulty("Easy");
    setDuration("");
    setServings("2");
    setDescription("");
    setIngredients([{ id: "1", name: "", amount: "", unit: "" }]);
    setSteps([""]);
  };

  // ── Option pill selector (used for category + difficulty) ─────────────
  const OptionSelector = ({ options, value, onChange }) => (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          activeOpacity={0.7}
          className={`px-4 py-2 rounded-full border ${
            value === option
              ? "bg-green-600 border-green-600"
              : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-xs font-semibold capitalize ${
              value === option ? "text-white" : "text-gray-500"
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* KeyboardAvoidingView wraps everything so the form lifts
          up when the keyboard appears */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          // Dismiss keyboard when user scrolls — great UX on forms
          keyboardShouldPersistTaps="handled"
        >
          {/* ── HEADER ── */}
          <View className="px-5 pt-4 pb-6">
            <Text className="text-gray-400 text-sm font-medium">Create</Text>
            <Text className="text-gray-900 text-2xl font-bold mt-0.5">
              New Recipe
            </Text>
          </View>

          <View className="px-5 space-y-1">

            {/* ── IMAGE UPLOAD ── */}
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              className="mb-6 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50"
              style={{ height: 180 }}
            >
              {image ? (
                // Show selected image
                <View className="relative w-full h-full">
                  <Image
                    source={{ uri: image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {/* Edit overlay */}
                  <View className="absolute inset-0 bg-black/20 items-center justify-center">
                    <View className="bg-white/90 rounded-full px-4 py-2 flex-row items-center gap-2">
                      <Ionicons name="camera" size={14} color="#374151" />
                      <Text className="text-gray-700 text-xs font-bold">
                        Change Photo
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                // Upload placeholder
                <View className="flex-1 items-center justify-center gap-2">
                  <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center">
                    <Ionicons name="camera-outline" size={26} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-400 text-sm font-medium">
                    Add a photo
                  </Text>
                  <Text className="text-gray-300 text-xs">
                    Tap to open camera or gallery
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ── RECIPE NAME ── */}
            <Field label="Recipe Name">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Chicken Tikka Masala"
                placeholderTextColor="#9ca3af"
                className={INPUT_CLASS}
                returnKeyType="next"
              />
            </Field>

            {/* ── CATEGORY ── */}
            <Field label="Category">
              <OptionSelector
                options={CATEGORIES}
                value={category}
                onChange={setCategory}
              />
            </Field>

            {/* ── DIFFICULTY ── */}
            <Field label="Difficulty">
              <OptionSelector
                options={DIFFICULTIES}
                value={difficulty}
                onChange={setDifficulty}
              />
            </Field>

            {/* ── DURATION + SERVINGS (side by side) ── */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 text-xs font-bold uppercase tracking-widest mb-1.5">
                  Duration
                </Text>
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="e.g. 30 mins"
                  placeholderTextColor="#9ca3af"
                  className={INPUT_CLASS}
                  returnKeyType="next"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 text-xs font-bold uppercase tracking-widest mb-1.5">
                  Servings
                </Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  placeholder="2"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  className={INPUT_CLASS}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* ── DESCRIPTION ── */}
            <Field label="Description">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your recipe briefly..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"   // Android fix for multiline inputs
                className={`${INPUT_CLASS} min-h-[80px]`}
              />
            </Field>

            {/* ── INGREDIENTS ── */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 text-xs font-bold uppercase tracking-widest">
                  Ingredients
                </Text>
                <Text className="text-gray-400 text-xs">
                  {ingredients.filter((i) => i.name).length} added
                </Text>
              </View>

              <View className="gap-2">
                {ingredients.map((ing, index) => (
                  <View key={ing.id} className="flex-row items-center gap-2">
                    {/* Row number */}
                    <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center flex-shrink-0">
                      <Text className="text-green-700 text-[10px] font-bold">
                        {index + 1}
                      </Text>
                    </View>

                    {/* Name input — takes most space */}
                    <TextInput
                      value={ing.name}
                      onChangeText={(v) => updateIngredient(ing.id, "name", v)}
                      placeholder="Ingredient"
                      placeholderTextColor="#9ca3af"
                      className="flex-1 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 text-gray-800 text-sm"
                    />

                    {/* Amount input — fixed small width */}
                    <TextInput
                      value={ing.amount}
                      onChangeText={(v) => updateIngredient(ing.id, "amount", v)}
                      placeholder="Amt"
                      placeholderTextColor="#9ca3af"
                      keyboardType="decimal-pad"
                      className="w-14 border border-gray-200 rounded-xl bg-gray-50 px-2 py-2.5 text-gray-800 text-sm text-center"
                    />

                    {/* Unit input */}
                    <TextInput
                      value={ing.unit}
                      onChangeText={(v) => updateIngredient(ing.id, "unit", v)}
                      placeholder="Unit"
                      placeholderTextColor="#9ca3af"
                      className="w-16 border border-gray-200 rounded-xl bg-gray-50 px-2 py-2.5 text-gray-800 text-sm text-center"
                    />

                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => removeIngredient(ing.id)}
                      activeOpacity={0.7}
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        ingredients.length === 1 ? "bg-gray-100" : "bg-red-50"
                      }`}
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color={ingredients.length === 1 ? "#d1d5db" : "#ef4444"}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add ingredient button */}
              <TouchableOpacity
                onPress={addIngredient}
                activeOpacity={0.7}
                className="flex-row items-center justify-center gap-2 mt-3 py-3 border border-dashed border-green-300 rounded-xl bg-green-50"
              >
                <Ionicons name="add-circle-outline" size={16} color="#16a34a" />
                <Text className="text-green-700 text-sm font-semibold">
                  Add Ingredient
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── STEPS ── */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 text-xs font-bold uppercase tracking-widest">
                  Steps
                </Text>
                <Text className="text-gray-400 text-xs">
                  {steps.filter((s) => s.trim()).length} added
                </Text>
              </View>

              <View className="gap-2">
                {steps.map((step, index) => (
                  <View key={index} className="flex-row items-start gap-2">
                    {/* Step number */}
                    <View className="w-7 h-7 rounded-full bg-gray-900 items-center justify-center flex-shrink-0 mt-2.5">
                      <Text className="text-white text-[11px] font-bold">
                        {index + 1}
                      </Text>
                    </View>

                    {/* Step text input */}
                    <TextInput
                      value={step}
                      onChangeText={(v) => updateStep(index, v)}
                      placeholder={`Step ${index + 1}...`}
                      placeholderTextColor="#9ca3af"
                      multiline
                      textAlignVertical="top"
                      className="flex-1 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 text-gray-800 text-sm min-h-[44px]"
                    />

                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => removeStep(index)}
                      activeOpacity={0.7}
                      className={`w-8 h-8 rounded-full items-center justify-center mt-2 ${
                        steps.length === 1 ? "bg-gray-100" : "bg-red-50"
                      }`}
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color={steps.length === 1 ? "#d1d5db" : "#ef4444"}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add step button */}
              <TouchableOpacity
                onPress={addStep}
                activeOpacity={0.7}
                className="flex-row items-center justify-center gap-2 mt-3 py-3 border border-dashed border-gray-300 rounded-xl bg-gray-50"
              >
                <Ionicons name="add-circle-outline" size={16} color="#6b7280" />
                <Text className="text-gray-500 text-sm font-semibold">
                  Add Step
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── SAVE BUTTON ── */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              className="bg-green-600 rounded-2xl py-4 items-center flex-row justify-center gap-2"
              style={{
                shadowColor: "#16a34a",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-bold text-base">
                Save Recipe
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}