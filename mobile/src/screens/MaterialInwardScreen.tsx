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
import { InwardMaterialEntry, InventoryMasterItem } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MaterialInward'>;

export const MaterialInwardScreen: React.FC<Props> = ({ navigation }) => {
  const [entries, setEntries] = useState<InwardMaterialEntry[]>([]);
  const [masterItems, setMasterItems] = useState<InventoryMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState('10-08-2025');
  const [category, setCategory] = useState('Cement');
  const [material, setMaterial] = useState('UltraTech PPC');
  const [quantity, setQuantity] = useState('');
  const [measurement, setMeasurement] = useState('Bags');
  const [totalValue, setTotalValue] = useState('');
  const [latestCode, setLatestCode] = useState<string | null>(null);

  const autoUnitPrice = (() => {
    const qty = parseFloat(quantity);
    const val = parseFloat(totalValue);
    if (!isNaN(qty) && qty > 0 && !isNaN(val) && val >= 0) {
      return (val / qty).toFixed(2);
    }
    return '0.00';
  })();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inwData, masterData] = await Promise.all([
        constructionService.getMaterialInward(),
        constructionService.getInventoryMaster(),
      ]);
      setEntries(inwData || []);
      setMasterItems(masterData || []);
      if (masterData && masterData.length > 0 && !material) {
        setMaterial(masterData[0].material);
        setCategory(masterData[0].category);
        setMeasurement(masterData[0].measurement);
      }
    } catch (err) {
      console.error('Failed to load inward data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMaterialSelect = (matName: string) => {
    setMaterial(matName);
    const matched = masterItems.find((m) => m.material === matName);
    if (matched) {
      setCategory(matched.category);
      setMeasurement(matched.measurement);
    }
  };

  const handleReset = () => {
    setQuantity('');
    setTotalValue('');
    setLatestCode(null);
  };

  const handleGenerate = async () => {
    const qtyNum = parseFloat(quantity);
    if (!material.trim() || !category.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Required Fields', 'Please enter valid material and quantity.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await constructionService.createMaterialInward({
        date,
        category,
        material,
        quantity: qtyNum,
        measurement,
        totalValue: parseFloat(totalValue) || 0,
      });

      setLatestCode(res.entryCode);
      Alert.alert('Generated Code', `Unique Entry Code: ${res.entryCode}`);
      handleReset();
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to generate inward entry.');
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
        <Text style={styles.headerTitle}>6. Inward Material Entry</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {latestCode && (
          <View style={styles.codeCard}>
            <Ionicons name="sparkles" size={20} color="#2563EB" />
            <View>
              <Text style={styles.codeTitle}>Entry Code Generated</Text>
              <Text style={styles.codeValue}>{latestCode}</Text>
            </View>
          </View>
        )}

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Common Material Receipt</Text>

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
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cement, Steel"
              placeholderTextColor="#94A3B8"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. UltraTech PPC"
              placeholderTextColor="#94A3B8"
              value={material}
              onChangeText={handleMaterialSelect}
            />
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

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Total Value (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="Total value"
                placeholderTextColor="#94A3B8"
                value={totalValue}
                onChangeText={setTotalValue}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Auto Unit Price</Text>
              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>₹{autoUnitPrice}</Text>
              </View>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, submitting && { opacity: 0.6 }]}
              onPress={handleGenerate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Generate Entry Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inward Receipts List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inward Receipts ({entries.length})</Text>

          {loading ? (
            <ActivityIndicator color="#0D5C3A" style={{ marginVertical: 24 }} />
          ) : entries.length === 0 ? (
            <Text style={styles.emptyText}>No inward material recorded yet.</Text>
          ) : (
            entries.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.codeBadge}>{item.entryCode}</Text>
                  <Text style={styles.itemTitle}>{item.material}</Text>
                  <Text style={styles.itemSub}>
                    {item.quantity} {item.measurement} • Total: ₹{Number(item.totalValue || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.unitPriceText}>
                    Unit Price: ₹{Number(item.unitPrice || 0).toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
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
  codeCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
    textTransform: 'uppercase',
  },
  codeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
    fontFamily: 'monospace',
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
  readOnlyBox: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  readOnlyText: {
    fontSize: 13,
    color: '#0D5C3A',
    fontWeight: '700',
    fontFamily: 'monospace',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  codeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'monospace',
    marginBottom: 2,
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
  unitPriceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D5C3A',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
  },
});
export default MaterialInwardScreen;
