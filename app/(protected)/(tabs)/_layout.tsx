import { Tabs } from 'expo-router';
import {
  ChartNoAxesCombined,
  NotebookTabs,
  type LucideIcon,
  MessageCircleMore,
  ScanLine,
  UserRound,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import {ScrollbarContainer} from "@/src/components/ui/ScrollbarContainer";

const TAB_DETAILS: Record<string, { icon: LucideIcon; label: string }> = {
  dashboard: { icon: ChartNoAxesCombined, label: 'Today' },
  diary: { icon: NotebookTabs, label: 'Diary' },
  scan: { icon: ScanLine, label: 'Scan' },
  chat: { icon: MessageCircleMore, label: 'Advisor' },
  profile: { icon: UserRound, label: 'Profile' },
};

type DockItemProps = {
  focused: boolean;
  icon: LucideIcon;
  label: string;
  onLongPress: () => void;
  onPress: () => void;
};

function DockItem({
  focused,
  icon: Icon,
  label,
  onLongPress,
  onPress,
}: DockItemProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(focused ? 80 : 40, { duration: 220 }),
  }), [focused]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: focused ? 180 : 90 }),
    transform: [
      { translateX: withTiming(focused ? 0 : -6, { duration: 180 }) },
    ],
  }), [focused]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={onPress}>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            backgroundColor: focused ? '#FF5A16' : '#3B3B3B',
            borderColor: focused ? '#FF7B59' : '#525252',
            borderRadius: 999,
            borderWidth: 1,
            flexDirection: 'row',
            height: 40,
            justifyContent: 'center',
            overflow: 'hidden',
          },
          animatedStyle,
        ]}>
        <Icon color="#FFFFFF" size={19} strokeWidth={2.35} />
          {focused ? (
          <Animated.View className="ml-1.5" style={labelStyle}>
            <Text className="text-xs font-bold text-white">{label}</Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string; params?: Readonly<object | undefined> }[] };
  descriptors: Record<string, { options: Record<string, any> }>;
  navigation: Record<string, any>;
};

function AnimatedTabDock({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        bottom: Math.max(insets.bottom, 10),
        left: 0,
        position: 'absolute',
        right: 0,
      }}>
      <View
        style={{
          alignSelf: 'center',
          backgroundColor: '#202020',
          borderColor: '#383838',
          borderRadius: 999,
          borderWidth: 1,
          padding: 6,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.38,
          shadowRadius: 24,
          elevation: 18,
        }}>
        <View className="flex-row items-center gap-1.5">
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const details = TAB_DETAILS[route.name];
            if (!details) return null;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <DockItem
                focused={focused}
                icon={details.icon}
                key={route.key}
                label={
                  descriptors[route.key].options.tabBarAccessibilityLabel ??
                  details.label
                }
                onLongPress={onLongPress}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#101010' },
      }}
      tabBar={(props) => <AnimatedTabDock {...props} />}>
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarAccessibilityLabel: 'Today' }}
      />
      <Tabs.Screen
        name="diary"
        options={{ title: 'Diary', tabBarAccessibilityLabel: 'Diary' }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Meal Analysis', tabBarAccessibilityLabel: 'Scan' }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'AI Advisor', tabBarAccessibilityLabel: 'Advisor' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarAccessibilityLabel: 'Profile' }}
      />
    </Tabs>
  );
}
