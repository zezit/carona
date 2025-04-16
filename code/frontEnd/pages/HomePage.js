import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../contexts/AuthContext';

const HomePage = ({ navigation }) => {
  const { user } = useAuthContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
            <Text style={styles.userName}>{user?.name || 'Estudante'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {
              user?.photoUrl ? (
                <Image
                  source={{ uri: user?.photoUrl || 'https://via.placeholder.com/150' }}
                  style={styles.userImage}
                />
              ) :
                <Ionicons name="person-circle-outline" size={32} color="#4285F4" style={styles.userImage} />
            }
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.constructionContainer}>
          <Ionicons name="construct-outline" size={64} color="#4285F4" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  constructionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  constructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  constructionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  color: '#666',
});

export default HomePage;
