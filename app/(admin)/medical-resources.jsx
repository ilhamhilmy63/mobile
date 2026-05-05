import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator,
  TextInput,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { getMedicalResources, deleteMedicalResource } from '../../services/api';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://192.168.0.236:5000${url}`;
};

export default function AdminMedicalResources() {
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await getMedicalResources();
      setResources(response.data.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load medical resources');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResources();
    }, [])
  );

  const handleDelete = (item) => {
    console.log('Delete button pressed for item:', item._id);
    Alert.alert(
      'Delete Entry?',
      `Are you sure you want to delete this record for ${item.patient_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            console.log('Confirmed delete for:', item._id);
            try {
              const res = await deleteMedicalResource(item._id);
              console.log('Delete response:', res.data);
              fetchResources();
            } catch (error) {
              console.error('Delete error:', error.response?.data || error.message);
              Alert.alert('Error', 'Failed to delete entry: ' + (error.response?.data?.message || error.message));
            }
          }
        }
      ]
    );
  };

  const filteredResources = resources.filter((resource) => {
    return (
      (resource.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.record_type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.record_type || 'Record'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/(admin)/medical-resource-form', params: { id: item._id } })}
          >
            <MaterialIcons name="edit" size={20} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.patientName}>{item.patient_name}</Text>
        <Text style={styles.patientId}>ID: {item.patient_id} • {item.sex}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={14} color="#64748b" />
          <Text style={styles.infoText}>Doctor ID: {item.doctor_id}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={14} color="#64748b" />
          <Text style={styles.infoText}>{item.phone_number}</Text>
        </View>

        {item.email && (
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={14} color="#64748b" />
            <Text style={styles.infoText}>{item.email}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={14} color="#64748b" />
          <Text style={styles.infoText}>Date: {item.record_date ? new Date(item.record_date).toLocaleDateString() : 'N/A'}</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>Notes:</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>

        {item.url && (
          <TouchableOpacity style={styles.viewLink}>
            <Text style={styles.viewLinkText}>View Attached Resource →</Text>
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
        <Text style={styles.topTitle}>MEDICAL HISTORY</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID or type..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(admin)/medical-resource-form')}
        >
          <Text style={styles.addButtonText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No history records found</Text>
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
  searchSection: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    paddingBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 10,
    backgroundColor: 'transparent',
  },
  cardBody: {
    padding: 16,
    paddingTop: 8,
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
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
