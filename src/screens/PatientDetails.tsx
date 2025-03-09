import React, {useCallback} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Card, Avatar, Button, Text, Divider, FAB} from 'react-native-paper';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {PatientDetailsRouteProp} from '../types/navigation';
import {RootStackParamList} from './Nav';
import {useFetch} from '../utils/MyApi';

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
}

interface Patient {
  id: string;
  name: string;
  age: number;
  weight: number;
  gender: string;
  bedNumber: string;
  // ... i cokolwiek jeszcze zwraca API
  visits: Visit[]; // jeśli w endpoincie /patients/:id zwracane są wizyty
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

  // używamy hooka - pobieramy dane pacjenta z API
  // (dla uproszczenia załóżmy, że w tym samym responsie dostajemy wizyty w polu visits)
  const {
    data: patient,

    error,
    refetch,
  } = useFetch<Patient>(`/patients/${patientId}`);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Jeżeli w API nie ma wizyt w tym samym responsie i masz osobny endpoint,
  // możesz użyć drugiego wywołania useFetch<Visit[]>(`/patients/${patientId}/visits`)
  // i w analogiczny sposób przekazać je do listy.

  // Obsługa błędu i/lub stanu ładowania

  if (error || !patient) {
    return (
      <View style={styles.centered}>
        <Text>{error || 'Nie znaleziono pacjenta.'}</Text>
      </View>
    );
  }

  const handleNavigateToEditPatient = () => {
    navigation.navigate('EditPatient', {id: patient.id});
  };

  const renderVisitItem = ({item}: {item: Visit}) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('VisitDetails', {
          visitId: item.id,
          patientId: patientId,
        })
      }>
      <Card.Title
        title={`Wizyta: ${new Date(item.date).toLocaleDateString('pl-PL')}`}
        titleStyle={{color: 'black'}}
      />
      <Card.Content>
        <Text style={{color: 'black', marginBottom: 10}}>
          🧠 Powrót do przeszłości: {item.exercises.pastMemory ? 'Tak' : 'Nie'}
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
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card elevation={0} style={styles.card}>
        <Card.Title
          title={patient.name}
          subtitle={`Wiek: ${patient.age} | Łóżko: ${patient.bedNumber}`}
          titleStyle={{color: 'black'}}
          subtitleStyle={{color: 'black'}}
          left={props =>
            PatientAvatar(props, patient.name.charAt(0), patient.gender)
          }
        />
        <Card.Content>
          <Text style={{color: 'black', marginBottom: 10}}>
            ⚖️ Masa ciała: {patient.weight} kg
          </Text>
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
        data={patient.visits}
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
