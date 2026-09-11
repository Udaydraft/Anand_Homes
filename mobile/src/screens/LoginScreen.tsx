import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { useMobileData, MobileRoleMode } from '../context/MobileDataContext';
import { AnandHomesMobileLogo } from '../components/AnandHomesMobileLogo';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<MobileRoleMode>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { setRoleMode } = useMobileData();

  const handleRoleTab = (role: MobileRoleMode) => {
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const role: MobileRoleMode =
        email.toLowerCase().includes('supervisor') || selectedRole === 'supervisor'
          ? 'supervisor'
          : 'admin';
      setRoleMode(role);

      await login({ email, password });
      navigation.navigate('Dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Login failed. Please verify your credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo Brand Header */}
          <View style={styles.brandHeader}>
            <AnandHomesMobileLogo />
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSub}>Login to Anand Homes Mobile</Text>

            {/* Role Switcher Tabs */}
            <View style={styles.roleTabRow}>
              <TouchableOpacity
                style={[styles.roleTab, selectedRole === 'admin' && styles.roleTabActive]}
                onPress={() => handleRoleTab('admin')}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={selectedRole === 'admin' ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[styles.roleTabText, selectedRole === 'admin' && styles.roleTabTextActive]}
                >
                  Admin Portal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, selectedRole === 'supervisor' && styles.roleTabActive]}
                onPress={() => handleRoleTab('supervisor')}
              >
                <Ionicons
                  name="construct"
                  size={14}
                  color={selectedRole === 'supervisor' ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[styles.roleTabText, selectedRole === 'supervisor' && styles.roleTabTextActive]}
                >
                  Supervisor
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={16} color="#94A3B8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter Email"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>

            {/* Password */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={16}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              <Text style={styles.loginBtnText}>
                {isSubmitting
                  ? 'Signing In...'
                  : `Login as ${selectedRole === 'admin' ? 'Administrator' : 'Site Supervisor'}`}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpRow}>
              <Text style={styles.signUpLabel}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Construction Skyline Footer Note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Anand Homes Construction Management Platform
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  roleTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#0D5C3A',
    shadowColor: '#0D5C3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#1E293B',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#0D5C3A',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D5C3A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dummySection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dummyHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },
  dummyButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dummyBtnAdmin: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dummyBtnTextAdmin: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  dummyBtnSupervisor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  dummyBtnTextSupervisor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  socialOr: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 14,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  signUpLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  signUpLink: {
    fontSize: 12,
    color: '#0D5C3A',
    fontWeight: '700',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
