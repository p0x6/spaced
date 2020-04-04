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



export default class SearchAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  renderCloseButton = () => {

    // if (isSearching && isLogging) {
    return (
      <View >

      </View>
    );
    // }
    // return null;
  };
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

  render() {
    return (
      <View style={styles.container} >

        <View style={styles.searchView}>
          {this.props.isSearching && this.props.isLogging ? <TouchableOpacity
            onPress={() => {
              this.props.setIsSearching(false);
              this.clearText.clear();
            }}>
            <View>
              <Text>X</Text>
            </View>
          </TouchableOpacity> : null}
          {/* {this.renderCloseButton()} */}
          <TextInput
            ref={ref => {
              this.clearText = ref;
            }}
            editable={this.props.isLogging}
            // style={this.props.isLogging ? styles.searchInput : styles.greyedOutSearchInput}
            style={{ paddingLeft: 10 }}
            autoCapitalize='none'
            blurOnSubmit
            clearButtonMode='never'
            placeholder={'Search location or zip code'}
            placeholderTextColor='#454f63'
            onFocus={() => this.props.setIsSearching(true)}
            onChangeText={destination => {
              this.props.onChangeDestination(destination)
            }}
          />
        </View>
      </View >
    );
  }
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
