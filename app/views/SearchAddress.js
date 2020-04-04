import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import React from 'react';
import colors from '../constants/colors';

const SearchAddress = ({
  isSearching,
  setIsSearching,
  onChangeDestination,
  isLogging,
}) => {
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
});

export default SearchAddress;
