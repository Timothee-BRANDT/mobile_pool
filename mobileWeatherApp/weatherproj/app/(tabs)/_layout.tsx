import React, { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'; // Utiliser SceneMap pour gérer les scènes
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Simuler tes composants Home et Explore
function HomeScreen() {
    return (
        <View>
            <Text>HOME</Text>
        </View>
    );
}

function ExploreScreen() {
    return (
        <View>
            <Text>EXPLORE</Text>
        </View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'home', title: 'Home' },
        { key: 'explore', title: 'Explore' },
    ]);

    const renderScene = SceneMap({
        home: HomeScreen,
        explore: ExploreScreen,
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
        />
      )}
      tabBarPosition="bottom"
    />
  );
}
