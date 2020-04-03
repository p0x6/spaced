import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  BackHandler,
} from 'react-native';
import LocationServices from '../services/LocationService';
import BroadcastingServices from '../services/BroadcastingService';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import { GetStoreData, SetStoreData } from '../helpers/General';
import OverlapScreen from './Overlap';
import SlidingUpPanel from 'rn-sliding-up-panel';
import ToggleSwitch from 'toggle-switch-react-native';
import { useNavigation } from '@react-navigation/native';

const width = Dimensions.get('window').width;

const LocationTracking = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [panelHeight, setPanelHeight] = useState(180);
  const { navigate } = useNavigation();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    GetStoreData('PARTICIPATE')
      .then(isParticipating => {
        if (isParticipating === 'true') {
          setIsLogging(true);
          willParticipate();
        } else {
          setIsLogging(false);
        }
      })
      .catch(error => console.log(error));

    return BackHandler.removeEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
  }, []);

  const handleBackPress = () => {
    BackHandler.exitApp(); // works best when the goBack is async
    return true;
  };

  const toExport = () => navigate('ExportScreen', {});

  const toImport = () => navigate('ImportScreen', {});

  const blacklistPlaces = () => navigate('BlacklistPlaces', {});

  const toNews = () => navigate('NewsScreen', {});

  const licenses = () => navigate('LicensesScreen', {});

  const notifications = () => navigate('NotificationScreen', {});

  const willParticipate = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      LocationServices.start();
      BroadcastingServices.start();
    });

    // Check and see if they actually authorized in the system dialog.
    // If not, stop services and set the state to !isLogging
    // Fixes tripleblindmarket/private-kit#129
    BackgroundGeolocation.checkStatus(({ authorization }) => {
      if (authorization === BackgroundGeolocation.AUTHORIZED) {
        setIsLogging(true);
      } else if (authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
        LocationServices.stop();
        BroadcastingServices.stop();
        setIsLogging(false);
      }
    });
  };

  const setOptOut = () => {
    LocationServices.stop();
    BroadcastingServices.stop();
    setIsLogging(false);
  };

  return (
    <View style={styles.container}>
      <OverlapScreen />
      <TouchableOpacity
        style={styles.searchInput}
        onPress={() => {
          navigate('SearchAddress', {});
        }}>
        <Text style={{ color: '#2E4874' }}>Search location or zip code</Text>
      </TouchableOpacity>
      <SlidingUpPanel
        draggableRange={{
          top: panelHeight,
          bottom: 80,
        }}
        showBackdrop={false}
        containerStyle={styles.panelContainer}
        minimumDistanceThreshold={10}
        friction={50}>
        <View style={styles.bottomDrawer}>
          <View style={styles.ovalWrapper}>
            <View style={styles.oval} />
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: 'OpenSans-SemiBold',
                fontSize: 17,
                color: '#000',
              }}>
              {isLogging
                ? 'Stop logging my location'
                : 'Start logging my location'}
            </Text>
            <View style={{ paddingRight: 20, height: 40, marginTop: 5 }}>
              <ToggleSwitch
                isOn={isLogging}
                onColor='#2E4874'
                offColor='#2E4874'
                onToggle={isOn => (isOn ? willParticipate() : setOptOut())}
              />
            </View>
          </View>
          <Text
            style={{
              fontFamily: 'OpenSans-Regular',
              fontSize: 13,
              color: '#2E4874',
            }}>
            {isLogging ? 'Your location data is being logged and shared' : ''}
          </Text>
          <View
            style={{ height: 0.3, backgroundColor: 'gray', marginTop: 15 }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
            }}>
            <View style={{ justifyContent: 'center', alignSelf: 'center' }}>
              <View>
                <Text
                  style={{
                    fontFamily: 'OpenSans-Regular',
                    fontSize: 13,
                    color: '#2E4874',
                  }}>
                  BlockList
                </Text>
                <Text
                  style={{
                    fontFamily: 'OpenSans-Regular',
                    fontSize: 13,
                    color: '#2E4874',
                  }}>
                  location
                </Text>
              </View>
            </View>
            <View style={{ justifyContent: 'center', alignSelf: 'center' }}>
              <Text
                style={{
                  fontFamily: 'OpenSans-Regular',
                  fontSize: 13,
                  color: '#2E4874',
                }}>
                Activity
              </Text>
              <Text
                style={{
                  fontFamily: 'OpenSans-Regular',
                  fontSize: 13,
                  color: '#2E4874',
                }}>
                Log
              </Text>
            </View>
          </View>
        </View>
      </SlidingUpPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    flex: 1,
    alignItems: 'center',
  },
  searchInput: {
    zIndex: 999,
    position: 'absolute',
    top: 0,
    backgroundColor: '#fff',
    padding: 20,
    width: '95%',
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#B0C6E2',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  ovalWrapper: { alignItems: 'center', width: '100%', paddingBottom: 7 },
  oval: {
    width: 40,
    height: 7,
    backgroundColor: '#CAD2D3',
    borderRadius: 40,
  },
  bottomDrawer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  panelContainer: {
    zIndex: 9999,
    overflow: 'hidden',

    margin: 15,
  },
});

export default LocationTracking;
