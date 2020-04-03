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
      page: 3,
    };
  }

  nextPage = () => {
    this.setState({
      page: this.state.page + 1,
    });
  };

  willParticipate = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      LocationServices.start();
      BroadcastingServices.start();
    });

    BackgroundGeolocation.checkStatus(({ authorization }) => {
      if (authorization === BackgroundGeolocation.AUTHORIZED) {
        console.log('autorizado');
      } else if (authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
        LocationServices.stop();
        BroadcastingServices.stop();
        console.log('no autorizado');
      }
    });
  };

  isPage = pageNum => this.state.page === pageNum;

  render() {
    const { page } = this.state;

    const texts = [
      [
        'Spaced is an app that assists in social',
        'distancing by being able to see',
        'hotspots in the city and to see how',
        'many people are where you want to go',
      ],
      [
        'Less than 100KB',
        `Private Kit's trail generator logs your device's location in under 100KB of space - less space than a single picture`,
        'You are in charge',
        'Your location data is shared only with your consent. You can blacklist your home and work addresses.',
      ],
      [
        'The Future',
        `The Next Step in Solving Today's and Tomorrow's Probems Enabling individuals to log their location trail offers new opportunities for researches studying pandemic tracking, refugee migration and community traffic analysis.`,
        'Learn More http://privatekit.mit.edu',
      ],
      ['Sharing your location enables you to', 'see others around you.'],
    ];

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Logo />
          <CustomText
            containerStyle={styles.primaryTextContainer}
            textStyle={styles.primaryText}
            text={texts[page]}
          />
          <View styles={styles.buttonsContainer}>
            <Button2
              handlePress={
                !this.isPage(3)
                  ? this.nextPage
                  : this.props.navigation.navigate('LocationTrackingScreen', {})
              }
              text={
                this.isPage(0)
                  ? 'GET STARTED'
                  : !this.isPage(3)
                  ? 'NEXT'
                  : 'ENABLE LOCATION'
              }
              styled={buttonStyles}
            />
            {this.isPage(3) && (
              <Button2
                handlePress={this.toggleFirstPage}
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
    padding: '3%',
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  primaryTextContainer: {
    height: '35%',
    paddingLeft: '10%',
  },
  buttonsContainer: {
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
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
