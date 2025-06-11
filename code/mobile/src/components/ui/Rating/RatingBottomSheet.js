import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  BackHandler,
  Dimensions,
} from 'react-native';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  checkPendingRatings,
  getFinishedRidesWithPendingRatings,
  getPendingRatingsForRide,
  submitRating,
} from '../../../services/api/apiClient';

const { height } = Dimensions.get('window');

const StarRating = ({ rating, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={styles.starButton}
        >
          <Text style={[styles.star, rating >= star && styles.starFilled]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PersonRatingCard = ({ person, onSubmitRating, isLoading }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Aviso', 'Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    onSubmitRating(person.id, rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <View style={styles.personCard}>
      <Text style={styles.personName}>{person.nome}</Text>
      <Text style={styles.personInfo}>
        {person.curso} • Matrícula: {person.matricula}
      </Text>
      
      <Text style={styles.ratingLabel}>Avalie de 1 a 5 estrelas:</Text>
      <StarRating rating={rating} onRatingChange={setRating} />
      
      <TextInput
        style={styles.commentInput}
        placeholder="Comentário (opcional)"
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
      />
      
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const RideCard = ({ ride, onSelectRide }) => {
  return (
    <TouchableOpacity style={styles.rideCard} onPress={() => onSelectRide(ride)}>
      <Text style={styles.rideTitle}>Carona #{ride.id}</Text>
      <Text style={styles.rideRoute}>
        {ride.pontoPartida} → {ride.pontoDestino}
      </Text>
      <Text style={styles.rideDate}>
        {new Date(ride.dataHoraPartida).toLocaleDateString('pt-BR')}
      </Text>
    </TouchableOpacity>
  );
};

const RatingBottomSheet = ({ visible, onClose }) => {
  const { user, authToken } = useAuthContext();
  const [step, setStep] = useState('rides'); // 'rides' or 'rating'
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [peopleToRate, setPeopleToRate] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      loadRidesWithPendingRatings();
      
      // Prevent back button from closing the app
      const backAction = () => {
        return true; // Prevent default behavior
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }
  }, [visible]);

  const loadRidesWithPendingRatings = async () => {
    setIsLoading(true);
    try {
      const response = await getFinishedRidesWithPendingRatings(authToken);
      if (response.success) {
        if (response.data.length === 0) {
          // No pending ratings, close the modal
          onClose();
          return;
        }
        
        setRides(response.data);
        
        // If only one ride, go directly to rating
        if (response.data.length === 1) {
          await selectRide(response.data[0]);
        }
      } else {
        Alert.alert('Erro', response.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar caronas com avaliações pendentes');
    } finally {
      setIsLoading(false);
    }
  };

  const selectRide = async (ride) => {
    setSelectedRide(ride);
    setIsLoading(true);
    
    try {
      const response = await getPendingRatingsForRide(ride.id, authToken);
      if (response.success) {
        setPeopleToRate(response.data);
        setCurrentPersonIndex(0);
        setStep('rating');
      } else {
        Alert.alert('Erro', response.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar pessoas para avaliar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRating = async (personId, rating, comment) => {
    setIsLoading(true);
    
    try {
      const ratingData = {
        avaliadoId: personId,
        nota: rating,
        comentario: comment || '',
      };

      const response = await submitRating(selectedRide.id, ratingData, authToken);
      
      if (response.success) {
        // Move to next person or close if finished
        if (currentPersonIndex < peopleToRate.length - 1) {
          setCurrentPersonIndex(currentPersonIndex + 1);
        } else {
          // All people rated for this ride, check if there are more rides
          const updatedRides = rides.filter(r => r.id !== selectedRide.id);
          setRides(updatedRides);
          
          if (updatedRides.length > 0) {
            setStep('rides');
            setSelectedRide(null);
            setPeopleToRate([]);
            setCurrentPersonIndex(0);
          } else {
            // All rides completed
            Alert.alert(
              'Concluído!',
              'Todas as avaliações foram enviadas com sucesso!',
              [{ text: 'OK', onPress: onClose }]
            );
          }
        }
      } else {
        Alert.alert('Erro', response.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar avaliação');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.bottomSheet}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 'rides' ? 'Avaliações Pendentes' : 'Avaliar Participantes'}
          </Text>
          {step === 'rating' && (
            <Text style={styles.subtitle}>
              {currentPersonIndex + 1} de {peopleToRate.length} • Carona #{selectedRide?.id}
            </Text>
          )}
        </View>

        <ScrollView style={styles.content}>
          {step === 'rides' ? (
            <>
              <Text style={styles.description}>
                Você possui avaliações pendentes. É obrigatório avaliar todos os participantes antes de continuar.
              </Text>
              {rides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onSelectRide={selectRide}
                />
              ))}
            </>
          ) : (
            peopleToRate.length > 0 && (
              <PersonRatingCard
                person={peopleToRate[currentPersonIndex]}
                onSubmitRating={handleSubmitRating}
                isLoading={isLoading}
              />
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    minHeight: height * 0.4,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  rideCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  rideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  rideRoute: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  rideDate: {
    fontSize: 12,
    color: '#999',
  },
  personCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  personInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 30,
    color: '#E5E5E5',
  },
  starFilled: {
    color: '#FFD700',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RatingBottomSheet;
