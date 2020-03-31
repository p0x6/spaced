import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import colors from '../constants/colors';

const BlacklistPlaces = () => {
  const { navigate } = useNavigation();

  const backToMain = () => {
    navigate('LocationTrackingScreen', {});
  };

  const goToSearch = label => {
    navigate('SearchAddress', { label: label });
  };

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
              <Text style={styles.item}>{item.key}</Text>
              <TouchableOpacity
                style={styles.edit}
                onPress={() => goToSearch(item.key)}>
                <Image style={styles.backArrow} source={backArrow} />
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
