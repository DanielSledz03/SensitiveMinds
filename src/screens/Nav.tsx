import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Patients from './Patients';
import PatientDetailsScreen from './PatientDetails';
import EditPatientScreen from './EditPatient';
import AddVisitScreen from './AddVisitScreen';
import VisitDetailsScreen from './VisitDetailsScreen';
import LoginScreen from './Login';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setToken} from '../store/slices/authSlice';
import {ActivityIndicator} from 'react-native-paper';
import {RootState} from '../store/store';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import AddPatientScreen from './AddPatientScreen';

export type RootStackParamList = {
  Pacjenci: undefined;
  PatientDetails: {patientId: string};
  EditPatient: {id: string};
  AddVisit: {patientId: string};
  VisitDetails: {visitId: string; patientId: string};
  AddPatient: undefined;
};

const AppStack = createNativeStackNavigator<RootStackParamList>();
const AppStackNavigator = () => (
  <AppStack.Navigator screenOptions={{headerTitle: 'SensitiveMinds'}}>
    <AppStack.Screen name="Pacjenci" component={Patients} />
    <AppStack.Screen name="PatientDetails" component={PatientDetailsScreen} />
    <AppStack.Screen name="EditPatient" component={EditPatientScreen} />
    <AppStack.Screen name="AddVisit" component={AddVisitScreen} />
    <AppStack.Screen name="VisitDetails" component={VisitDetailsScreen} />
    <AppStack.Screen name="AddPatient" component={AddPatientScreen} />
  </AppStack.Navigator>
);

type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerTitle: 'SensitiveMinds'}}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

// Funkcja sprawdzająca ważność tokenu
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded: JwtPayload = jwtDecode(token);
    if (!decoded.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const Nav = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');

        if (token && isTokenValid(token)) {
          dispatch(setToken(token));
        } else {
          await AsyncStorage.removeItem('access_token'); // Usuwamy nieważny token
          dispatch(setToken(null));
        }
      } catch (err) {
        console.log('Błąd podczas odczytu tokena z Async Storage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [dispatch]);

  if (isLoading) {
    return <ActivityIndicator style={{flex: 1, justifyContent: 'center'}} />;
  }

  return <>{accessToken ? <AppStackNavigator /> : <AuthStack />}</>;
};
