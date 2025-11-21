
import { Stack } from 'expo-router';
import "../global.css"

export default function RootLayout() {
  
  return (
    <Stack
    
    >
      <Stack.Screen name="index" options={{headerShown:false}}  />
      <Stack.Screen name="login" options={{headerShown:false }} />
      <Stack.Screen name="screen_a/ListUsuarios" options={{headerShown:false }} />
      <Stack.Screen name="screens/ProfileScreen" options={{headerShown:false }} />
      <Stack.Screen name="screens/EditProfileScreen" options={{headerShown:false }} />
      <Stack.Screen name="screens/CreateAccountScreen" options={{headerShown:false }} />
    </Stack>
  );
}
