import React, { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";
import { AuthContext } from "../AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../SupabaseClient";

export default function PostavkeKorisnika() {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraPermission.status !== "granted" || galleryPermission.status !== "granted") {
      Alert.alert("Dozvola odbijena", "Morate omogućiti pristup kameri i galeriji.");
    }
  };
  
  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = auth.currentUser.uid;
        const docRef = doc(firestore, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile: ", error);
        Alert.alert("Greška", "Došlo je do greške pri učitavanju vašeg profila.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const userId = auth.currentUser.uid;
      await setDoc(doc(firestore, "users", userId), profile);
      Alert.alert("Profil spremljen", "Vaš profil je uspješno spremljen!");
    } catch (error) {
      console.error("Greška pri spremanju profila: ", error);
      Alert.alert("Greška", "Došlo je do greške pri spremanju vašeg profila.");
    }
  };

  const handleUploadImage = async () => {
    const userId = auth.currentUser.uid;

    console.log("Pokrenut upload slike...");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("Rezultat iz galerije: ", result);

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri, userId);
    }
  };

  const handleCaptureImage = async () => {
    const userId = auth.currentUser.uid;
  
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        await uploadImage(result.assets[0].uri, userId);
      } else {
        console.log("User canceled the image picking process");
      }
    } catch (error) {
      console.error("Error capturing image: ", error);
      Alert.alert("Greška", "Došlo je do greške pri korištenju kamere.");
    }
  };
  

  const uploadImage = async (uri, userId) => {
    const fileName = `${userId}-${Date.now()}.jpg`;

    console.log("Pokreće se upload slike na Supabase: ", uri);


    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      console.log("Slika preuzeta, pretvaram u blob...");


      const { data, error } = await supabase.storage
        .from("MathApp")
        .upload(fileName, blob);
        console.log('Supabase upload result: ', data, error);

      if (error) {
        console.log("Supabase error: ", error.message);
        Alert.alert("Greška", "Datoteka nije učitana!");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("MathApp")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Update the Firestore profile with the new image URL
      await setDoc(doc(firestore, "users", userId), {
        ...profile,
        profilePicture: publicUrl,
      });

      // Update the local state
      setProfile((prev) => ({ ...prev, profilePicture: publicUrl }));

      Alert.alert("Profilna slika", "Vaša profilna slika je uspješno ažurirana!");
    } catch (uploadError) {
      console.error("Error uploading image: ", uploadError);
      Alert.alert("Greška", "Došlo je do greške pri uploadu slike.");
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#f7b733", "#fc4a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.container, styles.loadingContainer]}
      >
        <Text style={styles.text}>Učitavanje...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#f7b733", "#fc4a1a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Profile Picture */}
          <View style={styles.profileImageContainer}>
            {profile.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.profileImage} />
            ) : (
              <Text style={styles.noPhotoText}>No photo</Text>
            )}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
              <Text style={styles.uploadButtonText}>Učitaj</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleCaptureImage}>
              <Text style={styles.uploadButtonText}>Kamera</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>ODJAVA</Text>
          </TouchableOpacity>

          {/* Profile Details */}
          <View style={styles.profileDetailsContainer}>
            <Text style={styles.welcomeText}>Postavke korisnika</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ime</Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                placeholder="Unesite ime"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prezime</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(text) => setProfile({ ...profile, lastName: text })}
                placeholder="Unesite prezime"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Datum rođenja</Text>
              <TextInput
                style={styles.input}
                value={profile.birthDate}
                onChangeText={(text) => setProfile({ ...profile, birthDate: text })}
                placeholder="Unesite datum rođenja (YYYY-MM-DD)"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                placeholder="Unesite e-mail"
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>SPREMI PROFIL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 40,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    height: "100%",
    marginTop: 0,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  welcomeText: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ccc",
    overflow: "hidden",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#ccc",
    overflow: "hidden",
    resizeMode: "cover",
  },
  noPhotoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 150,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
  uploadButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 15,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  logoutButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#fa0004",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  profileDetailsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    marginTop: 20,
  },
});
