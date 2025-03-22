import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { Stack } from 'expo-router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import DiaryItem from '../DiaryItem';
import { diaryType } from '../profilePage';

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
  const [diarys, setDiarys] = useState<(diaryType & { id: string })[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<(diaryType & { id: string }) | null>(null);

  const getAllDiarys = async (): Promise<(diaryType & { id: string })[]> => {
    try {
      const results: (diaryType & { id: string })[] = [];
      const snapshot = await getDocs(collection(db, 'users'));
      snapshot.forEach((docSnap) => {
        results.push({
          id: docSnap.id,
          ...(docSnap.data() as diaryType),
        });
      });
      return results;
    } catch (e) {
      console.error('Error reading document: ', e);
      return [];
    }
  };

  const handleDeleteDiary = async (diaryId: string) => {
    try {
      await deleteDoc(doc(db, 'users', diaryId));
      const updated = await getAllDiarys();
      setDiarys(updated);
      setSelectedDiary(null);
    } catch (error) {
      console.error('Error deleting diary: ', error);
    }
  };

  const fetchDiaries = useCallback(async () => {
    const diaryEntries = await getAllDiarys();
    setDiarys(diaryEntries);
  }, []);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const handleDayPress = (day: CalendarProps['onDayPress']) => {
    if (day && day.dateString) {
      setSelectedDate(day.dateString);
    }
  };

  const handlePressDiary = (diary: diaryType & { id: string }) => {
    setSelectedDiary(diary);
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

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
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
