import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Ljestvica() {
  return (
    <LinearGradient
      colors={["#f7b733", "#fc4a1a"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Buduća ljestvica</Text>
        <Text style={styles.subtitle}>
          Ovdje će se prikazivati ljestvica.
        </Text>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
