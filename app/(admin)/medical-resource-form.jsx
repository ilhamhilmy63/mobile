import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { createMedicalResource, updateMedicalResource, getMedicalResourceById } from '../../services/api';

const RECORD_TYPES = ['Xray', 'Photo', 'Report', 'Prescription', 'Schedule', 'Inventory', 'Other'];
const SEX_OPTIONS = ['Male', 'Female', 'Other'];

export default function MedicalResourceForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;

  const initialForm = {
    title: '',
    category: 'Medical Record',
    description: '',
    url: '',
    record_type: '',
    record_date: new Date().toISOString().split('T')[0],
    patient_id: '',
    patient_name: '',
    phone_number: '',
    email: '',
    sex: '',
    doctor_id: '',
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchResource();
    }
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await getMedicalResourceById(id);
      const data = response.data.data;
      setForm({
        title: data.title || '',
        category: data.category || 'Medical Record',
        description: data.description || '',
        url: data.url || '',
        record_type: data.record_type || '',
        record_date: data.record_date ? new Date(data.record_date).toISOString().split('T')[0] : '',
        patient_id: data.patient_id || '',
        patient_name: data.patient_name || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        sex: data.sex || '',
        doctor_id: data.doctor_id || '',
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load record details');
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    if (!form.record_type || !form.patient_id || !form.patient_name || !form.phone_number || !form.doctor_id || !form.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    if (form.patient_id.length !== 6) {
      Alert.alert('Error', 'Patient ID must be exactly 6 characters');
      return false;
    }
    if (form.doctor_id.length !== 6) {
      Alert.alert('Error', 'Doctor ID must be exactly 6 characters');
      return false;
    }
    if (form.phone_number.length !== 10 || isNaN(form.phone_number)) {
      Alert.alert('Error', 'Phone Number must be exactly 10 digits');
      return false;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (form.description.length > 100) {
      Alert.alert('Error', 'Description must be 100 characters or less');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    console.log('Save button pressed');
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      const submissionForm = { ...form, title: form.record_type };
      Object.keys(submissionForm).forEach(key => {
        formData.append(key, submissionForm[key]);
      });

      if (isEdit) {
        await updateMedicalResource(id, formData);
        Alert.alert('Success', 'Record updated successfully');
      } else {
        await createMedicalResource(formData);
        Alert.alert('Success', 'Record created successfully');
      }
      router.back();
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    console.log('Clear button pressed');
    if (isEdit) {
      router.back();
    } else {
      setForm(initialForm);
    }
  };

  const DropdownModal = ({ visible, options, onSelect, onClose, title }) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.plusBtn}>
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleClear}>
              <Text style={styles.outlineBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn}>
              <Text style={styles.outlineBtnText}>Collapse</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleSection}>
            <Text style={styles.formTitle}>Create New Entry</Text>
            <Text style={styles.formSubtitle}>Add a medical record or inventory asset</Text>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>RECORD TYPE *</Text>
                <TouchableOpacity 
                  style={styles.pickerTrigger}
                  onPress={() => setShowTypeModal(true)}
                >
                  <Text style={[styles.pickerValue, !form.record_type && styles.placeholderText]}>
                    {form.record_type || 'Select type...'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>RECORD DATE *</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={form.record_date}
                    onChangeText={(text) => setForm({ ...form, record_date: text })}
                    placeholder="mm/dd/yyyy"
                    placeholderTextColor="#94a3b8"
                  />
                  <MaterialIcons name="calendar-today" size={18} color="#64748b" style={styles.inputIcon} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>PATIENT ID *</Text>
                <TextInput
                  style={styles.input}
                  value={form.patient_id}
                  onChangeText={(text) => setForm({ ...form, patient_id: text })}
                  placeholder="P10000"
                  placeholderTextColor="#94a3b8"
                  maxLength={6}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>PATIENT NAME *</Text>
                <TextInput
                  style={styles.input}
                  value={form.patient_name}
                  onChangeText={(text) => setForm({ ...form, patient_name: text })}
                  placeholder="john"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>PHONE NUMBER *</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone_number}
                  onChangeText={(text) => setForm({ ...form, phone_number: text })}
                  placeholder="0817171717"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>SEX *</Text>
                <TouchableOpacity 
                  style={styles.pickerTrigger}
                  onPress={() => setShowSexModal(true)}
                >
                  <Text style={[styles.pickerValue, !form.sex && styles.placeholderText]}>
                    {form.sex || 'Select...'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DOCTOR ID *</Text>
              <TextInput
                style={styles.input}
                value={form.doctor_id}
                onChangeText={(text) => setForm({ ...form, doctor_id: text })}
                placeholder="D11111"
                placeholderTextColor="#94a3b8"
                maxLength={6}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="example@mail.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION (MAX 100 CHARACTERS) *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                placeholder="Clinical notes, observations..."
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={100}
              />
              <Text style={styles.charCount}>{form.description.length}/100</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DIAGNOSTIC IMAGE / FILE URL</Text>
              <TextInput
                style={styles.input}
                value={form.url}
                onChangeText={(text) => setForm({ ...form, url: text })}
                placeholder="Or paste image URL here..."
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.bottomClearBtn} onPress={handleClear}>
                <Text style={styles.bottomClearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtn, loading && styles.disabledBtn]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Record</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <DropdownModal
          visible={showTypeModal}
          title="Select Record Type"
          options={RECORD_TYPES}
          onSelect={(val) => setForm({ ...form, record_type: val })}
          onClose={() => setShowTypeModal(false)}
        />

        <DropdownModal
          visible={showSexModal}
          title="Select Sex"
          options={SEX_OPTIONS}
          onSelect={(val) => setForm({ ...form, sex: val })}
          onClose={() => setShowSexModal(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  outlineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  outlineBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  formGrid: {
    // No explicit card background to match the flat look of the image better
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1e293b',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingRight: 12,
  },
  inputIcon: {
    marginLeft: 8,
  },
  pickerTrigger: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: 14,
    color: '#1e293b',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  bottomClearBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  bottomClearBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#0891b2', // Teal/Cyan color from image
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeBtn: {
    padding: 4,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
  },
});
