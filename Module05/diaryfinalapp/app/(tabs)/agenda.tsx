import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-react';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function AgendaScreen() {
  const { isSignedIn } = useAuth();

  return isSignedIn ? (
    <View style={styles.container}>
      <Text>Agenda</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>Not signed in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
