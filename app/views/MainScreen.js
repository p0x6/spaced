import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  FlatList,
  Keyboard,
  Image,
  Linking,
} from 'react-native';
import LocationServices from '../services/LocationService';
import BroadcastingServices from '../services/BroadcastingService';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import { GetStoreData, SetStoreData } from '../helpers/General';
import MapView from './MapView';
import SlidingUpPanel from 'rn-sliding-up-panel';
import ToggleSwitch from 'toggle-switch-react-native';
import { useNavigation } from '@react-navigation/native';
import SearchAddress from './SearchAddress';
import { debounce } from 'debounce';
import MapBoxAPI from '../services/MapBoxAPI';
import SafePathsAPI from '../services/API';
import _ from 'lodash';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const linkIcon = require('../assets/images/link.png');
const blacklistIcon = require('../assets/images/blacklist.png');
const activitylogIcon = require('../assets/images/activitylog.png');

const INITIAL_REGION = {
  latitude: 36.56,
  longitude: 20.39,
  latitudeDelta: 50,
  longitudeDelta: 50,
};

const MainScreen = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [region, setRegion] = useState(INITIAL_REGION);
  const [userMarkers, setUserMarkers] = useState({});
  const [placeMarkers, setPlaceMarkers] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [predictions, setSearchPredictions] = useState([]);
  const [bounds, setBounds] = useState([]);

  const { navigate } = useNavigation();

  const mapRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      GetStoreData('PARTICIPATE')
        .then(isParticipating => {
          if (isParticipating === 'true') {
            setIsLogging(true);
            willParticipate();
            getInitialState();
          } else {
            setIsLogging(false);
          }
        })
        .catch(error => console.log(error));
      return BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackPress,
      );
    }),
    [],
  );

  const setInitialMapCenter = location => {
    setRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    populateMarkers({
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const getInitialState = () => {
    BackgroundGeolocation.getCurrentLocation(
      location => {
        console.log('========== MY LOCATION ========', location);
        setRegion(location);
      },
      () => {
        try {
          GetStoreData('LOCATION_DATA').then(locationArrayString => {
            const locationArray = JSON.parse(locationArrayString);
            if (locationArray !== null) {
              const { latitude, longitude } = locationArray.slice(-1)[0];
              setInitialMapCenter({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          });
        } catch (error) {
          console.log(error);
        }
      },
    );
  };

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

  const search = (text, currentLocation, bounds) => {
    let verifiedBounds = [];
    let verifiedLocation = { longitude: null, latitude: null };
    if (bounds && bounds.length === 4) {
      verifiedBounds = bounds[1].concat(bounds[0]);
    }
    if (
      currentLocation &&
      currentLocation.longitude &&
      currentLocation.latitude
    ) {
      verifiedLocation.longitude = currentLocation.longitude;
      verifiedLocation.latitude = currentLocation.latitude;
    }
    MapBoxAPI.search(text, verifiedLocation, verifiedBounds).then(result => {
      if (result && result.data && result.data.features) {
        console.log(result.data.features);
        setSearchPredictions(result.data.features);
      }
    });
  };

  const searchWithBounds = text => {
    if (mapRef && mapRef.current.state && mapRef.current.state.isReady) {
      mapRef.current.getVisibleBounds().then(bounds => {
        BackgroundGeolocation.getCurrentLocation(
          currentLocation => {
            search(text, currentLocation, bounds);
          },
          () => search(text, null, bounds),
        );
      });
    } else {
      BackgroundGeolocation.getCurrentLocation(
        currentLocation => {
          search(text, currentLocation);
        },
        () => search(text),
      );
    }
  };

  const willParticipate = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      // LocationServices.start();
      BroadcastingServices.start();
      setIsLogging(true);
    });

    // Check and see if they actually authorized in the system dialog.
    // If not, stop services and set the state to !isLogging
    // Fixes tripleblindmarket/private-kit#129
    BackgroundGeolocation.checkStatus(({ authorization }) => {
      if (authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
        LocationServices.stop();
        BroadcastingServices.stop();
        setIsLogging(false);
      }
    });
  };

  async function populateMarkers(passedRegion) {
    SafePathsAPI.getPositions(passedRegion || region).then(userPositions => {
      let userMarkers = _.get(userPositions, 'data.users', null);
      let placeMarkers = _.get(userPositions, 'data.places', null);
      console.log('---- markers -----', userMarkers, placeMarkers);
      setUserMarkers(userMarkers);
      setPlaceMarkers(placeMarkers);
    });
  }

  function moveToSearchArea(location) {
    const safeLocationArray = _.get(location, 'geometry.coordinates', []);
    const safeLocation = {
      latitude: safeLocationArray[1],
      longitude: safeLocationArray[0],
    };
    if (safeLocation) {
      console.log(
        '======== moving area to searched location ======',
        safeLocation,
      );
      setRegion({
        latitude: safeLocation.latitude,
        longitude: safeLocation.longitude,
        latitudeDelta: safeLocation.latitudeDelta || 0.01,
        longitudeDelta: safeLocation.longitudeDelta || 0.01,
      });
      populateMarkers({
        latitude: safeLocation.latitude,
        longitude: safeLocation.longitude,
      });
    }
  }

  const setOptOut = () => {
    SetStoreData('PARTICIPATE', 'false').then(() => {
      LocationServices.stop();
      BroadcastingServices.stop();
      setIsLogging(false);
    });
  };

  const changeSearchingState = state => {
    if (state) {
      setIsSearching(state);
    } else {
      setIsSearching(state);
      Keyboard.dismiss();
    }
  };

  const onChangeDestination = debounce(async destination => {
    if (destination && destination.length > 3) {
      searchWithBounds(destination);
    }
  }, 1000);

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View
          style={{ width: width, height: height, marginTop: 100, zIndex: 999 }}>
          <FlatList
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            style={{ borderTopWidth: 0.5, borderTopColor: '#BDBDBD' }}
            data={predictions}
            renderItem={onRenderSearchItems}
          />
        </View>
      );
    }
    return null;
  };

  const onRenderSearchItems = ({ item, index }) => {
    console.log('ITEM=>>', item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.box}
        onPress={() => {
          // this.refs.input.blur();
          changeSearchingState(false);
          moveToSearchArea(item);
        }}
        key={index}>
        <Text numberOfLines={1} style={styles.locationTitle}>
          {item.place_name}
        </Text>
      </TouchableOpacity>
    );
  };

  const showFullPanel = () => {
    if (sliderRef && sliderRef.current) {
      sliderRef.current.show();
    }
  };

  const hideFullPanel = () => {
    if (sliderRef && sliderRef.current) {
      sliderRef.current.hide();
    }
  };

  const renderLocationEnabledOptions = () => {
    if (!isLogging) return null;

    return (
      <>
        <View style={{ height: 0.3, backgroundColor: 'gray', marginTop: 15 }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20,
          }}>
          <View style={{ flexDirection: 'row' }}>
            <Image source={blacklistIcon} style={{ height: 33, width: 24 }} />
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingHorizontal: 15,
              }}>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 13,
                  color: '#2E4874',
                }}>
                BlackList
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 13,
                  color: '#2E4874',
                }}>
                location
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Image source={activitylogIcon} style={{ height: 33, width: 27 }} />
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 13,
                  color: '#2E4874',
                }}>
                Activity
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 13,
                  color: '#2E4874',
                }}>
                Log
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const toggleLocation = isOn => {
    if (isOn) {
      willParticipate();
      hideFullPanel();
    } else {
      setOptOut();
      showFullPanel();
    }
  };

  const handleLinkPress = useCallback(async url => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    }
  }, []);

  const renderBottomPanel = () => {
    if (isSearching) return null;
    return (
      <SlidingUpPanel
        allowDragging={isLogging}
        ref={sliderRef}
        draggableRange={{
          top: isLogging ? 400 : 330,
          bottom: 170,
        }}
        showBackdrop={false}
        containerStyle={styles.panelContainer}
        minimumDistanceThreshold={10}
        friction={50}>
        <>
          <View style={styles.bottomDrawer}>
            <View style={styles.ovalWrapper}>
              <View style={styles.oval} />
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
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
                  onToggle={toggleLocation}
                />
              </View>
            </View>
            <Text
              style={{
                fontFamily: 'DMSans-Regular',
                fontSize: 13,
                color: '#2E4874',
              }}>
              {isLogging
                ? 'Your location data is being logged and shared'
                : 'Enable location logging in order to use the map'}
            </Text>
            {renderLocationEnabledOptions()}
          </View>
          <View style={styles.helpDrawer}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                style={{
                  paddingTop: 10,
                  fontFamily: 'DMSans-Medium',
                  fontSize: 17,
                  color: '#000',
                }}>
                Help & Information
              </Text>
            </View>
            <View
              style={{ height: 0.3, backgroundColor: 'gray', marginTop: 15 }}
            />
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-around',
              }}>
              <TouchableOpacity
                style={{ marginTop: 10 }}
                onPress={() =>
                  handleLinkPress(
                    'https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/cases-in-us.html',
                  )
                }>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{
                      fontFamily: 'DMSans-Medium',
                      fontSize: 14,
                      color: '#000',
                    }}>
                    Information about COVID-19 in the United States
                  </Text>
                  <Image
                    source={linkIcon}
                    style={{ width: 15, height: 15, marginLeft: 10 }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: 'DMSans-Regular',
                    fontSize: 13,
                    color: '#2E4874',
                    paddingTop: 15,
                  }}>
                  Centers for Disease Control and Prevention
                </Text>
              </TouchableOpacity>
              <View
                style={{ height: 0.3, backgroundColor: 'gray', marginTop: 15 }}
              />
              <TouchableOpacity
                style={{ marginTop: 10 }}
                onPress={() =>
                  handleLinkPress(
                    'https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/testing.html',
                  )
                }>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{
                      fontFamily: 'DMSans-Medium',
                      fontSize: 14,
                      color: '#000',
                    }}>
                    Coronavirus Self Checker
                  </Text>
                  <Image
                    source={linkIcon}
                    style={{ width: 15, height: 15, marginLeft: 10 }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: 'DMSans-Regular',
                    fontSize: 13,
                    color: '#2E4874',
                    paddingTop: 15,
                  }}>
                  Centers for Disease Control and Prevention
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      </SlidingUpPanel>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        isLogging={isLogging}
        mapRef={mapRef}
        region={region}
        userMarkers={userMarkers}
        placeMarkers={placeMarkers}
      />
      <SearchAddress
        isSearching={isSearching}
        setIsSearching={changeSearchingState}
        onChangeDestination={onChangeDestination}
        isLogging={isLogging}
      />
      {renderSearchResults()}
      {renderBottomPanel()}
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
  helpDrawer: {
    marginTop: 10,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  panelContainer: {
    zIndex: 1,
    overflow: 'hidden',

    margin: 15,
  },
});

export default memo(MainScreen);
