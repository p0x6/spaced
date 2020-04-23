import React, { useState, useEffect, memo, useRef, useCallback } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  setMapLocation,
  setSearchingState,
  setPlaceLocation,
} from '../reducers/actions';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  FlatList,
  Keyboard,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import { GetStoreData } from '../helpers/General';
import MapView from './MapView';
import SearchAddress from './SearchAddress';
import { debounce } from 'debounce';
import MapBoxAPI from '../services/MapBoxAPI';
import SafePathsAPI from '../services/API';
import _ from 'lodash';
import BottomPanel from './BottomPanel';
import BottomPanelLocationDetails from './BottomPanelLocationDetails';
import BlacklistModal from './modals/BlacklistModal';
import ActivityLog from './modals/ActivityLog';
import AppInfo from './modals/AppInfo';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const createGeoJSON = item => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [item.coordinates.longitude, item.coordinates.latitude],
    },
    properties: item,
  };
};

const MainScreen = ({
  isLogging,
  setMapLocation,
  region,
  place,
  isSearching,
  setSearchingState,
  setPlaceLocation,
}) => {
  const [userMarkers, setUserMarkers] = useState(null);
  const [searchedResult, setSearchedResult] = useState([]);
  const [modal, setModal] = useState(null);

  const mapRef = useRef(null);
  const sliderRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      if (isLogging) getInitialState();
      SplashScreen.hide();
      return BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackPress,
      );
    }),
    [],
  );

  const getInitialState = () => {
    BackgroundGeolocation.getCurrentLocation(
      location => {
        const { latitude, longitude } = location;
        setMapLocation([longitude, latitude]);
        populateMarkers({ latitude, longitude });
      },
      () => {
        try {
          GetStoreData('LOCATION_DATA').then(locationArrayString => {
            const locationArray = JSON.parse(locationArrayString);
            if (locationArray !== null && locationArray.length >= 1) {
              const { latitude, longitude } = locationArray.slice(-1)[0];
              setMapLocation([longitude, latitude]);
              populateMarkers({ latitude, longitude });
            } else {
              setMapLocation([20.39, 36.56]);
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
      if (result && result.data && result.data.predictions) {
        setSearchedResult(result.data.predictions);
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
    SafePathsAPI.getPositions(
      passedRegion || { latitude: region[1], longitude: region[0] },
    ).then(userPositions => {
      let userMarkers = _.get(userPositions, 'data', null);
      console.log('---- markers -----', userMarkers);
      setUserMarkers(userMarkers);
    });
  }

  const changeSearchingState = state => {
    console.log('======= CHANGE SEARCHING STATE =======');
    if (state) {
      setSearchingState(state);
    } else {
      setSearchingState(state);
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

    if (!item || !item.description || !item.place_id) return null;

    const itemClick = item => {
      SafePathsAPI.getLocationInfo(item.place_id).then(data => {
        if (data && data.data) {
          const geoJSON = createGeoJSON(data.data);
          setMapLocation(geoJSON.geometry.coordinates);
          setPlaceLocation({
            coordinates: geoJSON.geometry.coordinates,
            name: geoJSON.properties.name,
            address: geoJSON.properties.address,
            busyTimes: geoJSON.properties.busyHours,
          });
        }
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.box}
        onPress={() => {
          // this.refs.input.blur();
          itemClick(item);
        }}
        key={index}>
        <Text numberOfLines={1} style={styles.locationTitle}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBottomPanel = () => {
    if (place && place.name) return null;
    return (
      <BottomPanel
        isSearching={isSearching}
        modal={modal}
        setModal={setModal}
        sliderRef={sliderRef}
        getInitialState={getInitialState}
      />
    );
  };

  const renderLocationDetailPanel = () => {
    if (place && !place.name) return null;
    return <BottomPanelLocationDetails modal={modal} sliderRef={sliderRef} />;
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
    return <ActivityLog setModal={setModal} modal={modal} />;
  };

  const renderAppInfoModal = () => {
    return <AppInfo setModal={setModal} modal={modal} />;
  };

  const renderSearchInput = () => {
    if (modal) return null;
    return (
      <SearchAddress
        textInputRef={textInputRef}
        isSearching={isSearching}
        setIsSearching={changeSearchingState}
        onChangeDestination={onChangeDestination}
        modal={modal}
        setModal={setModal}
        goToMyLocation={getInitialState}
      />
    );
  };

  return (
    <View style={styles.container}>
      <MapView mapRef={mapRef} userMarkers={userMarkers} />
      {renderSearchInput()}
      {renderBlacklistModal()}
      {renderActivityModal()}
      {renderSearchResults()}
      {renderAppInfoModal()}
      {renderBottomPanel()}
      {renderLocationDetailPanel()}
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
});

const mapStateToProps = state => ({
  isLogging: state.isLogging,
  region: state.mapLocation,
  place: state.placeLocation,
  isSearching: state.isSearching,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    { setMapLocation, setSearchingState, setPlaceLocation },
    dispatch,
  );

export default memo(connect(mapStateToProps, mapDispatchToProps)(MainScreen));
