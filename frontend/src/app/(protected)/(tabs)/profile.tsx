import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import useUserDatabase from "../../database/useUserDatabase";

export default function Profile() {
  const { logOut, user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone ?? '');

  const { update } = useUserDatabase();

  const handlePhoneChange = (text: string) => {
    // Remove qualquer caractere que não seja número
    const numbersOnly = text.replace(/[^0-9]/g, '');
    // Limita a 11 caracteres
    setPhone(numbersOnly.slice(0, 11));
  };

  const handleSave = async () => {
    if (!phone) {
      Alert.alert(
        "Erro ao atualizar",
        "Por favor, preencha o número de telefone."
      );
      return;
    }

    if (phone.length < 10) {
      Alert.alert(
        "Erro ao atualizar",
        "Por favor, insira um número de telefone válido (DDD + número)."
      );
      return;
    }

    try {
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      await update({
        id: user.id,
        phone: phone
      });

      updateUser({
        id: user.id,
        name: user.name,
        phone: phone,
        profile_image: user.profile_image,
        user_type: user.user_type,
        email: user.email,
        password: user.password,
        change_password: user.change_password,
        active: user.active
      });

      setIsEditing(false);
      Alert.alert('Sucesso', 'Telefone atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar telefone:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o telefone.');
    }
  };

  const pickImage = async () => {
    try {
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        try {
          await update({
            id: user.id,
            profile_image: imageUri,
            phone: user.phone
          });
          
          updateUser({
            id: user.id,
            name: user.name,
            phone: user.phone,
            profile_image: imageUri,
            user_type: user.user_type,
            email: user.email,
            password: user.password,
            change_password: user.change_password,
            active: user.active
          });
          
          Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
        } catch (error) {
          console.error('Erro ao atualizar foto:', error);
          Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleLogout = () => {
    logOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={pickImage}
          >
            {user?.profile_image ? (
              <Image 
                source={{ uri: user.profile_image }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.editImageOverlay}>
              <Text style={styles.editImageText}>Alterar foto</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            
            {isEditing ? (
              <View style={styles.editContainer}>
                <Input 
                  placeholder="Telefone (apenas números)" 
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
                <View style={styles.editButtons}>
                  <Button 
                    title="Salvar" 
                    onPress={handleSave}
                  />
                  <Button 
                    title="Cancelar" 
                    onPress={() => {
                      setIsEditing(false);
                      setPhone(user?.phone ?? '');
                    }}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => setIsEditing(true)}
                style={styles.phoneContainer}
              >
                <Text style={styles.phone}>{user?.phone}</Text>
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button 
            title="Sair" 
            onPress={handleLogout}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  imageContainer: {
    alignSelf: 'center',
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    alignItems: 'center',
  },
  editImageText: {
    color: 'white',
    fontSize: 12,
  },
  profileInfo: {
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  editText: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
  },
  editContainer: {
    gap: 12,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  }
});
