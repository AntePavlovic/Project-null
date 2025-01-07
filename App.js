import React from "react";
import { StyleSheet } from "react-native";
import { AuthProvider } from "./AuthContext";
import Navigation from "./Navigation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default App = () => {
  return (
    <AuthProvider>
      <KeyboardAwareScrollView
        style={styles.container}
        resetScrollToCoords={{ x: 0, y: 0 }} // Vraća scroll na početnu poziciju nakon zatvaranja tipkovnice
        contentContainerStyle={styles.scrollViewContentContainer}
        scrollEnabled={true}
      >
        <Navigation />
      </KeyboardAwareScrollView>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
  },
});
