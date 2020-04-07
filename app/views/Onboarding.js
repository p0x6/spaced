import React, { useState, memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import Logo from '../components/Logo';
import CustomText from '../components/CustomText';
import Button2 from '../components/Button2';

import LocationServices, {
  getHomeLocation,
  getWorkLocation,
} from '../services/LocationService';
import { useNavigation } from '@react-navigation/native';
import BroadcastingServices from '../services/BroadcastingService';
import { SetStoreData } from '../helpers/General';
import colors from '../constants/colors';

const width = Dimensions.get('window').width;

const Onboarding = () => {
  const [page, setPage] = useState(0);
  const { navigate } = useNavigation();

  const participationCallback = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      console.log('saved participate');
      getHomeLocation().then(location => {
        const parsedLocation = JSON.parse(location);
        if (parsedLocation.address) {
          console.log('HAS HOME LOCATION', location);
          navigate('MainScreen', {});
        } else {
          getWorkLocation().then(location => {
            const parsedLocation = JSON.parse(location);
            if (parsedLocation.address) {
              console.log('HAS WORK LOCATION', location);
              navigate('MainScreen', {});
            } else {
              console.log('NO HOME OR WORK LOCATIONS', location);
              navigate('OnboardingBlacklist', {});
            }
          });
        }
      });
    });
  };

  const willParticipate = () => {
    LocationServices.start(participationCallback);
    BroadcastingServices.start();
  };

  const isPage = pageNum => page === pageNum;

  const nextPage = () => {
    setPage(page + 1);
  };

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
      text: ['Sharing your location enables you to', 'see others around you.'],
      titleIndex: [],
    },
  ];

  const buttonTitles = {
    0: 'GET STARTED',
    2: 'ENABLE LOCATION',
    default: 'NEXT',
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <View style={styles.textContainer}>
        <CustomText styled={textStyles} textOptions={textOptions[page]} />
      </View>
      <View>
        <Button2
          handlePress={!isPage(2) ? nextPage : willParticipate}
          text={buttonTitles[page] || buttonTitles.default}
          styled={blackButtonStyles}
        />
        {isPage(2) && (
          <Button2
            handlePress={() => navigate('MainScreen', {})}
            text={'Not now, take me home'}
            styled={whiteButtonStyles}
          />
        )}
      </View>
    </View>
  );
};

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
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    height: '60%',
    marginLeft: '5%',
  },
  textContainer: {
    height: '30%',
    display: 'flex',
    justifyContent: 'center',
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
    fontFamily: 'DMSans-Bold',
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

export default memo(Onboarding);
