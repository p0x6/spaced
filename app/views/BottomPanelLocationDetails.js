import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';
import moment from 'moment';

const width = Dimensions.get('window').width;
const timeText = [
  '9 am to 12 pm',
  '12 pm to 3 pm',
  '3 pm to 6 pm',
  '6 pm to 9 pm',
];
const busyText = ['Not busy', 'Less busy', 'Usually busy', 'Extremely busy'];
const recommendationTest = [
  'Recommended',
  'Use Caution',
  'Not Recommended',
  'Avoid',
];

const BottomPanelLocationDetails = ({
  isSearching,
  modal,
  sliderRef,
  searchLocation,
  setSearchLocation,
  setDisplayRoute,
  setPlaceMarkers,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [busyTimes, setBusyTimes] = useState([]);

  useEffect(
    useCallback(() => {
      showFullPanel({ toValue: 120, velocity: -0.8 });
      setTimeout(() => setIsAnimating(false), 2000);
      const testData = [0, 1, 3, 2];
      setBusyTimes(testData);
    }),
    [isSearching, searchLocation, modal],
  );

  const showFullPanel = (options = { toValue: null, velocity: null }) => {
    if (sliderRef && sliderRef.current) {
      sliderRef.current.show(options);
    }
  };

  const renderLocationTimeItem = index => {
    const busyness = busyTimes[index];
    return (
      <View style={styles.busyTimesContainer}>
        <Text style={[styles.busyTimesListBaseText, styles.busyTimesTimeRange]}>
          {timeText[busyness]}
        </Text>
        <Text style={[styles.busyTimesListBaseText, styles.busyTimesBusyness]}>
          {busyText[busyness]}
        </Text>
        <Text
          style={[
            styles.busyTimesListBaseText,
            styles.busyTimesRecommendation,
          ]}>
          {recommendationTest[busyness]}
        </Text>
      </View>
    );
  };

  const renderLocationTimes = () => {
    console.log('busytimes', busyTimes);
    if (!busyTimes || busyTimes.length !== 4) return null;
    return (
      <View>
        {busyTimes.map((item, index) => {
          return (
            <View key={index}>
              {renderLocationTimeItem(index)}
              <View style={styles.separator} />
            </View>
          );
        })}
      </View>
    );
  };

  const onNavigatePress = () => {
    sliderRef.current.hide();
    setDisplayRoute(true);
  };

  const renderLocationEnabledOptions = () => {
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
              {searchLocation.text}
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
            {searchLocation.properties.address}
          </Text>
        </View>
        <View
          style={{
            height: 0.3,
            backgroundColor: 'black',
            marginTop: 20,
            width: '100%',
          }}
        />
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
        top: 420,
        bottom: isAnimating ? 0 : 160,
      }}
      snappingPoints={[420, 180]}
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
                setSearchLocation(null);
                setDisplayRoute(false);
                setPlaceMarkers(null);
              }}>
              <Image
                source={require('../assets/images/blue_close.png')}
                style={{ width: 14, height: 14, resizeMode: 'cover' }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[{ flexDirection: 'row', justifyContent: 'space-between' }]}>
            {renderLocationEnabledOptions()}
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

export default memo(BottomPanelLocationDetails);
