import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS simulator
// In production, replace with your actual API URL
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('dent_ai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getAppointments = () => api.get('/appointments');
export const getClinicFeedback = () => api.get('/feedback/public');

// Emergency requests
export const getEmergencies = () => api.get('/emergency');
export const submitEmergency = (data) => api.post('/emergency', data);

// Emergency contacts book
export const getEmergencyContacts = () => api.get('/emergency-contacts');
export const addEmergencyContact = (data) => api.post('/emergency-contacts', data);
export const updateEmergencyContact = (id, data) => api.put(`/emergency-contacts/${id}`, data);
export const deleteEmergencyContact = (id) => api.delete(`/emergency-contacts/${id}`);

// Available doctors
export const getAvailableDoctors = () => api.get('/appointments/doctors/available');

export default api;
