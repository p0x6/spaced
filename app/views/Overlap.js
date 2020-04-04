import React, { useState, useEffect, useRef, memo } from 'react';
import {
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
import MapboxGL from '@react-native-mapbox-gl/maps';
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
import hi from '../locales/hi';
import { PLACES_API_KEY, MAPBOX_ACCESS_TOKEN } from 'react-native-dotenv';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

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

const layerStyles = {
  singlePoint: {
    circleColor: 'green',
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleRadius: 5,
    circlePitchAlignment: 'map',
  },

  clusteredPoints: {
    circlePitchAlignment: 'map',

    circleColor: [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1',
    ],

    circleRadius: ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: '{point_count}',
    textSize: 12,
    textPitchAlignment: 'map',
  },
};

const OverlapScreen = ({ isLogging, mapRef, region }) => {
  const { navigate } = useNavigation();

  function handleBackPress() {
    navigate('LocationTrackingScreen', {});
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return function cleanup() {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [region]);

  // This map shows where your private location trail overlaps with public data from a variety of sources,
  // including official reports from WHO, Ministries of Health, and Chinese local, provincial, and national
  // health authorities. If additional data are available from reliable online reports, they are included.
  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL='mapbox://styles/mapbox/light-v10'
        zoomEnabled={isLogging}
        scrollEnabled={isLogging}
        pitchEnabled={isLogging}
        rotateEnabled={isLogging}>
        <MapboxGL.Camera
          zoomLevel={15}
          centerCoordinate={[region.longitude, region.latitude]}
          animationMode={'flyTo'}
        />
        <MapboxGL.UserLocation />

        <MapboxGL.ShapeSource
          id='earthquakes'
          cluster
          clusterRadius={50}
          clusterMaxZoom={14}
          url='https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'>
          <MapboxGL.SymbolLayer
            id='pointCount'
            style={layerStyles.clusterCount}
          />

          <MapboxGL.CircleLayer
            id='clusteredPoints'
            belowLayerID='pointCount'
            filter={['has', 'point_count']}
            style={layerStyles.clusteredPoints}
          />

          <MapboxGL.CircleLayer
            id='singlePoint'
            filter={['!', ['has', 'point_count']]}
            style={layerStyles.singlePoint}
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
  },
  map: {
    width: width,
    height: height,
    alignSelf: 'center',
  },

  // headerContainer: {
  //   flexDirection: 'row',
  //   height: 60,
  //   borderBottomWidth: 1,
  //   borderBottomColor: 'rgba(189, 195, 199,0.6)',
  //   alignItems: 'center',
  // },
  // backArrowTouchable: {
  //   width: 60,
  //   height: 60,
  //   paddingTop: 21,
  //   paddingLeft: 20,
  // },
  // backArrow: {
  //   height: 18,
  //   width: 18.48,
  // },
});

// const customMapStyles = [
//   {
//     featureType: 'all',
//     elementType: 'all',
//     stylers: [
//       {
//         saturation: '32',
//       },
//       {
//         lightness: '-3',
//       },
//       {
//         visibility: 'on',
//       },
//       {
//         weight: '1.18',
//       },
//     ],
//   },
//   {
//     featureType: 'administrative',
//     elementType: 'labels',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     featureType: 'landscape',
//     elementType: 'labels',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     featureType: 'landscape.man_made',
//     elementType: 'all',
//     stylers: [
//       {
//         saturation: '-70',
//       },
//       {
//         lightness: '14',
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'labels',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'labels',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     featureType: 'transit',
//     elementType: 'labels',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'all',
//     stylers: [
//       {
//         saturation: '100',
//       },
//       {
//         lightness: '-14',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'labels',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//       {
//         lightness: '12',
//       },
//     ],
//   },
// ];

export default memo(OverlapScreen);
