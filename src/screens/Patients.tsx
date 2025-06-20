import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, FlatList, StyleSheet, RefreshControl} from 'react-native';
import {
  Card,
  Avatar,
  FAB,
  List,
  PaperProvider,
  ActivityIndicator,
  Button,
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
  // Stan pacjentów pobieranych z Redux
  const patients = useSelector((state: RootState) => state.patients.patients);
  const [firstFetch, setFirstFetch] = useState(false);

  // Stany sortowania:
  // sortRoomAsc – czy sortowanie numeru pokoju ma być rosnące
  // sortBedAsc – czy sortowanie numeru łóżka ma być rosnące
  const [sortRoomAsc, setSortRoomAsc] = useState(true);
  const [sortBedAsc, setSortBedAsc] = useState(true);

  // Pobieranie pacjentów z API
  const {data, error, refetch, loading} = useFetch<any[]>('/patients');
  const dispatch = useDispatch();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Odświeżenie danych przy powrocie na ekran
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

  // Grupowanie pacjentów po ośrodku i sortowanie wewnątrz grupy
  // Sortujemy najpierw po numerze pokoju, a przy równych pokojach – po numerze łóżka.
  const groupedPatients = useMemo(() => {
    const grouped: Record<string, Patient[]> = {};

    patients.forEach(patient => {
      const centerId = patient.center?.id
        ? patient.center.id.toString()
        : 'unknown-center';
      if (!grouped[centerId]) {
        grouped[centerId] = [];
      }
      grouped[centerId].push(patient);
    });

    Object.keys(grouped).forEach(centerId => {
      grouped[centerId].sort((a, b) => {
        // Porównanie numerów pokoju (zakładamy, że roomNumber jest liczbą zapisaną jako string)
        const roomA = parseInt(a.roomNumber, 10);
        const roomB = parseInt(b.roomNumber, 10);
        if (roomA !== roomB) {
          return sortRoomAsc ? roomA - roomB : roomB - roomA;
        }
        // Jeśli pokoje są takie same, porównujemy numery łóżek
        const bedA = parseInt(a.bedNumber, 10);
        const bedB = parseInt(b.bedNumber, 10);
        return sortBedAsc ? bedA - bedB : bedB - bedA;
      });
    });

    return grouped;
  }, [patients, sortRoomAsc, sortBedAsc]);

  const centerIds = Object.keys(groupedPatients);

  // Funkcja renderująca listę ośrodków z pacjentami
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
                  const displayName = patient.name?.trim()
                    ? patient.name
                    : 'Pacjent anonimowy';
                  const subtitleText = `Pokój: ${patient.roomNumber} | Łóżko: ${patient.bedNumber}`;
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
      {/* Przyciski sortowania */}
      <View style={styles.sortButtonsContainer}>
        <Button
          mode="contained"
          onPress={() => setSortRoomAsc(prev => !prev)}
          style={styles.sortButton}>
          Sortuj po pokoju
        </Button>
        <Button
          mode="contained"
          onPress={() => setSortBedAsc(prev => !prev)}
          style={styles.sortButton}>
          Sortuj po łóżku
        </Button>
      </View>

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
  sortButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sortButton: {
    flex: 1,
    marginHorizontal: 5,
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
