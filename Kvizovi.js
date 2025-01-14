import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome'; // Dodaj import za ikone
import { supabase } from '../SupabaseClient'; // Import Supabase klijenta

export default function Kviz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false); // Prati je li kviz pokrenut
  const [category, setCategory] = useState(''); // Prati kategoriju
  const [fadeAnim] = useState(new Animated.Value(0)); // Animacija za fade-in

  // Dohvati 10 slučajnih pitanja za odabranu kategoriju
  const fetchQuestions = async (category) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pitanja')
      .select('*')
      .eq('kategorija', category);

    if (error) {
      console.error('Greška pri dohvaćanju pitanja:', error);
    } else {
      // Randomiziraj pitanja i uzmi prvih 10
      const shuffledQuestions = data.sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffledQuestions);
      setCategory(category); // Spremi izabranu kategoriju
    }
    setLoading(false);
    setQuizStarted(true); // Postavi kviz na pokrenut
  };

  const handleAnswer = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const correctAnswerKey = questions[currentQuestionIndex].tocan_odg; // Točan odgovor: 'a', 'b', 'c', 'd'

    // Provjeri odgovor i ažuriraj bodove
    if (selectedOption === correctAnswerKey) {
      setScore(score + 1);
    }

    // Prikaži točan odgovor
    setShowCorrectAnswer(true);

    // Pređi na sljedeće pitanje nakon 2 sekunde
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowCorrectAnswer(false);
      } else {
        setQuizEnded(true); // Završi kviz
      }
    }, 2000);
  };

  const handleBackToStart = () => {
    // Resetiraj stanje na početno
    setQuizStarted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setSelectedAnswer(null);
    setShowCorrectAnswer(false);
    setQuizEnded(false);
    setCategory(''); // Resetiraj kategoriju
  };

  // Animacija za fade-in prilikom pokretanja kviza
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  if (!quizStarted) {
    fadeIn(); // Početna animacija
    return (
      <LinearGradient colors={['#f7b733', '#fc4a1a']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Odaberi kategoriju</Animated.Text>
          
          {/* Zemljopis */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#4caf50' }]}
            onPress={() => fetchQuestions('Geografija')}
          >
            <Icon name="globe" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Zemljopis</Text>
          </TouchableOpacity>

          {/* Povijest */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#f44336' }]}
            onPress={() => fetchQuestions('Povijest')}
          >
            <Icon name="book" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Povijest</Text>
          </TouchableOpacity>

          {/* Sport */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#2196f3' }]}
            onPress={() => fetchQuestions('Sport')}
          >
            <Icon name="soccer-ball-o" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Sport</Text>
          </TouchableOpacity>

          {/* Filmovi */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#ff9800' }]}
            onPress={() => fetchQuestions('Filmovi')}
          >
            <Icon name="film" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Filmovi</Text>
          </TouchableOpacity>

          {/* Glazba */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#9c27b0' }]}
            onPress={() => fetchQuestions('Glazba')}
          >
            <Icon name="music" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Glazba</Text>
          </TouchableOpacity>

          {/* Informatika */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#00bcd4' }]}
            onPress={() => fetchQuestions('Informatika')}
          >
            <Icon name="laptop" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Informatika</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Učitavam pitanja...</Text>
      </View>
    );
  }

  if (quizEnded) {
    return (
      <LinearGradient colors={['#f7b733', '#fc4a1a']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <Text style={styles.title}>Kviz završen!</Text>
          <Text style={styles.subtitle}>Osvojio si {score}/{questions.length} bodova!</Text>
          <TouchableOpacity style={styles.returnButton} onPress={handleBackToStart}>
            <Text style={styles.startButtonText}>Igraj</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <LinearGradient colors={['#f7b733', '#fc4a1a']} style={styles.gradientBackground}>
      <View style={styles.container}>
        <Text style={styles.title}>Pitanje {currentQuestionIndex + 1} / {questions.length}</Text>
        <Text style={styles.questionText}>{currentQuestion.tekst_pitanja}</Text>
        {['a', 'b', 'c', 'd'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionButton,
              selectedAnswer === key && selectedAnswer !== currentQuestion.tocan_odg && styles.wrongOption,
              showCorrectAnswer && key === currentQuestion.tocan_odg && styles.correctOption,
            ]}
            disabled={showCorrectAnswer}
            onPress={() => handleAnswer(key)}
          >
            <Text style={styles.optionText}>{currentQuestion[`odgovor_${key}`]}</Text>
          </TouchableOpacity>
        ))}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'gray',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  returnButton: {
    backgroundColor: '#f7b733',
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },  
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Roboto', // Koristimo specifičan font za moderniji izgled
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  optionButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f7b733',
    borderRadius: 10,
    marginBottom: 10,
  },
  correctOption: {
    backgroundColor: '#4caf50',
  },
  wrongOption: {
    backgroundColor: '#f44336',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  icon: {
    marginRight: 10,
  },
});
