import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Linking,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import colors from '../constants/colors';
import Button from '../components/Button';
import { GetStoreData } from '../helpers/General';
import { convertPointsToString } from '../helpers/convertPointsToString';
import LocationServices from '../services/LocationService';
import greenMarker from '../assets/images/user-green.png';
import backArrow from '../assets/images/backArrow.png';
import languages from '../locales/languages';
import CustomCircle from '../helpers/customCircle';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import _ from 'lodash';
import SafePathsAPI from '../services/API';
import { PLACES_API_KEY } from 'react-native-dotenv';

const width = Dimensions.get('window').width;

const base64 = RNFetchBlob.base64;
// This data source was published in the Lancet, originally mentioned in
// this article:
//    https://www.thelancet.com/journals/laninf/article/PIIS1473-3099(20)30119-5/fulltext
// The dataset is now hosted on Github due to the high demand for it.  The
// first Google Doc holding data (https://docs.google.com/spreadsheets/d/1itaohdPiAeniCXNlntNztZ_oRvjh0HsGuJXUJWET008/edit#gid=0)
// points to this souce but no longer holds the actual data.
const public_data =
  'https://raw.githubusercontent.com/beoutbreakprepared/nCoV2019/master/latest_data/latestdata.csv';
const show_button_text = languages.t('label.show_overlap');
const overlap_true_button_text = languages.t(
  'label.overlap_found_button_label',
);
const no_overlap_button_text = languages.t(
  'label.overlap_no_results_button_label',
);
const INITIAL_REGION = {
  latitude: 36.56,
  longitude: 20.39,
  latitudeDelta: 50,
  longitudeDelta: 50,
};

function distance(lat1, lon1, lat2, lon2) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist * 1.609344;
  }
}

const GooglePlacesInput = props => {
  return (
    <GooglePlacesAutocomplete
      placeholder='Search'
      minLength={2} // minimum length of text to search
      autoFocus={false}
      returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
      keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
      listViewDisplayed='auto' // true/false/undefined
      fetchDetails
      renderDescription={row => row.description} // custom description render
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log('DATA: ', data);
        console.log('DETAILS: ', details);
        props.setIsSearching(false);
        if (_.get(details, 'geometry.location')) {
          props.notifyChange(details.geometry.location);
        }
      }}
      textInputProps={{
        onFocus: () => props.setIsSearching(true),
      }}
      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: PLACES_API_KEY,
        language: 'en', // language of the results
      }}
      styles={{
        textInputContainer: {
          width: '100%',
        },
        description: {
          fontWeight: 'bold',
        },
        predefinedPlacesDescription: {
          color: '#1faadb',
        },
      }}
      nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
      GooglePlacesDetailsQuery={{
        // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
        fields: 'geometry',
      }}
      debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
      renderRightButton={() => (
        <TouchableWithoutFeedback
          onPress={() => {
            props.setIsSearching(false);
            Keyboard.dismiss();
          }}>
          <Text>X</Text>
        </TouchableWithoutFeedback>
      )}
    />
  );
};

function OverlapScreen() {
  const [region, setRegion] = useState({});
  const [markers, setMarkers] = useState([]);
  const [circles, setCircles] = useState([]);
  const [showButton, setShowButton] = useState({
    disabled: false,
    text: show_button_text,
  });
  const [initialRegion, setInitialRegion] = useState(INITIAL_REGION);
  const [isSearching, setIsSearching] = useState(false);
  const { navigate } = useNavigation();
  const mapView = useRef();

  async function populateMarkers(passedRegion) {
    SafePathsAPI.getPositions(passedRegion || initialRegion).then(
      userPositions => {
        let locationArray = _.get(userPositions, 'data', []);
        console.log('user positions: ', locationArray);
        if (locationArray !== null) {
          let markers = [];
          for (let i = 0; i < locationArray.length - 1; i += 1) {
            const coord = locationArray[i];
            console.log('coord: ', coord);
            const marker = {
              coordinate: {
                latitude: coord['location']['latitude'],
                longitude: coord['location']['longitude'],
              },
              key: i + 1,
              color: '#f26964',
            };
            console.log('marker: ', marker);
            markers.push(marker);
          }
          console.log('markers: ', markers);
          setMarkers(markers);
        }
      },
    );
  }

  async function getInitialState() {
    try {
      GetStoreData('LOCATION_DATA').then(locationArrayString => {
        const locationArray = JSON.parse(locationArrayString);
        if (locationArray !== null) {
          const { latitude, longitude } = locationArray.slice(-1)[0];

          mapView.current &&
            mapView.current.animateCamera({ center: { latitude, longitude } });

          setInitialRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          populateMarkers({
            latitude,
            longitude,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function downloadAndPlot() {
    // Downloads the file on the disk and loads it into memory
    try {
      setShowButton({
        disabled: true,
        text: languages.t('label.loading_public_data'),
      });

      RNFetchBlob.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
      })
        .fetch('GET', public_data, {})
        .then(res => {
          // the temp file path
          console.log('The file saved to ', res.path());
          try {
            RNFetchBlob.fs
              .readFile(res.path(), 'utf8')
              .then(records => {
                // delete the file first using flush
                res.flush();
                parseCSV(records).then(parsedRecords => {
                  console.log(parsedRecords);
                  console.log(Object.keys(parsedRecords).length);
                  plotCircles(parsedRecords).then(() => {
                    // if no overlap, alert user via button text
                    // this is a temporary fix, make it more robust later
                    if (Object.keys(parsedRecords).length !== 0) {
                      setShowButton({
                        disabled: false,
                        text: overlap_true_button_text,
                      });
                    } else {
                      setShowButton({
                        disabled: false,
                        text: no_overlap_button_text,
                      });
                    }
                  });
                });
              })
              .catch(e => {
                console.error('got error: ', e);
              });
          } catch (err) {
            console.log('ERROR:', err);
          }
        });
    } catch (e) {
      console.log(e);
    }
  }

  async function parseCSV(records) {
    try {
      const latestLat = initialRegion.latitude;
      const latestLong = initialRegion.longitude;
      const rows = records.split('\n');
      const parsedRows = {};

      for (let i = rows.length - 1; i >= 0; i--) {
        let row = rows[i].split(',');
        const lat = parseFloat(row[7]);
        const long = parseFloat(row[8]);
        if (!isNaN(lat) && !isNaN(long)) {
          if (true) {
            let key = String(lat) + '|' + String(long);
            if (!(key in parsedRows)) {
              parsedRows[key] = 0;
            }
            parsedRows[key] += 1;
          }
        }
      }
      return parsedRows;
    } catch (e) {
      console.log(e);
    }
  }

  const plotCircles = async records => {
    try {
      const circles = [];
      const distThreshold = 2000; //In KMs
      const latestLat = initialRegion.latitude;
      const latestLong = initialRegion.longitude;
      let index = 0;
      for (const key in records) {
        const latitude = parseFloat(key.split('|')[0]);
        const longitude = parseFloat(key.split('|')[1]);
        const count = records[key];
        if (
          !isNaN(latitude) &&
          !isNaN(longitude) &&
          distance(latestLat, latestLong, latitude, longitude) < distThreshold
        ) {
          const circle = {
            key: `${index}-${latitude}-${longitude}-${count}`,
            center: {
              latitude: latitude,
              longitude: longitude,
            },
            radius: 50 * count,
          };
          circles.push(circle);
        }
        index += 1;
      }
      console.log(circles.length, 'points found');
      setCircles(circles);
    } catch (e) {
      console.log(e);
    }
  };

  function backToMain() {
    navigate('LocationTrackingScreen', {});
  }

  function handleBackPress() {
    navigate('LocationTrackingScreen', {});
    return true;
  }

  useFocusEffect(
    React.useCallback(() => {
      getInitialState();
      populateMarkers();
      return () => {};
    }, []),
  );

  function moveToSearchArea(location) {
    const safeLocation = location.lat
      ? location
      : _.get(location, 'nativeEvent.coordinate.latitude', null)
      ? {
          lat: location.nativeEvent.coordinate.latitude,
          lng: location.nativeEvent.coordinate.longitude,
        }
      : null;
    if (safeLocation) {
      console.log(
        '======== moving area to searched location ======',
        safeLocation,
      );
      setInitialRegion({
        latitude: safeLocation.lat,
        longitude: safeLocation.lng,
        latitudeDelta: safeLocation.latitudeDelta || 0.01,
        longitudeDelta: safeLocation.longitudeDelta || 0.01,
      });
      populateMarkers({
        latitude: safeLocation.lat,
        longitude: safeLocation.lng,
      });
    }
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return function cleanup() {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  });

  // This map shows where your private location trail overlaps with public data from a variety of sources,
  // including official reports from WHO, Ministries of Health, and Chinese local, provincial, and national
  // health authorities. If additional data are available from reliable online reports, they are included.
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backArrowTouchable}
          onPress={backToMain}>
          <Image style={styles.backArrow} source={backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {languages.t('label.overlap_title')}
        </Text>
      </View>
      <GooglePlacesInput
        notifyChange={moveToSearchArea}
        setIsSearching={setIsSearching}
      />
      {!isSearching ? (
        <MapView
          ref={mapView}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          customMapStyle={customMapStyles}>
          {markers.map(marker => (
            <Marker
              key={marker.key}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              tracksViewChanges={false}
              image={greenMarker}
            />
          ))}
          {circles.map(circle => (
            <CustomCircle
              key={circle.key}
              center={circle.center}
              radius={circle.radius}
              fillColor='rgba(163, 47, 163, 0.3)'
              zIndex={2}
              strokeWidth={0}
            />
          ))}
        </MapView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    flex: 1,
    flexDirection: 'column',
    color: colors.PRIMARY_TEXT,
    backgroundColor: colors.WHITE,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
  },
  subHeaderTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    padding: 5,
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    textAlignVertical: 'top',
    // alignItems: 'center',
    padding: 15,
    width: '96%',
    alignSelf: 'center',
  },
  map: {
    flex: 11,
    width: width,
    alignSelf: 'center',
  },
  buttonTouchable: {
    borderRadius: 12,
    backgroundColor: '#665eff',
    height: 52,
    alignSelf: 'center',
    width: width * 0.7866,
    marginTop: 15,
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  mainText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    textAlignVertical: 'center',
    padding: 20,
  },
  smallText: {
    fontSize: 10,
    lineHeight: 24,
    fontWeight: '400',
    textAlignVertical: 'center',
    padding: 20,
  },

  headerContainer: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(189, 195, 199,0.6)',
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
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    fontFamily: 'OpenSans-Regular',
  },
  sectionFooter: {
    fontSize: 12,
    lineHeight: 24,
    marginTop: 12,
    fontFamily: 'OpenSans-Regular',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingBottom: 10,
  },
});

const customMapStyles = [
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [
      {
        saturation: '32',
      },
      {
        lightness: '-3',
      },
      {
        visibility: 'on',
      },
      {
        weight: '1.18',
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'all',
    stylers: [
      {
        saturation: '-70',
      },
      {
        lightness: '14',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [
      {
        saturation: '100',
      },
      {
        lightness: '-14',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
      {
        lightness: '12',
      },
    ],
  },
];

export default OverlapScreen;
