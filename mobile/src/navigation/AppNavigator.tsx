import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import {
  LoginScreen,
  RegisterScreen,
  DashboardScreen,
  MySiteScreen,
  InventoryScreen,
  LowStockAlertScreen,
  ReportsScreen,
  ProfileScreen,
  MoreMenuScreen,
  ProjectMasterScreen,
  SupervisorMasterScreen,
  ProjectDurationScreen,
  InventoryMasterScreen,
  MaterialInwardScreen,
  MaterialOutwardScreen,
  LabourEntryScreen,
  PrivacyPolicyScreen,
  TermsConditionsScreen,
} from '../screens';
import { Loading } from '../components/Loading';
import { View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AnandHomesTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    primary: '#0D5C3A',
  },
};

export const AppNavigator: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading label="Loading Anand Homes..." />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AnandHomesTheme}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#F8FAFC',
          },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ProjectMaster" component={ProjectMasterScreen} />
        <Stack.Screen name="SupervisorMaster" component={SupervisorMasterScreen} />
        <Stack.Screen name="ProjectDuration" component={ProjectDurationScreen} />
        <Stack.Screen name="InventoryMaster" component={InventoryMasterScreen} />
        <Stack.Screen name="MaterialInward" component={MaterialInwardScreen} />
        <Stack.Screen name="MaterialOutward" component={MaterialOutwardScreen} />
        <Stack.Screen name="LabourEntry" component={LabourEntryScreen} />
        <Stack.Screen name="Sites" component={ProjectMasterScreen} />
        <Stack.Screen name="MySite" component={MySiteScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="LowStockAlert" component={LowStockAlertScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#072417',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
