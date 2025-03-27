import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, FlatList, StyleSheet, RefreshControl} from 'react-native';
import {
  Searchbar,
  Card,
  Avatar,
  FAB,
  List,
  PaperProvider,
  ActivityIndicator,
} from 'react-native-paper';
import {Text} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {addPatient, Patient} from '../store/slices/patientsSlice';
import {useFetch} from '../utils/MyApi';
import {RootStackParamList} from './Nav';
import {SafeAreaView} from 'react-native-safe-area-context';

const Patients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const patients = useSelector((state: RootState) => state.patients.patients);
  const [firstFetch, setFirstFetch] = useState(false);
  // Pobieranie pacjentów z API
  const {data, error, refetch, loading} = useFetch<any[]>('/patients');
  const dispatch = useDispatch();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Odświeżenie danych po powrocie na ten ekran
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Aktualizacja stanu w Redux po pobraniu pacjentów
  useEffect(() => {
    if (data) {
      const existingPatients = new Map(patients.map(p => [p.id, p]));
      const newPatients = data.filter(
        patient => !existingPatients.has(patient.id),
      );
      newPatients.forEach(patient => dispatch(addPatient(patient)));
      setFirstFetch(true);
    }
  }, [data, dispatch, patients]);

  // Filtrowanie pacjentów po wpisanej frazie
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return patients;
    }
    return patients.filter(patient =>
      (patient.name || '').toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [patients, searchQuery]);

  const groupedPatients = useMemo(() => {
    const grouped: Record<string, Patient[]> = {};

    filteredPatients.forEach(patient => {
      const centerId = patient.center?.id || 'unknown-center';
      if (!grouped[centerId]) {
        grouped[centerId] = [];
      }
      grouped[centerId].push(patient);
    });

    // Sortowanie pacjentów w każdej grupie
    Object.keys(grouped).forEach(centerId => {
      grouped[centerId].sort((a, b) => {
        const nameA = a.name?.trim().toLowerCase();
        const nameB = b.name?.trim().toLowerCase();

        const isAnonA = !nameA;
        const isAnonB = !nameB;

        if (isAnonA && !isAnonB) return 1;
        if (!isAnonA && isAnonB) return -1;
        if (isAnonA && isAnonB) return 0;

        return nameA!.localeCompare(nameB!);
      });
    });

    return grouped;
  }, [filteredPatients]);

  // Wyciągnięcie listy kluczy (ID ośrodków) do wyświetlenia w FlatList
  const centerIds = Object.keys(groupedPatients);

  // Render listy ośrodków wraz z pacjentami
  const renderCentersWithPatients = () => {
    return (
      <FlatList
        data={centerIds}
        keyExtractor={item => item}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        renderItem={({item: centerId}) => {
          const centerName =
            groupedPatients[centerId][0]?.center?.name || 'Nieznany ośrodek';

          return (
            <>
              <List.Accordion
                title={centerName}
                rippleColor={'white'}
                titleStyle={{color: 'black'}}
                style={styles.accordion}>
                {groupedPatients[centerId].map((patient: Patient, index) => {
                  // Obsługa braku imienia
                  const displayName = patient.name?.trim()
                    ? patient.name
                    : 'Pacjent anonimowy';
                  // Obsługa wyświetlania wieku (jeżeli istnieje)

                  // Podtytuł z uwzględnieniem pokoju, łóżka i ewentualnego wieku
                  const subtitleText = `Pokój: ${patient.roomNumber} | Łóżko: ${patient.bedNumber}`;

                  // Początkowa litera do Avatara
                  const initial = patient.name?.charAt(0).toUpperCase() || '?';

                  return (
                    <Card
                      key={patient.id}
                      elevation={0}
                      style={{...styles.card, marginTop: index === 0 ? 10 : 0}}
                      onPress={() =>
                        navigation.navigate('PatientDetails', {
                          patientId: patient.id,
                        })
                      }>
                      <Card.Title
                        title={displayName}
                        subtitle={subtitleText}
                        titleStyle={{color: 'black'}}
                        subtitleStyle={{color: 'black'}}
                        left={props => (
                          <Avatar.Text
                            {...props}
                            label={initial}
                            style={{
                              backgroundColor:
                                patient.gender === 'Kobieta'
                                  ? '#E91E63'
                                  : '#2196F3',
                            }}
                          />
                        )}
                      />
                    </Card>
                  );
                })}
              </List.Accordion>
              <View style={{height: 10}} />
            </>
          );
        }}
        ListEmptyComponent={<Text>Brak pacjentów</Text>}
      />
    );
  };

  if (loading && !firstFetch) {
    return (
      <PaperProvider>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator animating size="large" />
          <Text style={{marginTop: 16}}>Ładowanie pacjentów...</Text>
        </SafeAreaView>
      </PaperProvider>
    );
  }

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

      {error && <Text style={{marginVertical: 8}}>Błąd: {error}</Text>}

      {renderCentersWithPatients()}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Dodaj pacjenta"
        onPress={() => navigation.navigate('AddPatient')}
      />
    </View>
  );
};

export default Patients;

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
  accordion: {
    backgroundColor: 'white',
    color: 'black',
    elevation: 0,
    borderWidth: 0,
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderColor: 'white',
    elevation: 0,
    borderWidth: 0,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
  },
});
