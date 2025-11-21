import { obtenerPerfilesPublicos } from '@/services/Profile.service';
import { ProfileBasic } from '@/types/ProfileBasic';
import { useEffect, useState } from 'react';
import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TextInput, ActivityIndicator } from 'react-native';

import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const users = [
  { id: '1', name: 'Ivanr', avatar: 'https://images.unsplash.com/photo-1762324858945-3fd82fe78bcd?q=80&w=770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '2', name: 'Test Hiculos', avatar: 'https://images.unsplash.com/photo-1762324858945-3fd82fe78bcd?q=80&w=770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '3', name: 'WhatsApp', avatar: 'https://images.unsplash.com/photo-1762770647310-66f492eb832f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '4', name: '+1 (904)', avatar: 'https://images.unsplash.com/photo-1762770647310-66f492eb832f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '5', name: 'Ivanr, Lau y Sam', avatar: 'https://images.unsplash.com/photo-1762770647310-66f492eb832f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

const ListUsuarios = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<ProfileBasic[]>([]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function fetchData() { 
      setProfile(await obtenerPerfilesPublicos());
     }

    fetchData()
  }, []);
  if (profile.length === 0) {
    return (
      <SafeAreaProvider>
    <SafeAreaView style={[styles.container1, styles.horizontal]}>
      <ActivityIndicator size="large" color="#00ff00" />
    </SafeAreaView>
  </SafeAreaProvider>
    )

  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.fotoPerfil || 'https://www.istockphoto.com/photo/black-woman-winner-and-home-success-with-results-or-good-news-for-online-giveaway-or-gm2149111354-570337412'}} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.nombreCompleto}</Text>
      </View>
     
    </View>
  );



  return (
    <View style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
     

    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar..."
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      <FlatList
        data={profile}
        renderItem={renderItem}
        keyExtractor={item => item.usuarioId.toString()}
      />
    </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    padding: 10,
    margin: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListUsuarios;
