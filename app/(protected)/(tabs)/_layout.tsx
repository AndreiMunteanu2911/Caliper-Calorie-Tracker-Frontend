import { Motion } from '@legendapp/motion';
import { Tabs } from 'expo-router';
import {
    ChartNoAxesCombined,
    CirclePlus,
    NotebookTabs,
    type LucideIcon,
    MessageCircleMore,
    UserRound,
} from 'lucide-react-native';
import {
    Platform,
    Pressable,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { motionTransition } from '@/src/lib/motion';

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
    width: number;
};

function DockItem({
                      focused,
                      icon: Icon,
                      label,
                      onLongPress,
                      onPress,
                      width,
                  }: DockItemProps) {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <Pressable
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onLongPress={onLongPress}
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}>
            <Motion.View
                animate={{ scale: isPressed ? 0.96 : 1, width }}
                style={{
                    alignItems: 'center',
                    backgroundColor: focused ? '#FF5A16' : '#3B3B3B',
                    borderColor: focused ? '#FF7B59' : '#525252',
                    borderRadius: 999,
                    borderWidth: 1,
                    flexDirection: 'row',
                    height: 48,
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
                transition={motionTransition.standard}>
                <Icon color="#FFFFFF" size={21} strokeWidth={2.35} />
                {focused ? (
                    <Motion.View
                        animate={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -4 }}
                        transition={motionTransition.quick}>
                        <Text className="ml-1.5 text-xs font-bold text-white">{label}</Text>
                    </Motion.View>
                ) : null}
            </Motion.View>
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
    const { width: windowWidth } = useWindowDimensions();
    const dockGapWidth = 24;
    const dockPaddingWidth = 14;
    const itemWidth = Math.max(
        34,
        Math.min(48, Math.floor((windowWidth - dockGapWidth - dockPaddingWidth) / 6)),
    );
    const focusedItemWidth = itemWidth * 2;

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
                    maxWidth: Math.max(0, windowWidth - 16),
                    overflow: 'hidden',
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
                                width={focused ? focusedItemWidth : itemWidth}
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
