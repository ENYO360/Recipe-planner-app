// src/components/Icon.jsx
//
// Self-contained SVG icon library — no font files, no external dependencies.
// Every icon is an inline SVG path so it works identically in Expo Go and
// production APK builds without any font loading.
//
// Usage:
//   import Icon from "../components/Icon";
//   <Icon name="home" size={24} color="#16a34a" />

import React from "react";
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from "react-native-svg";

// ── Icon path definitions ─────────────────────────────────────────────────────
// All paths use a 24×24 viewBox (standard Ionicons / Heroicons dimensions)
const ICONS = {

  // ── Navigation ─────────────────────────────────────────────────────────────
  "home": (
    <Path
      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z M9 21V12h6v9"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
  ),
  "calendar": (
    <>
      <Rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16 2v4M8 2v4M3 10h18" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "add-circle": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8}/>
      <Path d="M12 8v8M8 12h8" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "cart": (
    <>
      <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 6h18M16 10a4 4 0 01-8 0" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "heart": (
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
  ),
  "heart-outline": (
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
  ),
  "settings-outline": (
    <>
      <Circle cx="12" cy="12" r="3" strokeWidth={1.8}/>
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth={1.8}/>
    </>
  ),

  // ── Actions ─────────────────────────────────────────────────────────────────
  "search-outline": (
    <>
      <Circle cx="11" cy="11" r="8" strokeWidth={1.8}/>
      <Path d="M21 21l-4.35-4.35" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "close-circle": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8}/>
      <Path d="M15 9l-6 6M9 9l6 6" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "close": (
    <Path d="M18 6L6 18M6 6l12 12" strokeWidth={1.8} strokeLinecap="round"/>
  ),
  "add": (
    <Path d="M12 5v14M5 12h14" strokeWidth={1.8} strokeLinecap="round"/>
  ),
  "remove": (
    <Path d="M5 12h14" strokeWidth={1.8} strokeLinecap="round"/>
  ),
  "checkmark": (
    <Path d="M20 6L9 17l-5-5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  "checkmark-circle": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8}/>
      <Path d="M8 12l3 3 5-5" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "trash-outline": (
    <>
      <Path d="M3 6h18M19 6l-1 14H6L5 6M10 6V4h4v2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "arrow-back": (
    <Path d="M19 12H5M12 19l-7-7 7-7" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  ),
  "chevron-forward": (
    <Path d="M9 18l6-6-6-6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  ),
  "swap-horizontal": (
    <>
      <Path d="M7 16V4M7 4L3 8M7 4l4 4" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M17 8v12M17 20l4-4M17 20l-4-4" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "add-circle-outline": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8} fill="none"/>
      <Path d="M12 8v8M8 12h8" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "close-circle-outline": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8} fill="none"/>
      <Path d="M15 9l-6 6M9 9l6 6" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),

  // ── Info / Status ────────────────────────────────────────────────────────────
  "time-outline": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8} fill="none"/>
      <Path d="M12 7v5l3 3" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "people-outline": (
    <>
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth={1.8} strokeLinecap="round"/>
      <Circle cx="9" cy="7" r="4" strokeWidth={1.8}/>
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "bar-chart-outline": (
    <>
      <Path d="M18 20V10M12 20V4M6 20v-6" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "information-circle-outline": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8} fill="none"/>
      <Path d="M12 8h.01M12 11v5" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "alert-circle-outline": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8} fill="none"/>
      <Path d="M12 8v4M12 16h.01" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "shield-checkmark-outline": (
    <>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 12l2 2 4-4" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),

  // ── Media / Content ──────────────────────────────────────────────────────────
  "camera-outline": (
    <>
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="13" r="4" strokeWidth={1.8}/>
    </>
  ),
  "camera": (
    <>
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="13" r="4" strokeWidth={1.8}/>
    </>
  ),
  "image-outline": (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.8}/>
      <Circle cx="8.5" cy="8.5" r="1.5" strokeWidth={1.8}/>
      <Path d="M21 15l-5-5L5 21" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),

  // ── Food / Recipe specific ────────────────────────────────────────────────────
  "restaurant-outline": (
    <>
      <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6 1v3M10 1v3M14 1v3" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "fast-food-outline": (
    <>
      <Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),

  // ── Weather / Time (meal planner) ─────────────────────────────────────────────
  "sunny-outline": (
    <>
      <Circle cx="12" cy="12" r="4" strokeWidth={1.8} fill="none"/>
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "partly-sunny-outline": (
    <>
      <Circle cx="10" cy="10" r="4" strokeWidth={1.8} fill="none"/>
      <Path d="M10 2v2M10 16v1M3.34 5.34l1.42 1.42M15.24 15.24l1.42 1.42M2 10h2" strokeWidth={1.8} strokeLinecap="round"/>
      <Path d="M16 13a4 4 0 010 8H8a4 4 0 010-8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "moon-outline": (
    <Path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
  ),

  // ── Notifications ─────────────────────────────────────────────────────────────
  "notifications-outline": (
    <>
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "alarm-outline": (
    <>
      <Circle cx="12" cy="13" r="8" strokeWidth={1.8}/>
      <Path d="M12 9v4l2 2M5 3L2 6M22 6l-3-3" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),

  // ── Device / System ───────────────────────────────────────────────────────────
  "phone-portrait-outline": (
    <>
      <Rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={1.8}/>
      <Path d="M12 18h.01" strokeWidth={2} strokeLinecap="round"/>
    </>
  ),
  "server-outline": (
    <>
      <Rect x="2" y="2" width="20" height="8" rx="2" strokeWidth={1.8}/>
      <Rect x="2" y="14" width="20" height="8" rx="2" strokeWidth={1.8}/>
      <Path d="M6 6h.01M6 18h.01" strokeWidth={2} strokeLinecap="round"/>
    </>
  ),

  // ── Misc ─────────────────────────────────────────────────────────────────────
  "compass-outline": (
    <>
      <Circle cx="12" cy="12" r="9" strokeWidth={1.8} fill="none"/>
      <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "calendar-outline": (
    <>
      <Rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.8}/>
      <Path d="M16 2v4M8 2v4M3 10h18" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "cart-outline": (
    <>
      <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "box-outline": (
    <>
      <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeWidth={1.8} strokeLinecap="round"/>
    </>
  ),
  "tag-outline": (
    <>
      <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7 7h.01" strokeWidth={2} strokeLinecap="round"/>
    </>
  ),
};

// ── Icon component ────────────────────────────────────────────────────────────
export default function Icon({
  name,
  size   = 24,
  color  = "#000000",
  filled = false,   // true = solid fill, false = outline stroke only
  style,
}) {
  const paths = ICONS[name];

  if (!paths) {
    // Fallback: render a small circle so layout doesn't break for missing icons
    console.warn(`[Icon] Unknown icon name: "${name}"`);
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle cx="12" cy="12" r="4" fill={color} />
      </Svg>
    );
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      style={style}
    >
      {paths}
    </Svg>
  );
}