import React from "react";
import {Text, View, StyleSheet} from "react-native";

export default function ErrorMessage ({error}) {
    if (!error) return null;
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
                {error}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        borderColor: "red",
        borderTopWidth: 1,
        padding: 5,
        alignItems: "center",
        marginVertical: 4,
        width: "80%"
    },
    errorText: {
        color: "red",
        fontSize: 14,
        textAlign: "center",
        fontFamily: "Arial",
    }
});