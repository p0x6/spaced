import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Linking,
  Dimensions,
  Animated,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import { GetStoreData, SetStoreData } from '../helpers/General';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';
import moment from 'moment';

const width = Dimensions.get('window').width;

const blacklistIcon = require('../assets/images/blacklist.png');
const linkIcon = require('../assets/images/link.png');

const BottomPanelLocationDetails = ({
  isSearching,
  modal,
  sliderRef,
  searchLocation,
  setSearchLocation,
  setDisplayRoute,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [busyTimes, setBusyTimes] = useState([]);

  useEffect(
    useCallback(() => {
      showFullPanel({ toValue: 120, velocity: -0.8 });
      setTimeout(() => setIsAnimating(false), 2000);
      const testData = [];
      for (let i = 9; i <= 19; i++) {
        testData.push({
          hour: formatTime(i),
          count: Math.floor(Math.random() * 100),
        });
      }
      setBusyTimes(testData);
    }),
    [isSearching, searchLocation, modal],
  );

  const formatTime = hour => {
    const formatHour = hour % 12 ? hour % 12 : 12;
    let hourString = formatHour.toString();
    if (hour / 10 < 1) {
      return `${hourString}A`;
    } else {
      return `${hourString}P`;
    }
  };

  const showFullPanel = (options = { toValue: null, velocity: null }) => {
    if (sliderRef && sliderRef.current) {
      sliderRef.current.show(options);
    }
  };

  const renderLocationEnabledOptions = () => {
    return (
      <>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-around',
            marginTop: 20,
            width: '100%',
          }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: 'DMSans-Medium',
                fontSize: 17,
                paddingBottom: 20,
                color: '#000',
              }}>
              {searchLocation.text}
            </Text>
            <TouchableOpacity
              style={{
                paddingBottom: 20,
              }}
              onPress={() => setDisplayRoute(true)}>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 17,
                  color: '#000',
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
          <View
            style={{ height: 0.3, backgroundColor: 'black', marginTop: 20 }}
          />
        </View>
      </>
    );
  };

  const renderDragOval = () => {
    return (
      <View style={styles.ovalWrapper}>
        <View style={styles.oval} />
      </View>
    );
  };

  const renderBusyTimes = () => {
    return (
      <View style={{ paddingTop: 20 }}>
        <Text
          style={{
            fontFamily: 'DMSans-Medium',
            fontSize: 17,
            paddingBottom: 20,
            color: '#000',
          }}>
          {moment().format('dddd')}'s Popular Times
        </Text>
        <VictoryChart
          domainPadding={{ x: [0, 32] }}
          width={width * 0.9}
          height={216}
          padding={{ left: 24, right: 24, top: 24, bottom: 36 }}>
          <VictoryAxis
            orientation='left'
            dependentAxis
            style={{
              axis: { stroke: 'transparent' },
              grid: {
                stroke: ({ tick }) => (tick === 6 ? '#999' : '#ccc'),
                strokeDasharray: ({ tick }) => (tick === 6 ? [8, 4] : null),
              },
              tickLabels: { fontSize: 12, dx: -20, dy: -4, fill: '#aaa' },
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: '#ccc' },
              tickLabels: { fontSize: 12 },
            }}
            tickFormat={t => (t ? `${t}` : '')}
          />
          <VictoryBar
            alignment='start'
            barWidth={18}
            cornerRadius={{ topLeft: 2, topRight: 2 }}
            height={100}
            style={{
              data: {
                fill: ({ datum }) =>
                  datum.count <= 30
                    ? '#aaff66'
                    : datum.count <= 60
                    ? '#ff950d'
                    : '#ff6666',
              },
            }}
            data={busyTimes}
            x='hour'
            y='count'
          />
        </VictoryChart>
      </View>
    );
  };

  if (!searchLocation || modal || isSearching) return null;

  return (
    <SlidingUpPanel
      allowDragging
      ref={sliderRef}
      draggableRange={{
        top: 430,
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
          {renderBusyTimes()}
        </View>
      </>
    </SlidingUpPanel>
  );
};

const styles = StyleSheet.create({
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
    borderRadius: 10,
  },
  panelContainer: {
    zIndex: 1,
    overflow: 'hidden',
    margin: 15,
  },
});

export default memo(BottomPanelLocationDetails);
