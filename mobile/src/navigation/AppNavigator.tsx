import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SitesScreen } from '../screens/SitesScreen';
import { MySiteScreen } from '../screens/MySiteScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { MaterialRequestsScreen } from '../screens/MaterialRequestsScreen';
import { RequestDetailsScreen } from '../screens/RequestDetailsScreen';
import { StockInScreen } from '../screens/StockInScreen';
import { StockOutScreen } from '../screens/StockOutScreen';
import { DeliveriesScreen } from '../screens/DeliveriesScreen';
import { DeliveryDetailsScreen } from '../screens/DeliveryDetailsScreen';
import { PhotoMonitoringScreen } from '../screens/PhotoMonitoringScreen';
import { SiteMapViewScreen } from '../screens/SiteMapViewScreen';
import { LowStockAlertScreen } from '../screens/LowStockAlertScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MoreMenuScreen } from '../screens/MoreMenuScreen';
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
        <Stack.Screen name="Sites" component={SitesScreen} />
        <Stack.Screen name="MySite" component={MySiteScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="MaterialRequests" component={MaterialRequestsScreen} />
        <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
        <Stack.Screen name="StockIn" component={StockInScreen} />
        <Stack.Screen name="StockOut" component={StockOutScreen} />
        <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
        <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} />
        <Stack.Screen name="PhotoMonitoring" component={PhotoMonitoringScreen} />
        <Stack.Screen name="SiteMapView" component={SiteMapViewScreen} />
        <Stack.Screen name="LowStockAlert" component={LowStockAlertScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
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
