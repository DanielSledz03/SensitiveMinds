import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TextInput,
  Button,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import {API_URL} from '../utils/MyApi';
import {setToken} from '../store/slices/authSlice';
import {useDispatch} from 'react-redux';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setError(''); // Resetujemy błąd przed próbą logowania
    setLoading(true);
    try {
      // Wywołanie do API
      const response = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Błędne dane logowania.');
      }

      const data = await response.json();
      const {access_token} = data;

      // Zapisanie access_token w Async Storage
      await AsyncStorage.setItem('access_token', access_token);
      dispatch(setToken(access_token));
      setLoading(false);

      // Tutaj możesz dodać logikę przejścia do innego ekranu, np.:
      // navigation.navigate('HomeScreen');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        setLoading(false);
      } else {
        setError('Wystąpił nieznany błąd');
        setLoading(false);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Wyswietlamy komunikat błędu, jeśli taki wystąpi */}
        {error ? (
          <HelperText style={styles.error} type="error">
            {error}
          </HelperText>
        ) : null}
        {loading && <ActivityIndicator style={{paddingBottom: 30}} />}
        <TextInput
          label="Nazwa uzytkownika"
          value={username}
          onChangeText={text => setUsername(text)}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor={'black'}
        />
        <TextInput
          label="Hasło"
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
          placeholderTextColor={'black'}
        />

        <Button mode="contained" onPress={handleLogin}>
          Zaloguj się
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    color: 'black',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
});

export default LoginScreen;
