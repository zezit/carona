import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants';

const ManagePassengersHome = ({ navigation, route }) => {
  const { ride } = route.params || {};
  const handleEditPassengers = () => {
    // navigation.navigate('EditPassengers');
  // Alert.alert('Em breve!', 'Essa funcionalidade ainda está em desenvolvimento.');
    navigation.navigate('ManagePassagers', { ride });
  };

  const handleApproveRequests = () => {
    navigation.navigate('ManageRequests', { ride });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.main }}>
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gerenciar Carona</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.title}>O que você quer fazer?</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.primary.main }]}
          onPress={handleEditPassengers}
        >
          <Ionicons name="people" size={20} color={COLORS.text.light} />
          <Text style={styles.buttonText}>Editar Passageiros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.secondary.main }]}
          onPress={handleApproveRequests}
        >
          <Ionicons name="checkmark-done" size={20} color={COLORS.text.light} />
          <Text style={styles.buttonText}>Aprovar/Recusar Pedidos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    height: 150,
    width: '100%',
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.xl,
    color: COLORS.text.dark,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    width: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.light,
  },
});

export default ManagePassengersHome;