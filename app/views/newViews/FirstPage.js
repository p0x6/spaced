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
    SetStoreData('PARTICIPATE', 'true').then(() =>
      this.props.navigation.navigate('LocationTrackingScreen', {}),
    );
  };

  willParticipate = () => {
    LocationServices.start(this.participationCallback);
    BroadcastingServices.start();
  };

  isPage = pageNum => this.state.page === pageNum;

  render() {
    const { page } = this.state;

    const texts = [
      [
        'Stop the spread of COVID-19',
        'See how populated public spaces are',
        'Safely meet basic needs that require travel.',
      ],
      [
        'You are in charge',
        'Your location data is shared only with your consent.',
        'You can blacklist your home and work addresses.',
      ],
      ['Sharing your location enables you to', 'see others around you.'],
    ];

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Logo />
          <CustomText
            containerStyle={styles.textContainer}
            textStyle={styles.text}
            textTitleStyle={styles.textTitle}
            hasTitle={!this.isPage(2) ? [0] : []}
            text={texts[page]}
          />
          <View styles={styles.buttonsContainer}>
            <Button2
              handlePress={
                !this.isPage(2)
                  ? this.nextPage
                  : this.willParticipate.bind(this)
              }
              text={
                this.isPage(0)
                  ? 'GET STARTED'
                  : !this.isPage(2)
                  ? 'NEXT'
                  : 'ENABLE LOCATION'
              }
              styled={buttonStyles}
            />
            {this.isPage(2) && (
              <Button2
                handlePress={() =>
                  this.props.navigation.navigate('LocationTrackingScreen', {})
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
    display: 'flex',
    height: '100%',
    width: width,
    padding: '3%',
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  textContainer: {
    height: '35%',
    paddingLeft: '10%',
  },
  buttonsContainer: {
    height: '20%',
  },
  text: {
    color: colors.DARK_COLOR,
    fontFamily: 'DMSans-Regular',
    lineHeight: 20,
    letterSpacing: 2,
    fontSize: 12,
  },
  textTitle: {
    ...this.text,
    fontSize: 18,
  },
});

const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const buttonStyles = {
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

const button2Styles = {
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
