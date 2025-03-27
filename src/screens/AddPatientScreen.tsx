import React, {useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import {useFetch} from '../utils/MyApi';
import {SafeAreaView} from 'react-native-safe-area-context';

const AddPatientScreen: React.FC = () => {
  const navigation = useNavigation();

  // Hook do obsługi requestów – tym razem tylko z endpointem '/patients'
  const {loading, error, updateData} = useFetch('/patients');

  // Stan formularza
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [gender, setGender] = useState<'Mężczyzna' | 'Kobieta'>('Mężczyzna');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  // Pobieranie listy ośrodków z '/centers'
  const {
    data: centersData,
    loading: centersLoading,
    error: centersError,
  } = useFetch<{id: string; name: string}[]>('/centers');

  // Obsługa zapisu (utworzenia nowego pacjenta)
  const handleSave = async () => {
    // Sprawdzamy tylko niezbędne pola
    if (!bedNumber.trim() || !roomNumber.trim() || !selectedCenter) {
      Alert.alert(
        'Błąd',
        'Pola numer łóżka, numer pokoju oraz ośrodek muszą być wypełnione. (Imię i nazwisko oraz wiek są opcjonalne).',
      );
      return;
    }

    const newPatient = {
      name,
      age: age.trim() ? parseInt(age, 10) : null,
      bedNumber,
      gender,
      roomNumber,
      center: selectedCenter,
    };

    console.log(newPatient);

    try {
      await updateData('POST', newPatient);
      Alert.alert('Sukces', 'Nowy pacjent został zapisany.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się stworzyć nowego pacjenta.');
    }
  };

  if (centersLoading) {
    return (
      <PaperProvider>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator animating size="large" />
          <Text style={{marginTop: 16, color: 'black'}}>Ładowanie...</Text>
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
            {error ? <Text style={styles.error}>Błąd: {error}</Text> : null}
            {centersError ? (
              <Text style={styles.error}>Błąd ośrodków: {centersError}</Text>
            ) : null}

            <Text style={styles.label}>Imię i nazwisko (opcjonalne)</Text>
            <TextInput
              mode="outlined"
              placeholder="Wpisz imię i nazwisko (opcjonalne)"
              value={name}
              onChangeText={setName}
              style={styles.input}
              outlineColor="#000"
              activeOutlineColor="#000"
              textColor="black"
              placeholderTextColor="#000"
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
              textColor="black"
              placeholderTextColor="#000"
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
              textColor="black"
              onChangeText={setRoomNumber}
              style={styles.input}
              outlineColor="#000"
              activeOutlineColor="#000"
              placeholderTextColor="#000"
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
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          loading={loading}>
          Dodaj pacjenta
        </Button>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default AddPatientScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 0,
    backgroundColor: '#fff', // białe tło
    paddingBottom: 150,
  },
  card: {
    backgroundColor: '#fff', // białe tło karty
    marginBottom: 15,
  },
  error: {
    color: '#f00', // czerwony tekst błędu
    marginBottom: 10,
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
  pickerWrapper: {
    borderRadius: 4,
    backgroundColor: '#333',
  },
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
