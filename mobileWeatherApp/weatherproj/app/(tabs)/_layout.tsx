import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Icon from 'react-native-vector-icons/Ionicons';

function CurrentlyScreen() {
    return (
        <View style={styles.container}>
            <Text>Currently</Text>
        </View>
    );
}

function TodayScreen() {
    return (
        <View style={styles.container}>
            <Text>Today</Text>
        </View>
    );
}

function WeeklyScreen() {
    return (
        <View style={styles.container}>
            <Text>Weekly</Text>
        </View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'currently', title: 'Currently', icon: 'cloud' },
        { key: 'today', title: 'Today', icon: 'today' },
        { key: 'weekly', title: 'Weekly', icon: 'calendar' },
    ]);

    const renderScene = SceneMap({
        currently: CurrentlyScreen,
        today: TodayScreen,
        weekly: WeeklyScreen,
    });

    return (
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});