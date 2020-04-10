import React, { memo, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../constants/colors';
import BlacklistPlacesPanel from '../components/BlacklistPlacesPanel';
import { SetStoreData, GetStoreData } from '../helpers/General';

const BlacklistPlaces = () => {
  const { navigate } = useNavigation();

  useEffect(() => {
    GetStoreData('BLACKLIST_ONBOARDED').then(isOnboarded => {
      if (isOnboarded === 'true') navigate('MainScreen', {});
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.blacklistPlacesPanelContainer}>
          <BlacklistPlacesPanel isOnboarding />
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.goHomeButton}
            onPress={() =>
              SetStoreData('BLACKLIST_ONBOARDED', true).then(() =>
                navigate('MainScreen', {}),
              )
            }>
            <Text style={styles.goHomeButtonText}>Not now, take me home</Text>
          </TouchableOpacity>
        </View>
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
  blacklistPlacesPanelContainer: {
    padding: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  goHomeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  goHomeButtonText: {
    color: colors.BLACK,
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
  },
});

export default memo(BlacklistPlaces);
