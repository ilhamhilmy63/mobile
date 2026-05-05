import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('dent_ai_token');
    await AsyncStorage.removeItem('dent_ai_user');
    router.replace('/(auth)/login');
  };

  const adminActions = [
    { title: 'Manage Patients', icon: 'people', color: '#0e7490' },
    { title: 'Doctor Schedules', icon: 'event', color: '#8b5cf6' },
    { title: 'System Analytics', icon: 'analytics', color: '#10b981' },
    { title: 'Clinic Feedback', icon: 'rate_review', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Admin Portal</Text>
        <Text style={styles.subtext}>Welcome back, Administrator</Text>
      </View>

      <View style={styles.grid}>
        {adminActions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: action.color + '15' }]}>
              <MaterialIcons name={action.icon} size={28} color={action.color} />
            </View>
            <Text style={styles.cardTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.secondary,
  },
  subtext: {
    ...Typography.body,
    color: Colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.bodyBold,
    textAlign: 'center',
    fontSize: 14,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  logoutText: {
    ...Typography.bodyBold,
    color: Colors.error || '#ef4444',
  },
});
