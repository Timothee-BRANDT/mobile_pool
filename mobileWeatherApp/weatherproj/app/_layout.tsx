import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Appbar, IconButton, Searchbar } from 'react-native-paper';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    const [searchQuery, setSearchQuery] = useState('');

    const onChangeSearch = (query: any) => setSearchQuery(query);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Appbar.Header>
                <Searchbar
                    placeholder="Search location"
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    style={styles.searchbar}
                />
                <IconButton
                    icon="crosshairs-gps"
                    size={24}
                    onPress={() => console.log('Geolocation button pressed')}
                />
            </Appbar.Header>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    searchbar: {
        flex: 1,
    },
});
