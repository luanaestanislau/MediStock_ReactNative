import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { AlertasScreen } from './src/screens/AlertasScreen';
import { CadastroScreen } from './src/screens/CadastroScreen';
import { EstoqueScreen } from './src/screens/EstoqueScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { IaScreen } from './src/screens/IaScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { LogisticaScreen } from './src/screens/LogisticaScreen';
import { MatriculaScreen } from './src/screens/MatriculaScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { colors } from './src/theme/colors';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Cadastro: undefined;
  Matricula: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Alertas: undefined;
  Estoque: undefined;
  IA: undefined;
  Logistica: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home-outline',
            Alertas: 'notifications-outline',
            Estoque: 'cube-outline',
            IA: 'sparkles-outline',
            Logistica: 'car-sport-outline',
          };
          return <Ionicons name={icons[route.name as keyof MainTabParamList]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Alertas" component={AlertasScreen} />
      <Tabs.Screen name="Estoque" component={EstoqueScreen} />
      <Tabs.Screen name="IA" component={IaScreen} />
      <Tabs.Screen name="Logistica" component={LogisticaScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  const { bootstrapped, authenticated } = useApp();

  if (!bootstrapped) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {authenticated ? (
          <>
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen name="Matricula" component={MatriculaScreen} />
          </>
        ) : (
          <>
            <RootStack.Screen name="Splash" component={SplashScreen} />
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Cadastro" component={CadastroScreen} />
            <RootStack.Screen name="Matricula" component={MatriculaScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
