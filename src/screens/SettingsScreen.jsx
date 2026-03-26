import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import Icon from "../components/Icon";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  scheduleDailyMealReminder,
  cancelMealReminders,
  isMealReminderScheduled,
  getScheduledReminderTime,
} from "../services/notificationService";

// ── MUST be set at module level, outside any component
// This controls how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

const HOURS = Array.from({ length: 13 }, (_, i) => i + 6); // 6am–6pm

export default function SettingsScreen({ navigation }) {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedHour,    setSelectedHour]    = useState(8);
  const [selectedMinute,  setSelectedMinute]  = useState(0);
  const [saving,          setSaving]          = useState(false);
  const [loaded,          setLoaded]          = useState(false);
  const [permStatus,      setPermStatus]      = useState("unknown");
  const [isRealDevice,    setIsRealDevice]    = useState(true);

  // ── Load state on mount
  useEffect(() => {
    const load = async () => {
      // Check if real device
      const realDevice = Device.isDevice;
      setIsRealDevice(realDevice);

      // Check current permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermStatus(status);
      console.log("[Settings] Device:", realDevice ? "REAL" : "SIMULATOR");
      console.log("[Settings] Permission status:", status);

      // Load scheduled reminder state
      const isScheduled = await isMealReminderScheduled();
      const time        = await getScheduledReminderTime();
      setReminderEnabled(isScheduled);
      if (time) {
        setSelectedHour(time.hour);
        setSelectedMinute(time.minute);
      }

      setLoaded(true);
    };
    load();
  }, []);

  // ── Request permission explicitly
  const handleRequestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermStatus(status);
    console.log("[Settings] Permission after request:", status);

    if (status === "granted") {
      Alert.alert("✅ Permission granted", "You can now enable notifications.");
    } else {
      Alert.alert(
        "Permission Denied",
        "Go to your phone Settings → Apps → Expo Go → Notifications → Enable"
      );
    }
  };

  // ── Send immediate test notification
  const handleTestNotification = async () => {
    console.log("[Test] Starting notification test...");
    console.log("[Test] Is real device:", Device.isDevice);

    // Step 1: Check permission
    const { status } = await Notifications.getPermissionsAsync();
    console.log("[Test] Current permission:", status);

    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      console.log("[Test] After request:", newStatus);
      if (newStatus !== "granted") {
        Alert.alert(
          "No Permission",
          "Notification permission is not granted.\n\nGo to: Settings → Apps → Expo Go → Notifications → Allow"
        );
        return;
      }
    }

    // Step 2: Create Android channel if needed
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("test-channel", {
        name:       "Test Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
      console.log("[Test] Android channel created");
    }

    // Step 3: Schedule the notification
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍽️ Test Notification",
          body:  "This is a test from Recipe Planner!",
          data:  { screen: "Planner" },
          // Android specific
          ...(Platform.OS === "android" && {
            channelId: "test-channel",
            priority:  "max",
          }),
        },
        trigger: {
          seconds: 3,
          // Do NOT add channelId inside trigger — it goes in content for Android
        },
      });

      console.log("[Test] Notification scheduled with id:", id);

      // Step 4: Verify it was scheduled
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log("[Test] Total scheduled notifications:", scheduled.length);
      console.log("[Test] Scheduled IDs:", scheduled.map(n => n.identifier));

      Alert.alert(
        "Notification Scheduled ✅",
        `ID: ${id}\n\nNotification will appear in 3 seconds.\n\nIf nothing appears, check that Do Not Disturb is OFF and notification permission is granted in phone Settings.`
      );
    } catch (error) {
      console.error("[Test] Failed to schedule:", error);
      Alert.alert("Failed", `Error: ${error.message}`);
    }
  };

  // ── Cancel all notifications
  const handleCancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const remaining = await Notifications.getAllScheduledNotificationsAsync();
    console.log("[Test] After cancel, remaining:", remaining.length);
    Alert.alert("Cancelled", `All notifications cancelled.\nRemaining: ${remaining.length}`);
  };

  // ── Toggle reminder
  const handleToggle = async (value) => {
    setReminderEnabled(value);
    setSaving(true);
    try {
      if (value) {
        const success = await scheduleDailyMealReminder(selectedHour, selectedMinute);
        if (!success) {
          setReminderEnabled(false);
          Alert.alert(
            "Permission Required",
            "Please enable notifications in your phone's Settings app."
          );
        } else {
          Alert.alert(
            "Reminder Set ✅",
            `Daily reminder set for ${formatTime(selectedHour, selectedMinute)}`
          );
        }
      } else {
        await cancelMealReminders();
      }
    } catch (e) {
      console.error("[Settings] Toggle error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (hour, minute) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    if (reminderEnabled) {
      setSaving(true);
      try {
        await scheduleDailyMealReminder(hour, minute);
      } finally {
        setSaving(false);
      }
    }
  };

  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const h      = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const m      = String(minute).padStart(2, "0");
    return `${h}:${m} ${period}`;
  };

  if (!loaded) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── HEADER ── */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-gray-400 text-sm font-medium">Preferences</Text>
          <Text className="text-gray-900 text-2xl font-bold mt-0.5">Settings</Text>
        </View>

        {/* ── DIAGNOSTIC SECTION ── */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Notification Status
          </Text>

          <View
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            {/* Device type */}
            <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <View className="flex-row items-center gap-3">
                <Icon name="phone-portrait-outline" size={16} color="#9ca3af" />
                <Text className="text-gray-600 text-sm">Device Type</Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${isRealDevice ? "bg-green-50" : "bg-red-50"}`}>
                <Text className={`text-xs font-bold ${isRealDevice ? "text-green-600" : "text-red-500"}`}>
                  {isRealDevice ? "Real Device ✅" : "Simulator ⚠️"}
                </Text>
              </View>
            </View>

            {/* Permission status */}
            <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <View className="flex-row items-center gap-3">
                <Icon name="shield-checkmark-outline" size={16} color="#9ca3af" />
                <Text className="text-gray-600 text-sm">Permission</Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${
                permStatus === "granted" ? "bg-green-50" : "bg-red-50"
              }`}>
                <Text className={`text-xs font-bold capitalize ${
                  permStatus === "granted" ? "text-green-600" : "text-red-500"
                }`}>
                  {permStatus === "granted" ? "Granted ✅" : `${permStatus} ❌`}
                </Text>
              </View>
            </View>

            {/* Request permission button — shown when not granted */}
            {permStatus !== "granted" && (
              <TouchableOpacity
                onPress={handleRequestPermission}
                activeOpacity={0.8}
                className="mx-4 my-3 bg-green-600 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold text-sm">
                  Request Notification Permission
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── TEST SECTION ── */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Test Notifications
          </Text>

          <View
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            {/* Test button */}
            <TouchableOpacity
              onPress={handleTestNotification}
              activeOpacity={0.8}
              className="flex-row items-center gap-3 px-4 py-4 border-b border-gray-50"
            >
              <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
                <Icon name="notifications-outline" size={18} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-sm">
                  Send Test Notification
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  Fires in 3 seconds — background the app after tapping
                </Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#d1d5db" />
            </TouchableOpacity>

            {/* Cancel all */}
            <TouchableOpacity
              onPress={handleCancelAll}
              activeOpacity={0.8}
              className="flex-row items-center gap-3 px-4 py-4"
            >
              <View className="w-9 h-9 rounded-full bg-red-50 items-center justify-center">
                <Icon name="close-circle-outline" size={18} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-sm">
                  Cancel All Notifications
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  Clears all scheduled notifications
                </Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#d1d5db" />
            </TouchableOpacity>
          </View>

          {/* Important note for Android */}
          {Platform.OS === "android" && (
            <View className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex-row gap-2">
              <Icon name="information-circle-outline" size={16} color="#d97706" />
              <Text className="text-amber-700 text-xs flex-1 leading-5">
                After tapping "Send Test", press the Home button to background the app. The notification appears in your notification shade.
              </Text>
            </View>
          )}
        </View>

        {/* ── REMINDER TOGGLE SECTION ── */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Meal Reminders
          </Text>

          <View
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <View className="h-1 w-full bg-green-500" />
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                    <Icon name="alarm-outline" size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-sm">
                      Daily Reminder
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {reminderEnabled
                        ? `Every day at ${formatTime(selectedHour, selectedMinute)}`
                        : "Tap to enable morning reminders"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={handleToggle}
                  disabled={saving || permStatus !== "granted"}
                  trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                  thumbColor={reminderEnabled ? "#16a34a" : "#f3f4f6"}
                  ios_backgroundColor="#e5e7eb"
                />
              </View>
              {permStatus !== "granted" && (
                <Text className="text-xs text-red-400 mt-2 ml-13">
                  Grant notification permission above to enable reminders
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── TIME PICKER ── */}
        {reminderEnabled && (
          <View className="px-5 mb-6">
            <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Reminder Time
            </Text>
            <View
              className="bg-white border border-gray-100 rounded-2xl p-4"
              style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
            >
              <View className="items-center mb-5">
                <Text className="text-5xl font-black text-gray-900">
                  {formatTime(selectedHour, selectedMinute)}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">Daily notification time</Text>
              </View>

              {/* Hour picker */}
              <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Hour
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
              >
                {HOURS.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    onPress={() => handleTimeChange(hour, selectedMinute)}
                    activeOpacity={0.7}
                    className={`w-12 h-12 rounded-xl items-center justify-center border ${
                      selectedHour === hour
                        ? "bg-green-600 border-green-600"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <Text className={`text-sm font-bold ${selectedHour === hour ? "text-white" : "text-gray-600"}`}>
                      {hour > 12 ? hour - 12 : hour}
                    </Text>
                    <Text className={`text-[9px] font-semibold ${selectedHour === hour ? "text-green-200" : "text-gray-400"}`}>
                      {hour >= 12 ? "PM" : "AM"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Minute picker */}
              <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-4 mb-2">
                Minute
              </Text>
              <View className="flex-row gap-2">
                {[0, 15, 30, 45].map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    onPress={() => handleTimeChange(selectedHour, minute)}
                    activeOpacity={0.7}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      selectedMinute === minute
                        ? "bg-green-600 border-green-600"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <Text className={`text-sm font-bold ${selectedMinute === minute ? "text-white" : "text-gray-600"}`}>
                      :{String(minute).padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {saving && (
                <View className="flex-row items-center justify-center gap-2 mt-4">
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                  <Text className="text-green-600 text-xs font-semibold">Updating...</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── ABOUT ── */}
        <View className="px-5">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            About
          </Text>
          <View
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            {[
              { icon: "restaurant-outline",     label: "Recipe Planner", value: "v1.0.0"          },
              { icon: "phone-portrait-outline",  label: "Platform",      value: Platform.OS === "ios" ? "iOS" : "Android" },
              { icon: "server-outline",          label: "Storage",       value: "Local (SQLite)"   },
            ].map(({ icon, label, value }, i, arr) => (
              <View
                key={label}
                className={`flex-row items-center justify-between px-4 py-3.5 ${
                  i < arr.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <Icon name={icon} size={16} color="#9ca3af" />
                  <Text className="text-gray-600 text-sm">{label}</Text>
                </View>
                <Text className="text-gray-400 text-xs font-semibold">{value}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}