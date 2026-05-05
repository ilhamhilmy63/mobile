import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/Theme';
import { registerUser } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { full_name, email, password, phone } = formData;
    if (!full_name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ ...formData, role });
      Alert.alert('Success', 'Account created successfully. Please login.', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>JOIN US</Text>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <View style={styles.roleContainer}>
          {['patient', 'doctor'].map((r) => (
            <TouchableOpacity 
              key={r}
              style={[styles.roleTab, role === r && styles.activeRoleTab]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleText, role === r && styles.activeRoleText]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color={Colors.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="John Doe"
                value={formData.full_name}
                onChangeText={(v) => updateForm('full_name', v)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color={Colors.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="name@dentai.com"
                value={formData.email}
                onChangeText={(v) => updateForm('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={20} color={Colors.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChangeText={(v) => updateForm('phone', v)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color={Colors.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Choose a strong password"
                value={formData.password}
                onChangeText={(v) => updateForm('password', v)}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Register Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  eyebrow: {
    ...Typography.caption,
    color: Colors.primarySoft,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.secondary,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#eef5f7',
    borderRadius: 30,
    padding: 6,
    marginBottom: Spacing.lg,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeRoleTab: {
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  roleText: {
    ...Typography.bodyBold,
    color: Colors.muted,
  },
  activeRoleText: {
    color: Colors.primary,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: '#09404a',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontSize: 10,
    color: '#506065',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fbfdfe',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.ink,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  buttonText: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.muted,
  },
  linkText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.primary,
  },
});
