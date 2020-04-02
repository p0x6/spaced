import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import Logo from '../../components/Logo';
import CustomText from '../../components/CustomText';
import Button2 from '../../components/Button2';

import LocationServices from '../../services/LocationService';
import BroadcastingServices from '../../services/BroadcastingService';
import { SetStoreData } from '../../helpers/General';
import colors from '../../constants/colors';

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFirstPage: true,
    };
  }

  toggleFirstPage = () => {
    this.setState({
      isFirstPage: !this.state.isFirstPage,
    });
  };

  willParticipate = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      LocationServices.start();
      BroadcastingServices.start();
    });

    BackgroundGeolocation.checkStatus(({ authorization }) => {
      if (authorization === BackgroundGeolocation.AUTHORIZED) {
        this.setState({
          isLogging: true,
        });
      } else if (authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
        LocationServices.stop(this.props.navigation);
        BroadcastingServices.stop(this.props.navigation);
        this.setState({
          isLogging: true,
        });
      }
    });
  };

  render() {
    const { isFirstPage } = this.state;

    const primaryTextArray1 = [
      `let's flatten the`,
      'curve by sharing',
      'your location',
    ];

    const primaryTextArray2 = [
      'Sharing your location',
      'enables you to see',
      'others around you.',
    ];

    const secondaryTextArray = [
      'Get realtime location data of',
      'people around you. so you know',
      'when to do your groceries',
    ];

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Logo logo={isFirstPage ? 'logo' : ''} />
          <CustomText
            containerStyle={styles.primaryTextContainer}
            textStyle={styles.primaryText}
            text={isFirstPage ? primaryTextArray1 : primaryTextArray2}
          />
          <CustomText
            containerStyle={styles.secondaryTextContainer}
            textStyle={styles.secondaryText}
            text={isFirstPage ? secondaryTextArray : []}
          />
          <Button2
            handlePress={
              isFirstPage ? this.toggleFirstPage : this.willParticipate
            }
            text={isFirstPage ? 'Continue' : 'Enable location'}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    display: 'flex',
    padding: '10%',
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  primaryTextContainer: {
    height: '18%',
  },
  secondaryTextContainer: {
    height: '26%',
  },
  primaryText: {
    color: colors.PRIMARY_TEXT_COLOR,
    fontFamily: 'FrankRuhlLibre-Black',
    lineHeight: 26,
    letterSpacing: 2.3,
    fontWeight: 'bold',
    fontSize: 24,
  },
  secondaryText: {
    color: colors.SECONDARY_TEXT_COLOR,
    letterSpacing: 1,
    fontSize: 15,
  },
});

export default Welcome;
