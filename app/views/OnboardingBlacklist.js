import React, { memo } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setBlacklistOnboardingStatus } from '../reducers/actions';

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

const BlacklistPlaces = ({
  blacklistOnboardingStatus,
  setBlacklistOnboardingStatus,
}) => {
  const { navigate } = useNavigation();

  if (blacklistOnboardingStatus) navigate('MainScreen', {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.blacklistPlacesPanelContainer}>
          <BlacklistPlacesPanel isOnboarding />
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.goHomeButton}
            onPress={() => {
              setBlacklistOnboardingStatus(true);
              navigate('MainScreen', {});
            }}>
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

const mapStateToProps = state => ({
  blacklistOnboardingStatus: state.blacklistOnboardingStatus,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setBlacklistOnboardingStatus,
    },
    dispatch,
  );

export default memo(
  connect(mapStateToProps, mapDispatchToProps)(BlacklistPlaces),
);
