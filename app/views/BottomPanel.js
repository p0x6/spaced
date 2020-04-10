import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Linking,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import ToggleSwitch from 'toggle-switch-react-native';
import { GetStoreData, SetStoreData } from '../helpers/General';
import BroadcastingServices from '../services/BroadcastingService';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import LocationServices from '../services/LocationService';

const blacklistIcon = require('../assets/images/blacklist.png');
const linkIcon = require('../assets/images/link.png');
const activitylogIcon = require('../assets/images/activitylog.png');

const BottomPanel = ({
  isSearching,
  modal,
  setModal,
  sliderRef,
  isLogging,
  setIsLogging,
  getInitialState,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(
    useCallback(() => {
      GetStoreData('PARTICIPATE')
        .then(isParticipating => {
          if (isParticipating === 'true') {
            setIsLogging(true);
            willParticipate();
            showFullPanel({ toValue: 180, velocity: -0.8 });
            setTimeout(() => setIsAnimating(false), 2000);
          } else {
            setIsLogging(false);
            showFullPanel({ toValue: 330, velocity: -0.98 });
            setTimeout(() => setIsAnimating(false), 3000);
          }
        })
        .catch(error => console.log(error));
    }),
    [],
  );

  const willParticipate = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      LocationServices.start();
      BroadcastingServices.start();
      setIsLogging(true);
    });

    getInitialState();

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

  const setOptOut = () => {
    SetStoreData('PARTICIPATE', 'false').then(() => {
      LocationServices.stop();
      BroadcastingServices.stop();
      setIsLogging(false);
    });
  };

  const showFullPanel = (options = { toValue: null, velocity: null }) => {
    if (sliderRef && sliderRef.current) {
      sliderRef.current.show(options);
    }
  };

  const hideFullPanel = () => {
    if (sliderRef && sliderRef.current) {
      sliderRef.current.hide();
    }
  };

  const toggleLocation = isOn => {
    if (isOn) {
      willParticipate();
      hideFullPanel();
    } else {
      setOptOut();
      showFullPanel({ toValue: 350 });
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
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={() => setModal('blacklist')}>
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
                Blacklist
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
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={() => setModal('activity')}>
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
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderDragOval = () => {
    if (!isLogging) return null;
    return (
      <View style={styles.ovalWrapper}>
        <View style={styles.oval} />
      </View>
    );
  };

  if (isSearching || modal) return null;

  return (
    <SlidingUpPanel
      allowDragging={isLogging}
      ref={sliderRef}
      draggableRange={{
        top: isLogging ? 420 : 350,
        bottom: isAnimating ? 0 : 180,
      }}
      snappingPoints={[isLogging ? 420 : 350, 180]}
      showBackdrop={false}
      containerStyle={styles.panelContainer}
      minimumDistanceThreshold={10}
      friction={50}>
      <>
        <View style={styles.bottomDrawer}>
          {renderDragOval()}
          <View
            style={[
              { flexDirection: 'row', justifyContent: 'space-between' },
              isLogging ? null : styles.noOval,
            ]}>
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

const styles = StyleSheet.create({
  ovalWrapper: { alignItems: 'center', width: '100%', paddingBottom: 7 },
  oval: {
    width: 40,
    height: 7,
    backgroundColor: '#CAD2D3',
    borderRadius: 40,
  },
  noOval: {
    paddingTop: 10,
  },
  bottomDrawer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  helpDrawer: {
    marginTop: 20,
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

export default memo(BottomPanel);
