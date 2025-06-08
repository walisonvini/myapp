import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import useUserDatabase from "../database/useUserDatabase";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { update } = useUserDatabase();
  const { updateUser, user } = useAuth();
  
  const router = useRouter();

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) {
      Alert.alert(
        "Erro ao alterar senha",
        "Por favor, preencha todos os campos."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Erro ao alterar senha",
        "As senhas não coincidem. Por favor, verifique."
      );
      return;
    }

    try {
      await update({
        id: user?.id ?? 0,
        password: newPassword,
        change_password: false,
      });

      updateUser({
        id: user?.id ?? 0,
        name: user?.name ?? '',
        phone: user?.phone ?? '',
        profile_image: user?.profile_image ?? '',
        user_type: user?.user_type ?? 0,
        email: user?.email ?? '',
        password: newPassword,
        change_password: false,
        active: user?.active ?? true,
      });

      Alert.alert(
        "Sucesso",
        "Senha alterada com sucesso!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(protected)/(tabs)/home")
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert(
        "Erro",
        "Não foi possível alterar a senha. Por favor, tente novamente."
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Por questões de segurança, você precisa alterar sua senha.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Input
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Button
            title="Alterar Senha"
            onPress={handleChangePassword}
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
});
