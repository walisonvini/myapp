import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import useFileDatabase from "../../database/useFileDatabase";

type FileStats = {
  total: number;
  pending: number;
  inProgress: number;
  approval: number;
  completed: number;
  rejected: number;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const { list } = useFileDatabase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FileStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    approval: 0,
    completed: 0,
    rejected: 0
  });

  const isAdmin = Number(user?.user_type) === 1;

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const files = await list();
      
      // Filtra arquivos baseado no usuário
      const filteredFiles = files.filter(file => {
        if (isAdmin) return true;
        if (!file.responsible_by) return true;
        if (file.responsible_by === user?.id) return true;
        return false;
      });

      const newStats = {
        total: filteredFiles.length,
        pending: filteredFiles.filter(f => f.status === 'pending').length,
        inProgress: filteredFiles.filter(f => f.status === 'in_progress').length,
        approval: filteredFiles.filter(f => f.status === 'approval').length,
        completed: filteredFiles.filter(f => f.status === 'completed').length,
        rejected: filteredFiles.filter(f => f.status === 'rejected').length
      };

      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
    return (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Carregando estatísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Olá, {user?.name || 'Usuário'}!
          </Text>
          <Text style={styles.subtitleText}>
            {isAdmin ? 'Painel de Administração' : 'Painel de Transcrição'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total" value={stats.total} color="#2196F3" />
            <StatCard title="Pendentes" value={stats.pending} color="#FFA500" />
            <StatCard title="Em Andamento" value={stats.inProgress} color="#2196F3" />
            <StatCard title="Aguardando Aprovação" value={stats.approval} color="#9C27B0" />
            <StatCard title="Finalizados" value={stats.completed} color="#4CAF50" />
            <StatCard title="Reprovados" value={stats.rejected} color="#F44336" />
          </View>
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
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
