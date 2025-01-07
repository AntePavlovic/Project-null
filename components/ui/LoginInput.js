import React, { useState } from "react";
import { TextInput, StyleSheet, View } from "react-native";

export default function LoginInput({ placeholder, value, onChangeText, secureTextEntry }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.focusedContainer,
      ]}
    >
      <TextInput
        style={[
          styles.input,
          isFocused && styles.focusedInput,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "80%",
    marginBottom: 12,
  },
  focusedContainer: {
    borderWidth: 3,
    borderColor: "#666666",
    borderRadius: 9,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#666666",
    borderRadius: 5,
    paddingLeft: 8,
    color: "#666666",
    fontFamily: "Arial",
  },
  focusedInput: {
    borderColor: "#666666",
  },
});
