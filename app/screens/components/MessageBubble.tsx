
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MessageBubbleProps {
  mensaje: string;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ mensaje, isOwn }) => {
  if (isOwn) {
    return (
      <View style={[styles.container, styles.ownContainer]}>
        <LinearGradient
          colors={['#8A4CFF', '#5D23E4']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.bubble, styles.ownBubble, styles.shadow]}
        >
          <Text style={styles.ownText}>{mensaje}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.otherContainer]}>
      <View style={[styles.bubble, styles.otherBubble, styles.shadow]}>
        <Text style={styles.otherText}>{mensaje}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  ownBubble: {
    borderBottomRightRadius: 4, // Modern tail effect
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4, // Modern tail effect
  },
  ownText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  otherText: {
    color: '#1A1A1A',
    fontSize: 16,
    lineHeight: 22,
  },
});
