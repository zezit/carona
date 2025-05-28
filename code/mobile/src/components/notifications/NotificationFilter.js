import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants';

const NotificationFilter = ({ 
  visible, 
  onClose, 
  onApplyFilters, 
  currentFilters = {} 
}) => {
  const [selectedTypes, setSelectedTypes] = useState(currentFilters.types || []);
  const [selectedStatuses, setSelectedStatuses] = useState(currentFilters.statuses || []);

  const notificationTypes = [
    { 
      key: 'RIDE_MATCH_REQUEST', 
      label: 'Solicitações de Carona',
      icon: 'car-sport',
      color: COLORS.primary.main
    },
    { 
      key: 'RIDE_REQUEST_ACCEPTED', 
      label: 'Caronas Aceitas',
      icon: 'checkmark-circle',
      color: COLORS.success.main
    },
    { 
      key: 'RIDE_REQUEST_REJECTED', 
      label: 'Caronas Rejeitadas',
      icon: 'close-circle',
      color: COLORS.danger.main
    },
    { 
      key: 'RIDE_CANCELLED', 
      label: 'Caronas Canceladas',
      icon: 'ban',
      color: COLORS.warning.main
    },
  ];

  const notificationStatuses = [
    { 
      key: 'ENVIADO', 
      label: 'Não Lidas',
      icon: 'radio-button-off',
      color: COLORS.info
    },
    { 
      key: 'RECONHECIDO', 
      label: 'Lidas',
      icon: 'checkmark-circle-outline',
      color: COLORS.success.main
    },
  ];

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      types: selectedTypes,
      statuses: selectedStatuses
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedStatuses(['PENDENTE', 'ENVIADO', 'FALHOU']); // Reset to show unread notifications
  };

  const handleSelectAllTypes = () => {
    if (selectedTypes.length === notificationTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(notificationTypes.map(type => type.key));
    }
  };

  const handleSelectAllStatuses = () => {
    if (selectedStatuses.length === notificationStatuses.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(notificationStatuses.map(status => status.key));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtrar Notificações</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Status</Text>
              <TouchableOpacity onPress={handleSelectAllStatuses}>
                <Text style={styles.selectAllText}>
                  {selectedStatuses.length === notificationStatuses.length ? 'Desmarcar' : 'Marcar'} Todos
                </Text>
              </TouchableOpacity>
            </View>
            
            {notificationStatuses.map(status => (
              <TouchableOpacity
                key={status.key}
                style={[
                  styles.filterItem,
                  selectedStatuses.includes(status.key) && styles.filterItemSelected
                ]}
                onPress={() => handleStatusToggle(status.key)}
              >
                <View style={styles.filterItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: status.color + '15' }]}>
                    <Ionicons 
                      name={status.icon} 
                      size={20} 
                      color={status.color} 
                    />
                  </View>
                  <Text style={[
                    styles.filterItemText,
                    selectedStatuses.includes(status.key) && styles.filterItemTextSelected
                  ]}>
                    {status.label}
                  </Text>
                </View>
                {selectedStatuses.includes(status.key) && (
                  <Ionicons 
                    name="checkmark" 
                    size={20} 
                    color={COLORS.primary.main} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Type Filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tipo de Notificação</Text>
              <TouchableOpacity onPress={handleSelectAllTypes}>
                <Text style={styles.selectAllText}>
                  {selectedTypes.length === notificationTypes.length ? 'Desmarcar' : 'Marcar'} Todos
                </Text>
              </TouchableOpacity>
            </View>
            
            {notificationTypes.map(type => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.filterItem,
                  selectedTypes.includes(type.key) && styles.filterItemSelected
                ]}
                onPress={() => handleTypeToggle(type.key)}
              >
                <View style={styles.filterItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: type.color + '15' }]}>
                    <Ionicons 
                      name={type.icon} 
                      size={20} 
                      color={type.color} 
                    />
                  </View>
                  <Text style={[
                    styles.filterItemText,
                    selectedTypes.includes(type.key) && styles.filterItemTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </View>
                {selectedTypes.includes(type.key) && (
                  <Ionicons 
                    name="checkmark" 
                    size={20} 
                    color={COLORS.primary.main} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.applyButton]} 
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.main,
    paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  resetButton: {
    padding: SPACING.xs,
  },
  resetText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHT.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  selectAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHT.medium,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.main,
  },
  filterItemSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.main + '08',
  },
  filterItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  filterItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
    flex: 1,
  },
  filterItemTextSelected: {
    color: COLORS.primary.main,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.main,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.main,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  applyButton: {
    backgroundColor: COLORS.primary.main,
  },
  applyButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.white,
  },
});

export default NotificationFilter;
