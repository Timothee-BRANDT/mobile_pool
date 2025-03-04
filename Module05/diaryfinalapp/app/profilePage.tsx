import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { Stack } from 'expo-router';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import DiaryItem from './DiaryItem';

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

export default function ProfilePage() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  // Store diaries with an extra id for deletion
  const [diarys, setDiarys] = useState<(diaryType & { id: string })[]>([]);
  const [firstLoad, setFirstLoad] = useState(true);

  // Modal states for "Add diary"
  const [modalVisible, setModalVisible] = useState(false);
  const [newDiaryTitle, setNewDiaryTitle] = useState('');
  const [newDiaryText, setNewDiaryText] = useState('');
  const [newDiaryIcon, setNewDiaryIcon] = useState('happy');

  // Modal for viewing/deleting a selected diary
  const [selectedDiary, setSelectedDiary] = useState<(diaryType & { id: string }) | null>(null);

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      Linking.openURL(Linking.createURL('/'));
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Fetch diaries from Firestore
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

  // Add a diary
  const handleAddDiary = async () => {
    try {
      await addDoc(collection(db, 'users'), {
        date: new Date().toISOString(),
        icon: newDiaryIcon,
        text: newDiaryText,
        title: newDiaryTitle,
        usermail: 'mail@example.com',
      });
      // Refresh
      const updated = await getAllDiarys();
      setDiarys(updated);

      // Reset & close modal
      setNewDiaryTitle('');
      setNewDiaryText('');
      setNewDiaryIcon('happy');
      setModalVisible(false);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  // Delete a diary
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

  // Fetch diaries once on first load
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

  // Called when user taps a diary item in the FlatList
  const handlePressDiary = (diary: (diaryType & { id: string })) => {
    setSelectedDiary(diary);
  };

  // --------------------------------------
  //           PROFILE INFO
  // --------------------------------------
  // 1) The user email from diaries (assuming they're all the same user)
  const userEmail = diarys.length > 0 ? diarys[0].usermail : 'No user mail found';

  // 2) Last 2 diaries by date, newest first
  const sortedByDate = [...diarys].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const lastTwo = sortedByDate.slice(0, 2);

  // 3) Total number of diaries
  const totalEntries = diarys.length;

  // 4) Feelings usage
  const happyCount = diarys.filter(d => d.icon === 'happy').length;
  const neutralCount = diarys.filter(d => d.icon === 'neutral').length;
  const unhappyCount = diarys.filter(d => d.icon === 'unhappy').length;
  const happyPercent = totalEntries > 0 ? ((happyCount / totalEntries) * 100).toFixed(1) : '0';
  const neutralPercent = totalEntries > 0 ? ((neutralCount / totalEntries) * 100).toFixed(1) : '0';
  const unhappyPercent = totalEntries > 0 ? ((unhappyCount / totalEntries) * 100).toFixed(1) : '0';

  return (
    <>
      {/* Expo-router header */}
      <Stack.Screen options={{ title: 'Profile' }} />

      {/* Main container */}
      <View style={styles.container}>
        {/* A scrollable area for the content if it grows */}
        <ScrollView contentContainerStyle={styles.contentWrapper}>
          {/* Title & Sign-out */}
          {isSignedIn && (
            <TouchableOpacity style={styles.buttonSignOut} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
          )}

          {/* Profile Info Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>User Email</Text>
            <Text style={styles.sectionValue}>{userEmail}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Total Entries</Text>
            <Text style={styles.sectionValue}>{totalEntries}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Last 2 Entries</Text>
                      <FlatList
            data={diarys}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DiaryItem diary={item} onPress={() => handlePressDiary(item)} />
            )}
            // To ensure the FlatList grows only as needed inside the ScrollView
            scrollEnabled={false} // Because we have a parent ScrollView
          />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Feeling Usage</Text>
            <Text style={styles.sectionValue}>Happy: {happyPercent}%</Text>
            <Text style={styles.sectionValue}>Neutral: {neutralPercent}%</Text>
            <Text style={styles.sectionValue}>Unhappy: {unhappyPercent}%</Text>
          </View>

          {/* Button to open modal and add diary */}
          <TouchableOpacity style={styles.buttonAdd} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add diary</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* -------------- Modal: Add Diary -------------- */}
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
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
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
                style={[styles.buttonModal, { backgroundColor: '#f66' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.buttonModal, { backgroundColor: '#6f6' }]}
                onPress={handleAddDiary}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* -------------- Modal: View Selected Diary -------------- */}
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

// -------------------------------------
//               STYLES
// -------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7', // Light background
  },
  contentWrapper: {
    padding: 16,
    paddingBottom: 32,
  },
  mainTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 16,
    color: '#333',
  },

  // Section
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  sectionValue: {
    fontSize: 14,
    color: '#555',
  },
  entryItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  // Button styling
  buttonSignOut: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffcccb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonAdd: {
    backgroundColor: '#98c379',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginTop: 16,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Modal
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
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    color: '#333',
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
  },
  buttonModal: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
});
