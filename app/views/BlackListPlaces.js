import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import backArrow from '../assets/images/backArrow.png';
import editIcon from '../assets/images/edit.png';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../constants/colors';
import {
  getHomeLocation,
  getWorkLocation,
  setHomeLocation,
  setWorkLocation,
} from '../services/LocationService';
import BlacklistPlacesPanel from '../components/BlacklistPlacesPanel';
import _ from 'lodash';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapBoxAPI from '../services/MapBoxAPI';

const BlacklistPlaces = () => {
  const [homeAddress, setHomeAddress] = useState(null);
  const [homeCoords, setHomeCoords] = useState(null);
  const [workAddress, setWorkAddress] = useState(null);
  const [workCoords, setWorkCoords] = useState(null);
  const [searchType, setSearchType] = useState('Home');
  const [searchedResult, setSearchedResult] = useState([]);
  const [inputtingControl, setInputtingControl] = useState(null);
  const [searchString, setSearchString] = useState('');
  const { navigate } = useNavigation();

  const backToMain = () => {
    navigate('MainScreen', {});
  };

  const goToSearch = label => {
    navigate('SearchAddress', { label: label });
  };

  const getAddress = label => {
    if (label === 'Home') {
      return homeAddress;
    } else if (label === 'Work') {
      return workAddress;
    }
  };

  // useFocusEffect(() => {
  //   getHomeLocation().then(location => {
  //     if (location && location !== 'null') {
  //       const parsedLocation = JSON.parse(location);
  //       setHomeAddress(_.get(parsedLocation, 'address', null));
  //     }
  //   });
  //   getWorkLocation().then(location => {
  //     if (location && location !== 'null') {
  //       const parsedLocation = JSON.parse(location);
  //       setWorkAddress(_.get(parsedLocation, 'address', null));
  //     }
  //   });
  // }, []);

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
    MapBoxAPI.search(text, verifiedLocation, verifiedBounds).then(
      result => {
        if (result && result.data && result.data.features) {
          console.log(result.data.features);
          setSearchedResult(result.data.features);
        }
      },
      err => console.log("Can't Mapbox API search", err),
    );
  };

  const setAddress = (control, text) => {
    if (control === 'Home') {
      setHomeAddress(text);
    } else if (control === 'Work') {
      setWorkAddress(text);
    }
  };

  const setCoords = (control, geometry) => {
    const coords = {
      lat:
        geometry && geometry.coordinates && geometry.coordinates.length
          ? geometry.coordinates[0]
          : null,
      lng:
        geometry && geometry.coordinates && geometry.coordinates.length
          ? geometry.coordinates[1]
          : null,
    };

    if (control === 'Home') {
      setHomeCoords(coords);
    } else if (control === 'Work') {
      setWorkCoords(coords);
    }
  };

  const onChangeText = (control, text) => {
    setSearchString(text);
    setAddress(control, text);

    if (text.length > 0) {
      setInputtingControl(control);
    } else {
      setInputtingControl(null);
      return;
    }

    search(text, null, null);
  };

  const onPressClose = control => {
    setSearchString(null);
    setAddress(control, null);
    setInputtingControl(null);
  };

  const onPressItem = (control, item) => {
    setSearchString(null);
    setAddress(control, item.place_name);
    setCoords(control, item.geometry);
    setSearchedResult([]);
  };

  const onSubmitEditing = control => {
    if (searchType === 'Home') {
      setSearchType('Work');
      setHomeLocation({ address: homeAddress, coordinates: homeCoords });
    } else if (searchType === 'Work') {
      navigate('MainScreen');
      setWorkLocation({ address: workAddress, coordinates: workCoords });
    }
  };

  const onPressGoHome = () => {
    navigate('MainScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backArrowTouchable}
          onPress={backToMain}>
          <Image style={styles.backArrow} source={backArrow} />
        </TouchableOpacity>
        {/* <Text style={styles.headerTitle}>Edit Blacklist Locations</Text> */}
      </View>
      <View style={styles.container}>
        <View style={styles.blacklistPlacesPanelContainer}>
          <BlacklistPlacesPanel
            home={homeAddress}
            work={workAddress}
            type={searchType}
            searchedResult={searchedResult}
            inputtingControl={inputtingControl}
            onChangeText={(control, text) => onChangeText(control, text)}
            onPressClose={control => onPressClose(control)}
            onPressItem={(control, item) => onPressItem(control, item)}
            onSubmitEditing={control => onSubmitEditing(control)}
          />
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.goHomeButton} onPress={onPressGoHome}>
            <Text style={styles.goHomeButtonText}>Not now, take me home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    flex: 1,
    flexDirection: 'column',
    color: colors.PRIMARY_TEXT,
    backgroundColor: colors.WHITE,
  },
  item: {
    flex: 11,
    paddingLeft: 30,
    paddingTop: 10,
    fontSize: 18,
    height: 44,
  },
  address: {
    flex: 11,
    paddingLeft: 30,
    paddingTop: 10,
    fontSize: 14,
    height: 44,
  },
  edit: {
    flex: 1,
    paddingTop: 12,
    fontSize: 18,
    height: 44,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
  },
  headerContainer: {
    flexDirection: 'row',
    height: 60,
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(189, 195, 199,0.6)',
    alignItems: 'center',
  },
  backArrowTouchable: {
    width: 60,
    height: 60,
    paddingTop: 21,
    paddingLeft: 20,
  },
  backArrow: {
    height: 18,
    width: 18.48,
  },
  blacklistPlacesPanelContainer: {
    padding: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  goHomeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  goHomeButtonText: {
    color: '#222',
    padding: 16,
    fontSize: 16,
  },
});

export default BlacklistPlaces;
