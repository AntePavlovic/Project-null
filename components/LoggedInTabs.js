import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import PostavkeKorisnika from './PostavkeKorisnika';
import Kviz from './Kvizovi';
import Ljestvica from './Ljestvica';

const Tab = createBottomTabNavigator();

export default function LoggedInTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Kviz"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Profil') {
            iconName = 'account-circle';
          } else if (route.name === 'Kviz') {
            iconName = 'fact-check';

            // Prilagođeni dizajn za "Kviz" s većim krugom
            return (
              <View style={styles.highlightWrapper}>
                <View
                  style={[
                    styles.circleHighlight,
                    focused && styles.circleHighlightActive, // Aktivni stil za krug
                  ]}
                />
                <MaterialIcons
                  name={iconName}
                  size={size + 15} // Povećaj veličinu ikone za Kviz
                  color={focused ? 'white' : color} // Održava bijelu boju za aktivnu ikonu
                />
              </View>
            );
          } else if (route.name === 'Ljestvica') {
            iconName = 'leaderboard';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f7b733',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarStyle: {
          justifyContent: 'center',
          paddingTop: 5,
          height: 50, // Standardna visina taba (nije promenjena)
        },
      })}
    >
      <Tab.Screen
        name="Profil"
        component={PostavkeKorisnika}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Kviz"
        component={Kviz}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Ljestvica"
        component={Ljestvica}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  highlightWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -40, // Podigni ikonu iznad tab navigacije
  },
  circleHighlight: {
    position: 'absolute',
    top: -20, // Podesi poziciju kruga iznad
    width: 80, // Širina kruga
    height: 80, // Visina kruga
    backgroundColor: '#f7b733', // Boja kruga
    borderRadius: 40, // Potpuni krug
    zIndex: -1, // Ispod ikone
  },
  circleHighlightActive: {
    backgroundColor: '#f7b733', // Aktivni stil (ostavi istu boju)
  },
});
