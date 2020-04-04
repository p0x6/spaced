import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../constants/colors';

class CustomText extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { text, containerStyle, hasTitle } = this.props;

    return (
      <View style={containerStyle}>
        {text.map((t, i) =>
          hasTitle.includes(i) ? (
            <Text key={`primary-${i}`} style={styles.textTitle}>
              {t}
            </Text>
          ) : (
            <Text key={`primary-${i}`} style={styles.text}>
              {t}
            </Text>
          ),
        )}
      </View>
    );
  }
}

const text = {
  color: colors.DARK_COLOR,
  fontFamily: 'FrankRuhlLibre-Black',
  lineHeight: 20,
  letterSpacing: 2,
  fontSize: 12,
};
const styles = StyleSheet.create({
  text,
  textTitle: {
    ...text,
    paddingTop: 6,
    fontSize: 16,
  },
});

export default CustomText;
