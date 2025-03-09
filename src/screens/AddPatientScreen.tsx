import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {TextInput, Button, RadioButton, Text, Card} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useFetch} from '../utils/MyApi';

const AddPatientScreen: React.FC = () => {
  const navigation = useNavigation();

  // Hook do obsługi requestów – tym razem tylko z endpointem '/patients'
  const {loading, error, updateData} = useFetch('/patients');

  // Stan formularza
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [gender, setGender] = useState<'Mężczyzna' | 'Kobieta'>('Mężczyzna');
  const [weight, setWeight] = useState('');

  // Obsługa zapisu (utworzenia nowego pacjenta)
  const handleSave = async () => {
    // Walidacja pól
    if (!name.trim() || !age.trim() || !bedNumber.trim() || !weight.trim()) {
      Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione.');
      return;
    }

    // Przygotowanie obiektu pacjenta
    const newPatient = {
      name,
      age: parseInt(age, 10),
      bedNumber,
      gender,
      weight: parseFloat(weight),
    };

    try {
      await updateData('POST', newPatient);
      Alert.alert('Sukces', 'Nowy pacjent został zapisany.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się stworzyć nowego pacjenta.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Card elevation={0} style={styles.card}>
          <Card.Content>
            {error ? <Text style={styles.error}>Błąd: {error}</Text> : null}

            <Text style={styles.label}>Imię i nazwisko</Text>
            <TextInput
              mode="outlined"
              placeholder="Wpisz imię i nazwisko"
              value={name}
              onChangeText={setName}
              style={styles.input}
              outlineColor="#000"
              activeOutlineColor="#000"
              placeholderTextColor="#000"
            />

            <Text style={styles.label}>Wiek</Text>
            <TextInput
              mode="outlined"
              placeholder="Wpisz wiek"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
              style={styles.input}
              outlineColor="#000"
              activeOutlineColor="#000"
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
              activeOutlineColor="#000"
              placeholderTextColor="#000"
            />

            <Text style={styles.label}>Masa ciała (kg)</Text>
            <TextInput
              mode="outlined"
              placeholder="Wpisz wagę"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
              outlineColor="#000"
              activeOutlineColor="#000"
              placeholderTextColor="#000"
            />

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
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff', // białe tło
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#fff', // białe tło karty
    marginBottom: 15,
  },
  error: {
    color: '#f00', // czerwony tekst błędu (opcjonalnie, jeśli chcemy tylko czerń/biel to można dać "#000")
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
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  radioText: {
    color: '#000',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#fff', // białe tło przycisku
    borderWidth: 1,
    borderColor: '#000', // czarna ramka przycisku
  },
  buttonLabel: {
    color: '#000', // czarny tekst na białym przycisku
  },
});

export default AddPatientScreen;
