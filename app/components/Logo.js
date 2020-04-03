import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import colors from '../constants/colors';

class Logo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={[styles.lightColor, styles.logoFont]}>S</Text>
          <Text style={[styles.mediumColor, styles.logoFont]}>P</Text>
          <Text style={[styles.darkColor, styles.logoFont]}>A</Text>
          <Text style={[styles.darkColor, styles.logoFont]}>C</Text>
          <Text style={[styles.mediumColor, styles.logoFont]}>E</Text>
          <Text style={[styles.lightColor, styles.logoFont]}>D</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60%',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoFont: {
    fontWeight: 'bold',
    fontFamily: 'FrankRuhlLibre-Black',
    fontSize: 30,
    marginLeft: 5,
  },
  lightColor: {
    color: colors.LIGHT_COLOR,
  },
  mediumColor: {
    color: colors.MEDIUM_COLOR,
  },
  darkColor: {
    color: colors.DARK_COLOR,
  },
});

export default Logo;
