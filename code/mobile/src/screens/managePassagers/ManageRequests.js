import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import { format } from 'date-fns';
import { apiClient } from '../../services/api/apiClient';

export default function ManageRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        try {
            const motoristaId = 12; // TODO: Obtenha o ID do motorista dinamicamente
            const response = await apiClient.get(`/pedidos/motorista/${motoristaId}`);
            setRequests(response.data.content || []);
            console.log('Solicitações:', response.data);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRequestAction = (id, action) => {
        axios.post(`http://SEU_BACKEND/solicitacoes/${id}/${action}`)
            .then(() => {
                setRequests(prev => prev.filter(req => req.id !== id));
            })
            .catch(() => {
                Alert.alert('Erro', `Não foi possível ${action === 'aprovar' ? 'aprovar' : 'recusar'} a solicitação`);
            });
    };

    return (
        <SafeAreaView className="flex-1 bg-white pt-4">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Cabeçalho */}
            <View className="px-4 pb-4 border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-800">Minhas Solicitações</Text>
                <Text className="text-sm text-gray-500">Gerencie os pedidos pendentes de carona</Text>
            </View>

            {/* Conteúdo com Scroll */}
            <ScrollView contentContainerStyle={{ padding: 16 }} className="flex-1">
                {requests.map(req => {
                    const { id, solicitacao, carona } = req;

                    let partidaFormatada = 'Data indisponível';
                    if (Array.isArray(carona.dataHoraPartida)) {
                        const [ano, mes, dia, hora, minuto, segundo] = carona.dataHoraPartida;
                        if ([ano, mes, dia].every(n => typeof n === 'number')) {
                            const data = new Date(ano, mes - 1, dia, hora || 0, minuto || 0, segundo || 0);
                            partidaFormatada = format(data, 'dd/MM/yyyy HH:mm');
                        }
                    }

                    return (
                        <View key={id} className="bg-gray-100 rounded-2xl p-4 mb-4 shadow">
                            <Text className="text-lg font-semibold mb-1">{solicitacao.nomeEstudante}</Text>
                            <Text className="text-sm mb-1">Origem da solicitação: {solicitacao.origem}</Text>
                            <Text className="text-sm mb-1">Destino da carona: {carona.pontoDestino}</Text>
                            <Text className="text-sm mb-3">Partida: {partidaFormatada}</Text>

                            <View className="flex-row justify-between mt-2">
                                <TouchableOpacity
                                    className="bg-green-500 rounded-xl px-4 py-2"
                                    onPress={() => handleRequestAction(id, 'aprovar')}
                                >
                                    <Text className="text-white font-medium">Aprovar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-red-500 rounded-xl px-4 py-2"
                                    onPress={() => handleRequestAction(id, 'recusar')}
                                >
                                    <Text className="text-white font-medium">Recusar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}

                {!loading && requests.length === 0 && (
                    <Text className="text-center text-gray-500 mt-10">
                        Nenhuma solicitação pendente.
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
