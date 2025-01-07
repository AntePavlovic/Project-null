import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import DateInput from "./ui/DateInput";
import { AuthContext } from "../AuthContext";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Initialize Firestore database
const db = getFirestore();

export default function LoggedOutView() {
  const { login } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dateError, setDateError] = useState("");

  const handleLogin = () => {
    console.log("handleLogin called");
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        login();
      })
      .catch((error) => {
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);
        switch (error.code) {
          case "auth/user-not-found":
            setErrorMsg("Korisnik sa ovim emailom ne postoji.");
            break;
          case "auth/wrong-password":
            setErrorMsg("Pogrešna lozinka.");
            break;
          case "auth/invalid-email":
            setErrorMsg("Neispravna email adresa.");
            break;
          case "auth/too-many-requests":
            setErrorMsg("Previše neuspješnih pokušaja. Pokušajte kasnije.");
            break;
          default:
            setErrorMsg("Došlo je do greške. Pokušajte ponovo.");
        }
      });
  };

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setErrorMsg("Lozinke se ne podudaraju.");
      return;
    }

    if (dateError) {
      setErrorMsg("Datum rođenja nije ispravan.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Format birthDate as yyyy-mm-dd
        const formattedBirthDate = birthDate.split("/").reverse().join("-");

        // Default profile image URL
        const defaultProfileImage = "https://riezvsdjcopgtlazeznv.supabase.co/storage/v1/object/public/MathApp/default.jpg";

        // Create a document in Firestore with user data, including default profile image
        return setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          birthDate: formattedBirthDate,
          createdAt: new Date(),
          profileImage: defaultProfileImage,  // Default profile image URL
        });
      })
      .then(() => {
        login();
      })
      .catch((error) => {
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);
        switch (error.code) {
          case "auth/email-already-in-use":
            setErrorMsg("Email adresa je već u upotrebi.");
            break;
          case "auth/weak-password":
            setErrorMsg("Lozinka mora imati najmanje 6 znakova.");
            break;
          case "auth/invalid-email":
            setErrorMsg("Neispravna email adresa.");
            break;
          default:
            setErrorMsg("Došlo je do greške. Pokušajte ponovo.");
        }
      });
  };

  return (
    <LinearGradient
      colors={["#f7b733", "#fc4a1a"]} // Ovdje ostavljamo gradijent boje sa buttona
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        {!isRegistering ? (
          <>
            {/* Login */}
            <Text style={styles.label}>Email</Text>
            <LoginInput value={email} secureTextEntry={false} onChangeText={setEmail} />

            <Text style={styles.label}>Lozinka</Text>
            <LoginInput value={password} secureTextEntry={true} onChangeText={setPassword} />

            <ErrorMessage error={errorMsg} />
            <LoginButton title="PRIJAVI SE" onPress={handleLogin} />

            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>ili</Text>
              <View style={styles.line} />
            </View>

            <LoginButton title="REGISTRIRAJ SE" onPress={() => setIsRegistering(true)} />
          </>
        ) : (
          <>
            {/* Registration */}
            <Text style={styles.label}>Ime</Text>
            <LoginInput value={firstName} secureTextEntry={false} onChangeText={setFirstName} />

            <Text style={styles.label}>Prezime</Text>
            <LoginInput value={lastName} secureTextEntry={false} onChangeText={setLastName} />

            <Text style={styles.label}>Datum rođenja</Text>
            <DateInput
              value={birthDate}
              onChangeText={setBirthDate}
              onError={setDateError}
              placeholder="yyyy-mm-dd"
            />

            <Text style={styles.label}>Email</Text>
            <LoginInput value={email} secureTextEntry={false} onChangeText={setEmail} />

            <Text style={styles.label}>Lozinka</Text>
            <LoginInput value={password} secureTextEntry={true} onChangeText={setPassword} />

            <Text style={styles.label}>Ponovi lozinku</Text>
            <LoginInput
              value={confirmPassword}
              secureTextEntry={true}
              onChangeText={setConfirmPassword}
            />

            <ErrorMessage error={errorMsg} />
            <LoginButton title="REGISTRIRAJ SE" onPress={handleRegister} />

            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>ili</Text>
              <View style={styles.line} />
            </View>

            <LoginButton title="NAZAD NA PRIJAVU" onPress={() => setIsRegistering(false)} />
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    justifyContent: "center", // Centers the content vertically
    alignItems: "center", // Centers the content horizontally
  },
  container: {
    width: "90%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
    alignSelf: "center",
    minHeight: "auto", // Ensure the container is 10% taller than its content
    paddingTop: "10%",
    paddingBottom: "10%",
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 5,
    marginLeft: "10%",
    fontSize: 13,
    color: "#666666",
    fontFamily: "Arial",
    fontWeight: "bold",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    width: "80%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#666666",
    marginHorizontal: 8,
    marginBottom: 10,
  },
  orText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "bold",
    marginBottom: 10,
  },
});
