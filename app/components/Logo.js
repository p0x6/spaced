import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import colors from '../constants/colors';

const LOGO_TEXT = 'SPACED';
class Logo extends Component {
  constructor(props) {
    super(props);
  }

  renderCharacter(index) {
    const opacity = (12 - index) / 12;
    const marginRight = 1 * Math.pow(2, index);
    console.log(index, opacity);

    return (
      <Text style={[styles.logoFont, { opacity, marginRight }]}>
        {LOGO_TEXT.charAt(index)}
      </Text>
    );
  }

  render() {
    return (
      <View style={styles.logoContainer}>
        {LOGO_TEXT.split('').map((ch, idx) => {
          return this.renderCharacter(idx);
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoFont: {
    color: '#546c98',
    fontWeight: 'bold',
    fontFamily: 'DMSans-Regular',
    fontSize: 30,
  },
});

export default Logo;
