import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import backArrow from '../assets/images/backArrow.png';
import editIcon from '../assets/images/edit.png';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../constants/colors';
import { getHomeLocation, getWorkLocation } from '../services/LocationService';
import _ from 'lodash';

const BlacklistPlaces = () => {
  const [homeAddress, setHomeAddress] = useState(null);
  const [workAddress, setWorkAddress] = useState(null);
  const { navigate } = useNavigation();

  const backToMain = () => {
    navigate('LocationTrackingScreen', {});
  };

  const goToSearch = label => {
    navigate('SearchAddress', { label: label });
  };

  const getAddress = label => {
    if (label === 'Home') {
      return homeAddress;
    } else if (label === 'Work') {
      return workAddress;
    }
  };

  useFocusEffect(() => {
    getHomeLocation().then(location => {
      if (location && location !== 'null') {
        const parsedLocation = JSON.parse(location);
        setHomeAddress(_.get(parsedLocation, 'address', null));
      }
    });
    getWorkLocation().then(location => {
      if (location && location !== 'null') {
        const parsedLocation = JSON.parse(location);
        setWorkAddress(_.get(parsedLocation, 'address', null));
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backArrowTouchable}
          onPress={backToMain}>
          <Image style={styles.backArrow} source={backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Blacklist Locations</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={[{ key: 'Home' }, { key: 'Work' }]}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.item} numberOfLines={1} ellipsizeMode='tail'>
                {item.key}{' '}
                <Text style={styles.address}>{getAddress(item.key)}</Text>
              </Text>
              <TouchableOpacity
                style={styles.edit}
                onPress={() => goToSearch(item.key)}>
                <Image style={styles.backArrow} source={editIcon} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
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
  item: {
    flex: 11,
    paddingLeft: 30,
    paddingTop: 10,
    fontSize: 18,
    height: 44,
  },
  address: {
    flex: 11,
    paddingLeft: 30,
    paddingTop: 10,
    fontSize: 14,
    height: 44,
  },
  edit: {
    flex: 1,
    paddingTop: 12,
    fontSize: 18,
    height: 44,
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

export default BlacklistPlaces;
