import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { firestore, auth } from '../firebaseConfig'; // Uvezi auth iz firebaseConfig
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

export default function Ljestvica() {
  const [userData, setUserData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('total_points');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userLiked, setUserLiked] = useState(false);

  const currentUser = auth.currentUser?.uid; // Dohvati ID trenutnog prijavljenog korisnika

  // Map categories to icons and colors
  const categoryIcons = {
    total_points: { icon: 'trophy', color: '#ffeb3b' },
    geografija_points: { icon: 'globe', color: '#4caf50' },
    povijest_points: { icon: 'book', color: '#f44336' },
    sport_points: { icon: 'soccer-ball-o', color: '#2196f3' },
    filmovi_points: { icon: 'film', color: '#ff9800' },
    glazba_points: { icon: 'music', color: '#9c27b0' },
    informatika_points: { icon: 'laptop', color: '#00bcd4' },
  };

  // Fetch all users data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const querySnapshot = await getDocs(usersCollection);
        const usersList = [];

        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });

        const sortedUsers = usersList.sort((a, b) => {
          const pointsA = a[selectedCategory] || 0;
          const pointsB = b[selectedCategory] || 0;
          return pointsB - pointsA;
        });

        setUserData(sortedUsers);
      } catch (error) {
        console.error('Error fetching users data:', error);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const currentUsers = userData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const openModal = async (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  
    // Provjera je li trenutni korisnik lajkao ovog korisnika
    const userRef = doc(firestore, 'users', user.id);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      const userLikes = userSnap.data().likes || [];
  
      // Osiguraj da userLikes bude niz prije nego što koristiš includes
      if (Array.isArray(userLikes)) {
        setUserLiked(userLikes.includes(currentUser));  // Provjeri je li trenutni korisnik lajkao
        setSelectedUser((prevUser) => ({
          ...prevUser,
          likes: userLikes, // Dodajemo likes u selectedUser
        }));
      } else {
        setUserLiked(false);  // Ako likes nije niz, postavi na false
        setSelectedUser((prevUser) => ({
          ...prevUser,
          likes: [], // Osiguraj da likes bude prazan niz
        }));
      }
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalVisible(false);
  };

  const handleLike = async () => {
    const userRef = doc(firestore, 'users', selectedUser.id);
  
    if (userLiked) {
      // Ako je već lajkao, ukloni like
      await updateDoc(userRef, {
        likes: selectedUser.likes.filter((likeId) => likeId !== currentUser),
      });
      setUserLiked(false);
    } else {
      // Ako nije lajkao, dodaj like
      await updateDoc(userRef, {
        likes: [...(selectedUser.likes || []), currentUser],
      });
      setUserLiked(true);
    }
  
    // Ažuriraj broj lajkova
    const updatedUser = { ...selectedUser, likes: selectedUser.likes || [] };
    setSelectedUser(updatedUser);
  };

  const renderItem = ({ item, index }) => {
    let backgroundColor = 'white';
    const globalRank = currentPage * itemsPerPage + index + 1;

    if (globalRank === 1) backgroundColor = 'gold';
    else if (globalRank === 2) backgroundColor = 'silver';
    else if (globalRank === 3) backgroundColor = '#cd7f32';

    return (
      <TouchableOpacity onPress={() => openModal(item)} style={[styles.item, { backgroundColor }]}>
        <Text style={styles.rank}>{globalRank}</Text>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.score}>{item[selectedCategory] || 0}</Text>
      </TouchableOpacity>
    );
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < userData.length) setCurrentPage(currentPage + 1);
  };

  return (
    <LinearGradient colors={["#f7b733", "#fc4a1a"]} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Ljestvica</Text>

          <View style={styles.categoriesContainer}>
            {Object.keys(categoryIcons).map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.startButton, { backgroundColor: categoryIcons[category].color }]}
                onPress={() => setSelectedCategory(category)}
              >
                <Icon name={categoryIcons[category].icon} size={20} color="white" style={styles.icon} />
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={currentUsers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.listContainer}
            nestedScrollEnabled={true}
          />

          <View style={styles.paginationContainer}>
            <TouchableOpacity onPress={goToPreviousPage} style={styles.paginationButton} disabled={currentPage === 0}>
              <Text style={styles.paginationText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.paginationNumberText}>{currentPage + 1}/{Math.ceil(userData.length / itemsPerPage)}</Text>
            <TouchableOpacity onPress={goToNextPage} style={styles.paginationButton} disabled={(currentPage + 1) * itemsPerPage >= userData.length}>
              <Text style={styles.paginationText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay} onStartShouldSetResponder={closeModal}>
          <View style={styles.modalBackground} onStartShouldSetResponder={() => true}>
            <View style={styles.modalContainer}>
              {selectedUser && (
                <>
                  {selectedUser.profilePicture ? (
                    <Image
                      source={{ uri: selectedUser.profilePicture }}
                      style={styles.modalProfilePicture}
                    />
                  ) : (
                    <View style={styles.emptyImagePlaceholder}>
                      <Text style={styles.placeholderText}>NO PHOTO</Text>
                    </View>
                  )}

                  <View style={styles.likeButtonContainer}>
                    <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
                      <Icon
                        name={userLiked ? 'heart' : 'heart-o'}
                        size={30}
                        color={userLiked ? 'red' : 'gray'}
                      />
                      <Text style={styles.likeCount}>{selectedUser.likes?.length || 0}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{selectedUser.firstName} {selectedUser.lastName}</Text>
                  </View>

                  <View style={styles.iconsRow}>
                    {Object.keys(categoryIcons).map((category) => (
                      <View key={category} style={[styles.modalCell, { backgroundColor: categoryIcons[category].color }]} >
                        <Icon name={categoryIcons[category].icon} size={20} color="white" />
                        <Text style={styles.modalScore}>{selectedUser[category] || 0}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  container: {
    width: '95%',
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  item: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    margin: 5,
    width: '98%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
  },
  rank: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 30,
  },
  name: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  score: {
    fontSize: 13,
    color: 'gray',
    textAlign: 'center',
    width: 30,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  startButton: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  listContainer: {
    width: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  paginationButton: {
    backgroundColor: 'orange',
    borderRadius: 5,
    paddingBottom: 5,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationNumberText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1,
  },
  modalBackground: {
    width: '90%',
    height: '60%',
    backgroundColor: 'orange',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    top: 20,
    padding: 20,
    zIndex: 2,
    justifyContent: 'flex-start',  // Poravnava sadržaj prema vrhu
    alignItems: 'flex-start',
    zIndex: 3,
  },
  modalTitle: {
    fontSize: 30,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Arial",
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    zIndex: 1,
  },
  modalText: {
    fontSize: 30,
    marginTop: 20,
    marginBottom: 20,
    fontWeight: "bold",
    fontFamily: "Arial",
    color: "black",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  modalScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  modalCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    margin: 1,
    borderRadius: 5,
    width: 60, // širina ćelije
    height: 30, // visina ćelije
  },
  modalContentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',              // Bijeli tekst za kontrast s narandžastom pozadinom
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  userNameContainer: {
    width: '100%',
    backgroundColor: 'orange',   // Narandžasta pozadina
    justifyContent: 'center',    // Vertikalno centriranje
    alignItems: 'center',        // Horizontalno centriranje
    paddingVertical: 5,         // Paddanje gore i dolje za bolju raspodjelu
  },
  iconsRow: {
    flexDirection: 'row', // Svi ikoni i bodovi u jednom redu
    justifyContent: 'center', // Centriranje elemenata
    flexWrap: 'wrap', // Omogućuje prelamanje ako nema dovoljno prostora
    marginTop: 10,
  },
  modalProfilePicture: {
    width: '50%',  // Širina 30% širine modala
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'orange',
    marginTop: -10, // Pomiče sliku prema gore, bliže vrhu
    marginLeft: -10,
    borderTopLeftRadius: 10,
  },
  emptyImagePlaceholder: {
    width: '50%',  // Širina 30% širine modala
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'orange',
    backgroundColor: '#d3d3d3', // Siva pozadina
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10, // Pomiče sliku prema gore, bliže vrhu
    marginLeft: -10,
    borderTopLeftRadius: 10,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#808080', // Tamnija nijansa sive za tekst
  },
  likeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
