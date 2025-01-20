import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, Alert, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground, Image } from 'react-native';
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
    error: string,
}

export type currentWeather = {
    interval: number,
    is_day: number,
    temperature: number,
    time: string,
    weathercode: number,
    winddirection: number,
    windspeed: number,
}

export type weatherData = {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
};

export type weatherDataWeekly = {
    time: string[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    weather_code: number[];
};


function CurrentlyScreen({ city, region, country, lat, lon, error }: viewProps) {
    const [weatherDescription, setWeatherDescription] = useState<string>('');
    const [currentWeather, setCurrentWeather] = useState<currentWeather | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorWeather, setErrorWeather] = useState<string | null>(null);

    const sunImg = 'https://cdn-icons-png.flaticon.com/512/2698/2698240.png';
    const cloudImg = 'https://cdn-icons-png.flaticon.com/512/4150/4150897.png';
    const rainImg = 'https://cdn-icons-png.flaticon.com/512/704/704730.png';

    useEffect(() => {
        console.log(city)
        const fetchWeatherData = async () => {
            try {
                const response = await axios.get(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                );
                setCurrentWeather(response.data.current_weather);
                const description = getWeatherDescription(response.data.current_weather.weathercode);
                setWeatherDescription(description);
            } catch (err) {
                setErrorWeather('Unable to fetch weather data');
            } finally {
                setLoading(false);
            }
        };

        if (lat && lon) {
            fetchWeatherData();
        }
    }, [lat, lon]);

    return (
        <View style={styles.mainContainer}>
            {city && region && country && <View style={styles.header}>
                <Text style={styles.headerText}>{city}</Text>
                <Text style={styles.subHeaderText}>{region}</Text>
                <Text style={styles.subHeaderText}>{country}</Text>
            </View>}

            <View style={styles.weatherInfoContainer}>
                {loading ? (
                    <Text>Hello little Sun ! ☀️</Text>
                )
                : errorWeather ? (
                    <Text style={styles.weatherText}>salut mec</Text>
                ) : (
                    <>
                        <Image
                            source={{
                                uri:
                                    currentWeather?.weathercode === 0
                                        ? sunImg
                                        : currentWeather?.weathercode === 1 ||
                                            currentWeather?.weathercode === 2 ||
                                            currentWeather?.weathercode === 3
                                            ? cloudImg
                                            : rainImg,
                            }}
                            style={styles.weatherIcon}
                        />
                        <Text style={styles.weatherText}>
                            Temperature: {currentWeather?.temperature} °C
                        </Text>
                        <Text style={styles.weatherText}>
                            Weather description: {weatherDescription}
                        </Text>
                        <Text style={styles.weatherText}>
                            Wind speed: {currentWeather?.windspeed} km/h
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
}

function TodayScreen({ city, region, country, lat, lon, error }: viewProps) {
    const [weatherData, setWeatherData] = useState<weatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorWeather, setErrorWeather] = useState<string | null>(null);

    useEffect(() => {
        const today = new Date();
        const start = today.toISOString().split("T")[0];
        const end = start;

        const fetchWeatherData = async () => {
            try {
                const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
                    params: {
                        latitude: lat,
                        longitude: lon,
                        hourly: "temperature_2m,wind_speed_10m,weather_code",
                        start_date: start,
                        end_date: end
                    }
                });

                const { time, temperature_2m, wind_speed_10m } = response.data.hourly;
                setWeatherData({ time, temperature_2m, wind_speed_10m });
            } catch (err) {
                setErrorWeather('Unable to fetch weather data');
            } finally {
                setLoading(false);
            }
        };

        if (lat && lon) {
            fetchWeatherData();
        }
    }, [lat, lon]);

    const renderWeatherItem = ({ item, index }: { item: string; index: number }) => (
        <View style={styles.weatherRow}>
            <Text style={styles.weatherText}>{item.split("T")[1].slice(0, 5)}</Text>
            <Text style={styles.weatherText}>{weatherData?.temperature_2m[index]}°C</Text>
            <Text style={styles.weatherText}>{weatherData?.wind_speed_10m[index]} km/h</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>{city}</Text>
            <Text style={styles.subHeaderText}>{region}</Text>
            <Text style={styles.subHeaderText}>{country}</Text>

            {loading ? (
                <Text>Hello little Sun ! ☀️</Text>
            ) : error ? (
                <Text>{error}</Text>
            ) : errorWeather ? (
                <Text>{errorWeather}</Text>
            ) : (
                <FlatList
                    data={weatherData?.time}
                    renderItem={renderWeatherItem}
                    keyExtractor={(item) => item}
                    ListHeaderComponent={() => (
                        <View style={styles.weatherRow}>
                            <Text style={styles.weatherText}>Time</Text>
                            <Text style={styles.weatherText}>Temp</Text>
                            <Text style={styles.weatherText}>Wind</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

function WeeklyScreen({ city, region, country, lat, lon, error }: viewProps) {
    const [weatherDataWeekly, setWeatherDataWeekly] = useState<weatherDataWeekly | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorWeather, setErrorWeather] = useState<string | null>(null);

    useEffect(() => {
        const today = new Date();
        const start = today.toISOString().split("T")[0];
        const end = start;

        const fetchWeatherData = async () => {
            try {
                const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
                    params: {
                        latitude: lat,
                        longitude: lon,
                        daily: "temperature_2m_max,temperature_2m_min,weather_code,"
                    }
                });
                const { time, temperature_2m_min, temperature_2m_max, weather_code } = response.data.daily;
                setWeatherDataWeekly({ time, temperature_2m_min, temperature_2m_max, weather_code });

            } catch (err) {
                setErrorWeather('Unable to fetch weather data');
            } finally {
                setLoading(false);
            }
        };

        if (lat && lon) {
            fetchWeatherData();
        }
    }, [lat, lon]);

    const renderWeatherItem = ({ item, index }: { item: string; index: number }) => (
        <View style={styles.weatherRow}>
            <Text style={styles.weatherText}>{weatherDataWeekly?.time[index]}</Text>
            <Text style={styles.weatherText}>{weatherDataWeekly?.temperature_2m_min[index]}°C</Text>
            <Text style={styles.weatherText}>{weatherDataWeekly?.temperature_2m_max[index]}°C</Text>
            <Text style={styles.weatherText}>{getWeatherDescription(weatherDataWeekly?.weather_code[index])}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>{city}</Text>
            <Text style={styles.subHeaderText}>{region}</Text>
            <Text style={styles.subHeaderText}>{country}</Text>

            {loading ? (
                <Text>Hello little Sun ! ☀️</Text>
            ) : error ? (
                <Text>{error}</Text>
            ) : errorWeather ? (
                <Text>{errorWeather}</Text>
            ) : (
                <FlatList
                    data={weatherDataWeekly?.time}
                    renderItem={renderWeatherItem}
                    keyExtractor={(item) => item}
                    ListHeaderComponent={() => (
                        <View style={styles.weatherRow}>
                            <Text style={styles.weatherText}>Date</Text>
                            <Text style={styles.weatherText}>Temp min</Text>
                            <Text style={styles.weatherText}>Temp max</Text>
                            <Text style={styles.weatherText}>Description</Text>
                        </View>
                    )}
                />
            )}
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
    const [error, setError] = useState('');
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
            const results = response.data?.results?.map((item: any) => ({
                city: item.name,
                country: item.country,
                region: item.admin1,
                lat: item.latitude,
                lon: item.longitude,
            }));
            if (results && results.length > 0) {
                setSuggestions(results.slice(0, 5));
            }
        } catch (error) {
            setError('Erreur lors de la récupération des données de géocodage');
            setRegion('');
            setCountry('');
            setCity('');
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
                    setError('')
                } else {
                    setRegion('');
                    setCountry('');
                    setCity('');
                    setError("Nous n'avons pas trouvé cette ville.");
                }
            } catch (error) {
                setRegion('');
                setCountry('');
                setCity('');
                setError("Impossible de récupérer la localisation pour cette ville.");
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
        setError('');
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
                    country={country} region={region} lat={lat} lon={lon} error={error} />;
            case 'today':
                return <TodayScreen searchQuery={searchQuery} coordinates={coordinates} city={city}
                    country={country} region={region} lat={lat} lon={lon} error={error} />;
            case 'weekly':
                return <WeeklyScreen searchQuery={searchQuery} coordinates={coordinates} city={city}
                    country={country} region={region} lat={lat} lon={lon} error={error} />;
            default:
                return null;
        }
    };

    const image = { uri: 'https://t4.ftcdn.net/jpg/08/82/20/75/360_F_882207522_8LeNbuFN3MNRThdopJdJIB4dp0YWHfWA.jpg' };

    return (
        <ImageBackground
            source={image}
            style={styles.background}
        >
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

            <View style={styles.searchResultsContainer}>
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
            </View>



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
        </ImageBackground>
    );
}

function getWeatherDescription(code: number | undefined): string {
    if (code === undefined) {
        return "Unknown weather code";
    }
    const weatherCodes: { [key: string]: string[] } = {
        "0": ["Clear sky"],
        "1,2,3": ["Mainly clear", "Partly cloudy", "Overcast"],
        "45,48": ["Fog", "Depositing rime fog"],
        "51,53,55": ["Drizzle: light", "Drizzle: moderate", "Drizzle: dense"],
        "56,57": ["Freezing drizzle: light", "Freezing drizzle: dense"],
        "61,63,65": ["Rain: slight", "Rain: moderate", "Rain: heavy"],
        "66,67": ["Freezing rain: light", "Freezing rain: heavy"],
        "71,73,75": ["Snow fall: slight", "Snow fall: moderate", "Snow fall: heavy"],
        "77": ["Snow grains"],
        "80,81,82": ["Rain showers: slight", "Rain showers: moderate", "Rain showers: violent"],
        "85,86": ["Snow showers: slight", "Snow showers: heavy"],
        "95": ["Thunderstorm: slight or moderate"],
        "96,99": ["Thunderstorm with slight hail", "Thunderstorm with heavy hail"]
    };

    for (const key in weatherCodes) {
        const codes = key.split(",").map(Number);
        const index = codes.indexOf(code);
        if (index !== -1) {
            return weatherCodes[key][index];
        }
    }

    return "Unknown weather code";
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 80,
        left: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        zIndex: 3,
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    header: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#ddd',
    },
    weatherInfoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    weatherText: {
        fontSize: 16,
        color: '#fff',
    },
    weatherIcon: {
        width: 100,
        height: 100,
        marginTop: 15,
    },
    searchbar: {
        flex: 1,
        marginHorizontal: 10,
        marginBottom: 10,
    },
    appBar: {
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 10,
    },
    suggestionsList: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        position: 'absolute',
        top: 70,
        left: 10,
        right: 10,
        zIndex: 10,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});
