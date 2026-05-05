import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { getMedicalResources } from '../../services/api';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://192.168.0.236:5000${url}`;
};

export default function PatientMedicalResources() {
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await getMedicalResources();
      setResources(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResources();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.record_type || 'Record'}</Text>
        </View>
        <Text style={styles.dateText}>{item.record_date ? new Date(item.record_date).toLocaleDateString() : ''}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.patientName}>{item.patient_name}</Text>
        <Text style={styles.patientId}>Patient ID: {item.patient_id}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={14} color="#64748b" />
          <Text style={styles.infoText}>Doctor ID: {item.doctor_id}</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>Notes:</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>

        {item.url && (
          <TouchableOpacity 
            style={styles.viewLink}
            onPress={() => {/* Handle opening URL */}}
          >
            <Text style={styles.viewLinkText}>View Attached Report →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow_back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>MY MEDICAL RECORDS</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No medical records available yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: Spacing.md,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  typeBadge: {
    backgroundColor: '#ecfeff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#0891b2',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  cardBody: {
    padding: 16,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  patientId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  viewLink: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  viewLinkText: {
    color: '#0891b2',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
