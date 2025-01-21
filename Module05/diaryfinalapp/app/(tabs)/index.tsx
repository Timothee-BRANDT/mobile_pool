import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { router } from 'expo-router';
import ProfilePage from '../profilePage';

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startGithubOAuthFlow } = useOAuth({ strategy: 'oauth_github' });
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      Linking.openURL(Linking.createURL('/'));
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onSignInWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuthFlow();
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onSignInWithGithub = async () => {
    try {
      const { createdSessionId, setActive } = await startGithubOAuthFlow();
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  useEffect(() => {
  }, [isSignedIn]);

  return (
    <View style={styles.container}>
      {isSignedIn ? (
        <ProfilePage />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={onSignInWithGoogle}>
            <Text style={styles.buttonText}>Sign in with google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onSignInWithGithub}>
            <Text style={styles.buttonText}>Sign in with github</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginBottom: 40,
  },
  buttonText: {
    color: '#000',
  },
});
