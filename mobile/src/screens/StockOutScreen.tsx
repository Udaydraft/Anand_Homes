import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'StockOut'>;

export const StockOutScreen: React.FC<Props> = ({ navigation }) => {
  const { addStockOut } = useMobileData();

  const [site, setSite] = useState('Site Alpha');
  const [material, setMaterial] = useState('Cement');
  const [quantity, setQuantity] = useState('25');
  const [unit, setUnit] = useState('Bags');
  const [usedFor, setUsedFor] = useState('Foundation Work');
  const [requestedBy, setRequestedBy] = useState('Site Supervisor');
  const [notes, setNotes] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const handleIssue = () => {
    addStockOut({
      site,
      material,
      quantity: parseFloat(quantity) || 0,
      unit,
      usedFor,
      requestedBy,
      notes,
    });
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Out</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Site *</Text>
            <View style={styles.pickerBox}>
              <Text style={styles.pickerText}>{site}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material *</Text>
            <View style={styles.pickerBox}>
              <Text style={styles.pickerText}>{material}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </View>
          </View>

          {/* Available Stock Pill */}
          <View style={styles.stockBadgeRow}>
            <Text style={styles.stockBadgeLabel}>Available Stock:</Text>
            <View style={styles.stockPill}>
              <Text style={styles.stockPillText}>185 Bags</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Issue Quantity *</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.pickerBox}>
                <Text style={styles.pickerText}>{unit}</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Used For *</Text>
            <TextInput
              value={usedFor}
              onChangeText={setUsedFor}
              placeholder="e.g. Foundation Work"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issued To *</Text>
            <TextInput
              value={requestedBy}
              onChangeText={setRequestedBy}
              placeholder="e.g. Site Supervisor"
              style={styles.input}
            />
          </View>

          {/* Upload Photo Proof Tap Box */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Photo (Proof)</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => setPhotoUploaded(!photoUploaded)}
            >
              <Ionicons
                name={photoUploaded ? 'checkmark-circle' : 'camera-outline'}
                size={24}
                color="#0D5C3A"
              />
              <Text style={styles.uploadText}>
                {photoUploaded ? 'Proof Photo attached ✓' : 'Tap to upload'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter notes..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              style={[styles.input, { height: 60 }]}
            />
          </View>

          <TouchableOpacity style={styles.issueBtn} onPress={handleIssue}>
            <Text style={styles.issueBtnText}>Issue Material</Text>
          </TouchableOpacity>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
  },
  pickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  stockBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stockBadgeLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  stockPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12,
    color: '#1E293B',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  issueBtn: {
    backgroundColor: '#0D5C3A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  issueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
