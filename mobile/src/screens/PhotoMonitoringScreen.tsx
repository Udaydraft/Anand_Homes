import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { SitePhoto } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoMonitoring'>;

export const PhotoMonitoringScreen: React.FC<Props> = ({ navigation }) => {
  const { photos, sites, myAssignedSites, roleMode, uploadPhoto } = useMobileData();
  const [tab, setTab] = useState<'All' | 'Stock In' | 'Stock Out' | 'Site Progress'>('All');

  const availableSites = roleMode === 'supervisor' ? myAssignedSites : sites;
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>(
    roleMode === 'supervisor' ? availableSites[0]?.name || '' : 'All Sites'
  );

  useEffect(() => {
    if (roleMode === 'supervisor') {
      if (availableSites.length > 0 && (!selectedSiteFilter || selectedSiteFilter === 'All Sites')) {
        setSelectedSiteFilter(availableSites[0].name);
      }
    }
  }, [roleMode, availableSites]);

  // Upload Photo Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSite, setUploadSite] = useState(availableSites[0]?.name || '');
  const [uploadType, setUploadType] = useState<'Site Progress' | 'Stock In' | 'Stock Out'>('Site Progress');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadImageUrl, setUploadImageUrl] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo Detail Modal State
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto | null>(null);

  const sampleImages = [
    { label: 'Foundation Work', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80' },
    { label: 'Brickwork / Masonry', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80' },
    { label: 'Steel Reinforcement', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80' },
    { label: 'Finishing & Plaster', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80' },
  ];

  const siteOptions =
    roleMode === 'supervisor'
      ? availableSites.map((s) => s.name)
      : ['All Sites', ...sites.map((s) => s.name)];

  const basePhotos =
    roleMode === 'supervisor'
      ? photos.filter((p) => myAssignedSites.some((s) => s.name === p.site))
      : photos;

  const filtered = basePhotos.filter((p) => {
    const matchTab = tab === 'All' || p.type === tab;
    const matchSite =
      selectedSiteFilter === 'All Sites' || p.site === selectedSiteFilter;
    return matchTab && matchSite;
  });

  const handleOpenUpload = () => {
    if (availableSites.length > 0 && !uploadSite) {
      setUploadSite(availableSites[0].name);
    }
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async () => {
    if (!uploadSite || !uploadTitle.trim() || !uploadImageUrl.trim()) return;
    setIsSubmitting(true);
    try {
      await uploadPhoto({
        site: uploadSite,
        type: uploadType,
        title: uploadTitle.trim(),
        imageUrl: uploadImageUrl.trim(),
      });
      setShowUploadModal(false);
      setUploadTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Monitoring</Text>
        <TouchableOpacity onPress={handleOpenUpload} style={styles.headerUploadBtn}>
          <Ionicons name="camera" size={14} color="#FFFFFF" />
          <Text style={styles.headerUploadBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Site Filter */}
      {siteOptions.length > 0 && (
        <View style={styles.siteFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.siteScroll}>
            {siteOptions.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSelectedSiteFilter(s)}
                style={[styles.sitePill, selectedSiteFilter === s && styles.sitePillActive]}
              >
                <Ionicons
                  name="business-outline"
                  size={12}
                  color={selectedSiteFilter === s ? '#0D5C3A' : '#64748B'}
                />
                <Text style={[styles.sitePillText, selectedSiteFilter === s && styles.sitePillTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="images-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Photos Recorded</Text>
            <Text style={styles.emptySub}>
              {roleMode === 'supervisor' && availableSites.length === 0
                ? 'No project site is assigned to your account.'
                : 'Upload progress and site delivery photos using the button below.'}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.photoCard}
              onPress={() => setSelectedPhoto(item)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.photoImg} />
              <View style={styles.cardInfo}>
                <Text style={styles.photoTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.photoSite}>{item.site}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={styles.photoTime}>{item.timestamp}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Upload New Photo Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleOpenUpload}>
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.uploadBtnText}>Upload New Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Photo Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Upload Site Photo</Text>
                <Text style={styles.modalSub}>Record photo progress for construction monitoring</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {availableSites.length === 0 ? (
                <View style={styles.warnCard}>
                  <Ionicons name="alert-circle" size={18} color="#D97706" />
                  <Text style={styles.warnText}>
                    No project site assigned. Contact administrator to upload photos.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Select Project Site *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {availableSites.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.chip, uploadSite === s.name && styles.chipActive]}
                        onPress={() => setUploadSite(s.name)}
                      >
                        <Text style={[styles.chipText, uploadSite === s.name && styles.chipTextActive]}>
                          {s.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>Photo Category / Stage *</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                    {(['Site Progress', 'Stock In', 'Stock Out'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.stageChip, uploadType === t && styles.stageChipActive]}
                        onPress={() => setUploadType(t)}
                      >
                        <Text style={[styles.stageChipText, uploadType === t && styles.stageChipTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Caption / Title *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 2nd Floor Column Rebar Inspection"
                    placeholderTextColor="#94A3B8"
                    value={uploadTitle}
                    onChangeText={setUploadTitle}
                  />

                  <Text style={styles.inputLabel}>Select Sample Image or Custom URL</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {sampleImages.map((img, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.sampleThumbBox,
                          uploadImageUrl === img.url && styles.sampleThumbBoxActive,
                        ]}
                        onPress={() => setUploadImageUrl(img.url)}
                      >
                        <Image source={{ uri: img.url }} style={styles.sampleThumb} />
                        <Text style={styles.sampleLabel} numberOfLines={1}>{img.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TextInput
                    style={[styles.textInput, { fontSize: 11 }]}
                    placeholder="Or paste custom image URL..."
                    placeholderTextColor="#94A3B8"
                    value={uploadImageUrl}
                    onChangeText={setUploadImageUrl}
                  />

                  {uploadImageUrl ? (
                    <View style={styles.previewBox}>
                      <Text style={styles.previewLabel}>Preview:</Text>
                      <Image source={{ uri: uploadImageUrl }} style={styles.previewImg} />
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  (!uploadSite || !uploadTitle.trim() || !uploadImageUrl || isSubmitting) && { opacity: 0.6 },
                ]}
                disabled={!uploadSite || !uploadTitle.trim() || !uploadImageUrl || isSubmitting}
                onPress={handleUploadSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Photo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <Modal
          visible={!!selectedPhoto}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalBox, { padding: 0, overflow: 'hidden' }]}>
              <Image source={{ uri: selectedPhoto.imageUrl }} style={styles.modalLargeImg} />
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={styles.detailTitle}>{selectedPhoto.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailMetaRow}>
                  <Ionicons name="business-outline" size={14} color="#0D5C3A" />
                  <Text style={styles.detailMetaText}>{selectedPhoto.site}</Text>
                </View>

                <View style={styles.detailMetaRow}>
                  <Ionicons name="layers-outline" size={14} color="#64748B" />
                  <Text style={styles.detailMetaText}>Stage: {selectedPhoto.type}</Text>
                </View>

                <View style={styles.detailMetaRow}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.detailMetaText}>{selectedPhoto.timestamp}</Text>
                </View>

                {selectedPhoto.uploader && (
                  <View style={styles.detailMetaRow}>
                    <Ionicons name="person-outline" size={14} color="#64748B" />
                    <Text style={styles.detailMetaText}>Uploaded by: {selectedPhoto.uploader}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={() => setSelectedPhoto(null)}
                >
                  <Text style={styles.detailCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  headerUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D5C3A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerUploadBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  siteFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  siteScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sitePillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#0D5C3A',
  },
  sitePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  sitePillTextActive: {
    color: '#0D5C3A',
    fontWeight: '700',
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
  emptyBox: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#0D5C3A',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#0D5C3A',
    fontWeight: '700',
  },
  stageChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stageChipActive: {
    backgroundColor: '#0D5C3A',
    borderColor: '#0D5C3A',
  },
  stageChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  stageChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sampleThumbBox: {
    width: 80,
    marginRight: 8,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sampleThumbBoxActive: {
    borderColor: '#0D5C3A',
  },
  sampleThumb: {
    width: '100%',
    height: 50,
  },
  sampleLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    paddingVertical: 2,
    backgroundColor: '#F8FAFC',
  },
  previewBox: {
    marginTop: 10,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  previewImg: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  warnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  warnText: {
    fontSize: 12,
    color: '#B45309',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0D5C3A',
  },
  modalSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalLargeImg: {
    width: '100%',
    height: 200,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  detailMetaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  detailCloseBtn: {
    marginTop: 16,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
