import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { dbNote } from '../services/firebasenote'; // ✅ Use your new Notes Firebase

type CellValue = string;
type RowData = CellValue[];

type RowType = {
  rowIndex: number;
  cells: string[];
};

type NoteType = {
  id: string;
  rows: RowType[];
  timestamp?: any;
};

export default function NotesTab() {
  const [tableData, setTableData] = useState<RowData[]>([
    ['დრო', 'სახელი', 'ადგილი', 'სამუშაო','სამუშაოს რაოდენობა'],
    ['', '', '', ''],
    ['', '', '', ''],
  ]);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  // Load all saved notes from Firestore
  useEffect(() => {
    const q = query(collection(dbNote, 'notes'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as NoteType))
      );
    });
    return () => unsubscribe();
  }, []);

  // Add a new row
  const addRow = () => {
    const newRow = new Array(tableData[0].length).fill('');
    setTableData([...tableData, newRow]);
  };

  // Add a new column
  const addColumn = () => {
    const newData = tableData.map((row, index) => {
      if (index === 0) {
        return [...row, `Column ${row.length + 1}`];
      }
      return [...row, ''];
    });
    setTableData(newData);
  };

  // Update cell value
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  // Delete a row
  const deleteRow = (rowIndex: number) => {
    if (tableData.length <= 2) {
      Alert.alert('Error', 'Must have at least header and one data row');
      return;
    }
    const newData = tableData.filter((_, index) => index !== rowIndex);
    setTableData(newData);
  };

  // Save current note to Firestore
  const saveNote = async () => {
    try {
      // Convert 2D array to Firestore-friendly format (array of objects)
      const rows = tableData.map((row, index) => ({
        rowIndex: index,
        cells: row, // This is a simple 1D array, which Firestore supports
      }));

      if (currentNoteId) {
        // Update existing note
        await updateDoc(doc(dbNote, 'notes', currentNoteId), {
          rows: rows,
          timestamp: serverTimestamp(),
        });
        Alert.alert('Success ✅', 'Note updated successfully!');
      } else {
        // Create new note
        const docRef = await addDoc(collection(dbNote, 'notes'), {
          rows: rows,
          timestamp: serverTimestamp(),
        });
        setCurrentNoteId(docRef.id);
        Alert.alert('Success ✅', 'Note saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving note:', error);
      Alert.alert('Error ❌', `Failed to save: ${error.message}`);
    }
  };

  // Load a note
  const loadNote = (note: NoteType) => {
    // Convert from Firestore format back to 2D array
    const data = note.rows
      .sort((a, b) => a.rowIndex - b.rowIndex)
      .map((row) => row.cells);
    setTableData(data);
    setCurrentNoteId(note.id);
    Alert.alert('Loaded ✅', 'Note loaded successfully!');
  };

  // Delete a note
  const deleteNote = async (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(dbNote, 'notes', noteId));
            if (currentNoteId === noteId) {
              setCurrentNoteId(null);
            }
            Alert.alert('Deleted ✅', 'Note deleted successfully!');
          } catch (error: any) {
            Alert.alert('Error ❌', `Failed to delete: ${error.message}`);
          }
        },
      },
    ]);
  };

  // Create new note (clear current)
  const createNewNote = () => {
    Alert.alert('New Note', 'Create a new note? Unsaved changes will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: () => {
          setTableData([
            ['დრო', 'სახელი', 'ადგილი', 'სამუშაო','სამუშაოს ოდენობა'],
            ['', '', '', ''],
            ['', '', '', ''],
          ]);
          setCurrentNoteId(null);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📝 Excel-Style Notes</Text>
          <TouchableOpacity onPress={createNewNote} style={styles.newButton}>
            <Text style={styles.newButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Table Editor */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.tableContainer}
        >
          <View>
            <ScrollView showsVerticalScrollIndicator={true}>
              {tableData.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {/* Row number */}
                  <View style={styles.rowNumber}>
                    <Text style={styles.rowNumberText}>{rowIndex + 1}</Text>
                    {rowIndex > 0 && (
                      <TouchableOpacity
                        onPress={() => deleteRow(rowIndex)}
                        style={styles.deleteRowButton}
                      >
                        <Text style={styles.deleteRowText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Cells */}
                  {row.map((cell, colIndex) => (
                    <TextInput
                      key={`${rowIndex}-${colIndex}`}
                      style={[
                        styles.cell,
                        rowIndex === 0 && styles.headerCell,
                      ]}
                      value={cell}
                      onChangeText={(text) =>
                        updateCell(rowIndex, colIndex, text)
                      }
                      placeholder={rowIndex === 0 ? 'Header' : 'Data'}
                      placeholderTextColor="#999"
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={addRow} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>+ Row</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={addColumn} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>+ Column</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={saveNote} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>💾 Save</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Notes List */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>📂 Saved Notes ({notes.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <TouchableOpacity
                  onPress={() => loadNote(note)}
                  style={[
                    styles.noteCardContent,
                    currentNoteId === note.id && styles.noteCardActive,
                  ]}
                >
                  <Text style={styles.noteCardTitle}>
                    {note.rows[0]?.cells[0] || 'Untitled'}
                  </Text>
                  <Text style={styles.noteCardInfo}>
                    {note.rows.length} rows × {note.rows[0]?.cells.length || 0} cols
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteNote(note.id)}
                  style={styles.deleteNoteButton}
                >
                  <Text style={styles.deleteNoteText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  newButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00c853',
    borderRadius: 6,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rowNumber: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    flexDirection: 'row',
  },
  rowNumberText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  deleteRowButton: {
    marginLeft: 4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteRowText: {
    fontSize: 20,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  cell: {
    width: 150,
    height: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    fontSize: 14,
    color: '#333',
  },
  headerCell: {
    backgroundColor: '#e3f2fd',
    fontWeight: '600',
    color: '#1976d2',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#2196f3',
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#00c853',
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noteCard: {
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  noteCardContent: {
    padding: 12,
    minWidth: 120,
  },
  noteCardActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  noteCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noteCardInfo: {
    fontSize: 12,
    color: '#666',
  },
  deleteNoteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteNoteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});