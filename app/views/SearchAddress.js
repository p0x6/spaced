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
  TextInput,
  FlatList,
} from 'react-native';
import React, { useState, Component } from 'react';
import backArrow from '../assets/images/backArrow.png';
import languages from '../locales/languages';
import colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'debounce';

import { setHomeLocation, setWorkLocation } from '../services/LocationService';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import _ from 'lodash';
import { PLACES_API_KEY } from 'react-native-dotenv';

import { EventRegister } from 'react-native-event-listeners';
const axios = require('axios');

const SearchAddress = props => {
  const [destination, setDestination] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [coordinates, setCoordinates] = useState({
    latitude: props.latitude,
    longitude: props.longitude,
  });

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

  const onChangeDestination = debounce(async destination => {
    if (destination && destination.length > 3) {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${PLACES_API_KEY}
    &input=${destination}&location=${coordinates.latitude},${coordinates.longitude}&radius=2000`;
      try {
        const result = await fetch(apiUrl);
        const json = await result.json();
        console.log('json=>>', json);

        setPredictions(predictions);
      } catch (err) {
        AlertHelper.show('error', 'Error', err);
      }
    }
  }, 1000);

  const onRenderSearchItems = ({ item, index }) => {
    console.log('ITEM=>>', item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.box}
        onPress={() => {
          // this.refs.input.blur();
          onDestinationSelect(item);
        }}
        key={index}>
        <Text style={styles.locationTitle}>
          {item.structured_formatting.main_text}
        </Text>
        <Text style={styles.locationTitle}>
          {item.structured_formatting.secondary_text}
        </Text>
      </TouchableOpacity>
    );
  };

  const onDestinationSelect = item => {
    axios
      .get(
        'https://maps.googleapis.com/maps/api/place/details/json?key=' +
          PLACES_API_KEY +
          '&placeid=' +
          item.place_id,
      )
      .then(responseJson => {
        console.log('responseJson =>>', responseJson);

        if (responseJson.data.status == 'OK') {
          let locationData = {
            address: `${item.structured_formatting.main_text},${item.structured_formatting.secondary_text}`,
            latitude: responseJson.data.result.geometry.location.lat,
            longitude: responseJson.data.result.geometry.location.lng,
          };
          // this._onSetLocationData(locationData);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.searchInput}>
        <TextInput
          autoCapitalize='none'
          blurOnSubmit
          autoFocus
          clearButtonMode='always'
          placeholder={'Search location or zip code'}
          placeholderTextColor='#454f63'
          onChangeText={destination => {
            setDestination(destination);
            onChangeDestination(destination);
          }}
        />
      </TouchableOpacity>
      <FlatList
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        style={{ borderTopWidth: 0.5, borderTopColor: '#BDBDBD' }}
        data={predictions}
        renderItem={onRenderSearchItems}
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
    height: 50,
    paddingTop: 18,
    paddingLeft: 20,
  },
  backArrow: {
    height: 18,
    width: 18.48,
  },
  searchInput: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 20,
    width: '95%',
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
