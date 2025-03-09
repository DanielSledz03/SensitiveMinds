import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {TextInput, Button, RadioButton, Text, Card} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useFetch} from '../utils/MyApi';

interface Patient {
  id: string;
  name: string;
  age: number;
  bedNumber: string;
  gender: 'Mężczyzna' | 'Kobieta';
  weight: number;
}

type ParamList = {
  'Edycja Pacjenta': {id?: string};
};

const EditPatientScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'Edycja Pacjenta'>>();
  const navigation = useNavigation();

  // Pobranie danych pacjenta
  const patientId = route.params?.id;
  const apiUrl = patientId ? `/patients/${patientId}` : '';
  const {data: patient, loading, error, updateData} = useFetch<Patient>(apiUrl);

  // Stan formularza
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [gender, setGender] = useState<'Mężczyzna' | 'Kobieta'>('Mężczyzna');
  const [weight, setWeight] = useState('');

  // Aktualizacja pól formularza po pobraniu danych
  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setAge(patient.age.toString());
      setBedNumber(patient.bedNumber);
      setGender(patient.gender);
      setWeight(patient.weight.toString());
    }
  }, [patient]);

  // Obsługa zapisu pacjenta
  const handleSave = async () => {
    if (!name.trim() || !age.trim() || !bedNumber.trim() || !weight.trim()) {
      Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione.');
      return;
    }

    const updatedPatient: Patient = {
      id: patientId || Math.random().toString(36).substring(7),
      name,
      age: parseInt(age, 10),
      bedNumber,
      gender,
      weight: parseFloat(weight),
    };

    if (patientId) {
      // Aktualizacja pacjenta w API
      await updateData('PATCH', updatedPatient);
    } else {
      Alert.alert('Błąd', 'Dodawanie nowych pacjentów nie jest obsługiwane.');
      return;
    }

    Alert.alert('Sukces', 'Dane pacjenta zapisano.');
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <>
          <Card elevation={0} style={styles.card}>
            <Card.Content>
              {loading ? (
                <Text style={styles.text}>Ładowanie danych pacjenta...</Text>
              ) : error ? (
                <Text style={[styles.text, styles.error]}>Błąd: {error}</Text>
              ) : (
                <>
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
                    textColor="black"
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
                    activeOutlineColor="#000"
                    placeholderTextColor="#000"
                    textColor="black"
                  />

                  <Text style={styles.label}>Masa ciała (kg)</Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Wpisz wagę"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    style={styles.input}
                    textColor="black"
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
                        <Text style={styles.text}>Mężczyzna</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.radioItem}
                        onPress={() => setGender('Kobieta')}>
                        <RadioButton
                          value="Kobieta"
                          color="#000"
                          uncheckedColor="#000"
                        />
                        <Text style={styles.text}>Kobieta</Text>
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
            labelStyle={styles.buttonLabel}>
            Zapisz pacjenta
          </Button>
        </>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff', // białe tło głównego ekranu
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#fff', // białe tło karty
    marginBottom: 15,
  },
  text: {
    color: '#000', // czarny tekst
  },
  error: {
    marginTop: 10,
    fontWeight: 'bold',
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
  button: {
    marginTop: 10,
    backgroundColor: '#fff', // białe tło przycisku
    borderWidth: 1,
    borderColor: '#000', // czarna ramka przycisku, aby był widoczny
  },
  buttonLabel: {
    color: '#000', // czarny tekst na białym przycisku
  },
});

export default EditPatientScreen;
