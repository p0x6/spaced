import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
} from 'react-native';
import React, { useRef, useEffect } from 'react';
import colors from '../constants/colors';

const SearchAddress = ({
  isSearching,
  setIsSearching,
  onChangeDestination,
  isLogging,
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

  return (
    <Animated.View
      style={[
        {
          opacity: searchOpacity,
          transform: [{ translateY: searchTranslationY }],
        },
        styles.container,
      ]}>
      {renderCloseButton()}
      <TextInput
        editable={isLogging}
        style={isLogging ? styles.searchInput : styles.greyedOutSearchInput}
        autoCapitalize='none'
        blurOnSubmit
        clearButtonMode='always'
        placeholder={'Search location or zip code'}
        placeholderTextColor='#454f63'
        onFocus={() => setIsSearching(true)}
        onChangeText={destination => {
          onChangeDestination(destination);
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    flexDirection: 'row',
    color: colors.PRIMARY_TEXT,
    zIndex: 999,
    position: 'absolute',
    top: 0,
    width: '95%',
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#B0C6E2',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  searchInput: {
    flex: 4,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 15,
    width: '95%',
    borderRadius: 14,
    marginTop: 32,
    marginLeft: 10
  },
  searchView: {
    backgroundColor: '#fff',
    padding: 15,
    width: '95%',
    borderRadius: 14,
    marginTop: 32,
    marginLeft: 10,
    flexDirection: "row"
  },
  greyedOutSearchInput: {
    width: '95%',
    backgroundColor: '#CAD2D3',
    flex: 4,
    alignSelf: 'center',
    padding: 20,
    borderRadius: 14,
    marginTop: 10,
  },
});
