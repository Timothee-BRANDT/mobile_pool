// app/index.tsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onSignInWithGoogle = async () => {
    try {
      // Lance le flux OAuth
      const { createdSessionId, setActive } = await startOAuthFlow();
      // S’il y a bien une session qui vient d’être créée,
      // on la rend “active”
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Erreur OAuth Clerk :', err);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={onSignInWithGoogle} />
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
