import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../../../constants';

/**
 * Request card component for displaying individual ride requests
 */
const RequestCard = ({ 
  request,
  onApprove,
  onReject,
  style 
}) => {
  const { id, solicitacao, carona } = request;

  const formatDate = (dateData) => {
    let partidaFormatada = 'Data indisponível';
    try {
      if (Array.isArray(dateData)) {
        // Handle array format from Java LocalDateTime (legacy)
        const [ano, mes, dia, hora, minuto, segundo] = dateData;
        if ([ano, mes, dia].every(n => typeof n === 'number')) {
          const data = new Date(ano, mes - 1, dia, hora || 0, minuto || 0, segundo || 0);
          partidaFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) + ' às ' + data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } else if (typeof dateData === 'string') {
        // Handle ISO string format
        const data = new Date(dateData);
        partidaFormatada = data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' às ' + data.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (dateData instanceof Date) {
        // Handle Date object
        partidaFormatada = dateData.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' às ' + dateData.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.warn('Error formatting date:', error, dateData);
      partidaFormatada = 'Data inválida';
    }
    return partidaFormatada;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.studentName}>{solicitacao.nomeEstudante}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pendente</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color={COLORS.success.main} />
          <Text style={styles.infoText}>Origem: {solicitacao.origem}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color={COLORS.primary.main} />
          <Text style={styles.infoText}>Destino: {carona.pontoDestino}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={COLORS.secondary.main} />
          <Text style={styles.infoText}>Partida: {formatDate(carona.dataHoraPartida)}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => onApprove(id)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={16} color={COLORS.text.light} />
          <Text style={styles.actionButtonText}>Aprovar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => onReject(id)}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={16} color={COLORS.text.light} />
          <Text style={styles.actionButtonText}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.main,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  studentName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: `${COLORS.warning.main}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.warning.main,
  },
  infoContainer: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  approveButton: {
    backgroundColor: COLORS.success.main,
  },
  rejectButton: {
    backgroundColor: COLORS.danger.main,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.light,
  },
});

export default React.memo(RequestCard);
