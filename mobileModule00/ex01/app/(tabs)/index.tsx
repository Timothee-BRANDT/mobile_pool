import { Image, StyleSheet, Platform, View, Button } from 'react-native';
import { useState } from 'react';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
    const [text, setText] = useState('Foo Bar');
    const clicked =  () => {
        setText((prevText) => (prevText === 'Foo Bar' ? 'Hello World!' : 'Foo Bar'));
    }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{text}</ThemedText>
      <Button title="Try me" onPress={clicked}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
});
