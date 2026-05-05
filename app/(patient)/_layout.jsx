import { Stack } from 'expo-router';

export default function PatientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="medical-resources" />
    </Stack>
  );
}
