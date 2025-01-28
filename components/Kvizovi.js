import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { supabase } from '../SupabaseClient';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Accelerometer } from 'expo-sensors';

export default function Kviz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [category, setCategory] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [confettiActive, setConfettiActive] = useState(false); // Dodano za konfete
  const [shakeDetected, setShakeDetected] = useState(false);

  const fetchQuestions = async (category) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pitanja')
      .select('*')
      .eq('kategorija', category);

    if (error) {
      console.error('Pogreška pri dohvaćanju pitanja:', error);
    } else {
      const shuffledQuestions = data.sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffledQuestions);
      setCategory(category);
    }
    setLoading(false);
    setQuizStarted(true);
  };
  const { width, height } = Dimensions.get('screen');

  const handleAnswer = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const correctAnswerKey = questions[currentQuestionIndex].tocan_odg;

    const updatedScore = selectedOption === correctAnswerKey ? score + 1 : score;
    if (selectedOption === correctAnswerKey) {
      setScore(updatedScore);
    }

    setShowCorrectAnswer(true);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowCorrectAnswer(false);
      } else {
        setQuizEnded(true);
        setTimeout(() => {
          saveScoreToFirebase(updatedScore); // Prosljeđivanje konačnog rezultata
        }, 1000);
      }
    }, 2000);
  };

  const saveScoreToFirebase = async (finalScore) => {
    try {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedCategoryPoints = (userData[`${category.toLowerCase()}_points`] || 0) + finalScore;
          const updatedTotalPoints = (userData.total_points || 0) + finalScore;

          await updateDoc(userRef, {
            [`${category.toLowerCase()}_points`]: updatedCategoryPoints,
            total_points: updatedTotalPoints,
          });

          await addDoc(collection(firestore, 'quizScores'), {
            userId: userId,
            score: finalScore,
            category: category,
            timestamp: serverTimestamp(),
          });

          console.log('Rezultat uspješno spremljen!');
        }
      }
    } catch (error) {
      console.error('Pogreška pri spremanju rezultata:', error);
    }
  };

  const handleConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 10000);
  };


  useEffect(() => {
    if (Platform.OS !== 'web') { // Provjerava da li nije web platforma
      const subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const threshold = 1.5;
  
        if (Math.abs(x) > threshold || Math.abs(y) > threshold || Math.abs(z) > threshold) {
          if (!shakeDetected) {
            setShakeDetected(true);
            if (quizEnded && !confettiActive) {
              handleConfetti();
            }
          }
        } else {
          setShakeDetected(false);
        }
      });
  
      return () => subscription && subscription.remove();
    }
  }, [shakeDetected, quizEnded, confettiActive]);
  const handleBackToStart = () => {
    setQuizStarted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setSelectedAnswer(null);
    setShowCorrectAnswer(false);
    setQuizEnded(false);
    setCategory('');
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  if (!quizStarted) {
    fadeIn();
    return (
      <LinearGradient colors={['#f7b733', '#fc4a1a']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Odaberi kategoriju</Animated.Text>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#4caf50' }]}
            onPress={() => fetchQuestions('Geografija')}
          >
            <Icon name="globe" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Geografija</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#f44336' }]}
            onPress={() => fetchQuestions('Povijest')}
          >
            <Icon name="book" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Povijest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#2196f3' }]}
            onPress={() => fetchQuestions('Sport')}
          >
            <Icon name="soccer-ball-o" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Sport</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#ff9800' }]}
            onPress={() => fetchQuestions('Filmovi')}
          >
            <Icon name="film" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Filmovi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#9c27b0' }]}
            onPress={() => fetchQuestions('Glazba')}
          >
            <Icon name="music" size={24} color="white" style={styles.icon} />
            <Text style={styles.startButtonText}>Glazba</Text>
          </TouchableOpacity>

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
        <Text style={styles.loadingText}>Učitavanje pitanja...</Text>
      </View>
    );
  }

  if (quizEnded) {
    const isHighScore = score >= 4;

    return (
      <LinearGradient colors={['#f7b733', '#fc4a1a']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <Text style={styles.title}>Kviz završen!</Text>
          <Text style={styles.subtitle}>Osvojio si {score}/{questions.length} bodova!</Text>

          {isHighScore && (<View style={StyleSheet.absoluteFill}>
    <       ConfettiCannon
            count={300} // Povećan broj konfeta
            origin={{ x: width / 2, y:  0  }} // Početak s centra vrha ekrana
            fadeOut={true}
            fallSpeed={2000} // Usmjereno za dulji pad
    />
            </View>)}
          {confettiActive && (<View style={StyleSheet.absoluteFill}>
    <       ConfettiCannon
            count={300} // Povećan broj konfeta
            origin={{ x: width / 2, y:  -200 }} // Početak s centra vrha ekrana
            fadeOut={true}
            fallSpeed={4000} // Usmjereno za dulji pad
    />
            </View>)}
          <TouchableOpacity style={styles.returnButton} onPress={handleBackToStart}>
            <Text style={styles.startButtonText}>Pogodite ponovo</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.5)",
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
    fontSize: 30,
    fontFamily: "Arial",
    marginTop: 20,
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
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
    elevation: 5,
    shadowColor: '#000',
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
    fontFamily: 'Roboto',
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
  absoluteFill: {
    ...StyleSheet.absoluteFillObject, // Zauzima cijeli ekran
    zIndex: 10, // Prikaz iznad ostalih elemenata
  },
});
