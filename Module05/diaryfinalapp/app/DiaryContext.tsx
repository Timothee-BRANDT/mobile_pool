import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { diaryType } from './profilePage';
import { useUser } from '@clerk/clerk-react';

interface DiaryContextType {
  diarys: (diaryType & { id: string })[];
  fetchDiaries: () => Promise<void>;
  deleteDiary: (diaryId: string) => Promise<void>;
  addDiary: (newDiary: Omit<diaryType, 'usermail'>) => Promise<void>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diarys, setDiarys] = useState<(diaryType & { id: string })[]>([]);
  const { user } = useUser();

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

  const fetchDiaries = useCallback(async () => {
    const diaryEntries = await getAllDiarys();
    setDiarys(diaryEntries);
  }, []);

  const deleteDiary = async (diaryId: string) => {
    try {
      await deleteDoc(doc(db, 'users', diaryId));
      await fetchDiaries(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting diary: ', error);
    }
  };

  const addDiary = async (newDiary: Omit<diaryType, 'usermail'>) => {
    try {
      await addDoc(collection(db, 'users'), {
        ...newDiary,
        usermail: user?.primaryEmailAddress?.emailAddress || 'No user mail found',
      });
      await fetchDiaries(); // Refresh the list after adding
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const value: DiaryContextType = {
    diarys,
    fetchDiaries,
    deleteDiary,
    addDiary,
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
};
