import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, Alert, FlatList, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Appbar, IconButton, Searchbar, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import axios from 'axios';

function CurrentlyScreen({ searchQuery, coordinates, weatherData }: { searchQuery: string, coordinates: string | null, weatherData: any }) {
    return (
        <View style={styles.container}>
            <Text>Currently</Text>
            <Text>{searchQuery}</Text>
            {coordinates && <Text>Coordinates: {coordinates}</Text>}
            {weatherData && (
                <>
                    <Text>Temperature: {weatherData.current_weather.temperature}°C</Text>
                    <Text>Wind Speed: {weatherData.current_weather.windspeed} km/h</Text>
                </>
            )}
        </View>
    );
}

function TodayScreen({ searchQuery, coordinates, weatherData }: { searchQuery: string, coordinates: string | null, weatherData: any }) {
    return (
        <View style={styles.container}>
            <Text>Today</Text>
            <Text>{searchQuery}</Text>
            {coordinates && <Text>Coordinates: {coordinates}</Text>}
            {weatherData && (
                <>
                    <Text>Temperature: {weatherData.current_weather.temperature}°C</Text>
                    <Text>Wind Speed: {weatherData.current_weather.windspeed} km/h</Text>
                </>
            )}
        </View>
    );
}

function WeeklyScreen({ searchQuery, coordinates, weatherData }: { searchQuery: string, coordinates: string | null, weatherData: any }) {
    return (
        <View style={styles.container}>
            <Text>Weekly</Text>
            <Text>{searchQuery}</Text>
            {coordinates && <Text>Coordinates: {coordinates}</Text>}
            {weatherData && (
                <>
                    <Text>Temperature: {weatherData.current_weather.temperature}°C</Text>
                    <Text>Wind Speed: {weatherData.current_weather.windspeed} km/h</Text>
                </>
            )}
        </View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const layout = useWindowDimensions();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [weatherData, setWeatherData] = useState<any | null>(null);
    const [coordinates, setCoordinates] = useState<string | null>(null);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'currently', title: 'Currently', icon: 'cloud' },
        { key: 'today', title: 'Today', icon: 'today' },
        { key: 'weekly', title: 'Weekly', icon: 'calendar' },
    ]);

    // Get Weather by passing the coordinates
    const fetchWeatherByCoordinates = async (lat: number, lon: number) => {
        try {
            const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            setWeatherData(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des données météo :", error);
        }
    };

    // Search list results
    const fetchGeocodingSuggestions = async (query: string) => {
        try {
            const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${query}`);
            console.log('*************\n', response.data.results);
            const results = response.data.results.map((item: any) => ({
                city: item.name,
                country: item.country,
                region: item.admin1,
                lat: item.latitude,
                lon: item.longitude,
            }));
            setSuggestions(results);
        } catch (error) {
            console.error("Erreur lors de la récupération des données de géocodage :", error);
        }
    };

    // Change the search input
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            fetchGeocodingSuggestions(query);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearchSubmit = async () => {
        if (searchQuery.length > 0) {
            try {
                const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}`);
                const result = response.data.results[0];
                if (result) {
                    const lat = result.latitude;
                    const lon = result.longitude;
                    setCoordinates(`${lat}, ${lon}`);
                    fetchWeatherByCoordinates(lat, lon);
                    setSuggestions([]);
                } else {
                    Alert.alert("Aucune ville trouvée", "Nous n'avons pas trouvé cette ville.");
                }
            } catch (error) {
                console.error("Erreur lors de la recherche :", error);
                Alert.alert("Erreur", "Impossible de récupérer la localisation pour cette ville.");
            }
        }
    };


    // Handle the selection in the suggestion list
    const handleCitySelect = (city: any) => {
        setSearchQuery(city.city);
        setCoordinates(`${city.lat}, ${city.lon}`);
        fetchWeatherByCoordinates(city.lat, city.lon);
        setSuggestions([]);
    };

    // GPS geolocalisation
    const handleGeolocationPress = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission refusée", "L'accès à la localisation a été refusé. Vous pouvez entrer une ville manuellement.");
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        setCoordinates(`${lat}, ${lon}`);
        fetchWeatherByCoordinates(lat, lon);
    };

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'currently':
                return <CurrentlyScreen searchQuery={searchQuery} coordinates={coordinates} weatherData={weatherData} />;
            case 'today':
                return <TodayScreen searchQuery={searchQuery} coordinates={coordinates} weatherData={weatherData} />;
            case 'weekly':
                return <WeeklyScreen searchQuery={searchQuery} coordinates={coordinates} weatherData={weatherData} />;
            default:
                return null;
        }
    };

    return (
        <>
            <Appbar.Header>
                <Searchbar
                    placeholder="Search location"
                    onChangeText={handleSearchChange}
                    onSubmitEditing={handleSearchSubmit}
                    value={searchQuery}
                    style={styles.searchbar}
                />
                <IconButton
                    icon="crosshairs-gps"
                    size={24}
                    onPress={handleGeolocationPress}
                />
            </Appbar.Header>

            <FlatList
                data={suggestions}
                keyExtractor={(item) => `${item.city}-${item.lat}-${item.lon}`}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleCitySelect(item)}>
                        <List.Item
                            title={item.city}
                            description={`${item.country}, ${item.region}`}
                        />
                    </TouchableOpacity>
                )}
            />


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
