import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { Stack } from 'expo-router';
import DiaryItem from '../DiaryItem';
import { diaryType } from '../profilePage';
import { useDiary } from '../DiaryContext';
import { useAuth } from '@clerk/clerk-react';

function formatIsoToDdMmYyyy(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [selectedDiary, setSelectedDiary] = useState<(diaryType & { id: string }) | null>(null);
  const { diarys, deleteDiary } = useDiary();
  const { isSignedIn } = useAuth();

  const handleDayPress = (day: CalendarProps['onDayPress']) => {
    if (day && day.dateString) {
      setSelectedDate(day.dateString);
    }
  };

  const handlePressDiary = (diary: diaryType & { id: string }) => {
    setSelectedDiary(diary);
  };

  const handleDeleteDiary = async (diaryId: string) => {
    await deleteDiary(diaryId);
    setSelectedDiary(null);
  };

  const filteredDiarys = diarys.filter((diary) => {
    const diaryDate = new Date(diary.date);
    const selectedDateObj = new Date(selectedDate);
    return (
      diaryDate.getDate() === selectedDateObj.getDate() &&
      diaryDate.getMonth() === selectedDateObj.getMonth() &&
      diaryDate.getFullYear() === selectedDateObj.getFullYear()
    );
  });

  return isSignedIn ? (
    <>
      <Stack.Screen options={{ title: 'Agenda' }} />
      <View style={styles.container}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: 'lightblue' },
          }}
          current={selectedDate}
        />
        <View style={styles.listContainer}>
          {filteredDiarys.length > 0 ? (
            <FlatList
              data={filteredDiarys}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DiaryItem diary={item} onPress={() => handlePressDiary(item)} />
              )}
            />
          ) : (
            <Text style={styles.noEntriesText}>No entries for this date</Text>
          )}
        </View>
      </View>

      <Modal
        visible={!!selectedDiary}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDiary(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedDiary && (
              <>
                <Text style={styles.modalTitle}>Diary Details</Text>
                <Text style={styles.label}>Title: {selectedDiary.title}</Text>
                <Text style={styles.label}>Text: {selectedDiary.text}</Text>
                <Text style={styles.label}>Icon: {selectedDiary.icon}</Text>
                <Text style={styles.label}>
                  Date: {formatIsoToDdMmYyyy(selectedDiary.date)}
                </Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.buttonModal, { backgroundColor: '#ccc' }]}
                    onPress={() => setSelectedDiary(null)}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.buttonModal, { backgroundColor: '#f66' }]}
                    onPress={() => handleDeleteDiary(selectedDiary.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  ) : (
    <View style={styles.containerNotSigned}>
      <Text>You must sign in to access this page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  containerNotSigned: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  noEntriesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonModal: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
  },
});
