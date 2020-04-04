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
      page: 0,
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
        this.props.navigation.navigate('LocationTrackingScreen', {});
      } else if (authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
        LocationServices.stop(this.props.navigation);
        BroadcastingServices.stop(this.props.navigation);
      }
    });
  };

  isPage = pageNum => this.state.page === pageNum;

  render() {
    const { page } = this.state;

    const textOptions = [
      {
        text: [
          'Spaced is an app that assists in social',
          'distancing by being able to see',
          'hotspots in the city and to see how',
          'many people are where you want to go',
        ],
        titleIndex: [],
      },
      {
        text: [
          'Less than 100KB',
          `Private Kit's trail generator logs your device's location in under 100KB of space - less space than a single picture`,
          'You are in charge',
          'Your location data is shared only with your consent. You can blacklist your home and work addresses.',
        ],
        titleIndex: [0, 2],
      },
      {
        text: [
          'The Future',
          `The Next Step in Solving Today's and Tomorrow's Probems Enabling individuals to log their location trail offers new opportunities for researches studying pandemic tracking, refugee migration and community traffic analysis.`,
          'Learn More http://privatekit.mit.edu',
        ],
        titleIndex: [0],
      },
      {
        text: [
          'Sharing your location enables you to',
          'see others around you.',
        ],
        titleIndex: [],
      },
    ];

    const buttonTitles = {
      0: 'GET STARTED',
      3: 'ENABLE LOCATION',
      default: 'NEXT',
    };

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Logo />
          </View>
          <View style={styles.textContainer}>
            <CustomText styled={textStyles} textOptions={textOptions[page]} />
          </View>
          <View>
            <Button2
              handlePress={
                !this.isPage(3) ? this.nextPage : this.willParticipate
              }
              text={buttonTitles[page] || buttonTitles.default}
              styled={blackButtonStyles}
            />
            {this.isPage(3) && (
              <Button2
                handlePress={this.toggleFirstPage}
                text={'Not now, take me home'}
                styled={whiteButtonStyles}
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
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50%',
  },
  textContainer: {
    height: '40%',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    marginLeft: '5%',
  },
});

const textStyles = {
  text: {
    color: colors.DARK_COLOR,
    fontFamily: 'FrankRuhlLbre-Black',
    lineHeight: 20,
    letterSpacing: 2,
    fontSize: 12,
  },
  title: {
    color: colors.DARK_COLOR,
    fontFamily: 'FrankRuhlLbre-Black',
    lineHeight: 20,
    letterSpacing: 2,
    fontSize: 18,
    paddingBottom: 5,
    paddingTop: 5,
  },
};

const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const blackButtonStyles = {
  button: {
    ...flexCenter,
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

const whiteButtonStyles = {
  button: {
    ...flexCenter,
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
