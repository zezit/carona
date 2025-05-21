import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BASE_URL } from '../services/api/apiClient';


export default function MyDrivesScreen() {
  const navigation = useNavigation();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
    // Substitua 'baseurl' pela URL base da sua API e forneça o motoristaId dinamicamente
    const motoristaId = 12; // TODO: obtenha o ID do motorista dinamicamente
    const response = await fetch(`https://${BASE_URL}/carona/motorista/${motoristaId}`);
      const json = await response.json();
      setDrives(json.content || []);
    } catch (error) {
      console.error('Erro ao buscar caronas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderDrive = (drive) => (
    <TouchableOpacity
      key={drive.id}
      style={styles.card}
      onPress={() => navigation.navigate('DriveDetails', { drive })}
    >
      <Text style={styles.title}>{drive.pontoDestino}</Text>
      <Text style={styles.subtitle}>
        Partida: {format(new Date(drive.dataHoraPartida), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </Text>
      <Text style={styles.subtitle}>
        Vagas disponíveis: {drive.vagasDisponiveis}/{drive.vagas}
      </Text>
      <Text style={[styles.status, { color: drive.status === 'AGENDADA' ? 'green' : 'gray' }]}>
        {drive.status}
      </Text>
    </TouchableOpacity>
  );

  const agendadas = drives.filter((d) => d.status === 'AGENDADA');
  const encerradas = drives.filter((d) => d.status !== 'AGENDADA');

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007bff" />;
  }

  return (
    <FlatList
      data={[]} // necessário para habilitar o refreshControl
      ListHeaderComponent={
        <View style={styles.container}>
          {agendadas.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Agendadas</Text>
              {agendadas.map(renderDrive)}
            </>
          )}
          {encerradas.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Histórico</Text>
              {encerradas.map(renderDrive)}
            </>
          )}
          {drives.length === 0 && (
            <Text style={styles.emptyText}>Você ainda não criou nenhuma carona.</Text>
          )}
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchDrives();
        }} />
      }
      renderItem={null}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
    color: '#555',
  },
  status: {
    marginTop: 6,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 32,
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
});
