import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useAuth } from '../../../../contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  const isAdmin = Number(user?.user_type) === 1;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#000',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="files"
        options={{
          title: 'Arquivos',
          tabBarIcon: ({ color }) => <FontAwesome name="file" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      />

      <Tabs.Screen
        name="uploadFile"
        options={{
          title: 'Upload de Arquivo',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="upload" color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuários',
          tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
