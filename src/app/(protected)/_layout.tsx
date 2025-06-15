import { Redirect, Stack, usePathname } from "expo-router";
import { useAuth } from '../../../contexts/AuthContext';

export default function ProtectedLayout() {
  const { isLoggedIn, isReady, user } = useAuth();
  const pathname = usePathname();

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  if (user?.change_password && !pathname.includes('changePassword')) {
    return <Redirect href="/changePassword" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="user" 
        options={{
          title: "Detalhes do Usuário",
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="file" 
        options={{
          title: "Detalhes do Arquivo",
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="transcribe" 
        options={{
          title: "Transcrever Arquivo",
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="viewTranscription" 
        options={{
          title: "Visualizar Transcrição",
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="changePassword" 
        options={{
          title: "Alterar Senha",
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}