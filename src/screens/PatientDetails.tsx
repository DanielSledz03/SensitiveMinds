import React, {useCallback, useEffect, useState} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {
  Card,
  Avatar,
  Button,
  Text,
  Divider,
  FAB,
  PaperProvider,
  ActivityIndicator,
} from 'react-native-paper';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {PatientDetailsRouteProp} from '../types/navigation';
import {RootStackParamList} from './Nav';
import {useFetch} from '../utils/MyApi';
import {SafeAreaView} from 'react-native-safe-area-context';

// importujemy nasz hook

interface Visit {
  id: string;
  date: string;
  patientId: string;
  exercises: {
    pastMemory: boolean;
    arithmetic: {completed: boolean; time: number};
    reading: boolean;
  };
  createdBy: {
    fullName?: string;
  };
}

interface Patient {
  id: string;
  name: string;
  age: number;
  roomNumber: number;
  gender: string;
  bedNumber: string;
  center: string;
  visits: Visit[];
}

const PatientAvatar = (props: any, initial: string, gender: string) => (
  <Avatar.Text
    {...props}
    label={initial}
    style={{
      backgroundColor: gender === 'Kobieta' ? '#E91E63' : '#2196F3',
    }}
  />
);

const PatientDetailsScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PatientDetailsRouteProp>();
  const patientId = route.params.patientId;
  const [firstFetch, setFirstFetch] = useState(false);

  // używamy hooka - pobieramy dane pacjenta z API
  // (dla uproszczenia załóżmy, że w tym samym responsie dostajemy wizyty w polu visits)
  const {
    data: patient,
    loading,
    error,
    refetch,
  } = useFetch<Patient>(`/patients/${patientId}`);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (patient) {
      setFirstFetch(true);
    }
  }, [patient]);

  const handleNavigateToEditPatient = () => {
    if (patient?.id) {
      navigation.navigate('EditPatient', {id: patient.id});
    }
  };

  const renderVisitItem = ({item}: {item: Visit}) => (
    <Card style={styles.card}>
      {/* Przykład: onPress w Card nadal przenosi do szczegółów */}
      <View>
        <Card.Title
          title={`Wizyta: ${new Date(item.date).toLocaleDateString('pl-PL')}`}
          subtitle={'Badacz: ' + item?.createdBy?.fullName}
          subtitleStyle={{color: 'black', fontWeight: 'bold'}}
          titleStyle={{color: 'black'}}
        />
        <Card.Content>
          <Text style={{color: 'black', marginBottom: 10}}>
            🧠 Powrót do przeszłości:{' '}
            {item.exercises.pastMemory ? 'Tak' : 'Nie'}
          </Text>
          <Text style={{color: 'black', marginBottom: 10}}>
            🔢 Arytmetyka:{' '}
            {item.exercises.arithmetic.completed
              ? `Tak (${item.exercises.arithmetic.time} s)`
              : 'Nie'}
          </Text>
          <Text style={{color: 'black', marginBottom: 10}}>
            📖 Czytanie na głos: {item.exercises.reading ? 'Tak' : 'Nie'}
          </Text>
        </Card.Content>
      </View>

      {/* Dodajemy Actions z przyciskiem Edytuj */}
      <Card.Actions>
        <Button
          mode="text"
          onPress={() =>
            navigation.navigate('EditVisit', {
              visitId: item.id,
              patientId: patientId,
            })
          }>
          Edytuj
        </Button>

        <Button
          mode="text"
          onPress={() =>
            navigation.navigate('VisitDetails', {
              visitId: item.id,
              patientId: patientId,
            })
          }>
          Czytaj
        </Button>
      </Card.Actions>
    </Card>
  );

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
          <Text style={{marginTop: 16, color: 'black'}}>
            Ładowanie danych pacjenta...
          </Text>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  if (error || !patient) {
    return (
      <View style={styles.centered}>
        <Text>{error || 'Nie znaleziono pacjenta.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card elevation={0} style={styles.card}>
        <Card.Title
          title={patient.name}
          subtitle={`Pokój: ${patient.roomNumber} | Łóżko: ${patient.bedNumber}`}
          titleStyle={{color: 'black'}}
          subtitleStyle={{color: 'black'}}
          left={props => {
            const initial = patient.name?.charAt(0).toUpperCase() || '?';

            return PatientAvatar(props, initial, patient.gender);
          }}
        />
        <Card.Content>
          {patient.age && (
            <Text style={{color: 'black', marginBottom: 10}}>
              🧓 Wiek: {patient.age}
            </Text>
          )}
          <Text style={{color: 'black'}}>👤 Płeć: {patient.gender}</Text>
        </Card.Content>
        <Card.Actions>
          <Button
            icon="pencil"
            mode="contained-tonal"
            onPress={handleNavigateToEditPatient}>
            Edytuj
          </Button>
        </Card.Actions>
      </Card>

      <Divider style={{marginVertical: 10}} />

      <Text style={styles.sectionTitle}>📅 Wizyty</Text>
      {patient.visits?.length === 0 && (
        <Text style={{color: 'black', fontSize: 16, fontWeight: '700'}}>
          Brak wizyt
        </Text>
      )}
      <FlatList
        data={patient.visits.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )}
        keyExtractor={item => item.id}
        renderItem={renderVisitItem}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        label="Dodaj wizytę"
        onPress={() => navigation.navigate('AddVisit', {patientId})}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'white',
    elevation: 2,
    color: 'black',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30,
    color: 'black',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
  },
});

export default PatientDetailsScreen;
