import React, { memo, useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  setBlacklistLocation,
  setBlacklistOnboardingStatus,
} from '../reducers/actions';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Keyboard,
} from 'react-native';
import colors from '../constants/colors';
import _ from 'lodash';
import { setHomeLocation, setWorkLocation } from '../services/LocationService';
import { EventRegister } from 'react-native-event-listeners';
import { useNavigation } from '@react-navigation/native';
import MapBoxAPI from '../services/MapBoxAPI';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const BlacklistPlacesPanel = ({
  isOnboarding,
  homeAddress,
  workAddress,
  setBlacklistLocation,
  setBlacklistOnboardingStatus,
}) => {
  const [searchInput, setSearchInput] = useState({ home: null, work: null });
  const [searchedResult, setSearchedResult] = useState([]);
  const [inputtingControl, setInputtingControl] = useState(null);
  const [searchType, setSearchType] = useState(isOnboarding ? 'Home' : 'All');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [keyboardShowing, setKeyboardShowing] = useState(false);

  const { navigate } = useNavigation();

  console.log('===== HERE=======', homeAddress, workAddress);

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
    MapBoxAPI.mapboxSearch(text, verifiedLocation, verifiedBounds).then(
      result => {
        if (result && result.data && result.data.features) {
          setSearchedResult(result.data.features);
        }
      },
      err => console.log("Can't Mapbox API search", err),
    );
  };

  useEffect(
    useCallback(() => {
      getCurrentLocation();
      setSearchInput({ home: homeAddress, work: workAddress });
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => setKeyboardShowing(true),
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => setKeyboardShowing(false),
      );

      return function removeListeners() {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }),
    [isOnboarding],
  );

  const getCurrentLocation = () => {
    BackgroundGeolocation.getCurrentLocation(location => {
      setCurrentLocation(location);
    });
  };

  const setAddress = (control, text) => {
    if (control === 'Home') {
      setSearchInput({ ...searchInput, home: text });
    } else if (control === 'Work') {
      setSearchInput({ ...searchInput, work: text });
    }
  };

  const onChangeText = (control, text) => {
    setAddress(control, text);

    if (text.length > 0) {
      setInputtingControl(control);
    } else {
      setInputtingControl(null);
      return;
    }

    search(text, currentLocation, null);
  };

  const onPressItem = (control, item) => {
    Keyboard.dismiss();
    const address = _.get(item, 'place_name', '').split(',')[0];
    const coordinates = _.get(item, 'geometry.coordinates', []);
    setAddress(control, address);
    const location = control.toUpperCase();
    setBlacklistLocation(location, address);

    if (location === 'HOME') setHomeLocation(coordinates);
    if (location === 'WORK') setWorkLocation(coordinates);
    EventRegister.emit(`set-${location}-location`, coordinates);

    setSearchedResult([]);
    console.log('===== SOMETHING =====', searchType, isOnboarding);
    if (searchType === 'Home' && isOnboarding) {
      setSearchType('Work');
    } else if (searchType === 'Work') {
      setBlacklistOnboardingStatus(true);
      navigate('MainScreen', {});
    }
  };

  const onLocationClear = control => {
    const location = control.toUpperCase();
    setBlacklistLocation(location, null);
    EventRegister.emit(`set-${location}-location`, []);
    if (location === 'HOME') setHomeLocation([]);
    if (location === 'WORK') setWorkLocation([]);
    setAddress(control, null);
  };

  const renderCloseButton = control => {
    if (control === 'Home' && (!homeAddress || homeAddress.length === 0))
      return;
    if (control === 'Work' && (!workAddress || workAddress.length === 0))
      return;

    return (
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => onLocationClear(control)}>
          <Image
            source={require('../assets/images/blue_close.png')}
            style={styles.pinClose}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSearchItems = (ref, item, index, control) => {
    return (
      <TouchableOpacity
        key={index.toString()}
        activeOpacity={0.8}
        style={styles.itemButton}
        onPress={() => onPressItem(control, item)}>
        <Text numberOfLines={1} style={styles.locationTitle}>
          {item.place_name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAddedPanel = control => {
    if (inputtingControl !== control) return;
    if (
      (inputtingControl === 'Home' && !searchInput.home) ||
      (inputtingControl === 'Work' && !searchInput.work) ||
      searchedResult.length === 0
    )
      return;

    return (
      <View style={styles.resultsContainer}>
        {searchedResult.map((item, index) => {
          return (
            <View>
              {renderSearchItems(this, item, index, control)}
              <View style={styles.separator} />
            </View>
          );
        })}
      </View>
    );
  };

  const renderContent = control => {
    const value = control === 'Home' ? searchInput.home : searchInput.work;

    return (
      <View style={styles.addedContainer}>
        <View style={styles.searchBarContainer}>
          <View style={styles.markContainer}>
            <Text style={styles.markText}>{control}</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Search Address'
              style={styles.inputText}
              returnKeyLabel='Go'
              returnKeyType='go'
              value={value}
              autoCorrect={false}
              onChangeText={text => onChangeText(control, text)}
            />
          </View>
          {renderCloseButton(control)}
        </View>
        {renderAddedPanel(control)}
      </View>
    );
  };

  const renderHome = () => {
    if (searchType === 'All' || searchType === 'Home') {
      return renderContent('Home');
    }
    return null;
  };

  const renderWork = () => {
    if (searchType === 'All' || searchType === 'Work') {
      return renderContent('Work');
    }
    return null;
  };

  const renderDescriptionText = () => {
    if (keyboardShowing) return null;
    switch (searchType) {
      case 'Home':
        return 'Spaced NEVER shares your blacklisted locations.\n\nYou can blacklist your home location so that others will not be able to see you within a big radius of your home.\n\nData inside the radius will NEVER leave your phone.';
      case 'Work':
        return 'You can also blacklist your work location as well so you will not be tracked at work';
      default:
        return "Spaced NEVER shares your blacklisted locations.\n\nYou can blacklist a location like home or office, so that others don't see your location.\n\nData inside the radius will NEVER leave your phone.";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Image
          source={require('../assets/images/blacklist.png')}
          style={styles.pinImage}
        />
        <Text style={styles.labelText}>Blacklist{'\n'}location</Text>
      </View>
      <View style={styles.commentTextContainer}>
        <Text style={styles.commentText}>{renderDescriptionText()}</Text>
      </View>
      {renderHome()}
      {renderWork()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    // borderWidth: 1,
  },
  pinImage: {
    width: 22,
    height: 30,
    resizeMode: 'stretch',
    marginRight: 16,
  },
  labelText: {
    fontSize: 14,
    color: colors.BLACK,
  },
  commentTextContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  commentText: {
    color: colors.BLUE_TEXT_COLOR,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    letterSpacing: 1,
  },
  addedContainer: {},
  searchBarContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    height: 40,
    marginTop: 16,
  },
  markContainer: {
    backgroundColor: '#B7BFCE',
    borderRadius: 4,
    width: '24%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markText: {
    color: '#435d8b',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    justifyContent: 'center',
    flex: 1,
  },
  inputText: {
    color: '#49638e',
    fontSize: 16,
  },
  closeButtonContainer: {
    justifyContent: 'center',
    padding: 4,
  },
  closeButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  pinClose: {
    width: 12,
    height: 12,
    resizeMode: 'cover',
  },
  resultsContainer: {},
  separator: {
    marginHorizontal: 4,
    height: 1,
    backgroundColor: '#ccc',
  },
  itemButton: {
    paddingVertical: 16,
  },
});

const mapStateToProps = state => ({
  homeAddress: state.blacklistLocations.HOME,
  workAddress: state.blacklistLocations.WORK,
});

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setBlacklistLocation,
      setBlacklistOnboardingStatus,
    },
    dispatch,
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(memo(BlacklistPlacesPanel));
