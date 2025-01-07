import React, { useState, useEffect } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import LoginInput from "./LoginInput";

export default function DateInput({ value, onChangeText, onError, ...props }) {
  const [formattedValue, setFormattedValue] = useState(value);
  const [error, setError] = useState("");

  useEffect(() => {
    onError(error);
  }, [error]);

  const handleTextChange = (text) => {
    let parts = text.split("-");
    let errorMessage = "";

    // Automatically add hyphens after year and month
    if (text.length === 4 || text.length === 7) {
      text += "-";
    }

    // Validate and format month (mm)
    if (parts.length > 1 && (parseInt(parts[1], 10) > 12 || parseInt(parts[1], 10) < 1)) {
      errorMessage = "Month should be between 01 and 12";
    }

    // Validate and format day (dd) based on the month
    if (parts.length > 2) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      let maxDays = 31;

      if (month === 4 || month === 6 || month === 9 || month === 11) {
        maxDays = 30;
      } else if (month === 2) {
        const year = parseInt(parts[0], 10);
        maxDays = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
      }

      if (day > maxDays) {
        errorMessage = `Day should be between 01 and ${maxDays}`;
      }
    }

    // Limit input to 10 characters (yyyy-mm-dd)
    if (text.length > 10) {
      text = text.slice(0, 10);
    }

    setFormattedValue(text);
    onChangeText(text);
    setError(errorMessage);

    console.log("Formatted Value:", text); // Add log
    console.log("Error Message:", errorMessage); // Add log
  };

  return (
    <View style={styles.container}>
      <LoginInput
        value={formattedValue}
        onChangeText={handleTextChange}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
