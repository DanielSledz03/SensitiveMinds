import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../App';

// Typ dla hooka useNavigation
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Typy dla route.params dla każdego ekranu
export type PatientDetailsRouteProp = RouteProp<
  RootStackParamList,
  'PatientDetails'
>;
export type EditPatientRouteProp = RouteProp<RootStackParamList, 'EditPatient'>;
export type AddVisitRouteProp = RouteProp<RootStackParamList, 'AddVisit'>;
export type VisitDetailsRouteProp = RouteProp<
  RootStackParamList,
  'VisitDetails'
>;
