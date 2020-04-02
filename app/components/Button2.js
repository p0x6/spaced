import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

import colors from '../constants/colors';

class Button2 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { handlePress, text } = this.props;

    return (
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.PRIMARY_COLOR,
    width: '100%',
    height: '8%',
    textAlign: 'center',
  },
});

export default Button2;
