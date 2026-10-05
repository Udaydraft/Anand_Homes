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
import { OutwardMaterialEntry, ProjectMaster } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MaterialOutward'>;

const NATURE_OF_WORK_OPTIONS = ['Construction', 'Installation', 'Maintenance', 'Testing', 'Others'];

export const MaterialOutwardScreen: React.FC<Props> = ({ navigation }) => {
  const [entries, setEntries] = useState<OutwardMaterialEntry[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState('10-08-2025');
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');
  const [natureOfWork, setNatureOfWork] = useState(NATURE_OF_WORK_OPTIONS[0]);
  const [quantity, setQuantity] = useState('');
  const [measurement, setMeasurement] = useState('Bags');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [outData, projData] = await Promise.all([
        constructionService.getMaterialOutward(),
        constructionService.getProjectsMaster(),
      ]);
      setEntries(outData || []);
      setProjects(projData || []);
      if (projData && projData.length > 0 && !project) {
        setProject(projData[0].projectName);
        setSite(projData[0].siteName);
      }
    } catch (err) {
      console.error('Failed to load outward data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = () => {
    setQuantity('');
  };

  const handleSave = async () => {
    const qtyNum = parseFloat(quantity);
    if (!project.trim() || !site.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Required Fields', 'Please select a project/site and enter quantity.');
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createMaterialOutward({
        date,
        project,
        site,
        natureOfWork,
        quantity: qtyNum,
        measurement,
      });

      Alert.alert('Success', 'Outward material dispatch recorded.');
      handleReset();
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to record outward dispatch.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>7. Outward Material Entry</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Issue Outward Material</Text>

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

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter qty"
                placeholderTextColor="#94A3B8"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Measurement *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bags"
                placeholderTextColor="#94A3B8"
                value={measurement}
                onChangeText={setMeasurement}
              />
            </View>
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

        {/* Outward Dispatches List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dispatch History ({entries.length})</Text>

          {loading ? (
            <ActivityIndicator color="#0D5C3A" style={{ marginVertical: 24 }} />
          ) : entries.length === 0 ? (
            <Text style={styles.emptyText}>No outward dispatches recorded yet.</Text>
          ) : (
            entries.map((item, idx) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.badgeIndex}>
                    <Text style={styles.badgeIndexText}>{idx + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.project} • {item.site}</Text>
                    <Text style={styles.itemSub}>Work: {item.natureOfWork} • {item.date}</Text>
                  </View>
                </View>
                <Text style={styles.qtyText}>
                  {item.quantity} {item.measurement}
                </Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
  },
});
export default MaterialOutwardScreen;
