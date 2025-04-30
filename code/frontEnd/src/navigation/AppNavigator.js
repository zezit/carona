import React from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';

// Auth screens
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import RegisterSecondPage from '../screens/RegisterSecondPage';
import FindRides from '../screens/FindRides';
// Main app screens
import HomePage from '../screens/HomePage';
import ProfilePage from '../screens/ProfilePage';
import CreateDriverProfilePage from '../screens/CreateDriverProfilePage';
import UpdateProfilePage from '../screens/UpdateProfilePage';
import UpdateDriverProfilePage from '../screens/UpdateDriverProfilePage';
import LocationSelectionPage from '../screens/LocationSelectionPage';
import RegisterRidePage from '../screens/RegisterRidePage';
import RideModeSelectionPage from '../screens/RideModeSelectionPage';
import ScheduledRides from '../screens/ScheduledRides';
import EditRide from '../screens/EditRide';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Animation configurations
const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: '#fff' },
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      opacity: progress,
    },
  }),
  gestureEnabled: true,
};

// Loading screen component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#4285F4" />
  </View>
);

// Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false, // Hide the header from tab navigator
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Rides') {
          iconName = focused ? 'car' : 'car-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4285F4',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        paddingVertical: Platform.OS === 'ios' ? 10 : 0,
      },
      tabBarLabelStyle: {
        fontWeight: '500',
      }
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomePage}
      options={{ title: 'Início' }}
    />
    <Tab.Screen
      name="Rides"
      component={RideModeSelectionPage}
      options={{ title: 'Caronas' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfilePage}
      options={{ title: 'Perfil' }}
    />
  </Tab.Navigator>
);

// Auth Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...screenOptions,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginPage} />
    <Stack.Screen name="Registrar" component={RegisterPage} />
    <Stack.Screen name="RegisterSecond" component={RegisterSecondPage} />
  </Stack.Navigator>
);

// Main Navigator (after authentication)
const MainStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="TabNavigator" component={TabNavigator} />
    <Stack.Screen name="CreateDriverProfile" component={CreateDriverProfilePage} />
    <Stack.Screen name="UpdateProfile" component={UpdateProfilePage} />
    <Stack.Screen name="UpdateDriverProfile" component={UpdateDriverProfilePage} />
    <Stack.Screen name="LocationSelection" component={LocationSelectionPage} />
    <Stack.Screen name="RegisterRide" component={RegisterRidePage} />
    <Stack.Screen name="ScheduledRides" component={ScheduledRides} options={{ headerShown: false }} />
    <Stack.Screen name="EditRide" component={EditRide} options={{ headerShown: false }} />
    <Stack.Screen name="FindRides" component={FindRides}/>
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
