import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './src/store/store';
import {Nav} from './src/screens/Nav';

const App = () => {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Nav />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;
