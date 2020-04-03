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
import { debounce } from "debounce";

import { setHomeLocation, setWorkLocation } from '../services/LocationService';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import _ from 'lodash';
import { PLACES_API_KEY } from 'react-native-dotenv';

import { EventRegister } from 'react-native-event-listeners';


const width = Dimensions.get('window').width;
var editText = "";
// const { navigate } = useNavigation();
// const backToPreviousPage = () => {
//   navigate('BlacklistPlaces', {});
// };

class SearchAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      destination: "",
      predictions: [],
    }
  }
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

  onChangeDestination = debounce(async destination => {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${PLACES_API_KEY}
    &input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      console.log("json=>>", json);

      this.setState({
        predictions: json.predictions
      });
    } catch (err) {
      AlertHelper.show("error", "Error", err);
    }
  }, 1000);

  _onRenderSearchItems = ({ item, index }) => {
    console.log("ITEM=>>", item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.box}
        onPress={() => {
          // this.refs.input.blur();
          this._onDestinationSelect(item);
        }}
        key={index}
      >
        <Text style={styles.locationTitle}
        >{item.structured_formatting.main_text}</Text>
        <Text style={styles.locationTitle}
        >{item.structured_formatting.secondary_text}</Text>

      </TouchableOpacity>
    );
  };

  _onDestinationSelect = item => {
    axios
      .get(
        "https://maps.googleapis.com/maps/api/place/details/json?key=" +
        PLACES_API_KEY +
        "&placeid=" +
        item.place_id
      )
      .then(responseJson => {
        console.log("responseJson =>>", responseJson);

        if (responseJson.data.status == "OK") {
          let locationData = {
            address: `${item.structured_formatting.main_text},${item.structured_formatting.secondary_text}`,
            latitude: responseJson.data.result.geometry.location.lat,
            longitude: responseJson.data.result.geometry.location.lng
          };
          // this._onSetLocationData(locationData);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backArrowTouchable}
            onPress={() => { this.props.navigation.navigate("LocationTrackingScreen", {}) }}
          >
            <Image style={styles.backArrow} source={backArrow} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Address</Text>
        </View>
        <TouchableOpacity
          style={styles.searchInput}>
          <TextInput
            autoCapitalize='none'
            blurOnSubmit
            autoFocus
            clearButtonMode="always"
            placeholder={"Search location or zip code"}
            placeholderTextColor='#454f63'
            onChangeText={destination => {
              this.setState({ destination });
              this.onChangeDestination(destination);
            }}
          />
        </TouchableOpacity>
        <FlatList
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ borderTopWidth: 0.5, borderTopColor: "#BDBDBD" }}
          data={this.state.predictions}
          renderItem={this._onRenderSearchItems}
        />
        {/* <GooglePlacesAutocomplete
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
          key: "Test",
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
      /> */}
      </SafeAreaView>
    );
  }
}
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

    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 20,
    width: "95%",
    borderRadius: 14,
    marginTop: 10,

  },
  locationTitle: {
    color: "#000000",
    fontSize: 15,
    fontFamily: 'OpenSans-Regular'
  },
  locationDetail: {
    color: "#000000",
    fontSize: 12,
    fontFamily: 'OpenSans-Regular'
  },
  box: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#BDBDBD",
    padding: 15
  },
});

export default SearchAddress;
