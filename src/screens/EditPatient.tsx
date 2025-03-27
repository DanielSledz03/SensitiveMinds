import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  RadioButton,
  Text,
  Card,
  PaperProvider,
  ActivityIndicator,
} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import {useFetch} from '../utils/MyApi';
import {SafeAreaView} from 'react-native-safe-area-context';

interface Patient {
  id: string;
  name: string | null;
  age: number | null;
  bedNumber: string;
  gender: 'Mężczyzna' | 'Kobieta';
  roomNumber: string;
  center: {
    id: number;
    name: string;
  };
}

// Dodajemy nowy interfejs dla danych wysyłanych do API
interface PatientUpdate {
  name: string | null;
  age: number | null;
  bedNumber: string;
  gender: 'Mężczyzna' | 'Kobieta';
  roomNumber: string;
  center: number;
}

type ParamList = {
  'Edycja Pacjenta': {id?: string};
};

const EditPatientScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'Edycja Pacjenta'>>();
  const navigation = useNavigation();

  // ID pacjenta przekazane w parametrze
  const patientId = route.params?.id;
  // Endpoint do pobrania konkretnego pacjenta
  const apiUrl = patientId ? `/patients/${patientId}` : '';

  // Pobieramy dane pacjenta
  const {
    data: patient,
    loading: patientLoading,
    error: patientError,
    updateData: updatePatientData,
  } = useFetch<Patient>(apiUrl);

  // Pobieramy listę ośrodków
  const {
    data: centersData,
    loading: centersLoading,
    error: centersError,
  } = useFetch<{id: string; name: string}[]>('/centers');

  // Stany formularza
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [gender, setGender] = useState<'Mężczyzna' | 'Kobieta'>('Mężczyzna');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);

  // Gdy przyjdą dane pacjenta, wypełniamy formularz
  useEffect(() => {
    if (patient) {
      setName(patient.name ?? '');
      setAge(patient.age?.toString() ?? '');
      setBedNumber(patient.bedNumber);
      setGender(patient.gender);
      setRoomNumber(patient.roomNumber);
      setSelectedCenter(patient.center.id);
    }
  }, [patient]);

  // Obsługa zapisu zmian
  const handleSave = async () => {
    if (!bedNumber.trim() || !roomNumber.trim() || !selectedCenter) {
      Alert.alert(
        'Błąd',
        'Pola numer łóżka, numer pokoju oraz ośrodek muszą być wypełnione.',
      );
      return;
    }

    const updatedPatient: PatientUpdate = {
      name: name.trim() ? name : null,
      age: age.trim() ? parseInt(age, 10) : null,
      bedNumber,
      gender,
      roomNumber,
      center: selectedCenter,
    };

    try {
      // Jeśli mamy ID pacjenta – aktualizujemy go w API (PATCH)
      // Dodawanie nowego pacjenta przez ten ekran nie jest wspierane
      if (patientId) {
        await updatePatientData('PATCH', updatedPatient);
        Alert.alert('Sukces', 'Dane pacjenta zapisano.');
        navigation.goBack();
      } else {
        Alert.alert('Błąd', 'Brak ID pacjenta – nie można zapisać zmian.');
      }
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się zapisać zmian pacjenta.');
    }
  };

  if (patientLoading || centersLoading) {
    return (
      <PaperProvider>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator animating size="large" />
          <Text style={{marginTop: 16, color: 'black'}}>
            Ładowanie danych pacjenta...
          </Text>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 150}}>
        <Card elevation={0} style={styles.card}>
          <Card.Content>
            {/* Komunikaty o błędach */}
            {patientError ? (
              <Text style={styles.error}>Błąd pacjenta: {patientError}</Text>
            ) : null}
            {centersError ? (
              <Text style={styles.error}>Błąd ośrodków: {centersError}</Text>
            ) : null}

            {patientLoading ? (
              <Text style={styles.text}>Ładowanie danych pacjenta...</Text>
            ) : (
              <>
                <Text style={styles.label}>Imię i nazwisko (opcjonalne)</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Wpisz imię i nazwisko (opcjonalne)"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  outlineColor="#000"
                  activeOutlineColor="#000"
                  placeholderTextColor="#000"
                  textColor="black"
                />

                <Text style={styles.label}>Wiek (opcjonalny)</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Wpisz wiek (opcjonalnie)"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  style={styles.input}
                  outlineColor="#000"
                  activeOutlineColor="#000"
                  placeholderTextColor="#000"
                  textColor="black"
                />

                <Text style={styles.label}>Numer łóżka</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Np. 12A"
                  value={bedNumber}
                  onChangeText={setBedNumber}
                  style={styles.input}
                  outlineColor="#000"
                  textColor="black"
                  activeOutlineColor="#000"
                  placeholderTextColor="#000"
                />

                <Text style={styles.label}>Numer pokoju</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Wpisz numer pokoju"
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                  style={styles.input}
                  outlineColor="#000"
                  activeOutlineColor="#000"
                  placeholderTextColor="#000"
                  textColor="black"
                />

                <Text style={styles.label}>Ośrodek</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedCenter}
                    style={{color: 'black', backgroundColor: '#333'}}
                    onValueChange={itemValue => setSelectedCenter(itemValue)}
                    dropdownIconColor={'white'}
                    dropdownIconRippleColor={'white'}
                    itemStyle={{
                      backgroundColor: 'white',
                      fontSize: 14,
                    }}
                    enabled={!centersLoading}>
                    <Picker.Item
                      label="--- Wybierz ośrodek ---"
                      value={null}
                      color="black"
                      style={{
                        backgroundColor: 'white',
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                      }}
                    />
                    {(centersData || []).map(center => (
                      <Picker.Item
                        color="black"
                        key={center.id}
                        label={center.name}
                        value={center.id}
                        style={{
                          backgroundColor: 'white',
                          borderBottomColor: 'black',
                          borderBottomWidth: 1,
                        }}
                      />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Płeć</Text>
                <RadioButton.Group
                  onValueChange={value =>
                    setGender(value as 'Mężczyzna' | 'Kobieta')
                  }
                  value={gender}>
                  <View style={styles.radioContainer}>
                    <TouchableOpacity
                      style={styles.radioItem}
                      onPress={() => setGender('Mężczyzna')}>
                      <RadioButton
                        value="Mężczyzna"
                        color="#000"
                        uncheckedColor="#000"
                      />
                      <Text style={styles.radioText}>Mężczyzna</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioItem}
                      onPress={() => setGender('Kobieta')}>
                      <RadioButton
                        value="Kobieta"
                        color="#000"
                        uncheckedColor="#000"
                      />
                      <Text style={styles.radioText}>Kobieta</Text>
                    </TouchableOpacity>
                  </View>
                </RadioButton.Group>
              </>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          loading={patientLoading || centersLoading}>
          Zapisz pacjenta
        </Button>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default EditPatientScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 0,
    backgroundColor: '#fff', // białe tło
  },
  card: {
    backgroundColor: '#fff', // białe tło karty
    marginBottom: 15,
  },
  error: {
    color: '#f00', // czerwony tekst błędu
    marginBottom: 10,
  },
  text: {
    color: '#000', // czarny tekst
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 5,
    color: '#000', // czarny tekst
  },
  input: {
    backgroundColor: '#fff', // białe pole
    color: '#000', // czarny tekst wpisywany
  },
  pickerWrapper: {},
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Platform.OS === 'ios' ? 'gray' : 'transparent',
    borderRadius: Platform.OS === 'ios' ? 20 : 0,
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 0,
    minWidth: '45%',
  },
  radioText: {
    color: Platform.OS === 'ios' ? 'white' : '#000',
  },
  button: {
    backgroundColor: '#fff', // białe tło przycisku
    borderWidth: 1,
    borderColor: '#000', // czarna ramka przycisku
  },
  buttonLabel: {
    color: '#000', // czarny tekst na białym przycisku
  },
});
