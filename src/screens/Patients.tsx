import React, {useCallback, useEffect, useState} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Searchbar, Card, Avatar, FAB, List} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {addPatient, Patient} from '../store/slices/patientsSlice';
import {useFetch} from '../utils/MyApi';
import {Text} from '@rneui/base';
import {RootStackParamList} from './Nav';

// Komponent wyświetlający awatar
const PatientAvatar = (props: any, gender: string, initial: string) => (
  <Avatar.Text
    {...props}
    label={initial}
    style={{
      backgroundColor: gender === 'Kobieta' ? '#E91E63' : '#2196F3',
    }}
  />
);

// Nowy komponent do pobierania i wyświetlania pełnej nazwy użytkownika
const UserFullName: React.FC<{userId: string}> = ({userId}) => {
  const {data, loading, error} = useFetch<any>(`/user/${userId}`);

  if (loading) return <Text>Ładowanie...</Text>;
  if (error) return <Text>Błąd</Text>;

  return <Text>{data?.fullName || userId}</Text>;
};

const Patients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const patients = useSelector((state: RootState) => state.patients.patients);
  const {data, error, refetch} = useFetch<any[]>('/patients');
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (data) {
      const existingPatients = new Map(patients.map(p => [p.id, p]));
      const newPatients = data.filter(
        patient => !existingPatients.has(patient.id),
      );
      newPatients.forEach(patient => {
        dispatch(addPatient(patient));
      });
    }
  }, [data, dispatch, patients]);

  // Filtrowanie pacjentów po wpisanej frazie
  const filteredPatients =
    searchQuery.trim() === ''
      ? patients
      : patients.filter(patient =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  // Sprawdzamy, czy którykolwiek pacjent posiada pole user.id
  const isManager = filteredPatients.some(patient => patient.user?.id);

  // Renderowanie listy płaskiej
  const renderFlatList = () => (
    <FlatList
      data={filteredPatients}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({item}: {item: Patient}) => (
        <Card
          elevation={0}
          style={styles.card}
          onPress={() =>
            navigation.navigate('PatientDetails', {patientId: item.id})
          }>
          <Card.Title
            title={item.name}
            subtitle={`Wiek: ${item.age} | Łóżko: ${item.bedNumber}`}
            titleStyle={{color: 'black'}}
            subtitleStyle={{color: 'black'}}
            left={props =>
              PatientAvatar(props, item.gender, item.name.charAt(0))
            }
          />
        </Card>
      )}
    />
  );

  // Renderowanie zagnieżdżonej listy dla managera
  const renderNestedList = () => {
    // Grupowanie pacjentów według user.id (jeśli brak - 'Brak użytkownika')
    const groupedPatients = filteredPatients.reduce(
      (groups: Record<string, Patient[]>, patient: Patient) => {
        const userId = patient.user?.id ?? 'Brak użytkownika';
        if (!groups[userId]) {
          groups[userId] = [];
        }
        groups[userId].push(patient);
        return groups;
      },
      {},
    );

    const groupKeys = Object.keys(groupedPatients);

    return (
      <FlatList
        data={groupKeys}
        keyExtractor={item => item}
        renderItem={({item: userId}) => (
          <List.Accordion
            // Używamy komponentu UserFullName do pobrania i wyświetlenia pełnej nazwy użytkownika
            title={
              userId !== 'Brak użytkownika' ? (
                <UserFullName userId={userId} />
              ) : (
                'Brak użytkownika'
              )
            }
            style={styles.accordion}>
            {groupedPatients[userId].map((patient: Patient) => (
              <List.Item
                key={patient.id}
                title={patient.name}
                description={`Wiek: ${patient.age} | Łóżko: ${patient.bedNumber}`}
                onPress={() =>
                  navigation.navigate('PatientDetails', {patientId: patient.id})
                }
                left={props =>
                  PatientAvatar(props, patient.gender, patient.name.charAt(0))
                }
              />
            ))}
          </List.Accordion>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Szukaj pacjenta..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        placeholderTextColor="gray"
        rippleColor="black"
        selectionColor="black"
      />
      {error && <Text>Błąd: {error}</Text>}
      {isManager ? renderNestedList() : renderFlatList()}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Dodaj pacjenta"
        onPress={() => navigation.navigate('AddPatient')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5F5F5',
  },
  searchbar: {
    marginBottom: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderColor: 'white',
    elevation: 0,
  },
  accordion: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
  },
});

export default Patients;
