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
} from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import { GetStoreData } from '../helpers/General';
import MapView from './MapView';
import SearchAddress from './SearchAddress';
import { debounce } from 'debounce';
import MapBoxAPI from '../services/MapBoxAPI';
import SafePathsAPI from '../services/API';
import _ from 'lodash';
import Modal from './Modal';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';
import BottomPanel from './BottomPanel';
import BlacklistModal from './modals/BlacklistModal';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

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
  const [searchedResult, setSearchedResult] = useState([]);
  const [modal, setModal] = useState(null);
  const [bounds, setBounds] = useState([]);

  const mapRef = useRef(null);
  const sliderRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      GetStoreData('PARTICIPATE')
        .then(isParticipating => {
          if (isParticipating === 'true') {
            getInitialState();
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
        setSearchedResult(result.data.features);
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
          style={{
            position: 'absolute',
            width: width,
            height: height,
            zIndex: 2,
            backgroundColor: 'white',
          }}>
          <View style={{ marginTop: 130 }}>
            <FlatList
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
              style={{ borderTopWidth: 0.5, borderTopColor: '#BDBDBD' }}
              data={searchedResult}
              renderItem={onRenderSearchItems}
            />
          </View>
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

  const renderBottomPanel = () => {
    return (
      <BottomPanel
        isLogging={isLogging}
        setIsLogging={setIsLogging}
        isSearching={isSearching}
        modal={modal}
        setModal={setModal}
        sliderRef={sliderRef}
      />
    );
  };

  const renderBlacklistModal = () => {
    return (
      <BlacklistModal
        modal={modal}
        setModal={setModal}
        search={search}
        searchedResult={searchedResult}
        setSearchedResult={setSearchedResult}
      />
    );
  };

  const renderActivityModal = () => {
    if (modal !== 'activity') return null;

    const getDate = date => {
      const dates = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const dateObj = new Date(date);
      return dates[dateObj.getUTCDay()];
    };
    const sampleData = [
      {
        count: 11,
        date: '2020-03-30',
      },
    ];
    return (
      <Modal exitModal={() => setModal(null)}>
        <>
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
          <Text>Shows the number of people you had contact with</Text>

          <View style={styles.main}>
            <>
              <VictoryChart height={0.35 * height} dependentAxis>
                <VictoryAxis dependentAxis />
                <VictoryAxis
                  dependentAxis={false}
                  tickFormat={t => `${getDate(t)}`}
                />

                <VictoryBar
                  alignment='start'
                  labels={({ datum }) => datum.count}
                  data={sampleData}
                  x='date'
                  y='count'
                />
              </VictoryChart>
              <View style={styles.notificationsHeader}>
                <Text style={styles.notificationsHeaderText}>
                  Intersections today
                </Text>
              </View>
              <View style={styles.notificationView}>
                <Text>{sampleData[0].date}</Text>
                <Text style={styles.notificationsText}>
                  {sampleData[0].count}
                </Text>
              </View>
            </>
          </View>
        </>
      </Modal>
    );
  };

  const renderSearchInput = () => {
    if (modal) return null;
    return (
      <SearchAddress
        textInputRef={textInputRef}
        isSearching={isSearching}
        setIsSearching={changeSearchingState}
        onChangeDestination={onChangeDestination}
        isLogging={isLogging}
      />
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
      {renderSearchInput()}
      {renderBlacklistModal()}
      {renderActivityModal()}
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
  box: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#BDBDBD',
    padding: 15,
  },
  // activity
  main: {
    flex: 1,
    paddingVertical: 20,
    width: '100%',
  },
  notificationsHeader: {
    backgroundColor: 'rgba(175, 186, 205, 0.27)',
    width: width * 0.95,
    marginLeft: -Math.abs(width * 0.03),
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  notificationsHeaderText: {
    marginLeft: Math.abs(width * 0.03),
    color: '#435d8b',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
  notificationView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  notificationsText: {
    color: '#435d8b',
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
});

export default memo(MainScreen);
