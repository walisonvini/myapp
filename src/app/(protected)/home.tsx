import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../components/Button/Button";

export default function Home() {
  const { logOut } = useAuth();

  const handleLogout = () => {
    logOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Bem-vindo ao seu App!
          </Text>
          <Text style={styles.subtitleText}>
            Você está logado e pode começar a usar o aplicativo.
          </Text>
        </View>

        <Button 
          title="Sair" 
          onPress={handleLogout}
        />
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
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
});
