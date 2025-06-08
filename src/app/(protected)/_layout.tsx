import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProtectedLayout(){
  const { isLoggedIn, isReady } = useAuth();

  if(!isReady){
    return null;
  }

  if(!isLoggedIn){
    return <Redirect href="/" />
  }

  return (
      <Stack>
        <Stack.Screen name="home" options={{ headerBackVisible: false, headerTitle: 'Home' }} />
      </Stack>
  )
}