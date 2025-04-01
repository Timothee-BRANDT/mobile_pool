import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { Stack } from 'expo-router';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import DiaryItem from './DiaryItem';
import HappyIcon from './HappyIcon';
import UnhappyIcon from './UnhappyIcon';
import NeutralIcon from './NeutralIcon';

export interface diaryType {
  date: string;
  icon: string;
  text: string;
  title: string;
  usermail: string;
}

function formatIsoToDdMmYyyy(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'happy':
        return <HappyIcon />;
      case 'unhappy':
        return <UnhappyIcon />;
      default:
        return <NeutralIcon />;
    }
  };


export default function ProfilePage() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  // [{id : {diaryType}}] array of map
  const [diarys, setDiarys] = useState<(diaryType & { id: string })[]>([]);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [newDiaryTitle, setNewDiaryTitle] = useState('');
  const [newDiaryText, setNewDiaryText] = useState('');
  const [newDiaryIcon, setNewDiaryIcon] = useState('happy');

  const [selectedDiary, setSelectedDiary] = useState<(diaryType & { id: string }) | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      Linking.openURL(Linking.createURL('/'));
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const getAllDiarys = async (): Promise<(diaryType & { id: string })[]> => {
    try {
      const results: (diaryType & { id: string })[] = [];
      const data = await getDocs(collection(db, 'users'));
      data.forEach((docSnap) => {
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

  const handleAddDiary = async () => {
    try {
      await addDoc(collection(db, 'users'), {
        date: new Date().toISOString(),
        icon: newDiaryIcon,
        text: newDiaryText,
        title: newDiaryTitle,
        usermail: 'mail@example.com',
      });
      const diaryEntries = await getAllDiarys();
      setDiarys(diaryEntries);
      setNewDiaryTitle('');
      setNewDiaryText('');
      setNewDiaryIcon('happy');
      setModalVisible(false);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const handleDeleteDiary = async (diaryId: string) => {
    try {
      await deleteDoc(doc(db, 'users', diaryId));
      const diaryEntries = await getAllDiarys();
      setDiarys(diaryEntries);
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
    if (firstLoad) {
      fetchDiaries();
      setFirstLoad(false);
    }
  }, [firstLoad, fetchDiaries]);

  const handlePressDiary = (diary: (diaryType & { id: string })) => {
    setSelectedDiary(diary);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'DiaryApp' }} />
      <View style={styles.container}>
        {isSignedIn && (
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={diarys}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryItem diary={item} onPress={() => handlePressDiary(item)} />
          )}
        />

        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Add diary</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add a new diary</Text>

              <TextInput
                style={styles.input}
                placeholder="Title"
                value={newDiaryTitle}
                onChangeText={setNewDiaryTitle}
              />

              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Write your diary..."
                value={newDiaryText}
                onChangeText={setNewDiaryText}
                multiline
              />

              <Text style={styles.label}>Mood:</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[styles.moodOption, newDiaryIcon === 'happy' && styles.moodSelected]}
                  onPress={() => setNewDiaryIcon('happy')}
                >
                  <Text>Happy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.moodOption, newDiaryIcon === 'neutral' && styles.moodSelected]}
                  onPress={() => setNewDiaryIcon('neutral')}
                >
                  <Text>Neutral</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.moodOption, newDiaryIcon === 'unhappy' && styles.moodSelected]}
                  onPress={() => setNewDiaryIcon('unhappy')}
                >
                  <Text>Unhappy</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#f66' }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#6f6' }]}
                  onPress={handleAddDiary}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
                  {renderIcon(selectedDiary.icon)}
                  <Text style={styles.label}>
                    Date: {formatIsoToDdMmYyyy(selectedDiary.date)}
                  </Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#ccc' }]}
                      onPress={() => setSelectedDiary(null)}
                    >
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#f66' }]}
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
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
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  moodOption: {
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
  },
  moodSelected: {
    backgroundColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
