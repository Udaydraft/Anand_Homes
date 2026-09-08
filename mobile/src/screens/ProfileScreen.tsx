import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/user.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setMessage(null);
    setError(null);

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setIsUpdating(true);
    try {
      await userService.updateProfile({ name: name.trim() });
      await refreshProfile();
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'user'}</Text>
          </View>
        </View>

        {message && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Card title="Edit Information" subtitle="Update your account details">
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            editable={false}
            helperText="Email cannot be modified directly"
          />

          <Button
            title="Save Profile"
            onPress={handleUpdate}
            isLoading={isUpdating}
            style={{ marginTop: 8 }}
          />
        </Card>

        <Card title="Account Security" subtitle="Authentication & Tokens">
          <Text style={styles.infoText}>
            Tokens are encrypted using hardware-backed keychains via Expo SecureStore.
          </Text>
          <View style={styles.idBox}>
            <Text style={styles.idLabel}>Account ID:</Text>
            <Text style={styles.idValue}>{user?.id}</Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
  avatarCard: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  userEmail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
    textTransform: 'uppercase',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#34D399',
    fontSize: 13,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FB7185',
    fontSize: 13,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  idBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  idLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  idValue: {
    fontSize: 12,
    color: '#D1D5DB',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
});
