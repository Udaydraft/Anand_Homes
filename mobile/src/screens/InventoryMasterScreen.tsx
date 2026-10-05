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
import { InventoryMasterItem } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'InventoryMaster'>;

const DEFAULT_CATEGORIES = ['Cement', 'Steel', 'Aggregate', 'Masonry', 'Finishing', 'Others'];
const NATURE_OF_WORK_OPTIONS = ['Construction', 'Installation', 'Maintenance', 'Testing', 'Others'];

export const InventoryMasterScreen: React.FC<Props> = ({ navigation }) => {
  const [items, setItems] = useState<InventoryMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [material, setMaterial] = useState('');
  const [measurement, setMeasurement] = useState('Bags');
  const [materialType, setMaterialType] = useState<'Prime' | 'Other'>('Prime');
  const [selectedNatureOfWork, setSelectedNatureOfWork] = useState<string[]>(['Construction']);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await constructionService.getInventoryMaster();
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load inventory master:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleNatureOfWork = (item: string) => {
    if (selectedNatureOfWork.includes(item)) {
      if (selectedNatureOfWork.length > 1) {
        setSelectedNatureOfWork(selectedNatureOfWork.filter((x) => x !== item));
      }
    } else {
      setSelectedNatureOfWork([...selectedNatureOfWork, item]);
    }
  };

  const handleReset = () => {
    setMaterial('');
    setMeasurement('Bags');
    setMaterialType('Prime');
    setSelectedNatureOfWork(['Construction']);
  };

  const handleCreate = async () => {
    if (!material.trim()) {
      Alert.alert('Required Field', 'Please enter a material name.');
      return;
    }

    try {
      setSubmitting(true);
      await constructionService.createInventoryMaster({
        category,
        material,
        measurement,
        materialType,
        natureOfWork: selectedNatureOfWork,
      });
      Alert.alert('Success', 'Inventory master item registered.');
      handleReset();
      fetchItems();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save inventory master item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Remove this material from inventory master?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await constructionService.deleteInventoryMaster(id);
            fetchItems();
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
        <Text style={styles.headerTitle}>5. Inventory Master</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Inventory Master Item</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryRow}>
              {DEFAULT_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. UltraTech PPC Cement"
              placeholderTextColor="#94A3B8"
              value={material}
              onChangeText={setMaterial}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Measurement Unit *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bags, Tons, Nos, Litres"
              placeholderTextColor="#94A3B8"
              value={measurement}
              onChangeText={setMeasurement}
            />
          </View>

          {/* Material Type Pills */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material Type</Text>
            <View style={styles.pillsRow}>
              {(['Prime', 'Other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.pillBtn, materialType === type && styles.pillBtnActive]}
                  onPress={() => setMaterialType(type)}
                >
                  <Text style={[styles.pillBtnText, materialType === type && styles.pillBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nature of Work Pills */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nature of Work</Text>
            <View style={styles.pillsRow}>
              {NATURE_OF_WORK_OPTIONS.map((now) => {
                const active = selectedNatureOfWork.includes(now);
                return (
                  <TouchableOpacity
                    key={now}
                    style={[styles.nowBtn, active && styles.nowBtnActive]}
                    onPress={() => toggleNatureOfWork(now)}
                  >
                    <Text style={[styles.nowBtnText, active && styles.nowBtnTextActive]}>
                      {now}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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

        {/* Master Items List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Master Catalogue ({items.length})</Text>

          {loading ? (
            <ActivityIndicator color="#0D5C3A" style={{ marginVertical: 24 }} />
          ) : items.length === 0 ? (
            <Text style={styles.emptyText}>No inventory master items found.</Text>
          ) : (
            items.map((item, idx) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.badgeIndex}>
                    <Text style={styles.badgeIndexText}>{idx + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.material}</Text>
                    <Text style={styles.itemSub}>
                      {item.category} • {item.measurement} • {item.materialType || 'Prime'}
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0D5C3A',
    borderColor: '#0D5C3A',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  pillBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pillBtnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
  },
  nowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  nowBtnActive: {
    backgroundColor: '#0D5C3A',
    borderColor: '#0D5C3A',
  },
  nowBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  nowBtnTextActive: {
    color: '#FFFFFF',
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
export default InventoryMasterScreen;
