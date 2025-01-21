// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { router } from 'expo-router';

export default function HomeScreen() {
  const [signedIn, setSignedIn] = useState(false);
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startGithubOAuthFlow } = useOAuth({ strategy: 'oauth_github' });
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    try {
      await signOut()
      Linking.openURL(Linking.createURL('/'))
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onSignInWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuthFlow();
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        setSignedIn(true);
      }
    } catch (err) {
        console.error(JSON.stringify(err, null, 2))
    }
  };

    const onSignInWithGithub = async () => {
    try {
      const { createdSessionId, setActive } = await startGithubOAuthFlow();
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        setSignedIn(true);
      }
    } catch (err) {
        console.error(JSON.stringify(err, null, 2))
    }
  };

  useEffect(() => {
    if (isSignedIn) {
        router.push('/profilePage')
    }
  }, [isSignedIn])

return (
    <View style={styles.container}>
      {!isSignedIn && (
        <TouchableOpacity style={styles.button} onPress={onSignInWithGoogle}>
          <Text style={styles.buttonText}>Sign in with google</Text>
        </TouchableOpacity>
      )}

      {!isSignedIn && (
        <TouchableOpacity style={styles.button} onPress={onSignInWithGithub}>
          <Text style={styles.buttonText}>Sign in with github</Text>
        </TouchableOpacity>
      )}

      {isSignedIn && (
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
