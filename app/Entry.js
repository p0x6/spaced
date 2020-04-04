import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native';
import LocationTracking from './views/LocationTracking';
import Welcome from './views/Welcome';
import NewsScreen from './views/News';
import ExportScreen from './views/Export';
import ImportScreen from './views/Import';
import OverlapScreen from './views/Overlap';
import SettingsScreen from './views/Settings';
import LicencesScreen from './views/Licenses';
import NotificationScreen from './views/Notification';
import SimpleWelcomeScreen from './views/welcomeScreens/SimpleWelcomeScreen';
import { GetStoreData } from './helpers/General';
import BlacklistPlaces from './views/BlackListPlaces';
import SearchAddress from './views/SearchAddress';

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
        console.log(isParticipating);
        this.setState({
          initialRouteName: isParticipating,
        });
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Navigator initialRouteName='InitialScreen'>
            {this.state.initialRouteName === 'true' ? (
              <Stack.Screen
                name='InitialScreen'
                component={LocationTracking}
                options={{ headerShown: false }}
              />
            ) : (
              <Stack.Screen
                name='InitialScreen'
                component={SimpleWelcomeScreen}
                options={{ headerShown: false }}
              />
            )}
            <Stack.Screen
              name='SimpleWelcomeScreen'
              component={SimpleWelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='WelcomeScreen'
              component={Welcome}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='LocationTrackingScreen'
              component={LocationTracking}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='NewsScreen'
              component={NewsScreen}
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
              name='SettingsScreen'
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='LicensesScreen'
              component={LicencesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='NotificationScreen'
              component={NotificationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='OverlapScreen'
              component={OverlapScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='BlacklistPlaces'
              component={BlacklistPlaces}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='SearchAddress'
              component={SearchAddress}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    );
  }
}

export default Entry;
