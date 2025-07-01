import { Link } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";

import Button from "./components/Button/Button";
import Input from "./components/Input/Input";

import { useAuth } from "../../contexts/AuthContext";
import useUserDatabase from "./database/useUserDatabase";

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { logIn } = useAuth();

  const userDatabase = useUserDatabase();

  async function handleLogin() {
    try {
      if (!email || !password) {
        Alert.alert(
          "Erro ao fazer login",
          "Por favor, preencha todos os campos."
        );
        return;
      }

      const user = await userDatabase.login(email, password);
      
      logIn(user);
    } catch (error) {
      Alert.alert(
        "Erro ao fazer login",
        error instanceof Error ? error.message : 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Bem-vindo</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Input 
            placeholder="Email" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            placeholder="Senha" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button 
            title="Entrar" 
            onPress={handleLogin}
          />

          <Link href="/signup">
            <Text style={styles.loginText}>Não tem conta? Cadastre-se</Text>
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