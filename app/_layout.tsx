
import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.tint,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Bienvenido' }} />
      <Stack.Screen name="screens/LoginScreen" options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="screens/HomeScreen" options={{ title: 'Inicio' }} />
    </Stack>
  );
}
