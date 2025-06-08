import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";

import Button from "./components/Button/Button";
import Input from "./components/Input/Input";

import useUserDatabase from "./database/useUserDatabase";

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const userDatabase = useUserDatabase();

  const handlePhoneChange = (text: string) => {
    // Remove qualquer caractere que não seja número
    const numbersOnly = text.replace(/[^0-9]/g, '');
    // Limita a 11 caracteres
    setPhone(numbersOnly.slice(0, 11));
  };

  async function handleSignup() {
    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert(
        "Erro ao cadastrar",
        "Por favor, preencha todos os campos."
      );
      return;
    }

    if (phone.length < 10) {
      Alert.alert(
        "Erro ao cadastrar",
        "Por favor, insira um número de telefone válido (DDD + número)."
      );
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert(
        "Erro ao cadastrar",
        "As senhas não coincidem. Por favor, verifique."
      );
      return;
    }

    try {
      await userDatabase.create({
        name,
        email,
        password,
        phone,
        profile_image: null,
        user_type: 0,
        change_password: false,
        active: true,
      });
  
      router.replace('/home');
    } catch (error) {
      Alert.alert(
        "Erro ao cadastrar",
        "Este email já está em uso. Por favor, tente outro email."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Criar Conta</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Input 
            placeholder="Nome completo" 
            value={name}
            onChangeText={setName}
          />
          <Input 
            placeholder="Email" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            placeholder="Telefone (apenas números)" 
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={11}
          />
          <Input 
            placeholder="Senha" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input 
            placeholder="Confirmar senha" 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Button 
            title="Cadastrar" 
            onPress={handleSignup}
          />

          <Link href="/">
            <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
          </Link>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Meu App</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
