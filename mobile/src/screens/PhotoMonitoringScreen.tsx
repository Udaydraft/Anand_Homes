import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoMonitoring'>;

export const PhotoMonitoringScreen: React.FC<Props> = ({ navigation }) => {
  const { photos } = useMobileData();
  const [tab, setTab] = useState<'All' | 'Stock In' | 'Stock Out' | 'Site Progress'>('All');

  const filtered = photos.filter((p) => tab === 'All' || p.type === tab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Monitoring</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['All', 'Stock In', 'Stock Out', 'Site Progress'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2-Column Photo Grid */}
      <ScrollView style={styles.content} contentContainerStyle={styles.grid}>
        {filtered.map((item) => (
          <View key={item.id} style={styles.photoCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.photoImg} />
            <View style={styles.cardInfo}>
              <Text style={styles.photoTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.photoSite}>{item.site}</Text>
              <Text style={styles.photoTime}>{item.timestamp}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Upload New Photo Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.uploadBtnText}>Upload New Photo</Text>
        </TouchableOpacity>
      </View>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#0D5C3A',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  photoCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: 110,
  },
  cardInfo: {
    padding: 8,
  },
  photoTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  photoSite: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  photoTime: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  bottomBar: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D5C3A',
    borderRadius: 8,
    paddingVertical: 12,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
