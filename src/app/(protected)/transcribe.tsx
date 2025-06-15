import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function Transcribe() {
  const { id } = useLocalSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcription, setTranscription] = useState('');
  const { getFileById, update } = useFileDatabase();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadFile();
  }, [id]);

  async function loadFile() {
    try {
      const fileData = await getFileById(Number(id));
      setFile(fileData);
      setTranscription(fileData?.text || '');
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do arquivo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!file || !transcription.trim()) return;

    try {
      setLoading(true);
      await update({
        id: file.id,
        text: transcription.trim()
      });
      
      Alert.alert('Sucesso', 'Transcrição salva com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao salvar transcrição:', error);
      Alert.alert('Erro', 'Não foi possível salvar a transcrição.');
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!file || !transcription.trim()) return;

    try {
      setLoading(true);
      await update({
        id: file.id,
        text: transcription.trim(),
        status: 'approval'
      });
      
      Alert.alert('Sucesso', 'Transcrição enviada para aprovação!');
      router.back();
    } catch (error) {
      console.error('Erro ao finalizar transcrição:', error);
      Alert.alert('Erro', 'Não foi possível finalizar a transcrição.');
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
          <Text style={styles.label}>Transcrição:</Text>
          <TextInput
            style={styles.input}
            multiline
            value={transcription}
            onChangeText={setTranscription}
            placeholder="Digite a transcrição aqui..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <FontAwesome name="save" size={20} color="#fff" />
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.completeButton]}
            onPress={handleComplete}
          >
            <FontAwesome name="check" size={20} color="#fff" />
            <Text style={styles.buttonText}>Finalizar</Text>
          </TouchableOpacity>
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
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
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
  saveButton: {
    backgroundColor: '#2196F3',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 