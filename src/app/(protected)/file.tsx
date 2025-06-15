import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import Input from "../components/Input/Input";
import useFileDatabase from "../database/useFileDatabase";

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

export default function FileDetails() {
  const { id } = useLocalSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { getFileById, update, deleteFile } = useFileDatabase();
  const { user } = useAuth();
  const router = useRouter();

  const isAdmin = Number(user?.user_type) === 1;

  async function loadFile() {
    try {
      const fileData = await getFileById(Number(id));
      setFile(fileData);
      setNewTitle(fileData?.title || '');
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do arquivo.');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadFile();
    }, [id])
  );

  async function handleUpdateTitle() {
    if (!file || !newTitle.trim()) return;

    try {
      setLoading(true);
      await update({
        id: file.id,
        title: newTitle.trim()
      });
      
      await loadFile();
      setEditing(false);
      Alert.alert('Sucesso', 'Título atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o título.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!file) return;

    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este arquivo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteFile(file.id);
              Alert.alert('Sucesso', 'Arquivo excluído com sucesso!');
              router.back();
            } catch (error) {
              console.error('Erro ao excluir arquivo:', error);
              Alert.alert('Erro', 'Não foi possível excluir o arquivo.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  async function handleTranscribe() {
    if (!file || !user) return;

    try {
      setLoading(true);
      await update({
        id: file.id,
        responsible_by: user.id,
        status: 'in_progress'
      });
      
      await loadFile();
      router.push({
        pathname: "/transcribe",
        params: { id: file.id }
      });
    } catch (error) {
      console.error('Erro ao iniciar transcrição:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a transcrição.');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500'; // Laranja
      case 'in_progress':
        return '#2196F3'; // Azul
      case 'approval':
        return '#9C27B0'; // Roxo
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
      case 'approval':
        return 'Aguardando Aprovação';
      case 'completed':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!file) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Arquivo não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canTranscribe = !isAdmin && 
    (file.status === 'pending' && !file.responsible_by) || 
    (file.status === 'in_progress' && file.responsible_by === user?.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          {editing ? (
            <View style={styles.editContainer}>
              <Input
                value={newTitle}
                onChangeText={setNewTitle}
                style={styles.titleInput}
              />
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={handleUpdateTitle}
                >
                  <FontAwesome name="check" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    setEditing(false);
                    setNewTitle(file.title);
                  }}
                >
                  <FontAwesome name="times" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{file.title}</Text>
              {isAdmin && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setEditing(true)}
                >
                  <FontAwesome name="pencil" size={20} color="#2196F3" />
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(file.status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(file.status)}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.label}>Criado por:</Text>
          <Text style={styles.value}>{file.creator_name}</Text>

          <Text style={styles.label}>Responsável:</Text>
          <Text style={styles.value}>{file.responsible_name || 'Sem responsável'}</Text>

          <Text style={styles.label}>Data de criação:</Text>
          <Text style={styles.value}>
            {new Date(file.created_at).toLocaleDateString()}
          </Text>

          <Text style={styles.label}>Última atualização:</Text>
          <Text style={styles.value}>
            {new Date(file.updated_at).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.filePreview}>
          <Image 
            source={{ uri: file.file_path }} 
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>

        {file.text && (
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => {
              router.push({
                pathname: "/viewTranscription",
                params: { id: file.id }
              });
            }}
          >
            <FontAwesome name="eye" size={20} color="#fff" />
            <Text style={styles.viewButtonText}>Visualizar Transcrição</Text>
          </TouchableOpacity>
        )}

        {canTranscribe && (
          <TouchableOpacity 
            style={styles.transcribeButton}
            onPress={handleTranscribe}
          >
            <FontAwesome name="pencil" size={20} color="#fff" />
            <Text style={styles.transcribeButtonText}>Transcrever</Text>
          </TouchableOpacity>
        )}

        {isAdmin && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <FontAwesome name="trash" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Excluir Arquivo</Text>
          </TouchableOpacity>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleInput: {
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    gap: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  filePreview: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  transcribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  transcribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 