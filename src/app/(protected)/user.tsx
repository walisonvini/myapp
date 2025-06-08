import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import useUserDatabase, { UserDatabase } from "../database/useUserDatabase";

export default function User() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<UserDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUserById } = useUserDatabase();

  useEffect(() => {
    loadUser();
  }, [id]);

  async function loadUser() {
    try {
      if (id) {
        const userData = await getUserById(Number(id));
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Carregando usuário...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Usuário não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          {user.profile_image ? (
            <Image 
              source={{ uri: user.profile_image }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              { color: user.active ? '#4CAF50' : '#F44336' }
            ]}>
              {user.active ? 'Ativo' : 'Inativo'}
            </Text>
            <Text style={[
              styles.statusText,
              { color: user.user_type ? '#2196F3' : '#9E9E9E' }
            ]}>
              {user.user_type ? 'Administrador' : 'Usuário'}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Alterar Senha</Text>
            <Text style={styles.infoValue}>
              {user.change_password ? 'Sim' : 'Não'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    gap: 20,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
});
