import { Image, StyleSheet, Platform, View, Button, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useState } from 'react';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Appbar } from 'react-native-paper';

export default function HomeScreen() {
    const [text, setText] = useState('Foo Bar');
    const { width, height } = useWindowDimensions();
    const isPortrait = height > width;
    const handleButtonPress = (value: any) => {
        console.log("Button pressed: ", value)
    };
return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content style={styles.header} title="Calculator" />
            </Appbar.Header>

            <View >
                <View style={styles.textField}>
                    <Text style={styles.text}>0</Text>
                </View>
                <View style={styles.textField}>
                    <Text style={styles.text}>0</Text>
                </View>
            </View>

            <View >
                {[
                    ['7', '8', '9', 'C', 'AC'],
                    ['4', '5', '6', '+', '-'],
                    ['1', '2', '3', 'x', '÷'],
                    ['0', '.', '00', '=', ''],
                ].map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((button, buttonIndex) => (
                            <TouchableOpacity
                                key={buttonIndex}
                                style={[
                                    styles.button,
                                    button === 'C' || button === 'AC'
                                        ? styles.specialButton
                                        : styles.defaultButton,
                                ]}
                                onPress={() => handleButtonPress(button)}
                            >
                                <Text style={styles.buttonText}>{button}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2c3e50',
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textField: {
        backgroundColor: '#34495e',
    },
    text: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'right',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    button: {
        flex: 1,
        margin: 5,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    defaultButton: {
        backgroundColor: '#95a5a6',
    },
    specialButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        fontSize: 15,
        color: '#fff',
   },
});
