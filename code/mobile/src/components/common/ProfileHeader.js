import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../constants';
import UserAvatar from '../common/UserAvatar';
import StarRating from '../common/StarRating';

/**
 * A reusable profile header component that displays user information and optional edit button
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with name, email, photoUrl, etc
 * @param {Function} props.onEditPress - Callback when edit button is pressed
 * @param {boolean} props.showEditButton - Whether to show the edit button
 * @param {Object} props.style - Additional style for the container
 * @param {Object} props.textStyle - Additional style for the text elements
 */
const ProfileHeader = ({
  user,
  onEditPress,
  showEditButton = true,
  style,
  avatarSize = 80,
}) => {
  if (!user) {
    return null;
  }

  // Function to get status color based on statusCadastro
  const getStatusColor = (status) => {
    switch (status) {
      case 'APROVADO':
        return COLORS.success.main;
      case 'PENDENTE':
        return COLORS.warning.main;
      case 'REJEITADO':
        return COLORS.error;
      case 'CANCELADO':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  // Function to get human-readable status text
  const getStatusText = (status) => {
    switch (status) {
      case 'APROVADO':
        return 'Aprovado';
      case 'PENDENTE':
        return 'Pendente';
      case 'REJEITADO':
        return 'Rejeitado';
      case 'CANCELADO':
        return 'Cancelado';
      case 'FINALIZADO':
        return 'Finalizado';
      default:
        return status || 'Não informado';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <UserAvatar
        uri={user.photoUrl || user.imgUrl}
        size={avatarSize}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{user.nome || 'Usuário'}</Text>
        
        {user.email && (
          <Text style={styles.emailText}>{user.email}</Text>
        )}
        
        {user.matricula && (
          <Text style={styles.detailText}>Matrícula: {user.matricula}</Text>
        )}
        
        {user.curso && (
          <Text style={styles.detailText}>Curso: {user.curso}</Text>
        )}

        {/* Display user rating */}
        {user.avaliacaoMedia !== undefined && user.avaliacaoMedia !== null && (
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={user.avaliacaoMedia} 
              size={16} 
              showValue={true} 
            />
          </View>
        )}
        
        {user.statusCadastro && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status: </Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(user.statusCadastro) }
            ]}>
              <Text style={styles.statusText}>
                {getStatusText(user.statusCadastro)}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {showEditButton && onEditPress && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={onEditPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="pencil" size={20} color={COLORS.primary.main} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  infoContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  emailText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  ratingContainer: {
    marginTop: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary.main}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(ProfileHeader);