import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, ActivityIndicator, View, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

import EventListScreen from './src/screens/EventListScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import CoordinatorPanelScreen from './src/screens/CoordinatorPanelScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import TermsScreen from './src/screens/TermsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: ['simatshackathon://', 'https://simatshackathon.saveetha.com'],
  config: {
    screens: {
      Home: {
        screens: {
          Events: 'events',
          EventDetail: 'events/:id',
        },
      },
    },
  },
};

const commonScreenOptions = {
  headerStyle: { backgroundColor: '#080808' },
  headerTintColor: '#F5EFE0',
};

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{
      ...commonScreenOptions,
      tabBarStyle: { backgroundColor: '#080808', borderTopColor: '#212121' },
      tabBarActiveTintColor: '#FF5500',
      tabBarInactiveTintColor: '#6B6B6B',
    }}>
      <Tab.Screen name="Events" component={EventListScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>&#9776;</Text> }} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>&#10022;</Text> }} />
      <Tab.Screen name="Login" component={LoginScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>&#9679;</Text> }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#080808', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF5500" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ ...commonScreenOptions, contentStyle: { backgroundColor: '#080808' } }}>
      <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      {user?.role === 'ADMIN' && (
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
      )}
      {(user?.role === 'ADMIN' || user?.role === 'COORDINATOR') && (
        <Stack.Screen name="CoordinatorPanel" component={CoordinatorPanelScreen} options={{ title: 'Coordinator' }} />
      )}
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <NavigationContainer linking={linking}>
            <StatusBar barStyle="light-content" backgroundColor="#080808" />
            <AppNavigator />
          </NavigationContainer>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
