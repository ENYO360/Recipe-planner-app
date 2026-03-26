import * as Notifications from "expo-notifications";
import * as Device        from "expo-device";
import { Platform }       from "react-native";

// ── CRITICAL: must be called at module level
// Controls notification appearance when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

// ── Android notification channel
// Must be created before scheduling any notifications on Android
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("meal-reminders", {
    name:             "Meal Reminders",
    importance:       Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor:       "#16a34a",
    sound:            "default",
  });
}

// ── Request permission
export async function requestNotificationPermission() {
  if (!Device.isDevice) {
    console.log("[Notifications] Not a real device — skipping permission request");
    return false;
  }

  await ensureAndroidChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  console.log("[Notifications] Permission status:", finalStatus);
  return finalStatus === "granted";
}

// ── Schedule a daily repeating notification
export async function scheduleDailyMealReminder(hour = 8, minute = 0) {
  await cancelMealReminders();

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await ensureAndroidChannel();

  // ── Trigger format differs between expo-notifications versions
  // v0.28+ uses the object format below. If you get a trigger error,
  // see the fallback format in the comments beneath.
  await Notifications.scheduleNotificationAsync({
    content: {
      title:     "🍽️ Good morning! Check your meals",
      body:      "Tap to see what you have planned for today.",
      data:      { screen: "Planner" },
      sound:     "default",
      // Android requires channelId in content
      ...(Platform.OS === "android" && { channelId: "meal-reminders" }),
    },
    trigger: {
      type:    Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      repeats: true,
    },
    // ── Fallback if above trigger causes errors ──
    // trigger: { hour, minute, repeats: true },
  });

  console.log(`[Notifications] Daily reminder scheduled at ${hour}:${String(minute).padStart(2, "0")}`);
  return true;
}

// ── Schedule with actual meal names
export async function scheduleMealPlanNotification(mealsToday, hour = 8, minute = 0) {
  await cancelMealReminders();

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await ensureAndroidChannel();

  const mealLines = Object.entries(mealsToday)
    .filter(([, meal]) => meal !== null)
    .map(([type, meal]) => `${capitalize(type)}: ${meal.title}`)
    .join("\n");

  const hasAnyMeal = mealLines.length > 0;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: hasAnyMeal
        ? "🍽️ Your meals for today are ready!"
        : "🍽️ Don't forget to plan your meals!",
      body:  hasAnyMeal ? mealLines : "Tap to open the Meal Planner.",
      data:  { screen: "Planner" },
      sound: "default",
      ...(Platform.OS === "android" && { channelId: "meal-reminders" }),
    },
    trigger: {
      type:    Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      repeats: true,
    },
  });

  return true;
}

// ── Cancel all meal reminders
export async function cancelMealReminders() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.screen === "Planner") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch (e) {
    console.warn("[Notifications] Error cancelling:", e);
  }
}

// ── Check if reminder is active
export async function isMealReminderScheduled() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.some((n) => n.content.data?.screen === "Planner");
  } catch {
    return false;
  }
}

// ── Get the scheduled time
export async function getScheduledReminderTime() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reminder  = scheduled.find((n) => n.content.data?.screen === "Planner");
    if (!reminder) return null;
    return {
      hour:   reminder.trigger?.hour   ?? 8,
      minute: reminder.trigger?.minute ?? 0,
    };
  } catch {
    return null;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}