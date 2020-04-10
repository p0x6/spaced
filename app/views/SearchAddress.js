import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import React, { useRef, useEffect } from 'react';
import colors from '../constants/colors';

const SearchAddress = ({
  isSearching,
  setIsSearching,
  onChangeDestination,
  isLogging,
  textInputRef,
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
          placeholderTextColor='#454f63'
          onFocus={() => setIsSearching(true)}
          onChangeText={destination => {
            onChangeDestination(destination);
          }}
        />
      </View>
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
    borderRadius: 6,
    marginTop: 10,
    shadowColor: '#B0C6E2',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 60,
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
  },
  searchInput: {
    flex: 1,
    alignSelf: 'center',
    marginRight: 16,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
  },
});

export default SearchAddress;
