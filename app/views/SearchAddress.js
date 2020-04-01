import {
  Dimensions,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useState } from 'react';
import backArrow from '../assets/images/backArrow.png';
import languages from '../locales/languages';
import colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

import { setHomeLocation, setWorkLocation } from '../services/LocationService';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import _ from 'lodash';
import { PLACES_API_KEY } from 'react-native-dotenv';

import { EventRegister } from 'react-native-event-listeners';

const width = Dimensions.get('window').width;

const SearchAddress = ({ route }) => {
  const { navigate } = useNavigation();

  const backToPreviousPage = () => {
    navigate('BlacklistPlaces', {});
  };

  const setAddress = location => {
    if (_.get(route, 'params.label', '') === 'Home') {
      setHomeLocation(location);
      EventRegister.emit('setHomeLocation', location);
    } else if (_.get(route, 'params.label', '') === 'Work') {
      setWorkLocation(location);
      EventRegister.emit('setWorkLocation', location);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backArrowTouchable}
          onPress={backToPreviousPage}>
          <Image style={styles.backArrow} source={backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Address</Text>
      </View>
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
          if (
            _.get(details, 'geometry.location') &&
            _.get(data, 'description')
          ) {
            const address = {
              address: _.get(data, 'description'),
              coordinates: _.get(details, 'geometry.location'),
            };
            setAddress(address);
            backToPreviousPage();
          }
        }}
        // textInputProps={{
        //   onFocus: () => setIsSearching(true),
        // }}
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
              Keyboard.dismiss();
            }}>
            <Text>X</Text>
          </TouchableWithoutFeedback>
        )}
      />
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
  headerTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
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
});

export default SearchAddress;
