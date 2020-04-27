import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import React, { useRef, useEffect, memo } from 'react';
import colors from '../constants/colors';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setMapLocation } from '../reducers/actions';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const SearchAddress = ({
  isSearching,
  setIsSearching,
  onChangeDestination,
  isLogging,
  textInputRef,
  modal,
  setModal,
  setMapLocation,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  const searchOpacity = opacity.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
  });

  const searchTranslationY = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const exitSearch = () => {
    if (textInputRef && textInputRef.current) {
      textInputRef.current.clear();
    }
    setIsSearching(false);
  };

  const renderCloseButton = () => {
    if (isSearching && isLogging) {
      return (
        <TouchableOpacity
          style={{
            alignSelf: 'center',
            padding: 4,
            marginLeft: 12,
            marginRight: 8,
          }}
          onPress={() => {
            exitSearch();
          }}>
          <Image
            source={require('../assets/images/blue_close.png')}
            style={{ width: 12, height: 12, resizeMode: 'cover' }}
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderAppInfoIcon = () => {
    if (modal || isSearching) return null;
    return (
      <TouchableOpacity onPress={() => setModal('info')} style={styles.appIcon}>
        <Image
          source={require('../assets/images/infoIcon.png')}
          style={{ width: 30, height: 30, resizeMode: 'cover' }}
        />
      </TouchableOpacity>
    );
  };

  const renderMyLocationIcon = () => {
    if (modal || isSearching) return null;
    return (
      <TouchableOpacity
        onPress={() => {
          BackgroundGeolocation.getCurrentLocation(location => {
            const { latitude, longitude } = location;
            setMapLocation([20.39, 36.56]);
            setMapLocation([longitude, latitude]);
          });
        }}
        style={styles.myLocation}>
        <Image
          source={require('../assets/images/myLocationIcon.png')}
          style={{ width: 30, height: 30, resizeMode: 'cover' }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        {
          opacity: searchOpacity,
          transform: [{ translateY: searchTranslationY }],
        },
        styles.container,
      ]}>
      <View style={styles.searchView}>
        {renderCloseButton()}
        <TextInput
          ref={textInputRef}
          style={[
            styles.searchInput,
            isSearching && isLogging ? null : { marginLeft: 16 },
          ]}
          editable={isLogging}
          autoCapitalize='none'
          blurOnSubmit
          placeholder={'Search location or zip code'}
          placeholderTextColor='#435d8b'
          onFocus={() => setIsSearching(true)}
          onChangeText={destination => {
            onChangeDestination(destination);
          }}
        />
      </View>
      <View style={styles.infoContainer}>
        {renderMyLocationIcon()}
        {renderAppInfoIcon()}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    flexDirection: 'column',
    color: colors.PRIMARY_TEXT,
    zIndex: 999,
    position: 'absolute',
    top: 0,
    width: '95%',
    borderRadius: 6,
    marginTop: 10,
  },
  searchView: {
    backgroundColor: '#fff',
    width: '95%',
    borderRadius: 6,
    marginTop: 32,
    marginLeft: 10,
    flexDirection: 'row',
    alignSelf: 'center',
    height: 48,
    shadowColor: '#435d8b',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 60,
  },
  searchInput: {
    flex: 1,
    alignSelf: 'center',
    marginRight: 16,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    fontWeight: '500',
  },
  // App Icon
  infoContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
  },
  appIcon: {
    color: colors.PRIMARY_TEXT,
    alignSelf: 'flex-end',
  },
  myLocation: {
    color: colors.PRIMARY_TEXT,
    alignSelf: 'flex-start',
    flex: 1,
    marginLeft: 10,
  },
});

const mapStateToProps = state => ({
  isLogging: state.isLogging,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ setMapLocation }, dispatch);

export default memo(
  connect(mapStateToProps, mapDispatchToProps)(SearchAddress),
);
