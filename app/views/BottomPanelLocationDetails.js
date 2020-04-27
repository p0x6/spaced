import React, { useState, useEffect, memo, useCallback } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import moment from 'moment';
import SafePathsAPI from '../services/API';
import _ from 'lodash';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  setMapLocation,
  setNavigation,
  setPlaceLocation,
} from '../reducers/actions';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { lineString as makeLineString } from '@turf/helpers';

const busyText = [
  'Not busy',
  'Less busy',
  'Usually busy',
  'Extremely busy',
  'Dangerously Busy',
];
const recommendationText = [
  'Recommended',
  'Use Caution',
  'Not Recommended',
  'Avoid',
  'Do NOT Go',
];

// const testPayload = {
//   "devicesAtPlaceNow": 0,
//   "densityNow": Math.floor((Math.random() * 150)),
//   "busyHours": [
//     {
//       "dayOfWeek": 1,
//       "timeRange": [
//         {
//           "timeRange": "9am - 12pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "12pm - 3pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "3pm - 6pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "6pm - 9pm",
//           "load": Math.floor((Math.random() * 150)),
//         }
//       ]
//     },
//     {
//       "dayOfWeek": 2,
//       "timeRange": [
//         {
//           "timeRange": "9am - 12pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "12pm - 3pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "3pm - 6pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "6pm - 9pm",
//           "load": Math.floor((Math.random() * 150)),
//         }
//       ]
//     },
//     {
//       "dayOfWeek": 3,
//       "timeRange": [
//         {
//           "timeRange": "9am - 12pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "12pm - 3pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "3pm - 6pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "6pm - 9pm",
//           "load": Math.floor((Math.random() * 150)),
//         }
//       ]
//     },
//     {
//       "dayOfWeek": 4,
//       "timeRange": [
//         {
//           "timeRange": "9am - 12pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "12pm - 3pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "3pm - 6pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "6pm - 9pm",
//           "load": Math.floor((Math.random() * 150)),
//         }
//       ]
//     },
//     {
//       "dayOfWeek": 5,
//       "timeRange": [
//         {
//           "timeRange": "9am - 12pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "12pm - 3pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "3pm - 6pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "6pm - 9pm",
//           "load": Math.floor((Math.random() * 150)),
//         }
//       ]
//     },
//     {
//       "dayOfWeek": 6,
//       "timeRange": [
//         {
//           "timeRange": "9am - 12pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "12pm - 3pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "3pm - 6pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "6pm - 9pm",
//           "load": Math.floor((Math.random() * 150)),
//         }
//       ]
//     },
//     {
//       "dayOfWeek": 7,
//       "timeRange": [
//         {
//           "timeRange": "9am - 12pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "12pm - 3pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "3pm - 6pm",
//           "load": Math.floor((Math.random() * 150)),
//         },
//         {
//           "timeRange": "6pm - 9pm",
//           "load": Math.floor((Math.random() * 150)),
//         }
//       ]
//     }
//   ]
// }

const BottomPanelLocationDetails = ({
  isSearching,
  modal,
  sliderRef,
  searchLocation,
  setMapLocation,
  setNavigation,
  setPlaceLocation,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(
    useCallback(() => {
      showFullPanel({ toValue: 120, velocity: -0.8 });
      setTimeout(() => setIsAnimating(false), 2000);
      // setBusyTimes(testPayload)
    }),
    [isSearching, searchLocation, modal],
  );

  const showFullPanel = (options = { toValue: null, velocity: null }) => {
    if (sliderRef && sliderRef.current) {
      sliderRef.current.show(options);
    }
  };

  const renderLocationTimeItem = item => {
    const busynessNumber = Math.min(Math.round(item.load / 25), 4);
    return (
      <View style={styles.busyTimesContainer}>
        <Text style={[styles.busyTimesListBaseText, styles.busyTimesTimeRange]}>
          {item.timeRange}
        </Text>
        <Text style={[styles.busyTimesListBaseText, styles.busyTimesBusyness]}>
          {busyText[busynessNumber]}
        </Text>
        <Text
          style={[
            styles.busyTimesListBaseText,
            styles.busyTimesRecommendation,
          ]}>
          {recommendationText[busynessNumber]}
        </Text>
      </View>
    );
  };

  const checkForInsufficientData = item => {
    let isSufficientDays = 0;
    for (let i = 0; i < item.length; i++) {
      if (item[i].load > 1) isSufficientDays++;
    }
    return isSufficientDays;
  };

  const renderInsufficentData = () => {
    return (
      <View>
        <Text
          style={[styles.busyTimesTimeRange, { fontSize: 16, marginTop: 10 }]}>
          Insufficient Data To Recommend Times
        </Text>
      </View>
    );
  };

  const renderLocationTimes = () => {
    console.log('busytimes', searchLocation.busyTimes);
    if (!searchLocation.busyTimes || searchLocation.busyTimes.length !== 7)
      return renderInsufficentData();
    const todayIndex = moment().format('d');
    const dayBusyTimes = searchLocation.busyTimes[todayIndex]['timeRange'];
    console.log(
      '===== TIME ======',
      todayIndex,
      searchLocation.busyTimes[todayIndex]['timeRange'],
    );
    if (!checkForInsufficientData(dayBusyTimes)) return renderInsufficentData();
    return (
      <View>
        <View
          style={{
            height: 0.3,
            backgroundColor: 'black',
            marginTop: 20,
            width: '100%',
          }}
        />
        {dayBusyTimes.map((item, index) => {
          return (
            <View key={index}>
              {renderLocationTimeItem(item)}
              <View style={styles.separator} />
            </View>
          );
        })}
      </View>
    );
  };

  const onNavigatePress = () => {
    sliderRef.current.hide();
    BackgroundGeolocation.getCurrentLocation(location => {
      const { latitude, longitude } = location;
      SafePathsAPI.getPathToDestination(
        [longitude, latitude],
        searchLocation.coordinates,
      ).then(data => {
        if (_.get(data, 'data.coordinates', null)) {
          const newRoute = makeLineString(data.data.coordinates);
          setMapLocation([20.39, 36.56]);
          setMapLocation([longitude, latitude]);
          setNavigation(newRoute);
        }
      });
    });
  };

  const renderLocationInfo = () => {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'space-around',
          marginTop: 10,
          width: '100%',
        }}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: 'DMSans-Medium',
                fontSize: 17,
                paddingBottom: 10,
                color: '#000',
              }}>
              {searchLocation.name}
            </Text>
            <TouchableOpacity
              style={{
                paddingBottom: 5,
              }}
              onPress={onNavigatePress}>
              <Text
                style={{
                  backgroundColor: '#435d8b',
                  borderRadius: 6,
                  padding: 8,
                  textAlign: 'center',
                  fontFamily: 'DMSans-Regular',
                  fontSize: 15,
                  color: 'white',
                  width: 118,
                  height: 35,
                }}>
                Navigate
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontFamily: 'DMSans-Regular',
              fontSize: 13,
              color: '#2E4874',
            }}>
            {searchLocation.address.split(',')[0]}
          </Text>
        </View>
      </View>
    );
  };

  const renderDragOval = () => {
    return (
      <View style={styles.ovalWrapper}>
        <View style={styles.oval} />
      </View>
    );
  };

  const renderDisclosure = () => {
    return (
      <Text style={styles.disclosure}>
        Follow CDC guideline on social distancing and state laws about shelter
        in place and stay at home before stepping out.
      </Text>
    );
  };

  if (!searchLocation || modal || isSearching) return null;

  return (
    <SlidingUpPanel
      allowDragging
      ref={sliderRef}
      draggableRange={{
        top: 520,
        bottom: isAnimating ? 0 : 200,
      }}
      snappingPoints={[420, 200]}
      showBackdrop={false}
      containerStyle={styles.panelContainer}
      minimumDistanceThreshold={10}
      friction={50}>
      <>
        <View style={styles.bottomDrawer}>
          <View style={{ flexDirection: 'row' }}>
            {renderDragOval()}
            <TouchableOpacity
              style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
              onPress={() => {
                BackgroundGeolocation.getCurrentLocation(location => {
                  const { latitude, longitude } = location;
                  setPlaceLocation({});
                  setNavigation(null);
                  setMapLocation([20.39, 36.56]);
                  setMapLocation([longitude, latitude]);
                });
              }}>
              <Image
                source={require('../assets/images/blue_close.png')}
                style={{ width: 14, height: 14, resizeMode: 'cover' }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[{ flexDirection: 'row', justifyContent: 'space-between' }]}>
            {renderLocationInfo()}
          </View>
          {renderLocationTimes()}
          {renderDisclosure()}
        </View>
      </>
    </SlidingUpPanel>
  );
};

const styles = StyleSheet.create({
  ovalWrapper: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 7,
  },
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
    borderRadius: 10,
  },
  panelContainer: {
    zIndex: 1,
    overflow: 'hidden',
    margin: 15,
  },
  // busy times list
  busyTimesListBaseText: {
    flex: 1,
    marginBottom: 20,
    fontFamily: 'DMSans-Medium',
  },
  busyTimesContainer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  busyTimesTimeRange: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  busyTimesBusyness: {
    fontSize: 12,
    color: '#000',
    opacity: 0.45,
    fontWeight: '500',
  },
  busyTimesRecommendation: {
    fontSize: 12,
    color: '#ff8649',
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 4,
    height: 1,
    backgroundColor: '#ccc',
  },
  disclosure: {
    marginTop: 15,
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: 12,
    color: '#435d8b',
  },
});

const mapStateToProps = state => ({
  searchLocation: state.placeLocation,
  isSearching: state.isSearching,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    { setMapLocation, setNavigation, setPlaceLocation },
    dispatch,
  );

export default memo(
  connect(mapStateToProps, mapDispatchToProps)(BottomPanelLocationDetails),
);
