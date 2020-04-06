import React, { Component } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, View } from 'react-native';

import Logo from '../../components/Logo';
import CustomText from '../../components/CustomText';
import Button2 from '../../components/Button2';

import LocationServices from '../../services/LocationService';
import BroadcastingServices from '../../services/BroadcastingService';
import { SetStoreData } from '../../helpers/General';
import colors from '../../constants/colors';

const width = Dimensions.get('window').width;

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
    };
    this.participationCallback = this.participationCallback.bind(this);
  }

  nextPage = () => {
    this.setState({
      page: this.state.page + 1,
    });
  };

  participationCallback = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      console.log('saved participate');
      this.props.navigation.navigate('BlacklistPlaces', {});
    });
  };

  willParticipate = () => {
    LocationServices.start(this.participationCallback);
    BroadcastingServices.start();
  };

  isPage = pageNum => this.state.page === pageNum;

  render() {
    const { page } = this.state;
    const textOptions = [
      {
        text: [
          'Stop the spread of COVID-19',
          'See how populated public spaces are',
          'Safely meet basic needs that require travel.',
        ],
        titleIndex: [0],
      },
      {
        text: [
          'You are in charge',
          'Your location data is shared only with your consent.',
          'You can blacklist your home and work addresses.',
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
      2: 'ENABLE LOCATION',
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
                !this.isPage(2)
                  ? this.nextPage
                  : this.willParticipate.bind(this)
              }
              text={buttonTitles[page] || buttonTitles.default}
              styled={blackButtonStyles}
            />
            {this.isPage(2) && (
              <Button2
                handlePress={() =>
                  this.props.navigation.navigate('MainScreen', {})
                }
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
    display: 'flex',
    height: '100%',
    width: width,
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
    fontFamily: 'DMSans-Regular',
    lineHeight: 20,
    letterSpacing: 2,
    fontSize: 12,
  },
  title: {
    color: colors.DARK_COLOR,
    fontFamily: 'FrankRuhlLibre-Black',
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
    fontFamily: 'DMSans-Regular',
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
    fontFamily: 'DMSans-Regular',
    fontWeight: 'bold',
    fontSize: 13,
  },
};

export default Welcome;
