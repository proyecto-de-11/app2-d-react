
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import tw from 'twrnc';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>D</Text>
            </View>
            <View>
              <Text style={tw`text-white text-2xl font-bold`}>Welcome Denis D!</Text>
            </View>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity style={styles.categoryBox}>
              <MaterialCommunityIcons name="soccer-field" size={32} color="#00A79D" />
              <Text style={styles.categoryText}>Fútbol</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryBox}>
              <MaterialCommunityIcons name="basketball" size={32} color="#4A90E2" />
              <Text style={styles.categoryText}>Básquet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryBox}>
               <MaterialCommunityIcons name="tennis" size={32} color="#4A90E2" />
              <Text style={styles.categoryText}>Tenis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryBox}>
              <MaterialCommunityIcons name="volleyball" size={32} color="#50E3C2" />
              <Text style={styles.categoryText}>Vóley</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.promotionsTitle}>Promotions</Text>

          <View style={styles.promotionsGrid}>
            <TouchableOpacity style={styles.promotionCard}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150/FFC107/000000?Text=Cancha+1' }}
                style={styles.promotionImage}
              />
              <Text style={styles.promotionText}>Lorem ipsum dolor sit amet, consectetuer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.promotionCard}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=Cancha+2' }}
                style={styles.promotionImage}
              />
              <Text style={styles.promotionText}>Lorem ipsum dolor sit amet.</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color={Colors.light.tint} />
          <Text style={[styles.navText, { color: Colors.light.tint }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screens/LoginScreen')}>
          <Ionicons name="log-in-outline" size={24} color="#888" />
          <Text style={styles.navText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.navText}>User</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F7',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 20,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileIconText: {
    color: '#4A90E2',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    position: 'absolute',
    bottom: -25,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 40, // Space for the search bar
    paddingBottom: 80, // Added padding for the bottom nav
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 30,
  },
  categoryBox: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'white',
    width: 75,
    height: 85,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  promotionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  promotionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promotionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  promotionImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  promotionText: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    zIndex: 100,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default HomeScreen;
