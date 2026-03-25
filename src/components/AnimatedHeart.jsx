// src/components/AnimatedHeart.jsx
import { TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Icon from "./Icon";

export default function AnimatedHeart({
  isFavourite,
  onPress,
  size = 18,
  containerClass = "w-9 h-9 rounded-full bg-white",
}) {
  const scale   = useSharedValue(1);
  const rotate  = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale:  scale.value  },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePress = () => {
    if (!isFavourite) {
      // Adding to favourites — big pop + slight rotate
      scale.value = withSequence(
        withSpring(1.4, { damping: 6,  stiffness: 300 }),
        withSpring(1,   { damping: 10, stiffness: 200 })
      );
      rotate.value = withSequence(
        withTiming(-15, { duration: 80  }),
        withTiming(15,  { duration: 80  }),
        withTiming(0,   { duration: 100 })
      );
    } else {
      // Removing — small shrink
      scale.value = withSequence(
        withTiming(0.7, { duration: 100 }),
        withSpring(1,   { damping: 12, stiffness: 200 })
      );
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`${containerClass} items-center justify-center`}
      style={{
        shadowColor:   "#000",
        shadowOffset:  { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius:  4,
        elevation:     2,
      }}
    >
      <Animated.View style={animStyle}>
        <Icon
          name={isFavourite ? "heart" : "heart-outline"}
          size={size}
          color={isFavourite ? "#ef4444" : "#9ca3af"}
          filled
        />
      </Animated.View>
    </TouchableOpacity>
  );
}