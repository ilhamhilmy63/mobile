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
import { loginUser } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email, password, role });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('dent_ai_token', token);
      await AsyncStorage.setItem('dent_ai_user', JSON.stringify(user));
      
      if (user.role === 'patient') {
        router.replace('/(patient)/dashboard');
      } else {
        Alert.alert('Access Denied', 'This app currently only supports patient access.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.title}>Access Portal</Text>
        </View>

        <View style={styles.roleContainer}>
          {['patient', 'doctor', 'admin'].map((r) => (r === 'patient' || r === 'doctor') && (
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
            <Text style={styles.label}>Work Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color={Colors.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="name@dentai.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Security Key</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color={Colors.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In as {role}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Do not have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>Create Account</Text>
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
    paddingTop: Spacing.xxl * 2,
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
    backgroundColor: Colors.primary,
    // Linear gradient simulation
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
