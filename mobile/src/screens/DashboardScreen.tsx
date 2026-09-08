import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const {
    data: health,
    isLoading: isHealthLoading,
    error: healthError,
    refetch: refetchHealth,
    isRefetching,
  } = useQuery({
    queryKey: ['mobileSystemHealth'],
    queryFn: () => authService.checkHealth(),
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetchHealth}
          tintColor="#6366F1"
        />
      }
    >
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusBadgeText}>Connected Monorepo</Text>
        </View>
        <Text style={styles.welcomeTitle}>Hello, {user?.name || 'Developer'}!</Text>
        <Text style={styles.welcomeSubtitle}>
          React Native client connected to the shared FastAPI backend and MongoDB database.
        </Text>
      </View>

      {/* Health Status Section */}
      <Text style={styles.sectionTitle}>Infrastructure Health</Text>

      {isHealthLoading && !health ? (
        <Loading label="Checking API & Database..." />
      ) : healthError ? (
        <ErrorState
          title="Connection Error"
          message="Could not connect to FastAPI. Ensure the backend is running and reachable from your mobile device/emulator."
          onRetry={refetchHealth}
        />
      ) : (
        <View>
          <Card title="FastAPI Backend" subtitle={`Service: ${health?.service || 'Antigravity'}`}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>API Status</Text>
              <Text style={styles.statusSuccess}>Running (v{health?.version || '1.0.0'})</Text>
            </View>
          </Card>

          <Card title="MongoDB Integration" subtitle={health?.database?.details || 'Database'}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Database State</Text>
              <Text
                style={
                  health?.database?.status === 'connected'
                    ? styles.statusSuccess
                    : styles.statusWarning
                }
              >
                {health?.database?.status?.toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* Account Info Card */}
      <Card title="Session Account" subtitle={user?.email}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Role</Text>
          <Text style={styles.roleBadge}>{user?.role || 'user'}</Text>
        </View>
        <View style={[styles.statusRow, { marginTop: 8 }]}>
          <Text style={styles.statusLabel}>Storage</Text>
          <Text style={styles.statusLabel}>Expo SecureStore (Encrypted)</Text>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="View Profile Details"
          variant="secondary"
          onPress={() => navigation.navigate('Profile')}
        />
        <Button
          title="Sign Out"
          variant="danger"
          onPress={logout}
          style={{ marginTop: 10 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusBadgeText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  statusSuccess: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34D399',
  },
  statusWarning: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FBBF24',
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A5B4FC',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  actions: {
    marginTop: 8,
  },
});
