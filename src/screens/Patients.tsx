import React, {useCallback, useEffect, useState} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Searchbar, Card, Avatar, FAB} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {addPatient, Patient} from '../store/slices/patientsSlice';
import {useFetch} from '../utils/MyApi';
import {Text} from '@rneui/base';
import {RootStackParamList} from './Nav';

const PatientAvatar = (props: any, gender: string, initial: string) => (
  <Avatar.Text
    {...props}
    label={initial}
    style={{
      backgroundColor: gender === 'Kobieta' ? '#E91E63' : '#2196F3',
    }}
  />
);

const Patients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const patients = useSelector((state: RootState) => state.patients.patients);

  const {data, error, refetch} = useFetch<any[]>('/patients');
  const dispatch = useDispatch();

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

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const filteredPatients =
    searchQuery.trim() === ''
      ? patients
      : patients.filter(patient =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  const renderItem = ({item}: {item: Patient}) => (
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
        left={props => PatientAvatar(props, item.gender, item.name.charAt(0))}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Szukaj pacjenta..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        placeholderTextColor="gray"
        rippleColor={'black'}
        selectionColor={'black'}
      />
      {error && <Text>Błąd: {error}</Text>}
      {filteredPatients.length > 0 && (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
        />
      )}
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
  },
});

export default Patients;
