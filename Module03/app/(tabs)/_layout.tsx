import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, Alert, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, ImageBackground, Image, ScrollView } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Appbar, IconButton, Searchbar, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import * as Location from 'expo-location';
import axios from 'axios';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

const sunImg = 'https://cdn-icons-png.flaticon.com/512/2698/2698240.png';
const cloudImg = 'https://cdn-icons-png.flaticon.com/512/4150/4150897.png';
const rainImg = 'https://cdn-icons-png.flaticon.com/512/704/704730.png';

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
    weather_code: number[];
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


    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const response = await axios.get(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                );
                setCurrentWeather(response.data.current_weather);
                const description = getWeatherDescription(response.data.current_weather.weathercode);
                setWeatherDescription(description);
                setErrorWeather('');
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
                    {errorWeather && <Text style={styles.weatherText}>
                             {errorWeather}
                    </Text>}
                    {!loading && !errorWeather && <>
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
                            {weatherDescription}
                        </Text>
                        <Text style={styles.weatherText}>
                            {currentWeather?.temperature} °C
                        </Text>
                        <Text style={styles.weatherText}>
                            Wind {currentWeather?.windspeed} km/h
                        </Text>
                    </>}
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

                const { time, temperature_2m, wind_speed_10m, weather_code } = response.data.hourly;
                setWeatherData({ time, temperature_2m, wind_speed_10m, weather_code });
                setErrorWeather('');
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

    const getFilteredLabels = () => {
        if (!weatherData) return [];
        return weatherData.time.map((t, i) => {
            if (i % 4 === 0) {
                return t.split("T")[1].slice(0, 5);
            } else {
                return "";
            }
        });
    };

    const renderWeatherItem = ({ item, index }: { item: string; index: number }) => {
        return (
        <View style={stylesTodayScreen.weatherItem}>
            <Text style={stylesTodayScreen.weatherTime}>{item.split("T")[1].slice(0, 5)}</Text>
            <Text style={stylesTodayScreen.weatherTemp}>{weatherData?.temperature_2m[index]}°C</Text>
            <Image
                source={{
                    uri:
                        weatherData?.weather_code[index] === 0
                            ? sunImg
                            : weatherData?.weather_code[index] === 1 ||
                                weatherData?.weather_code[index] === 2 ||
                                weatherData?.weather_code[index] === 3
                                ? cloudImg
                                : rainImg,
                }}
                style={stylesTodayScreen.weatherIcon}
            />
            <Text style={stylesTodayScreen.weatherWind}>{weatherData?.wind_speed_10m[index]} km/h</Text>
        </View>
        )
    };

    return (
        <View style={stylesTodayScreen.mainContainer}>
            <Text style={stylesTodayScreen.headerText}>{city}</Text>
            <Text style={stylesTodayScreen.subHeaderText}>{region}</Text>
            <Text style={stylesTodayScreen.subHeaderText}>{country}</Text>
            {errorWeather && <Text style={styles.weatherText}>
                             {errorWeather}
                    </Text>}
                {!loading && !errorWeather && <>
                    <Text style={stylesTodayScreen.chartTitle}>Today's Temperatures</Text>
                    <LineChart
                        data={{
                            // time
                            labels: getFilteredLabels(),
                            // temperatures
                            datasets: [
                                {
                                    data: weatherData?.temperature_2m || [],
                                },
                            ],
                        }}
                        width={screenWidth - 20}
                        height={220}
                        yAxisSuffix="°C"
                        chartConfig={{
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                        <FlatList
                            data={weatherData?.time}
                            renderItem={renderWeatherItem}
                            ListHeaderComponent={() => (
                                <View style={stylesTodayScreen.weatherRow}>
                                    <Text style={stylesTodayScreen.weatherHeaderText}>Time</Text>
                                    <Text style={stylesTodayScreen.weatherHeaderText}>Temp</Text>
                                    <Text style={stylesTodayScreen.weatherHeaderText}>Weather</Text>
                                    <Text style={stylesTodayScreen.weatherHeaderText}>Wind</Text>
                                </View>
                            )}
                        />
                </>}
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
                setErrorWeather('');

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

        const renderWeatherItem = ({ item, index }: { item: string; index: number }) => {
        return (
        <View style={stylesTodayScreen.weatherItem}>
            <Text style={stylesTodayScreen.weatherTime}>{weatherDataWeekly?.time[index]}</Text>
            <Text style={stylesTodayScreen.weatherTemp}>{weatherDataWeekly?.temperature_2m_min[index]}°C</Text>
            <Text style={stylesTodayScreen.weatherTemp}>{weatherDataWeekly?.temperature_2m_max[index]}°C</Text>
            <Image
                source={{
                    uri:
                        weatherDataWeekly?.weather_code[index] === 0
                            ? sunImg
                            : weatherDataWeekly?.weather_code[index] === 1 ||
                                weatherDataWeekly?.weather_code[index] === 2 ||
                                weatherDataWeekly?.weather_code[index] === 3
                                ? cloudImg
                                : rainImg,
                }}
                style={stylesTodayScreen.weatherIcon}
            />
        </View>
        )
    };

    return (
        <View style={stylesWeekly.container}>
            <Text style={stylesWeekly.headerText}>{city}</Text>
            <Text style={stylesWeekly.subHeaderText}>{region}</Text>
            <Text style={stylesWeekly.subHeaderText}>{country}</Text>

            {errorWeather && <Text style={styles.weatherText}>
                             {errorWeather}
                    </Text>}
                {!loading && !errorWeather && <>
                <Text style={stylesWeekly.chartTitle}>Weekly Temperatures</Text>
                <LineChart
                    data={{
                        labels: weatherDataWeekly?.time.map((date) => date.slice(5)),
                        datasets: [
                            {
                                data: weatherDataWeekly?.temperature_2m_min || [],
                                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                            {
                                data: weatherDataWeekly?.temperature_2m_max || [],
                                color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                        legend: ['Min Temp', 'Max Temp'],
                    }}
                    width={screenWidth - 20}
                    height={250}
                    yAxisSuffix="°C"
                    yAxisInterval={1}
                    chartConfig={{
                        backgroundGradientFrom: "#e8f1f8",
                        backgroundGradientTo: "#f3f4f6",
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: "#ffa726",
                        },
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />
                    <FlatList
                        data={weatherDataWeekly?.time}
                        renderItem={renderWeatherItem}
                        keyExtractor={(item) => item}
                        ListHeaderComponent={() => (
                            <View style={stylesTodayScreen.weatherRow}>
                                <Text style={stylesTodayScreen.weatherText}>Date</Text>
                                <Text style={stylesTodayScreen.weatherText}>Temp min</Text>
                                <Text style={stylesTodayScreen.weatherText}>Temp max</Text>
                                <Text style={stylesTodayScreen.weatherText}>Description</Text>
                            </View>
                        )}
                    />
                </>}
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
        { key: 'currently', title: 'Currentlyy', icon: 'cloud' },
        { key: 'today', title: 'Todayy', icon: 'today' },
        { key: 'weekly', title: 'Weeklyy', icon: 'calendar' },
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
                <Appbar.Header style={styles.header}>
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
                    style={styles.tabview}
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={(props) => (
                        <TabBar
                            {...props}
                            activeColor="red"
                            inactiveColor="black"
                            indicatorStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].tint }}
                            style={{ backgroundColor: 'transparent' }}
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
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    background: {
        flex: 1,
    },
    header: {
        backgroundColor: 'transparent',
        paddingVertical: 20,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
    },
    tabview: {
        backgroundColor: 'transparent',
    },
    headerText: {
        fontSize: 30,
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
        fontSize: 32,
        color: '#fff',
    },
    weatherIcon: {
        width: 100,
        height: 100,
        marginTop: 15,
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

const stylesTodayScreen = StyleSheet.create({
    weatherHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#f0f0f0",
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    weatherHeaderText: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    weatherItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    weatherTime: {
        fontSize: 14,
        flex: 1,
        textAlign: "center",
    },
    weatherTemp: {
        fontSize: 14,
        flex: 1,
        textAlign: "center",
        color: "#ff5733",
        fontWeight: "bold",
    },
    weatherIcon: {
        width: 40,
        height: 40,
        flex: 1,
        resizeMode: "contain",
        alignSelf: "center",
    },
    weatherWind: {
        fontSize: 14,
        flex: 1,
        textAlign: "center",
        color: "#008b8b",
    },
    mainContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: "transparent",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    subHeaderText: {
        fontSize: 18,
        textAlign: "center",
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    weatherRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    weatherText: {
        fontSize: 16,
    },
});

const stylesWeekly = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "transparent",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    subHeaderText: {
        fontSize: 18,
        textAlign: "center",
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    weatherRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    weatherText: {
        fontSize: 14,
        textAlign: "center",
        flex: 1,
    },
});
