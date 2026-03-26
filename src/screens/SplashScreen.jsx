import React, { useEffect } from "react";
import { View, Text, Image, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onFinish }) {
  // Animation values
  const logoScale    = useSharedValue(0.3);
  const logoOpacity  = useSharedValue(0);
  const textOpacity  = useSharedValue(0);
  const textY        = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const dotsOpacity  = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // ── Sequence of animations
    // 1. Logo pops in with spring
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value   = withSpring(1, {
      damping:   12,
      stiffness: 150,
    });

    // 2. App name slides up
    textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    textY.value       = withDelay(400, withSpring(0, {
      damping:   15,
      stiffness: 120,
    }));

    // 3. Tagline fades in
    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));

    // 4. Loading dots appear
    dotsOpacity.value = withDelay(900, withTiming(1, { duration: 300 }));

    // 5. After 2.4s, fade the whole screen out and call onFinish
    screenOpacity.value = withDelay(
      2400,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity:   textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View
      style={[screenStyle, { flex: 1 }]}
      className="bg-white dark:bg-gray-900 items-center justify-center"
    >
      {/* Background decorative circles */}
      <View
        className="absolute rounded-full bg-green-50 dark:bg-green-900/20"
        style={{
          width:  width * 0.8,
          height: width * 0.8,
          top:    -width * 0.15,
          right:  -width * 0.2,
          opacity: 0.6,
        }}
      />
      <View
        className="absolute rounded-full bg-green-50 dark:bg-green-900/20"
        style={{
          width:  width * 0.6,
          height: width * 0.6,
          bottom: -width * 0.1,
          left:   -width * 0.15,
          opacity: 0.4,
        }}
      />

      {/* Logo */}
      <Animated.View style={logoStyle} className="mb-6">
        <View
          className="w-28 h-28 rounded-3xl bg-green-600 items-center justify-center"
          style={{
            shadowColor:   "#16a34a",
            shadowOffset:  { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius:  20,
            elevation:     12,
          }}
        >
          {/*
            Replace this emoji with your actual logo image:

            <Image
              source={require("../../assets/splash-icon.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          */}
          <Text style={{ fontSize: 52 }}>🍽️</Text>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={textStyle} className="items-center">
        <Text className="text-gray-900 dark:text-white text-3xl font-black tracking-tight">
          Recipe Planner
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={taglineStyle} className="mt-2 items-center">
        <Text className="text-gray-400 dark:text-gray-500 text-sm font-medium">
          Plan. Cook. Enjoy.
        </Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View
        style={[dotsStyle, { position: "absolute", bottom: height * 0.12 }]}
        className="flex-row gap-2 items-center"
      >
        {[0, 1, 2].map((i) => (
          <AnimatedDot key={i} delay={i * 200} />
        ))}
      </Animated.View>

      {/* Footer */}
      <Animated.View
        style={[taglineStyle, { position: "absolute", bottom: 40 }]}
      >
        <Text className="text-gray-300 dark:text-gray-600 text-xs">
          Made with ❤️
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── Bouncing loading dot
function AnimatedDot({ delay }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Loop up-down bounce
    const startBounce = () => {
      translateY.value = withDelay(
        delay,
        withSequence(
          withTiming(-8, { duration: 350 }),
          withTiming(0,  { duration: 350 }, () => {
            runOnJS(startBounce)();
          })
        )
      );
    };
    // Start after splash text appears
    setTimeout(startBounce, 1000);
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={dotStyle}
      className="w-2 h-2 rounded-full bg-green-500"
    />
  );
}