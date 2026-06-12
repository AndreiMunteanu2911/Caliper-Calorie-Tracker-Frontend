import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#F5F7F2' },
        tabBarActiveTintColor: '#173F35',
        tabBarInactiveTintColor: '#77837D',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E1E7E3',
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 68 : 82,
          maxWidth: Platform.OS === 'web' ? 440 : undefined,
          width: Platform.OS === 'web' ? '100%' : undefined,
          alignSelf: Platform.OS === 'web' ? 'center' : undefined,
          borderRadius: Platform.OS === 'web' ? 22 : 0,
          marginBottom: Platform.OS === 'web' ? 16 : 0,
          paddingBottom: Platform.OS === 'web' ? 8 : 18,
          paddingTop: 8,
          shadowColor: '#173F35',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: Platform.OS === 'web' ? 0.1 : 0,
          shadowRadius: 24,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'chart.pie.fill', android: 'pie_chart', web: 'chart' }}
              tintColor={color}
              size={23}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Meal Analysis',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'camera.fill', android: 'photo_camera', web: 'camera' }}
              tintColor={color}
              size={23}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Advisor',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'bubble.left.and.bubble.right.fill', android: 'chat', web: 'chat' }}
              tintColor={color}
              size={23}
            />
          ),
        }}
      />
    </Tabs>
  );
}
