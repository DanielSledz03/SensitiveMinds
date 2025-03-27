// EditVisitScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import {
  TextInput,
  Checkbox,
  Text,
  Card,
  Divider,
  Switch,
  HelperText,
  Button,
  Portal,
  Dialog,
  Provider as PaperProvider,
  DefaultTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useDispatch} from 'react-redux';

import {Visit, updateVisit} from '../store/slices/visitsSlice';
import {useFetch} from '../utils/MyApi';

type ParamList = {
  EditVisit: {
    visitId: string;
    patientId: string;
  };
};

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    background: '#FFFFFF',
    text: '#000000',
    placeholder: '#333',
  },
};

const EditVisitScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'EditVisit'>>();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Hook do komunikacji z API
  // data -> odwzorowuje aktualnie pobraną wizytę (GET robi się automatycznie w useEffect w samym hooku)
  // loading -> czy trwa pobieranie/aktualizacja
  // error -> komunikat błędu, jeśli coś poszło nie tak
  // updateData -> metoda do wywołania PUT/POST/DELETE/PATCH
  const {
    data: existingVisit,
    loading,
    error,
    updateData,
  } = useFetch<Visit>(`/visits/${route.params.visitId}`);

  // Stany formularza
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const [consentGiven, setConsentGiven] = useState(false);
  const [pastMemory, setPastMemory] = useState(false);
  const [arithmetic, setArithmetic] = useState(false);
  const [arithmeticTime, setArithmeticTime] = useState('0');
  const [reading, setReading] = useState(false);
  const [stroopTest, setStroopTest] = useState(false);
  const [stroopTime, setStroopTime] = useState('0');
  const [stroopErrors, setStroopErrors] = useState('0');
  const [notes, setNotes] = useState('');

  // Stany walidacji
  const [errors, setErrors] = useState({
    arithmeticTime: false,
    stroopTime: false,
    stroopErrors: false,
  });

  // Stan zapisywania/aktualizacji
  const [isSaving, setIsSaving] = useState(false);

  // Stan dialogu potwierdzającego brak ćwiczeń
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Gdy tylko pobierzemy wizytę (existingVisit), ustawiamy odpowiednio stany formularza
  useEffect(() => {
    if (existingVisit) {
      // Data wizyty
      setDate(new Date(existingVisit.date)); // Zakładam, że existingVisit.date to string w formacie YYYY-MM-DD

      // Zgoda
      setConsentGiven(!!existingVisit.consentGiven);

      // Ćwiczenia
      if (existingVisit.exercises) {
        setPastMemory(!!existingVisit.exercises.pastMemory);

        if (existingVisit.exercises.arithmetic) {
          setArithmetic(!!existingVisit.exercises.arithmetic.completed);
          setArithmeticTime(
            existingVisit.exercises.arithmetic.time?.toString() || '0',
          );
        }

        setReading(!!existingVisit.exercises.reading);

        if (existingVisit.exercises.stroopTest) {
          setStroopTest(!!existingVisit.exercises.stroopTest.completed);
          setStroopTime(
            existingVisit.exercises.stroopTest.time?.toString() || '0',
          );
          setStroopErrors(
            existingVisit.exercises.stroopTest.errors?.toString() || '0',
          );
        }
      }

      // Notatki
      setNotes(existingVisit.notes || '');
    }
  }, [existingVisit]);

  // Funkcja walidująca formularz
  const validateForm = () => {
    const newErrors = {
      arithmeticTime:
        arithmetic &&
        (isNaN(Number(arithmeticTime)) || Number(arithmeticTime) < 0),
      stroopTime:
        stroopTest && (isNaN(Number(stroopTime)) || Number(stroopTime) < 0),
      stroopErrors:
        stroopTest && (isNaN(Number(stroopErrors)) || Number(stroopErrors) < 0),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  // Przycisk "Zapisz zmiany"
  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Błąd', 'Proszę poprawić błędy formularza przed zapisaniem.');
      return;
    }

    const noExercisesSelected =
      !pastMemory && !arithmetic && !reading && !stroopTest;

    if (consentGiven && noExercisesSelected) {
      setShowConfirmDialog(true);
      return;
    }

    // Jeśli wszystko ok, zapisujemy
    submitEdit();
  };

  const submitEdit = async () => {
    // Przygotowujemy obiekt wizyty do aktualizacji
    const updatedVisit: Visit = {
      id: route.params.visitId, // wykorzystujemy ID z nawigacji
      patientId: route.params.patientId, // jeśli jest potrzebne
      date: date.toISOString().split('T')[0],
      consentGiven,
      exercises: {
        pastMemory,
        arithmetic: {
          completed: arithmetic,
          time: arithmetic ? parseInt(arithmeticTime) || 0 : undefined,
        },
        reading,
        stroopTest: stroopTest
          ? {
              completed: true,
              time: parseInt(stroopTime) || 0,
              errors: parseInt(stroopErrors) || 0,
            }
          : undefined,
      },
      notes: notes.trim() || undefined,
    };

    setIsSaving(true);

    // Wywołujemy updateData z metodą PUT
    await updateData('PATCH', updatedVisit);

    // Po wywołaniu updateData:
    setIsSaving(false);

    if (!error) {
      // Jeżeli w hooku nie ustawiono błędu, zakładamy, że aktualizacja się udała
      dispatch(updateVisit(updatedVisit));
      Alert.alert('Sukces', 'Wizyta została zaktualizowana.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } else {
      // Jeżeli error został ustawiony w hooku
      Alert.alert('Błąd', error);
    }
  };

  // Obsługa DatePicker
  const showDatePicker = () => setIsDatePickerVisible(true);
  const hideDatePicker = () => setIsDatePickerVisible(false);

  const handleConfirmDate = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  if (loading) {
    return (
      <PaperProvider theme={customTheme}>
        <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
          <ActivityIndicator animating size="large" />
          <Text style={{marginTop: 16}}>Ładowanie danych wizyty...</Text>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled">
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.headerSection}>
                    <Text style={styles.screenTitle}>Edytuj wizytę</Text>
                    <Text style={styles.patientId}>
                      ID wizyty: {route.params.visitId}
                    </Text>
                    <Text style={styles.patientId}>
                      ID pacjenta: {route.params.patientId}
                    </Text>
                  </View>

                  <Divider style={styles.divider} />

                  <Text style={styles.sectionTitle}>Data wizyty</Text>
                  <Button
                    mode="contained"
                    icon="calendar"
                    onPress={showDatePicker}
                    style={styles.dateButton}>
                    {date.toLocaleDateString('pl-PL')}
                  </Button>

                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    date={date}
                    onConfirm={handleConfirmDate}
                    onCancel={hideDatePicker}
                  />

                  <Divider style={styles.divider} />

                  <Text style={styles.sectionTitle}>Zgoda pacjenta</Text>
                  <View style={styles.switchRow}>
                    <Text>Pacjent wyraził zgodę na ćwiczenia</Text>
                    <Switch
                      value={consentGiven}
                      onValueChange={setConsentGiven}
                    />
                  </View>

                  <Divider style={styles.divider} />

                  <Text style={styles.sectionTitle}>
                    Przeprowadzone ćwiczenia
                  </Text>
                  <View style={styles.exercisesContainer}>
                    <Checkbox.Item
                      label="Powrót do przeszłości"
                      status={pastMemory ? 'checked' : 'unchecked'}
                      onPress={() => setPastMemory(!pastMemory)}
                      disabled={!consentGiven}
                      style={styles.checkboxItem}
                    />

                    <Checkbox.Item
                      label="Arytmetyka na czas"
                      status={arithmetic ? 'checked' : 'unchecked'}
                      onPress={() => {
                        setArithmetic(!arithmetic);
                        if (!arithmetic) {
                          setArithmeticTime('0');
                        }
                      }}
                      disabled={!consentGiven}
                      style={styles.checkboxItem}
                    />
                    {arithmetic && (
                      <View style={styles.indentedInput}>
                        <TextInput
                          mode="outlined"
                          label="Czas wykonania (sekundy)"
                          keyboardType="numeric"
                          value={arithmeticTime}
                          onChangeText={setArithmeticTime}
                          error={errors.arithmeticTime}
                          right={<TextInput.Affix text="s" />}
                        />
                        {errors.arithmeticTime && (
                          <HelperText type="error">
                            Podaj poprawny czas w sekundach
                          </HelperText>
                        )}
                      </View>
                    )}

                    <Checkbox.Item
                      label="Czytanie na głos"
                      status={reading ? 'checked' : 'unchecked'}
                      onPress={() => setReading(!reading)}
                      disabled={!consentGiven}
                      style={styles.checkboxItem}
                    />

                    <Checkbox.Item
                      label="Test Stroopa"
                      status={stroopTest ? 'checked' : 'unchecked'}
                      onPress={() => {
                        setStroopTest(!stroopTest);
                        if (!stroopTest) {
                          setStroopTime('0');
                          setStroopErrors('0');
                        }
                      }}
                      disabled={!consentGiven}
                      style={styles.checkboxItem}
                    />
                    {stroopTest && (
                      <View style={styles.indentedInput}>
                        <TextInput
                          mode="outlined"
                          label="Czas wykonania (sekundy)"
                          keyboardType="numeric"
                          value={stroopTime}
                          onChangeText={setStroopTime}
                          error={errors.stroopTime}
                          right={<TextInput.Affix text="s" />}
                          style={styles.inputMargin}
                        />
                        {errors.stroopTime && (
                          <HelperText type="error">
                            Podaj poprawny czas w sekundach
                          </HelperText>
                        )}

                        <TextInput
                          mode="outlined"
                          label="Liczba błędów"
                          keyboardType="numeric"
                          value={stroopErrors}
                          onChangeText={setStroopErrors}
                          error={errors.stroopErrors}
                        />
                        {errors.stroopErrors && (
                          <HelperText type="error">
                            Podaj poprawną liczbę błędów
                          </HelperText>
                        )}
                      </View>
                    )}
                  </View>

                  <Divider style={styles.divider} />

                  <Text style={styles.sectionTitle}>Notatki</Text>
                  <TextInput
                    mode="outlined"
                    label="Dodatkowe obserwacje (opcjonalnie)"
                    multiline
                    numberOfLines={6}
                    value={notes}
                    onChangeText={setNotes}
                    style={styles.notesInput}
                  />
                </Card.Content>
              </Card>

              <Button
                mode="contained"
                onPress={handleSave}
                loading={isSaving || loading} // można też zablokować przycisk, gdy trwa pobieranie
                disabled={isSaving || loading}
                style={styles.saveButton}>
                Zapisz zmiany
              </Button>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* Dialog potwierdzający brak ćwiczeń */}
        <Portal>
          <Dialog
            visible={showConfirmDialog}
            onDismiss={() => setShowConfirmDialog(false)}>
            <Dialog.Title>Brak ćwiczeń</Dialog.Title>
            <Dialog.Content>
              <Text>
                Pacjent wyraził zgodę na ćwiczenia, ale nie wybrano żadnych
                ćwiczeń. Czy na pewno chcesz zapisać wizytę?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowConfirmDialog(false)}>
                Anuluj
              </Button>
              <Button onPress={submitEdit}>Zapisz mimo to</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 3,
  },
  headerSection: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  dateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  exercisesContainer: {
    marginVertical: 8,
  },
  checkboxItem: {
    paddingVertical: 4,
  },
  indentedInput: {
    marginLeft: 40,
    marginTop: 8,
    marginBottom: 16,
  },
  inputMargin: {
    marginBottom: 8,
  },
  notesInput: {
    marginTop: 8,
    marginBottom: 8,
    minHeight: 150,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 150,
    borderRadius: 6,
    alignSelf: 'center',
    width: '100%',
  },
});

export default EditVisitScreen;
