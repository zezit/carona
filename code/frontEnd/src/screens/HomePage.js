import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZE } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';

const HomePage = ({ navigation }) => {
  const { user, logoutUser } = useAuthContext();

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Sair', style: 'destructive', onPress: logoutUser }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.userInfo}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo(a){user?.name ? ',' : ''}</Text>
            {user?.name && (
              <Text style={styles.userName}>{user?.name}</Text>
            )}
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              {user?.photoUrl ? (
                <Image
                  source={{ uri: user?.photoUrl }}
                  style={styles.userImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={32} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Rides')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: `${COLORS.primary}20` }]}>
                <Ionicons name="car" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionButtonText}>Caronas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: `${COLORS.secondary}20` }]}>
                <Ionicons name="person" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionButtonText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.constructionContainer}>
          <Ionicons name="construct-outline" size={64} color={COLORS.primary} />
          <Text style={styles.constructionTitle}>Página em Construção</Text>
          <Text style={styles.constructionText}>Estamos trabalhando para trazer novidades em breve!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: SPACING.md,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  welcomeText: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  constructionContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  constructionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  constructionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default HomePage;
