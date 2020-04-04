import {
  Dimensions,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  TextInput,
  FlatList,
} from 'react-native';
import React, { useState, Component } from 'react';
import backArrow from '../assets/images/backArrow.png';
import languages from '../locales/languages';
import colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

import { setHomeLocation, setWorkLocation } from '../services/LocationService';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import _ from 'lodash';
import { PLACES_API_KEY } from 'react-native-dotenv';

import { EventRegister } from 'react-native-event-listeners';
const axios = require('axios');
const testIcons = require('../assets/images/edit.png');

const SearchAddress = ({
  isSearching,
  setIsSearching,
  onChangeDestination,
  isLogging,
}) => {
  // const setAddress = location => {
  //   if (_.get(route, 'params.label', '') === 'Home') {
  //     setHomeLocation(location);
  //     EventRegister.emit('setHomeLocation', location);
  //   } else if (_.get(route, 'params.label', '') === 'Work') {
  //     setWorkLocation(location);
  //     EventRegister.emit('setWorkLocation', location);
  //   }
  // };

  // backToPreviousPage = () => {
  //   this.props.navigation.navigation('BlacklistPlaces', {});
  // };

  const renderCloseButton = () => {
    if (isSearching && isLogging) {
      return (
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setIsSearching(false)}>
          <View>
            <Text>X</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
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
    </View>
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
    padding: 20,
    width: '95%',
    borderRadius: 14,
    marginTop: 10,
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
  locationTitle: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
  },
  locationDetail: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
  },
  box: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#BDBDBD',
    padding: 15,
  },
});

export default SearchAddress;
