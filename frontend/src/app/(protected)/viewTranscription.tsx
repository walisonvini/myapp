import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
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

export default function ViewTranscription() {
  const { id } = useLocalSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const { getFileById, approveFile, rejectFile } = useFileDatabase();
  const { user } = useAuth();
  const router = useRouter();

  const isAdmin = Number(user?.user_type) === 1;

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
      case 'rejected':
        return 'Reprovado';
      default:
        return status;
    }
  }

  useEffect(() => {
    loadFile();
  }, [id]);

  async function loadFile() {
    try {
      const fileData = await getFileById(Number(id));
      setFile(fileData);
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do arquivo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!file) return;

    try {
      setLoading(true);
      await approveFile(file.id);
      await loadFile();
      Alert.alert('Sucesso', 'Arquivo aprovado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao aprovar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível aprovar o arquivo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!file) return;

    Alert.alert(
      'Confirmar rejeição',
      'Tem certeza que deseja rejeitar esta transcrição?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await rejectFile(file.id);
              await loadFile();
              Alert.alert('Sucesso', 'Transcrição rejeitada com sucesso!');
              router.back();
            } catch (error) {
              console.error('Erro ao rejeitar transcrição:', error);
              Alert.alert('Erro', 'Não foi possível rejeitar a transcrição.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  async function handleDownload() {
    if (!file || !file.text) return;

    try {
      setLoading(true);
      
      // Cria o nome do arquivo baseado no título
      const fileName = `${file.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcricao.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Escreve o conteúdo no arquivo
      await FileSystem.writeAsStringAsync(filePath, file.text, {
        encoding: FileSystem.EncodingType.UTF8
      });

      // Compartilha o arquivo
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/plain',
        dialogTitle: 'Baixar Transcrição',
        UTI: 'public.plain-text'
      });

    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível baixar a transcrição.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Carregando arquivo...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{file.title}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: file.file_path }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.transcriptionContainer}>
          <View style={styles.transcriptionHeader}>
            <Text style={styles.label}>Transcrição:</Text>
            {file.text && (
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={handleDownload}
              >
                <FontAwesome name="download" size={20} color="#2196F3" />
                <Text style={styles.downloadButtonText}>Baixar TXT</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{file.text || 'Sem transcrição'}</Text>
          </View>
          <Text style={styles.statusText}>Status: {getStatusText(file.status)}</Text>
        </View>

        {isAdmin && file.status === 'approval' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.approveButton]}
              onPress={handleApprove}
            >
              <FontAwesome name="check" size={20} color="#fff" />
              <Text style={styles.buttonText}>Aprovar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
            >
              <FontAwesome name="times" size={20} color="#fff" />
              <Text style={styles.buttonText}>Rejeitar</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  transcriptionContainer: {
    flex: 1,
    marginBottom: 20,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  textContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  downloadButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
}); 