import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import useFileDatabase from "../../database/useFileDatabase";

type File = {
  id: number;
  title: string;
  file_path: string;
  created_by: number;
  responsible_by: number | null;
  status: string;
  text: string | null;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  responsible_name?: string;
}

export default function Files() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { list } = useFileDatabase();
  const { user } = useAuth();
  const router = useRouter();

  const isAdmin = Number(user?.user_type) === 1;

  const statusOptions = [
    { value: null, label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'approval', label: 'Aguardando Aprovação' },
    { value: 'completed', label: 'Finalizados' },
    { value: 'rejected', label: 'Reprovados' },
  ];

  const loadFiles = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const filesList = await list();
      
      // Filtra os arquivos baseado no usuário logado
      const filteredFiles = filesList.filter(file => {
        // Se for admin, mostra todos os arquivos
        if (isAdmin) return true;
        
        // Se o arquivo não tem responsável, mostra
        if (!file.responsible_by) return true;
        
        // Se o usuário logado é o responsável, mostra
        if (file.responsible_by === user?.id) return true;
        
        // Caso contrário, não mostra
        return false;
      });

      // Aplica o filtro de status se houver um selecionado
      const statusFilteredFiles = selectedStatus
        ? filteredFiles.filter(file => file.status === selectedStatus)
        : filteredFiles;

      setFiles(statusFilteredFiles);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os arquivos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [list, user, isAdmin, selectedStatus]);

  // Carrega os arquivos apenas na primeira vez
  useEffect(() => {
    loadFiles();
  }, []);

  // Atualiza a lista quando a tela recebe foco, mas sem mostrar o loading
  useFocusEffect(
    useCallback(() => {
      loadFiles(false);
    }, [loadFiles])
  );

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500'; // Laranja
      case 'in_progress':
        return '#2196F3'; // Azul
      case 'completed':
        return '#4CAF50'; // Verde
      case 'cancelled':
        return '#F44336'; // Vermelho
      default:
        return '#9E9E9E'; // Cinza
    }
  }

  function getStatusText(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  function renderFileItem({ item }: { item: File }) {
    return (
      <TouchableOpacity 
        style={styles.fileCard}
        onPress={() => router.push({
          pathname: "/(protected)/file",
          params: { id: item.id }
        })}
      >
        <View style={styles.fileInfo}>
          <Text style={styles.fileTitle}>{item.title}</Text>
          <Text style={styles.fileDate}>
            Criado em: {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <View style={styles.fileDetails}>
            <Text style={styles.fileCreator}>
              Criado por: {item.creator_name}
            </Text>
            <Text style={styles.fileResponsible}>
              Responsável: {item.responsible_name || 'Sem responsável'}
            </Text>
          </View>
        </View>
        <View style={styles.fileStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
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
          <Text style={styles.loadingText}>Carregando arquivos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Arquivos</Text>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>Total: {files.length}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => loadFiles(true)}
            disabled={refreshing}
          >
            <FontAwesome 
              name="refresh" 
              size={20} 
              color="#000" 
              style={refreshing ? styles.refreshing : undefined} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value || 'all'}
              style={[
                styles.filterButton,
                selectedStatus === option.value && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(option.value)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === option.value && styles.filterButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => loadFiles(true)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum arquivo encontrado</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    padding: 8,
  },
  refreshing: {
    opacity: 0.5,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  fileCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 4,
  },
  fileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fileDate: {
    fontSize: 12,
    color: '#666',
  },
  fileDetails: {
    marginTop: 8,
    gap: 4,
  },
  fileCreator: {
    fontSize: 14,
    color: '#666',
  },
  fileResponsible: {
    fontSize: 14,
    color: '#666',
  },
  fileStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersScroll: {
    padding: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#000',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
}); 