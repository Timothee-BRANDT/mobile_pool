import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, Alert, FlatList, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Appbar, IconButton, Searchbar, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import axios from 'axios';

export type viewProps = {
    searchQuery: string,
    coordinates: string | null,
    weatherData?: any,
    city: string,
    country: string,
    region: string,
    lat: number,
    lon: number,
}

function CurrentlyScreen({ city, region, country, lat, lon }: viewProps) {
    const [weatherData, setWeatherData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeatherData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                setWeatherData(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des données météo :', err);
                setError('Unable to fetch weather data');
            } finally {
                setLoading(false);
            }
        };

        if (lat && lon) {
            fetchWeatherData();
        }
    }, [lat, lon]);

    return (
        <View style={styles.container}>
            <Text>Currently</Text>
            {loading && <Text>Loading weather data...</Text>}
            <Text>City : {city}</Text>
            <Text>Country: {country}</Text>
            <Text>Region: {region}</Text>
            {error && <Text>{error}</Text>}
        </View>
    );
}

function TodayScreen({ city, region, country, lat, lon }: viewProps) {
    const [weatherData, setWeatherData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeatherData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                setWeatherData(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des données météo :', err);
                setError('Unable to fetch weather data');
            } finally {
                setLoading(false);
            }
        };

        if (lat && lon) {
            fetchWeatherData();
        }
    }, [lat, lon]);

    return (
        <View style={styles.container}>
            <Text>Today</Text>
            {loading && <Text>Loading weather data...</Text>}
            <Text>City : {city}</Text>
            <Text>Country: {country}</Text>
            <Text>Region: {region}</Text>
            {error && <Text>{error}</Text>}
        </View>
    );
}

function WeeklyScreen({ city, region, country, lat, lon }: viewProps) {
    const [weatherData, setWeatherData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeatherData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                setWeatherData(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des données météo :', err);
                setError('Unable to fetch weather data');
            } finally {
                setLoading(false);
            }
        };

        if (lat && lon) {
            fetchWeatherData();
        }
    }, [lat, lon]);

    return (
        <View style={styles.container}>
            <Text>Weekly</Text>
            {loading && <Text>Loading weather data...</Text>}
            <Text>City : {city}</Text>
            <Text>Country: {country}</Text>
            <Text>Region: {region}</Text>
            {error && <Text>{error}</Text>}
        </View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const layout = useWindowDimensions();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [coordinates, setCoordinates] = useState<string | null>(null);
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [index, setIndex] = useState(0);
    const [lat, setLat] = useState(0);
    const [lon, setLon] = useState(0);
    const [routes] = useState([
        { key: 'currently', title: 'Currently', icon: 'cloud' },
        { key: 'today', title: 'Today', icon: 'today' },
        { key: 'weekly', title: 'Weekly', icon: 'calendar' },
    ]);

    // Search list results (If search for Paris, return a list of results for Paris)
    const fetchGeocodingSuggestions = async (query: string) => {
        try {
            const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${query}`);
            // console.log('*************\n', response.data.results);
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
                    setLat(lat);
                    setLon(lon);
                    setRegion(result.admin1);
                    setCountry(result.country);
                    setCity(searchQuery);
                    setCoordinates(`${lat}, ${lon}`);
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
        setLat(city.lat);
        setLon(city.lon);
        setCity(city.city);
        setCountry(city.country);
        setRegion(city.region);
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
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;
        setLat(latitude);
        setLon(longitude);
        setCoordinates(`${latitude}, ${longitude}`);
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
                headers: {
                    'User-Agent': 'ex02/1.0 (brandt.timothee@gmail.com)',
                },
            });
            if (response.data && response.data.address) {
                setCountry(response.data.address.country);
                setCity(response.data.address.city);
                setRegion(response.data.address.state);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération de la ville :", err);
        }
    };

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'currently':
                return <CurrentlyScreen searchQuery={searchQuery} coordinates={coordinates} city={city}
                    country={country} region={region} lat={lat} lon={lon} />;
            case 'today':
                return <TodayScreen searchQuery={searchQuery} coordinates={coordinates} city={city}
                    country={country} region={region} lat={lat} lon={lon} />;
            case 'weekly':
                return <WeeklyScreen searchQuery={searchQuery} coordinates={coordinates} city={city}
                    country={country} region={region} lat={lat} lon={lon} />;
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
