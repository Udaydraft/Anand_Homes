import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { constructionService } from '../services/construction.service';
import { SupervisorMaster, ProjectMaster } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SupervisorMaster'>;

export const SupervisorMasterScreen: React.FC<Props> = ({ navigation }) => {
  const [supervisors, setSupervisors] = useState<SupervisorMaster[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [supData, projData] = await Promise.all([
        constructionService.getSupervisorsMaster(),
        constructionService.getProjectsMaster(),
      ]);
      setSupervisors(supData || []);
      setProjects(projData || []);
      if (projData && projData.length > 0 && !project) {
        setProject(projData[0].projectName);
        setSite(projData[0].siteName);
      }
    } catch (err) {
      console.error('Failed to load supervisor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = () => {
    setName('');
    setLoginId('');
    setPassword('');
  };

  const handleSave = async () => {
    if (!name.trim() || !loginId.trim() || !password.trim() || !project.trim() || !site.trim()) {
      Alert.alert('Required Fields', 'Please complete all supervisor fields.');
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createSupervisorMaster({
        name,
        loginId,
        password,
        project,
        site,
      });
      Alert.alert('Success', 'Supervisor registered and assigned successfully.');
      handleReset();
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save supervisor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Supervisor', 'Remove this supervisor from the system?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await constructionService.deleteSupervisorMaster(id);
            fetchData();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete supervisor.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>3. Supervisor Master</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create Supervisor & Assign</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Supervisor Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Login Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ramesh"
              placeholderTextColor="#94A3B8"
              value={loginId}
              onChangeText={setLoginId}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assigned Project *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Metro Building"
              placeholderTextColor="#94A3B8"
              value={project}
              onChangeText={setProject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assigned Site *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Site A"
              placeholderTextColor="#94A3B8"
              value={site}
              onChangeText={setSite}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Save</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Supervisor List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Supervisor List ({supervisors.length})</Text>

          {loading ? (
            <ActivityIndicator color="#0D5C3A" style={{ marginVertical: 24 }} />
          ) : supervisors.length === 0 ? (
            <Text style={styles.emptyText}>No supervisors registered yet.</Text>
          ) : (
            supervisors.map((item, idx) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.badgeIndex}>
                    <Text style={styles.badgeIndexText}>{idx + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemSub}>Login: {item.loginId}</Text>
                    <Text style={styles.itemDetail}>
                      {item.project} • {item.site}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  badgeIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  badgeIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  itemDetail: {
    fontSize: 11,
    color: '#0D5C3A',
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
  },
});
export default SupervisorMasterScreen;
