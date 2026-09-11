import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteMapView'>;

export const SiteMapViewScreen: React.FC<Props> = ({ navigation }) => {
  const { sites } = useMobileData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Site Map</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={18} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Map Surface */}
      <View style={styles.mapContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80',
          }}
          style={styles.mapBg}
        >
          {/* Pins Overlay */}
          {sites.map((s, idx) => {
            const topPct = `${25 + ((idx * 27) % 50)}%`;
            const leftPct = `${20 + ((idx * 31) % 55)}%`;
            const bg = s.status === 'Active' ? '#10B981' : '#F59E0B';
            return (
              <View
                key={s.id}
                style={[styles.pin, { top: topPct as any, left: leftPct as any, backgroundColor: bg }]}
              >
                <Ionicons name="location" size={16} color="#FFFFFF" />
              </View>
            );
          })}

          {sites.length === 0 && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(15,23,42,0.85)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                No site locations recorded.
              </Text>
            </View>
          )}

          {/* Zoom controls */}
          <View style={styles.zoomBox}>
            <TouchableOpacity style={styles.zoomBtn}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomBtn}>
              <Ionicons name="remove" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Legend Box at Bottom (matching Image 3 & 4 Screen 11) */}
        <View style={styles.legendCard}>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendLabel}>High Alert</Text>

            <View style={[styles.dot, { backgroundColor: '#F59E0B', marginLeft: 16 }]} />
            <Text style={styles.legendLabel}>Medium Alert</Text>
          </View>

          <View style={[styles.legendRow, { marginTop: 6 }]}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendLabel}>Low Alert</Text>

            <View style={[styles.dot, { backgroundColor: '#10B981', marginLeft: 16 }]} />
            <Text style={styles.legendLabel}>Normal</Text>

            <View style={[styles.dot, { backgroundColor: '#8B5CF6', marginLeft: 16 }]} />
            <Text style={styles.legendLabel}>Drone Location</Text>
          </View>
        </View>
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBg: {
    flex: 1,
  },
  pin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  zoomBox: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  zoomBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
