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
import { ProjectMaster } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectMaster' | 'Sites'>;

export const ProjectMasterScreen: React.FC<Props> = ({ navigation }) => {
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [siteName, setSiteName] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await constructionService.getProjectsMaster();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleReset = () => {
    setProjectName('');
    setSiteName('');
  };

  const handleCreate = async () => {
    if (!projectName.trim() || !siteName.trim()) {
      Alert.alert('Required Fields', 'Please enter both Project Name and Site Name.');
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createProjectMaster({ projectName, siteName });
      Alert.alert('Success', 'Project created successfully.');
      handleReset();
      fetchProjects();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'Are you sure you want to remove this project?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await constructionService.deleteProjectMaster(id);
            fetchProjects();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete project.');
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
        <Text style={styles.headerTitle}>2. Project Master</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create Project</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter project name (e.g. Metro Building)"
              placeholderTextColor="#94A3B8"
              value={projectName}
              onChangeText={setProjectName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Site Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter site name (e.g. Site A)"
              placeholderTextColor="#94A3B8"
              value={siteName}
              onChangeText={setSiteName}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, submitting && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Create</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Project List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Project List ({projects.length})</Text>

          {loading ? (
            <ActivityIndicator color="#0D5C3A" style={{ marginVertical: 24 }} />
          ) : projects.length === 0 ? (
            <Text style={styles.emptyText}>No projects recorded yet.</Text>
          ) : (
            projects.map((item, idx) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.badgeIndex}>
                    <Text style={styles.badgeIndexText}>{idx + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.projectName}</Text>
                    <Text style={styles.itemSub}>Site: {item.siteName} • {item.createdOn}</Text>
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
    alignItems: 'center',
    gap: 10,
  },
  badgeIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
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
export default ProjectMasterScreen;
