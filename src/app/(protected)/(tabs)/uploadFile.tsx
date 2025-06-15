import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import useFileDatabase from "../../database/useFileDatabase";

export default function UploadFile() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { create } = useFileDatabase();
  const router = useRouter();

  const pickFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleUpload = async () => {
    if (!title) {
      Alert.alert('Erro', 'Por favor, insira um título para o arquivo.');
      return;
    }

    if (!file) {
      Alert.alert('Erro', 'Por favor, selecione um arquivo.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    try {
      setLoading(true);
      await create({
        title,
        file_path: file.uri,
        created_by: user.id,
        status: 'pending',
        text: null
      });

      Alert.alert('Sucesso', 'Arquivo enviado com sucesso!');
      setTitle('');
      setFile(null);
      router.push('/(protected)/(tabs)/files');
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível enviar o arquivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enviar Arquivo</Text>
          <Text style={styles.subtitle}>
            Selecione um arquivo e adicione um título para enviar.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Título do arquivo"
            value={title}
            onChangeText={setTitle}
          />

          <TouchableOpacity 
            style={styles.filePicker}
            onPress={pickFile}
          >
            {file ? (
              <Image 
                source={{ uri: file.uri }} 
                style={styles.filePreview}
              />
            ) : (
              <View style={styles.filePlaceholder}>
                <Text style={styles.filePlaceholderText}>
                  Selecione um arquivo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Button
            title={loading ? "Enviando..." : "Enviar Arquivo"}
            onPress={handleUpload}
            disabled={loading}
          />
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    gap: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    gap: 16,
    width: '100%',
    maxWidth: 400,
  },
  filePicker: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
  },
  filePreview: {
    width: '100%',
    height: '100%',
  },
  filePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  filePlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
}); 