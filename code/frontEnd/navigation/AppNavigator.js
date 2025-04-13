import React from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';

// Auth screens
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RegisterSecondPage from '../pages/RegisterSecondPage';

// Main app screens
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import RidesPage from '../pages/RidesPage';
import CreateDriverProfilePage from '../pages/CreateDriverProfilePage';
import UpdateProfilePage from '../pages/UpdateProfilePage';
import UpdateDriverProfilePage from '../pages/UpdateDriverProfilePage';
import RegisterRidePage from '../pages/RegisterRidePage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Animation configurations
const screenOptions = {
  headerShown: false,
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

const fadeConfig = {
  animation: 'timing',
  config: {
    duration: 300,
  },
};

// Main App Tab Navigator
const MainTabs = () => (
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
      component={RidesPage} 
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
      transitionSpec: {
        open: fadeConfig,
        close: fadeConfig,
      },
    }}
  >
    <Stack.Screen name="Login" component={LoginPage} />
    <Stack.Screen name="Registrar" component={RegisterPage} />
    <Stack.Screen name="Mais informações" component={RegisterSecondPage} />
  </Stack.Navigator>
);

// Loading screen component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color="#4285F4" />
  </View>
);

// Main App Stack with Tabs
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="CreateDriverProfile" component={CreateDriverProfilePage} />
    <Stack.Screen name="UpdateProfile" component={UpdateProfilePage} />
    <Stack.Screen name="UpdateDriverProfile" component={UpdateDriverProfilePage} />
    <Stack.Screen name="RegisterRide" component={RegisterRidePage}/>
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  // Use the context hook instead of the regular hook
  const { isAuthenticated, isLoading } = useAuthContext();
  
  // Show loading screen while checking authentication
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
