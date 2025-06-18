import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../constants';
import { useAuthContext } from '../../contexts/AuthContext';
// Tipos de denúncia
const TIPOS_DENUNCIA = {
  COMPORTAMENTO_INADEQUADO: 'Comportamento Inadequado',
  ATRASO_EXCESSIVO: 'Atraso Excessivo',
  DESVIO_ROTA: 'Desvio de Rota',
  CANCELAMENTO_INJUSTIFICADO: 'Cancelamento Injustificado',
  VEICULO_NAO_CONFORME: 'Veículo Não Conforme',
  COBRANCA_INDEVIDA: 'Cobrança Indevida',
  DADOS_FALSOS: 'Dados Falsos',
  OUTROS: 'Outros'
};

const DriveCard = ({ drive, navigation, apiClient }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoDenuncia, setTipoDenuncia] = useState('');
  const [passageiroSelecionado, setPassageiroSelecionado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [showIOSPassengerPicker, setShowIOSPassengerPicker] = useState(false);
  const { user, authToken } = useAuthContext();
  const handleDenunciar = async () => {
    if (!tipoDenuncia) {
      Alert.alert('Erro', 'Por favor, selecione um tipo de denúncia.');
      return;
    }

    if (!passageiroSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione o passageiro que você está denunciando.');
      return;
    }

    if (!descricao.trim()) {
      Alert.alert('Erro', 'Por favor, descreva o motivo da denúncia.');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        denunciadoId: passageiroSelecionado,
        tipo: tipoDenuncia,
        descricao: descricao.trim()
      };
      
      console.log('=== DEBUG DENÚNCIA ===');
      console.log('URL:', `/denuncia/carona/${drive.id}`);
      console.log('Payload:', payload);
      console.log('Drive ID:', drive.id);
      console.log("TOKEN:",authToken)
      const response = await apiClient.post(`/denuncia/carona/${drive.id}`, payload,{
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
     } });
      
      console.log('Resposta completa da API:', response);
      console.log('Status da resposta:', response.status);
      console.log('Data da resposta:', response.data);

      // Verificar se a resposta foi bem-sucedida
      // Axios considera 2xx como sucesso, então response.status será 200, 201, etc.
      if (response.status >= 200 && response.status < 300) {
        Alert.alert(
          'Denúncia Enviada',
          'Sua denúncia foi registrada com sucesso. Nossa equipe irá analisar o caso.',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setTipoDenuncia('');
                setPassageiroSelecionado('');
                setDescricao('');
                setShowIOSPicker(false);
                setShowIOSPassengerPicker(false);
              }
            }
          ]
        );
      } else {
        // Caso a resposta não seja 2xx (improvável com Axios, mas por precaução)
        throw new Error(`Status HTTP inesperado: ${response.status}`);
      }
     
    } catch (error) {
      console.error('=== ERRO DENÚNCIA ===');
      console.error('Erro completo:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      
      let mensagemErro = 'Não foi possível enviar a denúncia. Tente novamente.';
      let tituloErro = 'Erro';
      
      if (error.response) {
        // Erro de resposta do servidor
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 400:
            tituloErro = 'Dados Inválidos';
            mensagemErro = errorData?.message || 'Verifique os dados informados e tente novamente.';
            break;
          case 401:
            tituloErro = 'Não Autorizado';
            mensagemErro = 'Sua sessão expirou. Por favor, faça login novamente.';
            break;
          case 403:
            tituloErro = 'Acesso Negado';
            mensagemErro = errorData?.message || 'Você não tem permissão para realizar esta ação.';
            break;
          case 404:
            tituloErro = 'Não Encontrado';
            mensagemErro = 'A carona não foi encontrada.';
            break;
          case 422:
            tituloErro = 'Dados Inválidos';
            mensagemErro = errorData?.message || 'Alguns dados estão incorretos. Verifique e tente novamente.';
            break;
          case 500:
            tituloErro = 'Erro do Servidor';
            mensagemErro = 'Ocorreu um erro interno. Tente novamente em alguns minutos.';
            break;
          default:
            mensagemErro = errorData?.message || `Erro ${status}: ${error.message}`;
        }
      } else if (error.request) {
        // Erro de rede/conexão
        tituloErro = 'Erro de Conexão';
        mensagemErro = 'Verifique sua conexão com a internet e tente novamente.';
      } else {
        // Outro tipo de erro
        mensagemErro = error.message || 'Ocorreu um erro inesperado.';
      }
      
      Alert.alert(tituloErro, mensagemErro, [{ text: 'OK' }]);
      
    } finally {
      setLoading(false);
    }
  };
  // Função para formatar data recebida como string ISO
const formatDate = (dateString) => {
  try {
    if (!dateString) return 'Data não disponível';

    // Criar objeto Date a partir da string ISO
    const date = new Date(dateString);

    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data não disponível';
    }

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = String(date.getFullYear()).slice(-2);

    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data não disponível';
  }
};
  const handleCloseModal = () => {
    setModalVisible(false);
    setTipoDenuncia('');
    setPassageiroSelecionado('');
    setDescricao('');
    setShowIOSPicker(false);
    setShowIOSPassengerPicker(false);
  };

  const getTipoDenunciaLabel = () => {
    return tipoDenuncia ? TIPOS_DENUNCIA[tipoDenuncia] : 'Selecione o tipo de denúncia';
  };

  const getPassageiroLabel = () => {
    if (!passageiroSelecionado) return 'Selecione o passageiro';
    const passageiro = drive.passageiros.find(p => p.id === passageiroSelecionado);
    return passageiro ? passageiro.nome : 'Passageiro não encontrado';
  };

  const handleIOSPickerConfirm = () => {
    setShowIOSPicker(false);
  };

  const handleIOSPassengerPickerConfirm = () => {
    setShowIOSPassengerPicker(false);
  };

  const renderAndroidPicker = () => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={tipoDenuncia}
        onValueChange={(itemValue) => setTipoDenuncia(itemValue)}
        style={styles.androidPicker}
        dropdownIconColor={COLORS.text.secondary}
        mode="dropdown"
      >
        <Picker.Item 
          label="Selecione o tipo de denúncia" 
          value="" 
          color={COLORS.text.secondary}
        />
        {Object.entries(TIPOS_DENUNCIA).map(([key, value]) => (
          <Picker.Item 
            key={key} 
            label={value} 
            value={key}
            color={COLORS.text.primary}
          />
        ))}
      </Picker>
    </View>
  );

  const renderAndroidPassengerPicker = () => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={passageiroSelecionado}
        onValueChange={(itemValue) => setPassageiroSelecionado(itemValue)}
        style={styles.androidPicker}
        dropdownIconColor={COLORS.text.secondary}
        mode="dropdown"
      >
        <Picker.Item 
          label="Selecione o passageiro" 
          value="" 
          color={COLORS.text.secondary}
        />
        {drive.passageiros.map((passageiro) => (
          <Picker.Item 
            key={passageiro.id} 
            label={passageiro.nome} 
            value={passageiro.id}
            color={COLORS.text.primary}
          />
        ))}
      </Picker>
    </View>
  );

  const renderIOSPicker = () => (
    <>
      <TouchableOpacity
        style={styles.iosPickerButton}
        onPress={() => setShowIOSPicker(true)}
      >
        <Text style={[
          styles.iosPickerButtonText,
          !tipoDenuncia && styles.iosPickerPlaceholder
        ]}>
          {getTipoDenunciaLabel()}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>

      {/* Modal do Picker para iOS */}
      <Modal
        visible={showIOSPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIOSPicker(false)}
      >
        <View style={styles.iosPickerModalOverlay}>
          <View style={styles.iosPickerModalContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity
                onPress={() => setShowIOSPicker(false)}
                style={styles.iosPickerHeaderButton}
              >
                <Text style={styles.iosPickerCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <Text style={styles.iosPickerTitle}>Tipo de Denúncia</Text>
              
              <TouchableOpacity
                onPress={handleIOSPickerConfirm}
                style={styles.iosPickerHeaderButton}
              >
                <Text style={styles.iosPickerConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.iosPickerContainer}>
              <Picker
                selectedValue={tipoDenuncia}
                onValueChange={(itemValue) => setTipoDenuncia(itemValue)}
                style={styles.iosPicker}
              >
                <Picker.Item 
                  label="Selecione o tipo de denúncia" 
                  value=""
                />
                {Object.entries(TIPOS_DENUNCIA).map(([key, value]) => (
                  <Picker.Item 
                    key={key} 
                    label={value} 
                    value={key}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  const renderIOSPassengerPicker = () => (
    <>
      <TouchableOpacity
        style={styles.iosPickerButton}
        onPress={() => setShowIOSPassengerPicker(true)}
      >
        <Text style={[
          styles.iosPickerButtonText,
          !passageiroSelecionado && styles.iosPickerPlaceholder
        ]}>
          {getPassageiroLabel()}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>

      {/* Modal do Picker de Passageiros para iOS */}
      <Modal
        visible={showIOSPassengerPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIOSPassengerPicker(false)}
      >
        <View style={styles.iosPickerModalOverlay}>
          <View style={styles.iosPickerModalContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity
                onPress={() => setShowIOSPassengerPicker(false)}
                style={styles.iosPickerHeaderButton}
              >
                <Text style={styles.iosPickerCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <Text style={styles.iosPickerTitle}>Selecionar Passageiro</Text>
              
              <TouchableOpacity
                onPress={handleIOSPassengerPickerConfirm}
                style={styles.iosPickerHeaderButton}
              >
                <Text style={styles.iosPickerConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.iosPickerContainer}>
              <Picker
                selectedValue={passageiroSelecionado}
                onValueChange={(itemValue) => setPassageiroSelecionado(itemValue)}
                style={styles.iosPicker}
              >
                <Picker.Item 
                  label="Selecione o passageiro" 
                  value=""
                />
                {drive.passageiros.map((passageiro) => (
                  <Picker.Item 
                    key={passageiro.id} 
                    label={passageiro.nome} 
                    value={passageiro.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  return (
    <>
      <TouchableOpacity
        key={drive.id}
        style={styles.driveCard}
        onPress={() => navigation.navigate('CaronaDetailsScreen', { carona: drive })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.statusBadge, { 
              backgroundColor: drive.status === 'AGENDADA' ? COLORS.success.main : 
                             drive.status === 'FINALIZADA' ? COLORS.primary.main :
                             COLORS.text.secondary 
            }]}>
              <Text style={styles.statusText}>
                {drive.status === 'AGENDADA' ? 'Agendada' : 
                 drive.status === 'FINALIZADA' ? 'Finalizada' : 
                 drive.status}
              </Text>
            </View>
            {drive.dataHoraPartida && <Text style={styles.dateText}>
              {formatDate(drive.dataHoraPartida)}
            </Text>}
          </View>
          
        { drive.passageiros.length > 0 && drive.status === 'FINALIZADA' && (
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="flag-outline" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        )}
        </View>
        
        <View style={styles.routeContainer}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={COLORS.primary.main} />
            <Text style={styles.locationText}>
              {drive.pontoOrigem || drive.pontoPartida || 'Origem não especificada'}
            </Text>
          </View>
          <View style={styles.verticalLine} />
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={COLORS.secondary.main} />
            <Text style={styles.locationText}>
              {drive.pontoDestino || 'Destino não especificado'}
            </Text>
          </View>
        </View>
        
        <View style={styles.driveInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>
              {drive.vagasDisponiveis}/{drive.vagas} vagas disponíveis
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>
              {drive.veiculo?.modelo || 'Veículo não especificado'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal de Denúncia */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Denunciar Passageiro</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.fieldLabel}>Passageiro *</Text>
              
              {/* Renderização condicional do picker de passageiros baseada na plataforma */}
              {Platform.OS === 'ios' ? renderIOSPassengerPicker() : renderAndroidPassengerPicker()}

              <Text style={styles.fieldLabel}>Tipo de Denúncia *</Text>
              
              {/* Renderização condicional baseada na plataforma */}
              {Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker()}

              <Text style={styles.fieldLabel}>Descrição *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Descreva detalhadamente o motivo da denúncia..."
                multiline
                numberOfLines={4}
                value={descricao}
                onChangeText={setDescricao}
                textAlignVertical="top"
              />

              <Text style={styles.disclaimerText}>
                Sua denúncia será analisada pela nossa equipe. Denúncias falsas podem 
                resultar em penalidades na sua conta.
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, loading && styles.disabledButton]}
                onPress={handleDenunciar}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Enviando...' : 'Enviar Denúncia'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Estilos existentes do card
  driveCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  reportButton: {
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.background.light,
  },
  routeContainer: {
    marginVertical: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs / 2,
  },
  locationText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    flex: 1,
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border.main,
    marginLeft: 10,
    marginVertical: 2,
  },
  driveInfo: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.main,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.main,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    padding: SPACING.md,
    maxHeight: 400,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },

  // Estilos do Picker Android
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border.main,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background.card,
  },
  androidPicker: {
    height: 50,
    color: COLORS.text.primary,
  },

  // Estilos do Picker iOS
  iosPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.main,
    borderRadius: 8,
    padding: SPACING.sm,
    backgroundColor: COLORS.background.card,
    marginBottom: SPACING.sm,
    minHeight: 50,
  },
  iosPickerButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    flex: 1,
  },
  iosPickerPlaceholder: {
    color: COLORS.text.secondary,
  },
  iosPickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  iosPickerModalContainer: {
    backgroundColor: COLORS.background.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Safe area bottom
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.main,
  },
  iosPickerHeaderButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  iosPickerCancelText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  iosPickerConfirmText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHT.medium,
  },
  iosPickerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  iosPickerContainer: {
    backgroundColor: COLORS.background.card,
  },
  iosPicker: {
    height: 200,
  },

  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.main,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    minHeight: 100,
    marginBottom: SPACING.sm,
  },
  disclaimerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.main,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background.light,
    borderWidth: 1,
    borderColor: COLORS.border.main,
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  submitButton: {
    backgroundColor: COLORS.danger.main,
  },
  submitButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default DriveCard;