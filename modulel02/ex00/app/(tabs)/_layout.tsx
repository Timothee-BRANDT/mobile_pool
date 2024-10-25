import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, Alert } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Appbar, IconButton, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
// expo-location is native API that uses GPS phone
import * as Location from 'expo-location';

function CurrentlyScreen({ searchQuery, coordinates }: { searchQuery: string, coordinates: string | null }) {
    return (
        <View style={styles.container}>
            <Text>Currently</Text>
            <Text>{searchQuery}</Text>
            {coordinates && <Text>Coordinates: {coordinates}</Text>}
        </View>
    );
}

function TodayScreen({ searchQuery, coordinates }: { searchQuery: string, coordinates: string | null }) {
    return (
        <View style={styles.container}>
            <Text>Today</Text>
            <Text>{searchQuery}</Text>
            {coordinates && <Text>Coordinates: {coordinates}</Text>}
        </View>
    );
}

function WeeklyScreen({ searchQuery, coordinates }: { searchQuery: string, coordinates: string | null }) {
    return (
        <View style={styles.container}>
            <Text>Weekly</Text>
            <Text>{searchQuery}</Text>
            {coordinates && <Text>Coordinates: {coordinates}</Text>}
        </View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const layout = useWindowDimensions();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const onChangeSearch = (query: any) => setSearchQuery(query);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'currently', title: 'Currently', icon: 'cloud' },
        { key: 'today', title: 'Today', icon: 'today' },
        { key: 'weekly', title: 'Weekly', icon: 'calendar' },
    ]);

    const [coordinates, setCoordinates] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission denied", "Location access denied. You can enter a city manually.");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const coords = `${location.coords.latitude}, ${location.coords.longitude}`;
            setCoordinates(coords);
        })();
    }, []);

    const handleGeolocationPress = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission denied", "Location access denied. You can enter a city manually.");
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const coords = `${location.coords.latitude}, ${location.coords.longitude}`;
        setCoordinates(coords);
    };

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'currently':
                return <CurrentlyScreen searchQuery={searchQuery} coordinates={coordinates} />;
            case 'today':
                return <TodayScreen searchQuery={searchQuery} coordinates={coordinates} />;
            case 'weekly':
                return <WeeklyScreen searchQuery={searchQuery} coordinates={coordinates} />;
            default:
                return null;
        }
    };

    return (
        <>
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
                    onPress={handleGeolocationPress}
                />
            </Appbar.Header>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        activeColor={Colors[colorScheme ?? 'light'].tint}
                        inactiveColor="gray"
                        indicatorStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].tint }}
                        style={{ backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}
                        labelStyle={{ fontSize: 12 }}
                        renderIcon={({ route, focused, color }) => (
                            <Icon
                                name={route.icon}
                                size={24}
                                color={color}
                            />
                        )}
                    />
                )}
                tabBarPosition="bottom"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchbar: {
        flex: 1,
    },
});
