import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Appbar, IconButton, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

function CurrentlyScreen({ searchQuery }: { searchQuery: string }) {
    return (
        <View style={styles.container}>
            <Text>Currently</Text>
            <Text>{searchQuery}</Text>
        </View>
    );
}

function TodayScreen({ searchQuery }: { searchQuery: string }) {
    return (
        <View style={styles.container}>
            <Text>Today</Text>
            <Text>{searchQuery}</Text>
        </View>
    );
}

function WeeklyScreen({ searchQuery }: { searchQuery: string }) {
    return (
        <View style={styles.container}>
            <Text>Weekly</Text>
            <Text>{searchQuery}</Text>
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

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'currently':
                return <CurrentlyScreen searchQuery={searchQuery} />;
            case 'today':
                return <TodayScreen searchQuery={searchQuery} />;
            case 'weekly':
                return <WeeklyScreen searchQuery={searchQuery} />;
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
                    onPress={() => setSearchQuery('Geolocalisation')}
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