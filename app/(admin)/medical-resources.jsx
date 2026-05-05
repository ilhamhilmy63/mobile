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
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { getMedicalResources, deleteMedicalResource } from '../../services/api';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
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
    Alert.alert(
      'Delete medical resource?',
      `Are you sure you want to delete "${item.title}"? This resource will no longer be visible to patients.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Resource', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicalResource(item._id);
              fetchResources();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete medical resource');
            }
          }
        }
      ]
    );
  };

  const filteredResources = resources.filter((resource) => {
    return (
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image_url ? (
        <Image source={{ uri: getImageUrl(item.image_url) }} style={styles.cardImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <MaterialIcons name="image" size={48} color="#94a3b8" />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(admin)/medical-resource-form', params: { id: item._id } })}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
              <Text style={styles.deleteIconText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        {item.url && (
          <TouchableOpacity style={styles.viewLink}>
            <Text style={styles.viewLinkText}>View Resource →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow_back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>MEDICAL RESOURCES</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(admin)/medical-resource-form')}
        >
          <Text style={styles.addButtonText}>+ Add Resource</Text>
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
              <Text style={styles.emptyText}>No resources found</Text>
            </View>
          }
        />
      )}
    </View>
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
    paddingTop: Spacing.xl * 2,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: Spacing.md,
  },
  topTitle: {
    ...Typography.h2,
    fontSize: 18,
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
    fontSize: 14,
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
    fontSize: 14,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 12,
  },
  deleteBtn: {
    paddingHorizontal: 4,
  },
  deleteIconText: {
    color: '#dc2626',
    fontSize: 24,
    fontWeight: '400',
    marginTop: -4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewLink: {
    alignSelf: 'flex-start',
  },
  viewLinkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
