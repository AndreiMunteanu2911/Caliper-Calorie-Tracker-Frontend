import { Tabs } from 'expo-router';
import {
    ChartNoAxesCombined,
    CirclePlus,
    NotebookTabs,
    type LucideIcon,
    MessageCircleMore,
    UserRound,
} from 'lucide-react-native';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    Easing,
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const TAB_DETAILS: Record<string, { icon: LucideIcon; label: string }> = {
    dashboard: { icon: ChartNoAxesCombined, label: 'Today' },
    diary: { icon: NotebookTabs, label: 'Diary' },
    scan: { icon: CirclePlus, label: 'Add Food' },
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
    const pressedScale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        width: withTiming(focused ? 96 : 48, {
            duration: 160,
            easing: Easing.out(Easing.cubic),
            reduceMotion: ReduceMotion.System,
        }),
        transform: [{ scale: pressedScale.value }],
    }), [focused]);

    const labelStyle = useAnimatedStyle(() => ({
        opacity: withTiming(focused ? 1 : 0, {
            duration: focused ? 130 : 80,
            reduceMotion: ReduceMotion.System,
        }),
        transform: [
            {
                translateX: withTiming(focused ? 0 : -4, {
                    duration: 130,
                    easing: Easing.out(Easing.cubic),
                    reduceMotion: ReduceMotion.System,
                }),
            },
        ],
    }), [focused]);

    return (
        <Pressable
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onLongPress={onLongPress}
            onPress={onPress}
            onPressIn={() => {
                pressedScale.value = withTiming(0.96, {
                    duration: 60,
                    reduceMotion: ReduceMotion.System,
                });
            }}
            onPressOut={() => {
                pressedScale.value = withTiming(1, {
                    duration: 90,
                    reduceMotion: ReduceMotion.System,
                });
            }}>
            <Animated.View
                style={[
                    {
                        alignItems: 'center',
                        backgroundColor: focused ? '#FF5A16' : '#3B3B3B',
                        borderColor: focused ? '#FF7B59' : '#525252',
                        borderRadius: 999,
                        borderWidth: 1,
                        flexDirection: 'row',
                        height: 48,
                        justifyContent: 'center',
                        overflow: 'hidden',
                    },
                    animatedStyle,
                ]}>
                <Icon color="#FFFFFF" size={21} strokeWidth={2.35} />
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
            style={{
                bottom: Math.max(insets.bottom, 10),
                left: 0,
                pointerEvents: 'box-none',
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
                    padding: 7,
                    elevation: 18,
                    ...(Platform.OS === 'web'
                        ? { boxShadow: '0 12px 24px rgba(0, 0, 0, 0.38)' }
                        : {
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 12 },
                            shadowOpacity: 0.38,
                            shadowRadius: 24,
                        }),
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
                options={{ title: 'Add Food', tabBarAccessibilityLabel: 'Add Food' }}
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
