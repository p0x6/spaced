import React, { Component } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { Provider } from 'react-redux';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './views/MainScreen';
import ExportScreen from './views/Export';
import ImportScreen from './views/Import';
import LicencesScreen from './views/Licenses';
import { GetStoreData } from './helpers/General';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Config from 'react-native-config';
import Onboarding from './views/Onboarding';
import OnboardingBlacklist from './views/OnboardingBlacklist';

MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN);

const Stack = createStackNavigator();

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialRouteName: '',
    };
  }

  componentDidMount() {
    GetStoreData('PARTICIPATE')
      .then(isParticipating => {
        console.log('PARTICIPATE', isParticipating);
        this.setState({
          initialRouteName: isParticipating,
        });
      })
      .catch(error => console.log('getting PARTICIPATE', error));
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='InitialScreen'>
              {this.state.initialRouteName === 'true' ? (
                <Stack.Screen
                  name='InitialScreen'
                  component={MainScreen}
                  options={{ headerShown: false }}
                />
              ) : (
                <Stack.Screen
                  name='InitialScreen'
                  component={Onboarding}
                  options={{ headerShown: false }}
                />
              )}
              <Stack.Screen
                name='MainScreen'
                component={MainScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='ExportScreen'
                component={ExportScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='ImportScreen'
                component={ImportScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='LicensesScreen'
                component={LicencesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='OnboardingBlacklist'
                component={OnboardingBlacklist}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PersistGate>
      </Provider>
    );
  }
}

export default Entry;
