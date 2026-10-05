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
import { LabourEntry, ProjectMaster } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'LabourEntry'>;

const NATURE_OF_WORK_OPTIONS = ['Construction', 'Installation', 'Maintenance', 'Testing', 'Others'];

export const LabourEntryScreen: React.FC<Props> = ({ navigation }) => {
  const [entries, setEntries] = useState<LabourEntry[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState('10-08-2025');
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');
  const [natureOfWork, setNatureOfWork] = useState(NATURE_OF_WORK_OPTIONS[0]);
  const [type, setType] = useState<'Count (Labour)' | 'Other'>('Count (Labour)');
  const [workerCount, setWorkerCount] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [labData, projData] = await Promise.all([
        constructionService.getLabourEntries(),
        constructionService.getProjectsMaster(),
      ]);
      setEntries(labData || []);
      setProjects(projData || []);
      if (projData && projData.length > 0 && !project) {
        setProject(projData[0].projectName);
        setSite(projData[0].siteName);
      }
    } catch (err) {
      console.error('Failed to load labour entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = () => {
    setWorkerCount('');
    setType('Count (Labour)');
  };

  const handleSave = async () => {
    const countNum = parseInt(workerCount, 10);
    if (!project.trim() || !site.trim() || isNaN(countNum) || countNum <= 0) {
      Alert.alert('Required Fields', 'Please select a project/site and enter worker count.');
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createLabourEntry({
        date,
        project,
        site,
        natureOfWork,
        type,
        workerCount: countNum,
      });

      Alert.alert('Success', 'Labour deployment recorded successfully.');
      handleReset();
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save labour entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Delete this labour deployment entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await constructionService.deleteLabourEntry(id);
            fetchData();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete record.');
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
        <Text style={styles.headerTitle}>8. Labour Entry</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Record Daily Labour Count</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date * (dd-mm-yyyy)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10-08-2025"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Metro Building"
              placeholderTextColor="#94A3B8"
              value={project}
              onChangeText={setProject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Site *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Site A"
              placeholderTextColor="#94A3B8"
              value={site}
              onChangeText={setSite}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nature of Work *</Text>
            <View style={styles.nowRow}>
              {NATURE_OF_WORK_OPTIONS.map((now) => (
                <TouchableOpacity
                  key={now}
                  style={[styles.nowChip, natureOfWork === now && styles.nowChipActive]}
                  onPress={() => setNatureOfWork(now)}
                >
                  <Text style={[styles.nowChipText, natureOfWork === now && styles.nowChipTextActive]}>
                    {now}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Labour Type *</Text>
            <View style={styles.typeRow}>
              {(['Count (Labour)', 'Other'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Ionicons
                    name={type === t ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={type === t ? '#2563EB' : '#94A3B8'}
                  />
                  <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>No. of Workers *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number (e.g. 15)"
              placeholderTextColor="#94A3B8"
              value={workerCount}
              onChangeText={setWorkerCount}
              keyboardType="number-pad"
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
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Labour Logs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Labour Logs ({entries.length})</Text>

          {loading ? (
            <ActivityIndicator color="#0D5C3A" style={{ marginVertical: 24 }} />
          ) : entries.length === 0 ? (
            <Text style={styles.emptyText}>No labour records logged yet.</Text>
          ) : (
            entries.map((item, idx) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.badgeIndex}>
                    <Text style={styles.badgeIndexText}>{idx + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.project} • {item.site}</Text>
                    <Text style={styles.itemSub}>{item.natureOfWork} • {item.type}</Text>
                  </View>
                </View>
                <View style={styles.rightBox}>
                  <Text style={styles.countText}>{item.workerCount} workers</Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
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
  nowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nowChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nowChipActive: {
    backgroundColor: '#0D5C3A',
    borderColor: '#0D5C3A',
  },
  nowChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  nowChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 4,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBtnActive: {},
  typeText: {
    fontSize: 13,
    color: '#64748B',
  },
  typeTextActive: {
    color: '#0F172A',
    fontWeight: '600',
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
    flex: 1,
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
  rightBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
  },
});
export default LabourEntryScreen;
