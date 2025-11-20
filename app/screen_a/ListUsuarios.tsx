import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const users = [
  { id: '1', name: 'Ivanr', avatar: 'https://placekitten.com/200/200' },
  { id: '2', name: 'Test Hiculos', avatar: 'https://placekitten.com/201/201' },
  { id: '3', name: 'WhatsApp', avatar: 'https://placekitten.com/202/202' },
  { id: '4', name: '+1 (904)', avatar: 'https://placekitten.com/203/203' },
  { id: '5', name: 'Ivanr, Lau y Sam', avatar: 'https://placekitten.com/204/204' },
];

const ListUsuarios = () => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <FontAwesome name="paper-plane" size={24} color="black" />
    </View>
  );

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

const styles = StyleSheet.create({
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
