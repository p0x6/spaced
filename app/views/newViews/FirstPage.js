import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
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
      'Spaced is an app that assists in social',
      'distancing by being able to see',
      'hotspots in the city and to see how',
      'many people are where you want to go',
    ];

    const primaryTextArray2 = [
      'Sharing your location enables you to',
      'see others around you.',
    ];

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Logo logo={isFirstPage ? 'SPACED' : ''} />
          <CustomText
            containerStyle={styles.primaryTextContainer}
            textStyle={styles.primaryText}
            text={isFirstPage ? primaryTextArray1 : primaryTextArray2}
          />
          <View styles={styles.buttonsContainer}>
            <Button2
              handlePress={
                isFirstPage ? this.toggleFirstPage : this.toggleFirstPage
              }
              text={isFirstPage ? 'GET STARTED' : 'ENABLE LOCATION'}
              styled={buttonStyles}
            />

            {!isFirstPage && (
              <Button2
                handlePress={
                  isFirstPage ? this.toggleFirstPage : this.toggleFirstPage
                }
                text={'Not now, take me home'}
                styled={button2Styles}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    display: 'flex',
    margin: '3%',
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  primaryTextContainer: {
    height: '20%',
    paddingLeft: '10%',
  },
  buttonsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20%',
  },
  primaryText: {
    color: colors.DARK_COLOR,
    fontFamily: 'FrankRuhlLbre-Black',
    lineHeight: 20,
    letterSpacing: 2,
    fontSize: 12,
  },
});

const buttonStyles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.BLACK,
    height: 50,
    width: '100%',
    textAlign: 'center',
  },
  text: {
    color: colors.WHITE,
    fontFamily: 'FrankRuhlLibre-Black',
    letterSpacing: 3,
    fontSize: 10,
  },
};

const button2Styles = {
  button: {
    backgroundColor: colors.WHITE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: '100%',
    textAlign: 'center',
  },
  text: {
    color: colors.BLACK,
    fontFamily: 'FrankRuhlLibre-Black',
    fontWeight: 'bold',
    fontSize: 13,
  },
};

export default Welcome;
