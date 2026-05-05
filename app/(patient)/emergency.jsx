import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, ActivityIndicator, Alert, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getEmergencies, submitEmergency,
  getEmergencyContacts, addEmergencyContact,
  updateEmergencyContact, deleteEmergencyContact,
  getAvailableDoctors,
} from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMERGENCY_TYPES = [
  { value: 'severe_tooth_pain', label: 'Severe Tooth Pain', icon: 'sentiment-very-dissatisfied' },
  { value: 'bleeding_gums', label: 'Bleeding Gums', icon: 'water-drop' },
  { value: 'broken_tooth', label: 'Broken Tooth', icon: 'broken-image' },
  { value: 'swelling_infection', label: 'Swelling / Infection', icon: 'sick' },
  { value: 'other', label: 'Other Emergency', icon: 'emergency' },
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  assigned: '#06b6d4',
  resolved: '#10b981',
  cancelled: '#ef4444',
};

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

const REL_LABELS = {
  parent: 'Parent', spouse: 'Spouse', child: 'Child',
  sibling: 'Sibling', friend: 'Friend', colleague: 'Colleague', other: 'Other',
};

export default function Emergency() {
  const router = useRouter();
  const [view, setView] = useState('list');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [contactModal, setContactModal] = useState(null);
  const [savingContact, setSavingContact] = useState(false);
  const [form, setForm] = useState({
    patient_name: '', contact_number: '', emergency_type: '',
    pain_level: 5, description: '', assigned_doctor_id: '',
    preferred_date: '', preferred_time: '',
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const u = JSON.parse(await AsyncStorage.getItem('dent_ai_user') || '{}');
      setUser(u);
      setForm(f => ({ ...f, patient_name: u.full_name || '', contact_number: u.phone || '' }));
      const [eRes, cRes, dRes] = await Promise.all([
        getEmergencies(), getEmergencyContacts(), getAvailableDoctors(),
      ]);
      setEmergencies(eRes.data.data || []);
      setContacts(cRes.data.data || []);
      setDoctors(dRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.emergency_type) { Alert.alert('Error', 'Please select an emergency type.'); return; }
    if (!form.assigned_doctor_id) { Alert.alert('Error', 'Please select a preferred doctor.'); return; }
    if (!form.description) { Alert.alert('Error', 'Please describe your emergency.'); return; }
    try {
      setSubmitting(true);
      const preferred_time = form.preferred_date && form.preferred_time
        ? `${form.preferred_date} ${form.preferred_time}` : form.preferred_time;
      await submitEmergency({ ...form, preferred_time });
      Alert.alert('Submitted', 'Emergency request submitted! Waiting for doctor to accept.', [
        { text: 'OK', onPress: () => { setView('list'); init(); } }
      ]);
      setForm(f => ({ ...f, emergency_type: '', pain_level: 5, description: '', assigned_doctor_id: '', preferred_date: '', preferred_time: '' }));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveContact = async () => {
    if (!contactModal) return;
    const { mode, id, name, phone, relationship } = contactModal;
    if (!name.trim()) { Alert.alert('Error', 'Full name is required.'); return; }
    if (!phone.trim()) { Alert.alert('Error', 'Phone number is required.'); return; }
    if (!relationship) { Alert.alert('Error', 'Relationship is required.'); return; }
    try {
      setSavingContact(true);
      const payload = { name: name.trim(), phone: phone.trim(), relationship, priority: contactModal.priority };
      if (mode === 'add') await addEmergencyContact(payload);
      else await updateEmergencyContact(id, payload);
      const res = await getEmergencyContacts();
      setContacts(res.data.data || []);
      setContactModal(null);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save contact.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = (contactId) => {
    Alert.alert('Remove Contact', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await deleteEmergencyContact(contactId);
        const res = await getEmergencyContacts();
        setContacts(res.data.data || []);
      }},
    ]);
  };

  const openAddContact = () => setContactModal({
    mode: 'add', name: '', phone: '', relationship: '',
    priority: contacts.length === 0 ? 'primary' : 'secondary',
  });

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={Colors.bad} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency</Text>
        <TouchableOpacity onPress={() => setView(view === 'list' ? 'form' : 'list')}
          style={[styles.headerBtn, view === 'form' && styles.headerBtnAlt]}>
          <Text style={[styles.headerBtnText, view === 'form' && { color: Colors.muted }]}>
            {view === 'list' ? '+ New Request' : 'My Requests'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <MaterialIcons name="emergency" size={28} color="#fff" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.heroTitle}>Dental Emergency?</Text>
          <Text style={styles.heroSub}>Submit a request and we'll contact you immediately.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── LIST VIEW ─── */}
        {view === 'list' && (
          <>
            {/* Contacts Book */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionIconWrap}>
                  <MaterialIcons name="contact-phone" size={18} color={Colors.bad} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                  <Text style={styles.sectionSub}>Up to 2 personal contacts</Text>
                </View>
                {contacts.length < 2 && (
                  <TouchableOpacity style={styles.addBtn} onPress={openAddContact}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {contacts.length === 0 ? (
                <TouchableOpacity style={styles.emptyContacts} onPress={openAddContact}>
                  <MaterialIcons name="contacts" size={36} color={Colors.line} />
                  <Text style={styles.emptyText}>No contacts yet. Tap to add one.</Text>
                </TouchableOpacity>
              ) : (
                contacts.slice().sort(a => a.priority === 'primary' ? -1 : 1).map(c => (
                  <View key={c._id} style={[styles.contactCard, c.priority === 'primary' && styles.contactCardPrimary]}>
                    <View style={[styles.contactAvatar, c.priority === 'primary' && { backgroundColor: 'rgba(181,40,56,0.1)' }]}>
                      <MaterialIcons name="person" size={20} color={c.priority === 'primary' ? Colors.bad : Colors.muted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.contactNameRow}>
                        <Text style={styles.contactName}>{c.name}</Text>
                        <View style={[styles.priorityBadge, c.priority === 'primary' && styles.priorityBadgePrimary]}>
                          <Text style={[styles.priorityText, c.priority === 'primary' && { color: '#fff' }]}>
                            {c.priority === 'primary' ? '1st' : '2nd'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.contactPhone}>{c.country_code} {c.phone}</Text>
                      <Text style={styles.contactRel}>{REL_LABELS[c.relationship] || c.relationship}</Text>
                    </View>
                    <View style={styles.contactActions}>
                      <TouchableOpacity onPress={() => setContactModal({ mode: 'edit', id: c._id, name: c.name, phone: c.phone, relationship: c.relationship, priority: c.priority })}>
                        <MaterialIcons name="edit" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteContact(c._id)} style={{ marginTop: 8 }}>
                        <MaterialIcons name="delete" size={20} color={Colors.bad} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* My Requests */}
            <Text style={styles.listTitle}>My Emergency Requests</Text>
            {emergencies.length === 0 ? (
              <View style={styles.emptyRequests}>
                <MaterialIcons name="health-and-safety" size={48} color={Colors.line} />
                <Text style={styles.emptyText}>No emergency requests yet.</Text>
                <TouchableOpacity style={styles.submitBtn} onPress={() => setView('form')}>
                  <Text style={styles.submitBtnText}>Submit Emergency Request</Text>
                </TouchableOpacity>
              </View>
            ) : (
              emergencies.map((e, i) => (
                <View key={i} style={styles.requestCard}>
                  <View style={styles.requestTop}>
                    <Text style={styles.requestType}>{e.emergency_type?.replace(/_/g, ' ')}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[e.status] + '22' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[e.status] || Colors.muted }]}>
                        {e.status?.charAt(0).toUpperCase() + e.status?.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.requestDesc} numberOfLines={2}>{e.description}</Text>
                  <Text style={styles.requestDate}>{new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                </View>
              ))
            )}
          </>
        )}

        {/* ─── FORM VIEW ─── */}
        {view === 'form' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Dental Emergency Form</Text>

            {/* Name & Phone */}
            <Text style={styles.label}>Patient Name *</Text>
            <TextInput style={styles.input} value={form.patient_name}
              onChangeText={v => setForm(f => ({ ...f, patient_name: v }))} placeholder="Your full name" />

            <Text style={styles.label}>Contact Number *</Text>
            <TextInput style={styles.input} value={form.contact_number}
              onChangeText={v => setForm(f => ({ ...f, contact_number: v }))}
              placeholder="+94 71 234 5678" keyboardType="phone-pad" />

            {/* Emergency Type */}
            <Text style={styles.label}>Type of Emergency *</Text>
            <View style={styles.typesGrid}>
              {EMERGENCY_TYPES.map(t => (
                <TouchableOpacity key={t.value}
                  style={[styles.typeChip, form.emergency_type === t.value && styles.typeChipActive]}
                  onPress={() => setForm(f => ({ ...f, emergency_type: t.value }))}>
                  <MaterialIcons name={t.icon} size={18} color={form.emergency_type === t.value ? Colors.bad : Colors.muted} />
                  <Text style={[styles.typeLabel, form.emergency_type === t.value && { color: Colors.bad }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Doctor */}
            <Text style={styles.label}>Preferred Doctor *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {doctors.map(d => (
                <TouchableOpacity key={d._id}
                  style={[styles.doctorChip, form.assigned_doctor_id === d._id && styles.doctorChipActive]}
                  onPress={() => setForm(f => ({ ...f, assigned_doctor_id: d._id }))}>
                  <Text style={[styles.doctorChipText, form.assigned_doctor_id === d._id && { color: Colors.bad }]}>
                    {d.full_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Pain Level */}
            <Text style={styles.label}>Pain Level: {form.pain_level}/10</Text>
            <View style={styles.painRow}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <TouchableOpacity key={n} style={[styles.painDot,
                  { backgroundColor: n <= form.pain_level ? (n <= 3 ? '#10b981' : n <= 6 ? '#f59e0b' : Colors.bad) : Colors.line }]}
                  onPress={() => setForm(f => ({ ...f, pain_level: n }))}>
                  <Text style={styles.painNum}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textarea]} value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
              placeholder="Describe your emergency in detail..." multiline numberOfLines={4} textAlignVertical="top" />

            {/* Submit */}
            <TouchableOpacity style={[styles.submitBtn, styles.submitBtnFull, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialIcons name="emergency" size={20} color="#fff" />
                  <Text style={[styles.submitBtnText, { marginLeft: 8 }]}>Submit Emergency Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Contact Modal */}
      <Modal visible={!!contactModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{contactModal?.mode === 'add' ? 'Add' : 'Edit'} Emergency Contact</Text>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={contactModal?.name || ''}
              onChangeText={v => setContactModal(m => ({ ...m, name: v }))} placeholder="Contact's full name" />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput style={styles.input} value={contactModal?.phone || ''}
              onChangeText={v => setContactModal(m => ({ ...m, phone: v }))}
              placeholder="+94 71 234 5678" keyboardType="phone-pad" />

            <Text style={styles.label}>Relationship *</Text>
            <View style={styles.relGrid}>
              {Object.entries(REL_LABELS).map(([k, v]) => (
                <TouchableOpacity key={k}
                  style={[styles.relChip, contactModal?.relationship === k && styles.relChipActive]}
                  onPress={() => setContactModal(m => ({ ...m, relationship: k }))}>
                  <Text style={[styles.relText, contactModal?.relationship === k && { color: Colors.bad }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setContactModal(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, savingContact && { opacity: 0.6 }]}
                onPress={handleSaveContact} disabled={savingContact}>
                {savingContact ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.line },
  headerTitle: { ...Typography.h3, fontSize: 18, color: Colors.ink },
  headerBtn: { backgroundColor: Colors.bad, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  headerBtnAlt: { backgroundColor: Colors.line },
  headerBtnText: { ...Typography.bodyBold, fontSize: 12, color: '#fff' },
  heroBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bad, padding: Spacing.lg, margin: Spacing.lg, borderRadius: 16 },
  heroTitle: { ...Typography.h3, color: '#fff', fontSize: 16 },
  heroSub: { ...Typography.body, color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },
  section: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.lg, marginBottom: Spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(181,40,56,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sectionTitle: { ...Typography.bodyBold, fontSize: 14, color: Colors.ink },
  sectionSub: { ...Typography.caption, fontSize: 10, color: Colors.muted, textTransform: 'none', letterSpacing: 0 },
  addBtn: { backgroundColor: Colors.bad, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { ...Typography.bodyBold, fontSize: 12, color: '#fff' },
  emptyContacts: { alignItems: 'center', paddingVertical: Spacing.xl, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.line, borderRadius: 12 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.line },
  contactCardPrimary: { backgroundColor: 'rgba(181,40,56,0.05)', borderColor: 'rgba(181,40,56,0.25)' },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  contactName: { ...Typography.bodyBold, fontSize: 14, color: Colors.ink, marginRight: 6 },
  priorityBadge: { backgroundColor: Colors.line, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  priorityBadgePrimary: { backgroundColor: Colors.bad },
  priorityText: { fontSize: 10, fontWeight: 'bold', color: Colors.muted },
  contactPhone: { ...Typography.body, fontSize: 13, color: Colors.muted },
  contactRel: { ...Typography.caption, fontSize: 10, color: Colors.primary, textTransform: 'none', letterSpacing: 0, marginTop: 2 },
  contactActions: { alignItems: 'center', marginLeft: 8 },
  listTitle: { ...Typography.h2, fontSize: 18, color: Colors.ink, marginBottom: Spacing.md },
  emptyRequests: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.white, borderRadius: 16, marginBottom: Spacing.lg },
  emptyText: { ...Typography.body, color: Colors.muted, marginTop: 8, marginBottom: Spacing.md },
  requestCard: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.lg, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: Colors.bad },
  requestTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  requestType: { ...Typography.bodyBold, fontSize: 14, color: Colors.ink, textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  requestDesc: { ...Typography.body, fontSize: 13, color: Colors.muted, marginBottom: 6 },
  requestDate: { ...Typography.caption, fontSize: 10, color: Colors.muted, textTransform: 'none', letterSpacing: 0 },
  formCard: { backgroundColor: Colors.white, borderRadius: 20, padding: Spacing.lg, marginBottom: Spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 },
  formTitle: { ...Typography.h2, fontSize: 20, color: Colors.ink, marginBottom: Spacing.lg },
  label: { ...Typography.caption, fontSize: 10, color: Colors.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 12, ...Typography.body, fontSize: 14, color: Colors.ink, backgroundColor: '#fbfdfe', marginBottom: Spacing.md },
  textarea: { height: 100 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.line, gap: 6 },
  typeChipActive: { borderColor: Colors.bad, backgroundColor: 'rgba(181,40,56,0.06)' },
  typeLabel: { ...Typography.body, fontSize: 12, color: Colors.muted },
  doctorChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.line, marginRight: 8 },
  doctorChipActive: { borderColor: Colors.bad, backgroundColor: 'rgba(181,40,56,0.06)' },
  doctorChipText: { ...Typography.bodyBold, fontSize: 13, color: Colors.muted },
  painRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  painDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  painNum: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  submitBtn: { backgroundColor: Colors.bad, borderRadius: 14, paddingVertical: 14, paddingHorizontal: Spacing.lg, alignItems: 'center', marginTop: Spacing.md, shadowColor: Colors.bad, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  submitBtnFull: { flexDirection: 'row', justifyContent: 'center' },
  submitBtnText: { ...Typography.h3, fontSize: 15, color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, paddingBottom: Spacing.xxl },
  modalTitle: { ...Typography.h2, fontSize: 20, color: Colors.ink, marginBottom: Spacing.lg },
  relGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  relChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.line },
  relChipActive: { borderColor: Colors.bad, backgroundColor: 'rgba(181,40,56,0.06)' },
  relText: { ...Typography.body, fontSize: 13, color: Colors.muted },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.line, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { ...Typography.bodyBold, color: Colors.muted },
  saveBtn: { flex: 1, backgroundColor: Colors.bad, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { ...Typography.bodyBold, color: '#fff' },
});
