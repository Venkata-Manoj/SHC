import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Linking } from 'react-native';

import EventListScreen from './src/screens/EventListScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import LoginScreen from './src/screens/LoginScreen';
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

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#080808' },
      headerTintColor: '#F5EFE0',
      tabBarStyle: { backgroundColor: '#080808', borderTopColor: '#212121' },
      tabBarActiveTintColor: '#FF5500',
      tabBarInactiveTintColor: '#6B6B6B',
    }}>
      <Tab.Screen name="Events" component={EventListScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Login" component={LoginScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <StatusBar barStyle="light-content" backgroundColor="#080808" />
      <Stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#080808' },
        headerTintColor: '#F5EFE0',
        contentStyle: { backgroundColor: '#080808' },
      }}>
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
        <Stack.Screen name="CoordinatorPanel" component={CoordinatorPanelScreen} options={{ title: 'Coordinator' }} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms' }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
