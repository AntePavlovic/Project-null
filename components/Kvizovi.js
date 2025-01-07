import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Kviz() {
  const handleQuizPress = (quizNumber) => {
    console.log(`Odabran Kviz ${quizNumber}`);
  };

  return (
    <LinearGradient
      colors={["#f7b733", "#fc4a1a"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Budući Kvizovi</Text>
        <Text style={styles.subtitle}>
          Ovdje će se prikazivati budući kvizovi.
        </Text>
        <View style={styles.quizContainer}>
          {[1, 2, 3, 4, 5, 6].map((quizNumber) => (
            <TouchableOpacity
              key={quizNumber}
              style={styles.quizButton}
              onPress={() => handleQuizPress(quizNumber)}
            >
              <Text style={styles.quizButtonText}>Kviz {quizNumber}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  quizContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  quizButton: {
    width: '45%',
    backgroundColor: '#f7b733',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  quizButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
