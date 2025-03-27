import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Card,
  Text,
  Divider,
  Button,
  PaperProvider,
  ActivityIndicator,
} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from './Nav';
import {useFetch} from '../utils/MyApi';
import {SafeAreaView} from 'react-native-safe-area-context';

type ParamList = {
  VisitDetails: {visitId: string};
};

// Przykładowy interfejs wizyty (dostosuj go do struktury twojego API)
interface Visit {
  id: string;
  date: string;
  exercises: {
    pastMemory: boolean;
    arithmetic: {completed: boolean; time: number};
    reading: boolean;
    stroopTest?: {time: number; errors: number};
  };
  notes?: string;
}

const VisitDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'VisitDetails'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Pobieramy szczegóły wizyty z API
  const {
    data: visit,
    loading,
    error,
  } = useFetch<Visit>(`/visits/${route.params.visitId}`);

  if (loading) {
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
            Ładowanie danych wizyty...
          </Text>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  // Obsługa błędu lub braku danych
  if (error || !visit) {
    return (
      <View style={styles.centered}>
        <Text>{error || 'Błąd: Wizyta nie została znaleziona.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card elevation={0} style={styles.card}>
        <Card.Title
          title={`Wizyta: ${visit.date}`}
          titleStyle={{color: 'black'}}
        />
        <Card.Content>
          <Divider style={styles.divider} />
          <Text style={{color: 'black', marginBottom: 10}}>
            🧠 Powrót do przeszłości:{' '}
            {visit.exercises.pastMemory ? 'Tak' : 'Nie'}
          </Text>
          <Text style={{color: 'black', marginBottom: 10}}>
            🔢 Arytmetyka:{' '}
            {visit.exercises.arithmetic.completed
              ? `Tak (${visit.exercises.arithmetic.time} s)`
              : 'Nie'}
          </Text>
          <Text style={{color: 'black', marginBottom: 10}}>
            📖 Czytanie na głos: {visit.exercises.reading ? 'Tak' : 'Nie'}
          </Text>
          {visit.exercises.stroopTest && (
            <Text style={{color: 'black', marginBottom: 10}}>
              🧩 Test Stroopa: Tak ({visit.exercises.stroopTest.time} s, błędy:{' '}
              {visit.exercises.stroopTest.errors})
            </Text>
          )}
          {visit.notes && (
            <>
              <Divider style={styles.divider} />
              <Text style={{color: 'black', marginBottom: 10}}>
                📌 Notatki: {visit.notes}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.goBack()}>
        Powrót
      </Button>
    </View>
  );
};

export default VisitDetailsScreen;

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
    padding: 10,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  divider: {
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
  },
});
