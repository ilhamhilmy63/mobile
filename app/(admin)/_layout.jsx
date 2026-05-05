import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="medical-resources" />
      <Stack.Screen name="medical-resource-form" />
    </Stack>
  );
}
