import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { AuthProvider } from '../../contexts/AuthContext';
import { initializeDatabase } from './database/initializeDatabase';

export default function Layout(){
  return (
    <AuthProvider>
      <SQLiteProvider databaseName="sqlite.db" onInit={initializeDatabase}>
        <Stack>
          <Stack.Screen name="(protected)" options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen name="signup" options={{ headerShown: false, animation: 'none' }} />
        </Stack>
      </SQLiteProvider>
    </AuthProvider>
  )
}