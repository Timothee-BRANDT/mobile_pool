import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import HappyIcon from './HappyIcon';
import UnhappyIcon from './UnhappyIcon';
import NeutralIcon from './NeutralIcon';

import { diaryType } from './profilePage';

type ExtendedDiary = diaryType & { id: string };

type Props = {
  diary: ExtendedDiary;
  onPress: () => void;
};

export default function DiaryItem({ diary, onPress }: Props) {
    const { date, icon, text, title } = diary;

    function formatIsoToDdMmYyyy(isoString: string): string {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
}

  const renderIcon = () => {
    switch (icon) {
      case 'happy':
        return <HappyIcon />;
      case 'unhappy':
        return <UnhappyIcon />;
      case 'neutral':
        return <NeutralIcon />;
      default:
        return <NeutralIcon />;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.dateSection}>
        <Text style={styles.dateText}>{formatIsoToDdMmYyyy(date)}</Text>
      </View>

      <View style={styles.iconSection}>{renderIcon()}</View>

      <View style={styles.textSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateSection: {
    width: 80,
    alignItems: 'center',
  },
  dateText: {
    fontWeight: 'bold',
  },
  iconSection: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
  },
});
