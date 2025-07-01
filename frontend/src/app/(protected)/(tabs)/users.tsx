import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import useUserDatabase, { UserDatabase } from "../../database/useUserDatabase";

export default function Users() {
  const [users, setUsers] = useState<UserDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const { list, update } = useUserDatabase();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const usersList = await list();
      // Filtra o usuário atual da lista
      const filteredUsers = usersList.filter(userItem => userItem.id !== user?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleUserPress(userId: number) {
    router.push(`/user?id=${userId}`);
  }

  async function handleToggleStatus(user: UserDatabase) {
    try {
      await update({
        id: user.id,
        active: !user.active
      });
      await loadUsers();
      Alert.alert(
        'Sucesso',
        `Usuário ${user.active ? 'inativado' : 'ativado'} com sucesso!`
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status do usuário');
    }
  }

  async function handleChangePassword(user: UserDatabase) {
    try {
      await update({
        id: user.id,
        change_password: true
      });
      await loadUsers();
      Alert.alert(
        'Sucesso',
        'Usuário precisará alterar a senha no próximo login!'
      );
    } catch (error) {
      console.error('Erro ao solicitar alteração de senha:', error);
      Alert.alert('Erro', 'Não foi possível solicitar alteração de senha');
    }
  }

  function renderUserItem({ item }: { item: UserDatabase }) {
    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => handleUserPress(item.id)}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
        </View>
        <View style={styles.userActions}>
          <View style={styles.userStatus}>
            <Text style={[
              styles.statusText,
              { color: item.active ? '#4CAF50' : '#F44336' }
            ]}>
              {item.active ? 'Ativo' : 'Inativo'}
            </Text>
            <Text style={[
              styles.statusText,
              { color: item.user_type ? '#2196F3' : '#9E9E9E' }
            ]}>
              {item.user_type ? 'Administrador' : 'Usuário'}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.passwordButton]}
              onPress={() => handleChangePassword(item)}
            >
              <FontAwesome name="key" size={16} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, item.active ? styles.deactivateButton : styles.activateButton]}
              onPress={() => handleToggleStatus(item)}
            >
              <FontAwesome 
                name={item.active ? "ban" : "check"} 
                size={16} 
                color={item.active ? "#F44336" : "#4CAF50"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuários</Text>
        <Text style={styles.subtitle}>Total: {users.length}</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        }
      />
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  userCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  userStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  passwordButton: {
    borderColor: '#2196F3',
  },
  deactivateButton: {
    borderColor: '#F44336',
  },
  activateButton: {
    borderColor: '#4CAF50',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
