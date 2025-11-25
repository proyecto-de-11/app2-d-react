
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MessageBubbleProps {
  mensaje: string;
  isOwn: boolean;
}

// ======================================================================================
// VIBRANT EDITION - MessageBubble
// - Bubbly, rounded shapes with more pronounced shadows for a "pop" effect.
// - Logic remains untouched.
// ======================================================================================

export const MessageBubble: React.FC<MessageBubbleProps> = ({ mensaje, isOwn }) => {
  const bubbleStyles = isOwn ? [styles.bubble, styles.sentBubble] : [styles.bubble, styles.receivedBubble];
  const rowStyles = isOwn ? [styles.messageRow, styles.rowSent] : [styles.messageRow, styles.rowReceived];
  
  if (isOwn) {
    return (
      <View style={rowStyles}>
        <LinearGradient
          colors={['#7033FF', '#A044FF']} // Vibrant brand gradient
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={bubbleStyles}
        >
          <Text style={styles.messageTextSent}>{mensaje}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={rowStyles}>
      <View style={bubbleStyles}>
        <Text style={styles.messageTextReceived}>{mensaje}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  rowSent: {
    justifyContent: 'flex-end',
  },
  rowReceived: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25, // Fully rounded corners for a bubbly feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Softer but visible shadow
    shadowRadius: 5,
    elevation: 3,
  },
  sentBubble: {
    // The gradient is the background
  },
  receivedBubble: {
    backgroundColor: '#FFFFFF', // Changed to a brighter white to pop against texture
  },
  messageTextSent: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextReceived: {
    color: '#1A1A1A',
    fontSize: 16,
    lineHeight: 22,
  },
});
