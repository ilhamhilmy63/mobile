import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { getAppointments, getClinicFeedback } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clinicFeedbacks, setClinicFeedbacks] = useState([]);

  const fetchData = async () => {
    try {
      const userData = await AsyncStorage.getItem('dent_ai_user');
      if (userData) setUser(JSON.parse(userData));

      const [appointmentsRes, feedbackRes] = await Promise.all([
        getAppointments(),
        getClinicFeedback()
      ]);

      const appointments = appointmentsRes.data.data || [];
      const upcoming = appointments
        .filter(apt => new Date(apt.appointment_date) > new Date() && apt.status !== 'Cancelled')
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0];
      
      setNextAppointment(upcoming);
      setClinicFeedbacks((feedbackRes.data.data || []).slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/(auth)/login');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <Text style={styles.logo}>Dent AI</Text>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navButton}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={Colors.bad} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={{ uri: user?.profile_image || 'https://via.placeholder.com/40x40?text=U' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={Colors.primary} />}
      >
        <View style={styles.hero}>
          <Text style={styles.welcomeEyebrow}>WELCOME BACK</Text>
          <Text style={styles.welcomeTitle}>Hello, {user?.full_name?.split(' ')[0] || 'Patient'}.</Text>
          <Text style={styles.heroSubtitle}>
            Your smile is looking healthy. We've updated your clinical dashboard.
          </Text>
        </View>

        {/* Bento Grid Items */}
        <View style={styles.grid}>
          {/* Next Appointment Card */}
          <TouchableOpacity style={[styles.card, styles.wideCard]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardEyebrow}>UPCOMING VISIT</Text>
                <Text style={styles.cardTitle}>Next Appointment</Text>
              </View>
              <MaterialIcons name="event" size={28} color={Colors.primary} />
            </View>

            {nextAppointment ? (
              <View style={styles.appointmentDetails}>
                <Text style={styles.dateText}>
                  {new Date(nextAppointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.timeText}>at {nextAppointment.appointment_time}</Text>
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorInitial}>{nextAppointment.doctor_name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.doctorLabel}>Doctor</Text>
                    <Text style={styles.doctorName}>{nextAppointment.doctor_name}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            )}
          </TouchableOpacity>

          {/* AI Health Card */}
          <View style={[styles.card, styles.aiCard]}>
            <Text style={styles.aiEyebrow}>AI HEALTH SCAN</Text>
            <Text style={styles.aiStatus}>Excellent</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '92%' }]} />
            </View>
            <Text style={styles.aiScore}>Score: 92/100</Text>
          </View>

          {/* Emergency Card */}
          <TouchableOpacity 
            style={[styles.card, styles.emergencyCard]}
            onPress={() => router.push('/(patient)/emergency')}
          >
            <MaterialIcons name="emergency" size={32} color={Colors.bad} />
            <Text style={styles.emergencyText}>Emergency Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#eef5f7' }]}>
              <MaterialIcons name="calendar-today" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Book Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
              <MaterialIcons name="rate-review" size={24} color={Colors.good} />
            </View>
            <Text style={styles.actionLabel}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
              <MaterialIcons name="local-pharmacy" size={24} color="#f97316" />
            </View>
            <Text style={styles.actionLabel}>Prescription</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Clinic Insights</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewsScroll}>
            {clinicFeedbacks.map((item, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{item.patient_id?.full_name || 'Patient'}</Text>
                  <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment} numberOfLines={3}>
                  "{item.overall_comment}"
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Nav Simulation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navTab}>
          <MaterialIcons name="dashboard" size={24} color={Colors.primary} />
          <Text style={[styles.navTabText, { color: Colors.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <MaterialIcons name="event" size={24} color={Colors.muted} />
          <Text style={styles.navTabText}>Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <MaterialIcons name="biotech" size={24} color={Colors.muted} />
          <Text style={styles.navTabText}>AI Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <MaterialIcons name="person" size={24} color={Colors.muted} />
          <Text style={styles.navTabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logo: {
    ...Typography.h2,
    color: Colors.primary,
    fontSize: 20,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    marginRight: 8,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primarySoft,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  hero: {
    marginVertical: Spacing.xl,
  },
  welcomeEyebrow: {
    ...Typography.caption,
    color: Colors.muted,
  },
  welcomeTitle: {
    ...Typography.h1,
    fontSize: 36,
    marginVertical: 8,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.muted,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  wideCard: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  cardEyebrow: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.muted,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.ink,
  },
  appointmentDetails: {
    marginTop: 8,
  },
  dateText: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.primary,
  },
  timeText: {
    ...Typography.body,
    color: Colors.muted,
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInitial: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  doctorLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.muted,
  },
  doctorName: {
    ...Typography.bodyBold,
    fontSize: 14,
  },
  aiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.primary,
  },
  aiEyebrow: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  aiStatus: {
    ...Typography.h2,
    color: Colors.white,
    fontSize: 22,
    marginBottom: 16,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  aiScore: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 10,
  },
  emergencyCard: {
    flex: 1,
    minWidth: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(181, 40, 56, 0.1)',
  },
  emergencyText: {
    ...Typography.bodyBold,
    color: Colors.bad,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 20,
    marginRight: 16,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.ink,
  },
  reviewsSection: {
    marginTop: Spacing.xl,
  },
  reviewsScroll: {
    marginTop: Spacing.md,
  },
  reviewCard: {
    width: 250,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    ...Typography.bodyBold,
    fontSize: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#b45309',
    marginLeft: 4,
  },
  reviewComment: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.muted,
    fontStyle: 'italic',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  navTab: {
    alignItems: 'center',
  },
  navTabText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.muted,
    marginTop: 4,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: 'center',
    paddingVertical: 20,
  }
});
